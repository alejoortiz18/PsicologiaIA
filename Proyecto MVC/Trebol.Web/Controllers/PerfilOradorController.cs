using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.PerfilOrador;
using Trebol.Web.Helpers;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class PerfilOradorController(
    ISalaRepository salaRepo,
    IProfesionalRepository profesionalRepo,
    IDirectorioRepository directorioRepo,
    ICalendarioRepository calendarioRepo,
    ICitaRepository citaRepo) : Controller
{
    private static readonly JsonSerializerOptions JsonCamel = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public Task<IActionResult> Index(int id, bool vistaPublica = false)
        => MostrarAsync(id, "cuenta", vistaPublica, async vm =>
        {
            vm.Estudios = await profesionalRepo.ObtenerEstudiosAsync(id, HttpContext.RequestAborted);
            PerfilOradorPresentacion.EnriquecerTabCuenta(vm, User.IsInRole("Usuario"));
            return View("Index", vm);
        });

    public Task<IActionResult> Salas(int id, bool vistaPublica = false)
        => MostrarAsync(id, "salas", vistaPublica, async vm =>
        {
            vm.Salas = await salaRepo.ObtenerPorProfesionalAsync(id, HttpContext.RequestAborted);
            var participante = InscripcionParticipante.From(User);
            if (participante.UsuarioId is int uid)
            {
                vm.SalasEventos = await salaRepo.ObtenerEventosPorProfesionalParticipanteAsync(
                    id, uid, null, HttpContext.RequestAborted);
            }
            else if (participante.ProfesionalInscriptorId is int pid)
            {
                vm.SalasEventos = await salaRepo.ObtenerEventosPorProfesionalParticipanteAsync(
                    id, null, pid, HttpContext.RequestAborted);
            }

            if (vm.SalasEventos.Count == 0 && vm.Salas.Count > 0
                && (vistaPublica
                    || participante.UsuarioId.HasValue
                    || participante.ProfesionalInscriptorId.HasValue))
            {
                vm.SalasEventos = MapearSalasComoEventosPublicos(vm);
            }

            return View("Salas", vm);
        });

    public Task<IActionResult> Comentarios(int id, bool vistaPublica = false)
        => MostrarAsync(id, "comentarios", vistaPublica, async vm =>
        {
            var uid = UsuarioActualId();
            vm.Comentarios = await profesionalRepo.ObtenerComentariosPublicosAsync(id, uid, HttpContext.RequestAborted);
            vm.ResumenComentarios = await profesionalRepo.ObtenerResumenComentariosAsync(id, HttpContext.RequestAborted);
            vm.PuedeComentar = User.IsInRole("Usuario");
            return View("Comentarios", vm);
        });

    public Task<IActionResult> Calendario(int id, bool vistaPublica = false)
        => MostrarAsync(id, "calendario", vistaPublica, async vm =>
        {
            vm.Disponibilidad = await calendarioRepo.ObtenerDisponibilidadAsync(id, HttpContext.RequestAborted);
            vm.Bloqueos = await calendarioRepo.ObtenerBloqueosAsync(id, HttpContext.RequestAborted);
            var desde = DateTime.Today.AddMonths(-1);
            var hasta = DateTime.Today.AddMonths(3);
            int? viewerUsuarioId = UsuarioActualId();
            int? viewerProfesionalId = User.IsInRole("Profesional")
                ? int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)
                : null;
            var esAgendaPropietario = viewerProfesionalId == id;
            var slots = esAgendaPropietario
                ? CalendarioSlotPresentacion.Formatear(
                    await citaRepo.ObtenerSlotsCalendarioPropietarioAsync(
                        id, desde, hasta, HttpContext.RequestAborted),
                    CalendarioSlotPresentacion.ModoVista.Propietario)
                : CalendarioSlotPresentacion.Formatear(
                    await citaRepo.ObtenerSlotsCalendarioPublicoAsync(
                        id, desde, hasta, viewerUsuarioId, viewerProfesionalId, HttpContext.RequestAborted),
                    CalendarioSlotPresentacion.ModoVista.Publico);
            ViewBag.EsVistaPropietario = esAgendaPropietario;
            ViewBag.CitasSlotsJson = JsonSerializer.Serialize(slots, JsonCamel);
            ViewBag.BloqueosJson = JsonSerializer.Serialize(
                vm.Bloqueos.Select(b => new { inicio = b.FechaHoraInicio, fin = b.FechaHoraFin }), JsonCamel);
            ViewBag.DisponibilidadJson = JsonSerializer.Serialize(
                vm.Disponibilidad.Where(h => h.Estado).Select(h => new
                {
                    dia = h.DiaSemana,
                    inicio = h.HoraInicio.ToString("HH:mm"),
                    fin = h.HoraFin.ToString("HH:mm")
                }), JsonCamel);
            ViewBag.UsuarioActualId = viewerUsuarioId;
            ViewBag.MiProfesionalId = viewerProfesionalId;
            return View("Calendario", vm);
        });

    [Authorize(Roles = "Usuario")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> PublicarComentario(int id, byte puntuacion, string contenido)
    {
        var profesional = await profesionalRepo.ObtenerPorIdAsync(id, HttpContext.RequestAborted);
        if (profesional is null
            || !string.Equals(profesional.Estado, "ACTIVO", StringComparison.OrdinalIgnoreCase))
            return NotFound();

        var dto = new CrearComentarioPerfilDto
        {
            ProfesionalId = id,
            UsuarioId     = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!),
            Puntuacion    = puntuacion,
            Contenido     = contenido?.Trim() ?? ""
        };

        var resultado = await profesionalRepo.CrearComentarioPublicoAsync(dto, HttpContext.RequestAborted);
        TempData[resultado.Exito ? "Mensaje" : "Error"] = resultado.Mensaje;
        return RedirectToAction(nameof(Comentarios), new { id });
    }

    [Authorize(Roles = "Profesional")]
    public async Task<IActionResult> MisSalas()
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var salas         = await salaRepo.ObtenerPorProfesionalAsync(profesionalId);
        return View(salas);
    }

    private async Task<IActionResult> MostrarAsync(
        int id, string tab, bool vistaPublica, Func<PerfilOradorPublicoVm, Task<IActionResult>> render)
    {
        int? miProfesionalId = null;
        if (User.IsInRole("Profesional"))
        {
            miProfesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            if (id == miProfesionalId && !vistaPublica)
                return RedirectToAction("Index", "PerfilProfesional");
        }

        var vm = await ConstruirVmAsync(id, tab);
        if (vm is null) return NotFound();

        vm.ModoVistaPublica = vistaPublica;
        vm.EsVistaPreviaPropia = vistaPublica && miProfesionalId == id;

        ViewData["EsPerfilPublico"] = true;
        ViewData["Title"]           = vm.EsVistaPreviaPropia ? "Vista previa del perfil público" : "Perfil del orador";
        return await render(vm);
    }

    private async Task<PerfilOradorPublicoVm?> ConstruirVmAsync(int id, string tab)
    {
        var profesional = await profesionalRepo.ObtenerPorIdAsync(id, HttpContext.RequestAborted);
        if (profesional is null
            || !string.Equals(profesional.Estado, "ACTIVO", StringComparison.OrdinalIgnoreCase))
            return null;

        var perfil  = await profesionalRepo.ObtenerDtoAsync(id, HttpContext.RequestAborted);
        if (perfil is null) return null;

        var resumen = await profesionalRepo.ObtenerResumenPerfilAsync(id, HttpContext.RequestAborted);
        var uid     = UsuarioActualId();

        var esSeguido = false;
        if (User.IsInRole("Usuario") && uid.HasValue)
            esSeguido = await directorioRepo.EsSeguidorAsync(uid.Value, id, HttpContext.RequestAborted);

        return new PerfilOradorPublicoVm
        {
            TabActivo       = tab,
            Perfil          = perfil,
            Resumen         = resumen,
            EsSeguido       = esSeguido,
            PuedeSeguir     = User.IsInRole("Usuario"),
            SubtituloPerfil = PerfilOradorPresentacion.ConstruirSubtitulo(perfil),
            UsuarioActualId = uid
        };
    }

    private int? UsuarioActualId()
        => User.IsInRole("Usuario")
            ? int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)
            : null;

    private static List<Trebol.Model.DTOs.Publico.EventoPublicoDto> MapearSalasComoEventosPublicos(PerfilOradorPublicoVm vm)
        => vm.Salas.Select(s => new Trebol.Model.DTOs.Publico.EventoPublicoDto
        {
            SalaId            = s.SalaId,
            ProfesionalId     = s.ProfesionalId,
            Titulo            = s.Titulo,
            NombreProfesional = vm.Perfil.NombreCompleto,
            Categoria         = s.Categoria,
            Estado            = s.Estado.ToString(),
            Capacidad         = s.Capacidad,
            TotalInscritos    = s.TotalInscritos,
            Precio            = s.Precio,
            FechaInicio       = s.FechaInicio
        }).ToList();
}

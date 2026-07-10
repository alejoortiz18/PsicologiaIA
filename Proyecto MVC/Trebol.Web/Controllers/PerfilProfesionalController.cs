using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Domain.Interfaces.Catalogos;
using Trebol.Model.DTOs.Common;
using Trebol.Model.DTOs.Profesional;
using Trebol.Model.Entities.TrebolEntities;
using Trebol.Model.Enums;
using Trebol.Web.Helpers;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Profesional")]
public class PerfilProfesionalController(
    IProfesionalRepository profesionalRepo,
    ISalaRepository salaRepo,
    ICitaRepository citaRepo,
    ICalendarioRepository calendarioRepo,
    ICatalogoRepository catalogoRepo,
    Trebol.Helpers.Archivos.IArchivoHelper archivoHelper) : Controller
{
    private const int TamanoPagina = 10;

    private static readonly JsonSerializerOptions JsonCamel = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task<IActionResult> Index()
    {
        var id = ProfesionalId();
        await CargarShellAsync(id, "personal");
        var prof = await profesionalRepo.ObtenerPorIdAsync(id);
        await CargarDatosIndexAsync(id, prof?.PaisId);
        return View(prof);
    }

    public async Task<IActionResult> Salas(string? buscar, string? estado, int pagina = 1)
    {
        var id = ProfesionalId();
        await CargarShellAsync(id, "salas");
        var todas = await salaRepo.ObtenerPorProfesionalAsync(id);
        var filtradas = FiltrarSalas(todas, buscar, estado);
        var paginacion = Paginar(filtradas.Count, pagina);
        ViewBag.Profesional = await profesionalRepo.ObtenerPorIdAsync(id);
        ViewBag.Resumen = await profesionalRepo.ObtenerResumenPerfilAsync(id);
        ViewBag.Paginacion = paginacion;
        ViewBag.Buscar = buscar;
        ViewBag.EstadoFiltro = estado;
        return View(filtradas.Skip((paginacion.PaginaActual - 1) * TamanoPagina).Take(TamanoPagina));
    }

    public async Task<IActionResult> Calendario()
    {
        var id = ProfesionalId();
        await CargarShellAsync(id, "calendario");
        ViewBag.Profesional = await profesionalRepo.ObtenerPorIdAsync(id);
        var bloqueos = await calendarioRepo.ObtenerBloqueosAsync(id);
        ViewBag.Bloqueos = bloqueos;
        var desde = DateTime.Today.AddMonths(-1);
        var hasta = DateTime.Today.AddMonths(3);
        var slots = CalendarioSlotPresentacion.Formatear(
            await citaRepo.ObtenerSlotsCalendarioPropietarioAsync(id, desde, hasta, HttpContext.RequestAborted),
            CalendarioSlotPresentacion.ModoVista.Propietario);
        ViewBag.CitasSlotsJson = JsonSerializer.Serialize(slots, JsonCamel);
        ViewBag.BloqueosJson = JsonSerializer.Serialize(
            bloqueos.Select(b => new { inicio = b.FechaHoraInicio, fin = b.FechaHoraFin }), JsonCamel);
        var disponibilidad = await calendarioRepo.ObtenerDisponibilidadAsync(id);
        ViewBag.DisponibilidadJson = JsonSerializer.Serialize(
            disponibilidad.Where(h => h.Estado).Select(h => new
            {
                dia = h.DiaSemana,
                inicio = h.HoraInicio.ToString("HH:mm"),
                fin = h.HoraFin.ToString("HH:mm")
            }), JsonCamel);
        ViewBag.EsVistaPropietario = true;
        return View(disponibilidad);
    }

    public async Task<IActionResult> Citas(string estado = "Todos", string? buscar = null, string vista = "proximas", int pagina = 1)
    {
        var id = ProfesionalId();
        await CargarShellAsync(id, "citas");
        ViewBag.Profesional = await profesionalRepo.ObtenerPorIdAsync(id);
        ViewBag.Resumen = await profesionalRepo.ObtenerResumenPerfilAsync(id);
        ViewBag.EstadoFiltro = estado;
        ViewBag.Buscar = buscar;
        ViewBag.Vista = vista;

        var todas = await citaRepo.ObtenerPorProfesionalAsync(id, estado, 1, 500);
        var filtradas = FiltrarCitas(todas, buscar, vista);
        var paginacion = Paginar(filtradas.Count, pagina);
        ViewBag.Paginacion = paginacion;
        return View(filtradas.Skip((paginacion.PaginaActual - 1) * TamanoPagina).Take(TamanoPagina));
    }

    public async Task<IActionResult> Indicadores()
    {
        var id = ProfesionalId();
        await CargarShellAsync(id, "indicadores");
        var prof = await profesionalRepo.ObtenerPorIdAsync(id);
        ViewBag.Profesional = prof;
        ViewBag.Resumen = await profesionalRepo.ObtenerResumenPerfilAsync(id);
        ViewBag.Dashboard = await profesionalRepo.ObtenerDashboardAsync(id);
        return View(prof);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Actualizar(ActualizarProfesionalDto dto, IFormFile? foto)
    {
        dto.ProfesionalId = ProfesionalId();

        if (!ModelState.IsValid)
        {
            await CargarShellAsync(dto.ProfesionalId, "personal");
            await CargarDatosIndexAsync(dto.ProfesionalId, dto.PaisId);
            return View("Index", await profesionalRepo.ObtenerPorIdAsync(dto.ProfesionalId));
        }

        if (foto is not null && foto.Length > 0)
        {
            try
            {
                dto.FotoUrl = await archivoHelper.GuardarFotoPerfilAsync(foto, "profesionales", dto.ProfesionalId);
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("foto", ex.Message);
                await CargarShellAsync(dto.ProfesionalId, "personal");
                await CargarDatosIndexAsync(dto.ProfesionalId, dto.PaisId);
                return View("Index", await profesionalRepo.ObtenerPorIdAsync(dto.ProfesionalId));
            }
        }

        var resultado = await profesionalRepo.ActualizarAsync(dto);
        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            await CargarShellAsync(dto.ProfesionalId, "personal");
            await CargarDatosIndexAsync(dto.ProfesionalId, dto.PaisId);
            return View("Index", await profesionalRepo.ObtenerPorIdAsync(dto.ProfesionalId));
        }

        TempData["Mensaje"] = PerfilConstant.PerfilActualizado;
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CrearEstudio([FromBody] GuardarEstudioDto dto)
    {
        if (!ModelState.IsValid)
            return Json(new { exito = false, mensaje = ModelState.Values.SelectMany(v => v.Errors).FirstOrDefault()?.ErrorMessage ?? "Datos inválidos." });

        var resultado = await profesionalRepo.CrearEstudioAsync(ProfesionalId(), dto);
        return Json(new
        {
            exito = resultado.Exito,
            mensaje = resultado.Exito ? PerfilConstant.EstudioGuardado : resultado.Mensaje,
            estudioId = resultado.Datos
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ActualizarEstudio([FromBody] GuardarEstudioDto dto)
    {
        if (!ModelState.IsValid)
            return Json(new { exito = false, mensaje = ModelState.Values.SelectMany(v => v.Errors).FirstOrDefault()?.ErrorMessage ?? "Datos inválidos." });

        var resultado = await profesionalRepo.ActualizarEstudioAsync(ProfesionalId(), dto);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Exito ? PerfilConstant.EstudioGuardado : resultado.Mensaje });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EliminarEstudio(int estudioId)
    {
        var resultado = await profesionalRepo.EliminarEstudioAsync(ProfesionalId(), estudioId);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Exito ? PerfilConstant.EstudioEliminado : resultado.Mensaje });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> GuardarIdioma([FromBody] GuardarIdiomaProfesionalDto dto)
    {
        if (!ModelState.IsValid)
            return Json(new { exito = false, mensaje = ModelState.Values.SelectMany(v => v.Errors).FirstOrDefault()?.ErrorMessage ?? "Datos inválidos." });

        var resultado = await profesionalRepo.GuardarIdiomaAsync(ProfesionalId(), dto);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Exito ? PerfilConstant.IdiomaGuardado : resultado.Mensaje });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EliminarIdioma(int idiomaId)
    {
        var resultado = await profesionalRepo.EliminarIdiomaAsync(ProfesionalId(), idiomaId);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Exito ? PerfilConstant.IdiomaEliminado : resultado.Mensaje });
    }

    [HttpGet]
    public async Task<IActionResult> CiudadesPorPais(int paisId)
    {
        var ciudades = await catalogoRepo.ObtenerCiudadesAsync(paisId);
        return Json(ciudades.Select(c => new { c.CiudadId, c.Nombre }));
    }

    private int ProfesionalId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private async Task CargarShellAsync(int id, string tab)
    {
        ViewBag.TabActiva = tab;
        var resumen = await profesionalRepo.ObtenerResumenPerfilAsync(id);
        ViewBag.Resumen = resumen;
        ViewBag.TotalSeguidores = resumen.TotalSeguidores;
        ViewBag.TotalSalas = resumen.TotalSalas;
        ViewBag.CitasProximas = resumen.CitasProximas;
    }

    private async Task CargarDatosIndexAsync(int profesionalId, int? paisId)
    {
        ViewBag.Paises = await catalogoRepo.ObtenerPaisesAsync();
        ViewBag.Ciudades = await catalogoRepo.ObtenerCiudadesAsync(paisId);
        ViewBag.Estudios = await profesionalRepo.ObtenerEstudiosAsync(profesionalId);
        ViewBag.Especialidades = await profesionalRepo.ObtenerEspecialidadesAsync(profesionalId);
        ViewBag.IdiomasPerfil = await profesionalRepo.ObtenerIdiomasPerfilAsync(profesionalId);
        ViewBag.IdiomasCatalogo = await catalogoRepo.ObtenerIdiomasAsync();
    }

    private static PaginacionVm Paginar(int total, int pagina)
    {
        var totalPaginas = total == 0 ? 1 : (int)Math.Ceiling(total / (double)TamanoPagina);
        return new PaginacionVm
        {
            PaginaActual = Math.Clamp(pagina, 1, totalPaginas),
            TamanoPagina = TamanoPagina,
            TotalRegistros = total
        };
    }

    private static List<Trebol.Model.DTOs.Sala.SalaDto> FiltrarSalas(
        IReadOnlyList<Trebol.Model.DTOs.Sala.SalaDto> salas, string? buscar, string? estado)
    {
        var q = salas.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(buscar))
            q = q.Where(s => s.Titulo.Contains(buscar, StringComparison.OrdinalIgnoreCase)
                          || (s.Descripcion?.Contains(buscar, StringComparison.OrdinalIgnoreCase) ?? false));
        if (!string.IsNullOrWhiteSpace(estado))
        {
            q = estado.ToLowerInvariant() switch
            {
                "abierta" => q.Where(s => s.Estado == EstadoSala.Abierta),
                "cerrada" => q.Where(s => s.Estado == EstadoSala.Cerrada),
                "proxima" => q.Where(s => s.FechaInicio.HasValue && s.FechaInicio > DateTime.Now),
                _ => q
            };
        }
        return q.OrderByDescending(s => s.FechaInicio).ToList();
    }

    private static List<Trebol.Model.DTOs.Cita.CitaListaDto> FiltrarCitas(
        IReadOnlyList<Trebol.Model.DTOs.Cita.CitaListaDto> citas, string? buscar, string vista)
    {
        var q = citas.AsEnumerable();
        if (vista == "proximas")
            q = q.Where(c => c.FechaHora >= DateTime.Now && c.Estado is EstadoCita.Programada or EstadoCita.Movida);
        else
            q = q.Where(c => c.FechaHora < DateTime.Now || c.Estado is EstadoCita.Finalizada or EstadoCita.Cancelada);

        if (!string.IsNullOrWhiteSpace(buscar))
            q = q.Where(c => (c.AliasUsuario ?? "").Contains(buscar, StringComparison.OrdinalIgnoreCase));

        return q.OrderByDescending(c => c.FechaHora).ToList();
    }
}

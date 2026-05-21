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

    public async Task<IActionResult> Index()
    {
        var id = ProfesionalId();
        await CargarShellAsync(id, "personal");
        var prof = await profesionalRepo.ObtenerPorIdAsync(id);
        ViewBag.Paises = await catalogoRepo.ObtenerPaisesAsync();
        ViewBag.Ciudades = await catalogoRepo.ObtenerCiudadesAsync(prof?.PaisId);
        ViewBag.Estudios = await profesionalRepo.ObtenerEstudiosAsync(id);
        ViewBag.Especialidades = await profesionalRepo.ObtenerEspecialidadesAsync(id);
        ViewBag.Idiomas = await profesionalRepo.ObtenerIdiomasAsync(id);
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
        ViewBag.Bloqueos = await calendarioRepo.ObtenerBloqueosAsync(id);
        var citas = await citaRepo.ObtenerPorProfesionalAsync(id, "Todos", 1, 500);
        ViewBag.CitasCalendario = citas;
        ViewBag.BloqueosJson = JsonSerializer.Serialize(
            (await calendarioRepo.ObtenerBloqueosAsync(id))
            .Select(b => new { inicio = b.FechaHoraInicio.ToString("yyyy-MM-dd"), fin = b.FechaHoraFin.ToString("yyyy-MM-dd") }));
        ViewBag.CitasJson = JsonSerializer.Serialize(
            citas.Select(c => c.FechaHora.ToString("yyyy-MM-dd")).Distinct());
        var disponibilidad = await calendarioRepo.ObtenerDisponibilidadAsync(id);
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
            ViewBag.Paises = await catalogoRepo.ObtenerPaisesAsync();
            ViewBag.Ciudades = await catalogoRepo.ObtenerCiudadesAsync(dto.PaisId);
            ViewBag.Estudios = await profesionalRepo.ObtenerEstudiosAsync(dto.ProfesionalId);
            ViewBag.Especialidades = await profesionalRepo.ObtenerEspecialidadesAsync(dto.ProfesionalId);
            ViewBag.Idiomas = await profesionalRepo.ObtenerIdiomasAsync(dto.ProfesionalId);
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
                return View("Index", await profesionalRepo.ObtenerPorIdAsync(dto.ProfesionalId));
            }
        }

        var resultado = await profesionalRepo.ActualizarAsync(dto);
        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            await CargarShellAsync(dto.ProfesionalId, "personal");
            return View("Index", await profesionalRepo.ObtenerPorIdAsync(dto.ProfesionalId));
        }

        TempData["Mensaje"] = PerfilConstant.PerfilActualizado;
        return RedirectToAction(nameof(Index));
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

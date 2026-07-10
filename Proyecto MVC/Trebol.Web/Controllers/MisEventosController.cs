using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Dashboard;
using Trebol.Model.DTOs.Publico;
using Trebol.Model.DTOs.Sala;
using Trebol.Model.Enums;
using Trebol.Web.Helpers;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class MisEventosController(
    ISalaRepository salaRepo,
    IProfesionalRepository profesionalRepo) : Controller
{
    public async Task<IActionResult> Index()
    {
        var id   = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var tipo = User.FindFirstValue(ClaimTypes.Role)!;

        if (tipo == "Profesional")
        {
            await salaRepo.CerrarSalasEventosVencidosAsync(id, HttpContext.RequestAborted);
            var salas = (await salaRepo.ObtenerPorProfesionalAsync(id, HttpContext.RequestAborted)).ToList();
            var dash  = await profesionalRepo.ObtenerDashboardAsync(id);
            var eventosHoy = salas
                .Where(s => s.FechaInicio.HasValue && s.FechaInicio.Value.Date == DateTime.Today)
                .OrderByDescending(s => s.Estado == EstadoSala.Abierta)
                .ThenBy(s => s.FechaInicio)
                .ToList();

            var vmProfesional = new MisEventosProfesionalVm
            {
                Salas           = salas,
                EventosHoy      = eventosHoy,
                TotalSalas      = salas.Count,
                SalasAbiertas   = salas.Count(s => SalaVigenciaHelper.EstadoEfectivo(s) == EstadoSala.Abierta),
                TotalInscritos  = salas.Sum(s => s.TotalInscritos),
                IngresosMes     = dash.IngresosMes,
                EventoHoy       = eventosHoy.FirstOrDefault()
            };

            return View("IndexProfesional", vmProfesional);
        }

        var vigentes = await salaRepo.ObtenerInscritosUsuarioAsync(id, HttpContext.RequestAborted);
        var cerrados = await salaRepo.ObtenerInscritosCerradosUsuarioAsync(id, HttpContext.RequestAborted);

        var vmUsuario = new MisEventosUsuarioVm
        {
            EventosVigentes = FiltrarInscritosAbiertos(vigentes),
            EventosCerrados = FiltrarInscritosFinalizados(cerrados)
        };
        return View("IndexInscritos", vmUsuario);
    }

    private static IReadOnlyList<EventoPublicoDto> FiltrarInscritosAbiertos(IEnumerable<EventoPublicoDto> eventos)
        => eventos
            .Where(e => !EventoIngresoHelper.EventoFinalizado(e.FechaInicio, e.FechaFin, e.Estado))
            .ToList();

    private static IReadOnlyList<EventoPublicoDto> FiltrarInscritosFinalizados(IEnumerable<EventoPublicoDto> eventos)
        => eventos
            .Where(e => EventoIngresoHelper.EventoFinalizado(e.FechaInicio, e.FechaFin, e.Estado))
            .ToList();
}

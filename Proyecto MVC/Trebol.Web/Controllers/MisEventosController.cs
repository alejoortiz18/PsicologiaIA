using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;
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

            var vm = new MisEventosProfesionalVm
            {
                Salas           = salas,
                EventosHoy      = eventosHoy,
                TotalSalas      = salas.Count,
                SalasAbiertas   = salas.Count(s => SalaVigenciaHelper.EstadoEfectivo(s) == EstadoSala.Abierta),
                TotalInscritos  = salas.Sum(s => s.TotalInscritos),
                IngresosMes     = dash.IngresosMes,
                EventoHoy       = eventosHoy.FirstOrDefault()
            };

            return View("IndexProfesional", vm);
        }

        var inscritos = await salaRepo.ObtenerInscritosUsuarioAsync(id);
        var salasUsuario = inscritos.Select(e => new SalaDto
        {
            SalaId         = e.SalaId,
            Titulo         = e.Titulo,
            Tipo           = TipoSala.Publica,
            Estado         = Enum.TryParse<EstadoSala>(e.Estado, true, out var est) ? est : EstadoSala.Abierta,
            Capacidad      = e.Capacidad,
            FechaInicio    = e.FechaInicio,
            TotalInscritos = e.TotalInscritos,
            Categoria      = e.Categoria
        }).ToList();

        return View(salasUsuario);
    }
}

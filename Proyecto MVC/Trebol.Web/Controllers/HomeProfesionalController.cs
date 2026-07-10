using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Dashboard;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Profesional")]
public class HomeProfesionalController(
    IProfesionalRepository profesionalRepo,
    ICitaRepository citaRepo,
    ISalaRepository salaRepo) : Controller
{
    public async Task<IActionResult> Index(CancellationToken ct)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var dashboard     = await profesionalRepo.ObtenerDashboardAsync(profesionalId, ct);
        dashboard.CitasHoyLista = (await citaRepo.ObtenerHoyPorProfesionalAsync(profesionalId, ct)).ToList();
        dashboard.Salas = (await salaRepo.ObtenerActivasHoyPorProfesionalAsync(profesionalId, ct)).ToList();
        dashboard.EventosColegas = (await salaRepo.ObtenerEventosColegasAsync(profesionalId, ct: ct)).ToList();

        var primeraCita = dashboard.CitasHoyLista.FirstOrDefault();
        if (primeraCita != null)
        {
            dashboard.ProximaCita = new CitaResumenDto
            {
                CitaId = primeraCita.CitaId,
                Nombre = primeraCita.AliasUsuario,
                FechaHora = primeraCita.FechaHora
            };
        }

        return View(dashboard);
    }
}

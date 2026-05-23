using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Dashboard;
using Trebol.Web.Helpers;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class EventosController(ISalaRepository salaRepo) : Controller
{
    private int EntidadId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /Eventos
    [Authorize(Roles = "Usuario")]
    public async Task<IActionResult> Index(CancellationToken ct)
    {
        var vm = new EventosUsuarioViewModel
        {
            Inscritos     = await salaRepo.ObtenerInscritosUsuarioAsync(EntidadId, ct),
            EstaSemana    = await salaRepo.ObtenerSemanaUsuarioAsync(EntidadId, ct),
            TodosVigentes = await salaRepo.ObtenerTodosVigentesAsync(EntidadId, ct)
        };
        return View(vm);
    }

    // GET /Eventos/Detalle/5 — modal en home (usuario y profesional)
    [Authorize(Roles = "Usuario,Profesional")]
    public async Task<IActionResult> Detalle(int id, CancellationToken ct)
    {
        var p = InscripcionParticipante.From(User);
        var detalle = await salaRepo.ObtenerDetalleInscripcionAsync(id, p.UsuarioId, p.ProfesionalInscriptorId, ct);
        if (detalle is null)
            return NotFound(new { mensaje = "Evento no encontrado o no disponible." });
        return Json(detalle);
    }
}

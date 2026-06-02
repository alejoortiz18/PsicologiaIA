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
    // GET /Eventos
    public async Task<IActionResult> Index(CancellationToken ct)
    {
        var p = InscripcionParticipante.From(User);
        var vm = new EventosUsuarioViewModel();

        if (p.UsuarioId is int uid)
        {
            vm.Inscritos     = await salaRepo.ObtenerInscritosUsuarioAsync(uid, ct);
            vm.EstaSemana    = await salaRepo.ObtenerSemanaUsuarioAsync(uid, ct);
            vm.TodosVigentes = await salaRepo.ObtenerTodosVigentesAsync(uid, ct);
        }
        else if (p.ProfesionalInscriptorId is int pid)
        {
            vm.Inscritos     = await salaRepo.ObtenerInscritosProfesionalAsync(pid, ct);
            vm.EstaSemana    = [];
            vm.TodosVigentes = [];
        }

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

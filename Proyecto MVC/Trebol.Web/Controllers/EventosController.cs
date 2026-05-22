using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Dashboard;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario")]
public class EventosController(ISalaRepository salaRepo) : Controller
{
    private int UsuarioId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /Eventos
    public async Task<IActionResult> Index(CancellationToken ct)
    {
        var vm = new EventosUsuarioViewModel
        {
            Inscritos     = await salaRepo.ObtenerInscritosUsuarioAsync(UsuarioId, ct),
            EstaSemana    = await salaRepo.ObtenerSemanaUsuarioAsync(UsuarioId, ct),
            TodosVigentes = await salaRepo.ObtenerTodosVigentesAsync(UsuarioId, ct)
        };
        return View(vm);
    }

    // GET /Eventos/Detalle/5
    public async Task<IActionResult> Detalle(int id, CancellationToken ct)
    {
        var detalle = await salaRepo.ObtenerDetalleUsuarioAsync(id, UsuarioId, ct);
        if (detalle is null)
            return NotFound(new { mensaje = "Evento no encontrado o no disponible." });
        return Json(detalle);
    }
}

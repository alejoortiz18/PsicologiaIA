using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;
using Trebol.Model.Entities.TrebolEntities;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Profesional")]
public class CalendarioController(ICalendarioRepository calendarioRepo) : Controller
{
    public async Task<IActionResult> Index()
    {
        var profesionalId  = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var disponibilidad = await calendarioRepo.ObtenerDisponibilidadAsync(profesionalId);
        var bloqueos       = await calendarioRepo.ObtenerBloqueosAsync(profesionalId);
        ViewBag.Bloqueos   = bloqueos;
        return View(disponibilidad);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> GuardarDisponibilidad([FromBody] List<HorarioDisponible> horarios)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado     = await calendarioRepo.GuardarDisponibilidadAsync(profesionalId, horarios);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Bloquear(DateTime inicio, DateTime fin, string? motivo)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado     = await calendarioRepo.BloquearHorarioAsync(profesionalId, inicio, fin, motivo);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Desbloquear(int bloqueoId)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado     = await calendarioRepo.DesbloquearHorarioAsync(bloqueoId, profesionalId);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }
}

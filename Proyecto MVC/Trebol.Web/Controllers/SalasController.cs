using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Sala;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Profesional")]
public class SalasController(ISalaRepository salaRepo) : Controller
{
    public async Task<IActionResult> Index()
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var salas         = await salaRepo.ObtenerPorProfesionalAsync(profesionalId);
        return View(salas);
    }

    [HttpGet]
    public IActionResult Nueva() => View(new CrearSalaDto());

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Nueva(CrearSalaDto dto)
    {
        if (!ModelState.IsValid) return View(dto);
        dto.ProfesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado     = await salaRepo.CrearAsync(dto);
        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            return View(dto);
        }
        TempData["Mensaje"] = SalaConstant.SalaCreada;
        return RedirectToAction("Index");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Cerrar(int salaId)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await salaRepo.CerrarAsync(salaId, profesionalId);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    [HttpGet]
    public async Task<IActionResult> Detalle(int id)
    {
        var sala = await salaRepo.ObtenerDetalleAsync(id);
        if (sala is null) return NotFound();
        return View(sala);
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario")]
public class InscripcionController(
    IInscripcionRepository inscripcionRepo,
    IPagoRepository        pagoRepo) : Controller
{
    // POST /Inscripcion/Inscribir
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Inscribir(int salaId)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await inscripcionRepo.InscribirAsync(usuarioId, salaId);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    // POST /Inscripcion/PagarInscripcion
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> PagarInscripcion(int inscripcionId, string metodoPago)
    {
        var resultado = await pagoRepo.PagarInscripcionAsync(inscripcionId, metodoPago);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }
}

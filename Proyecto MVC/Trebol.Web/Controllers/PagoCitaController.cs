using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario")]
public class PagoCitaController(IPagoRepository pagoRepo) : Controller
{
    // GET /PagoCita?citaId=3
    [HttpGet]
    public IActionResult Index(int citaId)
    {
        ViewBag.CitaId = citaId;
        return View();
    }

    // POST /PagoCita/Procesar
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Procesar(int citaId, string metodoPago)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await pagoRepo.PagarCitaAsync(citaId, usuarioId, metodoPago);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }
}

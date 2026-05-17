using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class MensajeriaController(IMensajeriaRepository mensajeriaRepo) : Controller
{
    public async Task<IActionResult> Index()
    {
        var (id, tipo) = ObtenerIdentidad();
        var conversaciones = await mensajeriaRepo.ObtenerConversacionesAsync(id, tipo);
        return View(conversaciones);
    }

    // GET /Mensajeria/Conversacion?conversacionId=5
    public async Task<IActionResult> Conversacion(int conversacionId)
    {
        var (id, _) = ObtenerIdentidad();
        var mensajes = await mensajeriaRepo.ObtenerMensajesAsync(conversacionId);
        await mensajeriaRepo.MarcarLeidosAsync(conversacionId, id);
        return View(mensajes);
    }

    // POST /Mensajeria/Enviar
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Enviar(int destinoId, string tipoDestino, string texto, int conversacionId = 0)
    {
        var (id, tipo) = ObtenerIdentidad();
        var resultado  = await mensajeriaRepo.EnviarMensajeAsync(id, tipo, destinoId, tipoDestino, texto);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    private (int id, string tipo) ObtenerIdentidad()
    {
        var id   = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var tipo = User.FindFirstValue(ClaimTypes.Role)!;
        return (id, tipo);
    }
}

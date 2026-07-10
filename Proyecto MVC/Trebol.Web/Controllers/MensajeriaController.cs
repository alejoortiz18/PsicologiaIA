using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Mensajeria;
using Trebol.Web.Hubs;
using Trebol.Web.Models.Mensajeria;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class MensajeriaController(
    IMensajeriaRepository mensajeriaRepo,
    IHubContext<ChatHub> chatHub) : Controller
{
    public async Task<IActionResult> Index(int? conversacionId)
    {
        var (id, tipo) = ObtenerIdentidad();
        var conversaciones = (await mensajeriaRepo.ObtenerConversacionesAsync(id, tipo)).ToList();

        if (!conversacionId.HasValue && conversaciones.Count > 0)
            return RedirectToAction(nameof(Index), new { conversacionId = conversaciones[0].ConversacionId });

        ConversacionDto? activa = null;
        IReadOnlyList<MensajePrivadoDto> mensajes = [];
        var destinoId = 0;
        var tipoDestino = string.Empty;

        if (conversacionId is > 0)
        {
            activa = conversaciones.FirstOrDefault(c => c.ConversacionId == conversacionId.Value);
            if (activa is null)
                return NotFound();

            var destino = await mensajeriaRepo.ObtenerDestinoConversacionAsync(conversacionId.Value, id, tipo);
            if (destino is null)
                return NotFound();

            destinoId   = destino.Value.destinoId;
            tipoDestino = destino.Value.tipoDestino;
            mensajes    = (await mensajeriaRepo.ObtenerMensajesAsync(conversacionId.Value)).ToList();
            await mensajeriaRepo.MarcarLeidosAsync(conversacionId.Value, id, tipo);
        }

        var vm = new MensajeriaIndexVm
        {
            Conversaciones       = conversaciones,
            ConversacionActivaId = conversacionId,
            ConversacionActiva   = activa,
            Mensajes             = mensajes,
            DestinoId            = destinoId,
            TipoDestino          = tipoDestino,
            MiId                 = id,
            MiTipo               = tipo,
            MiNombre             = User.FindFirstValue(ClaimTypes.Name) ?? "Yo"
        };

        ViewData["FullBleed"] = true;
        return View(vm);
    }

    public Task<IActionResult> Conversacion(int conversacionId) =>
        Task.FromResult<IActionResult>(RedirectToAction(nameof(Index), new { conversacionId }));

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Enviar(int destinoId, string tipoDestino, string texto, int conversacionId = 0)
    {
        var (id, tipo) = ObtenerIdentidad();

        if (conversacionId > 0)
        {
            var destino = await mensajeriaRepo.ObtenerDestinoConversacionAsync(conversacionId, id, tipo);
            if (destino is null)
                return Json(new { exito = false, mensaje = "Conversación no encontrada." });
            destinoId   = destino.Value.destinoId;
            tipoDestino = destino.Value.tipoDestino;
        }

        if (destinoId <= 0 || string.IsNullOrWhiteSpace(tipoDestino))
            return Json(new { exito = false, mensaje = "Destinatario no válido." });

        var resultado = await mensajeriaRepo.EnviarMensajeAsync(id, tipo, destinoId, tipoDestino, texto);
        if (!resultado.Exito || resultado.Datos is null)
            return Json(new { exito = false, mensaje = resultado.Mensaje });

        var convId = conversacionId > 0 ? conversacionId : resultado.Datos.ConversacionId;
        var msg    = await mensajeriaRepo.ObtenerMensajePorIdAsync(resultado.Datos.MensajeId);
        if (msg is not null)
        {
            var payload = ToPayload(msg);
            // Tiempo real al receptor: grupo de usuario (siempre al conectar), sin depender de UnirseConversacion
            await chatHub.Clients
                .Group(ChatHub.GrupoUsuario(tipoDestino, destinoId))
                .SendAsync("RecibirMensaje", payload);

            await chatHub.Clients
                .Group(ChatHub.GrupoUsuario(tipoDestino, destinoId))
                .SendAsync("NotificacionMensaje", new
                {
                    conversacionId = convId,
                    emisorNombre   = User.FindFirstValue(ClaimTypes.Name) ?? "Usuario",
                    mensaje        = payload
                });
        }

        return Json(new
        {
            exito          = true,
            mensaje        = resultado.Mensaje,
            conversacionId = convId,
            mensajeChat    = msg is null ? null : ToPayload(msg)
        });
    }

    private static object ToPayload(Trebol.Model.DTOs.Mensajeria.MensajePrivadoDto msg) => new
    {
        mensajeId      = msg.MensajeId,
        conversacionId = msg.ConversacionId,
        emisorId       = msg.EmisorId,
        emisorTipo     = msg.EmisorTipo,
        contenido      = msg.Contenido,
        fechaEnvio     = msg.FechaEnvio.ToString("o"),
        leido          = msg.Leido
    };

    private (int id, string tipo) ObtenerIdentidad()
    {
        var id   = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var tipo = User.IsInRole("Profesional") ? "Profesional" : "Usuario";
        return (id, tipo);
    }
}

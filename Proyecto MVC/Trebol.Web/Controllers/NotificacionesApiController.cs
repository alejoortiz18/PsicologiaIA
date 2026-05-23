using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
[Route("api/notificaciones")]
[IgnoreAntiforgeryToken]
public class NotificacionesApiController(IMensajeriaRepository mensajeriaRepo) : Controller
{
    [HttpGet("resumen")]
    public async Task<IActionResult> Resumen(CancellationToken ct)
    {
        var (entidadId, tipoEntidad) = ObtenerIdentidad();
        var conversaciones = await mensajeriaRepo.ObtenerConversacionesAsync(entidadId, tipoEntidad, ct);

        var msg = conversaciones
            .Where(c => c.MensajesNoLeidos > 0)
            .OrderByDescending(c => c.UltimaFecha)
            .Take(15)
            .Select(c => new
            {
                id = c.ConversacionId,
                tab = "msg",
                unread = true,
                ico = "💬",
                bg = "#E3F2FD",
                col = "#1565C0",
                title = c.OtroNombre,
                sub = string.IsNullOrWhiteSpace(c.UltimoMensaje) ? "Sin mensajes" : c.UltimoMensaje,
                time = FormatearTiempo(c.UltimaFecha),
                url = $"/Mensajeria?conversacionId={c.ConversacionId}"
            })
            .ToList();

        return Json(new { msg, sys = Array.Empty<object>() });
    }

    [HttpPost("marcar-leida/{conversacionId:int}")]
    public async Task<IActionResult> MarcarLeida(int conversacionId, CancellationToken ct)
    {
        var (entidadId, tipoEntidad) = ObtenerIdentidad();
        await mensajeriaRepo.MarcarLeidosAsync(conversacionId, entidadId, tipoEntidad, ct);
        return Ok();
    }

    [HttpPost("marcar-todas-leidas")]
    public async Task<IActionResult> MarcarTodasLeidas(CancellationToken ct)
    {
        var (entidadId, tipoEntidad) = ObtenerIdentidad();
        var conversaciones = await mensajeriaRepo.ObtenerConversacionesAsync(entidadId, tipoEntidad, ct);
        foreach (var c in conversaciones.Where(x => x.MensajesNoLeidos > 0))
            await mensajeriaRepo.MarcarLeidosAsync(c.ConversacionId, entidadId, tipoEntidad, ct);
        return Ok();
    }

    private (int Id, string Tipo) ObtenerIdentidad()
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var tipo = User.IsInRole("Profesional") ? "Profesional" : "Usuario";
        return (id, tipo);
    }

    private static string FormatearTiempo(DateTime? fecha)
    {
        if (fecha is null) return "";
        var diff = DateTime.Now - fecha.Value;
        if (diff.TotalMinutes < 1) return "ahora";
        if (diff.TotalHours < 1) return $"hace {(int)diff.TotalMinutes} min";
        if (diff.TotalDays < 1) return $"hace {(int)diff.TotalHours} h";
        if (diff.TotalDays < 7) return $"hace {(int)diff.TotalDays} día{(diff.TotalDays >= 2 ? "s" : "")}";
        return fecha.Value.ToString("d MMM");
    }
}

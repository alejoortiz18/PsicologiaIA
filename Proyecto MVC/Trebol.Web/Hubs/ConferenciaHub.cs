using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Trebol.Domain.Interfaces;

namespace Trebol.Web.Hubs;

[Authorize(Roles = "Usuario,Profesional")]
public class ConferenciaHub(ISalaRepository salaRepo) : Hub
{
    public static string GrupoSala(int salaId) => $"sala-{salaId}";

    public async Task UnirseSala(int salaId)
    {
        if (!await PuedeAccederSalaAsync(salaId))
            throw new HubException("No tienes acceso a esta sala.");

        await Groups.AddToGroupAsync(Context.ConnectionId, GrupoSala(salaId));
    }

    public async Task EnviarMensaje(int salaId, string contenido)
    {
        contenido = (contenido ?? string.Empty).Trim();
        if (contenido.Length == 0 || contenido.Length > 500)
            throw new HubException("El mensaje debe tener entre 1 y 500 caracteres.");

        if (!await PuedeAccederSalaAsync(salaId))
            throw new HubException("No tienes acceso a esta sala.");

        if (!await salaRepo.ChatHabilitadoAsync(salaId, Context.ConnectionAborted))
            throw new HubException("El chat grupal no está habilitado.");

        var emisor = await ObtenerEmisorParticipanteAsync(salaId);
        if (!emisor.Ok)
            throw new HubException("Solo los asistentes inscritos pueden enviar mensajes.");

        await Clients.Group(GrupoSala(salaId)).SendAsync("MensajeConferencia", new
        {
            alias     = emisor.Alias,
            contenido,
            enviadoEn = DateTime.UtcNow
        });
    }

    private async Task<(bool Ok, string Alias)> ObtenerEmisorParticipanteAsync(int salaId)
    {
        var user = Context.User!;
        var id   = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (user.IsInRole("Profesional"))
        {
            if (await salaRepo.ObtenerConferenciaProfesionalAsync(salaId, id, Context.ConnectionAborted) is not null)
                return (false, string.Empty);

            var inscripto = await salaRepo.ObtenerConferenciaAsistenteAsync(
                salaId, null, id, Context.ConnectionAborted);
            return inscripto is null
                ? (false, string.Empty)
                : (true, inscripto.AliasParticipante);
        }

        var asistente = await salaRepo.ObtenerConferenciaAsistenteAsync(
            salaId, id, null, Context.ConnectionAborted);
        return asistente is null
            ? (false, string.Empty)
            : (true, asistente.AliasParticipante);
    }

    private async Task<bool> PuedeAccederSalaAsync(int salaId)
    {
        var user = Context.User!;
        var id   = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (user.IsInRole("Profesional"))
        {
            if (await salaRepo.ObtenerConferenciaProfesionalAsync(salaId, id, Context.ConnectionAborted) is not null)
                return true;

            return await salaRepo.ObtenerConferenciaAsistenteAsync(
                salaId, null, id, Context.ConnectionAborted) is not null;
        }

        return await salaRepo.ObtenerConferenciaAsistenteAsync(
            salaId, id, null, Context.ConnectionAborted) is not null;
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Trebol.Domain.Interfaces;

namespace Trebol.Web.Hubs;

[Authorize(Roles = "Usuario,Profesional")]
public class CitaSalaHub(ICitaRepository citaRepo) : Hub
{
    public static string GrupoCita(int citaId) => $"cita-{citaId}";

    public async Task UnirseCita(int citaId)
    {
        if (!await PuedeAccederCitaAsync(citaId))
            throw new HubException("No tienes acceso a esta cita.");

        await Groups.AddToGroupAsync(Context.ConnectionId, GrupoCita(citaId));
    }

    public async Task EnviarMensaje(int citaId, string contenido)
    {
        if (!await PuedeAccederCitaAsync(citaId))
            throw new HubException("No tienes acceso a esta cita.");

        var user = Context.User!;
        var id   = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var tipo = user.IsInRole("Profesional") ? "Profesional" : "Usuario";

        var alias = await citaRepo.ObtenerAliasEmisorCitaAsync(citaId, id, tipo, Context.ConnectionAborted);
        if (string.IsNullOrWhiteSpace(alias))
            throw new HubException("No se pudo identificar al remitente.");

        var resultado = await citaRepo.GuardarMensajeCitaAsync(
            citaId, tipo, id, alias, contenido, Context.ConnectionAborted);

        if (!resultado.Exito || resultado.Datos is null)
            throw new HubException(resultado.Mensaje);

        await Clients.Group(GrupoCita(citaId)).SendAsync("MensajeCita", new
        {
            alias     = resultado.Datos.AliasRemitente,
            contenido = resultado.Datos.Contenido,
            enviadoEn = resultado.Datos.Fecha,
            remitenteTipo = resultado.Datos.RemitenteTipo
        });
    }

    private async Task<bool> PuedeAccederCitaAsync(int citaId)
    {
        var user = Context.User!;
        var id   = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (user.IsInRole("Profesional"))
            return await citaRepo.ObtenerParaSalaProfesionalAsync(citaId, id, Context.ConnectionAborted) is not null;

        return await citaRepo.ObtenerParaSalaUsuarioAsync(citaId, id, Context.ConnectionAborted) is not null;
    }
}

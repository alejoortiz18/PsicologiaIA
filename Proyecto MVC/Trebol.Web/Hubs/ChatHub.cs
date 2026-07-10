using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Trebol.Domain.Interfaces;

namespace Trebol.Web.Hubs;

[Authorize(Roles = "Usuario,Profesional")]
public class ChatHub(IMensajeriaRepository mensajeriaRepo) : Hub
{
    public static string GrupoConversacion(int conversacionId) => $"conv-{conversacionId}";

    public static string GrupoUsuario(string tipoEntidad, int entidadId) =>
        $"user-{tipoEntidad}-{entidadId}";

    public override async Task OnConnectedAsync()
    {
        var (id, tipo) = ObtenerIdentidad();
        await Groups.AddToGroupAsync(Context.ConnectionId, GrupoUsuario(tipo, id));
        await base.OnConnectedAsync();
    }

    public async Task UnirseConversacion(int conversacionId)
    {
        var (id, tipo) = ObtenerIdentidad();
        if (!await mensajeriaRepo.EsParticipanteConversacionAsync(conversacionId, id, tipo))
            throw new HubException("No tienes acceso a esta conversación.");

        await Groups.AddToGroupAsync(Context.ConnectionId, GrupoConversacion(conversacionId));
    }

    public Task AbandonarConversacion(int conversacionId)
        => Groups.RemoveFromGroupAsync(Context.ConnectionId, GrupoConversacion(conversacionId));

    private (int id, string tipo) ObtenerIdentidad()
    {
        var id   = int.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var tipo = Context.User.IsInRole("Profesional") ? "Profesional" : "Usuario";
        return (id, tipo);
    }
}

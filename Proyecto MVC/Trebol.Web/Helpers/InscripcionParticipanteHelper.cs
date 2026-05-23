using System.Security.Claims;

namespace Trebol.Web.Helpers;

public readonly record struct InscripcionParticipante(int? UsuarioId, int? ProfesionalInscriptorId)
{
    public static InscripcionParticipante From(ClaimsPrincipal user)
    {
        var id = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (user.IsInRole("Profesional"))
            return new(null, id);
        return new(id, null);
    }
}

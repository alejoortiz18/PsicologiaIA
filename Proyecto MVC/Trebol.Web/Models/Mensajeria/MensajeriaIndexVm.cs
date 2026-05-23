using Trebol.Model.DTOs.Mensajeria;

namespace Trebol.Web.Models.Mensajeria;

public class MensajeriaIndexVm
{
    public IReadOnlyList<ConversacionDto> Conversaciones { get; init; } = [];
    public int? ConversacionActivaId { get; init; }
    public ConversacionDto? ConversacionActiva { get; init; }
    public IReadOnlyList<MensajePrivadoDto> Mensajes { get; init; } = [];
    public int DestinoId { get; init; }
    public string TipoDestino { get; init; } = string.Empty;
    public int MiId { get; init; }
    public string MiTipo { get; init; } = string.Empty;
    public string MiNombre { get; init; } = string.Empty;
}

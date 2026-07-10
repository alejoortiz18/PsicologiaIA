using Trebol.Model.DTOs.Mensajeria;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface IMensajeriaRepository
{
    Task<ResultadoOperacion<EnviarMensajeResultadoDto>> EnviarMensajeAsync(int autorId, string tipoAutor, int destinoId, string tipoDestino, string texto, CancellationToken ct = default);
    Task<MensajePrivadoDto?>              ObtenerMensajePorIdAsync(int mensajeId, CancellationToken ct = default);
    Task<bool>                            EsParticipanteConversacionAsync(int conversacionId, int entidadId, string tipoEntidad, CancellationToken ct = default);
    Task<IReadOnlyList<ConversacionDto>>  ObtenerConversacionesAsync(int entidadId, string tipoEntidad, CancellationToken ct = default);
    Task<IReadOnlyList<MensajePrivadoDto>> ObtenerMensajesAsync(int conversacionId, CancellationToken ct = default);
    Task MarcarLeidosAsync(int conversacionId, int lectorId, string tipoLector, CancellationToken ct = default);
    Task<(int destinoId, string tipoDestino)?> ObtenerDestinoConversacionAsync(
        int conversacionId, int entidadId, string tipoEntidad, CancellationToken ct = default);
}

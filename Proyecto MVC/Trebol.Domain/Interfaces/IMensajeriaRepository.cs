using Trebol.Model.DTOs.Mensajeria;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface IMensajeriaRepository
{
    Task<ResultadoOperacion<int>>         EnviarMensajeAsync(int autorId, string tipoAutor, int destinoId, string tipoDestino, string texto, CancellationToken ct = default);
    Task<IReadOnlyList<ConversacionDto>>  ObtenerConversacionesAsync(int entidadId, string tipoEntidad, CancellationToken ct = default);
    Task<IReadOnlyList<MensajePrivadoDto>> ObtenerMensajesAsync(int conversacionId, CancellationToken ct = default);
    Task MarcarLeidosAsync(int conversacionId, int lectorId, CancellationToken ct = default);
}

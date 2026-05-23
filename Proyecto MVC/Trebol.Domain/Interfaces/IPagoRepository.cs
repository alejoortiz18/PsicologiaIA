using Trebol.Model.DTOs.Pago;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface IPagoRepository
{
    Task<PagoProcesadoDto> PagarCitaAsync(int citaId, int usuarioId, string metodoPago, CancellationToken ct = default);
    Task<PagoProcesadoDto> PagarInscripcionAsync(int inscripcionId, string metodoPago, CancellationToken ct = default);
}

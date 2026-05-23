using Trebol.Model.DTOs.Pago;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface IInscripcionRepository
{
    Task<ResultadoOperacion<InscripcionResultadoDto>> InscribirAsync(
        int salaId, int? usuarioId, int? profesionalInscriptorId, CancellationToken ct = default);
    Task<bool> EstaInscritoAsync(int salaId, int? usuarioId, int? profesionalInscriptorId, CancellationToken ct = default);
    Task<InscripcionResultadoDto?> ObtenerPorIdAsync(
        int inscripcionId, int? usuarioId, int? profesionalInscriptorId, CancellationToken ct = default);
}

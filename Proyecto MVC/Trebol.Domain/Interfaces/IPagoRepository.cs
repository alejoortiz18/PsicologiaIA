using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface IPagoRepository
{
    Task<ResultadoOperacion> PagarCitaAsync(int citaId, int usuarioId, string metodoPago, CancellationToken ct = default);
    Task<ResultadoOperacion> PagarInscripcionAsync(int inscripcionId, string metodoPago, CancellationToken ct = default);
}

using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface IInscripcionRepository
{
    Task<ResultadoOperacion<int>> InscribirAsync(int usuarioId, int salaId, CancellationToken ct = default);
    Task<bool> EstaInscritoAsync(int usuarioId, int salaId, CancellationToken ct = default);
}

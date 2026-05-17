using Trebol.Model.DTOs.Directorio;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface IDirectorioRepository
{
    Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerEspecialistasAsync(FiltroDirectorioDto filtro, int usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerPsicologosAsync(FiltroDirectorioDto filtro, int usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerMisMentoresAsync(int usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerMisColegasAsync(int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion> ToggleSeguirAsync(int usuarioId, int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion> ToggleColegaAsync(int solicitanteId, int receptorId, CancellationToken ct = default);
}

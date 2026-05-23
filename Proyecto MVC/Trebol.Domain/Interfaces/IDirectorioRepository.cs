using Trebol.Model.DTOs.Directorio;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface IDirectorioRepository
{
    Task<DirectorioPaginadoDto> ObtenerMedicosAsync(FiltroDirectorioDto filtro, int usuarioId, CancellationToken ct = default);
    Task<DirectorioPaginadoDto> ObtenerPsicologosAsync(FiltroDirectorioDto filtro, int usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerMisMentoresAsync(int usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerMisColegasAsync(int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion> ToggleSeguirAsync(int usuarioId, int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion> ToggleColegaAsync(int solicitanteId, int receptorId, CancellationToken ct = default);
}

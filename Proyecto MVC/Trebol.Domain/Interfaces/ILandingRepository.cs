using Trebol.Model.DTOs.Publico;

namespace Trebol.Domain.Interfaces;

public interface ILandingRepository
{
    Task<EstadisticasLandingDto> ObtenerEstadisticasAsync(CancellationToken ct = default);
    Task<IReadOnlyList<EspecialidadConteoDto>> ObtenerEspecialidadesConConteoAsync(CancellationToken ct = default);
    Task<IReadOnlyList<EventoPublicoDto>> ObtenerEventosDestacadosAsync(int limite = 3, CancellationToken ct = default);
    Task<IReadOnlyList<ProfesionalTickerDto>> ObtenerTickerProfesionalesAsync(int limite = 6, CancellationToken ct = default);
}

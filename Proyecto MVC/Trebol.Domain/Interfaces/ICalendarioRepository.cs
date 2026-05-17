using Trebol.Model.Entities.TrebolEntities;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface ICalendarioRepository
{
    Task<IReadOnlyList<HorarioDisponible>> ObtenerDisponibilidadAsync(int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion> GuardarDisponibilidadAsync(int profesionalId, IEnumerable<HorarioDisponible> horarios, CancellationToken ct = default);
    Task<ResultadoOperacion> BloquearHorarioAsync(int profesionalId, DateTime inicio, DateTime fin, string? motivo, CancellationToken ct = default);
    Task<ResultadoOperacion> DesbloquearHorarioAsync(int bloqueoId, int profesionalId, CancellationToken ct = default);
    Task<IReadOnlyList<HorarioBloqueado>> ObtenerBloqueosAsync(int profesionalId, CancellationToken ct = default);
}

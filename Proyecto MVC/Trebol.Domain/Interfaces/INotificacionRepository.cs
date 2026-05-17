using Trebol.Model.DTOs.Admin;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface INotificacionRepository
{
    Task<IReadOnlyList<NotificacionDto>> ObtenerPendientesAdminAsync(CancellationToken ct = default);
    Task<ResultadoOperacion> MarcarLeidaAsync(int notificacionId, CancellationToken ct = default);
    Task<ResultadoOperacion> MarcarTodasLeidasAsync(CancellationToken ct = default);
    Task<ResultadoOperacion> CrearAsync(string destinatarioTipo, int destinatarioId, string tipo,
                                         string titulo, string mensaje, string? entidadTipo = null,
                                         int? entidadId = null, CancellationToken ct = default);
}

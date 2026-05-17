using Trebol.Model.DTOs.Cita;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface ICitaRepository
{
    Task<ResultadoOperacion<int>> AgendarAsync(CrearCitaDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<CitaListaDto>> ObtenerPorUsuarioAsync(int usuarioId, string estado, int pagina, CancellationToken ct = default);
    Task<IReadOnlyList<CitaListaDto>> ObtenerPorProfesionalAsync(int profesionalId, string estado, int pagina, CancellationToken ct = default);
    Task<CitaListaDto?>              ObtenerDetalleAsync(int citaId, CancellationToken ct = default);
    Task<ResultadoOperacion>         CancelarAsync(int citaId, int solicitanteId, CancellationToken ct = default);
}

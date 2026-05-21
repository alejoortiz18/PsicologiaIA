using Trebol.Model.DTOs.Cita;
using Trebol.Model.DTOs.Dashboard;
using Trebol.Model.DTOs.Sala;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface ICitaRepository
{
    Task<ResultadoOperacion<int>> AgendarAsync(CrearCitaDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<CitaListaDto>> ObtenerPorUsuarioAsync(int usuarioId, string estado, int pagina, CancellationToken ct = default);
    Task<IReadOnlyList<CitaListaDto>> ObtenerProximasPorUsuarioAsync(int usuarioId, int limite = 5, CancellationToken ct = default);
    Task<IReadOnlyList<CitaHoyProfesionalDto>> ObtenerHoyPorProfesionalAsync(
        int profesionalId, CancellationToken ct = default);

    Task<IReadOnlyList<CitaListaDto>> ObtenerPorProfesionalAsync(int profesionalId, string estado, int pagina, int tamanoPagina = 10, CancellationToken ct = default);
    Task<int> ContarPorProfesionalAsync(int profesionalId, string estado, CancellationToken ct = default);
    Task<CitaListaDto?>              ObtenerDetalleAsync(int citaId, CancellationToken ct = default);
    Task<SalaCitaProfesionalDto?>    ObtenerParaSalaProfesionalAsync(int citaId, int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion>         FinalizarAsync(int citaId, int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion>         CancelarAsync(int citaId, int solicitanteId, CancellationToken ct = default);
}

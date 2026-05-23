using Trebol.Model.DTOs.Dashboard;
using Trebol.Model.DTOs.Publico;
using Trebol.Model.DTOs.Sala;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface ISalaRepository
{
    Task<IReadOnlyList<SalaDto>> ObtenerPorProfesionalAsync(int profesionalId, CancellationToken ct = default);
    Task<IReadOnlyList<SalaDto>> ObtenerPublicasAsync(int? categoriaId = null, int pagina = 1, CancellationToken ct = default);
    Task<IReadOnlyList<EventoPublicoDto>> ObtenerPublicasPaginadasAsync(int pagina = 1, int tamanoPagina = 10, int? categoriaId = null, int? usuarioId = null, CancellationToken ct = default);
    Task<IReadOnlyList<EventoPublicoDto>> ObtenerHoyPublicasAsync(int limite = 4, int? usuarioId = null, CancellationToken ct = default);
    Task<int> ContarPublicasAsync(int? categoriaId = null, CancellationToken ct = default);
    Task<IReadOnlyList<EventoPublicoDto>> ObtenerInscritosUsuarioAsync(int usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<EventoPublicoDto>> ObtenerSemanaUsuarioAsync(int usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<EventoPublicoDto>> ObtenerTodosVigentesAsync(int usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<EventoPublicoDto>> ObtenerEventosPorProfesionalUsuarioAsync(int profesionalId, int usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<EventoPublicoDto>> ObtenerEventosPorProfesionalParticipanteAsync(
        int profesionalOradorId, int? usuarioId, int? profesionalInscriptorId, CancellationToken ct = default);
    Task<SalaDetalleUsuarioDto?> ObtenerDetalleUsuarioAsync(int salaId, int usuarioId, CancellationToken ct = default);
    Task<SalaDetalleUsuarioDto?> ObtenerDetalleInscripcionAsync(int salaId, int? usuarioId, int? profesionalInscriptorId, CancellationToken ct = default);
    Task<IReadOnlyList<EventoPublicoDto>> ObtenerEventosColegasAsync(int profesionalId, int limite = 30, CancellationToken ct = default);
    Task<IReadOnlyList<SalaResumenDto>> ObtenerActivasHoyPorProfesionalAsync(int profesionalId, CancellationToken ct = default);
    Task<SalaDto?>               ObtenerDetalleAsync(int salaId, CancellationToken ct = default);
    Task<SalaConferenciaProfesionalDto?> ObtenerConferenciaProfesionalAsync(int salaId, int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion<int>> CrearAsync(CrearSalaDto dto, CancellationToken ct = default);
    Task<ResultadoOperacion>     ActualizarAsync(SalaDto dto, CancellationToken ct = default);
    Task<ResultadoOperacion>     EliminarAsync(int salaId, int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion>     CerrarAsync(int salaId, int profesionalId, CancellationToken ct = default);
}

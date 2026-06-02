using Trebol.Model.DTOs.Cita;
using Trebol.Model.DTOs.Dashboard;
using Trebol.Model.DTOs.Sala;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface ICitaRepository
{
    Task<ResultadoOperacion<int>> AgendarAsync(CrearCitaDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<CitaListaDto>> ObtenerPorUsuarioAsync(int usuarioId, string estado, int pagina, CancellationToken ct = default);
    Task<IReadOnlyList<CitaListaDto>> ObtenerActivasPorUsuarioAsync(
        int usuarioId, int pagina, int tamanoPagina = 10, CancellationToken ct = default);
    Task<int> ContarActivasPorUsuarioAsync(int usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<CitaListaDto>> ObtenerPasadasPorUsuarioAsync(
        int usuarioId, int pagina, int tamanoPagina = 10, CancellationToken ct = default);
    Task<int> ContarPasadasPorUsuarioAsync(int usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<CitaListaDto>> ObtenerProximasPorUsuarioAsync(int usuarioId, int limite = 5, CancellationToken ct = default);
    Task<IReadOnlyList<CitaHoyProfesionalDto>> ObtenerHoyPorProfesionalAsync(
        int profesionalId, CancellationToken ct = default);

    Task<IReadOnlyList<CitaListaDto>> ObtenerPorProfesionalAsync(int profesionalId, string estado, int pagina, int tamanoPagina = 10, CancellationToken ct = default);
    Task<int> ContarPorProfesionalAsync(int profesionalId, string estado, CancellationToken ct = default);
    Task<CitaListaDto?> ObtenerDetalleAsync(int citaId, CancellationToken ct = default);
    Task<CitaListaDto?> ObtenerDetalleParaClienteAsync(
        int citaId, int? usuarioId, int? profesionalClienteId, CancellationToken ct = default);
    Task<SalaCitaProfesionalDto?>    ObtenerParaSalaProfesionalAsync(int citaId, int profesionalId, CancellationToken ct = default);
    Task<SalaCitaUsuarioDto?>        ObtenerParaSalaUsuarioAsync(int citaId, int usuarioId, CancellationToken ct = default);
    Task<ResultadoOperacion>         ActualizarMostrarAliasAsync(int citaId, int usuarioId, bool mostrarAlias, CancellationToken ct = default);
    Task<ResultadoOperacion>         FinalizarAsync(int citaId, int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion>         CancelarAsync(int citaId, int solicitanteId, CancellationToken ct = default);
    Task<IReadOnlyList<CitaSlotPublicoDto>> ObtenerSlotsPublicosAsync(
        int profesionalId, DateTime desde, DateTime hasta, CancellationToken ct = default);

    Task<IReadOnlyList<CalendarioSlotDto>> ObtenerSlotsCalendarioPublicoAsync(
        int profesionalId,
        DateTime desde,
        DateTime hasta,
        int? viewerUsuarioId = null,
        int? viewerProfesionalId = null,
        CancellationToken ct = default);

    Task<IReadOnlyList<CalendarioSlotDto>> ObtenerSlotsCalendarioPropietarioAsync(
        int profesionalId,
        DateTime desde,
        DateTime hasta,
        CancellationToken ct = default);

    Task<IReadOnlyList<CalendarioSlotDto>> ObtenerSlotsCalendarioUsuarioAsync(
        int usuarioId,
        DateTime desde,
        DateTime hasta,
        CancellationToken ct = default);
}

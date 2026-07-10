namespace Trebol.Domain.Interfaces;

using Trebol.Model.DTOs.Usuario;
using Trebol.Model.Models;

public interface ISaldoUsuarioRepository
{
    Task<MisSaldosResumenDto> ObtenerResumenAsync(
        int usuarioId, MisSaldosFiltroDto filtro, CancellationToken ct = default);

    Task<IReadOnlyList<PagoPorProfesionalDto>> ObtenerPagosPorProfesionalAsync(
        int usuarioId, MisSaldosFiltroDto filtro, int tamanoPagina = 10, CancellationToken ct = default);

    Task<IReadOnlyList<MovimientoEnTransitoDto>> ObtenerMovimientosEnTransitoAsync(
        int usuarioId, CancellationToken ct = default);

    Task<CuentaBancariaUsuarioDto?> ObtenerCuentaBancariaAsync(
        int usuarioId, CancellationToken ct = default);

    Task<ResultadoOperacion> GuardarCuentaBancariaAsync(
        int usuarioId, GuardarCuentaBancariaUsuarioDto dto, CancellationToken ct = default);

    Task<int> ContarNovedadesPendientesAsync(int usuarioId, CancellationToken ct = default);

    Task<IReadOnlyList<NovedadUsuarioDto>> ObtenerNovedadesAsync(
        int usuarioId, string estado = "Pendiente", int pagina = 1, int tamanoPagina = 10,
        CancellationToken ct = default);

    Task<RetiroSaldoResultadoDto> SolicitarRetiroAsync(
        int usuarioId, decimal? monto = null, CancellationToken ct = default);

    Task<ResultadoOperacion> RetractarRetiroAsync(
        int usuarioId, int movimientoSaldoUsuarioId, CancellationToken ct = default);

    Task<decimal> ObtenerComisionRetiroPorcentajeAsync(CancellationToken ct = default);

    Task<NovedadPendienteModalDto?> ObtenerNovedadPendienteModalAsync(int usuarioId, CancellationToken ct = default);

    Task<ResolverNovedadResultadoDto> ResolverNovedadAsync(
        int usuarioId, int novedadUsuarioId, string opcionElegida, CancellationToken ct = default);

    Task<ResultadoOperacion> RegistrarIngresoCitaSalaAsync(
        int citaId, string tipoParticipante, int participanteId, CancellationToken ct = default);

    Task<EvaluarInasistenciaDto> EvaluarInasistenciaCitaAsync(
        int citaId, int usuarioId, CancellationToken ct = default);

    Task<ResultadoOperacion> ReportarAusenciaProfesionalAsync(
        int citaId, int profesionalId, string? mensaje, CancellationToken ct = default);

    Task<ResultadoOperacion> CancelarEventoSalaConNovedadesAsync(
        int salaId, int profesionalId, string? motivo, CancellationToken ct = default);
}

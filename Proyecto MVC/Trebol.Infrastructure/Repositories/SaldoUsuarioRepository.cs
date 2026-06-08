using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Domain.Interfaces.Catalogos;
using Trebol.Model.DTOs.Usuario;
using Trebol.Model.Models;

namespace Trebol.Infrastructure.Repositories;

public class SaldoUsuarioRepository(
    IConfiguration configuration,
    IConfiguracionRepository configRepo) : ISaldoUsuarioRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    public async Task<MisSaldosResumenDto> ObtenerResumenAsync(
        int usuarioId, MisSaldosFiltroDto filtro, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var row = await conn.QueryFirstOrDefaultAsync<MisSaldosResumenDto>(
            "sp_ObtenerResumenMisSaldosUsuario",
            new { UsuarioId = usuarioId, FechaDesde = filtro.FechaDesde, FechaHasta = filtro.FechaHasta },
            commandType: CommandType.StoredProcedure);
        return row ?? new MisSaldosResumenDto();
    }

    public async Task<IReadOnlyList<PagoPorProfesionalDto>> ObtenerPagosPorProfesionalAsync(
        int usuarioId, MisSaldosFiltroDto filtro, int tamanoPagina = 10, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var rows = await conn.QueryAsync<PagoPorProfesionalDto>(
            "sp_ObtenerPagosPorProfesionalUsuario",
            new
            {
                UsuarioId    = usuarioId,
                FechaDesde   = filtro.FechaDesde,
                FechaHasta   = filtro.FechaHasta,
                Pagina       = filtro.PaginaPagos,
                TamanoPagina = tamanoPagina
            },
            commandType: CommandType.StoredProcedure);
        return rows.AsList();
    }

    public async Task<IReadOnlyList<MovimientoEnTransitoDto>> ObtenerMovimientosEnTransitoAsync(
        int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var rows = await conn.QueryAsync<MovimientoEnTransitoDto>(
            "sp_ObtenerMovimientosEnTransitoUsuario",
            new { UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);

        var ahora = DateTime.Now;
        return rows.Select(m =>
        {
            m.PuedeRetractar = m.Estado == "EnTransito"
                && m.FechaLimiteRetractacion.HasValue
                && m.FechaLimiteRetractacion.Value >= ahora;
            return m;
        }).AsList();
    }

    public async Task<CuentaBancariaUsuarioDto?> ObtenerCuentaBancariaAsync(
        int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.QueryFirstOrDefaultAsync<CuentaBancariaUsuarioDto>(
            "sp_ObtenerCuentaBancariaUsuario",
            new { UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<ResultadoOperacion> GuardarCuentaBancariaAsync(
        int usuarioId, GuardarCuentaBancariaUsuarioDto dto, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_GuardarCuentaBancariaUsuario",
            new
            {
                UsuarioId        = usuarioId,
                dto.Banco,
                dto.TipoCuenta,
                dto.NumeroCuenta,
                dto.Titular,
                dto.DocumentoTitular
            },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == 1
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "No se pudieron guardar los datos bancarios.");
    }

    public async Task<int> ContarNovedadesPendientesAsync(int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.QueryFirstOrDefaultAsync<int>(
            "sp_ContarNovedadesPendientesUsuario",
            new { UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<IReadOnlyList<NovedadUsuarioDto>> ObtenerNovedadesAsync(
        int usuarioId, string estado = "Pendiente", int pagina = 1, int tamanoPagina = 10,
        CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var rows = await conn.QueryAsync<NovedadUsuarioDto>(
            "sp_ObtenerNovedadesUsuario",
            new { UsuarioId = usuarioId, Estado = estado, Pagina = pagina, TamanoPagina = tamanoPagina },
            commandType: CommandType.StoredProcedure);
        return rows.AsList();
    }

    public async Task<RetiroSaldoResultadoDto> SolicitarRetiroAsync(
        int usuarioId, decimal? monto = null, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<RetiroSaldoRow>(
            "sp_SolicitarRetiroSaldoUsuario",
            new { UsuarioId = usuarioId, Monto = monto },
            commandType: CommandType.StoredProcedure);

        if (result is null)
            return new RetiroSaldoResultadoDto { Exito = false, Mensaje = "Error al solicitar retiro." };

        return new RetiroSaldoResultadoDto
        {
            Exito      = result.Exito == 1,
            Mensaje    = result.Mensaje,
            MontoBruto = result.MontoBruto,
            Comision   = result.Comision,
            MontoNeto  = result.MontoNeto
        };
    }

    public async Task<ResultadoOperacion> RetractarRetiroAsync(
        int usuarioId, int movimientoSaldoUsuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_RetractarRetiroSaldoUsuario",
            new { UsuarioId = usuarioId, MovimientoSaldoUsuarioId = movimientoSaldoUsuarioId },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == 1
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "No se pudo cancelar el retiro.");
    }

    public async Task<decimal> ObtenerComisionRetiroPorcentajeAsync(CancellationToken ct = default)
    {
        var valor = await configRepo.ObtenerValorAsync("Financiero.ComisionRetiroPorcentaje", ct);
        return decimal.TryParse(valor?.Replace(',', '.'),
            System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture,
            out var pct)
            ? pct
            : 0m;
    }

    public async Task<NovedadPendienteModalDto?> ObtenerNovedadPendienteModalAsync(
        int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.QueryFirstOrDefaultAsync<NovedadPendienteModalDto>(
            "sp_ObtenerNovedadPendienteUsuario",
            new { UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<ResolverNovedadResultadoDto> ResolverNovedadAsync(
        int usuarioId, int novedadUsuarioId, string opcionElegida, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var row = await conn.QueryFirstOrDefaultAsync<ResolverNovedadRow>(
            "sp_ResolverNovedadUsuario",
            new { NovedadUsuarioId = novedadUsuarioId, UsuarioId = usuarioId, OpcionElegida = opcionElegida },
            commandType: CommandType.StoredProcedure);

        return row is null
            ? new ResolverNovedadResultadoDto { Exito = false, Mensaje = "No se pudo resolver la novedad." }
            : new ResolverNovedadResultadoDto
            {
                Exito         = row.Exito == 1,
                Mensaje       = row.Mensaje,
                RedirectUrl   = row.RedirectUrl,
                ProfesionalId = row.ProfesionalId
            };
    }

    public async Task<ResultadoOperacion> RegistrarIngresoCitaSalaAsync(
        int citaId, string tipoParticipante, int participanteId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_RegistrarIngresoCitaSala",
            new { CitaId = citaId, TipoParticipante = tipoParticipante, ParticipanteId = participanteId },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == 1
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "No se pudo registrar el ingreso.");
    }

    public async Task<EvaluarInasistenciaDto> EvaluarInasistenciaCitaAsync(
        int citaId, int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var row = await conn.QueryFirstOrDefaultAsync<EvaluarInasistenciaDto>(
            "sp_EvaluarInasistenciaCita",
            new { CitaId = citaId, UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
        return row ?? new EvaluarInasistenciaDto();
    }

    public async Task<ResultadoOperacion> ReportarAusenciaProfesionalAsync(
        int citaId, int profesionalId, string? mensaje, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_ReportarAusenciaProfesionalCita",
            new { CitaId = citaId, ProfesionalId = profesionalId, Mensaje = mensaje },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == 1
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "No se pudo reportar la ausencia.");
    }

    public async Task<ResultadoOperacion> CancelarEventoSalaConNovedadesAsync(
        int salaId, int profesionalId, string? motivo, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_CancelarEventoSalaConNovedades",
            new { SalaId = salaId, ProfesionalId = profesionalId, Motivo = motivo },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == 1
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "No se pudo cancelar el evento.");
    }

    private sealed class SpResult
    {
        public int    Exito   { get; set; }
        public string Mensaje { get; set; } = string.Empty;
    }

    private sealed class RetiroSaldoRow
    {
        public int     Exito     { get; set; }
        public string  Mensaje   { get; set; } = string.Empty;
        public decimal MontoBruto { get; set; }
        public decimal Comision   { get; set; }
        public decimal MontoNeto  { get; set; }
    }

    private sealed class ResolverNovedadRow
    {
        public int     Exito          { get; set; }
        public string  Mensaje        { get; set; } = string.Empty;
        public string? RedirectUrl    { get; set; }
        public int?    ProfesionalId  { get; set; }
    }
}

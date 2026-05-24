using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Pago;

namespace Trebol.Infrastructure.Repositories;

public class PagoRepository(IConfiguration configuration) : IPagoRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    public async Task<PagoProcesadoDto> PagarCitaAsync(
        int citaId, int? usuarioId, int? profesionalClienteId, string metodoPago,
        decimal montoTotal, decimal montoIva, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpPagoResult>(
            "sp_PagarCita",
            new
            {
                CitaId = citaId,
                UsuarioId = usuarioId,
                ProfesionalClienteId = profesionalClienteId,
                MetodoPago = metodoPago,
                MontoTotal = montoTotal,
                MontoIva = montoIva
            },
            commandType: CommandType.StoredProcedure);

        return Map(result);
    }

    public async Task<PagoProcesadoDto> PagarInscripcionAsync(
        int inscripcionId, string metodoPago, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpPagoResult>(
            "sp_PagarInscripcion",
            new { InscripcionId = inscripcionId, MetodoPago = metodoPago },
            commandType: CommandType.StoredProcedure);

        return Map(result);
    }

    private static PagoProcesadoDto Map(SpPagoResult? result)
        => new()
        {
            Exito   = result?.Exito == true,
            Mensaje = result?.Mensaje ?? "Error al procesar pago.",
            Codigo  = result?.Codigo
        };

    private sealed class SpPagoResult
    {
        public bool    Exito   { get; init; }
        public string  Mensaje { get; init; } = "";
        public string? Codigo  { get; init; }
    }
}

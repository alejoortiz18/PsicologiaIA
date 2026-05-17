using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.Models;

namespace Trebol.Infrastructure.Repositories;

public class PagoRepository(IConfiguration configuration) : IPagoRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    public async Task<ResultadoOperacion> PagarCitaAsync(
        int citaId, int usuarioId, string metodoPago, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_PagarCita",
            new { CitaId = citaId, UsuarioId = usuarioId, MetodoPago = metodoPago },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "Error al procesar pago.");
    }

    public async Task<ResultadoOperacion> PagarInscripcionAsync(
        int inscripcionId, string metodoPago, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_PagarInscripcion",
            new { InscripcionId = inscripcionId, MetodoPago = metodoPago },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "Error al procesar pago.");
    }

    private sealed class SpResult { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; }
}

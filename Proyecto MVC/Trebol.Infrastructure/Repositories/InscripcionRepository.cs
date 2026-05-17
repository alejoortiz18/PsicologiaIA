using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.Models;

namespace Trebol.Infrastructure.Repositories;

public class InscripcionRepository(IConfiguration configuration) : IInscripcionRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    public async Task<ResultadoOperacion<int>> InscribirAsync(
        int usuarioId, int salaId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResultId>(
            "sp_InscribirSala",
            new { UsuarioId = usuarioId, SalaId = salaId },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion<int>.Ok(result.Id)
            : ResultadoOperacion<int>.Fail(result?.Mensaje ?? "Error al inscribir.");
    }

    private sealed class SpResult { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; }
    private sealed class SpResultId { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; public int Id { get; init; } }

    public async Task<bool> EstaInscritoAsync(int usuarioId, int salaId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var count = await conn.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Inscripcion WHERE UsuarioId=@u AND SalaId=@s AND Estado NOT IN ('Cancelada')",
            new { u = usuarioId, s = salaId });
        return count > 0;
    }
}

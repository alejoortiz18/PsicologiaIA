using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Pago;
using Trebol.Model.Models;

namespace Trebol.Infrastructure.Repositories;

public class InscripcionRepository(IConfiguration configuration) : IInscripcionRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    public async Task<ResultadoOperacion<InscripcionResultadoDto>> InscribirAsync(
        int salaId, int? usuarioId, int? profesionalInscriptorId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpInscribirResult>(
            "sp_InscribirSala",
            new { SalaId = salaId, UsuarioId = usuarioId, ProfesionalInscriptorId = profesionalInscriptorId },
            commandType: CommandType.StoredProcedure);

        if (result?.Exito != true)
            return ResultadoOperacion<InscripcionResultadoDto>.Fail(result?.Mensaje ?? "Error al inscribir.");

        return ResultadoOperacion<InscripcionResultadoDto>.Ok(new InscripcionResultadoDto
        {
            SalaId            = salaId,
            InscripcionId     = result.Id,
            EstadoInscripcion = result.EstadoInscripcion ?? "Confirmada",
            Precio            = result.Precio,
            CodigoInscripcion = result.CodigoInscripcion
        }, result.Mensaje);
    }

    public async Task<InscripcionResultadoDto?> ObtenerPorIdAsync(
        int inscripcionId, int? usuarioId, int? profesionalInscriptorId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.QueryFirstOrDefaultAsync<InscripcionResultadoDto>(
            @"SELECT i.InscripcionId,
                     i.SalaId,
                     i.Estado AS EstadoInscripcion,
                     i.CodigoInscripcion,
                     ISNULL(s.Precio, 0) AS Precio
              FROM   Inscripcion i
              JOIN   Sala s ON s.SalaId = i.SalaId
              WHERE  i.InscripcionId = @InscripcionId
                AND (
                      (@UsuarioId IS NOT NULL AND i.UsuarioId = @UsuarioId)
                   OR (@ProfesionalInscriptorId IS NOT NULL AND i.ProfesionalInscriptorId = @ProfesionalInscriptorId)
                )",
            new { InscripcionId = inscripcionId, UsuarioId = usuarioId, ProfesionalInscriptorId = profesionalInscriptorId });
    }

    public async Task<bool> EstaInscritoAsync(
        int salaId, int? usuarioId, int? profesionalInscriptorId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var count = await conn.ExecuteScalarAsync<int>(
            @"SELECT COUNT(1) FROM Inscripcion
              WHERE SalaId = @s
                AND Estado IN ('Confirmada', 'PagoAprobado', 'PendientePago')
                AND (
                      (@u IS NOT NULL AND UsuarioId = @u)
                   OR (@p IS NOT NULL AND ProfesionalInscriptorId = @p)
                )",
            new { s = salaId, u = usuarioId, p = profesionalInscriptorId });
        return count > 0;
    }

    private sealed class SpInscribirResult
    {
        public bool     Exito              { get; init; }
        public string   Mensaje            { get; init; } = "";
        public int      Id                 { get; init; }
        public string?  EstadoInscripcion  { get; init; }
        public decimal  Precio             { get; init; }
        public string?  CodigoInscripcion  { get; init; }
    }
}

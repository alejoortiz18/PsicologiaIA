using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Sala;
using Trebol.Model.Entities.TrebolEntities;
using Trebol.Model.Models;

namespace Trebol.Infrastructure.Repositories;

public class SalaRepository(AppDbContext context, IConfiguration configuration) : ISalaRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    private sealed class SpResult { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; }
    private sealed class SpResultId { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; public int Id { get; init; } }

    public async Task<IReadOnlyList<SalaDto>> ObtenerPorProfesionalAsync(
        int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<SalaDto>(
            "sp_ObtenerSalasPorProfesional",
            new { ProfesionalId = profesionalId },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<SalaDto>> ObtenerPublicasAsync(
        int? categoriaId = null, int pagina = 1, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<SalaDto>(
            "sp_ObtenerSalasPublicas",
            new { CategoriaId = categoriaId, Pagina = pagina },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<SalaDto?> ObtenerDetalleAsync(int salaId, CancellationToken ct = default)
        => await context.Salas
                        .AsNoTracking()
                        .Where(s => s.SalaId == salaId)
                        .Select(s => new SalaDto
                        {
                            SalaId        = s.SalaId,
                            ProfesionalId = s.ProfesionalId,
                            Titulo        = s.Nombre,
                            Descripcion   = s.Descripcion,
                            Capacidad     = s.CupoMaximo,
                            CategoriaId   = s.CategoriaId
                        })
                        .FirstOrDefaultAsync(ct);

    public async Task<ResultadoOperacion<int>> CrearAsync(CrearSalaDto dto, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResultId>(
            "sp_CrearSala",
            new
            {
                dto.ProfesionalId,
                Nombre      = dto.Titulo,
                dto.Descripcion,
                Tipo        = dto.Tipo.ToString(),
                dto.CategoriaId,
                CupoMaximo  = dto.Capacidad,
                dto.Precio
            },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion<int>.Ok(result.Id)
            : ResultadoOperacion<int>.Fail(result?.Mensaje ?? "Error al crear sala.");
    }

    public async Task<ResultadoOperacion> ActualizarAsync(SalaDto dto, CancellationToken ct = default)
    {
        var sala = await context.Salas
                                .FirstOrDefaultAsync(s => s.SalaId == dto.SalaId, ct);
        if (sala is null) return ResultadoOperacion.Fail("Sala no encontrada.");

        sala.Nombre    = dto.Titulo ?? sala.Nombre;
        sala.Descripcion = dto.Descripcion;
        sala.CupoMaximo  = dto.Capacidad;

        await context.SaveChangesAsync(ct);
        return ResultadoOperacion.Ok();
    }

    public async Task<ResultadoOperacion> EliminarAsync(int salaId, int profesionalId, CancellationToken ct = default)
    {
        var sala = await context.Salas
                                .FirstOrDefaultAsync(s => s.SalaId == salaId && s.ProfesionalId == profesionalId, ct);
        if (sala is null) return ResultadoOperacion.Fail("Sala no encontrada.");

        context.Salas.Remove(sala);
        await context.SaveChangesAsync(ct);
        return ResultadoOperacion.Ok();
    }

    public async Task<ResultadoOperacion> CerrarAsync(int salaId, int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_CerrarSala",
            new { SalaId = salaId, ProfesionalId = profesionalId },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "Error al cerrar sala.");
    }
}

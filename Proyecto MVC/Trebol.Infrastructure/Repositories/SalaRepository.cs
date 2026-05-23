using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Dashboard;
using Trebol.Model.DTOs.Publico;
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

    public async Task<IReadOnlyList<EventoPublicoDto>> ObtenerEventosColegasAsync(
        int profesionalId, int limite = 30, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<EventoPublicoDto>(
            "sp_ObtenerEventosColegas",
            new { ProfesionalId = profesionalId, Limite = limite },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<SalaResumenDto>> ObtenerActivasHoyPorProfesionalAsync(
        int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<SalaResumenDto>(
            "sp_ObtenerSalasActivasHoyProfesional",
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

    public async Task<IReadOnlyList<EventoPublicoDto>> ObtenerPublicasPaginadasAsync(
        int pagina = 1, int tamanoPagina = 10, int? categoriaId = null, int? usuarioId = null, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<EventoPublicoDto>(
            "sp_ObtenerSalasPublicasPaginadas",
            new { CategoriaId = categoriaId, Pagina = pagina, TamanoPagina = tamanoPagina, UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<EventoPublicoDto>> ObtenerHoyPublicasAsync(
        int limite = 4, int? usuarioId = null, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<EventoPublicoDto>(
            "sp_ObtenerSalasHoyPublicas",
            new { Limite = limite, UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<EventoPublicoDto>> ObtenerInscritosUsuarioAsync(
        int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<EventoPublicoDto>(
            "sp_ObtenerEventosInscritosUsuario",
            new { UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<EventoPublicoDto>> ObtenerSemanaUsuarioAsync(
        int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<EventoPublicoDto>(
            "sp_ObtenerEventosSemanaUsuario",
            new { UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<EventoPublicoDto>> ObtenerTodosVigentesAsync(
        int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<EventoPublicoDto>(
            "sp_ObtenerTodosEventosVigentes",
            new { UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<EventoPublicoDto>> ObtenerEventosPorProfesionalUsuarioAsync(
        int profesionalId, int usuarioId, CancellationToken ct = default)
        => await ObtenerEventosPorProfesionalParticipanteAsync(profesionalId, usuarioId, null, ct);

    public async Task<IReadOnlyList<EventoPublicoDto>> ObtenerEventosPorProfesionalParticipanteAsync(
        int profesionalOradorId, int? usuarioId, int? profesionalInscriptorId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<EventoPublicoDto>(
            "sp_ObtenerEventosPorProfesionalUsuario",
            new
            {
                ProfesionalId = profesionalOradorId,
                UsuarioId = usuarioId ?? 0,
                ProfesionalInscriptorId = profesionalInscriptorId ?? 0
            },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<SalaDetalleUsuarioDto?> ObtenerDetalleUsuarioAsync(
        int salaId, int usuarioId, CancellationToken ct = default)
        => await ObtenerDetalleInscripcionAsync(salaId, usuarioId, null, ct);

    public async Task<SalaDetalleUsuarioDto?> ObtenerDetalleInscripcionAsync(
        int salaId, int? usuarioId, int? profesionalInscriptorId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.QueryFirstOrDefaultAsync<SalaDetalleUsuarioDto>(
            "sp_ObtenerSalaDetalleUsuario",
            new
            {
                SalaId = salaId,
                UsuarioId = usuarioId ?? 0,
                ProfesionalInscriptorId = profesionalInscriptorId ?? 0
            },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<int> ContarPublicasAsync(int? categoriaId = null, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.QueryFirstOrDefaultAsync<int>(
            "sp_ContarSalasPublicas",
            new { CategoriaId = categoriaId },
            commandType: CommandType.StoredProcedure);
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

    public async Task<SalaConferenciaProfesionalDto?> ObtenerConferenciaProfesionalAsync(
        int salaId, int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.QueryFirstOrDefaultAsync<SalaConferenciaProfesionalDto>(
            @"SELECT s.SalaId,
                     s.ProfesionalId,
                     s.Nombre AS Titulo,
                     s.Descripcion,
                     c.Nombre AS Categoria,
                     s.Tipo,
                     s.Estado,
                     s.CupoMaximo AS Capacidad,
                     (SELECT COUNT(*)
                      FROM   Inscripcion i
                      WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN ('Cancelada')) AS TotalInscritos,
                     (SELECT TOP 1 e.FechaInicio
                      FROM   Evento e
                      WHERE  e.SalaId = s.SalaId
                      ORDER  BY e.FechaInicio DESC) AS FechaInicio,
                     p.NombreCompleto AS NombreProfesional
              FROM   Sala s
              JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId
              LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
              WHERE  s.SalaId = @SalaId AND s.ProfesionalId = @ProfesionalId",
            new { SalaId = salaId, ProfesionalId = profesionalId });
    }

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
                dto.FechaInicio,
                Precio      = dto.Precio ?? 0m
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

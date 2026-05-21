using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Auth;
using Trebol.Model.DTOs.Dashboard;
using Trebol.Model.DTOs.Usuario;
using Trebol.Model.Entities.TrebolEntities;
using Trebol.Model.Models;

namespace Trebol.Infrastructure.Repositories;

public class UsuarioRepository(AppDbContext context, IConfiguration configuration) : IUsuarioRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    public async Task<ResultadoOperacion<int>> RegistrarAsync(
        RegistroUsuarioDto dto, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResultId>(
            "sp_RegistrarUsuario",
            new
            {
                dto.NombreCompleto,
                dto.Correo,
                dto.NumeroDocumento,
                dto.Alias,
                dto.Celular,
                dto.CiudadId,
                Token      = dto.Token ?? Guid.NewGuid().ToString("N"),
                Expiracion = dto.Expiracion ?? DateTime.Now.AddHours(1)
            },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion<int>.Ok(result.Id)
            : ResultadoOperacion<int>.Fail(result?.Mensaje ?? "Error al registrar.");
    }

    public async Task<bool> EsTokenValidoAsync(string token, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(token)) return false;

        using var conn = CrearConexion();
        var count = await conn.QueryFirstOrDefaultAsync<int>(
            "SELECT COUNT(*) FROM TokenValidacion WHERE Token = @Token AND Usado = 0 AND FechaExpiracion > GETDATE()",
            new { Token = token });

        return count > 0;
    }

    public async Task<(string Correo, string NombreCompleto)?> ObtenerPorTokenAsync(
        string token, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(token)) return null;

        using var conn = CrearConexion();
        var row = await conn.QueryFirstOrDefaultAsync<TokenUsuarioRow>(
            @"SELECT u.Correo, u.NombreCompleto
              FROM   TokenValidacion tv
              INNER JOIN Usuario u ON u.UsuarioId = tv.UsuarioId
              WHERE  tv.Token = @Token",
            new { Token = token });

        return row is null ? null : (row.Correo, row.NombreCompleto);
    }

    public async Task<ResultadoOperacion> ActivarAsync(
        string token, string passwordHash, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_ActivarUsuario",
            new { Token = token, PasswordHash = passwordHash },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "Error al activar.");
    }

    public async Task<Usuario?> ObtenerPorCorreoAsync(string correo, CancellationToken ct = default)
        => await context.Usuarios
                        .AsNoTracking()
                        .FirstOrDefaultAsync(u => u.Correo == correo, ct);

    public async Task<Usuario?> ObtenerPorIdAsync(int usuarioId, CancellationToken ct = default)
        => await context.Usuarios
                        .AsNoTracking()
                        .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId, ct);

    public async Task<UsuarioDto?> ObtenerDtoAsync(int usuarioId, CancellationToken ct = default)
        => await context.Usuarios
                        .AsNoTracking()
                        .Where(u => u.UsuarioId == usuarioId)
                        .Select(u => new UsuarioDto
                        {
                            UsuarioId       = u.UsuarioId,
                            NombreCompleto  = u.NombreCompleto,
                            Correo          = u.Correo,
                            Alias           = u.Alias,
                            Celular         = u.Celular,
                            FotoUrl         = u.FotoPerfil,
                            FechaNacimiento = u.FechaNacimiento,
                            Estado          = u.Estado
                        })
                        .FirstOrDefaultAsync(ct);

    public async Task<ResultadoOperacion> ActualizarAsync(
        ActualizarUsuarioDto dto, CancellationToken ct = default)
    {
        var usuario = await context.Usuarios
                                   .FirstOrDefaultAsync(u => u.UsuarioId == dto.UsuarioId, ct);
        if (usuario is null)
            return ResultadoOperacion.Fail("Usuario no encontrado.");

        usuario.NombreCompleto  = dto.NombreCompleto;
        usuario.Alias           = dto.Alias;
        usuario.Celular         = dto.Celular;
        usuario.FechaNacimiento = dto.FechaNacimiento;
        usuario.CiudadId        = dto.CiudadId;
        if (dto.FotoUrl is not null) usuario.FotoPerfil = dto.FotoUrl;

        await context.SaveChangesAsync(ct);
        return ResultadoOperacion.Ok();
    }

    public async Task<DashboardUsuarioDto> ObtenerDashboardAsync(
        int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<DashboardUsuarioDto>(
            "sp_DashboardUsuario",
            new { UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
        return result ?? new DashboardUsuarioDto();
    }

    public async Task<IReadOnlyList<InscripcionHomeItemDto>> ObtenerInscripcionesHomeAsync(
        int usuarioId, int limite = 4, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<InscripcionHomeItemDto>(
            "sp_ObtenerInscripcionesUsuarioHome",
            new { UsuarioId = usuarioId, Limite = limite },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    private sealed class SpResult { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; }
    private sealed class SpResultId { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; public int Id { get; init; } }
    private sealed class TokenUsuarioRow { public string Correo { get; init; } = ""; public string NombreCompleto { get; init; } = ""; }
}

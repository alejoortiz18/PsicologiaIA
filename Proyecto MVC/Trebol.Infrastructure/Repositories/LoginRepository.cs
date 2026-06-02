using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Helpers.Security;
using Trebol.Model.DTOs.Auth;
using Trebol.Model.Models;

namespace Trebol.Infrastructure.Repositories;

/// <summary>
/// Repositorio de login/recuperación.
/// La verificación Argon2 se realiza aquí con IPasswordHelper.VerifyPassword
/// (nunca en SQL, ya que Argon2 usa salt aleatorio).
/// </summary>
public class LoginRepository(IConfiguration configuration, IPasswordHelper passwordHelper) : ILoginRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    private sealed class LoginQueryResult
    {
        public int     EntidadId      { get; init; }
        public string  NombreCompleto { get; init; } = "";
        public string  Correo         { get; init; } = "";
        public string? PasswordHash   { get; init; }
        public string  Estado         { get; init; } = "";
        public string? FotoUrl        { get; init; }
        public string  TipoEntidad    { get; init; } = "";
    }

    private sealed class SpResult { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; }

    public async Task<UsuarioSesionDto?> ValidarLoginAsync(
        string correo, string password, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var row = await conn.QueryFirstOrDefaultAsync<LoginQueryResult>(
            "sp_ValidarLogin",
            new { Correo = correo },
            commandType: CommandType.StoredProcedure);

        if (row is null) return null;

        // Usuario pendiente de confirmar correo
        if (row.TipoEntidad == "Usuario" && row.Estado == "PENDIENTE")
        {
            if (!string.IsNullOrWhiteSpace(row.PasswordHash)
                && !passwordHelper.VerifyPassword(password, row.PasswordHash))
                return null;

            return new UsuarioSesionDto
            {
                TipoEntidad    = "SinConfirmar",
                Correo         = row.Correo,
                NombreCompleto = row.NombreCompleto
            };
        }

        // Retornar tipo especial para estados no activos (mensaje claro al usuario)
        if (row.Estado == "PENDIENTE_VALIDACION")
            return new UsuarioSesionDto { TipoEntidad = "SinConfirmar" };
        if (row.Estado == "PENDIENTE_APROBACION")
            return new UsuarioSesionDto { TipoEntidad = "EnRevision" };
        if (row.Estado == "RECHAZADO")
            return new UsuarioSesionDto { TipoEntidad = "Rechazado" };
        if (row.Estado is not ("ACTIVO" or "Aprobado"))
            return new UsuarioSesionDto { TipoEntidad = "Bloqueado" };

        if (!passwordHelper.VerifyPassword(password, row.PasswordHash ?? ""))
            return null;

        return new UsuarioSesionDto
        {
            EntidadId      = row.EntidadId,
            NombreCompleto = row.NombreCompleto,
            Correo         = row.Correo,
            TipoEntidad    = row.TipoEntidad,
            FotoUrl        = row.FotoUrl
        };
    }

    public async Task<ResultadoOperacion> SolicitarRecuperacionAsync(
        string correo, string token, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_SolicitarRecuperacion",
            new { Correo = correo, Token = token },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "Error al solicitar recuperación.");
    }

    public async Task<ResultadoOperacion> RestablecerPasswordAsync(
        string token, string passwordHash, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_RestablecerPassword",
            new { Token = token, PasswordHash = passwordHash },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "Error al restablecer contraseña.");
    }
}

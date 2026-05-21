using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Auth;
using Trebol.Model.DTOs.Dashboard;
using Trebol.Model.DTOs.Profesional;
using Trebol.Model.Entities.TrebolEntities;
using Trebol.Model.Models;

namespace Trebol.Infrastructure.Repositories;

public class ProfesionalRepository(AppDbContext context, IConfiguration configuration) : IProfesionalRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    public async Task<ResultadoOperacion<int>> RegistrarAsync(
        RegistroProfesionalDto dto, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResultId>(
            "sp_RegistrarProfesional",
            new
            {
                dto.NombreCompleto,
                dto.Correo,
                dto.NumeroDocumento,
                Alias                   = dto.NombreCompleto.Split(' ')[0].ToLower(),
                dto.Celular,
                NumerTarjetaProfesional = dto.NumeroCedula,
                UrlDocumentoIdentidad   = dto.RutaPdfCedula,
                UrlTarjetaProfesional   = dto.RutaPdfTarjeta,
                dto.CiudadId,
                dto.Token,
                dto.Expiracion
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
            "SELECT COUNT(*) FROM TokenActivacion WHERE Token = @Token AND Usado = 0 AND FechaExpiracion > GETDATE()",
            new { Token = token });
        
        return count > 0;
    }

    public async Task<ResultadoOperacion> ConfirmarEmailAsync(
        string token, string passwordHash, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_ConfirmarEmailProfesional",
            new { Token = token, PasswordHash = passwordHash },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "Error al confirmar email.");
    }

    public async Task<Profesional?> ObtenerPorCorreoAsync(string correo, CancellationToken ct = default)
        => await context.Profesionales
                        .AsNoTracking()
                        .FirstOrDefaultAsync(p => p.Correo == correo, ct);

    public async Task<Profesional?> ObtenerPorIdAsync(int profesionalId, CancellationToken ct = default)
        => await context.Profesionales
                        .AsNoTracking()
                        .FirstOrDefaultAsync(p => p.ProfesionalId == profesionalId, ct);

    public async Task<ProfesionalDto?> ObtenerDtoAsync(int profesionalId, CancellationToken ct = default)
    {
        var p = await context.Profesionales
                             .AsNoTracking()
                             .FirstOrDefaultAsync(x => x.ProfesionalId == profesionalId, ct);
        if (p is null) return null;

        return new ProfesionalDto
        {
            ProfesionalId  = p.ProfesionalId,
            NombreCompleto = p.NombreCompleto,
            Correo         = p.Correo,
            FotoUrl        = p.FotoPerfil,
            Titulo         = p.Ocupacion,
            Descripcion    = p.SobreMi,
            TarifaCita     = p.ValorPorHora,
            Estado         = p.Estado
        };
    }

    public async Task<ResultadoOperacion> ActualizarAsync(
        ActualizarProfesionalDto dto, CancellationToken ct = default)
    {
        var profesional = await context.Profesionales
                                       .FirstOrDefaultAsync(p => p.ProfesionalId == dto.ProfesionalId, ct);
        if (profesional is null)
            return ResultadoOperacion.Fail("Profesional no encontrado.");

        profesional.NombreCompleto = dto.NombreCompleto;
        profesional.Ocupacion      = dto.Titulo;
        profesional.SobreMi        = dto.Descripcion;
        profesional.Celular        = dto.Celular;
        profesional.PaisId         = dto.PaisId;
        profesional.CiudadId       = dto.CiudadId;
        if (dto.AnosExperiencia.HasValue) profesional.AnosExperiencia = dto.AnosExperiencia;
        profesional.ValorPorHora   = dto.TarifaCita;
        if (dto.FotoUrl is not null) profesional.FotoPerfil = dto.FotoUrl;

        await context.SaveChangesAsync(ct);
        return ResultadoOperacion.Ok();
    }

    public async Task<DashboardProfesionalDto> ObtenerDashboardAsync(
        int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<DashboardProfesionalDto>(
            "sp_DashboardProfesional",
            new { ProfesionalId = profesionalId },
            commandType: CommandType.StoredProcedure);

        return result ?? new DashboardProfesionalDto();
    }

    public async Task<int> ContarSeguidoresAsync(int profesionalId, CancellationToken ct = default)
        => await context.Seguidores.AsNoTracking().CountAsync(s => s.ProfesionalId == profesionalId, ct);

    public async Task<IReadOnlyList<ProfesionalEstudioDto>> ObtenerEstudiosAsync(
        int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<ProfesionalEstudioDto>(
            @"SELECT EstudioId, Titulo, Universidad, AnoEgreso, Nivel
              FROM ProfesionalEstudio WHERE ProfesionalId = @ProfesionalId
              ORDER BY AnoEgreso DESC",
            new { ProfesionalId = profesionalId });
        return result.AsList();
    }

    public async Task<IReadOnlyList<string>> ObtenerEspecialidadesAsync(
        int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<string>(
            @"SELECT e.Nombre FROM ProfesionalEspecialidad pe
              JOIN Especialidad e ON e.EspecialidadId = pe.EspecialidadId
              WHERE pe.ProfesionalId = @ProfesionalId ORDER BY e.Nombre",
            new { ProfesionalId = profesionalId });
        return result.AsList();
    }

    public async Task<IReadOnlyList<string>> ObtenerIdiomasAsync(
        int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<string>(
            @"SELECT i.Nombre FROM ProfesionalIdioma pi
              JOIN Idioma i ON i.IdiomaId = pi.IdiomaId
              WHERE pi.ProfesionalId = @ProfesionalId ORDER BY i.Nombre",
            new { ProfesionalId = profesionalId });
        return result.AsList();
    }

    public async Task<PerfilProfesionalResumenDto> ObtenerResumenPerfilAsync(
        int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var resumen = await conn.QueryFirstOrDefaultAsync<PerfilProfesionalResumenDto>(
            @"SELECT
                (SELECT COUNT(*) FROM Seguidor WHERE ProfesionalId = @ProfesionalId) AS TotalSeguidores,
                (SELECT COUNT(*) FROM Sala WHERE ProfesionalId = @ProfesionalId) AS TotalSalas,
                (SELECT COUNT(*) FROM Sala WHERE ProfesionalId = @ProfesionalId AND Estado = 'Abierta') AS SalasAbiertas,
                (SELECT COUNT(*) FROM Sala WHERE ProfesionalId = @ProfesionalId AND Estado = 'Cerrada') AS SalasCerradas,
                (SELECT COUNT(*) FROM Sala s JOIN Evento e ON e.SalaId = s.SalaId
                 WHERE s.ProfesionalId = @ProfesionalId AND e.FechaInicio > GETDATE()) AS SalasProximas,
                (SELECT COUNT(*) FROM Cita WHERE ProfesionalId = @ProfesionalId
                 AND FechaHora >= GETDATE() AND Estado IN ('Programada','Movida')) AS CitasProximas,
                (SELECT COUNT(*) FROM Cita WHERE ProfesionalId = @ProfesionalId AND Estado = 'Programada') AS CitasPendientes,
                (SELECT COUNT(*) FROM Cita WHERE ProfesionalId = @ProfesionalId AND Estado = 'Finalizada') AS CitasCompletadas,
                (SELECT COUNT(*) FROM Cita WHERE ProfesionalId = @ProfesionalId AND Estado = 'Cancelada') AS CitasCanceladas,
                (SELECT COUNT(*) FROM Cita WHERE ProfesionalId = @ProfesionalId) AS CitasTotal,
                (SELECT ISNULL(SUM(pc.Monto),0) FROM PagoCita pc
                 JOIN Cita c ON c.CitaId = pc.CitaId
                 WHERE c.ProfesionalId = @ProfesionalId AND pc.Estado = 'Aprobado') AS IngresosTotal,
                (SELECT ISNULL(SUM(pc.Monto),0) FROM PagoCita pc
                 JOIN Cita c ON c.CitaId = pc.CitaId
                 WHERE c.ProfesionalId = @ProfesionalId AND pc.Estado = 'Aprobado'
                   AND YEAR(pc.FechaPago) = YEAR(GETDATE()) AND MONTH(pc.FechaPago) = MONTH(GETDATE())) AS IngresosMes,
                (SELECT COUNT(DISTINCT UsuarioId) FROM Cita WHERE ProfesionalId = @ProfesionalId) AS TotalPacientes",
            new { ProfesionalId = profesionalId });
        return resumen ?? new PerfilProfesionalResumenDto();
    }

    public async Task<ResultadoOperacion> AprobarAsync(
        int profesionalId, bool aprobado, string? motivoRechazo = null,
        CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_AprobarProfesional",
            new { ProfesionalId = profesionalId, Aprobado = aprobado, MotivoRechazo = motivoRechazo },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "Error al aprobar.");
    }

    public async Task<ResultadoOperacion> ReenviarDocumentosAsync(
        int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_ReenviarDocumentosProfesional",
            new { ProfesionalId = profesionalId },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "Error al reenviar documentos.");
    }

    private sealed class SpResult { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; }
    private sealed class SpResultId { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; public int Id { get; init; } }
}

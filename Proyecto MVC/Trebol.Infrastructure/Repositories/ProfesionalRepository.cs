using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Auth;
using Trebol.Model.DTOs.Dashboard;
using Trebol.Model.DTOs.PerfilOrador;
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
                dto.EspecialidadId,
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
        using var conn = CrearConexion();
        var perfil = await conn.QueryFirstOrDefaultAsync<ProfesionalDto>(
            @"SELECT p.ProfesionalId,
                     p.NombreCompleto,
                     p.Correo,
                     p.FotoPerfil AS FotoUrl,
                     p.Ocupacion AS Titulo,
                     p.SobreMi AS Descripcion,
                     p.AnosExperiencia,
                     p.ValorPorHora AS TarifaCita,
                     p.Estado,
                     ci.Nombre AS Ciudad,
                     (SELECT AVG(CAST(cp.Puntuacion AS FLOAT))
                      FROM   ComentarioProfesional cp
                      WHERE  cp.ProfesionalId = p.ProfesionalId AND cp.Estado = 1) AS Calificacion,
                     (SELECT COUNT(*) FROM Seguidor s WHERE s.ProfesionalId = p.ProfesionalId) AS TotalSeguidos
              FROM   Profesional p
              LEFT JOIN Ciudad ci ON ci.CiudadId = p.CiudadId
              WHERE  p.ProfesionalId = @ProfesionalId",
            new { ProfesionalId = profesionalId });

        if (perfil is null) return null;

        perfil.Especialidades = (await ObtenerEspecialidadesAsync(profesionalId, ct)).ToList();
        perfil.Idiomas        = (await ObtenerIdiomasAsync(profesionalId, ct)).ToList();
        return perfil;
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
        var detalle = await ObtenerIdiomasPerfilAsync(profesionalId, ct);
        return detalle
            .Select(i => string.IsNullOrWhiteSpace(i.Nivel)
                ? i.Nombre
                : $"{i.Nombre} — {EtiquetaNivelIdioma(i.Nivel)}")
            .ToList();
    }

    public async Task<IReadOnlyList<ProfesionalIdiomaPerfilDto>> ObtenerIdiomasPerfilAsync(
        int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<ProfesionalIdiomaPerfilDto>(
            @"SELECT pi.IdiomaId, i.Nombre, pi.Nivel
              FROM ProfesionalIdioma pi
              JOIN Idioma i ON i.IdiomaId = pi.IdiomaId
              WHERE pi.ProfesionalId = @ProfesionalId
              ORDER BY i.Nombre",
            new { ProfesionalId = profesionalId });
        return result.AsList();
    }

    public async Task<ResultadoOperacion<int>> CrearEstudioAsync(
        int profesionalId, GuardarEstudioDto dto, CancellationToken ct = default)
    {
        if (!EsNivelEstudioValido(dto.Nivel))
            return ResultadoOperacion<int>.Fail("Tipo de formación no válido.");

        using var conn = CrearConexion();
        var id = await conn.QuerySingleAsync<int>(
            @"INSERT INTO ProfesionalEstudio (ProfesionalId, Titulo, Universidad, AnoEgreso, Nivel)
              OUTPUT INSERTED.EstudioId
              VALUES (@ProfesionalId, @Titulo, @Universidad, @AnoEgreso, @Nivel)",
            new
            {
                ProfesionalId = profesionalId,
                dto.Titulo,
                dto.Universidad,
                dto.AnoEgreso,
                dto.Nivel
            });

        return ResultadoOperacion<int>.Ok(id);
    }

    public async Task<ResultadoOperacion> ActualizarEstudioAsync(
        int profesionalId, GuardarEstudioDto dto, CancellationToken ct = default)
    {
        if (!dto.EstudioId.HasValue || dto.EstudioId <= 0)
            return ResultadoOperacion.Fail("Estudio no indicado.");
        if (!EsNivelEstudioValido(dto.Nivel))
            return ResultadoOperacion.Fail("Tipo de formación no válido.");

        using var conn = CrearConexion();
        var filas = await conn.ExecuteAsync(
            @"UPDATE ProfesionalEstudio
              SET    Titulo = @Titulo,
                     Universidad = @Universidad,
                     AnoEgreso = @AnoEgreso,
                     Nivel = @Nivel
              WHERE  EstudioId = @EstudioId AND ProfesionalId = @ProfesionalId",
            new
            {
                dto.EstudioId,
                ProfesionalId = profesionalId,
                dto.Titulo,
                dto.Universidad,
                dto.AnoEgreso,
                dto.Nivel
            });

        return filas > 0
            ? ResultadoOperacion.Ok()
            : ResultadoOperacion.Fail("Formación académica no encontrada.");
    }

    public async Task<ResultadoOperacion> EliminarEstudioAsync(
        int profesionalId, int estudioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var filas = await conn.ExecuteAsync(
            @"DELETE FROM ProfesionalEstudio
              WHERE EstudioId = @EstudioId AND ProfesionalId = @ProfesionalId",
            new { EstudioId = estudioId, ProfesionalId = profesionalId });

        return filas > 0
            ? ResultadoOperacion.Ok()
            : ResultadoOperacion.Fail("Formación académica no encontrada.");
    }

    public async Task<ResultadoOperacion> GuardarIdiomaAsync(
        int profesionalId, GuardarIdiomaProfesionalDto dto, CancellationToken ct = default)
    {
        if (!EsNivelIdiomaValido(dto.Nivel))
            return ResultadoOperacion.Fail("Nivel de idioma no válido.");

        using var conn = CrearConexion();
        var existeIdioma = await conn.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Idioma WHERE IdiomaId = @IdiomaId",
            new { dto.IdiomaId });
        if (existeIdioma == 0)
            return ResultadoOperacion.Fail("Idioma no válido.");

        var vinculo = await conn.ExecuteScalarAsync<int>(
            @"SELECT COUNT(*) FROM ProfesionalIdioma
              WHERE ProfesionalId = @ProfesionalId AND IdiomaId = @IdiomaId",
            new { ProfesionalId = profesionalId, dto.IdiomaId });

        if (vinculo > 0)
        {
            await conn.ExecuteAsync(
                @"UPDATE ProfesionalIdioma SET Nivel = @Nivel
                  WHERE ProfesionalId = @ProfesionalId AND IdiomaId = @IdiomaId",
                new { ProfesionalId = profesionalId, dto.IdiomaId, dto.Nivel });
        }
        else
        {
            await conn.ExecuteAsync(
                @"INSERT INTO ProfesionalIdioma (ProfesionalId, IdiomaId, Nivel)
                  VALUES (@ProfesionalId, @IdiomaId, @Nivel)",
                new { ProfesionalId = profesionalId, dto.IdiomaId, dto.Nivel });
        }

        return ResultadoOperacion.Ok();
    }

    public async Task<ResultadoOperacion> EliminarIdiomaAsync(
        int profesionalId, int idiomaId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var filas = await conn.ExecuteAsync(
            @"DELETE FROM ProfesionalIdioma
              WHERE ProfesionalId = @ProfesionalId AND IdiomaId = @IdiomaId",
            new { ProfesionalId = profesionalId, IdiomaId = idiomaId });

        return filas > 0
            ? ResultadoOperacion.Ok()
            : ResultadoOperacion.Fail("Idioma no encontrado en tu perfil.");
    }

    private static bool EsNivelEstudioValido(string nivel)
        => nivel is "Pregrado" or "Posgrado" or "Maestria" or "Doctorado" or "Especializacion";

    private static bool EsNivelIdiomaValido(string nivel)
        => nivel is "Basico" or "Intermedio" or "Avanzado" or "Nativo";

    private static string EtiquetaNivelIdioma(string nivel) => nivel switch
    {
        "Basico"      => "Básico",
        "Intermedio"  => "Intermedio",
        "Avanzado"    => "Avanzado",
        "Nativo"      => "Nativo",
        _             => nivel
    };

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

    public async Task<IReadOnlyList<ComentarioPerfilDto>> ObtenerComentariosPublicosAsync(
        int profesionalId, int? usuarioActualId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var rows = await conn.QueryAsync<ComentarioPerfilDto>(
            @"SELECT cp.ComentarioId,
                     cp.UsuarioId,
                     u.NombreCompleto AS NombreUsuario,
                     cp.Texto AS Contenido,
                     cp.Puntuacion,
                     cp.FechaCreacion AS Fecha,
                     CASE WHEN @UsuarioActualId IS NOT NULL AND cp.UsuarioId = @UsuarioActualId THEN 1 ELSE 0 END AS EsPropio
              FROM   ComentarioProfesional cp
              JOIN   Usuario u ON u.UsuarioId = cp.UsuarioId
              WHERE  cp.ProfesionalId = @ProfesionalId AND cp.Estado = 1
              ORDER  BY cp.FechaCreacion DESC",
            new { ProfesionalId = profesionalId, UsuarioActualId = usuarioActualId });

        foreach (var c in rows)
            c.Iniciales = InicialesDe(c.NombreUsuario);

        return rows.AsList();
    }

    public async Task<ResumenComentariosPerfilDto> ObtenerResumenComentariosAsync(
        int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var resumen = await conn.QueryFirstOrDefaultAsync<ResumenComentariosPerfilDto>(
            @"SELECT ISNULL(AVG(CAST(Puntuacion AS FLOAT)), 0) AS Promedio,
                     COUNT(*) AS Total,
                     SUM(CASE WHEN Puntuacion = 5 THEN 1 ELSE 0 END) AS Estrellas5,
                     SUM(CASE WHEN Puntuacion = 4 THEN 1 ELSE 0 END) AS Estrellas4,
                     SUM(CASE WHEN Puntuacion = 3 THEN 1 ELSE 0 END) AS Estrellas3,
                     SUM(CASE WHEN Puntuacion = 2 THEN 1 ELSE 0 END) AS Estrellas2,
                     SUM(CASE WHEN Puntuacion = 1 THEN 1 ELSE 0 END) AS Estrellas1
              FROM   ComentarioProfesional
              WHERE  ProfesionalId = @ProfesionalId AND Estado = 1 AND Puntuacion IS NOT NULL",
            new { ProfesionalId = profesionalId });

        return resumen ?? new ResumenComentariosPerfilDto();
    }

    public async Task<ResultadoOperacion> CrearComentarioPublicoAsync(
        CrearComentarioPerfilDto dto, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Contenido))
            return ResultadoOperacion.Fail("Escribe un comentario antes de enviar.");
        if (dto.Puntuacion is < 1 or > 5)
            return ResultadoOperacion.Fail("Selecciona una calificación de 1 a 5 estrellas.");

        using var conn = CrearConexion();
        await conn.ExecuteAsync(
            @"INSERT INTO ComentarioProfesional (ProfesionalId, UsuarioId, Texto, Puntuacion, Estado)
              VALUES (@ProfesionalId, @UsuarioId, @Contenido, @Puntuacion, 1)",
            new { dto.ProfesionalId, dto.UsuarioId, dto.Contenido, dto.Puntuacion });

        return ResultadoOperacion.Ok("Comentario publicado.");
    }

    private static string InicialesDe(string nombre)
    {
        var partes = (nombre ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return string.Concat(partes.Take(2).Select(p => p.Length > 0 ? char.ToUpperInvariant(p[0]) : '?'));
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

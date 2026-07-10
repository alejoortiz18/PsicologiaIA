using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Cita;
using Trebol.Model.DTOs.Dashboard;
using Trebol.Model.DTOs.Sala;
using Trebol.Model.Models;

namespace Trebol.Infrastructure.Repositories;

public class CitaRepository(IConfiguration configuration) : ICitaRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    public async Task<ResultadoOperacion<int>> AgendarAsync(CrearCitaDto dto, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var fechaFin   = dto.FechaHora.AddMinutes(dto.DuracionMinutos);
        var result     = await conn.QueryFirstOrDefaultAsync<SpResultId>(
            "sp_AgendarCita",
            new
            {
                dto.UsuarioId,
                dto.ProfesionalClienteId,
                dto.ProfesionalId,
                dto.FechaHora,
                FechaHoraFin = fechaFin,
                Tipo         = dto.Tipo.ToString(),
                dto.Notas
            },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion<int>.Ok(result.Id)
            : ResultadoOperacion<int>.Fail(result?.Mensaje ?? "Error al agendar.");
    }

    public async Task<IReadOnlyList<CitaListaDto>> ObtenerPorUsuarioAsync(
        int usuarioId, string estado, int pagina, CancellationToken ct = default)
    {
        using var conn   = CrearConexion();
        var result = await conn.QueryAsync<CitaListaDto>(
            "sp_ObtenerCitasPorUsuario",
            new { UsuarioId = usuarioId, Estado = estado, Pagina = pagina },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<CitaListaDto>> ObtenerProximasPorUsuarioAsync(
        int usuarioId, int limite = 5, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<CitaListaDto>(
            "sp_ObtenerCitasProximasUsuario",
            new { UsuarioId = usuarioId, Limite = limite },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<CitaListaDto>> ObtenerActivasPorUsuarioAsync(
        int usuarioId, int pagina, int tamanoPagina = 10, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<CitaListaDto>(
            "sp_ObtenerCitasActivasUsuario",
            new { UsuarioId = usuarioId, Pagina = pagina, TamanoPagina = tamanoPagina },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<int> ContarActivasPorUsuarioAsync(int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.ExecuteScalarAsync<int>(
            "sp_ContarCitasActivasUsuario",
            new { UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<IReadOnlyList<CitaListaDto>> ObtenerPasadasPorUsuarioAsync(
        int usuarioId, int pagina, int tamanoPagina = 10, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<CitaListaDto>(
            "sp_ObtenerCitasPasadasUsuario",
            new { UsuarioId = usuarioId, Pagina = pagina, TamanoPagina = tamanoPagina },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<int> ContarPasadasPorUsuarioAsync(int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.ExecuteScalarAsync<int>(
            "sp_ContarCitasPasadasUsuario",
            new { UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<IReadOnlyList<CitaHoyProfesionalDto>> ObtenerHoyPorProfesionalAsync(
        int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<CitaHoyProfesionalDto>(
            "sp_ObtenerCitasHoyProfesional",
            new { ProfesionalId = profesionalId },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<CitaListaDto>> ObtenerPorProfesionalAsync(
        int profesionalId, string estado, int pagina, int tamanoPagina = 10, CancellationToken ct = default)
    {
        using var conn   = CrearConexion();
        var result = await conn.QueryAsync<CitaListaDto>(
            "sp_ObtenerCitasPorProfesional",
            new { ProfesionalId = profesionalId, Estado = estado, Pagina = pagina, TamanoPagina = tamanoPagina },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<int> ContarPorProfesionalAsync(
        int profesionalId, string estado, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.QueryFirstOrDefaultAsync<int>(
            @"SELECT COUNT(*) FROM Cita
              WHERE ProfesionalId = @ProfesionalId
                AND (@Estado = 'Todos' OR Estado = @Estado)",
            new { ProfesionalId = profesionalId, Estado = estado });
    }

    public async Task<CitaListaDto?> ObtenerDetalleAsync(int citaId, CancellationToken ct = default)
        => await ObtenerDetalleParaClienteAsync(citaId, null, null, ct);

    public async Task<CitaListaDto?> ObtenerDetalleParaClienteAsync(
        int citaId, int? usuarioId, int? profesionalClienteId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.QueryFirstOrDefaultAsync<CitaListaDto>(
            @"SELECT c.CitaId,
                     c.UsuarioId,
                     c.ProfesionalClienteId,
                     p.NombreCompleto AS NombreProfesional,
                     ISNULL(p.FotoPerfil,'') AS FotoProfesional,
                     COALESCE(u.Alias, pr.NombreCompleto, N'Cliente') AS AliasUsuario,
                     c.FechaHora,
                     DATEDIFF(MINUTE, c.FechaHora, c.FechaHoraFin) AS DuracionMinutos,
                     c.Tipo,
                     c.Estado,
                     ISNULL(p.ValorPorHora, 0) AS Monto
              FROM   Cita c
              JOIN   Profesional p ON p.ProfesionalId = c.ProfesionalId
              LEFT JOIN Usuario u ON u.UsuarioId = c.UsuarioId
              LEFT JOIN Profesional pr ON pr.ProfesionalId = c.ProfesionalClienteId
              WHERE  c.CitaId = @CitaId
                AND (
                      (@UsuarioId IS NULL AND @ProfesionalClienteId IS NULL)
                   OR (@UsuarioId IS NOT NULL AND c.UsuarioId = @UsuarioId)
                   OR (@ProfesionalClienteId IS NOT NULL AND c.ProfesionalClienteId = @ProfesionalClienteId)
                )",
            new { CitaId = citaId, UsuarioId = usuarioId, ProfesionalClienteId = profesionalClienteId });
    }

    public async Task<SalaCitaProfesionalDto?> ObtenerParaSalaProfesionalAsync(
        int citaId, int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.QueryFirstOrDefaultAsync<SalaCitaProfesionalDto>(
            @"SELECT c.CitaId,
                     c.UsuarioId,
                     c.ProfesionalId,
                     u.Alias AS AliasUsuario,
                     c.FechaHora,
                     c.FechaHoraFin,
                     DATEDIFF(MINUTE, c.FechaHora, c.FechaHoraFin) AS DuracionMinutos,
                     c.Tipo,
                     c.Estado,
                     (SELECT COUNT(*)
                      FROM   Cita cx
                      WHERE  cx.UsuarioId = c.UsuarioId
                        AND  cx.ProfesionalId = c.ProfesionalId
                        AND  cx.Estado = 'Finalizada') + 1 AS NumeroSesion,
                     CASE WHEN CAST(c.FechaHora AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END AS EsHoy,
                     rec.Contenido AS RecomendacionContenido,
                     rec.Fecha AS RecomendacionFecha
              FROM   Cita c
              JOIN   Usuario u ON u.UsuarioId = c.UsuarioId
              OUTER APPLY (
                  SELECT TOP 1 r.Contenido, r.Fecha
                  FROM   Recomendacion r
                  WHERE  r.CitaId = c.CitaId
                  ORDER  BY r.Fecha DESC
              ) rec
              WHERE  c.CitaId = @CitaId AND c.ProfesionalId = @ProfesionalId",
            new { CitaId = citaId, ProfesionalId = profesionalId });
    }

    public async Task<SalaCitaUsuarioDto?> ObtenerParaSalaUsuarioAsync(
        int citaId, int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.QueryFirstOrDefaultAsync<SalaCitaUsuarioDto>(
            @"SELECT c.CitaId,
                     c.UsuarioId,
                     c.ProfesionalId,
                     p.NombreCompleto AS NombreProfesional,
                     p.FotoPerfil AS FotoProfesional,
                     u.Alias AS AliasUsuario,
                     c.MostrarAlias,
                     c.FechaHora,
                     c.FechaHoraFin,
                     DATEDIFF(MINUTE, c.FechaHora, c.FechaHoraFin) AS DuracionMinutos,
                     c.Tipo,
                     c.Estado,
                     CASE WHEN CAST(c.FechaHora AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END AS EsHoy,
                     rec.Contenido AS RecomendacionContenido,
                     rec.Fecha AS RecomendacionFecha,
                     np.Contenido AS NotaPrivadaContenido,
                     np.FechaModificacion AS NotaPrivadaFecha
              FROM   Cita c
              JOIN   Usuario u ON u.UsuarioId = c.UsuarioId
              JOIN   Profesional p ON p.ProfesionalId = c.ProfesionalId
              LEFT JOIN CitaNotaPrivada np ON np.CitaId = c.CitaId AND np.UsuarioId = c.UsuarioId
              OUTER APPLY (
                  SELECT TOP 1 r.Contenido, r.Fecha
                  FROM   Recomendacion r
                  WHERE  r.CitaId = c.CitaId
                  ORDER  BY r.Fecha DESC
              ) rec
              WHERE  c.CitaId = @CitaId AND c.UsuarioId = @UsuarioId",
            new { CitaId = citaId, UsuarioId = usuarioId });
    }

    public async Task<ResultadoOperacion> ActualizarMostrarAliasAsync(
        int citaId, int usuarioId, bool mostrarAlias, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var rows = await conn.ExecuteAsync(
            @"UPDATE Cita
              SET    MostrarAlias = @MostrarAlias, FechaModificacion = GETDATE()
              WHERE  CitaId = @CitaId AND UsuarioId = @UsuarioId",
            new { CitaId = citaId, UsuarioId = usuarioId, MostrarAlias = mostrarAlias });

        return rows > 0
            ? ResultadoOperacion.Ok()
            : ResultadoOperacion.Fail("No se pudo actualizar la preferencia de privacidad.");
    }

    public async Task<ResultadoOperacion> FinalizarAsync(
        int citaId, int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var rows = await conn.ExecuteAsync(
            @"UPDATE Cita
              SET    Estado = 'Finalizada', FechaModificacion = GETDATE()
              WHERE  CitaId = @CitaId AND ProfesionalId = @ProfesionalId
                AND  Estado IN ('Programada','Movida')",
            new { CitaId = citaId, ProfesionalId = profesionalId });

        return rows > 0
            ? ResultadoOperacion.Ok("La sesión fue finalizada correctamente.")
            : ResultadoOperacion.Fail("La cita no fue encontrada.");
    }

    public async Task<ResultadoOperacion> CancelarAsync(
        int citaId, int solicitanteId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_CancelarCita",
            new { CitaId = citaId, SolicitanteId = solicitanteId },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "Error al cancelar.");
    }

    public async Task<IReadOnlyList<CitaSlotPublicoDto>> ObtenerSlotsPublicosAsync(
        int profesionalId, DateTime desde, DateTime hasta, CancellationToken ct = default)
    {
        var slots = await ObtenerSlotsCalendarioPublicoAsync(
            profesionalId, desde, hasta, null, null, ct);
        return slots
            .Where(s => s.TipoSlot == "CitaPrivada")
            .Select(s => new CitaSlotPublicoDto
            {
                FechaHora = s.FechaHora,
                DuracionMinutos = s.DuracionMinutos
            })
            .ToList();
    }

    public async Task<IReadOnlyList<CalendarioSlotDto>> ObtenerSlotsCalendarioPublicoAsync(
        int profesionalId,
        DateTime desde,
        DateTime hasta,
        int? viewerUsuarioId = null,
        int? viewerProfesionalId = null,
        CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<CalendarioSlotDto>(
            "sp_ObtenerSlotsCalendarioPublico",
            new
            {
                ProfesionalId = profesionalId,
                Desde = desde,
                Hasta = hasta,
                ViewerUsuarioId = viewerUsuarioId,
                ViewerProfesionalId = viewerProfesionalId
            },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<CalendarioSlotDto>> ObtenerSlotsCalendarioPropietarioAsync(
        int profesionalId,
        DateTime desde,
        DateTime hasta,
        CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<CalendarioSlotDto>(
            "sp_ObtenerSlotsCalendarioPropietario",
            new { ProfesionalId = profesionalId, Desde = desde, Hasta = hasta },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<CalendarioSlotDto>> ObtenerSlotsCalendarioUsuarioAsync(
        int usuarioId,
        DateTime desde,
        DateTime hasta,
        CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<CalendarioSlotDto>(
            "sp_ObtenerSlotsCalendarioUsuario",
            new { UsuarioId = usuarioId, Desde = desde, Hasta = hasta },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<ResultadoOperacion> GuardarRecomendacionAsync(
        int citaId, int profesionalId, string contenido, CancellationToken ct = default)
    {
        contenido = (contenido ?? string.Empty).Trim();
        if (contenido.Length == 0)
            return ResultadoOperacion.Fail("Escribe al menos una recomendación.");

        using var conn = CrearConexion();
        var cita = await conn.QueryFirstOrDefaultAsync<(int UsuarioId, int ProfesionalId)?>(
            @"SELECT c.UsuarioId, c.ProfesionalId
              FROM   Cita c
              WHERE  c.CitaId = @CitaId AND c.ProfesionalId = @ProfesionalId",
            new { CitaId = citaId, ProfesionalId = profesionalId });
        if (cita is null)
            return ResultadoOperacion.Fail("La cita no fue encontrada.");

        var existente = await conn.QueryFirstOrDefaultAsync<int?>(
            @"SELECT TOP 1 RecomendacionId
              FROM   Recomendacion
              WHERE  CitaId = @CitaId
              ORDER  BY Fecha DESC",
            new { CitaId = citaId });

        if (existente.HasValue)
        {
            await conn.ExecuteAsync(
                @"UPDATE Recomendacion
                  SET    Contenido = @Contenido, Fecha = GETDATE()
                  WHERE  RecomendacionId = @RecomendacionId",
                new { Contenido = contenido, RecomendacionId = existente.Value });
        }
        else
        {
            await conn.ExecuteAsync(
                @"INSERT INTO Recomendacion (CitaId, ProfesionalId, UsuarioId, Contenido, Fecha)
                  VALUES (@CitaId, @ProfesionalId, @UsuarioId, @Contenido, GETDATE())",
                new { CitaId = citaId, ProfesionalId = profesionalId, UsuarioId = cita.Value.UsuarioId, Contenido = contenido });
        }

        return ResultadoOperacion.Ok("Recomendaciones guardadas.");
    }

    public async Task<ResultadoOperacion> GuardarNotaPrivadaAsync(
        int citaId, int usuarioId, string contenido, CancellationToken ct = default)
    {
        contenido = contenido ?? string.Empty;

        using var conn = CrearConexion();
        var existe = await conn.QueryFirstOrDefaultAsync<int?>(
            @"SELECT CitaId FROM Cita WHERE CitaId = @CitaId AND UsuarioId = @UsuarioId",
            new { CitaId = citaId, UsuarioId = usuarioId });
        if (!existe.HasValue)
            return ResultadoOperacion.Fail("La cita no fue encontrada.");

        var rows = await conn.ExecuteAsync(
            @"MERGE CitaNotaPrivada AS target
              USING (SELECT @CitaId AS CitaId) AS source
              ON target.CitaId = source.CitaId
              WHEN MATCHED THEN
                  UPDATE SET Contenido = @Contenido, FechaModificacion = GETDATE(), UsuarioId = @UsuarioId
              WHEN NOT MATCHED THEN
                  INSERT (CitaId, UsuarioId, Contenido, FechaModificacion)
                  VALUES (@CitaId, @UsuarioId, @Contenido, GETDATE());",
            new { CitaId = citaId, UsuarioId = usuarioId, Contenido = contenido });

        return rows > 0
            ? ResultadoOperacion.Ok("Nota guardada.")
            : ResultadoOperacion.Fail("No se pudo guardar la nota.");
    }

    public async Task<IReadOnlyList<CitaMensajeDto>> ListarMensajesCitaAsync(
        int citaId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<CitaMensajeDto>(
            @"SELECT CitaMensajeId, CitaId, RemitenteTipo, AliasRemitente, Contenido, Fecha
              FROM   CitaMensaje
              WHERE  CitaId = @CitaId
              ORDER  BY Fecha ASC",
            new { CitaId = citaId });
        return result.AsList();
    }

    public async Task<ResultadoOperacion<CitaMensajeDto>> GuardarMensajeCitaAsync(
        int citaId, string remitenteTipo, int remitenteId, string aliasRemitente,
        string contenido, CancellationToken ct = default)
    {
        contenido = (contenido ?? string.Empty).Trim();
        if (contenido.Length == 0 || contenido.Length > 500)
            return ResultadoOperacion<CitaMensajeDto>.Fail("El mensaje debe tener entre 1 y 500 caracteres.");

        using var conn = CrearConexion();
        var id = await conn.QuerySingleAsync<int>(
            @"INSERT INTO CitaMensaje (CitaId, RemitenteTipo, RemitenteId, AliasRemitente, Contenido, Fecha)
              OUTPUT INSERTED.CitaMensajeId
              VALUES (@CitaId, @RemitenteTipo, @RemitenteId, @AliasRemitente, @Contenido, GETDATE())",
            new { CitaId = citaId, RemitenteTipo = remitenteTipo, RemitenteId = remitenteId, AliasRemitente = aliasRemitente, Contenido = contenido });

        var dto = await conn.QueryFirstAsync<CitaMensajeDto>(
            @"SELECT CitaMensajeId, CitaId, RemitenteTipo, AliasRemitente, Contenido, Fecha
              FROM   CitaMensaje WHERE CitaMensajeId = @Id",
            new { Id = id });

        return ResultadoOperacion<CitaMensajeDto>.Ok(dto);
    }

    public async Task<string?> ObtenerAliasEmisorCitaAsync(
        int citaId, int remitenteId, string remitenteTipo, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        if (remitenteTipo == "Profesional")
        {
            return await conn.QueryFirstOrDefaultAsync<string?>(
                @"SELECT p.NombreCompleto
                  FROM   Cita c
                  JOIN   Profesional p ON p.ProfesionalId = c.ProfesionalId
                  WHERE  c.CitaId = @CitaId AND c.ProfesionalId = @RemitenteId",
                new { CitaId = citaId, RemitenteId = remitenteId });
        }

        return await conn.QueryFirstOrDefaultAsync<string?>(
            @"SELECT CASE WHEN c.MostrarAlias = 1 THEN u.Alias ELSE u.NombreCompleto END
              FROM   Cita c
              JOIN   Usuario u ON u.UsuarioId = c.UsuarioId
              WHERE  c.CitaId = @CitaId AND c.UsuarioId = @RemitenteId",
            new { CitaId = citaId, RemitenteId = remitenteId });
    }

    private sealed class SpResult { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; }
    private sealed class SpResultId { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; public int Id { get; init; } }
}

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
                dto.ProfesionalId,
                dto.FechaHora,
                FechaHoraFin = fechaFin,
                Tipo         = dto.Tipo.ToString()
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
    {
        using var conn = CrearConexion();
        return await conn.QueryFirstOrDefaultAsync<CitaListaDto>(
            @"SELECT c.CitaId,
                     p.NombreCompleto AS NombreProfesional,
                     ISNULL(p.FotoPerfil,'') AS FotoProfesional,
                     u.Alias AS AliasUsuario,
                     c.FechaHora,
                     DATEDIFF(MINUTE, c.FechaHora, c.FechaHoraFin) AS DuracionMinutos,
                     c.Tipo,
                     c.Estado,
                     ISNULL(pc.Monto, ISNULL(p.ValorPorHora, 0)) AS Monto
              FROM   Cita c
              JOIN   Profesional p ON p.ProfesionalId = c.ProfesionalId
              JOIN   Usuario u ON u.UsuarioId = c.UsuarioId
              LEFT JOIN PagoCita pc ON pc.CitaId = c.CitaId AND pc.Estado = 'Aprobado'
              WHERE  c.CitaId = @CitaId",
            new { CitaId = citaId });
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
                     CASE WHEN CAST(c.FechaHora AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END AS EsHoy
              FROM   Cita c
              JOIN   Usuario u ON u.UsuarioId = c.UsuarioId
              WHERE  c.CitaId = @CitaId AND c.ProfesionalId = @ProfesionalId",
            new { CitaId = citaId, ProfesionalId = profesionalId });
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

    private sealed class SpResult { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; }
    private sealed class SpResultId { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; public int Id { get; init; } }
}

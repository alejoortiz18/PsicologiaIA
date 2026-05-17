using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Cita;
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

    public async Task<IReadOnlyList<CitaListaDto>> ObtenerPorProfesionalAsync(
        int profesionalId, string estado, int pagina, CancellationToken ct = default)
    {
        using var conn   = CrearConexion();
        var result = await conn.QueryAsync<CitaListaDto>(
            "sp_ObtenerCitasPorProfesional",
            new { ProfesionalId = profesionalId, Estado = estado, Pagina = pagina },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<CitaListaDto?> ObtenerDetalleAsync(int citaId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var items = await conn.QueryAsync<CitaListaDto>(
            "sp_ObtenerCitasPorUsuario",
            new { UsuarioId = 0, Estado = "Todos", Pagina = 1 },
            commandType: CommandType.StoredProcedure);
        // Fallback: buscar por SP usuario con CitaId
        return items.FirstOrDefault(c => c.CitaId == citaId);
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

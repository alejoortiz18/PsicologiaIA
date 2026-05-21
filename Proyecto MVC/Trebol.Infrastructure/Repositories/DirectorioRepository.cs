using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Directorio;
using Trebol.Model.Models;

namespace Trebol.Infrastructure.Repositories;

public class DirectorioRepository(IConfiguration configuration) : IDirectorioRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    public async Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerEspecialistasAsync(
        FiltroDirectorioDto filtro, int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<ProfesionalDirectorioDto>(
            "sp_ObtenerDirectorio",
            new
            {
                TipoBusqueda = "Todos",
                Especialidad = filtro.Especialidad,
                Ciudad       = filtro.Ciudad,
                UsuarioId    = usuarioId,
                Pagina       = filtro.Pagina,
                TamanoPagina = filtro.TamanioPagina
            },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerPsicologosAsync(
        FiltroDirectorioDto filtro, int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<ProfesionalDirectorioDto>(
            "sp_ObtenerDirectorio",
            new
            {
                TipoBusqueda = "Psicologos",
                Especialidad = filtro.Especialidad,
                Ciudad       = filtro.Ciudad,
                UsuarioId    = usuarioId,
                Pagina       = filtro.Pagina,
                TamanoPagina = filtro.TamanioPagina
            },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerMisMentoresAsync(
        int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<ProfesionalDirectorioDto>(
            "sp_ObtenerMisMentores",
            new { UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerMisColegasAsync(
        int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<ProfesionalDirectorioDto>(
            "sp_ObtenerMisColegas",
            new { ProfesionalId = profesionalId },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<ResultadoOperacion> ToggleSeguirAsync(
        int usuarioId, int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_ToggleSeguir",
            new { UsuarioId = usuarioId, ProfesionalId = profesionalId },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "Error.");
    }

    public async Task<ResultadoOperacion> ToggleColegaAsync(
        int solicitanteId, int receptorId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResult>(
            "sp_ToggleColega",
            new { SolicitanteId = solicitanteId, ReceptorId = receptorId },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion.Ok(result.Mensaje)
            : ResultadoOperacion.Fail(result?.Mensaje ?? "Error.");
    }

    private sealed class SpResult { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; }
}

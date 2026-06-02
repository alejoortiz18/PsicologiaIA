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

    public Task<DirectorioPaginadoDto> ObtenerMedicosAsync(
        FiltroDirectorioDto filtro, int? usuarioSeguidorId, int? excluirProfesionalId, CancellationToken ct = default)
        => ObtenerPaginadoAsync("Medicos", filtro, usuarioSeguidorId, excluirProfesionalId, ct);

    public Task<DirectorioPaginadoDto> ObtenerPsicologosAsync(
        FiltroDirectorioDto filtro, int? usuarioSeguidorId, int? excluirProfesionalId, CancellationToken ct = default)
        => ObtenerPaginadoAsync("Psicologos", filtro, usuarioSeguidorId, excluirProfesionalId, ct);

    private async Task<DirectorioPaginadoDto> ObtenerPaginadoAsync(
        string tipoBusqueda, FiltroDirectorioDto filtro, int? usuarioSeguidorId, int? excluirProfesionalId, CancellationToken ct)
    {
        using var conn = CrearConexion();
        var param = new
        {
            TipoBusqueda         = tipoBusqueda,
            Especialidad         = filtro.Especialidad,
            Ciudad               = filtro.Ciudad,
            UsuarioId            = usuarioSeguidorId,
            ExcluirProfesionalId = excluirProfesionalId,
            Pagina               = filtro.Pagina,
            TamanoPagina         = filtro.TamanioPagina
        };

        var filas = await conn.QueryAsync<ProfesionalDirectorioRow>(
            "sp_ObtenerDirectorio",
            param,
            commandType: CommandType.StoredProcedure);

        var total = await conn.QueryFirstOrDefaultAsync<int>(
            "sp_ContarDirectorio",
            new
            {
                param.TipoBusqueda,
                param.Especialidad,
                param.Ciudad,
                param.UsuarioId,
                param.ExcluirProfesionalId
            },
            commandType: CommandType.StoredProcedure);

        return new DirectorioPaginadoDto
        {
            Items = filas.Select(Map).ToList(),
            TotalRegistros = total
        };
    }

    public async Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerMisMentoresAsync(
        int usuarioId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var filas = await conn.QueryAsync<ProfesionalDirectorioRow>(
            "sp_ObtenerMisMentores",
            new { UsuarioId = usuarioId },
            commandType: CommandType.StoredProcedure);
        return filas.Select(Map).ToList();
    }

    public async Task<bool> EsSeguidorAsync(int usuarioId, int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.ExecuteScalarAsync<bool>(
            """
            SELECT CASE WHEN EXISTS (
                SELECT 1 FROM Seguidor
                WHERE UsuarioId = @UsuarioId AND ProfesionalId = @ProfesionalId)
            THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END
            """,
            new { UsuarioId = usuarioId, ProfesionalId = profesionalId });
    }

    public async Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerMisColegasAsync(
        int profesionalId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var filas = await conn.QueryAsync<ProfesionalDirectorioRow>(
            "sp_ObtenerMisColegas",
            new { ProfesionalId = profesionalId },
            commandType: CommandType.StoredProcedure);
        return filas.Select(Map).ToList();
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

    private static ProfesionalDirectorioDto Map(ProfesionalDirectorioRow row) => new()
    {
        ProfesionalId  = row.ProfesionalId,
        NombreCompleto = row.NombreCompleto,
        FotoUrl        = row.FotoUrl,
        Titulo         = row.Titulo,
        Ciudad         = row.Ciudad,
        Calificacion   = row.Calificacion,
        TotalSeguidos  = row.TotalSeguidos,
        EsSeguido      = row.EsSeguido,
        SobreMi          = row.SobreMi,
        TipoProfesional  = row.TipoProfesional,
        Especialidades   = ParseEspecialidades(row.EspecialidadesTexto),
        UltimaCita       = row.UltimaCita,
        TotalCitas       = row.TotalCitas
    };

    private static List<string> ParseEspecialidades(string? texto)
        => string.IsNullOrWhiteSpace(texto)
            ? []
            : texto.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries).ToList();

    private sealed class SpResult { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; }

    private sealed class ProfesionalDirectorioRow
    {
        public int      ProfesionalId  { get; init; }
        public string   NombreCompleto { get; init; } = "";
        public string?  FotoUrl        { get; init; }
        public string?  Titulo         { get; init; }
        public string?  SobreMi        { get; init; }
        public string?  TipoProfesional { get; init; }
        public string?  Ciudad         { get; init; }
        public double?  Calificacion   { get; init; }
        public int      TotalSeguidos  { get; init; }
        public bool     EsSeguido      { get; init; }
        public string?  EspecialidadesTexto { get; init; }
        public DateTime? UltimaCita { get; init; }
        public int       TotalCitas { get; init; }
    }
}

using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Publico;

namespace Trebol.Infrastructure.Repositories;

public class LandingRepository(IConfiguration configuration) : ILandingRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    public async Task<EstadisticasLandingDto> ObtenerEstadisticasAsync(CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<EstadisticasLandingDto>(
            "sp_ObtenerEstadisticasLanding",
            commandType: CommandType.StoredProcedure);
        return result ?? new EstadisticasLandingDto();
    }

    public async Task<IReadOnlyList<EspecialidadConteoDto>> ObtenerEspecialidadesConConteoAsync(
        CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<EspecialidadConteoDto>(
            "sp_ObtenerEspecialidadesConConteo",
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<EventoPublicoDto>> ObtenerEventosDestacadosAsync(
        int limite = 3, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<EventoPublicoDto>(
            "sp_ObtenerEventosDestacados",
            new { Limite = limite },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<ProfesionalTickerDto>> ObtenerTickerProfesionalesAsync(
        int limite = 6, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<ProfesionalTickerDto>(
            "sp_ObtenerProfesionalesTicker",
            new { Limite = limite },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }
}

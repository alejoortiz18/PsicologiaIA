using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Mensajeria;
using Trebol.Model.Models;

namespace Trebol.Infrastructure.Repositories;

public class MensajeriaRepository(IConfiguration configuration) : IMensajeriaRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    public async Task<ResultadoOperacion<int>> EnviarMensajeAsync(
        int autorId, string tipoAutor, int destinoId, string tipoDestino,
        string texto, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResultId>(
            "sp_EnviarMensaje",
            new { AutorId = autorId, TipoAutor = tipoAutor, DestinoId = destinoId, TipoDestino = tipoDestino, Texto = texto },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion<int>.Ok(result.Id)
            : ResultadoOperacion<int>.Fail(result?.Mensaje ?? "Error al enviar mensaje.");
    }

    public async Task<IReadOnlyList<ConversacionDto>> ObtenerConversacionesAsync(
        int entidadId, string tipoEntidad, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<ConversacionDto>(
            "sp_ObtenerConversaciones",
            new { EntidadId = entidadId, TipoEntidad = tipoEntidad },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<IReadOnlyList<MensajePrivadoDto>> ObtenerMensajesAsync(
        int conversacionId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<MensajePrivadoDto>(
            "sp_ObtenerMensajesConversacion",
            new { ConversacionId = conversacionId },
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task MarcarLeidosAsync(
        int conversacionId, int lectorId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        await conn.ExecuteAsync(
            "sp_MarcarMensajesLeidos",
            new { ConversacionId = conversacionId, LectorId = lectorId },
            commandType: CommandType.StoredProcedure);
    }

    private sealed class SpResultId { public bool Exito { get; init; } public string Mensaje { get; init; } = ""; public int Id { get; init; } }
}

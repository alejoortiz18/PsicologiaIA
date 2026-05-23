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

    public async Task<ResultadoOperacion<EnviarMensajeResultadoDto>> EnviarMensajeAsync(
        int autorId, string tipoAutor, int destinoId, string tipoDestino,
        string texto, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryFirstOrDefaultAsync<SpResultEnviar>(
            "sp_EnviarMensaje",
            new { AutorId = autorId, TipoAutor = tipoAutor, DestinoId = destinoId, TipoDestino = tipoDestino, Texto = texto },
            commandType: CommandType.StoredProcedure);

        return result?.Exito == true
            ? ResultadoOperacion<EnviarMensajeResultadoDto>.Ok(new EnviarMensajeResultadoDto
            {
                MensajeId      = result.Id,
                ConversacionId = result.ConversacionId
            }, result.Mensaje)
            : ResultadoOperacion<EnviarMensajeResultadoDto>.Fail(result?.Mensaje ?? "Error al enviar mensaje.");
    }

    public async Task<MensajePrivadoDto?> ObtenerMensajePorIdAsync(int mensajeId, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        return await conn.QueryFirstOrDefaultAsync<MensajePrivadoDto>(
            @"SELECT mp.MensajePrivadoId AS MensajeId,
                     mp.ConversacionId,
                     mp.TipoAutor AS EmisorTipo,
                     mp.AutorId AS EmisorId,
                     mp.Texto AS Contenido,
                     mp.FechaCreacion AS FechaEnvio,
                     mp.Leido
              FROM   MensajePrivado mp
              WHERE  mp.MensajePrivadoId = @MensajeId",
            new { MensajeId = mensajeId });
    }

    public async Task<bool> EsParticipanteConversacionAsync(
        int conversacionId, int entidadId, string tipoEntidad, CancellationToken ct = default)
    {
        var destino = await ObtenerDestinoConversacionAsync(conversacionId, entidadId, tipoEntidad, ct);
        return destino is not null;
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
        int conversacionId, int lectorId, string tipoLector, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        await conn.ExecuteAsync(
            "sp_MarcarMensajesLeidos",
            new { ConversacionId = conversacionId, LectorId = lectorId, TipoLector = tipoLector },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<(int destinoId, string tipoDestino)?> ObtenerDestinoConversacionAsync(
        int conversacionId, int entidadId, string tipoEntidad, CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var row = await conn.QueryFirstOrDefaultAsync<DestinoRow>(
            "sp_ObtenerDestinoConversacion",
            new { ConversacionId = conversacionId, EntidadId = entidadId, TipoEntidad = tipoEntidad },
            commandType: CommandType.StoredProcedure);
        return row is null ? null : (row.DestinoId, row.TipoDestino);
    }

    private sealed class DestinoRow
    {
        public int    DestinoId   { get; init; }
        public string TipoDestino { get; init; } = "";
    }

    private sealed class SpResultEnviar
    {
        public bool Exito { get; init; }
        public string Mensaje { get; init; } = "";
        public int Id { get; init; }
        public int ConversacionId { get; init; }
    }
}

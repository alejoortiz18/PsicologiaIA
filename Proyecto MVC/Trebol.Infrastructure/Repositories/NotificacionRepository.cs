using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Admin;
using Trebol.Model.Entities.TrebolEntities;
using Trebol.Model.Models;

namespace Trebol.Infrastructure.Repositories;

public class NotificacionRepository(AppDbContext context, IConfiguration configuration) : INotificacionRepository
{
    private IDbConnection CrearConexion()
        => new SqlConnection(configuration.GetConnectionString("TrebolDB"));

    public async Task<IReadOnlyList<NotificacionDto>> ObtenerPendientesAdminAsync(CancellationToken ct = default)
    {
        using var conn = CrearConexion();
        var result = await conn.QueryAsync<NotificacionDto>(
            "sp_ObtenerNotificacionesPendientes",
            commandType: CommandType.StoredProcedure);
        return result.AsList();
    }

    public async Task<ResultadoOperacion> MarcarLeidaAsync(int notificacionId, CancellationToken ct = default)
    {
        var n = await context.Notificaciones.FirstOrDefaultAsync(x => x.NotificacionId == notificacionId, ct);
        if (n is null) return ResultadoOperacion.Fail("Notificación no encontrada.");
        n.Leida  = true;
        n.Estado = "Leida";
        await context.SaveChangesAsync(ct);
        return ResultadoOperacion.Ok();
    }

    public async Task<ResultadoOperacion> MarcarTodasLeidasAsync(CancellationToken ct = default)
    {
        await context.Notificaciones
                     .Where(n => !n.Leida)
                     .ExecuteUpdateAsync(s => s
                         .SetProperty(n => n.Leida,  true)
                         .SetProperty(n => n.Estado, "Leida"), ct);
        return ResultadoOperacion.Ok();
    }

    public async Task<ResultadoOperacion> CrearAsync(
        string destinatarioTipo, int destinatarioId, string tipo,
        string titulo, string mensaje, string? entidadTipo = null,
        int? entidadId = null, CancellationToken ct = default)
    {
        context.Notificaciones.Add(new Notificacion
        {
            Tipo        = tipo,
            EntidadId   = entidadId,
            Titulo      = titulo,
            Descripcion = mensaje,
            Estado      = "Pendiente",
            Leida       = false
        });
        await context.SaveChangesAsync(ct);
        return ResultadoOperacion.Ok();
    }
}

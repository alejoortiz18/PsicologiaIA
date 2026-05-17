using Microsoft.EntityFrameworkCore;
using Trebol.Domain.Interfaces;
using Trebol.Model.Entities.TrebolEntities;
using Trebol.Model.Models;

namespace Trebol.Infrastructure.Repositories;

public class CalendarioRepository(AppDbContext context) : ICalendarioRepository
{
    public async Task<IReadOnlyList<HorarioDisponible>> ObtenerDisponibilidadAsync(
        int profesionalId, CancellationToken ct = default)
        => await context.HorariosDisponibles
                        .AsNoTracking()
                        .Where(h => h.ProfesionalId == profesionalId)
                        .ToListAsync(ct);

    public async Task<ResultadoOperacion> GuardarDisponibilidadAsync(
        int profesionalId, IEnumerable<HorarioDisponible> horarios, CancellationToken ct = default)
    {
        var existentes = context.HorariosDisponibles.Where(h => h.ProfesionalId == profesionalId);
        context.HorariosDisponibles.RemoveRange(existentes);

        foreach (var horario in horarios)
        {
            horario.ProfesionalId = profesionalId;
            context.HorariosDisponibles.Add(horario);
        }

        await context.SaveChangesAsync(ct);
        return ResultadoOperacion.Ok();
    }

    public async Task<ResultadoOperacion> BloquearHorarioAsync(
        int profesionalId, DateTime inicio, DateTime fin, string? motivo, CancellationToken ct = default)
    {
        context.HorariosBloqueados.Add(new HorarioBloqueado
        {
            ProfesionalId   = profesionalId,
            FechaHoraInicio = inicio,
            FechaHoraFin    = fin,
            Motivo          = motivo
        });
        await context.SaveChangesAsync(ct);
        return ResultadoOperacion.Ok();
    }

    public async Task<ResultadoOperacion> DesbloquearHorarioAsync(
        int bloqueoId, int profesionalId, CancellationToken ct = default)
    {
        var bloqueo = await context.HorariosBloqueados
                                   .FirstOrDefaultAsync(b => b.BloqueoId == bloqueoId
                                                          && b.ProfesionalId == profesionalId, ct);
        if (bloqueo is null) return ResultadoOperacion.Fail("Bloqueo no encontrado.");

        context.HorariosBloqueados.Remove(bloqueo);
        await context.SaveChangesAsync(ct);
        return ResultadoOperacion.Ok();
    }

    public async Task<IReadOnlyList<HorarioBloqueado>> ObtenerBloqueosAsync(
        int profesionalId, CancellationToken ct = default)
        => await context.HorariosBloqueados
                        .AsNoTracking()
                        .Where(b => b.ProfesionalId == profesionalId)
                        .ToListAsync(ct);
}

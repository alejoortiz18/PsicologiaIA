namespace Trebol.Web.Helpers;

/// <summary>Estado temporal de un evento público para inscripción y badges.</summary>
public readonly record struct EventoVigenciaEstado(
    bool YaPaso,
    bool EnVivo,
    bool EsFinalizada,
    bool PuedeInscribirse,
    string BadgeText,
    string BadgeClass,
    bool MostrarBadgeDot);

public static class EventoVigenciaHelper
{
    public static EventoVigenciaEstado Evaluar(
        DateTime? fechaInicio,
        DateTime? fechaFin,
        string? estadoSala,
        bool esInscrito,
        int cuposRestantes)
    {
        var ahora = DateTime.Now;
        var cerrada = string.Equals(estadoSala, "Cerrada", StringComparison.OrdinalIgnoreCase);

        var yaPaso = cerrada
            || (fechaFin.HasValue && fechaFin.Value < ahora)
            || (fechaInicio.HasValue && fechaInicio.Value < ahora);

        var enVivo = !yaPaso
            && fechaInicio.HasValue
            && fechaInicio.Value <= ahora
            && (!fechaFin.HasValue || fechaFin.Value >= ahora)
            && !cerrada;

        var esFinalizada = yaPaso;
        var sinCupos = !esInscrito && cuposRestantes <= 0;
        var puedeInscribirse = !esInscrito && !sinCupos && !yaPaso && !cerrada;

        string badgeText;
        string badgeClass;
        bool dot;

        if (yaPaso)
        {
            badgeText = "Ya pasó";
            badgeClass = "badge-muted";
            dot = false;
        }
        else if (enVivo)
        {
            badgeText = "En vivo";
            badgeClass = "badge-success";
            dot = true;
        }
        else if (sinCupos)
        {
            badgeText = "Sin cupos";
            badgeClass = "badge-muted";
            dot = false;
        }
        else if (cuposRestantes > 0 && cuposRestantes <= 10)
        {
            badgeText = "Cerrada pronto";
            badgeClass = "badge-muted";
            dot = false;
        }
        else
        {
            badgeText = "Abierta";
            badgeClass = "badge-success";
            dot = true;
        }

        return new EventoVigenciaEstado(yaPaso, enVivo, esFinalizada, puedeInscribirse, badgeText, badgeClass, dot);
    }

    public static bool PermiteInscripcion(DateTime? fechaInicio, DateTime? fechaFin, string? estadoSala)
        => Evaluar(fechaInicio, fechaFin, estadoSala, esInscrito: false, cuposRestantes: 1).PuedeInscribirse;
}

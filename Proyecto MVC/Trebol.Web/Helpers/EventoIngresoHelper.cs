using Trebol.Model.DTOs.Sala;
using Trebol.Model.Enums;

namespace Trebol.Web.Helpers;

public enum EstadoIngresoEvento
{
    NoInscrito,
    EventoFinalizado,
    MuyTemprano,
    Permitido
}

public static class EventoIngresoHelper
{
    public const int MinutosAntesIngreso = 3;

    public static DateTime? FinEfectivo(DateTime? fechaInicio, DateTime? fechaFin)
    {
        if (!fechaInicio.HasValue) return fechaFin;
        return SalaVigenciaHelper.FinEfectivoEvento(new SalaDto
        {
            FechaInicio = fechaInicio,
            FechaFin    = fechaFin
        });
    }

    public static DateTime? FinEfectivoConExtra(DateTime? fechaInicio, DateTime? fechaFin, int minutosExtra)
    {
        var fin = FinEfectivo(fechaInicio, fechaFin);
        if (!fin.HasValue) return null;
        return fin.Value.AddMinutes(Math.Max(0, minutosExtra));
    }

    public static bool EventoFinalizado(DateTime? fechaInicio, DateTime? fechaFin, string? estadoSala)
    {
        if (string.Equals(estadoSala, "Cerrada", StringComparison.OrdinalIgnoreCase))
            return true;
        var fin = FinEfectivo(fechaInicio, fechaFin);
        return fin.HasValue && fin.Value < DateTime.Now;
    }

    public static EstadoIngresoEvento EvaluarIngreso(
        bool esInscrito,
        DateTime? fechaInicio,
        DateTime? fechaFin,
        string? estadoSala)
    {
        if (!esInscrito)
            return EstadoIngresoEvento.NoInscrito;

        if (EventoFinalizado(fechaInicio, fechaFin, estadoSala))
            return EstadoIngresoEvento.EventoFinalizado;

        if (!fechaInicio.HasValue)
            return EstadoIngresoEvento.Permitido;

        var minutosRestantes = (fechaInicio.Value - DateTime.Now).TotalMinutes;
        if (minutosRestantes > MinutosAntesIngreso)
            return EstadoIngresoEvento.MuyTemprano;

        return EstadoIngresoEvento.Permitido;
    }

    public static bool MostrarBotonIngresar(bool esInscrito, DateTime? fechaInicio, DateTime? fechaFin, string? estadoSala)
        => esInscrito && !EventoFinalizado(fechaInicio, fechaFin, estadoSala);
}

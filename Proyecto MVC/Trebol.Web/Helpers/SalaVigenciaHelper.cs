using Trebol.Model.DTOs.Sala;
using Trebol.Model.Enums;

namespace Trebol.Web.Helpers;

public static class SalaVigenciaHelper
{
  private const int DuracionDefaultMinutos = 120;
  private const int DuracionMinMinutos = 15;
  private const int DuracionMaxMinutos = 480;

  /// <summary>
  /// Fin real de la sesión: FechaFin si la duración es coherente (15–480 min);
  /// si no (p. ej. ventana legacy +30 días), inicio + 2 h.
  /// </summary>
  public static DateTime? FinEfectivoEvento(SalaDto sala)
  {
    if (!sala.FechaInicio.HasValue)
      return sala.FechaFin;

    if (!sala.FechaFin.HasValue)
      return sala.FechaInicio.Value.AddMinutes(DuracionDefaultMinutos);

    var minutos = (sala.FechaFin.Value - sala.FechaInicio.Value).TotalMinutes;
    if (minutos is >= DuracionMinMinutos and <= DuracionMaxMinutos)
      return sala.FechaFin;

    return sala.FechaInicio.Value.AddMinutes(DuracionDefaultMinutos);
  }

  public static bool EventoFinalizado(SalaDto sala)
  {
    var fin = FinEfectivoEvento(sala);
    return fin.HasValue && fin.Value < DateTime.Now;
  }

  public static EstadoSala EstadoEfectivo(SalaDto sala)
  {
    if (sala.Estado == EstadoSala.Cerrada)
      return EstadoSala.Cerrada;
    if (EventoFinalizado(sala))
      return EstadoSala.Cerrada;
    return sala.Estado;
  }

  public static string EtiquetaEstado(EstadoSala estado)
    => estado == EstadoSala.Abierta ? "Abierta" : "Cerrada";

  public static string ClaseBadge(EstadoSala estado)
    => estado == EstadoSala.Abierta ? "badge-success" : "badge-muted";
}

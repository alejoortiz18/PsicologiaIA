using Trebol.Model.DTOs.Cita;
using Trebol.Model.Enums;

namespace Trebol.Web.Helpers;

/// <summary>Etiquetas del calendario en es-CO y formato de hora 12h (reglas UI).</summary>
public static class CalendarioSlotPresentacion
{
    public enum ModoVista
    {
        Publico,
        Propietario,
        Usuario
    }

    public static IReadOnlyList<CalendarioSlotDto> Formatear(
        IReadOnlyList<CalendarioSlotDto> slots,
        ModoVista modo = ModoVista.Publico)
    {
        foreach (var s in slots)
        {
            if (s.TipoSlot == "CitaPrivada")
                FormatearCitaPrivada(s, modo);
            else if (s.TipoSlot == "EventoPublico")
                FormatearEventoPublico(s, modo);
        }

        return slots;
    }

    private static void FormatearCitaPrivada(CalendarioSlotDto s, ModoVista modo)
    {
        if (modo == ModoVista.Usuario)
        {
            var fin = s.FechaHora.AddMinutes(s.DuracionMinutos);
            var seguimiento = string.Equals(s.TipoCita, "Seguimiento", StringComparison.OrdinalIgnoreCase);
            var tipo = seguimiento ? "Acompañamiento" : "Asesoría";
            s.Etiqueta = string.IsNullOrWhiteSpace(s.NombreCliente) ? "Cita privada" : s.NombreCliente.Trim();
            s.Subtitulo = $"{tipo} · {FormatearHora12(s.FechaHora)} - {FormatearHora12(fin)} · {FormatearEstado(s.EstadoCita)}";
            s.EsDetalleVisible = true;
            return;
        }

        if (modo == ModoVista.Propietario)
        {
            var fin = s.FechaHora.AddMinutes(s.DuracionMinutos);
            var tipo = CitaTipoHelper.Etiqueta(
                string.Equals(s.TipoCita, "Seguimiento", StringComparison.OrdinalIgnoreCase)
                    ? TipoCita.Seguimiento
                    : TipoCita.Asesoria);
            var cliente = string.IsNullOrWhiteSpace(s.NombreCliente) ? null : s.NombreCliente.Trim();
            s.Etiqueta = tipo;
            s.Subtitulo = cliente is not null
                ? $"{cliente} · {FormatearHora12(s.FechaHora)} - {FormatearHora12(fin)} · {FormatearEstado(s.EstadoCita)}"
                : $"{FormatearHora12(s.FechaHora)} - {FormatearHora12(fin)} · {FormatearEstado(s.EstadoCita)}";
            s.EsDetalleVisible = true;
            return;
        }

        if (s.EsDetalleVisible)
        {
            var fin = s.FechaHora.AddMinutes(s.DuracionMinutos);
            var seguimiento = string.Equals(s.TipoCita, "Seguimiento", StringComparison.OrdinalIgnoreCase);
            var tipo = seguimiento ? "Acompañamiento" : "Asesoría";
            s.Etiqueta = $"Mi cita - {tipo}";
            var sesion = seguimiento ? "Seguimiento psicológico" : "Sesión de asesoría";
            s.Subtitulo = $"{FormatearHora12(s.FechaHora)} - {FormatearHora12(fin)} · {sesion}";
        }
        else
        {
            s.Etiqueta = "Ocupado";
            s.Subtitulo = null;
        }
    }

    private static void FormatearEventoPublico(CalendarioSlotDto s, ModoVista modo)
    {
        var hint = s.Subtitulo ?? string.Empty;
        var esCharla = hint.Contains("charla", StringComparison.OrdinalIgnoreCase);
        var tipoEvento = esCharla ? "Charla" : "Evento público";
        var fin = s.FechaHora.AddMinutes(s.DuracionMinutos);

        if (modo == ModoVista.Usuario)
        {
            if (string.IsNullOrWhiteSpace(s.Etiqueta))
                s.Etiqueta = "Evento inscrito";
            var tipoEv = esCharla ? "Charla" : "Evento inscrito";
            s.Subtitulo = $"{tipoEv} · {FormatearHora12(s.FechaHora)} - {FormatearHora12(fin)}";
            return;
        }

        if (modo == ModoVista.Propietario)
        {
            if (string.IsNullOrWhiteSpace(s.Etiqueta))
                s.Etiqueta = tipoEvento;
            s.Subtitulo = $"{tipoEvento} · {FormatearHora12(s.FechaHora)} - {FormatearHora12(fin)} · {FormatearEstado(s.EstadoCita)}";
            return;
        }

        if (string.IsNullOrWhiteSpace(s.Etiqueta))
            s.Etiqueta = tipoEvento;
        s.Subtitulo = $"{tipoEvento} · {FormatearHora12(s.FechaHora)} - {FormatearHora12(fin)} · {FormatearEstado(s.EstadoCita)}";
    }

    private static string FormatearEstado(string? estado)
        => estado?.ToUpperInvariant() switch
        {
            "PROGRAMADA" => "Programada",
            "MOVIDA"     => "Reprogramada",
            "FINALIZADA" => "Finalizada",
            "CANCELADA"  => "Cancelada",
            "ABIERTO"    => "Abierto",
            "CERRADO"    => "Cerrado",
            _            => estado ?? "—"
        };

    /// <summary>Formato canónico: 3PM, 10:30AM (sin cero inicial, AM/PM mayúsculas).</summary>
    public static string FormatearHora12(DateTime fechaHora)
    {
        var h = fechaHora.Hour;
        var m = fechaHora.Minute;
        var sufijo = h >= 12 ? "PM" : "AM";
        var h12 = h % 12;
        if (h12 == 0) h12 = 12;
        return m == 0 ? $"{h12}{sufijo}" : $"{h12}:{m:D2}{sufijo}";
    }
}

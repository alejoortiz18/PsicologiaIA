namespace Trebol.Model.DTOs.Cita;

/// <summary>Slot de calendario público del profesional (citas privadas u eventos abiertos).</summary>
public class CalendarioSlotDto
{
    public DateTime FechaHora       { get; set; }
    public int      DuracionMinutos { get; set; }
    /// <summary>CitaPrivada | EventoPublico</summary>
    public string   TipoSlot        { get; set; } = string.Empty;
    /// <summary>Asesoria | Seguimiento (solo citas privadas).</summary>
    public string?  TipoCita        { get; set; }
    /// <summary>Texto principal visible (sin datos de terceros en citas ajenas).</summary>
    public string   Etiqueta        { get; set; } = string.Empty;
    /// <summary>Segunda línea; solo cuando el detalle es visible para el visitante.</summary>
    public string?  Subtitulo       { get; set; }
    public bool     EsDetalleVisible { get; set; }
    /// <summary>Vista propietario: nombre del paciente o colega.</summary>
    public string?  NombreCliente   { get; set; }
    public string?  EstadoCita      { get; set; }
    public int?     CitaId          { get; set; }
}

namespace Trebol.Model.DTOs.Admin;

public class NotificacionDto
{
    public int      NotificacionId      { get; set; }
    public string   DestinatarioTipo    { get; set; } = string.Empty;
    public int      DestinatarioId      { get; set; }
    public string   Tipo                { get; set; } = string.Empty;
    public string   Titulo              { get; set; } = string.Empty;
    public string   Mensaje             { get; set; } = string.Empty;
    public bool     Leida               { get; set; }
    public DateTime FechaCreacion       { get; set; }
    public string?  EntidadRelacionadaTipo { get; set; }
    public int?     EntidadRelacionadaId   { get; set; }
    public int      ProfesionalId          { get; set; }
    // Datos del profesional relacionado (para bandeja admin)
    public string?  NombreProfesional   { get; set; }
    public string?  CorreoProfesional   { get; set; }
    public string?  RutaPdfCedula       { get; set; }
    public string?  RutaPdfTarjeta      { get; set; }
    public string?  EstadoProfesional   { get; set; }
    public string?  MotivoRechazo       { get; set; }
}

namespace Trebol.Model.DTOs.Sala;

public class CitaMensajeDto
{
    public int      CitaMensajeId  { get; set; }
    public int      CitaId         { get; set; }
    public string   RemitenteTipo  { get; set; } = string.Empty;
    public string   AliasRemitente { get; set; } = string.Empty;
    public string   Contenido      { get; set; } = string.Empty;
    public DateTime Fecha          { get; set; }
}

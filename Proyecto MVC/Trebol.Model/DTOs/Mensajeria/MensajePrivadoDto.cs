namespace Trebol.Model.DTOs.Mensajeria;

public class MensajePrivadoDto
{
    public int      MensajeId    { get; set; }
    public int      ConversacionId { get; set; }
    public string   EmisorTipo   { get; set; } = string.Empty;
    public int      EmisorId     { get; set; }
    public string   Contenido    { get; set; } = string.Empty;
    public DateTime FechaEnvio   { get; set; }
    public bool     Leido        { get; set; }
}

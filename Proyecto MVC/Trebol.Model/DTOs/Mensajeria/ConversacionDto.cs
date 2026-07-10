using Trebol.Model.Enums;

namespace Trebol.Model.DTOs.Mensajeria;

public class ConversacionDto
{
    public int      ConversacionId   { get; set; }
    public int      OtroId           { get; set; }   // Id del otro participante
    public string   OtroNombre       { get; set; } = string.Empty;
    public string?  OtroFoto         { get; set; }
    public string   TipoOtro         { get; set; } = string.Empty;
    public string?  UltimoMensaje    { get; set; }
    public DateTime? UltimaFecha     { get; set; }
    public int      MensajesNoLeidos { get; set; }
}

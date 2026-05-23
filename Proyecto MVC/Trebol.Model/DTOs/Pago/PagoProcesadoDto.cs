namespace Trebol.Model.DTOs.Pago;

public class PagoProcesadoDto
{
    public bool    Exito   { get; set; }
    public string  Mensaje { get; set; } = string.Empty;
    public string? Codigo  { get; set; }
}

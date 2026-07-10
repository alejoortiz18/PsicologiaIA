namespace Trebol.Model.DTOs.Pago;

public class InscripcionResultadoDto
{
    public int     SalaId             { get; set; }
    public int     InscripcionId      { get; set; }
    public string  EstadoInscripcion  { get; set; } = string.Empty;
    public decimal Precio             { get; set; }
    public string? CodigoInscripcion  { get; set; }
}

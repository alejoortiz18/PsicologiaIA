namespace Trebol.Model.DTOs.Inscripcion;

public record InscripcionConfirmacionDto
{
    public int       InscripcionId     { get; init; }
    public string    CodigoInscripcion { get; init; } = "";
    public string    EstadoInscripcion { get; init; } = "";
    public DateTime  FechaInscripcion  { get; init; }
    public string    TituloEvento      { get; init; } = "";
    public string?   DescripcionEvento { get; init; }
    public string    NombreOrador      { get; init; } = "";
    public string?   Categoria         { get; init; }
    public DateTime? FechaEvento       { get; init; }
    public DateTime? FechaFinEvento    { get; init; }
    public string    NombreParticipante { get; init; } = "";
    public string    Correo            { get; init; } = "";
    public string?   Documento         { get; init; }
    public decimal   PrecioEntrada     { get; init; }
    public decimal   TarifaPlataforma  { get; init; }
    public string?   MetodoPago        { get; init; }
    public decimal Total => PrecioEntrada + TarifaPlataforma;
    public string NumeroFactura => $"TRB-INS-{InscripcionId:D6}";
}

namespace Trebol.Model.DTOs.Sala;

public class ConferenciaTiempoEstadoDto
{
    public string    Fase                      { get; set; } = "Activa";
    public DateTime? FinEfectivo               { get; set; }
    public int       MinutosExtra              { get; set; }
    public decimal   ValorMinuto               { get; set; }
    public int       SegundosRestantesGracia   { get; set; }
    public int       ProfesionalId             { get; set; }
    public string    NombreProfesional         { get; set; } = string.Empty;
}

public class ComprarMinutosExtensionResultadoDto
{
    public bool      Exito         { get; set; }
    public string    Mensaje       { get; set; } = string.Empty;
    public DateTime? FinEfectivo   { get; set; }
    public int       MinutosExtra  { get; set; }
}

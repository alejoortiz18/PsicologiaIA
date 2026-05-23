namespace Trebol.Model.DTOs.Profesional;

public class ProfesionalDto
{
    public int     ProfesionalId    { get; set; }
    public string  NombreCompleto   { get; set; } = string.Empty;
    public string  Correo           { get; set; } = string.Empty;
    public string? FotoUrl          { get; set; }
    public string? Titulo           { get; set; }
    public string? Descripcion      { get; set; }
    public string? Ciudad           { get; set; }
    public decimal? TarifaCita      { get; set; }
    public double?  Calificacion    { get; set; }
    public int      TotalSeguidos   { get; set; }
    public string   Estado          { get; set; } = string.Empty;
    public int?    AnosExperiencia { get; set; }
    public List<string> Especialidades { get; set; } = [];
    public List<string> Idiomas        { get; set; } = [];
}

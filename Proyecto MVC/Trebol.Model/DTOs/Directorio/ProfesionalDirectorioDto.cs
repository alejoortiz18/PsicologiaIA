namespace Trebol.Model.DTOs.Directorio;

public class ProfesionalDirectorioDto
{
    public int     ProfesionalId  { get; set; }
    public string  NombreCompleto { get; set; } = string.Empty;
    public string? FotoUrl        { get; set; }
    public string? Titulo         { get; set; }
    public string? Ciudad         { get; set; }
    public double? Calificacion   { get; set; }
    public int     TotalSeguidos  { get; set; }
    public bool    EsSeguido      { get; set; }
    public string? SobreMi        { get; set; }
    public string? TipoProfesional { get; set; }
    public List<string> Especialidades { get; set; } = [];
}

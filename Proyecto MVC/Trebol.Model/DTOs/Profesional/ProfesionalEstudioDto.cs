namespace Trebol.Model.DTOs.Profesional;

public class ProfesionalEstudioDto
{
    public int    EstudioId     { get; set; }
    public string Titulo        { get; set; } = string.Empty;
    public string Universidad   { get; set; } = string.Empty;
    public short? AnoEgreso     { get; set; }
    public string Nivel         { get; set; } = string.Empty;
}

namespace Trebol.Model.DTOs.Profesional;

public class ActualizarProfesionalDto
{
    public int    ProfesionalId  { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Titulo        { get; set; }
    public string? Descripcion   { get; set; }
    public string? Celular       { get; set; }
    public int?   CiudadId       { get; set; }
    public decimal? TarifaCita   { get; set; }
    public string? FotoUrl       { get; set; }
    public List<int> EspecialidadIds { get; set; } = [];
    public List<int> IdiomaIds       { get; set; } = [];
}

namespace Trebol.Model.DTOs.Directorio;

public class FiltroDirectorioDto
{
    public string? NombreBusqueda { get; set; }
    public string? Especialidad   { get; set; }
    public string? Ciudad         { get; set; }
    public int?    EspecialidadId { get; set; }
    public int?    CiudadId       { get; set; }
    public int?    IdiomaId       { get; set; }
    public bool    SoloPsicologos { get; set; }
    public int     Pagina         { get; set; } = 1;
    public int     TamanioPagina  { get; set; } = 10;
}

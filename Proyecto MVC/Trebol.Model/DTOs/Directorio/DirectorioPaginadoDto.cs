namespace Trebol.Model.DTOs.Directorio;

public class DirectorioPaginadoDto
{
    public IReadOnlyList<ProfesionalDirectorioDto> Items { get; set; } = [];
    public int TotalRegistros { get; set; }
}

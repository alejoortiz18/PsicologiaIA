using Trebol.Model.Enums;

namespace Trebol.Model.DTOs.Sala;

public class CrearSalaDto
{
    public int      ProfesionalId { get; set; }
    public string   Titulo        { get; set; } = string.Empty;
    public string?  Descripcion   { get; set; }
    public TipoSala Tipo          { get; set; }
    public int?     CategoriaId   { get; set; }
    public int      Capacidad     { get; set; }
    public DateTime? FechaInicio  { get; set; }
    public decimal? Precio        { get; set; }
}

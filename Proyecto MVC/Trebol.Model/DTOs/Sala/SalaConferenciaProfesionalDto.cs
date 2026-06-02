using Trebol.Model.Enums;

namespace Trebol.Model.DTOs.Sala;

public class SalaConferenciaProfesionalDto
{
    public int        SalaId           { get; set; }
    public int        ProfesionalId    { get; set; }
    public string     Titulo           { get; set; } = string.Empty;
    public string?    Descripcion      { get; set; }
    public string?    Categoria        { get; set; }
    public TipoSala   Tipo             { get; set; }
    public EstadoSala Estado           { get; set; }
    public int        Capacidad        { get; set; }
    public int        TotalInscritos   { get; set; }
    public DateTime?  FechaInicio      { get; set; }
    public string     NombreProfesional { get; set; } = string.Empty;
    public bool       ChatHabilitado    { get; set; }
}

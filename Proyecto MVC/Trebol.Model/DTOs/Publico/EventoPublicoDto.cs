namespace Trebol.Model.DTOs.Publico;

public class EventoPublicoDto
{
    public int       SalaId             { get; set; }
    public int       ProfesionalId      { get; set; }
    public string    Titulo             { get; set; } = string.Empty;
    public string    NombreProfesional  { get; set; } = string.Empty;
    public string?   Categoria          { get; set; }
    public string    Estado             { get; set; } = string.Empty;
    public int       Capacidad          { get; set; }
    public int       TotalInscritos     { get; set; }
    public decimal   Precio             { get; set; }
    public DateTime? FechaInicio        { get; set; }
}

public class EspecialidadConteoDto
{
    public int    EspecialidadId     { get; set; }
    public string Nombre             { get; set; } = string.Empty;
    public int    TotalProfesionales { get; set; }
}

public class EstadisticasLandingDto
{
    public int ProfesionalesActivos { get; set; }
    public int EventosRealizados    { get; set; }
    public int UsuariosRegistrados  { get; set; }
}

public class ProfesionalTickerDto
{
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Especialidad  { get; set; }
    public int?   AnosExperiencia { get; set; }
}

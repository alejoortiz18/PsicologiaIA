using Trebol.Model.DTOs.Publico;

namespace Trebol.Model.DTOs.Dashboard;

public class CitaHoyProfesionalDto
{
    public int      CitaId       { get; set; }
    public string   AliasUsuario { get; set; } = string.Empty;
    public DateTime FechaHora    { get; set; }
    public string   Tipo         { get; set; } = string.Empty;
    public string   Estado       { get; set; } = string.Empty;
}

public class DashboardUsuarioDto
{
    public int     CitasProximas       { get; set; }
    public int     EventosInscritos    { get; set; }
    public int     ProfesionalesSeguidos { get; set; }
    public int     MensajesNoLeidos    { get; set; }
    public CitaResumenDto? ProximaCita { get; set; }
    public List<EventoResumenDto> EventosRecomendados { get; set; } = [];
    public List<ProfesionalResumenDto> ProfesionalesSugeridos { get; set; } = [];
}

public class DashboardProfesionalDto
{
    public int     CitasHoy            { get; set; }
    public int     TotalPacientes      { get; set; }
    public int     SalasActivas        { get; set; }
    public decimal IngresosMes         { get; set; }
    public CitaResumenDto? ProximaCita { get; set; }
    public List<SalaResumenDto> Salas  { get; set; } = [];
    public List<CitaHoyProfesionalDto> CitasHoyLista { get; set; } = [];
    public List<EventoPublicoDto> EventosColegas { get; set; } = [];
}

public class CitaResumenDto
{
    public int      CitaId       { get; set; }
    public string   Nombre       { get; set; } = string.Empty;  // alias si es paciente
    public DateTime FechaHora    { get; set; }
    public string?  FotoUrl      { get; set; }
}

public class EventoResumenDto
{
    public int     SalaId    { get; set; }
    public string  Titulo    { get; set; } = string.Empty;
    public string? Imagen    { get; set; }
    public DateTime? Inicio  { get; set; }
    public string  Profesional { get; set; } = string.Empty;
}

public class ProfesionalResumenDto
{
    public int    ProfesionalId { get; set; }
    public string Nombre        { get; set; } = string.Empty;
    public string? Foto         { get; set; }
    public string? Especialidad { get; set; }
    public double? Calificacion { get; set; }
}

public class SalaResumenDto
{
    public int    SalaId    { get; set; }
    public string Titulo    { get; set; } = string.Empty;
    public int    Asistentes { get; set; }
    public string Estado    { get; set; } = string.Empty;
}

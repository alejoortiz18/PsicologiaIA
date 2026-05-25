using Trebol.Model.DTOs.Cita;
using Trebol.Model.DTOs.Common;
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
    public int     CitasProximas         { get; set; }
    public int     EventosInscritos      { get; set; }
    public int     EventosProximos       { get; set; }
    public int     ProfesionalesSeguidos { get; set; }
    public int     MensajesNoLeidos      { get; set; }
    public string? ProximaSalaTitulo     { get; set; }
    public DateTime? ProximaSalaFecha    { get; set; }
    public string? ProximaSalaSubtitulo   { get; set; }
    public CitaResumenDto? ProximaCita   { get; set; }
    public List<EventoResumenDto> EventosRecomendados { get; set; } = [];
    public List<ProfesionalResumenDto> ProfesionalesSugeridos { get; set; } = [];
}

public class HomeUsuarioIndexViewModel
{
    public DashboardUsuarioDto Dashboard { get; set; } = new();
    public IReadOnlyList<CitaListaDto> CitasProximas { get; set; } = [];
    public IReadOnlyList<InscripcionHomeItemDto> Inscripciones { get; set; } = [];
    public IReadOnlyList<EventoPublicoDto> SalasHoy { get; set; } = [];
    public IReadOnlyList<EventoPublicoDto> SalasDestacadas { get; set; } = [];
    public IReadOnlyList<EventoPublicoDto> EventosMentores { get; set; } = [];
    public PaginacionVm Paginacion { get; set; } = new();
}

public class InscripcionHomeItemDto
{
    public int       SalaId             { get; set; }
    public int       InscripcionId      { get; set; }
    public string    Titulo             { get; set; } = string.Empty;
    public string    NombreProfesional  { get; set; } = string.Empty;
    public DateTime? FechaInicio        { get; set; }
    public DateTime? FechaFin           { get; set; }
    public string    EstadoSala         { get; set; } = string.Empty;
    public string    EstadoInscripcion  { get; set; } = string.Empty;
    public bool      EnVivo             { get; set; }
    public bool      Finalizado         { get; set; }
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

public class EventosUsuarioViewModel
{
    public IReadOnlyList<EventoPublicoDto> Inscritos     { get; set; } = [];
    public IReadOnlyList<EventoPublicoDto> EstaSemana    { get; set; } = [];
    public IReadOnlyList<EventoPublicoDto> TodosVigentes { get; set; } = [];
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

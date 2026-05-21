namespace Trebol.Model.DTOs.Publico;

public class LandingPageDto
{
    public EstadisticasLandingDto Estadisticas { get; set; } = new();
    public List<EspecialidadConteoDto> Especialidades { get; set; } = [];
    public List<EventoPublicoDto> EventosDestacados { get; set; } = [];
    public List<ProfesionalTickerDto> TickerProfesionales { get; set; } = [];
}

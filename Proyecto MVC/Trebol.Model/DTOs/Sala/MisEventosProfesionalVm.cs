namespace Trebol.Model.DTOs.Sala;

public class MisEventosProfesionalVm
{
    public IReadOnlyList<SalaDto> Salas { get; set; } = [];
    public IReadOnlyList<SalaDto> EventosHoy { get; set; } = [];
    public int TotalSalas { get; set; }
    public int SalasAbiertas { get; set; }
    public int TotalInscritos { get; set; }
    public decimal IngresosMes { get; set; }
    public SalaDto? EventoHoy { get; set; }
}

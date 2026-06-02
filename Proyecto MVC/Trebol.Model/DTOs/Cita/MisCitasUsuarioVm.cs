using Trebol.Model.DTOs.Common;

namespace Trebol.Model.DTOs.Cita;

public class MisCitasUsuarioVm
{
    public IReadOnlyList<CitaListaDto> CitasActivas { get; set; } = [];
    public PaginacionVm PaginacionActivas { get; set; } = new();
    public IReadOnlyList<CitaListaDto> CitasPasadas { get; set; } = [];
    public PaginacionVm PaginacionPasadas { get; set; } = new();
}

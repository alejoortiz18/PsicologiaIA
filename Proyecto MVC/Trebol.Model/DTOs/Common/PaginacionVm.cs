namespace Trebol.Model.DTOs.Common;

public class PaginacionVm
{
    public int PaginaActual { get; set; } = 1;
    public int TamanoPagina { get; set; } = 10;
    public int TotalRegistros { get; set; }
    public int TotalPaginas => TamanoPagina > 0
        ? (int)Math.Ceiling(TotalRegistros / (double)TamanoPagina)
        : 0;
    public int Desde => TotalRegistros == 0 ? 0 : (PaginaActual - 1) * TamanoPagina + 1;
    public int Hasta => Math.Min(PaginaActual * TamanoPagina, TotalRegistros);
}

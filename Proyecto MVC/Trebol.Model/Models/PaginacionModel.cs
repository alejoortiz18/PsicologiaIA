using Trebol.Constants.Pagination;

namespace Trebol.Model.Models;

public class PaginacionModel
{
    public int Pagina         { get; set; } = 1;
    public int TamanioPagina  { get; set; } = PaginacionConstant.TamanioDefecto;
    public int TotalRegistros { get; set; }
    public int TotalPaginas   => (int)Math.Ceiling((double)TotalRegistros / TamanioPagina);
    public bool TienePaginaAnterior => Pagina > 1;
    public bool TienePaginaSiguiente => Pagina < TotalPaginas;
    public static readonly int[] OpcionesTamanio = PaginacionConstant.OpcionesTamanio;
}

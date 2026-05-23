using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Pagination;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Common;
using Trebol.Model.DTOs.Directorio;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class DirectorioController(IDirectorioRepository directorioRepo) : Controller
{
    private int IdentidadId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private (int? usuarioSeguidorId, int? excluirProfesionalId) ContextoDirectorio()
        => User.IsInRole("Profesional")
            ? (null, IdentidadId)
            : (IdentidadId, null);

    // GET /Directorio/Medicos
    public async Task<IActionResult> Medicos([FromQuery] FiltroDirectorioDto filtro)
        => await VistaDirectorioAsync("Medicos", filtro, directorioRepo.ObtenerMedicosAsync);

    // Redirección legacy
    public IActionResult Especialistas([FromQuery] FiltroDirectorioDto filtro)
        => RedirectToAction(nameof(Medicos), filtro);

    // GET /Directorio/Psicologos
    public async Task<IActionResult> Psicologos([FromQuery] FiltroDirectorioDto filtro)
        => await VistaDirectorioAsync("Psicologos", filtro, directorioRepo.ObtenerPsicologosAsync);

    [Authorize(Roles = "Profesional")]
    public async Task<IActionResult> Mentores()
    {
        var lista = await directorioRepo.ObtenerMisMentoresAsync(IdentidadId);
        return View(lista);
    }

    [Authorize(Roles = "Profesional")]
    public async Task<IActionResult> MisColegas()
    {
        var lista = await directorioRepo.ObtenerMisColegasAsync(IdentidadId);
        return View(lista);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleSeguir(int profesionalId)
    {
        var resultado = await directorioRepo.ToggleSeguirAsync(IdentidadId, profesionalId);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    [Authorize(Roles = "Profesional")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleColega(int colegaId)
    {
        var resultado = await directorioRepo.ToggleColegaAsync(IdentidadId, colegaId);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    private async Task<IActionResult> VistaDirectorioAsync(
        string action,
        FiltroDirectorioDto filtro,
        Func<FiltroDirectorioDto, int?, int?, CancellationToken, Task<DirectorioPaginadoDto>> obtener)
    {
        filtro = NormalizarFiltro(filtro);
        var (usuarioSeguidorId, excluirProfesionalId) = ContextoDirectorio();
        var resultado = await obtener(filtro, usuarioSeguidorId, excluirProfesionalId, HttpContext.RequestAborted);

        ViewBag.Filtro = filtro;
        ViewBag.Paginacion = new PaginacionVm
        {
            Controller      = "Directorio",
            Action          = action,
            PaginaActual    = filtro.Pagina,
            TamanoPagina    = filtro.TamanioPagina,
            TotalRegistros  = resultado.TotalRegistros
        };

        return View(action, resultado.Items);
    }

    private static FiltroDirectorioDto NormalizarFiltro(FiltroDirectorioDto filtro)
    {
        if (filtro.Pagina < 1) filtro.Pagina = 1;
        if (!PaginacionConstant.OpcionesDirectorio.Contains(filtro.TamanioPagina))
            filtro.TamanioPagina = PaginacionConstant.TamanioDefectoDirectorio;
        return filtro;
    }
}

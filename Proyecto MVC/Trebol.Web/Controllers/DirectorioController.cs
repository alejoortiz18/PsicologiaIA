using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Directorio;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class DirectorioController(IDirectorioRepository directorioRepo) : Controller
{
    private int IdentidadId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /Directorio/Especialistas
    public async Task<IActionResult> Especialistas([FromQuery] FiltroDirectorioDto filtro)
    {
        var lista = await directorioRepo.ObtenerEspecialistasAsync(filtro, IdentidadId);
        ViewBag.Filtro = filtro;
        return View(lista);
    }

    // GET /Directorio/Psicologos
    public async Task<IActionResult> Psicologos([FromQuery] FiltroDirectorioDto filtro)
    {
        var lista = await directorioRepo.ObtenerPsicologosAsync(filtro, IdentidadId);
        ViewBag.Filtro = filtro;
        return View(lista);
    }

    // GET /Directorio/Mentores
    [Authorize(Roles = "Profesional")]
    public async Task<IActionResult> Mentores()
    {
        var lista = await directorioRepo.ObtenerMisMentoresAsync(IdentidadId);
        return View(lista);
    }

    // GET /Directorio/MisColegas
    [Authorize(Roles = "Profesional")]
    public async Task<IActionResult> MisColegas()
    {
        var lista = await directorioRepo.ObtenerMisColegasAsync(IdentidadId);
        return View(lista);
    }

    // POST /Directorio/ToggleSeguir
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleSeguir(int profesionalId)
    {
        var resultado = await directorioRepo.ToggleSeguirAsync(IdentidadId, profesionalId);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    // POST /Directorio/ToggleColega
    [Authorize(Roles = "Profesional")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleColega(int colegaId)
    {
        var resultado = await directorioRepo.ToggleColegaAsync(IdentidadId, colegaId);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }
}

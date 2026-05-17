using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Sala;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Profesional")]
public class PerfilOradorController(
    ISalaRepository salaRepo,
    IDirectorioRepository directorioRepo) : Controller
{
    // GET /PerfilOrador/Index/5  — Vista pública del orador (sala)
    [AllowAnonymous]
    public async Task<IActionResult> Index(int id)
    {
        var salas = await salaRepo.ObtenerPorProfesionalAsync(id);
        ViewBag.ProfesionalId = id;
        return View(salas);
    }

    // GET /PerfilOrador/MisSalas
    public async Task<IActionResult> MisSalas()
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var salas         = await salaRepo.ObtenerPorProfesionalAsync(profesionalId);
        return View(salas);
    }
}

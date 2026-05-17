using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class MisEventosController(ISalaRepository salaRepo) : Controller
{
    public async Task<IActionResult> Index()
    {
        var id   = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var tipo = User.FindFirstValue(ClaimTypes.Role)!;

        // Profesional ve sus salas/eventos creados; Usuario ve en los que está inscrito
        var eventos = tipo == "Profesional"
            ? await salaRepo.ObtenerPorProfesionalAsync(id)
            : await salaRepo.ObtenerPublicasAsync();

        return View(eventos);
    }
}

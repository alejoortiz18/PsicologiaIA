using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Profesional")]
public class HomeProfesionalController(IProfesionalRepository profesionalRepo) : Controller
{
    public async Task<IActionResult> Index()
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var dashboard     = await profesionalRepo.ObtenerDashboardAsync(profesionalId);
        return View(dashboard);
    }
}

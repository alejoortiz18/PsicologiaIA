using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario")]
public class HomeUsuarioController(IUsuarioRepository usuarioRepo) : Controller
{
    public async Task<IActionResult> Index()
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var dashboard = await usuarioRepo.ObtenerDashboardAsync(usuarioId);
        return View(dashboard);
    }
}

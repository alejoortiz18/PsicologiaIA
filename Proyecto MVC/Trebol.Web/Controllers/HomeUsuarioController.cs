using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Common;
using Trebol.Model.DTOs.Dashboard;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario")]
public class HomeUsuarioController(
    IUsuarioRepository usuarioRepo,
    ICitaRepository    citaRepo,
    ISalaRepository    salaRepo) : Controller
{
    private const int TamanoPaginaSalas = 10;

    public async Task<IActionResult> Index(int pagina = 1)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        pagina = Math.Max(1, pagina);

        var dashboard     = await usuarioRepo.ObtenerDashboardAsync(usuarioId);
        var citas         = await citaRepo.ObtenerProximasPorUsuarioAsync(usuarioId, 5);
        var inscripciones = await usuarioRepo.ObtenerInscripcionesHomeAsync(usuarioId, 4);
        var salasHoy      = await salaRepo.ObtenerHoyPublicasAsync(4, usuarioId);
        var totalSalas    = await salaRepo.ContarPublicasAsync();
        var destacadas    = await salaRepo.ObtenerPublicasPaginadasAsync(pagina, TamanoPaginaSalas, usuarioId: usuarioId);

        var vm = new HomeUsuarioIndexViewModel
        {
            Dashboard     = dashboard,
            CitasProximas = citas,
            Inscripciones = inscripciones,
            SalasHoy      = salasHoy,
            SalasDestacadas = destacadas,
            Paginacion = new PaginacionVm
            {
                Controller      = "HomeUsuario",
                Action          = "Index",
                PaginaActual    = pagina,
                TamanoPagina    = TamanoPaginaSalas,
                TotalRegistros  = totalSalas
            }
        };

        return View(vm);
    }
}

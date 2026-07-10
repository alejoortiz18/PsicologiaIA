using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Publico;

namespace Trebol.Web.Controllers;

public class LandingController(ILandingRepository landingRepo) : Controller
{
    public async Task<IActionResult> Index(CancellationToken ct)
    {
        var model = new LandingPageDto
        {
            Estadisticas = await landingRepo.ObtenerEstadisticasAsync(ct),
            Especialidades = (await landingRepo.ObtenerEspecialidadesConConteoAsync(ct)).ToList(),
            EventosDestacados = (await landingRepo.ObtenerEventosDestacadosAsync(3, ct)).ToList(),
            TickerProfesionales = (await landingRepo.ObtenerTickerProfesionalesAsync(6, ct)).ToList()
        };
        ViewData["TickerProfesionales"] = model.TickerProfesionales;
        return View(model);
    }
}

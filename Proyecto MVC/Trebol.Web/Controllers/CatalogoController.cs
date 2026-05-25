using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces.Catalogos;

namespace Trebol.Web.Controllers;

[AllowAnonymous]
public class CatalogoController(ICatalogoRepository catalogoRepo) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Ciudades(int paisId, CancellationToken ct)
    {
        if (paisId <= 0)
            return BadRequest(new { mensaje = "País no válido." });

        var ciudades = await catalogoRepo.ObtenerCiudadesAsync(paisId, ct);
        return Json(ciudades.Select(c => new { c.CiudadId, c.Nombre }));
    }
}

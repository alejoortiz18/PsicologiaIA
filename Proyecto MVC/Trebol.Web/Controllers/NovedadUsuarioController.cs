using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario")]
public class NovedadUsuarioController(ISaldoUsuarioRepository saldoRepo) : Controller
{
    [HttpGet]
    public async Task<IActionResult> PendienteModal(CancellationToken ct)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var novedad = await saldoRepo.ObtenerNovedadPendienteModalAsync(id, ct);
        if (novedad is null)
            return Json(new { hayNovedad = false });

        return Json(new
        {
            hayNovedad = true,
            novedad = new
            {
                novedad.NovedadUsuarioId,
                novedad.TipoNovedad,
                novedad.EntidadTipo,
                novedad.Titulo,
                novedad.Mensaje,
                novedad.EsCita,
                novedad.EsEvento,
                novedad.ProfesionalId,
                novedad.TienePagoAprobado
            }
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Resolver(int novedadId, string opcion, CancellationToken ct)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await saldoRepo.ResolverNovedadAsync(id, novedadId, opcion, ct);
        return Json(new
        {
            exito = resultado.Exito,
            mensaje = resultado.Mensaje,
            redirectUrl = resultado.RedirectUrl,
            profesionalId = resultado.ProfesionalId
        });
    }
}

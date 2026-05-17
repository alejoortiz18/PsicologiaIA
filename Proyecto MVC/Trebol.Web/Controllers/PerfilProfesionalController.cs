using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Profesional;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Profesional")]
public class PerfilProfesionalController(
    IProfesionalRepository profesionalRepo,
    Trebol.Helpers.Archivos.IArchivoHelper archivoHelper) : Controller
{
    public async Task<IActionResult> Index()
    {
        var id   = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var prof = await profesionalRepo.ObtenerPorIdAsync(id);
        return View(prof);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Actualizar(ActualizarProfesionalDto dto, IFormFile? foto)
    {
        if (!ModelState.IsValid) return View("Index", dto);

        dto.ProfesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (foto is not null && foto.Length > 0)
        {
            try
            {
                dto.FotoUrl = await archivoHelper.GuardarFotoPerfilAsync(foto, "profesionales", dto.ProfesionalId);
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("foto", ex.Message);
                return View("Index", dto);
            }
        }

        var resultado = await profesionalRepo.ActualizarAsync(dto);
        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            return View("Index", dto);
        }

        TempData["Mensaje"] = PerfilConstant.PerfilActualizado;
        return RedirectToAction("Index");
    }
}

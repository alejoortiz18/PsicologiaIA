using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Usuario;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario")]
public class PerfilUsuarioController(
    IUsuarioRepository usuarioRepo,
    Trebol.Helpers.Archivos.IArchivoHelper archivoHelper) : Controller
{
    public async Task<IActionResult> Index()
    {
        var id   = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await usuarioRepo.ObtenerPorIdAsync(id);
        return View(user);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Actualizar(ActualizarUsuarioDto dto, IFormFile? foto)
    {
        if (!ModelState.IsValid) return View("Index", dto);

        dto.UsuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (foto is not null && foto.Length > 0)
        {
            try
            {
                dto.FotoUrl = await archivoHelper.GuardarFotoPerfilAsync(foto, "usuarios", dto.UsuarioId);
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("foto", ex.Message);
                return View("Index", dto);
            }
        }

        var resultado = await usuarioRepo.ActualizarAsync(dto);
        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            return View("Index", dto);
        }

        TempData["Mensaje"] = PerfilConstant.PerfilActualizado;
        return RedirectToAction("Index");
    }
}

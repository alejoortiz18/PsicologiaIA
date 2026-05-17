using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;
using Trebol.Helpers.Security;
using Trebol.Helpers.Token;
using Trebol.Web.ViewModels.Auth;

namespace Trebol.Web.Controllers;

public class RecuperacionController(
    ILoginRepository loginRepo,
    ITokenHelper     tokenHelper,
    IPasswordHelper  passwordHelper) : Controller
{
    // GET /Recuperacion/SolicitarRecuperacion
    [HttpGet]
    public IActionResult SolicitarRecuperacion() => View();

    // POST /Recuperacion/SolicitarRecuperacion
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SolicitarRecuperacion(SolicitarRecuperacionViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        // Generamos token antes de llamar al repo (prevenir enumeración — siempre misma respuesta)
        var token = tokenHelper.GenerarToken();
        await loginRepo.SolicitarRecuperacionAsync(vm.Correo, token);

        TempData["Mensaje"] = "Si el correo existe, recibirás un enlace de recuperación en breve.";
        return RedirectToAction("SolicitarRecuperacion");
    }

    // GET /Recuperacion/RestablecerPassword?token=...
    [HttpGet]
    public IActionResult RestablecerPassword(string token)
        => View(new RestablecerPasswordViewModel { Token = token });

    // POST /Recuperacion/RestablecerPassword
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RestablecerPassword(RestablecerPasswordViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        var passwordHash = passwordHelper.HashPassword(vm.NuevoPassword);
        var resultado    = await loginRepo.RestablecerPasswordAsync(vm.Token, passwordHash);

        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            return View(vm);
        }

        TempData["Mensaje"] = "Contraseña actualizada correctamente. Ya puedes iniciar sesión.";
        return RedirectToAction("Index", "Login");
    }
}

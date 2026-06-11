using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Helpers.Email;
using Trebol.Helpers.Security;
using Trebol.Helpers.Token;
using Trebol.Web.ViewModels.Auth;

namespace Trebol.Web.Controllers;

public class RecuperacionController(
    ILoginRepository loginRepo,
    ITokenHelper     tokenHelper,
    IPasswordHelper  passwordHelper,
    IEmailHelper     emailHelper,
    IConfiguration   configuration,
    ILogger<RecuperacionController> logger) : Controller
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

        var token     = tokenHelper.GenerarToken();
        var resultado = await loginRepo.SolicitarRecuperacionAsync(vm.Correo, token);

        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            return View(vm);
        }

        if (resultado.Datos)
        {
            var baseUrl = (configuration["App:BaseUrl"] ?? $"{Request.Scheme}://{Request.Host}")
                .TrimEnd('/');
            var enlace = $"{baseUrl}/Recuperacion/RestablecerPassword?token={Uri.EscapeDataString(token)}";

            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                await emailHelper.EnviarConEnlaceAsync(
                    vm.Correo.Trim(),
                    EmailConstant.AsuntoRecuperacion,
                    EmailConstant.CuerpoRecuperacion,
                    enlace,
                    cts.Token);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error SMTP al enviar recuperación a {Correo}", vm.Correo);
                TempData["Error"] = "No pudimos enviar el correo en este momento. Revisa tu bandeja más tarde o contacta soporte.";
                return RedirectToAction(nameof(SolicitarRecuperacion));
            }
        }

        TempData["Mensaje"] = "Si el correo existe, recibirás un enlace de recuperación en breve.";
        return RedirectToAction(nameof(SolicitarRecuperacion));
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

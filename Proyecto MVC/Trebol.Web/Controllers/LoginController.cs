using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Helpers.Token;
using Trebol.Web.ViewModels.Auth;

namespace Trebol.Web.Controllers;

public class LoginController(ILoginRepository loginRepo, ILandingRepository landingRepo) : Controller
{
    // GET /Login
    [HttpGet]
    public async Task<IActionResult> Index(CancellationToken ct)
    {
        if (User.Identity?.IsAuthenticated == true)
            return RedirectByRole();
        ViewBag.Estadisticas = await landingRepo.ObtenerEstadisticasAsync(ct);
        return View();
    }

    // POST /Login
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Index(LoginViewModel vm)
    {
        if (!ModelState.IsValid)
            return View(vm);

        // 1. Validar credenciales (el repositorio hace la verificación Argon2)
        var resultado = await loginRepo.ValidarLoginAsync(vm.Correo, vm.Password);

        if (resultado is null)
        {
            ModelState.AddModelError(string.Empty, AuthConstant.CredencialesInvalidas);
            return View(vm);
        }

        if (resultado.TipoEntidad == "SinConfirmar")
        {
            ViewBag.MostrarReenviarConfirmacion = true;
            ViewBag.CorreoSinConfirmar = string.IsNullOrWhiteSpace(resultado.Correo) ? vm.Correo : resultado.Correo;
            ModelState.AddModelError(string.Empty, AuthConstant.CuentaSinConfirmar);
            return View(vm);
        }
        if (resultado.TipoEntidad == "EnRevision")
        {
            ModelState.AddModelError(string.Empty, AuthConstant.CuentaEnRevision);
            return View(vm);
        }
        if (resultado.TipoEntidad == "Rechazado")
        {
            ModelState.AddModelError(string.Empty, AuthConstant.CuentaRechazada);
            return View(vm);
        }
        if (resultado.TipoEntidad is "Bloqueado" or "Pendiente")
        {
            ModelState.AddModelError(string.Empty, AuthConstant.CuentaBloqueada);
            return View(vm);
        }

        // 2. Emitir cookie de sesión con claims del usuario
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, resultado.EntidadId.ToString()),
            new(ClaimTypes.Email,          resultado.Correo),
            new(ClaimTypes.Name,           resultado.NombreCompleto),
            new(ClaimTypes.Role,           resultado.TipoEntidad),
            new("FotoUrl",                 resultado.FotoUrl ?? "")
        };

        var identity  = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            new AuthenticationProperties { IsPersistent = false });

        // 3. Redirigir según rol
        return resultado.TipoEntidad switch
        {
            "Usuario"     => RedirectToAction("Index",                    "HomeUsuario"),
            "Profesional" => RedirectToAction("Index",                    "HomeProfesional"),
            "Admin"       => RedirectToAction("BandejaNotificaciones",    "Admin"),
            _             => RedirectToAction("Index",                    "Landing")
        };
    }

    // POST /Login/Logout
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        Response.Headers.CacheControl = "no-cache, no-store, must-revalidate";
        Response.Headers.Pragma       = "no-cache";
        Response.Headers.Expires      = "0";
        return RedirectToAction("Index", "Login");
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    private IActionResult RedirectByRole()
        => User.IsInRole("Usuario")     ? RedirectToAction("Index",                 "HomeUsuario")
         : User.IsInRole("Profesional") ? RedirectToAction("Index",                 "HomeProfesional")
         : User.IsInRole("Admin")       ? RedirectToAction("BandejaNotificaciones", "Admin")
                                        : RedirectToAction("Index",                 "Landing");
}

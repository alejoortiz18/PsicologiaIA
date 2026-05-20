using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Helpers.Email;
using Trebol.Helpers.Security;
using Trebol.Helpers.Token;
using Trebol.Model.DTOs.Profesional;
using Trebol.Model.DTOs.Usuario;
using Trebol.Web.ViewModels.Auth;
using Trebol.Web.Helpers;

namespace Trebol.Web.Controllers;

public class RegistroController(
    IUsuarioRepository     usuarioRepo,
    IProfesionalRepository profesionalRepo,
    IEmailHelper           emailHelper,
    IPasswordHelper        passwordHelper,
    ITokenHelper           tokenHelper,
    IConfiguration         config) : Controller
{
    // GET /Registro/SeleccionPerfil
    [HttpGet]
    public IActionResult SeleccionPerfil() => View();

    // GET /Registro/RegistroUsuario
    [HttpGet]
    public IActionResult RegistroUsuario() => View(new RegistroUsuarioViewModel());

    // POST /Registro/RegistroUsuario
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RegistroUsuario(RegistroUsuarioViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        var token      = tokenHelper.GenerarToken();
        var expiracion = DateTime.UtcNow.AddHours(1);
        var baseUrl    = config["App:BaseUrl"] ?? "https://localhost:7072";

        var dto = new RegistroUsuarioDto
        {
            NombreCompleto  = vm.NombreCompleto,
            Correo          = vm.Correo,
            NumeroDocumento = vm.NumeroDocumento,
            Alias           = vm.NombreCompleto.Split(' ')[0].ToLower() + new Random().Next(100, 999),
            Token           = token,
            Expiracion      = expiracion
        };

        var resultado = await usuarioRepo.RegistrarAsync(dto);
        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            return View(vm);
        }

        var enlaceConfirmacion = $"{baseUrl}/Registro/ConfirmarEmailUsuario?token={Uri.EscapeDataString(token)}";
        var mensajeUsuario = $"Recibimos tu solicitud de registro como usuario en <strong style=\"color:#1A3C34;\">Trébol</strong>. " +
                             "Para continuar, haz clic en el botón y crea tu contraseña.";
        try
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
            await emailHelper.EnviarAsync(
                vm.Correo,
                RegistroEmailTemplates.AsuntoConfirmacionCorreo,
                RegistroEmailTemplates.BuildConfirmacionCorreo(vm.NombreCompleto, enlaceConfirmacion, mensajeUsuario, horasValidez: 1),
                cts.Token);
        }
        catch (Exception ex)
        {
            ModelState.AddModelError(string.Empty,
                $"No pudimos enviar el correo de confirmación. Por favor, intenta más tarde. Error: {ex.Message}");
            return View(vm);
        }

        TempData["Mensaje"] = RegistroConstant.RegistroExitoso;
        TempData["HorasEnlace"] = "1";
        return RedirectToAction("EsperaConfirmacion");
    }

    // GET /Registro/ActivarCuenta — redirige al flujo estándar por enlace de correo
    [HttpGet]
    public IActionResult ActivarCuenta(string? token, int? usuarioId)
    {
        if (!string.IsNullOrWhiteSpace(token))
            return RedirectToAction(nameof(ConfirmarEmailUsuario), new { token });
        return RedirectToAction("Index", "Login");
    }

    // GET /Registro/ConfirmarEmailUsuario?token=xxx
    [HttpGet]
    public async Task<IActionResult> ConfirmarEmailUsuario(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return RedirectToAction("Index", "Login");

        var esValido = await usuarioRepo.EsTokenValidoAsync(token);
        var vm = new ConfirmarEmailViewModel { Token = token };

        if (!esValido)
        {
            ModelState.AddModelError(string.Empty, "Ocurrió un error al procesar tu solicitud. Por favor, intenta iniciar sesión.");
            ViewData["ShowErrorModal"] = true;
        }

        return View(vm);
    }

    // POST /Registro/ConfirmarEmailUsuario
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ConfirmarEmailUsuario(ConfirmarEmailViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        var passwordHash = passwordHelper.HashPassword(vm.Password);
        var resultado = await usuarioRepo.ActivarAsync(vm.Token, passwordHash);

        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, "Ocurrió un error al procesar tu solicitud. Por favor, intenta iniciar sesión.");
            ViewData["ShowErrorModal"] = true;
            return View(vm);
        }

        TempData["Mensaje"] = RegistroConstant.ActivacionExitosa;
        return RedirectToAction("Index", "Login");
    }

    // ══════════════════════════════════════════════════
    // REGISTRO PROFESIONAL — Flujo completo
    // ══════════════════════════════════════════════════

    // GET /Registro/RegistroProfesional
    [HttpGet]
    public IActionResult RegistroProfesional() => View(new RegistroProfesionalViewModel());

    // POST /Registro/RegistroProfesional
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RegistroProfesional(RegistroProfesionalViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        if (vm.FotocopiaCedula is null || vm.FotocopiaCedula.Length == 0)
        {
            ModelState.AddModelError("FotocopiaCedula", RegistroConstant.ArchivoPdfRequerido);
            return View(vm);
        }
        if (vm.FotocopiaTarjeta is null || vm.FotocopiaTarjeta.Length == 0)
        {
            ModelState.AddModelError("FotocopiaTarjeta", RegistroConstant.ArchivoPdfRequerido);
            return View(vm);
        }

        byte[] cedulaBytes;
        using (var ms = new MemoryStream()) { await vm.FotocopiaCedula.CopyToAsync(ms); cedulaBytes = ms.ToArray(); }
        byte[] tarjetaBytes;
        using (var ms = new MemoryStream()) { await vm.FotocopiaTarjeta.CopyToAsync(ms); tarjetaBytes = ms.ToArray(); }

        var token      = tokenHelper.GenerarToken();
        var expiracion = DateTime.UtcNow.AddHours(72);
        var baseUrl    = config["App:BaseUrl"] ?? "https://localhost:7072";

        var dto = new RegistroProfesionalDto
        {
            NombreCompleto  = vm.NombreCompleto,
            Correo          = vm.Correo,
            NumeroDocumento = vm.NumeroDocumento,
            NumeroCedula    = vm.NumeroRegistro,
            Especialidad    = vm.EspecialidadId.ToString(),
            RutaPdfCedula   = string.Empty,
            Token           = token,
            Expiracion      = expiracion
        };

        var resultado = await profesionalRepo.RegistrarAsync(dto);
        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            return View(vm);
        }

        // Correo al admin con documentos adjuntos (fire-and-forget)
        var correoAdmin = config["App:CorreoAdmin"] ?? config["Email:Remitente"] ?? string.Empty;
        if (!string.IsNullOrEmpty(correoAdmin))
        {
            var cuerpoAdmin = BuildEmailAdminNuevoProfesional(vm.NombreCompleto, vm.Correo, vm.NumeroDocumento, vm.NumeroRegistro);
            _ = Task.Run(async () =>
            {
                try
                {
                    using var cts = new System.Threading.CancellationTokenSource(TimeSpan.FromSeconds(30));
                    await emailHelper.EnviarConAdjuntosAsync(
                        correoAdmin,
                        $"[Trébol] Nueva solicitud de profesional — {vm.NombreCompleto}",
                        cuerpoAdmin,
                        [
                            (cedulaBytes,  $"cedula_{vm.NumeroDocumento}.pdf",  "application/pdf"),
                            (tarjetaBytes, $"tarjeta_{vm.NumeroRegistro}.pdf", "application/pdf")
                        ],
                        cts.Token);
                }
                catch { }
            });
        }

        // Correo de confirmación al profesional con enlace (OBLIGATORIO)
        var enlaceConfirmacion = $"{baseUrl}/Registro/ConfirmarEmail?token={Uri.EscapeDataString(token)}";
        try
        {
            using var cts = new System.Threading.CancellationTokenSource(TimeSpan.FromSeconds(30));
            var mensajeProfesional = $"Recibimos tu solicitud de registro como profesional en <strong style=\"color:#1A3C34;\">Trébol</strong>. " +
                                     "Para continuar, haz clic en el botón y crea tu contraseña.";
            await emailHelper.EnviarAsync(
                vm.Correo,
                RegistroEmailTemplates.AsuntoConfirmacionCorreo,
                RegistroEmailTemplates.BuildConfirmacionCorreo(vm.NombreCompleto, enlaceConfirmacion, mensajeProfesional, horasValidez: 72),
                cts.Token);
        }
        catch (Exception ex)
        {
            ModelState.AddModelError(string.Empty, 
                $"No pudimos enviar el correo de confirmación. Por favor, intenta más tarde. Error: {ex.Message}");
            return View(vm);
        }

        TempData["Mensaje"] = "Te enviamos un enlace a tu correo. Haz clic en él para confirmar tu cuenta.";
        TempData["HorasEnlace"] = "72";
        return RedirectToAction("EsperaConfirmacion");
    }

    // GET /Registro/EsperaConfirmacion
    [HttpGet]
    public IActionResult EsperaConfirmacion()
    {
        ViewData["HorasEnlace"] = TempData["HorasEnlace"] ?? "72";
        return View();
    }

    // GET /Registro/ConfirmarEmail?token=xxx
    [HttpGet]
    public async Task<IActionResult> ConfirmarEmail(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return RedirectToAction("Index", "Login");

        // Validar el token INMEDIATAMENTE antes de mostrar el formulario
        var esValido = await profesionalRepo.EsTokenValidoAsync(token);
        var vm = new ConfirmarEmailViewModel { Token = token };

        if (!esValido)
        {
            // Token inválido o ya usado - mostrar error modal directamente
            ModelState.AddModelError(string.Empty, "Ocurrió un error al procesar tu solicitud. Por favor, intenta iniciar sesión.");
            ViewData["ShowErrorModal"] = true;
        }

        return View(vm);
    }

    // POST /Registro/ConfirmarEmail
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ConfirmarEmail(ConfirmarEmailViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        var passwordHash = passwordHelper.HashPassword(vm.Password);
        var resultado = await profesionalRepo.ConfirmarEmailAsync(vm.Token, passwordHash);

        if (!resultado.Exito)
        {
            // Mostrar error genérico sin revelar la causa específica
            ModelState.AddModelError(string.Empty, "Ocurrió un error al procesar tu solicitud. Por favor, intenta iniciar sesión.");
            ViewData["ShowErrorModal"] = true;
            return View(vm);
        }

        return RedirectToAction("EsperaAprobacion");
    }

    // GET /Registro/EsperaAprobacion
    [HttpGet]
    public IActionResult EsperaAprobacion() => View();

    // GET /Registro/ReenviarDocumentos
    [HttpGet]
    public IActionResult ReenviarDocumentos(string? correo)
        => View(new ReenviarDocumentosViewModel { Correo = correo ?? string.Empty });

    // POST /Registro/ReenviarDocumentos
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ReenviarDocumentos(ReenviarDocumentosViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        if (vm.FotocopiaCedula is null || vm.FotocopiaCedula.Length == 0)
        {
            ModelState.AddModelError("FotocopiaCedula", RegistroConstant.ArchivoPdfRequerido);
            return View(vm);
        }
        if (vm.FotocopiaTarjeta is null || vm.FotocopiaTarjeta.Length == 0)
        {
            ModelState.AddModelError("FotocopiaTarjeta", RegistroConstant.ArchivoPdfRequerido);
            return View(vm);
        }

        var profesional = await profesionalRepo.ObtenerPorCorreoAsync(vm.Correo);
        if (profesional is null || profesional.Estado != "RECHAZADO")
        {
            ModelState.AddModelError(string.Empty, "No se encontró una solicitud rechazada con ese correo.");
            return View(vm);
        }

        byte[] cedulaBytes;
        using (var ms = new MemoryStream()) { await vm.FotocopiaCedula.CopyToAsync(ms); cedulaBytes = ms.ToArray(); }
        byte[] tarjetaBytes;
        using (var ms = new MemoryStream()) { await vm.FotocopiaTarjeta.CopyToAsync(ms); tarjetaBytes = ms.ToArray(); }

        var resultado = await profesionalRepo.ReenviarDocumentosAsync(profesional.ProfesionalId);
        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            return View(vm);
        }

        // Reenviar documentos al admin
        var correoAdmin = config["App:CorreoAdmin"] ?? config["Email:Remitente"] ?? string.Empty;
        if (!string.IsNullOrEmpty(correoAdmin))
        {
            var cuerpoAdmin = BuildEmailAdminNuevoProfesional(profesional.NombreCompleto, profesional.Correo, profesional.NumeroDocumento, profesional.NumerTarjetaProfesional);
            _ = Task.Run(async () =>
            {
                try
                {
                    using var cts = new System.Threading.CancellationTokenSource(TimeSpan.FromSeconds(30));
                    await emailHelper.EnviarConAdjuntosAsync(
                        correoAdmin,
                        $"[Trébol] Re-envío de documentos — {profesional.NombreCompleto}",
                        cuerpoAdmin,
                        [
                            (cedulaBytes,  $"cedula_{profesional.NumeroDocumento}.pdf",              "application/pdf"),
                            (tarjetaBytes, $"tarjeta_{profesional.NumerTarjetaProfesional}.pdf", "application/pdf")
                        ],
                        cts.Token);
                }
                catch { }
            });
        }

        TempData["Mensaje"] = "Tus documentos fueron reenviados. El equipo de revisión los analizará pronto.";
        return RedirectToAction("EsperaAprobacion");
    }

    // ═ Email helpers ═

    private static string BuildEmailAdminNuevoProfesional(string nombre, string correo, string documento, string tarjeta) => $"""
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f0f4f3;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f3;padding:32px 16px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,60,52,.12);">
                <tr>
                  <td style="background:linear-gradient(135deg,#1A3C34 0%,#2D6A4F 100%);padding:32px 40px;text-align:center;">
                    <div style="font-size:2rem;margin-bottom:8px;">🍀</div>
                    <div style="color:#ffffff;font-size:1.5rem;font-weight:700;letter-spacing:.5px;">Trébol</div>
                    <div style="color:rgba(255,255,255,.7);font-size:.8rem;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">Plataforma de Psicología</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px;">
                    <div style="background:#FFF8E1;border-left:4px solid #F9A825;padding:14px 20px;margin-top:28px;border-radius:0 8px 8px 0;">
                      <span style="color:#F57F17;font-weight:700;font-size:.85rem;">⏳ NUEVA SOLICITUD DE PROFESIONAL</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 40px 8px;">
                    <p style="color:#374151;font-size:.95rem;line-height:1.6;margin:0 0 20px;">Se recibió una nueva solicitud. Los documentos adjuntos requieren revisión manual.</p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                      <tr style="background:#f9fafb;">
                        <td style="padding:10px 16px;font-size:.78rem;font-weight:700;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e7eb;" width="40%">Campo</td>
                        <td style="padding:10px 16px;font-size:.78rem;font-weight:700;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Valor</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 16px;font-size:.88rem;color:#6b7280;border-bottom:1px solid #f3f4f6;">👤 Nombre</td>
                        <td style="padding:12px 16px;font-size:.88rem;font-weight:600;color:#1A3C34;border-bottom:1px solid #f3f4f6;">{nombre}</td>
                      </tr>
                      <tr style="background:#f9fafb;">
                        <td style="padding:12px 16px;font-size:.88rem;color:#6b7280;border-bottom:1px solid #f3f4f6;">📧 Correo</td>
                        <td style="padding:12px 16px;font-size:.88rem;font-weight:600;color:#1A3C34;border-bottom:1px solid #f3f4f6;">{correo}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 16px;font-size:.88rem;color:#6b7280;border-bottom:1px solid #f3f4f6;">🧧 N.° Cédula</td>
                        <td style="padding:12px 16px;font-size:.88rem;font-weight:600;color:#1A3C34;border-bottom:1px solid #f3f4f6;">{documento}</td>
                      </tr>
                      <tr style="background:#f9fafb;">
                        <td style="padding:12px 16px;font-size:.88rem;color:#6b7280;">🎓 Tarjeta profesional</td>
                        <td style="padding:12px 16px;font-size:.88rem;font-weight:600;color:#1A3C34;">{tarjeta}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 40px;">
                    <div style="background:#E8F5E9;border-radius:10px;padding:14px 18px;">
                      <span style="font-size:1.1rem;">📎</span>
                      <span style="color:#2D6A4F;font-size:.85rem;font-weight:600;"> Documento de identidad adjunto en este correo</span>
                    </div>
                  </td>
                </tr>
                <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                  <p style="color:#9ca3af;font-size:.75rem;margin:0;">© 2026 Trébol · Plataforma de Psicología · Correo generado automáticamente</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;
}
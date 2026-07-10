using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Configuracion;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Domain.Interfaces.Catalogos;
using Trebol.Helpers.Email;
using Microsoft.Extensions.Configuration;
using Trebol.Web.Helpers;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController(
    INotificacionRepository notificacionRepo,
    IProfesionalRepository  profesionalRepo,
    IConfiguracionRepository configRepo,
    IEmailHelper            emailHelper,
    IConfiguration          config) : Controller
{
    public async Task<IActionResult> BandejaNotificaciones()
    {
        var notificaciones = await notificacionRepo.ObtenerPendientesAdminAsync();
        return View(notificaciones);
    }

    public async Task<IActionResult> Configuracion()
    {
        var ivaTxt = await configRepo.ObtenerValorAsync(ConfiguracionClavesConstant.PorcentajeIvaCita, HttpContext.RequestAborted);
        if (!decimal.TryParse(ivaTxt, System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var iva))
            iva = ConfiguracionClavesConstant.PorcentajeIvaCitaDefault;

        ViewBag.PorcentajeIva = iva;
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> GuardarIva(decimal porcentajeIva)
    {
        if (porcentajeIva < 0 || porcentajeIva > 100)
        {
            TempData["Error"] = "El porcentaje de IVA debe estar entre 0 y 100.";
            return RedirectToAction(nameof(Configuracion));
        }

        await configRepo.GuardarValorAsync(
            ConfiguracionClavesConstant.PorcentajeIvaCita,
            porcentajeIva.ToString(System.Globalization.CultureInfo.InvariantCulture),
            ct: HttpContext.RequestAborted);

        TempData["Mensaje"] = "Porcentaje de IVA actualizado correctamente.";
        return RedirectToAction(nameof(Configuracion));
    }

    // POST /Admin/MarcarLeida
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> MarcarLeida(int notificacionId)
    {
        await notificacionRepo.MarcarLeidaAsync(notificacionId);
        return Json(new { exito = true });
    }

    // POST /Admin/MarcarTodasLeidas
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> MarcarTodasLeidas()
    {
        await notificacionRepo.MarcarTodasLeidasAsync();
        return Json(new { exito = true });
    }

    // POST /Admin/AprobarProfesional
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AprobarProfesional(int profesionalId)
    {
        var profesional = await profesionalRepo.ObtenerPorIdAsync(profesionalId);
        if (profesional is null)
            return Json(new { exito = false, mensaje = "Profesional no encontrado." });

        var resultado = await profesionalRepo.AprobarAsync(profesionalId, true);
        if (!resultado.Exito)
            return Json(new { exito = false, mensaje = resultado.Mensaje });

        var baseUrl = config["App:BaseUrl"] ?? "https://localhost:7072";
        _ = Task.Run(async () =>
        {
            try
            {
                using var cts = new System.Threading.CancellationTokenSource(TimeSpan.FromSeconds(30));
                await emailHelper.EnviarAsync(
                    profesional.Correo,
                    "🍀 ¡Tu cuenta en Trébol ha sido aprobada!",
                    BuildEmailBienvenida(profesional.NombreCompleto, baseUrl),
                    cts.Token);
            }
            catch { }
        });

        return Json(new { exito = true, mensaje = "Profesional aprobado y notificado por correo." });
    }

    // POST /Admin/RechazarProfesional
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RechazarProfesional(int profesionalId, string motivo)
    {
        var profesional = await profesionalRepo.ObtenerPorIdAsync(profesionalId);
        if (profesional is null)
            return Json(new { exito = false, mensaje = "Profesional no encontrado." });

        var resultado = await profesionalRepo.AprobarAsync(profesionalId, false, motivo);
        if (!resultado.Exito)
            return Json(new { exito = false, mensaje = resultado.Mensaje });

        var baseUrl = config["App:BaseUrl"] ?? "https://localhost:7072";
        _ = Task.Run(async () =>
        {
            try
            {
                using var cts = new System.Threading.CancellationTokenSource(TimeSpan.FromSeconds(30));
                await emailHelper.EnviarAsync(
                    profesional.Correo,
                    "❌ Tu solicitud en Trébol fue rechazada",
                    BuildEmailRechazo(profesional.NombreCompleto, System.Net.WebUtility.HtmlEncode(motivo ?? string.Empty),
                        $"{baseUrl}/Registro/ReenviarDocumentos?correo={Uri.EscapeDataString(profesional.Correo)}"),
                    cts.Token);
            }
            catch { }
        });

        return Json(new { exito = true, mensaje = "Profesional rechazado y notificado por correo." });
    }

    private static string BuildEmailBienvenida(string nombre, string baseUrl) => $"""
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f0f4f3;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f3;padding:32px 16px;">
            <tr><td align="center">
              <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(26,60,52,.15);">
                <tr>
                  <td style="background:linear-gradient(145deg,#1A3C34 0%,#2D6A4F 55%,#52B788 100%);padding:48px 40px 40px;text-align:center;">
                    <div style="font-size:3rem;margin-bottom:12px;">🍀</div>
                    <h1 style="color:#ffffff;font-size:1.8rem;font-weight:800;margin:0 0 8px;">¡Bienvenido a Trébol, {nombre}!</h1>
                    <p style="color:rgba(255,255,255,.85);font-size:1rem;margin:0;">Tu solicitud fue <strong style="color:#B7E4C7;">aprobada</strong>. Ya puedes ingresar a la plataforma.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 40px 8px;">
                    <div style="background:linear-gradient(135deg,#E8F5E9,#F1F8F4);border:1px solid #A8D8B9;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
                      <span style="font-size:1.8rem;">✅</span>
                      <p style="color:#1A3C34;font-weight:700;margin:8px 0 0;">¡Tu cuenta está activa y lista para usar!</p>
                    </div>
                    <p style="color:#374151;font-size:.95rem;line-height:1.7;">
                      Ahora puedes iniciar sesión con tu correo y contraseña, publicar salas de conferencia, gestionar citas y conectar con pacientes en toda Colombia.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 40px 32px;text-align:center;">
                      {EmailCta.Build($"{baseUrl}/Login", "Ir al inicio de sesión →")}
                  </td>
                </tr>
                <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                  <p style="color:#9ca3af;font-size:.75rem;margin:0;">© 2026 Trébol · Plataforma de Psicología</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;

    private static string BuildEmailRechazo(string nombre, string motivo, string enlaceReenvio) => $"""
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f0f4f3;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f3;padding:32px 16px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,60,52,.12);">
                <tr>
                  <td style="background:linear-gradient(135deg,#7f1d1d 0%,#b91c1c 100%);padding:40px;text-align:center;">
                    <div style="font-size:2.5rem;margin-bottom:8px;">❌</div>
                    <h1 style="color:#fff;font-size:1.5rem;font-weight:800;margin:0 0 8px;">Solicitud no aprobada</h1>
                    <p style="color:rgba(255,255,255,.8);font-size:.95rem;margin:0;">Hola {nombre}, revisamos tu solicitud</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 40px 8px;">
                    <p style="color:#374151;font-size:.95rem;line-height:1.7;">Lamentamos informarte que tu solicitud de registro en Trébol no pudo ser aprobada en esta ocasión.</p>
                    <div style="background:#FFF5F5;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
                      <p style="color:#b91c1c;font-weight:700;font-size:.85rem;margin:0 0 6px;text-transform:uppercase;letter-spacing:.05em;">Motivo del rechazo:</p>
                      <p style="color:#374151;font-size:.9rem;margin:0;">{motivo}</p>
                    </div>
                    <p style="color:#374151;font-size:.9rem;line-height:1.7;">Puedes corregir los documentos y reenviar tu solicitud haciendo clic en el botón a continuación:</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 40px 32px;text-align:center;">
                      {EmailCta.Build(enlaceReenvio, "Reenviar documentos corregidos →")}
                  </td>
                </tr>
                <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                  <p style="color:#9ca3af;font-size:.75rem;margin:0;">© 2026 Trébol · Plataforma de Psicología</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;
}
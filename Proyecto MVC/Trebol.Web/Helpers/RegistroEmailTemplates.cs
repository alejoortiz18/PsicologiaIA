using System.Net;

namespace Trebol.Web.Helpers;

/// <summary>Plantillas HTML estándar para correos de confirmación de registro.</summary>
public static class RegistroEmailTemplates
{
    public const string AsuntoConfirmacionCorreo = "🍀 Confirma tu correo en Trébol";

    public static string BuildConfirmacionCorreo(
        string nombre,
        string enlace,
        string mensajeRegistro,
        int horasValidez,
        string textoBoton = "✅ Confirmar correo y crear contraseña")
    {
        var nombreSeguro = WebUtility.HtmlEncode(nombre);
        var enlaceSeguro = WebUtility.HtmlEncode(enlace);
        var horasTexto   = horasValidez == 1 ? "1 hora" : $"{horasValidez} horas";

        return $"""
            <!DOCTYPE html>
            <html lang="es">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background:#f0f4f3;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f3;padding:32px 16px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,60,52,.12);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#1A3C34 0%,#2D6A4F 100%);padding:40px;text-align:center;">
                        <div style="font-size:2.5rem;margin-bottom:8px;">🍀</div>
                        <h1 style="color:#fff;font-size:1.6rem;font-weight:800;margin:0 0 8px;">Confirma tu correo</h1>
                        <p style="color:rgba(255,255,255,.8);font-size:.95rem;margin:0;">Hola {nombreSeguro}, un paso más para unirte a Trébol</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px 40px 8px;">
                        <p style="color:#374151;font-size:.95rem;line-height:1.7;">
                          {mensajeRegistro}
                        </p>
                        <div style="background:#E8F5E9;border-radius:10px;padding:14px 18px;margin:16px 0;">
                          <span style="color:#2D6A4F;font-size:.85rem;">⏱ Este enlace es válido por <strong>{horasTexto}</strong>.</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:16px 40px 32px;text-align:center;">
                        {EmailCta.Build(enlace, textoBoton)}
                        <p style="color:#9ca3af;font-size:.75rem;margin-top:12px;">O copia este enlace en tu navegador:<br><span style="color:#2D6A4F;word-break:break-all;">{enlaceSeguro}</span></p>
                      </td>
                    </tr>
                    <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                      <p style="color:#9ca3af;font-size:.75rem;margin:0;">© 2026 Trébol · Plataforma de Psicología · Correo automático, no respondas.</p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;
    }

    public static string BuildCuentaActivaUsuario(string nombre, string enlaceLogin)
    {
        var nombreSeguro = WebUtility.HtmlEncode(nombre);
        var enlaceSeguro = WebUtility.HtmlEncode(enlaceLogin);

        return $"""
            <!DOCTYPE html>
            <html lang="es">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background:#f0f4f3;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f3;padding:32px 16px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,60,52,.12);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#1A3C34 0%,#2D6A4F 100%);padding:40px;text-align:center;">
                        <div style="font-size:2.5rem;margin-bottom:8px;">🍀</div>
                        <h1 style="color:#fff;font-size:1.6rem;font-weight:800;margin:0 0 8px;">¡Cuenta activa!</h1>
                        <p style="color:rgba(255,255,255,.8);font-size:.95rem;margin:0;">Hola {nombreSeguro}, ya puedes usar Trébol</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px 40px 8px;">
                        <p style="color:#374151;font-size:.95rem;line-height:1.7;margin:0 0 16px;">
                          Tu correo fue confirmado y tu contraseña quedó registrada. Tu cuenta de <strong>usuario</strong> está lista.
                        </p>
                        <div style="background:#E8F5E9;border-radius:10px;padding:14px 18px;">
                          <span style="color:#2D6A4F;font-size:.85rem;font-weight:600;">✅ Ya puedes iniciar sesión y explorar salas, conferencias y citas.</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:16px 40px 32px;text-align:center;">
                        {EmailCta.Build(enlaceLogin, "Iniciar sesión en Trébol →")}
                      </td>
                    </tr>
                    <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                      <p style="color:#9ca3af;font-size:.75rem;margin:0;">© 2026 Trébol · Plataforma de Psicología · Correo automático, no respondas.</p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;
    }
}

using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace Trebol.Helpers.Email;

/// <summary>
/// Envío SMTP (Gmail). Configurar en appsettings.Development.json:
/// Remitente y Contrasena desde configuración (contraseña de aplicación Google).
/// </summary>
public class EmailHelper(IConfiguration config) : IEmailHelper
{
    private string Remitente => config["Email:Remitente"]
        ?? throw new InvalidOperationException("Email:Remitente no configurado.");

    private string Contrasena => (config["Email:Contrasena"] ?? "").Replace(" ", "");

    public async Task EnviarAsync(string destinatario, string asunto, string cuerpoHtml,
                                  CancellationToken ct = default)
    {
        var mensaje = CrearMensaje(destinatario, asunto, cuerpoHtml);
        await EnviarMensajeAsync(mensaje, ct);
    }

    public async Task EnviarConEnlaceAsync(string destinatario, string asunto, string plantilla,
                                           string enlace, CancellationToken ct = default)
        => await EnviarAsync(destinatario, asunto, plantilla.Replace("{enlace}", enlace), ct);

    public async Task EnviarConAdjuntosAsync(
        string destinatario, string asunto, string cuerpoHtml,
        IEnumerable<(byte[] Contenido, string NombreArchivo, string MimeType)> adjuntos,
        CancellationToken ct = default)
    {
        var builder = new BodyBuilder { HtmlBody = cuerpoHtml };
        foreach (var (contenido, nombreArchivo, _) in adjuntos)
            builder.Attachments.Add(nombreArchivo, contenido);

        var mensaje = CrearMensaje(destinatario, asunto, builder.ToMessageBody());
        await EnviarMensajeAsync(mensaje, ct);
    }

    private MimeMessage CrearMensaje(string destinatario, string asunto, string cuerpoHtml)
    {
        var mensaje = new MimeMessage();
        mensaje.From.Add(new MailboxAddress("Trébol", Remitente));
        mensaje.To.Add(MailboxAddress.Parse(destinatario));
        mensaje.Subject = asunto;
        mensaje.Body = new TextPart("html") { Text = cuerpoHtml };
        return mensaje;
    }

    private MimeMessage CrearMensaje(string destinatario, string asunto, MimeEntity cuerpo)
    {
        var mensaje = new MimeMessage();
        mensaje.From.Add(new MailboxAddress("Trébol", Remitente));
        mensaje.To.Add(MailboxAddress.Parse(destinatario));
        mensaje.Subject = asunto;
        mensaje.Body = cuerpo;
        return mensaje;
    }

    private async Task EnviarMensajeAsync(MimeMessage mensaje, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(Contrasena))
            throw new InvalidOperationException(
                "Email:Contrasena vacía. Configura la contraseña de aplicación de Gmail en appsettings.Development.json.");

        var host = config["Email:Host"] ?? "smtp.gmail.com";
        var port = int.Parse(config["Email:Port"] ?? "587");

        using var cliente = new SmtpClient();
        await cliente.ConnectAsync(host, port, SecureSocketOptions.StartTls, ct);
        await cliente.AuthenticateAsync(Remitente, Contrasena, ct);
        await cliente.SendAsync(mensaje, ct);
        await cliente.DisconnectAsync(true, ct);
    }
}

using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using Microsoft.Extensions.Configuration;

namespace Trebol.Helpers.Email;

/// <summary>
/// Configurar en appsettings.json:
/// "Email": { "Host": "smtp.gmail.com", "Port": "587",
///            "Remitente": "noreply@trebol.com", "Contrasena": "" }
/// </summary>
public class EmailHelper(IConfiguration config) : IEmailHelper
{
    public async Task EnviarAsync(string destinatario, string asunto, string cuerpoHtml,
                                  CancellationToken ct = default)
    {
        using var smtp = CrearCliente();
        using var msg  = new MailMessage(config["Email:Remitente"]!, destinatario)
        {
            Subject    = asunto,
            Body       = cuerpoHtml,
            IsBodyHtml = true
        };
        await smtp.SendMailAsync(msg, ct);
    }

    public async Task EnviarConEnlaceAsync(string destinatario, string asunto, string plantilla,
                                           string enlace, CancellationToken ct = default)
        => await EnviarAsync(destinatario, asunto,
                             plantilla.Replace("{enlace}", enlace), ct);

    public async Task EnviarConAdjuntosAsync(
        string destinatario, string asunto, string cuerpoHtml,
        IEnumerable<(byte[] Contenido, string NombreArchivo, string MimeType)> adjuntos,
        CancellationToken ct = default)
    {
        using var smtp = CrearCliente();
        using var msg  = new MailMessage(config["Email:Remitente"]!, destinatario)
        {
            Subject    = asunto,
            Body       = cuerpoHtml,
            IsBodyHtml = true
        };

        var streams = new List<MemoryStream>();
        try
        {
            foreach (var (contenido, nombreArchivo, mimeType) in adjuntos)
            {
                var ms = new MemoryStream(contenido);
                streams.Add(ms);
                msg.Attachments.Add(new Attachment(ms, nombreArchivo, mimeType));
            }
            await smtp.SendMailAsync(msg, ct);
        }
        finally
        {
            foreach (var s in streams) await s.DisposeAsync();
        }
    }

    private SmtpClient CrearCliente() => new()
    {
        Host                  = config["Email:Host"]!,
        Port                  = int.Parse(config["Email:Port"]!),
        EnableSsl             = true,
        UseDefaultCredentials = false,
        Timeout               = 25_000,   // 25 segundos máximo
        Credentials           = new NetworkCredential(
                                    config["Email:Remitente"],
                                    config["Email:Contrasena"])
    };
}

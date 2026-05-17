namespace Trebol.Helpers.Email;

public interface IEmailHelper
{
    Task EnviarAsync(string destinatario, string asunto, string cuerpoHtml,
                     CancellationToken ct = default);

    Task EnviarConEnlaceAsync(string destinatario, string asunto, string plantilla,
                              string enlace, CancellationToken ct = default);

    /// <summary>Envía un correo con uno o más adjuntos en memoria.</summary>
    Task EnviarConAdjuntosAsync(string destinatario, string asunto, string cuerpoHtml,
                                IEnumerable<(byte[] Contenido, string NombreArchivo, string MimeType)> adjuntos,
                                CancellationToken ct = default);
}

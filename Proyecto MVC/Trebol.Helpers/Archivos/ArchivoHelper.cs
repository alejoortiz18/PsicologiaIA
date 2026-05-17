using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Trebol.Constants.Messages;

namespace Trebol.Helpers.Archivos;

/// <summary>
/// Guarda archivos en wwwroot/uploads/.
/// PDFs: solo .pdf, máximo 5 MB → /uploads/profesionales/{id}/
/// Fotos: JPG/PNG/WEBP, máximo 2 MB → /uploads/{carpeta}/{id}/
/// </summary>
public class ArchivoHelper(IWebHostEnvironment env) : IArchivoHelper
{
    private const long MaxPdfBytes   = 5 * 1024 * 1024;  // 5 MB
    private const long MaxFotoBytes  = 2 * 1024 * 1024;  // 2 MB
    private static readonly string[] ExtensionesImagen = [".jpg", ".jpeg", ".png", ".webp"];

    public async Task<string> GuardarPdfAsync(IFormFile archivo, int profesionalId,
                                               string tipo, CancellationToken ct = default)
    {
        var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        if (extension != ".pdf" || archivo.Length > MaxPdfBytes)
            throw new InvalidOperationException(RegistroConstant.ArchivoPdfRequerido);

        var carpeta = Path.Combine(env.WebRootPath, "uploads", "profesionales",
                                   profesionalId.ToString());
        Directory.CreateDirectory(carpeta);

        var nombreArchivo = $"{tipo}_{profesionalId}{extension}";
        var rutaCompleta  = Path.Combine(carpeta, nombreArchivo);

        await using var stream = new FileStream(rutaCompleta, FileMode.Create);
        await archivo.CopyToAsync(stream, ct);

        return $"/uploads/profesionales/{profesionalId}/{nombreArchivo}";
    }

    public async Task<string> GuardarFotoPerfilAsync(IFormFile foto, string carpeta,
                                                      int entidadId, CancellationToken ct = default)
    {
        var extension = Path.GetExtension(foto.FileName).ToLowerInvariant();
        if (!ExtensionesImagen.Contains(extension) || foto.Length > MaxFotoBytes)
            throw new InvalidOperationException(PerfilConstant.FormatoImagenInvalido);

        var ruta = Path.Combine(env.WebRootPath, "uploads", carpeta, entidadId.ToString());
        Directory.CreateDirectory(ruta);

        var nombreArchivo = $"foto_{entidadId}{extension}";
        var rutaCompleta  = Path.Combine(ruta, nombreArchivo);

        await using var stream = new FileStream(rutaCompleta, FileMode.Create);
        await foto.CopyToAsync(stream, ct);

        return $"/uploads/{carpeta}/{entidadId}/{nombreArchivo}";
    }
}

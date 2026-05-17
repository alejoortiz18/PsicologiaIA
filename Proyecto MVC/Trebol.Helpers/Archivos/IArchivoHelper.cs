namespace Trebol.Helpers.Archivos;

public interface IArchivoHelper
{
    /// <summary>Valida y guarda un PDF. Retorna la ruta relativa o lanza InvalidOperationException.</summary>
    Task<string> GuardarPdfAsync(Microsoft.AspNetCore.Http.IFormFile archivo,
                                  int profesionalId, string tipo,
                                  CancellationToken ct = default);

    /// <summary>Guarda una imagen de perfil. Retorna la ruta relativa.</summary>
    Task<string> GuardarFotoPerfilAsync(Microsoft.AspNetCore.Http.IFormFile foto,
                                         string carpeta, int entidadId,
                                         CancellationToken ct = default);
}

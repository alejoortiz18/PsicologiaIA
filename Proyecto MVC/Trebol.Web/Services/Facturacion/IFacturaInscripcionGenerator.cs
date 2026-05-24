using Trebol.Model.DTOs.Inscripcion;

namespace Trebol.Web.Services.Facturacion;

public interface IFacturaInscripcionGenerator
{
    byte[] GenerarPdf(InscripcionConfirmacionDto datos);
}

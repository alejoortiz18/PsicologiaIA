namespace Trebol.Web.Services;

public interface IInscripcionNotificacionService
{
    /// <summary>Envía correo de confirmación con factura PDF adjunta (no bloquea si falla SMTP).</summary>
    void EnviarConfirmacionEnSegundoPlano(int inscripcionId, string? metodoPagoOverride = null);
}

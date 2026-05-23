namespace Trebol.Constants.Pagos;

/// <summary>
/// Datos de prueba para PSE simulado en desarrollo.
/// </summary>
public static class PsePruebaConstant
{
    public const string Banco             = "bancolombia";
    public const string TipoDocumento     = "CC";
    public const string NumeroDocumento   = "4242424242";
    public const string Email             = "test.visual@yopmail.com";

    public const string MensajeAprobado = "Pago PSE simulado aprobado.";
    public const string MensajeInvalido   = "Datos PSE inválidos. Usa banco Bancolombia, CC y documento 4242424242.";
}

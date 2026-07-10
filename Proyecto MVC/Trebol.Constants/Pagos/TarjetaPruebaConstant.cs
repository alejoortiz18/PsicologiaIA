namespace Trebol.Constants.Pagos;

/// <summary>
/// Tarjeta de prueba para pagos simulados en desarrollo (futuro: Wompi).
/// </summary>
public static class TarjetaPruebaConstant
{
    public const string NumeroAprobada  = "4242424242424242";
    public const string NumeroRechazada = "4000000000000002";
    public const string CvvValido       = "123";
    public const string VencimientoValido = "12/30";
    public const string NombreValido    = "MARIA GARCIA TEST";

    public const string MensajeAprobado  = "Pago simulado aprobado.";
    public const string MensajeRechazado = "Tu banco rechazó la transacción (tarjeta de prueba rechazada).";
    public const string MensajeInvalida  = "Datos de tarjeta inválidos. Usa la tarjeta de prueba documentada.";
}

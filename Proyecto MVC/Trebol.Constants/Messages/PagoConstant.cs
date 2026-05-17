namespace Trebol.Constants.Messages;

public static class PagoConstant
{
    public const string PagoAprobado      = "¡Pago confirmado! Revisa tu correo.";
    public const string PagoRechazado     = "El pago fue rechazado. Verifica tus datos e intenta de nuevo.";
    public const string PagoPendiente     = "Tu pago está siendo procesado.";
    public const string PagoNoEncontrado  = "El registro de pago no fue encontrado.";
    public const decimal TarifaFijaCita   = 5000m;  // $5.000 COP tarifa de plataforma por cita
}

namespace Trebol.Constants.Messages;

public static class NovedadConstant
{
    public const string AvisoEventoEnVivoPago =
        "Si eliges retirar el dinero (saldo a favor o dinero en tránsito), perderás tu inscripción " +
        "y no podrás volver a ingresar al evento a menos que realices un nuevo pago. " +
        "La opción «Retirarse sin retirar dinero» te permite salir temporalmente (por ejemplo, " +
        "por problemas de conexión) y volver a conectarte sin perder tu lugar.";

    public const string SalirSinDineroExito =
        "Saliste del evento. Puedes volver a ingresar cuando lo desees.";

    public const string RetirarSaldoFavorExito =
        "Se generó saldo a favor. Tu inscripción al evento fue cancelada.";

    public const string RetirarDineroTransitoExito =
        "Tu dinero está en tránsito hacia tu cuenta bancaria. Tu inscripción al evento fue cancelada.";
}

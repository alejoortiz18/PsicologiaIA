namespace Trebol.Constants.Messages;

public static class SaldoConstant
{
    public const string CuentaBancariaGuardada     = "Datos bancarios guardados correctamente.";
    public const string CuentaBancariaIncompleta   = "Completa todos los datos bancarios obligatorios.";
    public const string RetiroSinSaldo             = "No tienes saldo a favor disponible.";
    public const string RetiroSinCuenta            = "Debes registrar tus datos bancarios antes de retirar.";
    public const string RetiroSolicitado           = "Retiro solicitado correctamente.";
    public const string RetiroRetractado           = "Retiro cancelado. El saldo volvió a tu cuenta a favor.";
    public const string ModalRetiroTitulo          = "Confirmar retiro bancario";
    public const string ModalRetiroAdvertencia     =
        "Señor usuario, verifique que los datos bancarios estén bien ingresados. " +
        "La aplicación desembolsará al número de cuenta agregado en su perfil. " +
        "En caso de equivocarse en el número de cuenta, la aplicación no responderá por el mal ingreso de los datos.";
}

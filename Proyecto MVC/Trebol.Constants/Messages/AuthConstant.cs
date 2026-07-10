namespace Trebol.Constants.Messages;

public static class AuthConstant
{
    public const string CredencialesInvalidas  = "Correo o contraseña incorrectos.";
    public const string CuentaBloqueada        = "Tu cuenta está bloqueada. Contacta al administrador.";
    public const string CuentaPendiente        = "Tu cuenta está pendiente de validación. Recibirás un correo cuando sea aprobada.";
    public const string CuentaSinConfirmar     = "Tu cuenta aún no ha sido confirmada. Revisa tu correo o solicita un nuevo enlace de confirmación.";
    public const string CuentaEnRevision       = "Tu solicitud está siendo revisada. Recibirás un correo con el resultado en 3–5 días hábiles.";
    public const string CuentaRechazada        = "Tu solicitud fue rechazada. Revisa el correo de notificación y reenvia tus documentos corregidos.";
    public const string TokenInvalido          = "El enlace es inválido o ha expirado.";
    public const string TokenUsado             = "Este enlace ya fue utilizado.";
    public const string SesionCerrada          = "Tu sesión ha expirado. Por favor inicia sesión de nuevo.";
    public const string AccesoDenegado         = "No tienes permisos para acceder a esta sección.";
    public const string PasswordCambiado       = "Tu contraseña fue cambiada exitosamente.";
    public const string RecuperacionEnviada    = "Te enviamos un enlace de recuperación a tu correo.";
}

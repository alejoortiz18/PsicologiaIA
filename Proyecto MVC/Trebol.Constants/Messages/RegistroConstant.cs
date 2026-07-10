namespace Trebol.Constants.Messages;

public static class RegistroConstant
{
    public const string CorreoDuplicado           = "Ya existe una cuenta con este correo electrónico.";
    public const string DocumentoDuplicado        = "Ya existe una cuenta con este número de documento.";
    public const string TarjetaDuplicada          = "El número de tarjeta profesional ya está registrado.";
    public const string RegistroExitoso           = "Tu cuenta fue creada. Revisa tu correo para activarla.";
    public const string RegistroProfesionalOk     = "Tu solicitud fue enviada. El proceso de verificación toma 3 a 5 días hábiles.";
    public const string ArchivoPdfRequerido       = "Solo se permiten archivos PDF (máximo 5 MB).";
    public const string ActivacionExitosa         = "¡Tu cuenta fue activada! Ya puedes iniciar sesión.";
    public const string AsuntoCuentaActiva        = "🍀 Tu cuenta en Trébol está activa";
    public const string AliasRequerido            = "El alias es obligatorio.";
    public const string CelularRequerido          = "El número de celular es obligatorio.";
    public const string TokenInvalidoUsuario      = "Este enlace no es válido, ya fue utilizado o expiró. Solicita un nuevo enlace de confirmación.";
    public const string ReenvioConfirmacionEnviado = "Si tu cuenta está pendiente de confirmación, te enviamos un nuevo enlace a tu correo.";
    public const string CorreoPendienteConfirmacion = "Este correo ya está registrado pero no ha sido confirmado. Puedes solicitar un nuevo enlace de confirmación.";
}

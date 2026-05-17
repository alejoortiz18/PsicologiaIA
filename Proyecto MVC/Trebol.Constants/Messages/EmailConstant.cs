namespace Trebol.Constants.Messages;

public static class EmailConstant
{
    #region ACTIVACIÓN DE CUENTA — USUARIO
    public const string AsuntoActivarCuenta = "Activa tu cuenta en Trébol";
    public const string CuerpoActivarCuenta = @"
        <p>Hola,</p>
        <p>Bienvenido a <strong>Trébol</strong>. Haz clic en el siguiente enlace para activar tu cuenta y crear tu contraseña:</p>
        <p><a href='{enlace}' style='background:#16a34a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;'>Activar cuenta</a></p>
        <p><strong>Vigencia: 24 horas.</strong> Si no creaste esta cuenta, ignora este mensaje.</p>
        <p>Atentamente,<br/><strong>Equipo Trébol</strong></p>";
    #endregion

    #region ACTIVACIÓN DE CUENTA — PROFESIONAL
    public const string AsuntoActivarProfesional = "Tu solicitud en Trébol fue aprobada";
    public const string CuerpoActivarProfesional = @"
        <p>Hola {nombre},</p>
        <p>Tu perfil profesional en <strong>Trébol</strong> fue verificado y aprobado. Haz clic en el enlace para crear tu contraseña:</p>
        <p><a href='{enlace}' style='background:#16a34a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;'>Crear contraseña</a></p>
        <p><strong>Vigencia: 48 horas.</strong></p>
        <p>Atentamente,<br/><strong>Equipo Trébol</strong></p>";
    #endregion

    #region RECUPERACIÓN DE CONTRASEÑA
    public const string AsuntoRecuperacion = "Restablece tu contraseña en Trébol";
    public const string CuerpoRecuperacion = @"
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Trébol</strong>.</p>
        <p><a href='{enlace}' style='background:#16a34a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;'>Restablecer contraseña</a></p>
        <p><strong>Vigencia: 1 hora.</strong> Si no solicitaste este cambio, ignora este mensaje.</p>
        <p>Atentamente,<br/><strong>Equipo Trébol</strong></p>";
    #endregion

    #region CONFIRMACIÓN DE CITA
    public const string AsuntoConfirmacionCita = "Cita confirmada en Trébol";
    public const string CuerpoConfirmacionCita = @"
        <p>Hola {nombre},</p>
        <p>Tu cita ha sido confirmada exitosamente.</p>
        <ul>
          <li><strong>Profesional:</strong> {profesional}</li>
          <li><strong>Fecha:</strong> {fecha}</li>
          <li><strong>Hora:</strong> {hora}</li>
        </ul>
        <p>Atentamente,<br/><strong>Equipo Trébol</strong></p>";
    #endregion

    #region CONFIRMACIÓN DE INSCRIPCIÓN
    public const string AsuntoConfirmacionInscripcion = "Inscripción confirmada en Trébol";
    public const string CuerpoConfirmacionInscripcion = @"
        <p>Hola {nombre},</p>
        <p>Tu inscripción al evento <strong>{evento}</strong> fue confirmada.</p>
        <p>Atentamente,<br/><strong>Equipo Trébol</strong></p>";
    #endregion
}

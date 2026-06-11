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
        <div style=""font-family:Segoe UI,Arial,sans-serif;max-width:560px;color:#333;"">
        <p>Hola <strong>{nombre}</strong>,</p>
        <p>Tu inscripción al evento <strong>{evento}</strong> quedó confirmada.</p>
        <table style=""width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;"">
          <tr><td style=""padding:6px 0;color:#666;"">Nombre</td><td style=""padding:6px 0;""><strong>{nombre}</strong></td></tr>
          <tr><td style=""padding:6px 0;color:#666;"">N° documento</td><td style=""padding:6px 0;""><strong>{documento}</strong></td></tr>
          <tr><td style=""padding:6px 0;color:#666;"">Código de inscripción</td><td style=""padding:6px 0;""><strong>{codigo}</strong></td></tr>
          <tr><td style=""padding:6px 0;color:#666;"">Orador</td><td style=""padding:6px 0;"">{orador}</td></tr>
          <tr><td style=""padding:6px 0;color:#666;"">Fecha del evento</td><td style=""padding:6px 0;"">{fecha}</td></tr>
          <tr><td style=""padding:6px 0;color:#666;"">Total</td><td style=""padding:6px 0;""><strong>{precio}</strong></td></tr>
          <tr><td style=""padding:6px 0;color:#666;"">Comprobante</td><td style=""padding:6px 0;"">{factura}</td></tr>
        </table>
        <ul style=""padding-left:20px;font-size:14px;"">{metodoPago}</ul>
        <p>Adjuntamos el comprobante en PDF a nombre de <strong>{nombre}</strong>.</p>
        <p style=""margin-top:24px;"">Atentamente,<br/><strong>Equipo Trébol</strong></p>
        </div>";
    #endregion
}

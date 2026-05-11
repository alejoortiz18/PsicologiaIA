# Documento Técnico de Roles — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server

---

## 1. Descripción General del Proyecto

**Trébol** es una plataforma digital de atención psicológica que conecta profesionales certificados en salud mental con personas que buscan acompañamiento terapéutico.

La plataforma permite:
- Sesiones anónimas o con trazabilidad clínica, según la elección del usuario.
- Conferencias abiertas (gratuitas) y pagas dictadas por profesionales.
- Agendamiento privado con calendario del profesional.
- Seguimiento clínico ético con historial psicológico controlado por el profesional.

---

## 2. Actores del Sistema

El sistema define tres perfiles de usuario:

| Actor | Descripción |
|---|---|
| **Usuario / Paciente** | Persona que busca acompañamiento psicológico o asesoría |
| **Profesional** | Psicólogo o terapeuta certificado que ofrece servicios en la plataforma |
| **Administrador** | Personal interno que valida documentos, modera y gestiona la plataforma |

---

## 3. Perfil Profesional

### 3.1 Descripción

El perfil Profesional es el entorno de trabajo de los psicólogos y terapeutas certificados. Comprende la administración de su cuenta, documentos, salas de conferencia, sesiones privadas, pagos y relación con usuarios.

### 3.2 Objetivos del Perfil Profesional

**Gestión de cuenta y perfil**
- Registrarse como profesional con validación de documentos.
- Actualizar información personal (excepto nombre, número de documento).
- Configurar cuentas bancarias para recibir pagos.
- Ver el saldo pendiente de pago por parte de la plataforma.

**Salas y conferencias**
- Crear salas públicas o privadas (pagas o gratuitas).
- Configurar nombre, descripción, cupo máximo, fechas de inicio y cierre.
- Habilitar o deshabilitar salas.
- Crear múltiples eventos dentro de una misma sala (por tema).
- Controlar el chat de la sala: habilitar o deshabilitar mensajes de usuarios.
- Encender o apagar cámara y micrófono durante sesiones.
- En salas privadas, el sistema solicita al profesional encender la cámara para garantizar la calidad de la atención.

**Agenda y citas privadas**
- Gestionar un calendario propio con disponibilidad configurable.
- Bloquear horas específicas para que los usuarios no puedan agendarlas.
- Ver citas próximas por mes en un panel resumen.
- Mover una cita programada con autorización del usuario. Si el usuario no acepta, se negocia un nuevo horario o se realiza la devolución del dinero.
- Visualizar solicitudes de usuarios para cambiar la fecha de una cita.

**Pacientes e historial clínico**
- Mantener un historial privado de sus pacientes.
- Registrar recomendaciones, seguimientos, medicamentos recetados y notas clínicas por cita.
- Compartir con otros profesionales únicamente la información que el profesional considere relevante, mediante un formulario de derivación.
- Omitir traslados a centros cuando el caso lo requiera.
- Bloquear o desbloquear usuarios.

**Mensajería y comunidad**
- Intercambiar mensajes directos con otros profesionales.
- Filtrar profesionales por especialidad o área de interés.
- Publicar mensajes de texto visibles en su perfil público.
- Recibir seguidores y reacciones ("me gusta") de usuarios.

**Financiero**
- Ver el total de ingresos generados en la plataforma.
- Ver el saldo a favor pendiente de pago.
- Configurar el valor por hora para cobrar a usuarios en citas privadas.
- Un pago previo a la plataforma es requerido para poder crear una sala o reservar un espacio.

---

### 3.3 Panel de Control Profesional (Dashboard)

El dashboard centraliza la información más relevante del profesional:

| Métrica | Descripción |
|---|---|
| Total ingresos | Suma acumulada de pagos recibidos |
| Eventos creados | Cantidad total de salas y sesiones creadas |
| Seguidores | Número de usuarios que siguen al profesional |
| Me gusta | Total de reacciones recibidas |
| Total cobrado por la plataforma | Comisión acumulada retenida por la plataforma |
| Saldo a favor (próximo pago) | Monto pendiente de transferencia al profesional |
| Próximos eventos | Cantidad y listado de eventos próximos propios |

---

## 4. Perfil Usuario / Paciente

### 4.1 Descripción

El usuario es la persona que busca acompañamiento psicológico o asesoría. Puede interactuar con profesionales, inscribirse a eventos y agendar citas privadas.

### 4.2 Objetivos del Perfil Usuario

**Registro y acceso**
- Registrarse sin necesidad de subir documentos.
- Elegir entre mostrar su nombre real o un alias (seudónimo) para mantener el anonimato en asesorías.

**Exploración de la plataforma**
- Ver en el inicio una galería de tarjetas con perfiles de profesionales.
- Buscar profesionales por nombre, apellido, número de cédula o especialidad.
- Filtrar profesionales por especialidad.
- Ver el número de seguidores de cada profesional.
- Seguir o dejar de seguir a un profesional.
- Ver la lista de profesionales que sigue y filtrarla.

**Salas y eventos**
- Ver todas las salas activas creadas por cada profesional.
- Ver los eventos abiertos disponibles.
- Inscribirse a un evento (pago o gratuito).
- Filtrar eventos por tipo o categoría.
- Ver la fecha de inicio de la sala más próxima a la cual está inscrito.
- Opinar en un evento únicamente cuando el profesional habilite el campo de mensajes.

**Citas privadas**
- Ver el calendario del profesional con los espacios disponibles.
- Separar una cita con pago previo.
- Elegir si la atención es psicológica (seguimiento clínico) o asesoría puntual.
- Solicitar al profesional el cambio de fecha de una cita.
- Recibir solicitudes del profesional para ser derivado a otro especialista.

**Comunicación**
- Enviar hasta dos mensajes de contacto al profesional en el primer contacto. Tras la respuesta, se habilita la conversación libre.
- No puede comunicarse con otros usuarios; solo con profesionales.

**Historial y privacidad**
- Ver su historial de pagos.
- Ver la cantidad de profesionales con los que ha tenido sesiones.
- Ver los eventos en los que se ha registrado.
- Habilitar o deshabilitar su cámara y micrófono durante sesiones.

**Opiniones**
- Opinar sobre un evento y sobre un profesional.

---

### 4.3 Vista de Cita — Usuario

Durante una cita privada, el usuario dispone de:

| Elemento | Descripción |
|---|---|
| Pantalla principal | Vista de cámara del profesional |
| Controles de sesión | Activar/desactivar cámara, activar/desactivar audio, enviar mensaje |
| Historial de cita | Fecha y hora de la cita, estado (recibida / cancelada / movida), duración |
| Recomendaciones del profesional | Notas o recomendaciones creadas por el profesional en esa sesión |

El usuario puede agregar comentarios privados visibles solo para sí mismo durante la sesión.

---

## 5. Perfil Administrador

### 5.1 Descripción

El administrador es el personal interno de la plataforma responsable de validar, moderar y auditar el sistema.

### 5.2 Responsabilidades

| Área | Responsabilidad |
|---|---|
| Verificación profesional | Revisar documentos de identidad y tarjeta profesional; habilitar o rechazar cuentas |
| Moderación | Gestionar contenido inapropiado, bloqueos y reportes |
| Finanzas | Control de comisiones, pagos y liquidaciones |
| Soporte | Atención de incidencias y resolución de problemas |
| Auditoría | Trazabilidad de acciones críticas del sistema |
| Métricas globales | Reportes de uso, crecimiento y salud de la plataforma |

---

## 6. Flujos Clave por Actor

### 6.1 Inscripción a Evento (Usuario)

```
1. El usuario navega al listado de conferencias disponibles.
2. Selecciona el evento de interés y visualiza:
   - Nombre del evento
   - Fecha: DD MMM YYYY (ej: 8 Oct 2026)
   - Hora: formato 12H (ej: 3PM)
   - Valor de inscripción
   - Capacidad máxima y cupos disponibles
   - Información del orador
3. Selecciona "Inscribirme".
4. El sistema valida en tiempo real la disponibilidad de cupos.
   - Sin cupos: muestra modal de aviso y termina el proceso.
   - Con cupos: continúa al proceso de pago.
5. El usuario completa el pago mediante la pasarela.
6. El sistema valida nuevamente los cupos tras el pago (previene sobreventa).
   - Sin cupos tras el pago: se inicia el proceso de devolución.
   - Con cupos: se confirma la inscripción.
7. El sistema registra al usuario, reduce el cupo en 1 y genera un código de inscripción.
8. Se envía correo de confirmación con nombre del evento, fecha, hora, sala y código.
```

### 6.2 Derivación de Paciente (Profesional)

```
1. El profesional accede al historial del paciente.
2. Selecciona la opción de derivar a otro profesional.
3. Completa el formulario de derivación con los datos que considera relevantes.
4. El sistema envía una copia al profesional destinatario.
5. El usuario recibe una notificación de la solicitud de derivación.
6. El usuario puede aceptar o rechazar la derivación.
```

---

## 7. Reglas de Negocio Transversales

| Regla | Descripción |
|---|---|
| RN-01 | No puede existir el mismo correo, número de documento o tarjeta profesional en dos cuentas |
| RN-02 | Un profesional solo puede tener una sesión activa simultáneamente |
| RN-03 | El token de validación de correo tiene vigencia de **1 hora** |
| RN-04 | El token de establecimiento de contraseña tiene vigencia de **1 día** |
| RN-05 | Las citas privadas requieren pago previo del usuario |
| RN-06 | El usuario no puede ver ni contactar a otros usuarios |
| RN-07 | Solo el profesional puede responder comentarios dirigidos a su perfil |
| RN-08 | Un usuario puede enviar hasta 2 mensajes iniciales a un profesional antes de que este responda |
| RN-09 | El profesional debe realizar un pago a la plataforma para crear una sala |
| RN-10 | Todos los mensajes del sistema se presentan mediante modal (sin `alert()` nativo) |
| **RN-11** | **Las contraseñas de todos los perfiles (Usuario, Profesional) se almacenan con doble encriptación Hash + Salt usando el algoritmo Argon2. La operación se centraliza en la Capa Helpers (`PasswordHelper`). Ningún texto plano se persiste ni se devuelve en consultas.** |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

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
- Duplicar salas existentes (solo salas cerradas) para reutilizar configuración.
- Controlar en tiempo real el sistema de preguntas de la conferencia: habilitar o deshabilitar que los asistentes envíen preguntas.
- Ver el alias de quien envía preguntas; los demás asistentes no ven quién pregunta.
- Gestionar la lista de asistentes conectados (con roles: Ponente, Profesional, Usuario).
- Enviar mensajes privados a asistentes específicos durante la conferencia.
- Encender o apagar cámara, micrófono y compartir pantalla durante sesiones.
- Ver el contador de asistentes conectados en tiempo real.
- Finalizar la conferencia con confirmación en modal (desconecta todos los asistentes).

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
- Intercambiar mensajes directos con usuarios y con otros profesionales.
- Filtrar profesionales por especialidad o área de interés.
- Publicar mensajes de texto visibles en su perfil público.
- Recibir seguidores y reacciones ("me gusta") de usuarios.

**Colegas y derivaciones**
- Vincular colegas (otros profesionales) para colaboración y derivaciones.
- Ver la lista de colegas vinculados con su estado en línea (en línea / ocupado / desconectado).
- Ver el número de pacientes compartidos y derivaciones activas por colega.
- Acceder al listado de pacientes compartidos con un colega específico.
- Desvincular un colega mediante confirmación en modal.
- Dirigirse a especialistas y psicólogos del directorio para vincularlos como colegas.

**Financiero**
- Ver el total de ingresos generados en la plataforma.
- Ver el saldo a favor pendiente de pago.
- Configurar el valor por hora para cobrar a usuarios en citas privadas.
- Un pago previo a la plataforma es requerido para poder crear una sala o reservar un espacio.

---

### 3.3 Panel de Control Profesional (Dashboard)

El dashboard (home-profesional) centraliza la información operativa del día:

| Indicador | Descripción |
|---|---|
| Citas hoy | Número de citas programadas para el día actual |
| Mis eventos hoy | Eventos (salas) que se realizan hoy |
| Citas próximas | Total de citas próximas agendadas |
| Seguidores | Número de usuarios que siguen al profesional |

El dashboard también muestra:
- Tabla de citas del día con acciones: **Ingresar**, Confirmar, Cancelar.
- Sección de eventos de colegas, agrupados por proximidad (hoy / esta semana / próximamente) con filtro por categoría.

### 3.4 Panel de Indicadores (KPI)

Vista dedicada (`perfil-pro-kpi`) con métricas de rendimiento por período (Todo / Este año / Este mes):

| Indicador | Descripción |
|---|---|
| Total de consultas | Número acumulado de citas atendidas |
| Clientes atendidos | Número de pacientes únicos atendidos |
| Ingresos totales | Suma acumulada de pagos recibidos |
| Saldo por pagar | Monto pendiente de transferencia al profesional (con fecha estimada) |
| Salas creadas | Número total de salas creadas (con desglose por estado) |
| Eventos organizados | Número total de eventos organizados |

Incluve gráfico de tendencia de ingresos (últimos 6 meses) y tabla de resumen por indicador con variación porcentual.

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

### 4.3 Vista de Cita — Usuario (sala-usuario)

Durante una cita privada, el usuario dispone de:

| Elemento | Descripción |
|---|---|
| Pantalla principal | Vista de cámara del profesional |
| Controles | Activar/desactivar cámara, activar/desactivar audio, abrir chat de sesión |
| Información de la cita | Fecha `DD MMM YYYY`, hora, estado (✓ Confirmada), duración |
| Control de alias | Toggle para mostrar alias o nombre real al profesional |
| Recomendaciones del profesional | Campo de solo lectura con las notas del profesional |
| Nota privada del usuario | Textarea editable; solo visible para el propio usuario |

**Notas de privacidad:**
- En citas de tipo **Asesoría**, la identidad del usuario es anónima; el profesional solo ve el alias.
- El usuario no tiene botón para finalizar la sesión; solo el profesional la cierra.
- Las notas privadas del usuario no son visibles para el profesional ni para la plataforma.

### 4.4 Vista de Conferencia — Usuario (sala-conferencia-usuario)

Durante una conferencia pública, el usuario dispone de:

| Elemento | Descripción |
|---|---|
| Video principal | Transmisión del profesional (ponente) |
| Alias visible | Chip con el seudónimo del usuario (`🎭 Tu alias: [alias]`) |
| Botón salir | Único control disponible para el usuario |
| Tab Preguntas | Envío de preguntas anónimas (si el ponente las habilita) |
| Tab Info | Detalles del evento, datos de privacidad, botón de mensaje privado al ponente |

**Privacidad en conferencia:**
- Las preguntas son completamente anónimas; los demás asistentes no ven quién las envió.
- Solo el ponente puede ver el alias del usuario que hizo una pregunta.
- Los usuarios no ven ni interactúan con otros asistentes.
- Cada usuario participa únicamente bajo su seudónimo.

### 4.5 Vista de Mis Mentores

Listado de profesionales que el usuario sigue, con:
- Fecha desde la que sigue a cada profesional.
- Filtro por tipo (Psicólogo / Especialista) y orden (Reciente / Nombre A-Z / Popularidad).
- Botón para dejar de seguir con confirmación en modal.

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

### 5.3 Bandeja de Notificaciones (bandeja-notificaciones)

Interfaz tipo cliente de correo para gestión de solicitudes y alertas del sistema:

**Estructura:**
- Panel izquierdo: carpetas de mensajes (Recibidos / Registros profesionales / Leídos) con contadores de no leídos.
- Panel derecho: lista de mensajes + visor de contenido del mensaje seleccionado.

**Tipos de mensajes:**
- `Registro profesional`: solicitud de activación de nueva cuenta de profesional con documentos adjuntos.
- `Sistema`: alertas internas automáticas.

**Flujo de aprobación de profesional:**
1. El administrador recibe el mensaje de tipo `Registro profesional`.
2. Lee el contenido (nombre, documento, tarjeta profesional, documentos PDF adjuntos).
3. Selecciona **Aprobar** o **Rechazar**.
   - **Aprobar**: modal de confirmación → se activa la cuenta → el profesional recibe correo con enlace para establecer contraseña.
   - **Rechazar**: modal con campo de texto para motivo del rechazo → se notifica al profesional con el motivo.
4. El mensaje pasa automáticamente a la carpeta **Leídos**.

**Funciones adicionales:**
- Búsqueda por asunto, remitente o nombre del profesional.
- Marcar todos como leídos.
- Contadores de no leídos actualizados en tiempo real.

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

### 6.3 Reserva de Cita Privada (Usuario)

```
1. El usuario ingresa al perfil del profesional → Tab Calendario.
2. Selecciona una vista: Mensual → Semanal → Diaria.
3. Hace clic en un espacio disponible → se abre el modal de reserva.
4. Selecciona el tipo de cita (Asesoría inicial / Seguimiento / Evaluación).
5. Agrega notas opcionales (máx. 300 caracteres).
6. Visualiza el desglose de precio (sesión + tarifa plataforma = total).
7. Confirma → es redirigido al formulario de pago (pago-cita).
8. Selecciona método de pago (Tarjeta / PSE / Nequi) y completa el pago.
9. Tras pago exitoso, la cita queda registrada y aparece en su calendario.
```

**Notas:**
- Los horarios bloqueados por el profesional no aparecen como disponibles.
- La identidad del usuario solo es visible para el profesional (no para otros usuarios).

### 6.4 Aprobación de Profesional (Administrador)

```
1. El sistema recibe la solicitud de registro de un profesional.
2. Se crea un mensaje de tipo "Registro profesional" en la bandeja del administrador.
3. El administrador abre el mensaje y revisa: nombre, documento, tarjeta COLPSIC, PDFs.
4. Decide:
   - Aprobar: confirma en modal → cuenta activada → profesional recibe enlace de contraseña.
   - Rechazar: escribe motivo en modal → profesional recibe notificación con motivo.
5. El mensaje pasa a la carpeta "Leídos".
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
| RN-12 | Las preguntas enviadas en conferencias son anónimas: los demás asistentes **no** ven quién las envió. Solo el ponente puede ver el alias del remitente. |
| RN-13 | Los usuarios asistentes a una conferencia no pueden ver la lista de otros asistentes ni interactuar entre sí. |
| RN-14 | El sistema reserva el cupo del evento durante 15 minutos tras la confirmación de asistencia, mientras se procesa el pago. |
| RN-15 | El pago de una cita privada incluye un cargo fijo de plataforma adicional al precio de la sesión configurado por el profesional. |
| RN-16 | Dejar de seguir a un profesional (mentor) requiere confirmación en modal. |
| RN-17 | La aprobación o rechazo de un profesional por el administrador queda registrada. El rechazo requiere motivo obligatorio. |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

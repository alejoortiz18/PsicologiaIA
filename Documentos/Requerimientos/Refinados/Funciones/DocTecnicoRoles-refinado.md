# Documento Técnico – Proyecto Trébol

| Campo       | Detalle              |
|-------------|----------------------|
| Proyecto    | Trébol               |
| Versión     | 1.0                  |
| Tecnología  | .NET Core 10         |
| Base de Datos | SQL Server         |
| Plataforma  | Web MVC              |
| Documento   | Actores de la Aplicación – Perfil Profesional y Perfil Usuario |

---

## 1. Descripción General del Proyecto

Trébol es una plataforma digital de atención psicológica que conecta profesionales de la salud mental con usuarios que buscan acompañamiento.

Este documento describe en detalle el módulo de perfiles de la plataforma: el **Perfil Profesional** (psicólogos y terapeutas certificados) y el **Perfil Usuario**, incluyendo la administración de perfil, documentos, salas, sesiones, pagos y relación entre actores.

Los usuarios podrán tener sesiones de forma anónima o con trazabilidad de su estado por parte de un profesional, quien podrá registrar sus datos. La plataforma permitirá a los profesionales ofrecer conferencias abiertas con o sin costo, informando fechas de inicio, fecha de fin y capacidad máxima de personas.

---

## 2. Perfil Profesional

### 2.1 Gestión de Cuenta y Perfil

- El profesional podrá registrarse en la plataforma con un perfil profesional.
- El profesional podrá actualizar su información personal, excepto nombres y número de documento.
- El profesional podrá configurar cuentas bancarias para recibir los desembolsos mensuales.
- El profesional podrá administrar su historial de pagos, desembolsos y facturación.
- El profesional podrá publicar contenido en el módulo **Publicaciones** (mensajes de aliento, anuncios de eventos, información relevante u otro contenido de su interés). Ver sección 2.7.

### 2.2 Gestión de Salas y Eventos

- El profesional podrá crear salas públicas o privadas (pagas o gratuitas).
- Cada sala tiene un tema central; el profesional podrá crear múltiples eventos dentro de una misma sala sobre ese tema.
- Para crear o reservar una sala, el profesional debe realizar un pago establecido por la plataforma.
- El profesional podrá controlar la capacidad máxima de usuarios por sala y aplicar reglas de acceso o pago.
- El profesional podrá habilitar o deshabilitar el envío de comentarios y mensajes en salas públicas.
- En salas públicas, el profesional podrá encender o apagar su cámara y micrófono.
- En salas privadas, el sistema solicitará al profesional encender la cámara para una atención más profesional.
- El profesional podrá consultar: lista de inscritos, cupos restantes, pagos realizados, cancelaciones y devoluciones.

### 2.3 Gestión de Agenda y Citas

- El profesional dispondrá de su propio calendario y podrá deshabilitar franjas horarias a su criterio.
- El profesional podrá recibir solicitudes de atención privada y personalizada a través de su calendario con horarios disponibles.
- El profesional podrá definir el costo por hora de atención para cobrar a los usuarios.
- El profesional podrá mover una cita agendada con permiso del usuario; si el usuario no acepta, podrán negociar otro horario o proceder con la devolución del dinero.
- El profesional podrá visualizar solicitudes de usuarios para cambiar la fecha de una cita.
- El profesional podrá ver un panel con las citas organizadas por mes.

### 2.4 Gestión de Pacientes e Historial

- El profesional podrá mantener un historial privado de sus pacientes.
- El especialista podrá llevar un registro del historial psicológico, incluyendo medicamentos recetados.
- El profesional podrá compartir la información que considere pertinente mediante un formulario de historial psicológico con opción de compartir datos.
- El profesional podrá trasladar un paciente a otro colega y compartir una copia de los datos que considere necesarios para la atención.
- El especialista podrá gestionar remisiones de un paciente a centros especializados cuando sea necesario.

### 2.5 Interacción y Comunicación

- El profesional podrá contactar usuarios.
- El profesional podrá contactar y enviar mensajes a otros profesionales.
- El profesional podrá filtrar profesionales por cargo o área de interés.
- El profesional podrá bloquear o desbloquear usuarios.
- El profesional podrá gestionar seguidores.
- El profesional podrá ver el panel de estadísticas: sesiones realizadas, ingresos y usuarios atendidos.

### 2.7 Módulo de Publicaciones (Muro)

#### Descripción

La plataforma contará con un módulo llamado **Publicaciones**, accesible desde el menú principal para todos los actores (usuarios y profesionales). Funciona como un muro de mensajes donde los profesionales pueden mantener informada a su audiencia.

#### Publicación de contenido

- Únicamente los **profesionales** podrán crear publicaciones en el muro.
- El profesional podrá publicar: mensajes de aliento, anuncios de eventos, información de interés o cualquier contenido que considere relevante para su audiencia.
- Cada publicación mostrará el **nombre del profesional** que la realizó y la **fecha y hora** de publicación.

#### Comentarios de usuarios

- Los **usuarios** podrán comentar las publicaciones de los profesionales.
- Los comentarios de los usuarios se mostrarán de forma **anónima**: únicamente aparecerá el texto del comentario y la hora en que fue publicado; el nombre del usuario no será visible para nadie.

#### Eventos en el muro

- El muro también mostrará automáticamente los **eventos abiertos y próximos a comenzar** del mismo día.
- Los eventos con inicio en el día en curso se mostrarán con una **cuenta regresiva** visible hasta el momento de inicio.
- Al hacer clic sobre un evento en el muro, el usuario será redirigido a la información detallada del evento.

#### Visibilidad y acceso

- El módulo Publicaciones es visible para todos los actores autenticados en la plataforma.
- Los profesionales no autenticados o los visitantes sin sesión no tendrán acceso al muro.

---

### 2.6 Saldo y Pagos de la Plataforma

- El profesional podrá visualizar en su panel el saldo acumulado a su favor, correspondiente a los cobros realizados a los usuarios por sus interacciones (citas, sesiones y eventos pagos).
- La aplicación retiene los pagos generados por el profesional y realiza el desembolso entre el **1° y el 5° día de cada mes**.
- El saldo visible para el profesional refleja el monto neto después de aplicar las **retenciones e impuestos** definidos por la plataforma.
- El profesional podrá consultar el detalle de cada desembolso: valor bruto cobrado, retenciones aplicadas, impuestos y valor neto transferido.
- El profesional podrá configurar las cuentas bancarias a las cuales se realizarán los desembolsos mensuales.

---

## 3. Perfil Usuario

### 3.1 Registro y Acceso

- El usuario podrá registrarse sin necesidad de subir documentos.
- La aplicación validará que no existan duplicados por número de documento o correo electrónico al momento del registro.

### 3.2 Exploración de Profesionales

- El usuario podrá ver en el inicio (home) tarjetas con perfiles de profesionales e información destacada.
- El usuario podrá ingresar al perfil de un profesional.
- El usuario podrá ver todas las salas activas creadas por cada profesional.
- El usuario podrá ver los eventos abiertos de cada sala.
- El usuario podrá ver la cantidad de seguidores de un profesional.
- El usuario podrá opinar sobre un evento y sobre un profesional.
- El usuario podrá buscar un profesional por nombre, apellido o número de cédula.
- El usuario podrá filtrar profesionales por especialidad.

### 3.3 Seguimiento de Profesionales

- El usuario podrá seguir a un profesional.
- El usuario podrá ver el listado de profesionales a quienes sigue.
- El usuario podrá filtrar los profesionales que sigue.
- El usuario podrá filtrar eventos por tipo.
- El usuario podrá visualizar la cantidad de profesionales con los que ha tenido sesiones.

### 3.4 Inscripción a Eventos

1. El usuario ingresa a la aplicación.
2. La aplicación muestra el listado de conferencias disponibles (solo salas con eventos abiertos).
3. El usuario selecciona la conferencia de interés.
4. La aplicación muestra:
   - Nombre de la conferencia
   - Fecha y hora
   - Valor de inscripción
   - Capacidad máxima de asistentes
   - Cupos disponibles
   - Información de la sala o evento
5. El usuario selecciona la opción **"Inscribirme"**.
6. La aplicación valida en tiempo real si existen cupos disponibles:
   - **Sin cupos**: se muestra el mensaje *"No hay cupos disponibles para esta conferencia."* y finaliza el proceso.
   - **Con cupos**: se permite continuar al proceso de pago.
7. El usuario podrá entrar a los eventos y participar únicamente cuando el profesional habilite el campo de mensajes.

### 3.5 Citas con Profesionales

- El usuario podrá observar el calendario con los espacios libres del profesional para reservar una cita.
- El usuario deberá realizar el pago previo para confirmar la reserva de una cita.
- El usuario podrá elegir entre atención psicológica o asesoría.
- Un usuario podrá tener asesorías utilizando su nombre real o un sobrenombre, permitiendo la atención de forma anónima.
- El usuario podrá solicitar al profesional mover la fecha de una cita reservada.
- El usuario podrá recibir solicitudes de un profesional para ser trasladado a otro especialista.
- El usuario podrá habilitar o deshabilitar su cámara y micrófono durante las sesiones.
- El usuario podrá ver su historial de pagos.

### 3.6 Restricciones del Usuario

- El usuario no podrá ver a otros usuarios ni entablar conversaciones con ellos; la comunicación directa solo es posible con profesionales.

---

## 4. Comportamiento de la Aplicación

### 4.1 Validaciones Generales

- La aplicación validará que un usuario nuevo no se registre con número de documento o correo electrónico ya registrados.
- La aplicación configurará las cookies de inicio de sesión.
- La aplicación mostrará en el home únicamente las salas que tengan eventos abiertos.

### 4.2 Proceso de Pago e Inscripción

**Generación de orden de pago**

1. La aplicación genera una orden de pago temporal.
2. La aplicación calcula el valor requerido para la inscripción.
3. Se registran los siguientes datos:
   - ID de transacción
   - Valor a pagar
   - Estado: *Pendiente de pago*
4. La aplicación redirige al usuario a la pasarela de pago.

**Proceso en pasarela de pago**

5. El usuario selecciona el método de pago:
   - Tarjeta de crédito
   - Tarjeta débito
   - PSE
   - Transferencia
   - Otros medios habilitados
6. El usuario realiza el pago.
7. La pasarela procesa la transacción y retorna el resultado a la aplicación.

**Si el pago es rechazado**

8. La aplicación actualiza el estado a *Pago rechazado*.
9. Se notifica al usuario: *"El pago no pudo ser procesado."*
10. El usuario puede intentar nuevamente.

**Si el pago es exitoso**

11. La aplicación actualiza el estado a *Pago aprobado*.
12. La aplicación vuelve a validar la disponibilidad de cupos antes de confirmar la inscripción (para evitar sobreventa).

**Si los cupos se agotaron durante el pago**

13. La aplicación:
    - Reversa el pago (si aplica), o
    - Registra un saldo pendiente de devolución.
14. Se notifica al usuario y finaliza el proceso.

**Si aún hay cupos disponibles**

15. La aplicación registra automáticamente la inscripción.
16. Reduce en 1 el cupo disponible.
17. Asigna al usuario a la sala o conferencia correspondiente.
18. Genera un código de inscripción.
19. La aplicación genera un token automático para registrar al usuario en la sala.

### 4.3 Confirmación al Usuario

La aplicación envía un correo automático al usuario con:
- Confirmación de inscripción
- Nombre del evento
- Fecha y hora
- Sala asignada
- Código de inscripción
- Valor pagado
- Recomendaciones previas al evento

### 4.5 Gestión de Saldos y Desembolsos a Profesionales

- La aplicación acumulará en una cuenta interna todos los pagos realizados por usuarios derivados de sus interacciones con profesionales (citas, sesiones privadas y eventos pagos).
- Los desembolsos a los profesionales se realizarán automáticamente entre el **1° y el 5° día de cada mes calendario**.
- Antes de efectuar el desembolso, la aplicación aplicará las **retenciones y porcentajes de comisión** definidos en la configuración del sistema.
- El porcentaje de retención de la plataforma estará configurado en la sección de **Políticas del Sistema**, a la cual únicamente tiene acceso el perfil **Administrador del Sistema**.
- El administrador podrá consultar y modificar el porcentaje de retención vigente desde el panel de configuración del sistema.
- Cada profesional recibirá una notificación con el detalle del desembolso: monto bruto, retención aplicada, impuestos y monto neto transferido.

### 4.4 Registro Administrativo

La aplicación guarda trazabilidad completa de:
- Usuario inscrito
- Pago realizado
- Fecha de inscripción
- Medio de pago utilizado
- Estado de la inscripción

**Estados posibles del proceso:**

| Estado               | Descripción                                      |
|----------------------|--------------------------------------------------|
| Pendiente de pago    | Orden generada, esperando pago                  |
| Pago aprobado        | Transacción exitosa                              |
| Pago rechazado       | Transacción fallida                              |
| Inscripción confirmada | Usuario registrado en el evento               |
| Sin cupos            | No hay disponibilidad en el evento              |
| Reembolso pendiente  | Pago realizado pero cupos agotados              |
| Inscripción cancelada | El usuario o el sistema canceló la inscripción |

---

## Resultado Final Esperado

El usuario realiza el pago → el sistema valida disponibilidad → confirma la inscripción automáticamente → asigna cupo → envía correo con la información de acceso a la conferencia.

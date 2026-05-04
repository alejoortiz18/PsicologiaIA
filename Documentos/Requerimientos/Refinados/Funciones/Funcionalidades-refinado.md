# Documento Técnico – Funcionalidades del Sistema

| Campo         | Detalle                          |
|---------------|----------------------------------|
| Proyecto      | Trébol                           |
| Versión       | 1.0                              |
| Tecnología    | .NET Core 10                     |
| Base de Datos | SQL Server                       |
| Plataforma    | Web MVC                          |
| Documento     | Funcionalidades del Sistema      |

---

## 1. Elementos Generales de la Interfaz

- La aplicación mostrará el logo en todo el sitio, ubicado en la parte superior izquierda.
- La pestaña del navegador mostrará el logo y el nombre de la aplicación.

---

## 2. Landing Page

- El landing page contará con opciones de **Iniciar sesión** y **Registrarse**.
- **Banner principal**: mostrará información relevante sobre la aplicación, imágenes destacadas, datos generales (cantidad de profesionales registrados), mensajes de aliento e invitación a ingresar a la plataforma.
- **Especialidades**: debajo del banner se mostrarán tarjetas con todas las especialidades psicológicas disponibles en la plataforma.
- **Pie de página**: información relevante sobre el sitio web.
- **Sección de eventos destacados**: cinta o carrusel mostrando las 3 salas con mayor número de inscritos, con fines promocionales.
- **Cinta informativa superior**: banda angosta sobre el banner, con desplazamiento de derecha a izquierda, mostrando profesionales destacados seleccionados por la plataforma para su promoción.
- **Botón Iniciar sesión**.
- **Botón Registro**.

---

## 3. Vista Login

- Logo de la aplicación visible.
- Formulario de inicio de sesión en una sola página.
- Botón **Volver al inicio** (redirige al landing page).
- Botón **Restablecer contraseña**.
- Botón **Crear cuenta**.
- Campos requeridos: correo electrónico y contraseña (ambos obligatorios).
- El sistema validará las credenciales ingresadas.
- El sistema identificará si quien inicia sesión es **usuario** o **profesional** y generará las cookies de sesión correspondientes al perfil.
- Se mostrarán mensajes de error genéricos ante fallos de autenticación (sin revelar si el error es del correo o la contraseña por separado).

---

## 4. Vista Registro

### 4.1 Selección de Perfil

Al ingresar a registro, el sistema mostrará primero una pantalla para elegir el tipo de perfil:

- **Usuario**
- **Profesional**

Cada perfil cuenta con sus propios **términos y condiciones**, los cuales deben ser aceptados antes de completar el registro.

---

### 4.2 Registro de Usuario

**Datos solicitados:**

- Nombre
- Correo electrónico
- Número de identificación
- Alias
- Celular

**Proceso:**

1. El usuario completa el formulario y acepta los términos y condiciones.
2. El sistema valida que no exista un registro previo con el mismo número de documento o correo electrónico. En caso de duplicado, muestra mensaje de error en modal.
3. El sistema crea el usuario en estado **Pendiente**.
4. El sistema envía un correo de verificación con botón o enlace para confirmar el correo + token válido por **1 hora**.
5. El enlace redirige a una página para **crear contraseña**, donde se valida el token:
   - **Token activo**: muestra formulario para establecer contraseña.
   - **Token inactivo o expirado**: muestra mensaje de token inválido y opción para reenviar.
6. La vista cuenta con botón **Volver al landing page**.

---

### 4.3 Registro de Profesional

**Datos solicitados:**

- Nombre
- Correo electrónico
- Número de identificación
- Alias
- Celular
- Número de tarjeta profesional
- Copia PDF de la cédula *(obligatoria)*
- Copia PDF de la tarjeta profesional *(obligatoria)*

**Proceso:**

1. El profesional completa el formulario y acepta los términos y condiciones.
2. El sistema valida que no exista un registro previo con el mismo número de documento, correo electrónico o número de tarjeta profesional. En caso de duplicado, muestra mensaje de error en modal.
3. El sistema envía los datos y documentos al correo del sistema para almacenamiento y revisión.
4. El sistema crea el profesional en estado **Pendiente**.
5. El sistema envía un correo de verificación con botón o enlace + token válido por **1 hora**:
   - **Token activo**: muestra formulario para establecer contraseña.
   - **Token inactivo o expirado**: muestra mensaje de token inválido y opción para reenviar.
6. Una vez confirmado el correo, la cuenta queda en estado **Por validar documentos**.
7. La vista cuenta con botón **Volver al landing page**.

#### 4.3.1 Validación de Tarjeta Profesional (COLPSIC y perfiles médicos)

El sistema intentará validar automáticamente el número de tarjeta profesional con el siguiente flujo:

1. **Intento automático**: el sistema consulta la API de COLPSIC (o el organismo equivalente para profesionales del área médica) con el número de tarjeta registrado.
2. **Si la API responde exitosamente**:
   - El sistema actualiza el estado del profesional a **Documentos en revisión**.
   - Se notifica al profesional por correo indicando que sus datos están siendo validados.
   - Al finalizar la validación, se notifica por correo que la cuenta está habilitada.
3. **Si la API no está disponible o no retorna respuesta**:
   - El sistema envía automáticamente un correo al **administrador de la plataforma** con los datos del profesional y sus documentos adjuntos para revisión manual.
   - El administrador realiza la validación manualmente y habilita o rechaza la cuenta.
   - En caso de rechazo, el sistema informa al profesional por correo.

> **Nota**: este mismo proceso aplica para profesionales del área médica registrados en la plataforma.

---

## 5. Menú Lateral

El menú lateral es compartido entre perfiles. Los ítems se muestran u ocultan según el perfil autenticado.

| Ítem de menú             | Usuario | Profesional |
|--------------------------|:-------:|:-----------:|
| Home                     | ✓       | ✓           |
| Publicaciones            | ✓       | ✓           |
| Profesionales            | ✓       | ✓           |
| — Especialistas          | ✓       | ✓           |
| — Psicólogos             | ✓       | ✓           |
| — Mis mentores / Colegas | ✓       | ✓           |
| Mis citas                | ✓       | ✓           |
| Calendario               | ✓       | ✓           |
| Mi perfil                | ✓       | ✓           |
| Ver mis salas            | —       | ✓           |
| Mis eventos              | —       | ✓           |

---

## 6. Módulo Publicaciones (Muro)

El módulo **Publicaciones** es accesible desde el menú lateral para todos los actores autenticados. Funciona como un muro donde los profesionales mantienen informada a su audiencia.

### Publicación de contenido

- Únicamente los **profesionales** pueden crear publicaciones.
- El profesional puede publicar: mensajes de aliento, anuncios de eventos, información de interés o cualquier contenido relevante para su audiencia.
- Cada publicación muestra el **nombre del profesional** y la **fecha y hora** de publicación.

### Comentarios de usuarios

- Los **usuarios** pueden comentar las publicaciones de los profesionales.
- Los comentarios se muestran de forma **anónima**: solo aparece el texto del comentario y la hora; el nombre del usuario no es visible para nadie.

### Eventos en el muro

- El muro muestra automáticamente los **eventos abiertos y próximos a comenzar del día en curso**.
- Los eventos del día se muestran con **cuenta regresiva** hasta el momento de inicio.
- Al hacer clic en un evento, el usuario es redirigido a su información detallada.

### Acceso

- Visible únicamente para actores autenticados en la plataforma.
- Usuarios no autenticados o visitantes sin sesión no tienen acceso al muro.

---

## 7. Vista Home – Perfil Usuario

- Espacio para ver los eventos en los que el usuario está registrado e inscrito.
- Espacio para visualizar las próximas citas del usuario.
- Fecha de inicio de la sala más próxima a la que el usuario está inscrito.
- El sistema muestra únicamente las salas abiertas que tienen sesiones vigentes.

**Opciones de búsqueda y filtrado:**

- Filtrar por categoría de sala.
- Buscar por nombre de usuario.
- Buscar por nombre de sala.
- Buscar por fecha de inicio del evento.
- Filtrar para ver únicamente los profesionales que el usuario sigue.

**Tarjetas de salas** — cada tarjeta muestra:

- Nombre de la sala.
- Fecha y hora de inicio y fin.
- Cantidad de usuarios registrados.
- Capacidad máxima de usuarios permitidos.
- Precio o indicador de entrada libre.
- Nombre del orador.
- Cantidad de "Me gusta" y botón **Me gusta**.
- Botón **Ver más**.
- Botón **Registro**.
- Botón **Enviar mensaje** (el mensaje se envía de forma privada al profesional).

**Secciones del home:**

- Salas destacadas (las más solicitadas).
- Salas que comienzan o se abren hoy.

### 7.1 Click en "Ver más"

Se abre una ventana con:

- Información completa de la sala y del evento.
- Información del profesional.
- Usuarios registrados y cupos libres disponibles.
- Fecha y datos del evento.
- Botón **Registrarse**.
- Botón **Información del orador**.

### 7.2 Click en "Registrarse"

- **Sala paga**: inicia el proceso de pago y, al aprobarse, registra al usuario en la sala.
- **Sala libre**: el sistema agrega al usuario al evento y envía la confirmación al correo electrónico.

### 7.3 Click en "Información del orador"

El perfil del orador se presenta con tabs:

**Tab 1 – Perfil Profesional**

- Foto, datos personales e información del profesional.
- Idiomas que habla.
- Cantidad de seguidores.
- Botón **Seguir** / **Dejar de seguir**.
- Secciones: "Sobre mí", "Cómo trabajo", Experiencia, Estudios (pregrado y posgrado).

**Tab 2 – Salas y Eventos**

- Tarjetas con las salas creadas por el orador.
- Estado de la sala: **Abierta** / **Cerrada**.
- Precio e información relevante.
- Botón **Detalle**: abre modal con los últimos 10 mensajes del evento. El modal tiene botón **Ver más** que redirige a una página con todos los mensajes en tabla paginada.
- El usuario autenticado puede actualizar, agregar o eliminar **únicamente sus propios** comentarios.

**Tab 3 – Comentarios al profesional**

- Muestra todos los comentarios realizados al profesional.
- Permite agregar un nuevo comentario.
- Botones **Editar** y **Eliminar** disponibles para los comentarios propios.
- Comentarios del usuario autenticado: lado derecho, color azul.
- Comentarios de otros usuarios: lado izquierdo, color gris.

**Visibilidad de los comentarios según el perfil:**

- **Vista del profesional**: texto, nombre de quien comentó, fecha y hora, botón **Contactar**.
- **Vista de otros usuarios**: solo texto y fecha/hora (sin nombre del autor).
- Únicamente el profesional puede responder los comentarios que le realizan; la respuesta se muestra como subcomentario.

> **Nota**: solo los profesionales pueden recibir comentarios. A los usuarios no se les pueden realizar comentarios.

---

## 8. Vista Mis Eventos

- Muestra únicamente los eventos creados por el usuario o profesional autenticado.

---

## 9. Vista Perfil Usuario

- Formulario con toda la información personal del usuario, incluyendo el alias.
- **Tab 1**: eventos públicos en los que se ha registrado.
- **Tab 2**: próximas citas del usuario.

---

## 10. Vista Perfil Profesional

### Tab 1 – Información Personal

Formulario personalizado del profesional:

- **Campos no editables**: Nombre, Email, Número de documento.
- **Campos editables**: País, Ciudad, Ocupación, Celular, Género, Fecha de nacimiento, Sesión activa, Sobre mí, Cómo trabajo, Universidad de egreso, Año de egreso, Años de experiencia, Foto de perfil, Número de tarjeta profesional.

> **Nota**: el campo Ciudad está vinculado al campo País; al seleccionar el país, la lista de ciudades se actualiza automáticamente con las localidades correspondientes.

**Sección de estudios** (Pregrado y Posgrado):

- Nombre del título, Descripción, Universidad, Año de egreso.

### Tab 2 – Salas y Eventos

- Tarjetas con las salas creadas por el profesional y sus eventos.
- Cantidad de usuarios inscritos por sala.
- Detalle del evento.

> **Restricción**: el perfil profesional no puede tener dos sesiones activas simultáneamente en distintos dispositivos. Ver sección 14.

### Tab 3 – Calendario

- Calendario con horarios disponibles y ocupados del profesional.

### Tab 4 – Agenda

- Próximas citas privadas con pacientes.
- Próximos eventos públicos del profesional.

---

## 11. Vista de Citas

### 11.1 Vista del Usuario

- Información completa de la cita inscrita.
- Pantalla para visualizar la cámara del profesional.
- Controles disponibles:
  - Activar / desactivar cámara propia.
  - Activar / desactivar micrófono.
  - Enviar mensaje.
- **Historial de la cita** (debajo de la pantalla): fecha, hora, estado (recibida, cancelada o movida), duración.
- Historial de recomendaciones o mensajes creados por el profesional para esa sesión.
- Si la cita es de tipo **asesoría**, el usuario puede elegir mostrar su nombre real o su alias.
- El usuario puede agregar comentarios privados a la sesión.

### 11.2 Vista del Profesional

- Indicador de presencia del usuario en línea.
- Controles: abrir cámara, abrir micrófono.
- Contador de duración de la cita en curso.
- Recomendaciones y comentarios grabados en la sesión (editables por el profesional).
- El sistema registra la hora y fecha de cada recomendación.
- Si la cita es de tipo **asesoría**, el profesional puede definir si se permiten o no comentarios.
- Si es **cita de seguimiento**, el profesional tiene acceso al historial psicológico del usuario.
- Botón **Cerrar sesión** + modal de confirmación.
- Botón **Mover cita**: muestra el calendario con los espacios libres del profesional para reagendar + botón **Confirmar mover cita**.
- Botón **Agendar otra sesión**.
- El profesional da el cierre formal de la cita.

### 11.3 Comportamiento del Sistema – Protección de Datos de Contacto

- El sistema muestra un mensaje informativo a profesionales y usuarios indicando que está **prohibido compartir datos de contacto** (teléfonos, correos) fuera de la plataforma.
- El sistema detecta en el chat posibles intentos de compartir datos de contacto:
  - **Primera y segunda falta**: encripta automáticamente el contenido detectado (muestra `XXX`) y envía un mensaje de advertencia al infractor.
  - **Tercera falta (usuario)**: el sistema bloquea al usuario para enviar mensajes y envía un correo al sistema de la plataforma con el reporte del evento.
  - **Si es el profesional**: el sistema muestra un mensaje recordatorio sobre las prohibiciones y las posibles sanciones económicas.
- El sistema envía al correo de la plataforma un reporte ante cada detección.

---

## 12. Vista de Conferencia

### 12.1 Vista del Usuario

- Reloj con cuenta regresiva al inicio de la conferencia.
- Al llegar a cero, el contador continúa en negativo hasta que el profesional abra la conferencia.
- Los usuarios pueden enviar comentarios a la sala únicamente cuando el profesional habilite esa opción.
- Los usuarios no pueden ver el nombre de quién realizó los comentarios (son anónimos entre usuarios).
- Advertencia visible informando que el incumplimiento de las normas de buen trato puede resultar en expulsión sin devolución del dinero (en salas pagas).

### 12.2 Vista del Profesional

- Botón para **abrir la sala**.
- El sistema informa al profesional que debe activar su cámara antes de abrir la conferencia.
- El sistema activa la cámara del profesional al abrir la sala.
- Vista de comentarios de los usuarios: incluye nombre de quien comentó, hora, fecha y botón **Eliminar comentario**.
- Opción para **expulsar** a un usuario por incumplimiento de normas.
- El sistema solicita al profesional las razones de la expulsión antes de ejecutarla.
- El profesional puede bloquear a un usuario.

### 12.3 Comportamiento del Sistema – Conferencias

- El sistema evalúa las palabras escritas y reemplaza palabras obscenas o groseras con `XXX`.
- El sistema advierte al usuario que el uso de vocabulario inapropiado puede resultar en expulsión sin reembolso.
- A las **3 faltas** por palabras inapropiadas, el sistema bloquea al usuario para enviar mensajes en la sala.
- Al ejecutar una expulsión, el sistema envía al correo de la plataforma: información de la sala, el profesional que ejecutó la expulsión y el motivo.
- Un usuario bloqueado por un profesional no podrá ver el perfil del profesional, sus salas, eventos ni ningún dato relacionado con ese profesional.

---

## 13. Vista Calendario

### Vista del Usuario

- Nombre del profesional en la parte superior con botón **Ver perfil**.
- Costo de la cita privada visible.
- Sección de próximo evento programado: información del evento + botón **Inscribirse**.
- Calendario con los espacios disponibles del profesional para seleccionar y reservar una cita.
- Botón **Separar cupo**.
- El calendario diferencia:
  - **Espacios libres**: disponibles para agendar cita privada.
  - **Fechas ocupadas por eventos**: al hacer clic, muestra si el evento es de entrada libre o paga + botón **Inscribirse**.
- Al seleccionar un espacio libre, se muestra la opción **"Separar cita en este horario"** + botón **Separar cita** + proceso de pago de la cita.

---

## 14. Control de Sesiones Concurrentes (Perfil Profesional)

### Problema

Un profesional podría intentar iniciar sesión en un segundo dispositivo mientras mantiene una sesión activa. Esto podría permitir que otra persona opere la cuenta de forma paralela, facilitando fraude (atender a múltiples usuarios simultáneamente haciéndose pasar por el profesional registrado).

### Apetito

Solución simple y no invasiva para el profesional legítimo que cambió de dispositivo, pero que proteja contra el uso fraudulento de la cuenta.

### Solución

1. Al iniciar sesión, el sistema verifica si existe una **sesión activa vigente** para ese profesional.
2. **Sin sesión activa**: el inicio de sesión procede con normalidad.
3. **Con sesión activa**: el sistema muestra un modal informativo con:
   - Detalle de la sesión activa: dispositivo, dirección IP y fecha/hora de inicio.
   - Mensaje: *"Ya existe una sesión activa en otro dispositivo. ¿Deseas cerrarla y continuar?"*
   - Opciones: **"Cerrar sesión anterior y continuar"** / **"Cancelar"**.
4. **Si el profesional elige "Cerrar sesión anterior y continuar"**:
   - El sistema solicita confirmación de identidad mediante la contraseña actual.
   - **Contraseña correcta**: se invalida el token de la sesión anterior, se crea una nueva sesión y se notifica al dispositivo anterior con el mensaje: *"Tu sesión fue cerrada porque se inició sesión en otro dispositivo."*
   - **Contraseña incorrecta**: se rechaza la acción y se muestra mensaje de error.
5. Cada evento de sesión concurrente queda registrado en el **log de auditoría** del administrador: fecha, hora, dispositivos involucrados y resultado de la acción.

### Pozos (Rabbit Holes)

- No implementar autenticación de dos factores en esta fase (puede planificarse en un ciclo posterior).
- No bloquear la cuenta automáticamente; solo informar y dar opciones al profesional.

### Fuera de Alcance

- Esta restricción aplica **únicamente al perfil profesional**. Los usuarios no tienen esta restricción.
- No aplica a actualizaciones de página o reconexiones dentro del mismo dispositivo y sesión.

---

## 15. Flujo Posterior al Registro – Áreas de Interés

Luego de completar el registro, el sistema solicita al usuario seleccionar sus **áreas de interés** dentro de la plataforma. Esta información se utiliza con dos propósitos:

1. **Personalización**: adaptar las recomendaciones de profesionales, salas y eventos que el sistema muestra al usuario.
2. **Filtrado por profesionales**: los profesionales pueden filtrar usuarios por área de interés para identificar posibles pacientes afines a su especialidad.

**Áreas de interés disponibles** *(selección múltiple)*:

- Ansiedad y estrés
- Depresión
- Terapia de pareja
- Terapia familiar
- Duelo y pérdida
- Desarrollo personal
- Habilidades sociales
- Trauma y PTSD
- Adicciones
- Orientación vocacional
- Salud mental infantil y adolescente
- Psicología organizacional
- Otros *(campo abierto)*

> **Nota**: el usuario puede actualizar sus áreas de interés en cualquier momento desde la configuración de su perfil. La selección de áreas de interés es visible únicamente para los profesionales de la plataforma; otros usuarios no pueden verla.

---

## 16. Configuración de Privacidad – Visibilidad del Nombre

Únicamente los **usuarios** pueden configurar si se muestra su nombre real o su alias. Esta configuración aplica de forma diferenciada según el tipo de interacción:

| Tipo de interacción | Comportamiento |
|---|---|
| **Conferencia (sala pública)** | El usuario puede elegir mostrar su nombre real o su alias. |
| **Cita de asesoría** | El usuario puede elegir mostrar su nombre real o su alias. |
| **Cita de seguimiento / proceso terapéutico** | El nombre real del usuario se muestra **obligatoriamente**; no es posible usar el alias. |

**Reglas del sistema:**

- En **conferencias** y **citas de asesoría**, el sistema respeta la preferencia del usuario (nombre real o alias).
- En **citas de proceso o seguimiento terapéutico**, el sistema muestra el nombre real del usuario sin posibilidad de cambiarlo, dado que el profesional necesita identificar inequívocamente a su paciente para llevar el historial correctamente.
- El usuario puede actualizar esta preferencia desde la configuración de su perfil, pero el cambio solo tendrá efecto en las interacciones donde la elección es permitida.
- Los **profesionales no tienen esta opción**; su nombre siempre es visible para los usuarios.

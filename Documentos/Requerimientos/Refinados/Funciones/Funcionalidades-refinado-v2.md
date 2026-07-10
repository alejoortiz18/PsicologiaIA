# Funcionalidades del Sistema — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server

---

## Convenciones de visualización aplicadas en todo el sistema

> Referencia: [Reglas UI/UX Frontend del Proyecto](../../reglas-ui-ux-frontend.md)

| Elemento | Estándar |
|---|---|
| Fechas | `DD MMM YYYY` → ej: `8 Oct 2026` |
| Horas | Formato 12H → ej: `3PM`, `3:30PM` |
| Fecha y hora | `DD MMM YYYY H[MM]AM/PM` → ej: `8 Oct 2026 3PM` |
| Mensajes del sistema | Siempre mediante **modal** (nunca `alert()` nativo) |
| Tablas de datos | Paginación de **10 registros** por página |
| Logotipo | Visible en todo el sitio, esquina superior izquierda |
| Pestaña del navegador | Icono + nombre de la aplicación |

---

## 1. Landing Page

Vista pública accesible sin iniciar sesión. Objetivo: presentar la plataforma, generar confianza y convertir visitantes en usuarios registrados.

### 1.1 Elementos de la Landing Page

**Barra superior (cinta promocional)**
- Cinta angosta sobre el banner principal.
- Se desplaza de derecha a izquierda continuamente.
- Muestra el perfil de un profesional destacado elegido por la plataforma, con el fin de promover a los profesionales.

**Banner principal**
- Imágenes e información relevante sobre la plataforma.
- Datos generales: número de profesionales disponibles, eventos activos.
- Mensajes motivacionales para incitar al usuario a registrarse o explorar la plataforma.

**Sección de especialidades**
- Galería de tarjetas con todas las especialidades psicológicas disponibles en la plataforma.

**Cinta de eventos destacados**
- Muestra en tarjetas los **3 eventos con mayor número de inscritos**.
- Objetivo: dar visibilidad y promover esas salas.

**Pie de página**
- Información institucional del sitio web.
- Enlaces a términos y condiciones, política de privacidad y contacto.

**Acciones disponibles**
- Botón: Iniciar sesión
- Botón: Registro

---

## 2. Vista de Login

### 2.1 Descripción

Formulario de autenticación en una sola página.

### 2.2 Elementos

| Elemento | Descripción |
|---|---|
| Logo de la aplicación | Visible en la parte superior |
| Campo correo electrónico | Obligatorio |
| Campo contraseña | Obligatorio |
| Botón iniciar sesión | Envía el formulario |
| Botón restablecer contraseña | Redirige al flujo de recuperación |
| Botón crear cuenta | Redirige al registro |
| Botón volver | Regresa al Landing Page |

### 2.3 Lógica del sistema

1. El sistema valida que ambos campos estén completos.
2. Verifica las credenciales contra la base de datos.
3. Identifica si el usuario es de tipo **Usuario** o **Profesional**.
4. Genera las cookies de sesión correspondientes al perfil.
5. En caso de error: muestra mensaje genérico en **modal** (sin revelar si el error es en el correo o en la contraseña).

---

## 3. Vista de Registro

### 3.1 Selección de perfil

El primer paso del registro muestra dos opciones:
- Registrarme como **Usuario**
- Registrarme como **Profesional**

Cada perfil tiene sus propios términos y condiciones. Si difieren entre sí, se presentan de forma independiente con botón de aceptación obligatoria.

---

### 3.2 Registro de Usuario

**Datos requeridos:**
- Nombre completo
- Correo electrónico
- Número de identificación
- Alias (seudónimo)
- Número de celular

**Flujo:**

```
1. El usuario completa el formulario y acepta los términos.
2. El sistema valida que el correo y el número de documento no estén ya registrados.
   → Si ya existen: muestra mensaje de error en modal.
3. El sistema crea el usuario en estado PENDIENTE.
4. El sistema envía un correo de validación con enlace + token (vigencia: 1 hora).
5. Al hacer clic en el enlace, el usuario llega a la página de creación de contraseña.
6. El sistema valida el token:
   - Token válido: muestra formulario para establecer contraseña.
   - Token inválido o expirado: muestra mensaje en modal y opción de reenvío.
7. El usuario establece su contraseña y queda habilitado para ingresar.
```

**Acciones disponibles en el formulario:**
- Botón registrar (con spinner durante el envío — protección doble envío)
- Botón volver al Landing Page

---

### 3.3 Registro de Profesional

**Datos requeridos:**
- Nombre completo
- Correo electrónico
- Número de identificación
- Alias
- Número de celular
- Número de tarjeta profesional
- Copia PDF de la cédula de identidad *(obligatorio)*
- Copia PDF de la tarjeta profesional *(obligatorio)*

**Flujo:**

```
1. El profesional completa el formulario y adjunta los documentos.
2. El sistema valida que no existan duplicados de correo, documento ni número de tarjeta.
   → Si existen: muestra error en modal.
3. El sistema envía los datos y documentos al correo del administrador del sistema.
4. El sistema crea la cuenta en estado PENDIENTE DE VALIDACIÓN.
5. El sistema valida ante COLPSIC que el número de tarjeta sea válido y vigente.
6. Si la validación automática es exitosa: el sistema notifica al profesional que sus datos
   están siendo revisados.
7. El administrador revisa los documentos de forma manual.
   - Aprobado: el sistema habilita la cuenta y envía correo con enlace + token
     para establecer contraseña (vigencia: 1 día).
   - No aprobado automáticamente: el sistema notifica al administrador interno
     para revisión manual adjuntando los datos del usuario.
8. El profesional establece su contraseña y accede a la plataforma.
```

**Token de contraseña:**
- El enlace redirige a la página de creación de contraseña.
- Token válido: muestra el formulario.
- Token expirado o inválido: muestra mensaje en **modal** con opción de reenvío.

---

## 4. Menú Lateral (Sidebar)

El menú lateral es fijo, visible en todas las vistas internas tras el inicio de sesión.

### Opciones disponibles para el Usuario

| Ítem de menú | Descripción |
|---|---|
| Inicio (Home) | Dashboard principal del usuario |
| Profesionales > Especialistas | Listado de especialistas |
| Profesionales > Psicólogos | Listado de psicólogos certificados COLPSIC |
| Profesionales > Mis mentores | Profesionales que el usuario sigue |
| Mis citas | Citas privadas programadas del usuario |
| Mensajes | Conversaciones con profesionales |
| Mi perfil | Información personal del usuario |
| Calendario | Visualización de citas y eventos agendados |

### Opciones disponibles para el Profesional

| Ítem de menú | Descripción |
|---|---|
| Inicio (Home) | Dashboard principal del profesional |
| Profesionales > Especialistas | Listado de especialistas |
| Profesionales > Psicólogos | Listado de psicólogos |
| Profesionales > Mis colegas | Profesionales vinculados para colaboración |
| Mis eventos | Salas y sesiones creadas por el profesional |
| Citas | Gestión de citas privadas con pacientes |
| Mensajes | Conversaciones con usuarios y colegas |
| Mi perfil | Información profesional y ajustes |
| Calendario | Disponibilidad y agenda configurada |

---

## 5. Vista Home — Perfil Usuario

Vista principal luego del inicio de sesión para el perfil Usuario.

| Sección | Descripción |
|---|---|
| Mis eventos registrados | Eventos en los que el usuario está inscrito |
| Próximas citas | Citas privadas agendadas próximamente |
| Sala más próxima | Fecha de inicio de la sala inscrita más cercana, en formato `8 Oct 2026 3PM` |

**Listado de salas abiertas (con eventos vigentes):**
- Filtro por categoría de sala
- Búsqueda por nombre de usuario o nombre de sala
- Búsqueda por fecha de inicio del evento (`DD MMM YYYY`)
- Sección de **salas destacadas** (más solicitadas)
- Sección de **salas que comienzan hoy**

**Tarjeta de sala — información mostrada:**

| Campo | Descripción |
|---|---|
| Nombre de la sala | — |
| Fecha y hora de inicio y fin | Formato `8 Oct 2026 3PM` |
| Usuarios registrados | Número actual de inscritos |
| Cupo máximo | Capacidad total de la sala |
| Precio | Monto de inscripción o "Entrada libre" |
| Nombre del orador | Profesional que dirige la sala |
| Me gusta | Contador de reacciones |
| Botón "Ver más" | Abre modal con detalle completo de la sala |
| Botón "Registrarse" | Inicia el proceso de inscripción |
| Botón "Enviar mensaje" | Envía mensaje privado al profesional |

## 5b. Vista Home — Perfil Profesional

Vista principal luego del inicio de sesión para el perfil Profesional.

**Tarjetas de resumen (4 indicadores):**

| Indicador | Descripción |
|---|---|
| Citas hoy | Número de citas programadas para hoy |
| Mis eventos hoy | Eventos (salas) que se realizan hoy |
| Citas próximas | Total de citas próximas agendadas |
| Seguidores | Número de usuarios que siguen al profesional |

**Tabla de citas del día:**
- Paciente (avatar + alias), Tipo, Hora, Estado (badge), Acciones: **Ingresar** (si es hoy y está confirmada), Confirmar (si está pendiente), Cancelar.

**Sección de eventos de hoy:**
- Eventos propios activos del día, con botón **Ingresar al evento**.

**Sección de eventos de colegas:**
- Eventos creados por colegas vinculados, agrupados por: Hoy / Esta semana / Próximamente.
- Filtro por categoría.

---
## 6. Vista Detalle de Sala (Modal “Ver más”)
Al hacer clic en "Ver más" se abre un **modal** con:
- Información completa de la sala
- Información del evento (fechas `DD MMM YYYY`, horarios en formato 12H)
- Información del profesional (orador)
- Usuarios registrados y cupos disponibles
- Botón: Registrarse
- Botón: Ver información del orador

---

## 7. Perfil del Orador (Profesional)

Organizado en tabs:

### Tab 1 — Cuenta del Profesional

| Campo | Descripción |
|---|---|
| Datos del perfil | Nombre, foto, descripción personal |
| Idiomas | Idiomas que habla el profesional |
| Seguidores | Número de usuarios que lo siguen |
| Botón seguir / dejar de seguir | — |
| Sobre mí | Texto libre del profesional |
| Cómo trabajo | Metodología o enfoque de trabajo |
| Experiencia | Años de experiencia |
| Estudios | Pregrado y posgrado |

### Tab 2 — Salas Creadas

Galería de tarjetas con:
- Salas creadas por el orador
- Estado de la sala: abierta o cerrada
- Precios e información relevante
- Botón "Detalle": abre un **modal** con los 10 últimos mensajes del evento

> El modal de mensajes tiene un botón "Ver más" que abre una página con todos los mensajes en **tabla paginada (10 por página)**, con opciones para actualizar, agregar o eliminar únicamente los mensajes propios.

### Tab 3 — Comentarios al Profesional

- Listado de todos los comentarios dirigidos al profesional
- Los comentarios del usuario logueado aparecen a la **derecha en azul**
- Los comentarios de otros usuarios aparecen a la **izquierda en gris**
- Solo el profesional puede responder los comentarios de su perfil
- Las respuestas se muestran como subcomentarios
- Los comentarios son exclusivos para profesionales; los usuarios no reciben comentarios

**Visibilidad de comentarios según el rol:**

| Quien los ve | Información visible |
|---|---|
| El profesional | Autor del comentario, fecha `DD MMM YYYY`, hora `H[MM]AM/PM`, botón contactar |
| Otros usuarios | Solo el mensaje y la fecha/hora |

---

## 8. Vista Mis Eventos (mis-eventos) — Profesional

Gestión completa de las salas creadas por el profesional.

**Tarjetas KPI (4 indicadores):**

| Indicador | Descripción |
|---|---|
| Total salas | Historial completo de salas creadas |
| Salas abiertas | Salas activas actualmente |
| Total inscritos | Suma de inscritos en todas las salas |
| Ingresos del mes | Ingresos generados en el mes en curso |

**Sección “Eventos de hoy”:**
- Si el profesional tiene eventos que se realizan hoy, se destacan en una tarjeta prominente con botón **▶ Ingresar al evento**.

**Tabla de eventos:**

| Columna | Descripción |
|---|---|
| Nombre | Nombre de la sala |
| Estado | Badge: Abierta / Próxima / Cerrada |
| Inscritos | Número actual de inscritos |
| Cupo máx. | Capacidad total |
| Precio | Monto de inscripción o “Entrada libre” |
| Fecha | `DD MMM YYYY · H[MM]AM/PM` |
| Acciones | Ingresar (si hoy), Ver detalle, Cerrar/Abrir sala |

- Filtro por nombre y por estado.
- Las filas de eventos que se realizan hoy se resaltan con fondo de acento y badge **HOY**.
- El botón **Cerrar sala / Abrir sala** alterna el estado con confirmación en modal.

---

## 9. Vista Perfil — Usuario (perfil-usuario)

**Cabecera de perfil:** avatar editable, nombre, alias, fecha de registro.

**Campos editables:**
- Alias (seudónimo)
- Número de celular

**Campos de solo lectura:**
- Nombre completo
- Email
- Número de documento
- Tipo de cuenta (Usuario)

**Tabs:**

### Tab 1 — Eventos inscritos
Tabla con: Nombre del evento, Fecha `DD MMM YYYY`, Hora, Orador, Estado (badge), Precio. Paginación de 10 por página.

### Tab 2 — Próximas citas
Tabla con: Profesional, Fecha `DD MMM YYYY`, Hora, Tipo, Estado (badge), Acciones (Mensaje).

---

## 10. Vista Perfil — Profesional (perfil-profesional)

**Cabecera:** avatar editable, nombre, badge de verificación (✓ Verificada), estadísticas (Seguidores, Salas, Citas próximas).

Organizado en **5 tabs**:

### Tab 1 — Información Personal

Formulario personalizable:

| Campo | ¿Editable? |
|---|---|
| Nombre | No |
| Email | No |
| Número de documento | No (enmascarado: \*\*\*\*1234) |
| Número de tarjeta profesional | No (enmascarado) |
| País | Sí |
| Ciudad (vinculada al país) | Sí |
| Ocupación | Sí |
| Celular | Sí |
| Género | Sí |
| Fecha de nacimiento | Sí |
| Años de experiencia | Sí |
| Tarifa por hora | Sí |
| Idiomas | Sí |
| Especialidades | Sí |
| Sobre mí | Sí |
| Cómo trabajo | Sí |
| Foto de perfil | Sí |

> La ciudad se filtra dinámicamente según el país seleccionado.

**Sección de formación académica** (Licenciatura / Postgrado / Certificación):
- Tipo de estudio, Título, Institución, Año de egreso.
- Se pueden agregar o eliminar entradas dinámicamente.

**Restricción:** El perfil profesional no puede tener dos sesiones activas simultáneamente.

### Tab 2 — Salas y Eventos (perfil-pro-salas)

- Tarjetas de salas con estados (Abierta / Próxima / Cerrada).
- Filtro por nombre y estado.
- Estadísticas: Total salas, Abiertas, Cerradas, Próximas.
- Acciones por sala: Gestionar (modal de detalle/edición), Copiar link, Duplicar (solo cerradas), Eliminar (solo cerradas).
- Botón **+ Nueva sala** que abre modal con formulario de creación.

### Tab 3 — Calendario (perfil-pro-calendario)

- Cuadrícula mensual con estados por día: Disponible / Ocupado / Bloqueado.
- Acciones masivas: marcar días seleccionados como Disponible / Ocupado / Bloqueado.
- Horario semanal configurable (Lun–Dom) con rango Desde/Hasta por día y opción Activo/Inactivo.
- Modal por día: editar estado + confirmar.

### Tab 4 — Citas (perfil-pro-citas)

Organizado en 2 sub-tabs (Próximas / Historial):

| Columna | Descripción |
|---|---|
| Paciente | Nombre + avatar |
| Tipo | Asesoría / Seguimiento / Primera consulta |
| Fecha | `DD MMM YYYY` |
| Hora | Formato 12H |
| Duración | En minutos u horas |
| Estado | Badge: Confirmada / Pendiente / Completada / Cancelada |
| Acciones | Ingresar (hoy), Confirmar (pendiente), Cancelar, Ver nota |

- Filtro por paciente, estado y tipo.
- Botón **+ Nueva cita** con modal de creación (paciente, tipo, modalidad [video/presencial], fecha, hora, duración, notas).
- Tab **Historial**: muestra citas completadas con duración y enlace **Ver nota** a las notas clínicas.

### Tab 5 — Indicadores (perfil-pro-kpi)

Panel de analíticas con selector de período (Todo / Este año / Este mes):

| Indicador | Descripción |
|---|---|
| Total de consultas | Número acumulado con variación porcentual |
| Clientes atendidos | Pacientes únicos con variación porcentual |
| Ingresos totales | Suma con variación porcentual |
| Saldo por pagar | Monto pendiente de transferencia con fecha estimada |
| Salas creadas | Total con desglose por estado (mini gráfico) |
| Eventos organizados | Total con variación porcentual |

Incluve gráfico de tendencia de ingresos (últimos 6 meses) y tabla de resumen por indicador.

---

## 11. Vista de Sala de Cita — Usuario (sala-usuario)

| Elemento | Descripción |
|---|---|
| Pantalla principal | Vista de cámara del profesional |
| Controles | Cámara, micrófono, chat (botón circular) |
| Información de la cita | Fecha `DD MMM YYYY`, hora, estado (✓ Confirmada), duración |
| Timer de sesión | Contador HH:MM:SS |
| Control de alias | Toggle para mostrar alias o nombre real al profesional |
| Recomendaciones | Campo de solo lectura con las notas del profesional |
| Nota privada | Textarea editable; solo visible para el usuario |

**Notas:** El usuario no tiene botón para finalizar la sesión. En asesorías, el paciente es anónimo para el profesional.

---

## 12. Vista de Sala de Cita — Profesional (sala-profesional)

| Elemento | Descripción |
|---|---|
| Pantalla principal | Vista de cámara del paciente |
| Indicador de estado | Nombre del paciente + estado de conexión (🟢 En línea) |
| Controles | Cámara, micrófono, chat, mover cita, finalizar sesión |
| Timer de sesión | Contador HH:MM:SS que inicia con la cita |
| Panel clínico — Tab Sesión | Fecha, hora, tipo, paciente, duración. Nota de anonimato si es Asesoría |
| Panel clínico — Tab Recomend. | Textarea con notas del profesional para el paciente; se guarda con fecha y hora |
| Botón finalizar sesión | Abre modal de confirmación → redirige a citas-profesional |
| Botón mover cita | Abre formulario con nueva fecha/hora y motivo |

**Nota:** En citas de tipo **Asesoría**, el sistema indica que la identidad del paciente es anónima y el historial clínico no aplica.

## 12b. Vista de Conferencia en Vivo — Profesional (sala-conferencia-profesional)

| Elemento | Descripción |
|---|---|
| Video principal | Cámara del ponente con animación de transmisión |
| Estado de sala | Chip “EN VIVO” + contador de asistentes + fecha/hora |
| Chip de estado del chat | Muestra si las preguntas están habilitadas o deshabilitadas |
| Timer | Contador de duración de la conferencia |
| Controles | Cámara, Micrófono, Compartir pantalla, Toggle Preguntas, Asistentes, Finalizar |

**Panel lateral (3 tabs):**

| Tab | Contenido |
|---|---|
| Preguntas | Lista de preguntas con alias del autor (visible solo para ponente). Control para habilitar/deshabilitar preguntas en tiempo real. |
| Asistentes | Lista de conectados con rol (Ponente / Profesional / Usuario). Botón de mensaje privado por asistente. |
| Info | Detalles del evento (fecha, hora, categoría, precio, capacidad). Reglas de privacidad de la sala. |

**Botón Finalizar:** modal de confirmación con conteo de asistentes que serán desconectados.

## 12c. Vista de Conferencia en Vivo — Usuario (sala-conferencia-usuario)

| Elemento | Descripción |
|---|---|
| Video principal | Transmisión del ponente |
| Chip de alias | `🎭 Tu alias: [alias]` (solo lectura) |
| Botón Salir | Único control disponible para el usuario |

**Panel lateral (2 tabs):**

| Tab | Contenido |
|---|---|
| Preguntas | Estado del chat (habilitado / deshabilitado por el ponente). Si habilitado: textarea para enviar pregunta anónima. |
| Info | Detalles del evento, privacidad en sala, botón para enviar mensaje privado al ponente. |

**Privacidad:** Los usuarios no ven quién escribió otras preguntas. Solo el ponente ve el alias del remitente.

---

## 13. Proceso de Inscripción y Pago (inscripcion-pago)

Flujo en **3 pasos** (wizard):

### Paso 1 — Confirmación

- Detalle del evento: título, orador, fecha `DD MMM YYYY`, hora, cupos disponibles, categoría, descripción.
- Resumen del pedido: nombre de la sala, precio, IVA, total.
- Botón: **Confirmar y pagar** (pasa al paso 2).
- Aviso: el cupo queda reservado durante 15 minutos mientras se procesa el pago.

### Paso 2 — Pago

Métodos disponibles:
- Tarjeta de crédito (Visa, Mastercard, Amex)
- Tarjeta débito
- PSE (débito en línea)
- Transferencia bancaria

Formulario de tarjeta con auto-formato (número agrupado en bloques de 4, vencimiento MM/AA, nombre en mayúsculas).

### Paso 3 — Resultado

Tres posibles estados:

| Estado | Descripción | Acción disponible |
|---|---|---|
| Inscripción exitosa | Código de inscripción generado + confirmación por correo | Ver mis eventos / Volver al inicio |
| Pago rechazado | La pasarela rechazó la transacción | Reintentar con otro método |
| Sin cupos | No hay disponibilidad al confirmar el pago | Buscar otras salas (inicia reembolso) |

### 13.1 Confirmación al usuario

Tras inscripción exitosa, el sistema envía correo con:
- Nombre del evento
- Fecha: `DD MMM YYYY`
- Hora: formato 12H
- Sala asignada
- Código de inscripción
- Valor pagado
- Recomendaciones previas al evento

### 13.2 Registro administrativo

El sistema guarda trazabilidad de:
- Usuario inscrito
- Pago realizado
- Fecha de inscripción (`DD MMM YYYY`)
- Medio de pago utilizado
- Estado de la inscripción

---

## 14. Pago de Cita Privada (pago-cita)

Formulario de pago de una sola página con dos paneles:

**Panel de pago (izquierda):**

| Pestaña | Contenido |
|---|---|
| Tarjeta | Formulario de tarjeta con vista previa interactiva en tiempo real (número, titular, vencimiento). Auto-formato del número de tarjeta. |
| PSE | Selección de banco (cuadrícula de tiles) + número de documento. |
| Nequi | Ingreso de número de teléfono + QR de demo. |

**Resumen de la cita (derecha, fijo):**
- Datos del profesional (nombre, especialidad, badge verificado).
- Fecha `DD MMM YYYY`, hora, duración, tipo de cita.
- Desglose de precio: sesión + tarifa plataforma = total.
- Enlace a términos de servicio.

**Flujo de pago:**
1. El usuario completa el método de pago seleccionado.
2. Hace clic en **Pagar ahora**.
3. Pantalla de procesamiento (~2 segundos).
4. Overlay de éxito → redirige al calendario del profesional con cita confirmada.

---

## 15. Calendario del Usuario (calendario-usuario)

Vista personal del usuario con sus citas y eventos agendados.

**Vistas:** Semanal | Diaria.

| Tipo de evento | Color |
|---|---|
| Cita confirmada | Verde |
| Cita pendiente | Amarillo |
| Evento inscrito | Morado |

- Línea de hora actual (roja) con auto-scroll a la hora en curso.
- Clic en evento → modal con detalle (tipo, estado, profesional/orador, fecha, hora, acciones según el tipo).
- Navegación: Hoy, ← Anterior, Siguiente →.

---

## 16. Mensajería

### 16.1 Mensajería del Usuario (mensajes-usuario)

- Diseño de dos paneles: lista de conversaciones (izquierda) + chat activo (derecha).
- Solo puede intercambiar mensajes con **profesionales** (restricción visible en el aviso del panel).
- Cada conversación muestra: avatar del profesional, nombre, preview del último mensaje, hora, badge de no leídos.
- Los mensajes propios aparecen a la derecha (burbuja verde); los del profesional a la izquierda (burbuja gris).

### 16.2 Mensajería del Profesional (mensajes-profesional)

- Misma estructura de dos paneles.
- Puede intercambiar mensajes con **usuarios y otros profesionales**.
- Las conversaciones muestran el rol del contacto (etiqueta: Usuario / Profesional).

**Reglas comunes:**
- Privacidad: los mensajes son visibles solo para remitente y destinatario.
- Aviso de privacidad visible en el área del chat.
- Búsqueda de conversaciones por nombre o último mensaje.
- Textarea con auto-resize y botón de envío.

---

## 17. Directorios de Profesionales

### 17.1 Especialistas (especialistas.html)

- Grid de tarjetas de profesionales con filtros: búsqueda por nombre/especialidad, ciudad, orden (Popularidad / Calificación / Nombre A-Z / Tarifa).
- Contadores: Total especialistas, Verificados, Que sigues.
- Paginación con elipsis inteligente.
- Por tarjeta: botón **Seguir / Siguiendo** (toggle con actualización en tiempo real) y botón **Mensaje**.

### 17.2 Psicólogos (psicologos.html)

Misma estructura que Especialistas con filtro adicional por subespecialidad (Psicología clínica, Infantil, Neuropsicología, Pareja, Positiva, Coaching).

### 17.3 Mis Mentores — Usuario (mis-mentores.html)

- Listado de profesionales que el usuario sigue.
- Muestra la fecha desde la que sigue a cada profesional.
- Filtro por tipo (Psicólogo / Especialista) y orden.
- Dejar de seguir requiere confirmación en modal.
- Estado vacío con CTA para explorar el directorio.

### 17.4 Mis Colegas — Profesional (mis-colegas.html)

- Listado de profesionales vinculados para colaboración.
- Estadísticas: Colegas vinculados, Pacientes compartidos, Derivaciones activas.
- Por tarjeta: nombre, rol, especialidades, estado en línea (verde/naranja/gris), número de pacientes compartidos, derivaciones activas.
- Acciones: **Ver pacientes** (modal), **Mensaje**, **Ver perfil**, **Desvincular** (modal de confirmación).

---

## 18. Bandeja de Notificaciones — Administrador (bandeja-notificaciones)

> Ver sección 5.3 del Documento Técnico de Roles para el flujo completo de aprobación.

- Interfaz tipo cliente de correo (panel izquierdo: carpetas + panel derecho: lista + visor).
- Carpetas: Recibidos, Registros profesionales, Leídos.
- Tipos de mensaje: Registro profesional, Sistema.
- Búsqueda por asunto, remitente o nombre del profesional.
- Acciones: Aprobar profesional, Rechazar (con campo de motivo), Marcar todo como leído.

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

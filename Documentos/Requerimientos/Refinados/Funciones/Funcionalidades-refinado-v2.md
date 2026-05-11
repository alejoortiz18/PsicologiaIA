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
| Profesionales > Psicólogos | Listado de psicólogos |
| Profesionales > Mis mentores | Profesionales que el usuario sigue |
| Mis citas | Citas programadas del usuario |
| Mi perfil | Información personal del usuario |
| Calendario | Visualización de citas agendadas |

### Opciones exclusivas del Profesional

| Ítem de menú | Descripción |
|---|---|
| Mis eventos | Salas y sesiones creadas por el profesional |

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

---

## 6. Vista Detalle de Sala (Modal "Ver más")

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

## 8. Vista Mis Eventos

- Muestra únicamente los eventos creados por el usuario actualmente autenticado.

---

## 9. Vista Perfil — Usuario

| Elemento | Descripción |
|---|---|
| Formulario de datos personales | Nombre, correo, alias y demás datos del perfil |
| Tab eventos | Eventos públicos en los que se ha registrado |
| Tab próximas citas | Citas privadas agendadas próximamente |

---

## 10. Vista Perfil — Profesional

### Tab 1 — Información Personal

Formulario personalizable con los siguientes campos:

| Campo | ¿Editable? |
|---|---|
| Nombre | No |
| Email | No |
| Número de documento | No |
| País | Sí |
| Ciudad (vinculada al país) | Sí |
| Ocupación | Sí |
| Celular | Sí |
| Género | Sí |
| Fecha de nacimiento | Sí |
| Sesión activa | Solo visualización |
| Sobre mí | Sí |
| Cómo trabajo | Sí |
| Universidad de egreso | Sí |
| Año de egreso | Sí |
| Años de experiencia | Sí |
| Foto de perfil | Sí |
| Número de tarjeta profesional | No |

> La ciudad se filtra dinámicamente según el país seleccionado.

**Sección de estudios** (Pregrado y Posgrado):
- Nombre del título
- Descripción
- Universidad
- Año de egreso

**Restricción:** El perfil profesional no puede tener dos sesiones activas simultáneamente.

### Tab 2 — Salas y Eventos

- Tarjetas de las salas creadas con sus eventos
- Número de usuarios inscritos a cada sala
- Detalle de cada evento

### Tab 3 — Calendario

- Visualización de horarios disponibles y ocupados
- Horarios configurados por el profesional como no disponibles

### Tab 4 — Citas

- Próximas citas privadas con pacientes
- Próximos eventos públicos agendados

---

## 11. Vista de Citas — Usuario

| Elemento | Descripción |
|---|---|
| Pantalla principal | Vista de cámara del profesional |
| Controles | Activar/desactivar cámara, activar/desactivar audio, enviar mensaje |
| Historial de sesión | Fecha `DD MMM YYYY`, hora `H[MM]AM/PM`, estado (recibida/cancelada/movida), duración |
| Recomendaciones | Notas creadas por el profesional para esta sesión |
| Comentario privado del usuario | El usuario puede registrar notas visibles solo para sí mismo |
| Opción de anonimato | En asesorías, el usuario elige mostrar nombre real o alias |

---

## 12. Vista de Citas — Profesional

| Elemento | Descripción |
|---|---|
| Indicador de usuario en línea | Visible cuando el usuario se conecta |
| Control de cámara | Abrir/cerrar |
| Control de audio | Abrir/cerrar |
| Contador de duración | Inicia cuando comienza la cita |
| Recomendaciones | El profesional puede crear, editar notas; el sistema registra fecha y hora |
| Historial clínico | Disponible si es cita de seguimiento (no en asesorías puntuales) |
| Botón cerrar sesión | Con confirmación en **modal** |
| Botón mover cita | Abre calendario con únicamente los espacios disponibles del profesional |

---

## 13. Proceso de Inscripción y Pago

### 13.1 Estados del proceso

| Estado | Descripción |
|---|---|
| Pendiente de pago | Orden de pago generada, sin procesar |
| Pago aprobado | Pago exitoso confirmado por la pasarela |
| Pago rechazado | La pasarela rechazó la transacción |
| Inscripción confirmada | Cupo asignado, registro completado |
| Sin cupos | No hay disponibilidad en el momento de la inscripción |
| Reembolso pendiente | Pago realizado pero sin cupos disponibles |
| Inscripción cancelada | El usuario canceló antes de completar el proceso |

### 13.2 Métodos de pago aceptados

- Tarjeta crédito
- Tarjeta débito
- PSE
- Transferencia bancaria
- Otros medios habilitados por la pasarela

### 13.3 Confirmación al usuario

Tras inscripción exitosa, el sistema envía correo con:
- Nombre del evento
- Fecha: `DD MMM YYYY`
- Hora: formato 12H
- Sala asignada
- Código de inscripción
- Valor pagado
- Recomendaciones previas al evento

### 13.4 Registro administrativo

El sistema guarda trazabilidad de:
- Usuario inscrito
- Pago realizado
- Fecha de inscripción (`DD MMM YYYY`)
- Medio de pago utilizado
- Estado de la inscripción

---

## 14. Reglas Generales del Sistema

| Regla | Descripción |
|---|---|
| Unicidad | No se permite registro con correo, número de documento o tarjeta profesional ya registrados |
| Cookies de sesión | Configuradas según el perfil (Usuario / Profesional) |
| Inscripción a sala paga | Requiere pago previo para completar el registro |
| Pasarela de pago | Integración requerida para todas las transacciones |
| Visibilidad de salas | Solo se muestran salas con eventos abiertos y vigentes |
| Sobreventa | El sistema valida cupos antes y después del pago para prevenir sobreventa |
| Token de inscripción | Se genera automáticamente tras pago exitoso |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

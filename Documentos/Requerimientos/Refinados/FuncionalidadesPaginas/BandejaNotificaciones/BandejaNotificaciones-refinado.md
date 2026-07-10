# Bandeja de Notificaciones — Vista del Administrador — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 4 — Administración | **Apetito:** 2–3 semanas

---

## 1. Problema

El administrador de la plataforma necesita una bandeja central para gestionar las solicitudes de registro de profesionales pendientes de aprobación, revisar los documentos adjuntos, aprobar o rechazar con motivo, y tener visibilidad de todas las notificaciones del sistema categorizadas por estado.

---

## 2. Apetito

**2 a 3 semanas.**
Bandeja con filtros por estado (Todas/Pendientes/Aprobadas/Rechazadas/Sistema), lista de notificaciones con indicador de estado (dot de color), modal de revisión completa de documentos con botones Aprobar/Rechazar, textarea para el motivo del rechazo, acción "Marcar todas leídas" y paginación.

---

## 3. Límites

### ✅ Dentro del scope

- Filtros de estado: Todas · Pendientes · Aprobadas · Rechazadas · Sistema
- Lista de notificaciones con indicador de estado (dot de color)
- Modal de revisión de documentos: datos del profesional + links a PDFs + botones [Aprobar] / [Rechazar]
- Al rechazar: textarea obligatorio para ingresar el motivo del rechazo
- Acción global **[Marcar todas leídas]**
- Paginación de la lista (10 por página)
- Diferenciación visual entre notificaciones de sistema y solicitudes de registro

### ❌ Fuera del scope (No-Gos)

- Gestión de usuarios (módulo separado)
- Panel de estadísticas globales (módulo separado)
- Editar los datos del profesional desde esta vista

---

## 4. Solución Visible

### Encabezado de la bandeja

| Elemento | Descripción |
|---|---|
| Título | "Bandeja de notificaciones" |
| Contador total | "X notificaciones · Y pendientes de revisión" |
| Botón **[Marcar todas leídas]** | Marca todas las notificaciones como leídas; toast de confirmación |

### Filtros de estado (tabs o pills)

| Estado | Color del dot | Descripción |
|---|---|---|
| **Todas** | — | Todas las notificaciones sin filtro |
| **Pendientes** | 🔵 Azul | Solicitudes de registro esperando revisión |
| **Aprobadas** | 🟢 Verde | Solicitudes aprobadas |
| **Rechazadas** | 🔴 Rojo | Solicitudes rechazadas con motivo |
| **Sistema** | 🟡 Amarillo | Notificaciones automáticas del sistema |

### Lista de notificaciones

**Cada ítem de la lista:**

| Elemento | Descripción |
|---|---|
| **Dot de estado** | Círculo de color según estado (izquierda del ítem) |
| Tipo de notificación | "Nueva solicitud de profesional" / "Pago recibido" / "Error del sistema" etc. |
| Nombre del solicitante | Nombre completo del profesional (si aplica) |
| Fecha y hora | `DD MMM YYYY · H:MMAM/PM` |
| Resumen | Primera línea de la notificación |
| Indicador "no leído" | Fondo ligeramente diferente para notificaciones no leídas |
| **Clic en el ítem** | Abre el modal de detalle (para solicitudes) o expande el texto (para sistema) |

### Modal de revisión — Solicitud de registro

| Elemento | Descripción |
|---|---|
| **Encabezado** | "Solicitud de profesional — [Nombre del solicitante]" |
| **Datos personales** | Nombre completo · Correo · N° cédula · Celular |
| **Datos profesionales** | N° tarjeta COLPSIC · Estado de verificación COLPSIC |
| **Documentos adjuntos** | |
| PDF cédula | Link [Ver PDF] que abre en nueva pestaña |
| PDF tarjeta profesional | Link [Ver PDF] que abre en nueva pestaña |
| **Estado de verificación COLPSIC** | "✓ Pre-validada automáticamente" o "⚠️ Requiere revisión manual" |
| **Fecha de solicitud** | `DD MMM YYYY · H:MMAM/PM` |

**Botones del modal:**

| Botón | Descripción |
|---|---|
| **[Aprobar solicitud]** | Verde; abre mini-confirm "¿Aprobar a [Nombre]?"; al confirmar: Estado → HABILITADO + envío correo con enlace de activación |
| **[Rechazar solicitud]** | Rojo; despliega el campo de motivo (ver más abajo) |
| **[Cerrar]** | Cierra el modal sin acción |

### Sub-panel — Rechazo con motivo (despliega al clic [Rechazar solicitud])

| Elemento | Descripción |
|---|---|
| Título del campo | "Motivo del rechazo (obligatorio)" |
| Textarea | Campo de texto libre; mínimo 20 caracteres |
| Sugerencias rápidas | Chips seleccionables: "Documentos ilegibles" · "Datos incompletos" · "Tarjeta COLPSIC no válida" · "Otro" |
| Botón **[Confirmar rechazo]** | Rojo sólido; envía el rechazo con el motivo al profesional |
| Botón **[Cancelar]** | Cierra el sub-panel; regresa a los botones principales |

### Notificaciones de sistema (ítem expandible)

| Elemento | Descripción |
|---|---|
| Ícono | Ícono de sistema (⚙️) |
| Texto completo | Al hacer clic en el ítem, el texto se expande en la misma fila (accordion) |
| Sin modal | Las notificaciones de sistema no abren modal |

### Paginación

| Elemento | Descripción |
|---|---|
| Registros por página | 10 notificaciones |
| Controles | [‹ Anterior] · páginas numeradas · [Siguiente ›] |
| Texto resumen | "Mostrando 1–10 de X notificaciones" |

---

## 5. Acciones del Administrador

| Acción | Resultado |
|---|---|
| Clic en tab "Pendientes" | Filtra la lista por solicitudes pendientes de revisión |
| Clic en tab "Aprobadas/Rechazadas/Sistema" | Filtra la lista por estado seleccionado |
| Clic en una solicitud pendiente | Abre el modal de revisión con datos + PDFs |
| Clic [Ver PDF] (en modal) | Abre el PDF en nueva pestaña |
| Clic **[Aprobar solicitud]** | Mini-confirm → Estado = HABILITADO → correo de activación al profesional |
| Clic **[Rechazar solicitud]** | Despliega textarea de motivo |
| Completar motivo + [Confirmar rechazo] | Estado = RECHAZADO → correo con motivo al profesional |
| Clic **[Marcar todas leídas]** | Todas las notificaciones se marcan como leídas; toast confirmación |
| Navegar entre páginas | Carga la página siguiente de notificaciones |

---

## 6. Restricciones

- Solo el administrador puede acceder a esta vista.
- El motivo del rechazo es **obligatorio** (mínimo 20 caracteres).
- No se puede aprobar una solicitud sin revisar los documentos (no hay restricción técnica, pero el flujo visual lo incentiva).
- La aprobación es **definitiva**; el estado pasa a HABILITADO y se envía el correo de activación.
- Un rechazo puede ser revisado nuevamente si el profesional re-solicita (proceso fuera de scope).

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Acceso exclusivo | Solo usuarios con `Rol = Admin` pueden acceder a esta vista |
| Aprobar solicitud | `Profesionales.Estado` → `HABILITADO`; sistema genera token de activación (1 día) y envía correo |
| Rechazar solicitud | `Profesionales.Estado` → `RECHAZADO`; se guarda el motivo; se envía correo al profesional |
| Notificación leída | `Notificaciones.Leido = true` al abrir el modal o al hacer "Marcar todas leídas" |
| Dot de color | Amarillo = Pendiente; Verde = Aprobada; Rojo = Rechazada; Amarillo pálido = Sistema |
| Motivo de rechazo | Mínimo 20 caracteres; se almacena en `Profesionales.MotivoRechazo` |
| Formato fechas | `DD MMM YYYY` |
| Formato horas | 12H |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Aprobación accidental | Mini-confirm modal antes de aprobar |
| Correo de activación no llega | Admin puede reenviar el correo (botón en el modal si Estado = HABILITADO y no ha activado) |
| PDF no accesible | Validar que los links de PDF funcionen al abrir el modal |
| Muchas notificaciones sin revisar | Badge en el menú del admin con el conteo de pendientes |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Notificaciones | `Notificaciones` (NotifId, TipoNotif, TargetId, Mensaje, Estado, Leido, Timestamp) |
| Solicitudes de registro | `Profesionales` (Estado = PENDIENTE) |
| Datos del solicitante | `Profesionales.NombreCompleto`, `Correo`, `NumeroDocumento`, `Celular` |
| N° COLPSIC | `Profesionales.NumeroTarjetaProfesional`, `Verificado` |
| PDFs adjuntos | `Profesionales.UrlDocumentoIdentidad`, `Profesionales.UrlTarjetaProfesional` |
| Motivo de rechazo | `Profesionales.MotivoRechazo` |
| Token de activación | `TokensActivacion` (Token, ProfesionalId, FechaExpiracion, Usado) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Filtros funcionales | Cada tab muestra solo las notificaciones de ese estado |
| Modal con documentos | Los PDFs se abren correctamente desde el modal |
| Aprobación con correo | El profesional recibe el enlace de activación tras la aprobación |
| Rechazo con motivo | El motivo es obligatorio y se envía al profesional |
| "Marcar todas leídas" | Todas las notificaciones cambian a `Leido = true` |
| Paginación correcta | 10 por página con navegación funcional |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

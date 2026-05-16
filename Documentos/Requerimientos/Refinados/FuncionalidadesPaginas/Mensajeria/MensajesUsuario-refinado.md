# Mensajería — Vista del Usuario — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1 semana

---

## 1. Problema

El usuario necesita un módulo de mensajería para comunicarse de forma asíncrona con sus profesionales, con una vista de conversaciones organizada que le muestre el estado de sus mensajes y le permita responder fácilmente.

---

## 2. Apetito

**1 semana.**
Layout split idéntico a `mensajes-profesional.html` desde la perspectiva del usuario: panel izquierdo (lista de conversaciones con profesionales) y panel derecho (chat activo con burbujas, input y estado en línea del profesional).

---

## 3. Límites

### ✅ Dentro del scope

- Layout split: **panel izquierdo** (lista de conversaciones) + **panel derecho** (chat activo)
- Búsqueda de conversaciones por nombre del profesional
- Lista de conversaciones: avatar · nombre del profesional · último mensaje · badge de no leídos · timestamp
- Panel derecho: encabezado (nombre del profesional + estado en línea) · burbujas · input + [Enviar]
- El usuario **sí ve el nombre real del profesional** (a diferencia del profesional que solo ve el alias del paciente)
- Marcar conversación como leída al abrirla

### ❌ Fuera del scope (No-Gos)

- Envío de archivos adjuntos (versión posterior)
- Videollamada desde la mensajería
- Iniciar conversación con un profesional que no tiene cita confirmada previa

---

## 4. Solución Visible

### Layout general

```
┌────────────────────┬──────────────────────────────────────┐
│   Panel izquierdo  │         Panel derecho (chat)          │
│   (conversaciones) │                                        │
│   ~30% ancho       │           ~70% ancho                   │
└────────────────────┴──────────────────────────────────────┘
```

### Panel izquierdo — Lista de conversaciones

**Encabezado:**

| Elemento | Descripción |
|---|---|
| Título | "Mensajes" |
| Campo de búsqueda | Buscar por nombre del profesional |

**Cada conversación en la lista:**

| Elemento | Descripción |
|---|---|
| Avatar del profesional | Foto de perfil del profesional |
| Nombre del profesional | Nombre real (ej: "Dra. Valentina García") |
| Especialidad | Texto pequeño debajo del nombre |
| Último mensaje | Truncado a ~50 caracteres |
| Timestamp | Hora si es hoy / fecha si es anterior |
| Badge de no leídos | Círculo verde con el número de mensajes no leídos |
| Orden | Conversaciones con mensajes más recientes primero |

Al seleccionar una conversación:
- Se carga en el panel derecho
- El badge de no leídos desaparece
- La conversación queda resaltada

### Panel derecho — Chat activo

**Estado vacío (sin conversación seleccionada):**

| Elemento | Descripción |
|---|---|
| Ícono | Ícono de chat |
| Texto | "Selecciona una conversación para ver los mensajes" |

**Con conversación seleccionada:**

**Encabezado del chat:**

| Elemento | Descripción |
|---|---|
| Avatar | Foto del profesional |
| Nombre | "Dra. Valentina García" |
| Especialidad | "Psicología clínica" |
| Estado en línea | Punto verde "En línea" o gris "Desconectado" |

**Feed de mensajes:**

| Elemento | Descripción |
|---|---|
| Mensajes del usuario | Burbujas a la derecha; color del tema |
| Mensajes del profesional | Burbujas a la izquierda; gris claro |
| Timestamp | Debajo de cada mensaje; formato `H:MMAM/PM` |
| Scroll | Automático al último mensaje; scroll arriba para historial |

**Área de entrada:**

| Elemento | Descripción |
|---|---|
| Campo de texto | Input de texto; Enter para nueva línea (Shift+Enter) |
| Botón **[Enviar]** | Activo solo si el campo no está vacío |
| Enviar con tecla | Presionar Enter envía el mensaje |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Buscar en el panel izquierdo | Filtra la lista de conversaciones por nombre del profesional |
| Clic en una conversación | Carga los mensajes; badge desaparece |
| Escribir + [Enviar] | Mensaje aparece como burbuja derecha; guardado en BD |
| Presionar Enter | Envía el mensaje |
| Scroll hacia arriba | Carga mensajes anteriores |

---

## 6. Restricciones

- El usuario solo puede tener conversaciones con profesionales con quienes tiene o tuvo una **cita confirmada** (no se puede abrir conversación con cualquier profesional).
- No se pueden enviar archivos adjuntos en esta versión.
- Solo el profesional y el usuario pueden ver sus mensajes.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Nombre del profesional | Se muestra `Profesionales.NombreCompleto` (diferente al módulo del profesional que muestra alias) |
| Conversaciones permitidas | Solo entre usuario y profesionales con cita histórica confirmada |
| Marcar como leído | Al abrir la conversación, mensajes se marcan `Leido = true` |
| Orden de conversaciones | Por `Mensajes.Timestamp` DESC del último mensaje |
| Paginación de mensajes | Cargar los últimos 50 mensajes; más al hacer scroll |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Usuario intenta abrir chat sin cita previa | El sistema no muestra el botón de mensaje si no hay cita histórica |
| Mensajes no leídos sin marcar | Marcar como leído automáticamente al abrir la conversación |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Conversaciones del usuario | `Conversaciones` (ConversacionId, UsuarioId, ProfesionalId) |
| Mensajes | `Mensajes` (MensajeId, ConversacionId, RemitenteId, Texto, Timestamp, Leido) |
| Datos del profesional | `Profesionales.NombreCompleto`, `FotoPerfil`, `Especialidad` |
| Estado en línea | `Profesionales.UltimaActividad` (online si < 5 minutos) |
| Badge no leídos | `COUNT(Mensajes)` donde `Leido = false` y `DestinatarioId = UsuarioId` |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Lista de conversaciones correcta | Solo conversaciones con profesionales con cita histórica |
| Badge de no leídos | Correcto y desaparece al abrir la conversación |
| Envío de mensajes | Aparece inmediatamente en el feed |
| Búsqueda funcional | Filtra correctamente por nombre del profesional |
| Paginación | Carga mensajes anteriores al hacer scroll |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

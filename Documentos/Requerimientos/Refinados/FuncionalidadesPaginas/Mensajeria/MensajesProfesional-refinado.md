# Mensajería — Vista del Profesional — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 3 — Herramientas del Profesional | **Apetito:** 1–2 semanas

---

## 1. Problema

El profesional necesita un módulo de mensajería que le permita comunicarse con sus pacientes de forma asíncrona, respetando siempre el **alias anónimo** de los usuarios (nunca el nombre real), y con un panel de conversaciones organizado que le permita saber qué mensajes no ha leído.

---

## 2. Apetito

**1 a 2 semanas.**
Layout split (panel izquierdo de conversaciones + panel derecho de mensajes), búsqueda de conversaciones, lista con alias/último mensaje/badge de no leídos/timestamp, y panel derecho con burbujas de mensajes y campo de envío.

---

## 3. Límites

### ✅ Dentro del scope

- Layout split: **panel izquierdo** (lista de conversaciones) + **panel derecho** (chat activo)
- Búsqueda en el panel izquierdo
- Lista de conversaciones: avatar del alias · alias del paciente · último mensaje · badge de no leídos · timestamp
- Panel derecho: encabezado (alias + estado en línea) · burbujas de mensajes · input + [Enviar]
- El profesional **solo ve el alias** de los pacientes (nunca el nombre real)
- Marcar conversación como leída al abrirla

### ❌ Fuera del scope (No-Gos)

- Envío de archivos adjuntos (versión posterior)
- Videollamada desde la mensajería
- Mensajes entre profesionales

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
| Campo de búsqueda | Buscar por alias del paciente |

**Cada conversación en la lista:**

| Elemento | Descripción |
|---|---|
| Avatar del alias | Imagen o inicial del alias del paciente |
| Alias del paciente | `@alias-paciente` (nunca el nombre real) |
| Último mensaje | Truncado a ~50 caracteres |
| Timestamp | Hora si es hoy / fecha si es anterior |
| Badge de no leídos | Círculo verde con el número de mensajes no leídos |
| Orden | Conversaciones con mensajes más recientes primero |

Al seleccionar una conversación:
- Se carga en el panel derecho
- El badge de no leídos desaparece
- La conversación queda resaltada (fondo ligeramente más oscuro)

### Panel derecho — Chat activo

**Estado vacío (sin conversación seleccionada):**

| Elemento | Descripción |
|---|---|
| Ícono | Ícono de chat genérico |
| Texto | "Selecciona una conversación para ver los mensajes" |

**Con conversación seleccionada:**

**Encabezado del chat:**

| Elemento | Descripción |
|---|---|
| Avatar | Avatar del alias del paciente |
| Alias | `@alias-paciente` |
| Estado en línea | Punto verde "En línea" o gris "Desconectado" (basado en actividad reciente) |

**Feed de mensajes:**

| Elemento | Descripción |
|---|---|
| Mensajes del profesional | Burbujas a la derecha; color del tema (verde o azul) |
| Mensajes del paciente | Burbujas a la izquierda; gris claro |
| Timestamp | Debajo de cada mensaje; formato `H:MMAM/PM` |
| Scroll | Automático al último mensaje; el profesional puede hacer scroll hacia arriba para ver historial |

**Área de entrada:**

| Elemento | Descripción |
|---|---|
| Campo de texto | Input de texto; permite Enter para nueva línea (Shift+Enter) |
| Botón **[Enviar]** | Flecha o texto "Enviar"; activo solo si el campo no está vacío |
| Enviar con tecla | Presionar Enter envía el mensaje |

---

## 5. Acciones del Profesional

| Acción | Resultado |
|---|---|
| Buscar en el panel izquierdo | Filtra la lista de conversaciones por alias |
| Clic en una conversación | Carga los mensajes en el panel derecho; badge de no leídos desaparece |
| Escribir un mensaje + [Enviar] | Mensaje aparece como burbuja derecha; se guarda en la BD |
| Presionar Enter | Envía el mensaje (mismo efecto que [Enviar]) |
| Scroll hacia arriba | Carga mensajes anteriores (paginación infinita) |

---

## 6. Restricciones

- El profesional **nunca ve el nombre real** del paciente; siempre se muestra el alias.
- Los mensajes son **asíncronos**; no es un chat en tiempo real para la versión 1 (puede recargarse o usar polling).
- No se pueden enviar archivos adjuntos en esta versión.
- Solo el profesional y el paciente pueden ver sus mensajes.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Alias del paciente | Siempre `Usuarios.Alias`; nunca `Usuarios.NombreCompleto` |
| Mensajes no leídos | `COUNT(Mensajes)` donde `DestinatarioId = ProfesionalId` y `Leido = false` y `ConversacionId = X` |
| Marcar como leído | Al abrir la conversación, todos los mensajes de ese hilo se marcan como `Leido = true` |
| Orden de conversaciones | Por `Mensajes.Timestamp` DESC del último mensaje |
| Paginación de mensajes | Cargar los últimos 50 mensajes; cargar más al hacer scroll hacia arriba |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Profesional confunde alias con nombre real | El sistema nunca expone el nombre real en ningún punto del chat |
| Mensajes no marcados como leídos | Marcar como leído al abrir la conversación |
| Historial de mensajes muy largo | Paginación infinita (cargar 50 por bloque) |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Conversaciones | `Conversaciones` (ConversacionId, ProfesionalId, UsuarioId) |
| Mensajes | `Mensajes` (MensajeId, ConversacionId, RemitenteId, Texto, Timestamp, Leido) |
| Alias del paciente | `Usuarios.Alias` |
| Estado en línea | `Usuarios.UltimaActividad` (online si < 5 minutos) |
| Badge no leídos | `COUNT(Mensajes)` donde `Leido = false` y `DestinatarioId = ProfesionalId` |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Alias mostrado | El nombre real del paciente nunca aparece en ningún punto |
| Badge de no leídos | El contador es correcto y desaparece al abrir la conversación |
| Envío de mensajes | El mensaje aparece inmediatamente en el feed |
| Búsqueda funcional | Filtra correctamente por alias |
| Paginación | Carga mensajes anteriores al hacer scroll |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

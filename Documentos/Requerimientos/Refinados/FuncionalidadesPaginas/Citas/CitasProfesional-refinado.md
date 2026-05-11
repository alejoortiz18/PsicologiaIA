# Vista de Citas — Perfil Profesional — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 3 — Herramientas del Profesional | **Apetito:** 1–2 semanas

---

## 1. Problema

El profesional necesita una vista completa durante la cita en vivo que le permita monitorear al paciente (indicador de conexión), gestionar los controles de sesión, registrar recomendaciones clínicas, acceder al historial del paciente y mover la cita si es necesario.

---

## 2. Apetito

**1 a 2 semanas.**
Vista de cita activa con indicador de usuario conectado, controles de sesión, contador de duración, registro de recomendaciones clínicas, historial clínico (en citas de seguimiento) y opción de mover la cita.

---

## 3. Límites

### ✅ Dentro del scope

- Indicador de usuario en línea (visible cuando el usuario se conecta)
- Control de cámara: abrir/cerrar
- Control de audio: abrir/cerrar
- Contador de duración de la sesión (inicia cuando comienza la cita)
- Registro, edición y visualización de recomendaciones clínicas con fecha y hora automática
- Acceso al historial clínico del paciente (solo en citas de seguimiento)
- Botón cerrar sesión (con confirmación en **modal**)
- Botón mover cita (con calendario de espacios disponibles)

### ❌ Fuera del scope (No-Gos)

- Grabación de la sesión (fuera del scope por razones éticas y legales)
- Facturación o cobro durante la cita (corresponde al módulo financiero)
- Derivación a otro especialista (corresponde al módulo de derivaciones)
- Chat de texto completo (solo comunicación por controles básicos en esta vista)

---

## 4. Solución Visible

### Área principal de la cita

| Elemento | Descripción |
|---|---|
| Vista del usuario | Cámara del paciente en la pantalla principal |
| Vista propia del profesional | Ventana pequeña con la cámara del profesional |
| Indicador de usuario en línea | Muestra si el paciente está conectado a la sesión |
| Contador de duración | Inicia automáticamente al comenzar la cita (`HH:MM:SS`) |

### Barra de controles

| Control | Descripción |
|---|---|
| Abrir / Cerrar cámara | El profesional activa o desactiva su transmisión de video |
| Abrir / Cerrar audio | El profesional habilita o silencia su micrófono |
| Cerrar sesión | Abre **modal de confirmación** antes de finalizar la cita |
| Mover cita | Abre el calendario del profesional mostrando solo los espacios disponibles |

### Panel lateral — información clínica

| Sección | Descripción |
|---|---|
| Recomendaciones | Campo editable para crear/editar notas clínicas de la sesión; el sistema registra automáticamente la fecha y hora de cada entrada |
| Historial clínico | Disponible únicamente en **citas de seguimiento** (no en asesorías puntuales); muestra el historial del paciente |

---

## 5. Acciones del Profesional

| Acción | Resultado |
|---|---|
| Ver indicador de usuario en línea | Confirma que el paciente está conectado antes de iniciar |
| Abrir / Cerrar cámara | Activa o detiene la transmisión de video propia |
| Abrir / Cerrar audio | Habilita o silencia el micrófono |
| Crear recomendación | El sistema guarda el texto con fecha y hora automática |
| Editar recomendación existente | El sistema actualiza el registro con nueva fecha/hora de modificación |
| Ver historial clínico | Solo disponible en citas de seguimiento; muestra el historial del paciente |
| Hacer clic en "Cerrar sesión" | Abre modal de confirmación; al confirmar, la cita se marca como finalizada |
| Hacer clic en "Mover cita" | Abre el calendario del profesional con solo los espacios disponibles para elegir nueva fecha/hora |

---

## 6. Restricciones

- El historial clínico **solo está disponible en citas de tipo seguimiento**; en asesorías puntuales no se muestra.
- El profesional **no puede** cerrar la sesión sin pasar por el **modal de confirmación**.
- El calendario para mover la cita muestra **únicamente los espacios disponibles** del profesional (sin horarios bloqueados ni ya ocupados).
- Las recomendaciones registradas durante la sesión son **visibles solo para el profesional y el usuario de esa cita** (el usuario las ve en modo lectura).

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Contador de duración | Inicia automáticamente cuando la cita comienza; se detiene al cerrar la sesión |
| Fecha/hora de recomendaciones | El sistema las registra automáticamente en el momento de la creación o edición |
| Historial clínico | Solo accesible en citas de tipo **Seguimiento**; bloqueado en **Asesorías** |
| Mover cita | Requiere autorización del usuario; si no acepta, se negocia o se realiza devolución del dinero (flujo fuera de este scope) |
| Cerrar sesión | Siempre con confirmación en **modal** para evitar cierres accidentales |
| Formato de fechas | `DD MMM YYYY` |
| Formato de horas | `H[MM]AM/PM` |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Cierre accidental de la sesión | Modal de confirmación obligatorio antes de finalizar |
| Recomendaciones perdidas si se cierra sin guardar | Autosave de recomendaciones al escribir |
| Conexión inestable del profesional | Mostrar indicador de estado de conexión; soportar reconexión automática |
| El usuario no acepta mover la cita | Definir en el módulo de gestión de citas el flujo de negociación o devolución |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Datos de la cita | `Citas` (CitaId, UsuarioId, ProfesionalId, FechaHora, Estado, Tipo) |
| Estado del usuario (en línea) | Control en tiempo real vía WebSocket o señalización del servidor |
| Duración de la sesión | Calculada en tiempo real: Ahora - FechaHoraInicio |
| Recomendaciones | `Recomendaciones` (CitaId, ProfesionalId, Texto, FechaCreacion, FechaModificacion) |
| Historial clínico | `HistorialClinico` (UsuarioId, ProfesionalId) — solo tipo Seguimiento |
| Horarios disponibles para mover | `HorariosDisponibles` (ProfesionalId, Estado = Disponible) |
| Tipo de cita | `Citas.Tipo` (Seguimiento / Asesoria) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Indicador de usuario funcional | El indicador refleja correctamente si el usuario está conectado |
| Contador de duración preciso | El contador inicia al comenzar la cita y se detiene al cerrarla |
| Recomendaciones guardadas | Las notas se persisten con fecha/hora automática |
| Historial clínico restringido | Solo se muestra en citas de tipo Seguimiento |
| Cerrar sesión con confirmación | Nunca se cierra la sesión sin pasar por el modal de confirmación |
| Mover cita funcional | El calendario muestra solo espacios disponibles del profesional |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

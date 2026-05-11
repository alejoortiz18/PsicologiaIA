# Vista de Citas — Perfil Usuario — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1–2 semanas

---

## 1. Problema

El usuario necesita una vista dedicada durante la cita en vivo que le permita interactuar con el profesional (cámara, audio, mensajes), consultar el historial de la sesión y acceder a las recomendaciones del profesional, con la opción de mantener el anonimato si lo desea.

---

## 2. Apetito

**1 a 2 semanas.**
Vista de cita activa con controles de cámara/audio, historial de sesión, recomendaciones del profesional y comentarios privados del usuario.

---

## 3. Límites

### ✅ Dentro del scope

- Visualización de la cámara del profesional (pantalla principal)
- Controles: activar/desactivar cámara propia, activar/desactivar audio propio, enviar mensaje
- Historial de la sesión actual: fecha, hora, estado y duración
- Recomendaciones del profesional visibles durante la sesión
- Campo de comentario privado del usuario (solo visible para el propio usuario)
- Opción de anonimato: mostrar nombre real o alias en asesorías puntuales

### ❌ Fuera del scope (No-Gos)

- Grabación de la sesión (fuera del scope por razones éticas y legales)
- Chat de texto completo (fuera del scope de esta vista; solo envío de mensaje puntual)
- Historial clínico completo (corresponde al módulo del profesional)
- Pago de la cita (corresponde al módulo `InscripcionPago`)

---

## 4. Solución Visible

### Área principal de la cita

| Elemento | Descripción |
|---|---|
| Pantalla principal | Vista de cámara del profesional (ocupa la mayor parte de la pantalla) |
| Vista propia | Cámara del usuario (ventana pequeña, posicionada sobre la pantalla principal) |
| Barra de controles | Botones de control de sesión (cámara, audio, mensaje) |

### Barra de controles

| Control | Descripción |
|---|---|
| Activar / Desactivar cámara | Muestra u oculta la cámara propia del usuario |
| Activar / Desactivar audio | Habilita o silencia el micrófono del usuario |
| Enviar mensaje | Abre un campo de texto para enviar un mensaje al profesional |

### Panel lateral — información de la sesión

| Sección | Descripción |
|---|---|
| Historial de sesión | Fecha (`DD MMM YYYY`), hora (`H[MM]AM/PM`), estado (recibida / cancelada / movida), duración |
| Recomendaciones del profesional | Notas creadas por el profesional para esta sesión; solo lectura para el usuario |
| Comentario privado del usuario | Campo editable visible únicamente para el propio usuario |

### Opción de anonimato

| Contexto | Descripción |
|---|---|
| Asesoría puntual | El usuario elige si mostrar su **nombre real** o su **alias** durante la sesión |
| Cita de seguimiento clínico | El profesional tiene acceso al nombre real del usuario para el historial clínico |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Activar / Desactivar cámara | La transmisión de video propia se habilita o detiene |
| Activar / Desactivar audio | El micrófono se habilita o silencia |
| Enviar mensaje | El mensaje se envía al profesional en tiempo real |
| Ver recomendaciones | El usuario consulta las notas del profesional para esta sesión |
| Escribir comentario privado | El comentario se guarda y es visible solo para el usuario |
| Elegir nombre real o alias *(en asesorías)* | El profesional ve el identificador elegido por el usuario |

---

## 6. Restricciones

- Las recomendaciones del profesional son de **solo lectura** para el usuario; no puede editarlas.
- El comentario privado del usuario **no es visible** para el profesional.
- En asesorías, el usuario elige su identificador **antes o al inicio** de la sesión.
- El historial clínico completo (notas de seguimiento, medicamentos) es visible solo para el profesional.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Cámara del profesional | Es la pantalla principal; ocupa el área central de la vista |
| Comentario privado | Guardado en base de datos con `UsuarioId`; nunca expuesto al profesional |
| Anonimato | Solo aplica en **asesorías puntuales**; en seguimiento clínico el nombre real es obligatorio |
| Historial de sesión | Registrado automáticamente por el sistema (fecha, hora inicio, hora fin, estado) |
| Formato de fechas | `DD MMM YYYY` |
| Formato de horas | `H[MM]AM/PM` (ej: `3PM`, `3:30PM`) |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Conexión inestable del usuario | Mostrar indicador de estado de conexión; el sistema debe soportar reconexión |
| Comentario privado perdido si cierra sin guardar | Guardar automáticamente al escribir (autosave) |
| El profesional no activa su cámara | Mostrar mensaje de espera mientras la cámara del profesional no esté disponible |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Datos de la cita | `Citas` (CitaId, UsuarioId, ProfesionalId, FechaHora, Estado, Tipo) |
| Duración de la sesión | Calculada: FechaHoraFin - FechaHoraInicio |
| Recomendaciones del profesional | `Recomendaciones` (CitaId, ProfesionalId, Texto, FechaCreacion) |
| Comentario privado del usuario | `ComentariosPrivados` (CitaId, UsuarioId, Texto) |
| Alias del usuario | `Usuarios.Alias` |
| Tipo de cita | `Citas.Tipo` (Seguimiento / Asesoria) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Cámara del profesional visible | La vista principal muestra el video del profesional al iniciar la sesión |
| Controles funcionales | Activar/desactivar cámara y audio operan correctamente |
| Recomendaciones visibles | El usuario ve las recomendaciones del profesional durante la sesión |
| Comentario privado guardado | El comentario se persiste y no es visible para el profesional |
| Historial correcto | Fecha, hora y duración reflejan los datos reales de la sesión |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

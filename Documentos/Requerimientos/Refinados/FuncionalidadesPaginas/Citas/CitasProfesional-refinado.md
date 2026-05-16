# Gestión de Citas — Profesional — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 3 — Herramientas del Profesional | **Apetito:** 1–2 semanas

---

## 1. Problema

El profesional necesita una vista dedicada para gestionar todas sus citas privadas: ver las próximas y el historial, filtrar por estado y tipo, confirmar o cancelar citas pendientes, agendar nuevas citas, e ingresar a una sala activa directamente desde la lista.

---

## 2. Apetito

**1 a 2 semanas.**
Vista de gestión de citas con resumen operativo del día, tabla filtrable, tabs Próximas/Historial, modal de detalle de cita, modal de nueva cita e ingreso directo a sala activa.

---

## 3. Límites

### ✅ Dentro del scope

- Franja de 4 métricas: Citas hoy / Esta semana / Pendientes de confirmar / Completadas del mes
- Barra de filtros: búsqueda por nombre de paciente, filtro estado, filtro tipo
- Pestañas internas: Próximas | Historial
- Tabla de citas con columnas: Paciente · Tipo · Fecha · Hora · Duración · Estado · Acciones
- Acción "Ingresar" (citas activas o del día) → navega a `sala-profesional.html`
- Acción "Ver" → abre modal detalle
- Acción "Confirmar" (citas pendientes) con spinner y actualización inline del badge
- Acción "Cancelar" con modal de confirmación y notificación automática al paciente
- Modal "Detalle de cita": todos los datos de la cita + botón "Ingresar a cita"
- Modal "Nueva cita": campos completos para agendar manualmente
- Badge especial "Hoy" en citas del día actual

### ❌ Fuera del scope (No-Gos)

- Sala de videollamada en vivo (corresponde a `SalaProfesional-refinado.md`)
- Cobro o procesamiento de pagos durante la cita
- Derivación a otro especialista (módulo independiente)
- Notas clínicas dentro de la lista (se gestionan en la sala)

---

## 4. Solución Visible

### Franja de métricas (stats strip)

| Indicador | Descripción |
|---|---|
| Citas hoy | Número de citas programadas para el día actual |
| Esta semana | Total de citas de la semana en curso |
| Pendientes de confirmar | Citas con estado Pendiente que requieren acción del profesional |
| Completadas (mes) | Citas finalizadas en el mes actual |

### Barra de filtros y acciones

| Elemento | Descripción |
|---|---|
| Búsqueda por paciente | Campo de texto; filtra por nombre o alias del paciente en tiempo real |
| Filtro Estado | Select: Confirmada / Pendiente / Completada / Cancelada |
| Filtro Tipo | Select: Asesoría / Seguimiento / Sala pública |
| Botón "+ Nueva cita" | Abre el modal de creación de cita |

### Pestañas internas

| Tab | Contenido |
|---|---|
| 📆 Próximas | Citas con estado Confirmada o Pendiente |
| 🗂 Historial | Citas con estado Completada o Cancelada |

### Tabla — Columnas

| Columna | Descripción |
|---|---|
| Paciente | Alias protegido del paciente (nunca nombre real) |
| Tipo | Asesoría / Seguimiento / Primera consulta / Sala pública |
| Fecha | `DD MMM YYYY` |
| Hora | `H[MM]AM/PM` |
| Duración | Minutos acordados (30 / 50 / 60 / 90 min) |
| Estado | Badge de color: Confirmada (verde) / Pendiente (amarillo) / Completada (gris) / Cancelada (rojo) / Hoy (verde brillante) |
| Acciones | Botones contextuales según estado |

### Botones de acción por estado de cita

| Estado | Acciones disponibles |
|---|---|
| Confirmada (hoy) | [Ingresar] → sala-profesional.html · [Ver] |
| Confirmada (futura) | [Ver] |
| Pendiente | [Confirmar] · [Cancelar] · [Ver] |
| Completada | [Ver nota] |
| Cancelada | — |

### Modal — Detalle de cita

| Campo | Descripción |
|---|---|
| Paciente | Alias |
| Tipo | Asesoría / Seguimiento / Primera consulta |
| Fecha y hora | Formato completo |
| Duración | En minutos |
| Modalidad | Videollamada / Presencial |
| Notas previas | Texto clínico introductorio visible solo para el profesional |
| Footer del modal | [Cerrar] [Ingresar a cita → sala-profesional.html] |

### Modal — Nueva cita

| Campo | Requerido | Descripción |
|---|---|---|
| Paciente | Sí | Alias o correo del paciente |
| Tipo | Sí | Asesoría / Seguimiento / Primera consulta |
| Modalidad | Sí | Videollamada / Presencial |
| Fecha | Sí | Date picker |
| Hora | Sí | Time picker |
| Duración | Sí | 30 / 50 / 60 / 90 min |
| Notas para el paciente | No | Texto de hasta 500 chars |
| Footer | — | [Cancelar] [Agendar] con loading 1.2s y toast de éxito |

---

## 5. Acciones del Profesional

| Acción | Resultado |
|---|---|
| Filtrar por paciente | La tabla filtra en tiempo real por alias/nombre |
| Filtrar por estado/tipo | La tabla muestra solo las citas que coinciden |
| Cambiar entre tabs | Alterna entre vista Próximas e Historial |
| Confirmar cita pendiente | Botón muestra spinner → badge cambia a "Confirmada" → paciente recibe notificación |
| Cancelar cita | `showConfirm()` → al confirmar, estado pasa a Cancelada + notificación al paciente |
| Ver detalle | Se abre modal con toda la información de la cita |
| Ingresar a cita | Navega a `sala-profesional.html` con el contexto de la cita |
| Crear nueva cita | Llena el modal → loading 1.2s → toast éxito + notificación al paciente |

---

## 6. Restricciones

- Los pacientes se muestran siempre por **alias** (nunca nombre real), garantizando privacidad.
- El botón "Ingresar" solo aparece para citas del **día actual** con estado Confirmada.
- El cancelar una cita siempre pasa por `showConfirm()` antes de ejecutar la acción.
- La acción "Confirmar" deshabilita el botón durante el procesamiento para evitar doble envío.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Badge "Hoy" | Se aplica a la cita cuya fecha coincide con la fecha actual del servidor |
| Cancelación | Genera notificación automática al paciente |
| Confirmación | Cambia estado de Pendiente → Confirmada en tiempo real |
| Privacidad de alias | El profesional ve siempre alias (ej: "Luna Verde", "Anónimo #7") |
| Formato de fechas | `DD MMM YYYY` |
| Formato de horas | `H[MM]AM/PM` |
| Sala pública en citas | Aparece en tabla como tipo "Sala pública"; botón "Ingresar" lleva a `sala-conferencia-profesional.html` |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Cancelación accidental | Modal de confirmación obligatorio |
| Doble confirmación de cita | Botón se deshabilita durante el procesamiento |
| Cita no encontrada por filtros | Mostrar estado vacío claro con opción de limpiar filtros |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Lista de citas | `Citas` (CitaId, ProfesionalId, UsuarioId, Fecha, Hora, Tipo, Modalidad, Estado, Duracion) |
| Alias del paciente | `Usuarios.Alias` |
| Notas de cita | `NotasCita` (CitaId, ProfesionalId, Texto) |
| Métricas del día/semana/mes | Calculadas con `COUNT` por `ProfesionalId` + rango de fechas |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Filtros funcionales | Búsqueda y filtros retornan resultados correctos en tiempo real |
| Badge "Hoy" correcto | Solo aparece en citas cuya fecha = fecha actual |
| Confirmación sin doble envío | El botón queda deshabilitado durante el loading |
| Cancelación con notificación | El paciente recibe notificación automática tras cancelar |
| Modal de detalle completo | Muestra todos los campos definidos sin datos vacíos |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*


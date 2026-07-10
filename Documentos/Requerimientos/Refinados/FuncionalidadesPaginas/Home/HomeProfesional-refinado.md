# Home — Dashboard del Profesional — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 3 — Herramientas del Profesional | **Apetito:** 1–2 semanas

---

## 1. Problema

El profesional autenticado necesita una vista central que le muestre de un vistazo su actividad del día (citas programadas, salas activas, mensajes pendientes, ingresos del mes), le permita gestionar solicitudes de cita y acceder rápidamente a sus salas activas.

---

## 2. Apetito

**1 a 2 semanas.**
Dashboard con saludo personalizado, 4 KPI cards, card de próxima cita del día, grid de salas activas con asistentes y panel de solicitudes pendientes con acciones inline.

---

## 3. Límites

### ✅ Dentro del scope

- Saludo personalizado: "Buenos días / tardes / noches, Dra/Dr. [Nombre]"
- 4 tarjetas KPI: Citas hoy · Salas activas · Mensajes sin leer · Ingresos del mes
- Sección "Tu próxima cita del día" — card destacada con botón "Ingresar"
- Grid "Salas activas" — cards con nombre, asistentes conectados y acciones
- Panel "Solicitudes pendientes" — citas esperando confirmación con botones [Confirmar] [Rechazar] inline
- Botones de acceso rápido

### ❌ Fuera del scope (No-Gos)

- Gestión completa de citas (corresponde a `citas-profesional.html`)
- Creación de nuevas salas (corresponde a `mis-eventos.html`)
- Dashboard del Usuario (vista independiente: `HomeProfesional`)
- Panel financiero detallado (Tab Indicadores en `perfil-profesional.html`)

---

## 4. Solución Visible

### Encabezado — Saludo personalizado

| Elemento | Descripción |
|---|---|
| Saludo dinámico | "Buenos días, Dra. Valentina" / "Buenas tardes, Dr. Rodríguez" |
| Tratamiento | "Dra." para mujeres / "Dr." para hombres / sin tratamiento si género = No binario o No especificado |
| Subtítulo | Resumen del día: "Tienes 3 citas hoy y 2 salas activas" |

### Strip de 4 KPI Cards

| Card | Valor | Descripción | Color |
|---|---|---|---|
| **Citas hoy** | Número | Citas programadas para el día actual | Verde |
| **Salas activas** | Número | Salas con estado = Abierta | Azul |
| **Mensajes sin leer** | Número | Mensajes no leídos en la bandeja | Naranja |
| **Ingresos del mes** | `$XX.XXX.XXX COP` | Ingresos confirmados del mes calendario actual | Morado |

Cada card es **clickeable** y navega a la sección correspondiente.

### Sección "Tu próxima cita del día"

| Elemento | Descripción |
|---|---|
| Avatar del paciente | Foto del alias del paciente (sin nombre real hasta confirmar) |
| Alias del paciente | `@alias-del-paciente` |
| Tipo de cita | Psicológica / Asesoría puntual |
| Hora | Formato 12H (ej: `3PM`) |
| Sesión N° | "Sesión #4" (número de sesión con este paciente) |
| Botón **[Ingresar]** | Solo activo el día de la cita → `sala-profesional.html` |
| Botón **[Ver todas las citas]** | → `citas-profesional.html` |
| Mensaje si no hay citas hoy | "No tienes citas programadas para hoy." |

### Grid "Salas activas"

Muestra hasta 4 salas activas del profesional en formato grid 2×2:

| Campo | Descripción |
|---|---|
| Nombre de la sala | Título de la sala |
| Estado | Badge: "En vivo 🔴" o "Abierta" |
| Asistentes conectados | `X / Y` (conectados actualmente / cupo total) |
| Próximo evento | Fecha y hora del próximo evento de la sala |
| Botón **[Gestionar]** | → `sala-conferencia-profesional.html` |
| Botón **[Ver sala]** | → detalle de la sala en `mis-eventos.html` |

### Panel "Solicitudes pendientes"

Lista de citas que esperan confirmación del profesional:

| Elemento | Descripción |
|---|---|
| Alias del solicitante | `@alias-usuario` |
| Tipo de cita solicitada | Psicológica / Asesoría puntual |
| Fecha y hora propuesta | `DD MMM YYYY · H:MMAM/PM` |
| Botón **[Confirmar]** (inline) | Verde; confirma la cita inmediatamente |
| Botón **[Rechazar]** (inline) | Rojo outline; abre mini-modal para ingresar motivo |

### Mini-modal — Rechazar cita

| Elemento | Descripción |
|---|---|
| Título | "¿Por qué rechazas esta solicitud?" |
| Textarea | Campo obligatorio para ingresar el motivo del rechazo |
| Botón **[Confirmar rechazo]** | Envía el rechazo con el motivo |
| Botón **[Cancelar]** | Cierra el mini-modal sin acción |

### Botones de acceso rápido

| Botón | Destino |
|---|---|
| Mis eventos | `mis-eventos.html` |
| Mis citas | `citas-profesional.html` |
| Mensajes | `mensajes-profesional.html` |
| Mi perfil | `perfil-profesional.html` |

---

## 5. Acciones del Profesional

| Acción | Resultado |
|---|---|
| Clic en KPI "Citas hoy" | → `citas-profesional.html` filtrado por hoy |
| Clic en KPI "Salas activas" | → `mis-eventos.html` filtrado por Abiertas |
| Clic en KPI "Mensajes" | → `mensajes-profesional.html` |
| Clic en KPI "Ingresos del mes" | → Tab Indicadores en `perfil-profesional.html` |
| Clic **[Ingresar]** (próxima cita) | → `sala-profesional.html` (solo el día de la cita) |
| Clic **[Gestionar]** (sala activa) | → `sala-conferencia-profesional.html` |
| Clic **[Confirmar]** (solicitud) | Cita confirmada; se actualiza el contador de KPI "Citas hoy" |
| Clic **[Rechazar]** (solicitud) | Abre mini-modal para ingresar motivo |
| Confirmar rechazo | Solicitud rechazada; el paciente recibe notificación |

---

## 6. Restricciones

- El botón **[Ingresar]** en la próxima cita solo está activo **el día de la cita**.
- El panel de solicitudes muestra máximo **5 solicitudes pendientes**; el resto en `citas-profesional.html`.
- El grid de salas activas muestra máximo **4 salas**; el resto en `mis-eventos.html`.
- Los ingresos del mes son los **confirmados** (no los pendientes).

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Saludo con tratamiento | "Dra." si `Genero = Femenino`; "Dr." si `Genero = Masculino`; solo nombre si otro |
| Saludo dinámico | Mañana: 6h–12h · Tarde: 12h–18h · Noche: 18h–6h |
| KPI "Citas hoy" | `COUNT(Citas)` donde `ProfesionalId` y `DATE(FechaHora) = TODAY` y `Estado = Confirmada` |
| KPI "Ingresos mes" | SUM de pagos confirmados del mes calendario actual |
| Solicitudes pendientes | `Citas` donde `ProfesionalId` y `Estado = Pendiente` ordenadas por FechaHora ASC |
| Rechazo de cita | Requiere motivo; el motivo se envía al paciente por notificación |
| Formato fechas | `DD MMM YYYY` |
| Formato horas | 12H |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Dashboard lento con múltiples consultas | Caché por profesional con TTL corto (1–2 minutos) |
| Confirmación accidental de solicitud | La acción es directa (sin modal); el profesional puede cancelar desde la vista de citas |
| KPI ingresos incorrecto | Calcular solo pagos con Estado = Confirmado |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Nombre del profesional | `Profesionales.NombreCompleto`, `Profesionales.Genero` |
| KPI Citas hoy | `COUNT(Citas)` donde fecha = hoy y Estado = Confirmada |
| KPI Salas activas | `COUNT(Salas)` donde `ProfesionalId` y `Estado = Abierta` |
| KPI Mensajes | `COUNT(Mensajes)` donde `DestinatarioId = ProfesionalId` y `Leido = false` |
| KPI Ingresos mes | `SUM(Pagos.Monto)` donde profesional y mes actual y Estado = Confirmado |
| Próxima cita del día | `Citas` (ProfesionalId, DATE = TODAY, Estado = Confirmada, TOP 1 por Hora ASC) |
| Salas activas | `Salas` (ProfesionalId, Estado = Abierta, TOP 4) |
| Solicitudes pendientes | `Citas` (ProfesionalId, Estado = Pendiente, TOP 5 por FechaHora ASC) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Carga del dashboard | Menos de **2 segundos** |
| KPIs correctos | Los 4 valores coinciden con la BD |
| [Ingresar] condicional | Solo activo el día de la cita |
| Confirmar / Rechazar inline funcional | La acción se refleja inmediatamente en el panel |
| Grid de salas correcto | Solo salas del profesional autenticado |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

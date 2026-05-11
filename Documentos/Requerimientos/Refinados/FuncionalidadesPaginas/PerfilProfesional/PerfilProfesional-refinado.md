# Perfil del Profesional — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 3 — Herramientas del Profesional | **Apetito:** 1–2 semanas

---

## 1. Problema

El profesional necesita un espacio propio donde pueda actualizar su información personal y pública, gestionar su disponibilidad en el calendario, consultar sus citas y revisar sus salas y eventos, todo desde una sola vista organizada por tabs.

---

## 2. Apetito

**1 a 2 semanas.**
Vista de perfil con cuatro tabs: información personal, salas y eventos propios, calendario de disponibilidad, y citas (privadas y eventos próximos).

---

## 3. Límites

### ✅ Dentro del scope

- Tab 1: Formulario editable de información personal y profesional
- Tab 2: Salas y eventos creados con número de inscritos y detalle
- Tab 3: Calendario de disponibilidad con horarios bloqueados y ocupados
- Tab 4: Próximas citas privadas y eventos agendados
- Restricción de sesión única activa para el profesional

### ❌ Fuera del scope (No-Gos)

- Creación de nuevas salas (corresponde al módulo de gestión de salas)
- Historial clínico completo de pacientes (corresponde al módulo de historial clínico)
- Mensajería entre profesionales (corresponde al módulo de mensajería)
- Panel financiero / ingresos (corresponde al módulo financiero)

---

## 4. Solución Visible

### Tab 1 — Información Personal

| Campo | ¿Editable? |
|---|---|
| Nombre completo | No |
| Correo electrónico | No |
| Número de documento | No |
| Número de tarjeta profesional | No |
| País | Sí |
| Ciudad (vinculada al país) | Sí |
| Ocupación | Sí |
| Número de celular | Sí |
| Género | Sí |
| Fecha de nacimiento | Sí |
| Sobre mí | Sí |
| Cómo trabajo | Sí |
| Universidad de egreso | Sí |
| Año de egreso | Sí |
| Años de experiencia | Sí |
| Foto de perfil | Sí |
| Sesión activa | Solo visualización (no editable) |

> La ciudad se filtra dinámicamente según el país seleccionado.

**Sección de estudios** (Pregrado y Posgrado — múltiples entradas):

| Campo | Descripción |
|---|---|
| Nombre del título | — |
| Descripción | — |
| Universidad | — |
| Año de egreso | — |

### Tab 2 — Salas y Eventos

| Campo | Descripción |
|---|---|
| Tarjetas de salas creadas | Con nombre, estado (abierta/cerrada) y eventos asociados |
| Usuarios inscritos | Número de inscritos por sala |
| Botón "Ver detalle del evento" | Accede al detalle del evento específico |

### Tab 3 — Calendario

| Elemento | Descripción |
|---|---|
| Horarios disponibles | Espacios que los usuarios pueden agendar |
| Horarios bloqueados | Configurados por el profesional como no disponibles |
| Horarios ocupados | Citas ya agendadas por usuarios |

### Tab 4 — Citas

| Sección | Descripción |
|---|---|
| Próximas citas privadas | Con pacientes; incluye nombre, fecha `DD MMM YYYY`, hora 12H y tipo |
| Próximos eventos públicos | Salas o conferencias agendadas próximamente |

---

## 5. Acciones del Profesional

| Acción | Resultado |
|---|---|
| Editar campos permitidos y guardar | Modal de confirmación; datos actualizados en la base de datos |
| Cambiar foto de perfil | Selector de imagen; actualización inmediata |
| Seleccionar país | La lista de ciudades se actualiza dinámicamente |
| Agregar / Editar entrada de estudios | Formulario inline o modal para agregar título, universidad y año |
| Bloquear horario en el calendario | El horario queda marcado como no disponible para los usuarios |
| Ver detalle de un evento en Tab 2 | Navega al detalle del evento seleccionado |
| Consultar próximas citas en Tab 4 | Muestra el listado de citas y eventos próximos |

---

## 6. Restricciones

- Nombre, correo, número de documento y número de tarjeta profesional son **campos de solo lectura** en toda la plataforma.
- El profesional **no puede tener dos sesiones activas simultáneamente**; si intenta acceder desde otro dispositivo, se le informa en modal.
- La ciudad se muestra filtrada dinámicamente por el país seleccionado.
- Los listados en tabs usan **paginación de 10 registros** por página.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Campos inmutables | Nombre, correo, documento y tarjeta profesional no son editables |
| Sesión única | Solo se permite una sesión activa simultánea por profesional |
| Ciudad dinámica | Las ciudades disponibles dependen del país seleccionado |
| Confirmación de cambios | Toda actualización requiere confirmación en **modal** |
| Paginación | 10 registros por página en todos los tabs |
| Formato de fechas | `DD MMM YYYY` en todos los listados |
| Horas | Formato 12H en todos los listados |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Profesional con muchos estudios genera formulario largo | Implementar sección de estudios como lista editable independiente |
| Sesión duplicada no detectada a tiempo | Validar sesión activa en cada request autenticado del profesional |
| Listado de ciudades desactualizado | Mantener catálogo de países/ciudades actualizado en la base de datos |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Datos personales | `Profesionales.*` |
| Estudios | `ProfesionalesEstudios` (ProfesionalId, Titulo, Universidad, Año, Nivel) |
| País y Ciudad | `Paises`, `Ciudades` (PaisId FK) |
| Foto de perfil | `Profesionales.FotoPerfil` |
| Sesión activa | `Sesiones` (ProfesionalId, Estado = Activa) |
| Salas y eventos | `Salas` + `Eventos` (ProfesionalId) |
| Inscritos por sala | `Inscripciones` (COUNT por SalaId) |
| Horarios del calendario | `HorariosDisponibles` + `HorariosBlockeados` + `Citas` |
| Próximas citas | `Citas` (ProfesionalId, FechaHora >= Hoy) |
| Próximos eventos | `Eventos` (ProfesionalId, FechaInicio >= Hoy) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Campos editables actualizan correctamente | Los cambios se reflejan en la base de datos y en la vista sin recargar la página |
| Campos inmutables protegidos | No es posible editar nombre, correo, documento ni tarjeta desde la interfaz |
| Ciudad dinámica funcional | Al cambiar el país, la lista de ciudades se actualiza correctamente |
| Sesión única controlada | Se detecta y bloquea una segunda sesión activa con modal informativo |
| Tabs cargan sin errores | Cada tab muestra su contenido correctamente |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

# Perfil del Profesional — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 3 — Herramientas del Profesional | **Apetito:** 1–2 semanas

---

## 1. Problema

El profesional necesita un espacio propio donde pueda actualizar su información personal y pública, gestionar sus salas, consultar su calendario y citas, y revisar sus indicadores de negocio, todo organizado en 5 tabs desde una sola vista.

---

## 2. Apetito

**1 a 2 semanas.**
Vista de perfil con 5 tabs: Información personal · Salas · Calendario · Citas · Indicadores (KPIs).

---

## 3. Límites

### ✅ Dentro del scope

- **Tab 1 — Información personal:** formulario editable + avatar editable + datos registrales no editables + guardar → modal éxito
- **Tab 2 — Salas:** lista de salas propias con gestión (mismo contenido que `perfil-pro-salas.html`)
- **Tab 3 — Calendario:** grilla de disponibilidad (mismo contenido que `perfil-pro-calendario.html`)
- **Tab 4 — Citas** (badge con conteo): lista de citas con pacientes (mismo contenido que `perfil-pro-citas.html`)
- **Tab 5 — Indicadores:** KPIs de desempeño (mismo contenido que `perfil-pro-kpi.html`)

### ❌ Fuera del scope (No-Gos)

- Creación de nuevas salas desde Tab 2 (se hace desde `mis-eventos.html`)
- Historial clínico completo de pacientes
- Panel financiero avanzado
- Mensajería entre profesionales

---

## 4. Solución Visible

### Tab 1 — Información Personal

#### Header de perfil

| Elemento | Descripción |
|---|---|
| Avatar circular grande | Foto del profesional; botón de edición sobre la foto |
| Al clic en avatar | Abre selector de archivo (imagen); vista previa inmediata |
| Nombre completo | Mostrado debajo del avatar (no editable) |
| Badge verificado | Si tiene verificación COLPSIC |

#### Formulario — Campos editables

| Campo | Editable | Notas |
|---|---|---|
| País | Sí | Desplegable; al cambiar actualiza la lista de ciudades |
| Ciudad | Sí | Desplegable dinámico según país seleccionado |
| Ocupación / Especialidad | Sí | Texto libre o desplegable |
| Número de celular | Sí | Con código de país |
| Género | Sí | Desplegable: Masculino / Femenino / No binario / Prefiero no decir |
| Fecha de nacimiento | Sí | Selector de fecha |
| Años de experiencia | Sí | Número entero |
| Tarifa por hora | Sí | Número decimal en COP |
| Sobre mí | Sí | Textarea (bio pública) |
| Cómo trabajo | Sí | Textarea (metodología terapéutica) |

#### Sección — Formación académica (dinámica)

El profesional puede **agregar múltiples entradas** de formación:

| Campo por entrada | Descripción |
|---|---|
| Nivel | Pregrado / Especialización / Maestría / Doctorado / Diplomado |
| Nombre del título | Texto libre |
| Universidad | Texto libre |
| Año de egreso | Número de 4 dígitos |
| Botón **[+ Agregar título]** | Añade una nueva fila de formación |
| Botón **[✕]** por entrada | Elimina esa entrada (con confirmación inline) |

#### Datos registrales — No editables

| Campo | Por qué no editable |
|---|---|
| Nombre completo | Dato de identidad; solo cambia por proceso administrativo |
| Correo electrónico | Identificador de cuenta |
| Número de cédula | Documento de identidad |
| Número de tarjeta COLPSIC | Dato verificado |

#### Botón de guardado

| Elemento | Descripción |
|---|---|
| Botón **[Guardar cambios]** | CTA principal verde; spinner durante el proceso |
| **Modal de éxito** | "¡Perfil actualizado correctamente!" + botón [Aceptar] |

---

### Tab 2 — Salas (`perfil-pro-salas.html`)

Contenido idéntico a `Mis Eventos` pero en formato tab:

| Elemento | Descripción |
|---|---|
| Lista de salas propias | Tabla con nombre, estado, asistentes, tarifa, fecha |
| Botón **[Gestionar]** | → `sala-conferencia-profesional.html` |
| Botón **[Ver stats]** | Abre detalle de métricas de la sala |

---

### Tab 3 — Calendario (`perfil-pro-calendario.html`)

| Elemento | Descripción |
|---|---|
| Toolbar | Botones [Hoy] [‹] [›] + título semana actual |
| Grilla semanal | Lun–Dom × 8AM–9PM en bloques de 1 hora |
| Bloque disponible | Verde; al clic el profesional puede bloquearlo |
| Bloque bloqueado | Gris; al clic puede desbloquearlo |
| Bloque ocupado | Rosa/Morado; cita ya agendada por un paciente |
| Modal al clic en bloque disponible | Opciones: [Bloquear horario] o [Dejar disponible] |

---

### Tab 4 — Citas (`perfil-pro-citas.html`) — con badge

| Elemento | Descripción |
|---|---|
| Badge en tab | Número de citas pendientes de confirmar |
| Sección "Próximas citas" | Tabla: Alias paciente · Tipo · Fecha · Hora · Estado · [Ingresar] |
| Sección "Solicitudes pendientes" | Citas que esperan confirmación del profesional: [Confirmar] [Rechazar] inline |
| Botón **[Ingresar]** | Solo el día de la cita → `sala-profesional.html` |

---

### Tab 5 — Indicadores (`perfil-pro-kpi.html`)

#### Selector de período

| Opción | Descripción |
|---|---|
| **Todo** | Histórico completo |
| **Este año** | Año calendario actual |
| **Este mes** | Mes actual |

#### 6 KPI Cards

| KPI | Valor ejemplo | Tendencia |
|---|---|---|
| **Consultas totales** | 347 | ▲ 12% vs período anterior |
| **Clientes** | 98 | ▲ 8% |
| **Ingresos** | $31.2M COP | ▲ 21% |
| **Saldo por pagar** | $2.7M COP | Sin tendencia |
| **Salas creadas** | 28 | — |
| **Eventos realizados** | 14 | — |

#### Caja de saldo pendiente (amarilla)

| Elemento | Descripción |
|---|---|
| Fondo | Amarillo suave (advertencia) |
| Título | "Saldo pendiente de acreditación" |
| Monto | `$2.7M COP` |
| Fecha de acreditación estimada | `DD MMM YYYY` |
| Banco destino | Nombre del banco del profesional |

#### Gráfico de barras CSS (últimos 6 meses)

| Elemento | Descripción |
|---|---|
| Eje X | Últimos 6 meses (Ene, Feb, ... Jun) |
| Eje Y | Ingresos en COP |
| Barras | CSS puro; cada barra proporcional al ingreso del mes |

#### Tabla de detalle por indicador

| Columna | Descripción |
|---|---|
| Indicador | Nombre del KPI |
| Período anterior | Valor del período comparado |
| Período actual | Valor actual |
| Variación | Porcentaje ▲/▼ |

---

## 5. Acciones del Profesional

| Acción | Resultado |
|---|---|
| Editar campos en Tab 1 y clic [Guardar] | Modal de éxito; datos actualizados en BD |
| Cambiar foto de perfil | Selector de imagen; vista previa; al guardar se actualiza |
| Cambiar país en Tab 1 | La lista de ciudades se actualiza dinámicamente |
| Agregar entrada de formación | Nueva fila aparece en la sección formación |
| Eliminar entrada de formación | Confirmación inline; entrada eliminada |
| Clic en bloque de calendario (Tab 3) | Modal para bloquear / desbloquear horario |
| Clic [Confirmar] en cita pendiente (Tab 4) | Cita cambia a Confirmada; badge se actualiza |
| Clic [Rechazar] en cita pendiente (Tab 4) | Modal para ingresar motivo; cita Rechazada |
| Cambiar período en Tab 5 | Todos los KPIs y el gráfico se actualizan |

---

## 6. Restricciones

- Nombre, correo, cédula y tarjeta COLPSIC son **inmutables** desde esta vista.
- La ciudad se filtra dinámicamente según el país seleccionado.
- El profesional **no puede tener dos sesiones simultáneas**; si lo intenta, modal informativo.
- Paginación de **10 registros** en tablas de tabs 2 y 4.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Campos inmutables | Nombre, correo, cédula, tarjeta COLPSIC — no editables |
| Ciudad dinámica | Ciudades disponibles dependen del país seleccionado |
| Confirmación de cambios | Tab 1: toda actualización requiere modal de éxito |
| Sesión única | Solo una sesión activa simultánea por profesional |
| Paginación | 10 registros por página en tabs con tablas |
| Formato fechas | `DD MMM YYYY` |
| Formato horas | Formato 12H |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Formulario largo en Tab 1 | Sección de formación como lista independiente colapsable |
| Sesión duplicada no detectada | Validar sesión activa en cada request autenticado |
| Ciudad desactualizada | Catálogo países/ciudades mantenido en BD con actualizaciones periódicas |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Datos personales | `Profesionales.*` |
| Formación | `ProfesionalesEstudios` (ProfesionalId, Nivel, Titulo, Universidad, AñoEgreso) |
| País y Ciudad | `Paises`, `Ciudades` (PaisId FK) |
| Foto de perfil | `Profesionales.FotoPerfil` |
| Salas propias | `Salas` (ProfesionalId) + `Eventos` |
| Horarios calendario | `HorariosDisponibles` + `HorariosBlockeados` + `Citas` |
| Próximas citas | `Citas` (ProfesionalId, Estado = Confirmada, FechaHora >= Hoy) |
| Citas pendientes | `Citas` (ProfesionalId, Estado = Pendiente) |
| KPIs | Consultas, Ingresos, Saldo por período del profesional |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Formulario Tab 1 actualiza correctamente | Cambios en BD; modal de éxito visible |
| Campos inmutables protegidos | No editables desde la interfaz |
| Ciudad dinámica funcional | Al cambiar país, ciudades se actualizan |
| Tabs 2–5 cargan sin errores | Cada tab muestra su contenido correcto |
| KPIs correctos en Tab 5 | Los 6 KPIs reflejan datos reales de la BD |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

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

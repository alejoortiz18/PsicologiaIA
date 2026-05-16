# Vista de Citas del Usuario — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1 semana

---

## 1. Problema

El usuario necesita una vista centralizada donde pueda consultar todas sus citas privadas (próximas e historial), filtrarlas por estado o tipo, ingresar directamente a la videollamada del día y cancelar las que no pueda atender.

---

## 2. Apetito

**1 semana.**
Vista de gestión de citas con strip de estadísticas, filtros, listado en tabs (Próximas / Historial) y acciones contextuales por cita.

---

## 3. Límites

### ✅ Dentro del scope

- Strip de estadísticas: Próximas · Esta semana · Completadas · Canceladas
- Barra de filtros: búsqueda por profesional, filtro por estado, filtro por tipo
- Tabs de contenido: **Próximas** | **Historial**
- Tabla: columnas Profesional · Tipo · Fecha · Hora · Estado · Acciones
- CTA principal **"+ Agendar cita"** (botón verde)
- Acción **"Ingresar"** (solo el día de la cita) → `sala-usuario.html`
- Acción **"Cancelar"** con modal de confirmación
- Paginación de 10 registros por página

### ❌ Fuera del scope (No-Gos)

- Flujo de agendamiento (corresponde al calendario del profesional en `perfil-orador`)
- Sala de videollamada (corresponde al módulo `SalaUsuario`)
- Historial clínico ni notas del profesional
- Proceso de pago de cita (corresponde a `PagoCita`)

---

## 4. Solución Visible

### Strip de estadísticas (4 tarjetas)

| Tarjeta | Valor | Color |
|---|---|---|
| Próximas | Total de citas programadas futuras | Verde |
| Esta semana | Citas programadas en los próximos 7 días | Azul |
| Completadas | Total de citas finalizadas exitosamente | Gris-oscuro |
| Canceladas | Total de citas canceladas | Rojo |

### Barra de filtros

| Filtro | Tipo | Opciones |
|---|---|---|
| Búsqueda | Campo de texto | Buscar por nombre del profesional |
| Estado | Desplegable | Todos / Programada / Completada / Cancelada / Movida |
| Tipo | Desplegable | Todos / Psicológica / Asesoría puntual |

### Botón CTA principal

| Elemento | Posición | Destino |
|---|---|---|
| **"+ Agendar cita"** | Esquina superior derecha | Navega al perfil del orador para agendar desde el calendario |

### Tabs de contenido

| Tab | Condición de las citas mostradas |
|---|---|
| **Próximas** | `Estado = Programada` y `FechaHora >= Hoy` |
| **Historial** | `FechaHora < Hoy` o `Estado` en {Completada, Cancelada, Movida} |

### Tabla de citas

| Columna | Descripción |
|---|---|
| **Profesional** | Avatar circular + nombre completo del profesional |
| **Tipo** | Psicológica / Asesoría puntual |
| **Fecha** | Formato `DD MMM YYYY` (ej: `12 Jun 2026`) |
| **Hora** | Formato 12H (ej: `3PM`, `3:30PM`) |
| **Estado** | Badge de color: Programada (verde) / Completada (azul) / Cancelada (rojo) / Movida (amarillo) |
| **Acciones** | Botones condicionales según estado y fecha |

### Acciones por fila

| Condición | Botón | Color | Resultado |
|---|---|---|---|
| Cita hoy (`fecha == hoy`) + Estado Programada | **"Ingresar"** | Verde sólido | Navega a `sala-usuario.html` |
| Cita futura + Estado Programada | **"Cancelar"** | Rojo outline | Abre modal de confirmación |
| Cita completada / cancelada / movida | — | — | Solo lectura, sin acciones |

### Modal de confirmación de cancelación

| Elemento | Descripción |
|---|---|
| Título | "¿Cancelar esta cita?" |
| Cuerpo | Nombre del profesional + fecha + hora de la cita |
| Botón **"Confirmar cancelación"** | Cancela la cita → actualiza strip + tabla |
| Botón **"Volver"** | Cierra el modal sin cambios |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Clic en "+ Agendar cita" | Navega al perfil del orador elegido para agendar desde su calendario |
| Escribir en búsqueda | Filtra la tabla por nombre del profesional en tiempo real |
| Seleccionar estado en filtro | La tabla muestra solo citas con ese estado |
| Seleccionar tipo en filtro | La tabla muestra solo citas del tipo seleccionado |
| Cambiar de tab (Próximas / Historial) | Alterna la tabla entre citas futuras e históricas |
| Clic en "Ingresar" | Navega a `sala-usuario.html` (solo disponible el día de la cita) |
| Clic en "Cancelar" | Abre modal de confirmación |
| Confirmar cancelación en modal | La cita cambia a Cancelada; strip y tabla se actualizan |
| Navegar páginas | Paginación de 10 registros por página |

---

## 6. Restricciones

- El botón **"Ingresar"** solo aparece el **día de la cita** (validado con la fecha del servidor).
- Solo se pueden cancelar citas con estado **Programada**.
- Las citas completadas, canceladas o movidas son de **solo lectura**.
- Paginación de **10 registros por página** en ambos tabs.
- Los filtros se combinan (AND lógico entre búsqueda + estado + tipo).

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Disponibilidad de "Ingresar" | `fecha_servidor == fecha_cita` y `estado == Programada` |
| Cancelación | Solo citas con `Estado = Programada` |
| Strip estadísticas | Calculado en tiempo real al cargar y tras cada acción |
| Tab Próximas | `FechaHora >= Hoy` y `Estado = Programada` |
| Tab Historial | `FechaHora < Hoy` OR `Estado` ∈ {Completada, Cancelada, Movida} |
| Formato de fechas | `DD MMM YYYY` |
| Formato de horas | 12H (ej: `3PM`, `3:30PM`) |
| Paginación | 10 registros por página |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Botón "Ingresar" fuera del horario real | Validar con fecha del servidor; no confiar en el cliente |
| Cancelación accidental | Modal de confirmación obligatorio |
| Historial muy extenso | Paginación + filtros combinables |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Citas del usuario | `Citas` (CitaId, UsuarioId, ProfesionalId, FechaHora, Estado, Tipo) |
| Datos del profesional | `Profesionales.NombreCompleto`, `Profesionales.FotoPerfil` |
| Strip — contadores | COUNT agrupado por Estado / período sobre `Citas` del usuario |
| Fecha actual del servidor | `DateTime.Now` (servidor) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Strip correcto | Los 4 contadores reflejan datos reales de la BD |
| Filtros funcionales | Los resultados coinciden con los filtros aplicados |
| Botón "Ingresar" condicional | Solo aparece el día de la cita; no antes ni después |
| Cancelación exitosa | Estado cambia a Cancelada; strip y tabla se actualizan inmediatamente |
| Paginación correcta | Máximo 10 registros por página |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

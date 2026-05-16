# Calendario del Usuario — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1–2 semanas

---

## 1. Problema

El usuario necesita una vista de calendario visual que le permita ver de un vistazo todas sus citas privadas y eventos de conferencia programados, diferenciarlos por color, navegar entre semanas/meses/días y acceder a los detalles de cada evento.

---

## 2. Apetito

**1 a 2 semanas.**
Calendario con toolbar de navegación [Hoy][‹][›], pills de vistas [Semana|Mes|Día], leyenda de colores (cita privada / sala/conferencia / no disponible), grilla semanal de 8AM a 9PM con bloques posicionados absolutamente y modal de detalle al hacer clic.

---

## 3. Límites

### ✅ Dentro del scope

- Toolbar: botón [Hoy], flechas [‹][›] para navegar, título del período actual
- Pills de vista: **Semana** · **Mes** · **Día**
- Leyenda de colores: cita privada (rosa) · sala/conferencia (verde) · no disponible (gris)
- Grilla horaria semanal: filas = horas (8AM–9PM); columnas = días de la semana
- Bloques de evento posicionados absolutamente según hora/duración
- Modal de detalle al hacer clic en un bloque

### ❌ Fuera del scope (No-Gos)

- Crear o editar eventos desde el calendario (se hace desde sus respectivos módulos)
- Exportar a Google Calendar / iCal (versión posterior)
- Arrastrar y redimensionar bloques

---

## 4. Solución Visible

### Toolbar de navegación

| Elemento | Descripción |
|---|---|
| Botón **[Hoy]** | Navega a la semana/mes/día actual inmediatamente |
| Flecha **[‹]** | Ir al período anterior (semana / mes / día) |
| Flecha **[›]** | Ir al período siguiente |
| Título del período | "14–20 Ago 2026" (semana) / "Agosto 2026" (mes) / "Lunes 14 Ago" (día) |

### Pills de vista

| Vista | Descripción |
|---|---|
| **Semana** (default) | Grilla 7 columnas × filas de hora; 8AM–9PM |
| **Mes** | Grilla mes estándar con puntos de color en cada día con eventos |
| **Día** | Una sola columna, grilla completa del día 8AM–9PM |

### Leyenda de colores

| Tipo | Color | Descripción |
|---|---|---|
| Cita privada | Rosa / Rosado | Sesión uno a uno con un profesional |
| Sala / Conferencia | Verde | Evento de conferencia grupal |
| No disponible | Gris | Bloques bloqueados (descanso, otro compromiso) |

### Vista Semana — Grilla horaria

| Elemento | Descripción |
|---|---|
| Columnas | 7 días de la semana; encabezado: "Lun 14", "Mar 15", etc. |
| Filas | Horas: 8AM, 8:30AM, 9AM ... hasta 9PM; intervalos de 30 min |
| Línea de hora actual | Línea roja horizontal que indica la hora actual del día |
| Bloque de evento | Posicionado absolutamente; color según tipo; texto: nombre del evento / nombre del profesional |
| Bloque con colisión | Si hay dos eventos a la misma hora, se muestran lado a lado (reduciendo el ancho) |

### Modal de detalle del evento

Al hacer clic en un bloque:

**Cita privada:**

| Elemento | Descripción |
|---|---|
| Título | Nombre del profesional |
| Tipo | "Cita psicológica" / "Asesoría puntual" |
| Fecha y hora | `DD MMM YYYY · H:MMAM/PM` |
| Duración | "60 minutos" |
| Estado | Badge: Confirmada / Pendiente |
| Botón **[Ingresar]** | Solo activo el día de la cita → `sala-profesional.html` |
| Botón **[Ver detalle]** | → `citas-usuario.html` filtrado por esta cita |

**Sala / Conferencia:**

| Elemento | Descripción |
|---|---|
| Título | Nombre de la sala |
| Ponente | "Por Dra. Valentina García" |
| Fecha y hora | `DD MMM YYYY · H:MMAM/PM` |
| Cupos restantes | "X / Y cupos" |
| Botón **[Ingresar]** | Solo activo el día del evento → `sala-conferencia-usuario.html` |
| Botón **[Ver detalle]** | → detalle de la sala |

### Vista Mes

| Elemento | Descripción |
|---|---|
| Grilla mensual | 4–6 filas de 7 días |
| Puntos de color | Cada día con eventos muestra puntos de color según tipo |
| Número de eventos | "3 eventos" si hay más de los que caben visualmente |
| Clic en día | Cambia a la vista Día de ese día |

### Vista Día

| Elemento | Descripción |
|---|---|
| Columna única | Grilla de un solo día; 8AM–9PM |
| Mismo sistema de bloques | Igual a la vista Semana pero para un día |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Clic [Hoy] | Navega al período actual en la vista seleccionada |
| Clic [‹] / [›] | Navega al período anterior / siguiente |
| Clic en pill **Semana** | Cambia a vista semanal |
| Clic en pill **Mes** | Cambia a vista mensual |
| Clic en pill **Día** | Cambia a vista de día |
| Clic en un día (vista Mes) | Cambia a vista Día de ese día |
| Clic en un bloque de evento | Abre modal de detalle del evento |
| Clic [Ingresar] (en modal) | → sala correspondiente (solo el día del evento) |
| Clic [Ver detalle] (en modal) | → módulo correspondiente (citas o sala) |

---

## 6. Restricciones

- El calendario es de **solo lectura**; no permite crear ni editar eventos.
- El botón **[Ingresar]** solo está activo el **día del evento**.
- El rango visible es de **8AM a 9PM**; eventos fuera de este rango se muestran en los extremos.
- La vista por defecto es **Semana**.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Eventos mostrados | Citas donde `UsuarioId` + salas donde tiene inscripción activa |
| Color cita privada | Rosa para `Tipo = Psicológica` o `Tipo = Asesoría puntual` |
| Color sala/conferencia | Verde para registros de `InscripcionesSalas` |
| Línea de hora actual | Solo visible en la vista del día actual |
| Eventos colisionados | Se muestran lado a lado (ancho compartido) |
| Formato fechas | `DD MMM YYYY` |
| Formato horas | 12H |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Muchos eventos en un día | Colapsar en "X más" con clic para expandir |
| Vista Mes lenta | Cargar solo los datos del mes visible; lazy load |
| Eventos solapados difíciles de leer | Mostrar lado a lado con ancho reducido |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Citas del usuario | `Citas` (UsuarioId, FechaHora, Tipo, Estado, ProfesionalId) |
| Salas inscritas | `InscripcionesSalas` (UsuarioId) JOIN `Salas` (Titulo, FechaHora, ProfesionalId) |
| Nombre del profesional | `Profesionales.NombreCompleto` |
| Estado de cita/sala | Para mostrar badge y habilitar el botón [Ingresar] |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Citas y salas visibles | Todos los eventos del usuario aparecen en el calendario |
| Leyenda de colores correcta | Rosa para citas; verde para salas |
| Navegación fluida | Cambio de semana/mes/día sin recargar la página |
| Modal de detalle correcto | Muestra los datos del evento al hacer clic |
| [Ingresar] condicional | Solo activo el día del evento |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

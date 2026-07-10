# Detalle de Sala (Modal) — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 3–5 días

---

## 1. Problema

El usuario que navega el tab **Salas** del perfil público de un orador (`orador-salas.html`) necesita ver el detalle completo de una sala antes de decidir inscribirse. La tarjeta de sala muestra información resumida; el detalle se presenta en un **modal** sin abandonar la vista.

---

## 2. Apetito

**3 a 5 días.**
Modal de detalle de sala disparado desde el botón **[Detalle]** en la tarjeta de sala. Contiene información completa, últimos 4 comentarios y CTA de inscripción.

---

## 3. Límites

### ✅ Dentro del scope

- Modal que se abre al hacer clic en **[Detalle]** en una card de sala dentro de `orador-salas.html`
- Sección: título y descripción completa de la sala
- Sección: fecha, hora, cupos actuales / cupo máximo, precio
- Sección: últimos **4 comentarios** de la sala con alias del autor y fecha
- Botón **[Ingresar]** (para usuarios ya inscritos) → `sala-conferencia-usuario.html`
- Botón **[Registrarse]** (para usuarios no inscritos) → `inscripcion-pago.html`
- Cierre del modal con X o clic fuera del área

### ❌ Fuera del scope (No-Gos)

- Proceso de pago dentro del modal (corresponde a `InscripcionPago`)
- Lista completa de inscritos (información privada)
- Más de 4 comentarios dentro del modal (para ver más se redirige a tab Comentarios)
- Edición de información de la sala desde el modal

---

## 4. Solución Visible

### Estructura del modal

| Sección | Contenido |
|---|---|
| **Header del modal** | Título de la sala + botón X para cerrar |
| **Info de la sala** | Nombre, descripción completa, categoría |
| **Detalles del evento** | Fecha (`DD MMM YYYY`) · Hora inicio y fin (12H) · Duración estimada |
| **Cupos y precio** | `X asistentes de Y cupos` · Precio o "Entrada libre" |
| **Últimos 4 comentarios** | Alias del autor + texto del comentario + fecha `DD MMM YYYY` |
| **Acciones** | Botón condicional según estado de inscripción del usuario |

### Botones condicionales

| Condición | Botón | Destino |
|---|---|---|
| Usuario ya inscrito en la sala | **[Ingresar]** (verde sólido) | `sala-conferencia-usuario.html` |
| Usuario no inscrito, cupos disponibles | **[Registrarse]** (verde outline) | `inscripcion-pago.html` |
| Sin cupos disponibles | **[Sin cupos]** (deshabilitado, gris) | Sin acción |
| Sala cerrada | **[Sala cerrada]** (deshabilitado, gris) | Sin acción |

### Sección de comentarios dentro del modal

| Elemento | Descripción |
|---|---|
| Máximo 4 comentarios | Los 4 más recientes ordenados por fecha descendente |
| Cada comentario muestra | Alias del autor + texto + fecha `DD MMM YYYY` |
| Enlace **"Ver todos los comentarios"** | Cierra el modal y activa el tab **Comentarios** en `orador-salas.html` |

### Convenciones visuales

| Elemento | Estándar |
|---|---|
| Fechas | `DD MMM YYYY` → ej: `8 Oct 2026` |
| Horas | Formato 12H → ej: `3PM`, `3:30PM` |
| Precio | `$XX.000 COP` o `Entrada libre` si el precio es 0 |
| Cupos | `X asistentes de Y cupos` |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Clic en **[Detalle]** en una card de sala | El modal se abre con la información completa de la sala |
| Clic en **[Ingresar]** | Navega a `sala-conferencia-usuario.html` |
| Clic en **[Registrarse]** | Navega a `inscripcion-pago.html` con los datos de la sala precargados |
| Clic en "Ver todos los comentarios" | Cierra modal y activa tab Comentarios en el perfil del orador |
| Clic en X o fuera del modal | Cierra el modal; el usuario permanece en el tab Salas |

---

## 6. Restricciones

- El modal es de **solo lectura**; no permite edición de ningún dato.
- Sin cupos: botón deshabilitado con texto "Sin cupos".
- El modal no procesa pagos; solo redirige al flujo correspondiente.
- Los comentarios dentro del modal son de **solo lectura** (sin formulario de respuesta).

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Cupos en tiempo real | Se recalculan al abrir el modal: `CupoMaximo - COUNT(Inscripciones confirmadas)` |
| Sin cupos | Botón "Registrarse" se reemplaza por "Sin cupos" deshabilitado |
| Precio | `Precio = 0` o nulo → "Entrada libre"; `Precio > 0` → monto formateado |
| Comentarios | Se muestran los 4 más recientes por `FechaComentario DESC` |
| Usuario ya inscrito | Botón cambia de "Registrarse" a "Ingresar" |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Cupos agotados entre visualización y clic en Registrarse | Validar nuevamente cupos en `inscripcion-pago` antes de procesar |
| Modal lento con muchos datos | Carga diferida de comentarios; datos de sala y cupos primero |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Nombre y descripción | `Salas.Nombre`, `Salas.Descripcion`, `Salas.Categoria` |
| Precio | `Salas.Precio` |
| Cupo máximo | `Salas.CupoMaximo` |
| Asistentes inscritos | `COUNT(Inscripciones)` donde `SalaId` = sala y `Estado = Confirmada` |
| Fecha y hora del evento | `Eventos.FechaInicio`, `Eventos.FechaFin` |
| Estado de inscripción del usuario | `Inscripciones` (UsuarioId + SalaId) |
| Últimos 4 comentarios | `ComentariosSala` (SalaId, ORDER BY Fecha DESC, TOP 4) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Modal abre en < 1 segundo | Tiempo de respuesta al hacer clic en [Detalle] |
| Cupos en tiempo real | Refleja el estado real al momento de abrir |
| Botón condicional correcto | "Ingresar" / "Registrarse" / "Sin cupos" según corresponda |
| Comentarios visibles | Se muestran máximo 4 comentarios recientes |
| Redirecciones funcionales | Ingresar y Registrarse navegan a la vista correcta |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

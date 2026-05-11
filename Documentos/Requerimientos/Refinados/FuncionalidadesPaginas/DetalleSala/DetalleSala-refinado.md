# Detalle de Sala — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 3–5 días

---

## 1. Problema

El usuario necesita acceder a la información completa de una sala antes de decidir inscribirse. La tarjeta en el Home muestra información resumida; el detalle completo debe ser accesible sin abandonar la vista actual.

---

## 2. Apetito

**3 a 5 días.**
Modal con información completa de la sala, datos del evento y del profesional, con acciones de inscripción y navegación al perfil del orador.

---

## 3. Límites

### ✅ Dentro del scope

- Modal que se abre al hacer clic en "Ver más" en la tarjeta de sala
- Información completa de la sala y el evento
- Información resumida del profesional (orador)
- Cupos disponibles y usuarios inscritos
- Botón "Registrarse" (inicia el flujo de inscripción)
- Botón "Ver información del orador" (navega al perfil del profesional)
- Cierre del modal (X o clic fuera)

### ❌ Fuera del scope (No-Gos)

- Proceso de pago dentro del modal (corresponde al módulo `InscripcionPago`)
- Lista de usuarios inscritos (información privada)
- Chat o mensajería desde el modal

---

## 4. Solución Visible

### Contenido del modal

| Sección | Campos |
|---|---|
| **Información de la sala** | Nombre, descripción, categoría, tipo (pública/privada), precio o "Entrada libre" |
| **Información del evento** | Fecha de inicio (`DD MMM YYYY`), hora de inicio y fin (formato 12H), duración |
| **Información del orador** | Nombre o alias, foto de perfil, especialidad, breve descripción |
| **Cupos** | Usuarios inscritos / Cupo máximo, cupos disponibles |
| **Acciones** | Botón "Registrarse", Botón "Ver información del orador" |

### Convenciones visuales

| Elemento | Estándar |
|---|---|
| Fechas | `DD MMM YYYY` → ej: `8 Oct 2026` |
| Horas | Formato 12H → ej: `3PM`, `3:30PM` |
| Precio | Monto en moneda configurada o "Entrada libre" si es gratuito |
| Cupos | `X inscritos de Y cupos` |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Abrir el modal desde "Ver más" | El modal se despliega con la información completa de la sala |
| Hacer clic en "Registrarse" | Cierra el modal e inicia el flujo de inscripción y pago |
| Hacer clic en "Ver información del orador" | Navega al perfil público del profesional |
| Cerrar el modal (X o clic fuera) | El modal se cierra; el usuario regresa al Home sin perder su posición |

---

## 6. Restricciones

- El modal no realiza el proceso de inscripción; solo inicia la redirección al flujo correspondiente.
- Si la sala está **llena** (sin cupos), el botón "Registrarse" se muestra deshabilitado o con mensaje de "Sin cupos disponibles".
- El modal es de **solo lectura**; no permite edición de información.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Cupos en tiempo real | Los cupos disponibles se recalculan en el momento de abrir el modal |
| Sin cupos | El botón "Registrarse" se deshabilita; se muestra "Sin cupos disponibles" |
| Precio | 0 o nulo = "Entrada libre"; mayor a 0 = monto formateado |
| Orador | Se muestra el alias si el profesional optó por mostrarlo; de lo contrario, el nombre completo |

---

## 8. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Nombre y descripción de la sala | `Salas.Nombre`, `Salas.Descripcion` |
| Categoría y tipo | `Salas.Categoria`, `Salas.Tipo` |
| Precio | `Salas.Precio` |
| Fecha y hora del evento | `Eventos.FechaInicio`, `Eventos.FechaFin` |
| Cupo máximo e inscritos | `Salas.CupoMaximo`, COUNT(`Inscripciones`.EventoId) |
| Datos del orador | `Profesionales.Alias`, `Profesionales.FotoPerfil`, `Profesionales.Especialidad`, `Profesionales.Descripcion` |

---

## 9. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Modal abre correctamente | El modal se despliega en menos de **1 segundo** |
| Cupos actualizados | Los cupos reflejan el estado real de la base de datos al momento de abrir |
| Sin cupos muestra estado correcto | El botón "Registrarse" aparece deshabilitado cuando no hay cupos |
| Botones funcionales | "Registrarse" y "Ver información del orador" redirigen correctamente |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

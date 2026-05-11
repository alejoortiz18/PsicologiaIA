# Home — Vista Principal del Usuario — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1–2 semanas

---

## 1. Problema

El usuario autenticado necesita una vista central que le muestre de un vistazo sus actividades más relevantes (eventos inscritos, próximas citas, sala más próxima) y le permita descubrir y explorar salas disponibles de forma eficiente.

---

## 2. Apetito

**1 a 2 semanas.**
Dashboard del usuario con resumen de actividades, galería de salas activas con filtros y búsqueda, tarjetas de sala con acciones disponibles.

---

## 3. Límites

### ✅ Dentro del scope

- Resumen de actividad del usuario (eventos registrados, próximas citas, sala más próxima)
- Galería de tarjetas de salas activas con eventos vigentes
- Filtros: por categoría de sala, por fecha de inicio
- Búsqueda: por nombre de usuario o nombre de sala
- Sección de salas destacadas (más solicitadas)
- Sección de salas que comienzan hoy
- Tarjeta de sala con información completa y acciones disponibles
- Paginación de 10 registros por página en listados

### ❌ Fuera del scope (No-Gos)

- Modal de detalle de sala (corresponde al módulo `DetalleSala`)
- Proceso de inscripción y pago (corresponde al módulo `InscripcionPago`)
- Envío de mensajes al profesional (corresponde al módulo de mensajería)
- Dashboard del Profesional (es una vista independiente)

---

## 4. Solución Visible

### Sección superior — Resumen de actividad

| Elemento | Descripción |
|---|---|
| Mis eventos registrados | Cantidad y acceso rápido a los eventos en los que el usuario está inscrito |
| Próximas citas | Citas privadas agendadas próximamente |
| Sala más próxima | Fecha y hora de la sala más cercana en la que está inscrito (`8 Oct 2026 3PM`) |

### Sección de filtros y búsqueda

| Elemento | Descripción |
|---|---|
| Filtro por categoría de sala | Lista desplegable con las categorías disponibles |
| Búsqueda por nombre | Campo de texto para buscar por nombre de sala o nombre de profesional |
| Búsqueda por fecha de inicio | Selector de fecha en formato `DD MMM YYYY` |

### Secciones especiales

| Sección | Descripción |
|---|---|
| Salas destacadas | Las salas con mayor número de inscritos activos |
| Salas que comienzan hoy | Salas cuyo evento inicia en la fecha actual |

### Tarjeta de sala

| Campo | Descripción |
|---|---|
| Nombre de la sala | Título principal de la sala |
| Fecha y hora de inicio y fin | Formato `8 Oct 2026 3PM` |
| Usuarios registrados | Número actual de inscritos |
| Cupo máximo | Capacidad total de la sala |
| Precio | Monto de inscripción o "Entrada libre" si es gratuita |
| Nombre del orador | Profesional que dirige la sala |
| Me gusta | Contador de reacciones de la sala |
| Botón "Ver más" | Abre modal con el detalle completo de la sala |
| Botón "Registrarse" | Inicia el proceso de inscripción al evento |
| Botón "Enviar mensaje" | Abre el flujo de mensaje privado al profesional |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Aplicar filtro por categoría | La galería muestra solo las salas de esa categoría |
| Buscar por nombre | La galería filtra salas y profesionales que coincidan |
| Buscar por fecha | La galería muestra salas con inicio en la fecha seleccionada |
| Hacer clic en "Ver más" | Abre el modal de detalle de la sala |
| Hacer clic en "Registrarse" | Inicia el flujo de inscripción y pago |
| Hacer clic en "Enviar mensaje" | Inicia el flujo de mensaje al profesional |
| Navegar entre páginas | Paginación de 10 salas por página |

---

## 6. Restricciones

- Solo se muestran salas con eventos **abiertos y vigentes** en el momento de la consulta.
- Las salas sin eventos activos **no aparecen** en el listado.
- El usuario solo ve salas a las que puede inscribirse (cupos disponibles o en lista de espera, según se defina).
- La paginación de listados es de **10 registros por página**.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Visibilidad de salas | Solo salas con eventos abiertos y vigentes son mostradas |
| Sala más próxima | Se calcula entre todas las salas inscritas del usuario; se muestra la de fecha más cercana |
| Salas destacadas | Se ordenan por número de inscritos (descendente); se muestran las primeras |
| Salas de hoy | Se filtran por fecha de inicio igual a la fecha actual del servidor |
| Paginación | 10 registros por página en todos los listados |
| Fecha de inicio | Se muestra en formato `DD MMM YYYY H[MM]AM/PM` |
| Precio | Si el evento es gratuito se muestra "Entrada libre"; si es de pago, el monto en la moneda configurada |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Muchas salas activas generan carga lenta | Aplicar paginación y caché de listados con tiempo de expiración corto |
| Sala más próxima incorrecta si el usuario no tiene inscripciones | Mostrar un mensaje alternativo: "No tienes salas próximas" |
| Filtros combinados pueden no retornar resultados | Mostrar mensaje vacío claro: "No se encontraron salas con los filtros aplicados" |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Eventos inscritos del usuario | `Inscripciones` (UsuarioId, EventoId, Estado = Confirmado) |
| Próximas citas | `Citas` (UsuarioId, FechaHora, Estado = Programada) |
| Sala más próxima | `Salas` + `Inscripciones` (FechaInicio más cercana, UsuarioId) |
| Salas activas con eventos vigentes | `Salas` + `Eventos` (Estado = Abierto, FechaFin >= Hoy) |
| Categoría de sala | `Salas.Categoria` |
| Información del orador | `Profesionales.Alias`, `Profesionales.NombreCompleto` |
| Número de inscritos | `Inscripciones` (COUNT por EventoId) |
| Cupo máximo | `Salas.CupoMaximo` |
| Precio | `Salas.Precio` (0 = gratuito) |
| Reacciones (me gusta) | `MeGusta` (COUNT por SalaId) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Carga del Dashboard | Menos de **2 segundos** |
| Resumen de actividad correcto | Los datos de eventos, citas y sala más próxima coinciden con la base de datos |
| Filtros funcionales | Los filtros de categoría, nombre y fecha retornan resultados correctos |
| Paginación correcta | Cada página muestra máximo 10 salas |
| Sala más próxima calculada | Se muestra la fecha más cercana de las salas inscritas |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

# Mis Eventos — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 3 — Herramientas del Profesional | **Apetito:** 1 semana

---

## 1. Problema

El profesional necesita una vista centralizada donde pueda ver y gestionar únicamente las salas y eventos que él mismo ha creado, sin mezclar contenido de otros profesionales.

---

## 2. Apetito

**1 semana.**
Vista con galería de salas propias, estado de cada sala, número de inscritos y acceso al detalle de cada evento.

---

## 3. Límites

### ✅ Dentro del scope

- Listado de salas creadas por el profesional autenticado
- Estado de cada sala: abierta o cerrada
- Número de usuarios inscritos en cada sala/evento
- Acceso al detalle de cada sala y sus eventos
- Acción para habilitar / deshabilitar una sala

### ❌ Fuera del scope (No-Gos)

- Creación de nuevas salas (corresponde al módulo de gestión de salas)
- Gestión de pagos de la sala (corresponde al módulo financiero)
- Chat o mensajería dentro de la sala (corresponde al módulo de conferencias)
- Historial clínico de pacientes (corresponde al módulo de historial clínico)

---

## 4. Solución Visible

### Listado de salas propias

| Campo | Descripción |
|---|---|
| Nombre de la sala | Título de la sala creada |
| Estado | Abierta / Cerrada |
| Usuarios inscritos | Número total de inscritos en la sala |
| Cupo máximo | Capacidad total configurada |
| Precio | Monto o "Entrada libre" |
| Eventos asociados | Número de eventos dentro de la sala |
| Botón "Ver detalle" | Navega al detalle de la sala y sus eventos |
| Botón "Habilitar / Deshabilitar" | Cambia el estado de la sala con confirmación en **modal** |

### Convenciones visuales

| Elemento | Estándar |
|---|---|
| Paginación | **10 registros** por página |
| Mensajes del sistema | Siempre mediante **modal** |
| Estado visual | Color diferenciado: verde = Abierta, gris = Cerrada |

---

## 5. Acciones del Profesional

| Acción | Resultado |
|---|---|
| Ver el listado | Se muestran solo las salas del profesional autenticado |
| Hacer clic en "Ver detalle" | Navega al detalle de la sala con sus eventos e inscritos |
| Hacer clic en "Habilitar" | Modal de confirmación; al confirmar, la sala cambia a estado Abierta |
| Hacer clic en "Deshabilitar" | Modal de confirmación; al confirmar, la sala cambia a estado Cerrada |
| Navegar entre páginas | Paginación de 10 salas por página |

---

## 6. Restricciones

- La vista **solo muestra salas del profesional autenticado**; nunca salas de otros profesionales.
- El cambio de estado de una sala requiere **confirmación explícita en modal**.
- Una sala deshabilitada **no aparece** en el listado público del Home de los usuarios.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Filtrado por profesional | Solo se muestran las salas cuyo `ProfesionalId` coincide con el usuario en sesión |
| Estado de sala | Abierta = visible para usuarios; Cerrada = oculta del Home público |
| Confirmación de estado | El cambio de estado siempre requiere modal de confirmación |
| Paginación | 10 salas por página |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Profesional con muchas salas genera lista lenta | Aplicar paginación y carga lazy de detalles |
| Cambio de estado accidental | Modal de confirmación obligatorio antes de aplicar el cambio |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Salas del profesional | `Salas` (ProfesionalId = sesión activa) |
| Estado de la sala | `Salas.Estado` (Abierta / Cerrada) |
| Número de inscritos | `Inscripciones` (COUNT por SalaId / EventoId) |
| Cupo máximo | `Salas.CupoMaximo` |
| Precio | `Salas.Precio` |
| Eventos por sala | `Eventos` (SalaId) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Filtrado correcto | Solo aparecen las salas del profesional autenticado |
| Estado visual correcto | Verde = Abierta, gris = Cerrada, correctamente reflejado |
| Habilitar / Deshabilitar funcional | El estado cambia en la base de datos y se refleja inmediatamente |
| Paginación correcta | Máximo 10 salas por página |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

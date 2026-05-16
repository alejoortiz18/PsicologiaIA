# Mis Eventos — Gestión de Salas del Profesional — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 3 — Herramientas del Profesional | **Apetito:** 1–2 semanas

---

## 1. Problema

El profesional necesita una vista centralizada donde pueda ver, gestionar, crear y eliminar las salas y eventos que ha creado, controlar su estado (abierta/cerrada), ver sus métricas básicas y acceder rápidamente a la sala en vivo para moderar.

---

## 2. Apetito

**1 a 2 semanas.**
Vista con strip de estadísticas, tabla de salas propias con acciones completas (Gestionar / Copiar link / Duplicar / Eliminar) y modal de creación de nueva sala.

---

## 3. Límites

### ✅ Dentro del scope

- Strip de 4 estadísticas: Total salas · Abiertas · Cerradas · Próximas
- Barra de filtros: búsqueda por nombre + filtro por estado
- Botón **[+ Nueva sala]** con modal de creación
- Tabla de salas: Sala · Estado · Fecha · Asistentes · Tarifa · Acciones
- Acción **[Gestionar]** → `sala-conferencia-profesional.html`
- Acción **[Copiar link]** → copia al portapapeles
- Acción **[Duplicar]** → crea copia de la sala con modal de confirmación
- Acción **[Eliminar]** → modal de confirmación con texto de advertencia
- Paginación de 10 registros por página

### ❌ Fuera del scope (No-Gos)

- Gestión de pagos de la sala (módulo financiero)
- Chat dentro de la sala (módulo de conferencias)
- Historial clínico de pacientes
- Estadísticas avanzadas (corresponden al Tab Indicadores del perfil profesional)

---

## 4. Solución Visible

### Strip de 4 estadísticas

| Tarjeta | Descripción | Color |
|---|---|---|
| **Total salas** | Total de salas creadas por el profesional | Azul |
| **Abiertas** | Salas con estado = Abierta | Verde |
| **Cerradas** | Salas con estado = Cerrada | Gris |
| **Próximas** | Salas con evento programado en el futuro | Morado |

### Barra de herramientas

| Elemento | Tipo | Descripción |
|---|---|---|
| Campo búsqueda | Texto | Busca por nombre de sala en tiempo real |
| Filtro Estado | Desplegable | Todas / Abiertas / Cerradas |
| Botón **[+ Nueva sala]** | CTA principal (verde) | Abre modal de creación de sala |

### Tabla de salas

| Columna | Descripción |
|---|---|
| **Sala** | Nombre de la sala + categoría como subtítulo |
| **Estado** | Badge: Abierta (verde) / Cerrada (gris) / En vivo (rojo pulsante) |
| **Fecha** | Fecha del próximo evento `DD MMM YYYY` o "Sin eventos programados" |
| **Asistentes** | `X / Y` (inscritos actuales / cupo máximo) |
| **Tarifa** | `$XX.000 COP` o "Entrada libre" |
| **Acciones** | Grupo de 4 botones (ver detalle abajo) |

### Acciones por fila

| Botón | Ícono | Acción |
|---|---|---|
| **[Gestionar]** | 🎬 | → `sala-conferencia-profesional.html` para moderar en vivo |
| **[Copiar link]** | 🔗 | Copia el link público de inscripción al portapapeles + toast "Link copiado" |
| **[Duplicar]** | 📋 | Modal de confirmación → crea copia de la sala con nombre "Copia de [Nombre]" |
| **[Eliminar]** | 🗑 | Modal de confirmación con advertencia → elimina la sala y sus datos |

### Modal de confirmación — Duplicar sala

| Elemento | Descripción |
|---|---|
| Título | "Duplicar sala" |
| Mensaje | "Se creará una copia de '[Nombre sala]'. Los asistentes no serán copiados." |
| Botón **[Confirmar]** | Crea la duplicación → la nueva sala aparece al inicio de la tabla |
| Botón **[Cancelar]** | Cierra el modal sin cambios |

### Modal de confirmación — Eliminar sala

| Elemento | Descripción |
|---|---|
| Título | "¿Eliminar esta sala?" (rojo) |
| Mensaje de advertencia | "Esta acción no se puede deshacer. Los asistentes inscritos serán notificados." |
| Botón **[Eliminar permanentemente]** | Danger (rojo) — elimina la sala |
| Botón **[Cancelar]** | Cierra el modal sin cambios |

### Modal — Crear nueva sala

| Campo | Obligatorio | Tipo |
|---|---|---|
| Nombre de la sala | Sí | Texto (máx. 100 caracteres) |
| Descripción | Sí | Textarea |
| Categoría | Sí | Desplegable (especialidades disponibles) |
| Fecha del evento | Sí | Selector de fecha (`DD MMM YYYY`) |
| Hora de inicio | Sí | Selector hora (12H) |
| Hora de fin | Sí | Selector hora (12H) |
| Capacidad máxima | Sí | Número entero > 0 |
| Tarifa | No | Número decimal (0 = Entrada libre) |
| Botón **[Crear sala]** | — | Crea la sala → aparece al inicio de la tabla |
| Botón **[Cancelar]** | — | Cierra el modal sin cambios |

---

## 5. Acciones del Profesional

| Acción | Resultado |
|---|---|
| Clic en **[+ Nueva sala]** | Abre modal de creación |
| Completar modal y clic [Crear sala] | Sala creada → aparece en la tabla; strip se actualiza |
| Escribir en búsqueda | Filtra la tabla por nombre de sala |
| Seleccionar filtro Estado | Filtra tabla por Abiertas / Cerradas |
| Clic **[Gestionar]** | Navega a `sala-conferencia-profesional.html` |
| Clic **[Copiar link]** | Toast "Link copiado"; link en portapapeles |
| Clic **[Duplicar]** → Confirmar | Crea copia de la sala; tabla se refresca |
| Clic **[Eliminar]** → Confirmar | Sala eliminada; tabla y strip se actualizan |
| Navegar páginas | Paginación de 10 salas por página |

---

## 6. Restricciones

- La vista **solo muestra salas del profesional autenticado** (`ProfesionalId = sesión`).
- Eliminar una sala requiere **confirmación explícita en modal** (no se puede deshacer).
- Una sala eliminada con asistentes inscritos **notifica** a los asistentes (proceso asíncrono).
- No se puede crear una sala con fecha de evento en el pasado.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Filtrado por profesional | `WHERE ProfesionalId = sesión_activa` |
| Estado "En vivo" | Sala abierta cuyo evento está ocurriendo ahora (`FechaInicio <= NOW <= FechaFin`) |
| Eliminar sala con inscritos | Permitido; notifica automáticamente a los asistentes |
| Tarifa libre | `Precio = 0` → muestra "Entrada libre" |
| Capacidad máxima | Entero positivo > 0; si se excede en duplicación se mantiene el mismo valor |
| Paginación | 10 salas por página |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Eliminación accidental | Modal de confirmación obligatorio con texto de advertencia |
| Sala con muchos inscritos eliminada | Proceso de notificación asíncrono; log de la eliminación en auditoría |
| Link de sala cambia al duplicar | Generar nuevo link único para la sala duplicada |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Salas del profesional | `Salas` (ProfesionalId = sesión) |
| Estado de sala | `Salas.Estado` (Abierta / Cerrada) |
| Próximo evento | `Eventos` (SalaId, FechaInicio más próxima) |
| Asistentes actuales | `COUNT(Inscripciones)` donde `SalaId` y `Estado = Confirmada` |
| Cupo máximo | `Salas.CupoMaximo` |
| Tarifa | `Salas.Precio` |
| Link público | `Salas.LinkPublico` (URL de inscripción) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Strip correcto | Los 4 contadores reflejan datos reales de la BD |
| Tabla filtrada correctamente | Solo salas del profesional autenticado; filtros funcionales |
| Crear sala funcional | La sala aparece en la tabla al crearla |
| Eliminar / Duplicar seguros | Ambas acciones requieren confirmación; resultado reflejado inmediatamente |
| [Gestionar] navega correcto | Lleva a `sala-conferencia-profesional.html` |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

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

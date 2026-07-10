# Directorio de Especialistas — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1–2 semanas

---

## 1. Problema

El usuario necesita explorar el directorio de profesionales especialistas de la plataforma para encontrar uno que se ajuste a sus necesidades, con filtros de búsqueda, información relevante en las tarjetas y la posibilidad de seguir a los profesionales de su interés.

---

## 2. Apetito

**1 a 2 semanas.**
Página de directorio con strip de stats, filtros (búsqueda + ciudad + orden + limpiar), grid de cards con 10 por página, paginación y acciones [Ver perfil] + [+Seguir] toggle por card.

---

## 3. Límites

### ✅ Dentro del scope

- Strip de 3 stats: Total de especialistas · Verificados · Que sigues
- Filtros: búsqueda por nombre/especialidad · ciudad · orden (Relevante/Mejor valorado/Más seguidores/A-Z) · botón [Limpiar filtros]
- Grid de cards: 10 por página
- Cada card: avatar · nombre · especialidad · tags · rating ★ · seguidores · tarifa · ciudad · badge Verificado (si aplica)
- Acciones por card: [Ver perfil] → `perfil-orador.html` · [+Seguir / ✓ Siguiendo] toggle
- Paginación numérica

### ❌ Fuera del scope (No-Gos)

- Filtro por especialidad psicológica específica (corresponde a `psicologos.html`)
- Agendar cita directamente desde el directorio
- Comparar perfiles

---

## 4. Solución Visible

### Strip de stats (dinámica con JS)

| Stat | Descripción |
|---|---|
| **Total especialistas** | Total de profesionales con rol "Especialista" activos en la plataforma |
| **Verificados** | Profesionales con badge de verificación COLPSIC activo |
| **Que sigues** | Número de especialistas que el usuario autenticado sigue |

### Barra de filtros

| Filtro | Tipo | Descripción |
|---|---|---|
| Búsqueda | Input texto | Busca por nombre del profesional o especialidad |
| Ciudad | Dropdown | Lista de ciudades disponibles en la plataforma |
| Ordenar | Dropdown | Relevante · Mejor valorado · Más seguidores · A-Z |
| Botón **[Limpiar filtros]** | Botón texto | Restablece todos los filtros a sus valores por defecto |

### Card de especialista

| Elemento | Descripción |
|---|---|
| Avatar | Foto de perfil circular |
| Badge **Verificado** | Ícono ✓ azul/verde si el profesional está verificado |
| Nombre | Nombre completo (con tratamiento: Dra./Dr. si aplica) |
| Especialidad principal | "Psicología clínica", "Neuropsicología", etc. |
| Tags | Máx. 3 tags de especialización (ej: "Ansiedad", "Depresión", "TCC") |
| Rating ★ | Promedio de valoraciones con una estrella rellena (ej: ★ 4.8) |
| Seguidores | "1.248 seguidores" |
| Tarifa | "$80.000 COP / sesión" |
| Ciudad | "Bogotá, Colombia" |

**Acciones de la card:**

| Acción | Estado inicial | Estado al hacer clic |
|---|---|---|
| **[Ver perfil]** | Siempre activo | → `perfil-orador.html` del profesional |
| **[+ Seguir]** | Si NO sigue al profesional | Cambia a **[✓ Siguiendo]** (verde) |
| **[✓ Siguiendo]** | Si YA sigue al profesional | Cambia a **[+ Seguir]** (outline) |

### Paginación

| Elemento | Descripción |
|---|---|
| Registros por página | 10 cards por página |
| Controles | [‹ Anterior] · páginas numeradas · [Siguiente ›] |
| Texto resumen | "Mostrando 1–10 de 248 especialistas" |

### Estado vacío (sin resultados)

| Elemento | Descripción |
|---|---|
| Ícono | Ícono de búsqueda sin resultados |
| Mensaje | "No encontramos especialistas con los filtros seleccionados." |
| Botón **[Limpiar filtros]** | Restablece los filtros |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Escribir en búsqueda | Filtra en tiempo real (debounce 300ms) |
| Seleccionar ciudad | Filtra el grid por ciudad |
| Seleccionar orden | Reordena el grid |
| Clic **[Limpiar filtros]** | Restablece todos los filtros |
| Clic **[Ver perfil]** | → `perfil-orador.html` del profesional |
| Clic **[+ Seguir]** | Sigue al profesional; botón cambia a [✓ Siguiendo] |
| Clic **[✓ Siguiendo]** | Deja de seguir al profesional; botón cambia a [+ Seguir] |
| Navegar entre páginas | Carga la página seleccionada del grid |

---

## 6. Restricciones

- Solo se muestran profesionales con **Estado = Activo**.
- El grid siempre muestra **10 cards por página**.
- El toggle de seguir es **inmediato** (sin modal de confirmación para seguir; puede requerir confirmación para dejar de seguir).

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Profesionales visibles | Solo `Estado = Activo` |
| Badge Verificado | Muestra si `Profesionales.Verificado = true` |
| Toggle seguir | `Seguimientos` tabla: INSERT (seguir) / DELETE (dejar de seguir) |
| Stat "Que sigues" | `COUNT(Seguimientos)` donde `UsuarioId = actual` y `ProfesionalId IN (especialistas)` |
| Orden "Relevante" | Combinación de rating + seguidores (definir fórmula en el backend) |
| Formato fechas | `DD MMM YYYY` |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Grid lento con muchos profesionales | Paginación de 10 + índices en BD por ciudad, especialidad, rating |
| Toggle seguir con doble clic | Debounce en el botón para evitar múltiples llamadas |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Lista de especialistas | `Profesionales` (Estado = Activo, filtros aplicados) |
| Foto de perfil | `Profesionales.FotoPerfil` |
| Nombre y especialidad | `Profesionales.NombreCompleto`, `Especialidad` |
| Tags | `ProfesionalesTags` (ProfesionalId, Tag) |
| Rating | `AVG(Valoraciones.Puntuacion)` donde `ProfesionalId` |
| Seguidores | `COUNT(Seguimientos)` donde `ProfesionalId` |
| Tarifa | `Profesionales.TarifaBase` |
| Ciudad | `Profesionales.Ciudad` |
| Verificado | `Profesionales.Verificado` |
| Seguimiento del usuario | `Seguimientos` (UsuarioId, ProfesionalId) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Grid paginado correcto | 10 cards por página; navegación funcional |
| Filtros funcionales | Búsqueda + ciudad + orden filtran correctamente |
| Toggle seguir correcto | El estado se guarda en la BD y se refleja en el UI |
| Stats actualizados | Los 3 contadores reflejan los datos reales |
| Estado vacío visible | Se muestra cuando no hay resultados |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

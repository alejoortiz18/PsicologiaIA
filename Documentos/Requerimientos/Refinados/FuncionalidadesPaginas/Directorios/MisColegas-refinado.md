# Mis Colegas — Vista del Profesional — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 3 — Herramientas del Profesional | **Apetito:** 1–2 semanas

---

## 1. Problema

El profesional necesita gestionar su red de colegas profesionales vinculados a la plataforma, con estadísticas de colaboración (pacientes compartidos, derivaciones activas), filtros de búsqueda por estado en línea, y acciones para ver pacientes compartidos, enviar mensajes, ver perfiles y desvincular colegas.

---

## 2. Apetito

**1 a 2 semanas.**
Página de colegas con strip de 3 stats, filtros (búsqueda + tipo + estado en línea/ocupado/desconectado), grid de cards con indicador de estado, y acciones: [Ver pacientes]→modal, [💬 Mensaje], [Ver perfil], [Desvincular]→modal confirm danger.

---

## 3. Límites

### ✅ Dentro del scope

- Strip de stats: Colegas vinculados · Pacientes compartidos · Derivaciones activas
- Filtros: búsqueda por nombre · tipo (Todos/Especialista/Psicólogo) · estado (En línea/Ocupado/Desconectado)
- Grid de cards con indicador de estado en línea
- Acciones: [Ver pacientes]→modal · [💬 Mensaje]→mensajería · [Ver perfil]→perfil-orador · [Desvincular]→modal danger
- Estado vacío cuando no hay colegas vinculados

### ❌ Fuera del scope (No-Gos)

- Vincular nuevos colegas desde esta vista
- Historial clínico completo de pacientes compartidos
- Videollamada directa entre colegas

---

## 4. Solución Visible

### Strip de stats

| Stat | Descripción |
|---|---|
| **Colegas vinculados** | Total de colegas profesionales vinculados |
| **Pacientes compartidos** | Pacientes que este profesional comparte con algún colega |
| **Derivaciones activas** | Derivaciones de pacientes en estado activo |

### Barra de filtros

| Filtro | Tipo | Descripción |
|---|---|---|
| Búsqueda | Input texto | Por nombre del colega |
| Tipo | Pills o dropdown | Todos · Especialista · Psicólogo |
| Estado | Pills con colores | **En línea** (verde) · **Ocupado** (naranja) · **Desconectado** (gris) |

### Card de colega

| Elemento | Descripción |
|---|---|
| Avatar | Foto de perfil circular |
| **Indicador de estado** | Punto de color superpuesto en el avatar: verde (En línea) / naranja (Ocupado) / gris (Desconectado) |
| Nombre completo | Con tratamiento (Dra./Dr.) |
| Especialidad | Especialidad principal |
| Badge Verificado | ✓ si está verificado |
| Estadísticas del vínculo | "3 pacientes compartidos · 1 derivación activa" |
| Última actividad | "Activo hace 5 min" o fecha de última sesión |

**Acciones de la card:**

| Acción | Descripción |
|---|---|
| **[Ver pacientes]** | Abre modal con lista de pacientes compartidos (usando alias) |
| **[💬 Mensaje]** | → `mensajes-profesional.html` con esta conversación preseleccionada |
| **[Ver perfil]** | → `perfil-orador.html` del colega |
| **[Desvincular]** | Botón danger (rojo outline) → modal de confirmación |

### Modal — Ver pacientes compartidos

| Elemento | Descripción |
|---|---|
| Título | "Pacientes compartidos con [Nombre del colega]" |
| Lista | Alias del paciente · Tipo de vínculo (Derivación/Co-tratamiento) · Estado (Activo/Completado) |
| Acciones por paciente | [Ver detalle] — abre mini-modal con info básica (solo alias, fechas, estado) |
| Botón **[Cerrar]** | Cierra el modal |

### Modal — Desvincular colega

| Elemento | Descripción |
|---|---|
| Título | "¿Desvincular a [Nombre del colega]?" (rojo) |
| Mensaje | "Se eliminará el vínculo profesional. Las derivaciones activas quedarán en estado **Pendiente de reasignación**." |
| Botón **[Desvincular]** | Rojo sólido — ejecuta la desvinculación |
| Botón **[Cancelar]** | Cierra el modal sin acción |

### Estado vacío

| Elemento | Descripción |
|---|---|
| Ícono | Ícono de red de profesionales |
| Mensaje | "No tienes colegas vinculados todavía." |
| Subtexto | "Conecta con otros profesionales para colaborar y derivar pacientes." |

---

## 5. Acciones del Profesional

| Acción | Resultado |
|---|---|
| Buscar por nombre | Filtra en tiempo real (debounce 300ms) |
| Filtrar por tipo | Muestra solo Especialistas o Psicólogos |
| Filtrar por estado | Muestra solo los colegas En línea / Ocupados / Desconectados |
| Clic **[Ver pacientes]** | Abre modal con alias de pacientes compartidos |
| Clic **[💬 Mensaje]** | → `mensajes-profesional.html` con conversación preseleccionada |
| Clic **[Ver perfil]** | → `perfil-orador.html` del colega |
| Clic **[Desvincular]** | Abre modal de confirmación |
| Confirmar desvinculación | Vínculo eliminado; derivaciones activas → "Pendiente de reasignación" |

---

## 6. Restricciones

- Los pacientes en el modal siempre se muestran con su **alias** (nunca nombre real).
- La desvinculación requiere **confirmación explícita** (modal danger).
- Las derivaciones activas no se eliminan al desvincular; quedan en estado "Pendiente de reasignación".

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Colegas visibles | `VinculosProfesionales` (ProfesionalId = actual) JOIN `Profesionales` |
| Estado en línea | `Profesionales.UltimaActividad < 5 min` = En línea / `< 30 min` = Ocupado / else = Desconectado |
| Alias del paciente | Siempre `Usuarios.Alias`; nunca `Usuarios.NombreCompleto` |
| Desvinculación | DELETE de `VinculosProfesionales`; UPDATE derivaciones activas a `Pendiente de reasignación` |
| Stats dinámicos | Se recalculan tras cada desvinculación |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Desvinculación con derivaciones activas | Modal de advertencia específica + estado "Pendiente de reasignación" |
| Datos del paciente expuestos | Solo se muestra alias en todos los contextos |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Vínculos del profesional | `VinculosProfesionales` (ProfesionalId, ColegaId, FechaVinculo) |
| Datos del colega | `Profesionales.NombreCompleto`, `FotoPerfil`, `Especialidad`, `TipoRol`, `UltimaActividad` |
| Pacientes compartidos | `PacientesCompartidos` (ProfesionalId, ColegaId, UsuarioId, Tipo, Estado) |
| Alias del paciente | `Usuarios.Alias` |
| Derivaciones activas | `Derivaciones` (Estado = Activo, ProfesionalId o ColegaId) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Indicador de estado correcto | El punto de color refleja la actividad real del colega |
| Modal de pacientes con alias | Los nombres reales nunca aparecen en el modal |
| Desvinculación con confirmación | No se puede desvincular sin el modal danger |
| Derivaciones gestionadas | Al desvincular, las derivaciones cambian a "Pendiente de reasignación" |
| Stats actualizados | Los contadores reflejan la BD tras cada acción |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

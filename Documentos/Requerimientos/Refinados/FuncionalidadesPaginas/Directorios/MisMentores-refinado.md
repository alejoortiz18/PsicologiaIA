# Mis Mentores — Vista del Usuario — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1 semana

---

## 1. Problema

El usuario necesita una vista consolidada de todos los profesionales que sigue (sus "mentores"), con información relevante sobre cuándo empezó a seguirlos, filtros para organizar la lista y la posibilidad de dejar de seguir a un profesional con confirmación.

---

## 2. Apetito

**1 semana.**
Página de "mis mentores" con strip de stats dinámico, filtros (búsqueda + tipo + orden), grid de cards con la fecha de seguimiento, badge de tipo y el botón [✓ Siguiendo] con confirm modal antes de unfollow.

---

## 3. Límites

### ✅ Dentro del scope

- Strip de stats (calculado con JS): Mentores seguidos · Especialistas · Psicólogos
- Filtros: búsqueda por nombre · tipo (Todos/Especialista/Psicólogo) · orden (Reciente/A-Z/Popular)
- Grid de cards con datos de seguimiento
- Botón **[✓ Siguiendo]** con modal de confirmación antes de dejar de seguir
- Estado vacío cuando no sigue a nadie

### ❌ Fuera del scope (No-Gos)

- Agendar cita directamente desde esta vista
- Añadir nuevos mentores desde esta vista (se hace desde los directorios)

---

## 4. Solución Visible

### Strip de stats (dinámico)

| Stat | Descripción |
|---|---|
| **Mentores seguidos** | Total de profesionales que el usuario sigue |
| **Especialistas** | Profesionales seguidos con rol "Especialista" |
| **Psicólogos** | Profesionales seguidos con rol "Psicólogo" |

### Barra de filtros

| Filtro | Tipo | Descripción |
|---|---|---|
| Búsqueda | Input texto | Por nombre del profesional |
| Tipo | Pills o dropdown | Todos · Especialista · Psicólogo |
| Ordenar | Dropdown | Reciente (default) · A-Z · Popular (por seguidores) |

### Card de mentor

| Elemento | Descripción |
|---|---|
| Avatar | Foto de perfil circular |
| Badge tipo | "Especialista" o "Psicólogo" |
| Badge **Verificado** | ✓ si el profesional está verificado |
| Nombre completo | Con tratamiento (Dra./Dr.) |
| Especialidad | Especialidad principal |
| Texto seguimiento | "Siguiendo desde: 14 Mar 2026" |
| Rating ★ | Promedio de valoraciones |
| Seguidores | Número de seguidores del profesional |
| Tarifa | "$80.000 COP / sesión" |

**Acciones de la card:**

| Acción | Descripción |
|---|---|
| **[Ver perfil]** | → `perfil-orador.html` del profesional |
| **[✓ Siguiendo]** | Botón verde; al hacer clic abre modal de confirmación |

### Modal de confirmación — Dejar de seguir

| Elemento | Descripción |
|---|---|
| Título | "¿Dejar de seguir a [Nombre del profesional]?" |
| Mensaje | "Dejarás de recibir sus actualizaciones y nuevas salas." |
| Botón **[Dejar de seguir]** | Rojo outline — ejecuta el unfollow |
| Botón **[Cancelar]** | Cierra el modal sin acción |

### Estado vacío

| Elemento | Descripción |
|---|---|
| Ícono | Ícono de personas |
| Mensaje | "Todavía no sigues a ningún profesional." |
| Botón **[Explorar especialistas]** | → `especialistas.html` |
| Botón **[Explorar psicólogos]** | → `psicologos.html` |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Buscar por nombre | Filtra en tiempo real (debounce 300ms) |
| Filtrar por tipo | Muestra solo Especialistas o Psicólogos según selección |
| Seleccionar orden | Reordena las cards |
| Clic **[Ver perfil]** | → `perfil-orador.html` |
| Clic **[✓ Siguiendo]** | Abre modal de confirmación para dejar de seguir |
| Confirmar unfollow | El profesional desaparece de la lista; stats se actualizan |
| Cancelar | Cierra el modal; sin cambios |

---

## 6. Restricciones

- Solo se muestran profesionales que el usuario **actualmente sigue**.
- La eliminación de un mentor requiere **confirmación explícita** (modal obligatorio).
- No se pueden añadir nuevos mentores desde esta vista.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Mentores visibles | `Seguimientos` (UsuarioId = actual) JOIN `Profesionales` |
| Fecha de seguimiento | `Seguimientos.FechaInicio` — formato `DD MMM YYYY` |
| Unfollow con confirmación | Siempre mostrar modal antes de ejecutar el DELETE |
| Stats dinámicos | Se recalculan tras cada unfollow |
| Orden "Popular" | Por `COUNT(Seguimientos)` del profesional (seguidores totales) |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Unfollow accidental | Modal de confirmación obligatorio |
| Stats desactualizados | Recalcular en cada render de la página |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Seguimientos activos | `Seguimientos` (UsuarioId, ProfesionalId, FechaInicio) |
| Datos del profesional | `Profesionales.NombreCompleto`, `FotoPerfil`, `Especialidad`, `TipoRol`, `Verificado` |
| Rating | `AVG(Valoraciones.Puntuacion)` donde `ProfesionalId` |
| Seguidores | `COUNT(Seguimientos)` donde `ProfesionalId` |
| Tarifa | `Profesionales.TarifaBase` |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Lista correcta | Solo muestra los profesionales que el usuario actualmente sigue |
| Fecha de seguimiento visible | Se muestra "Siguiendo desde: [fecha]" en cada card |
| Modal de unfollow obligatorio | No se puede dejar de seguir sin confirmar |
| Stats dinámicos | Los contadores se actualizan tras el unfollow |
| Estado vacío visible | Se muestra cuando no sigue a nadie |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

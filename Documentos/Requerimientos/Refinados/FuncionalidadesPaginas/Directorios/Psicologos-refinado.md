# Directorio de Psicólogos — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1–2 semanas

---

## 1. Problema

El usuario necesita explorar el directorio de psicólogos verificados ante COLPSIC de la plataforma, con filtros específicos de especialidad psicológica y verificación COLPSIC, para encontrar el profesional de salud mental adecuado para sus necesidades.

---

## 2. Apetito

**1 a 2 semanas.**
Página similar a `especialistas.html` con filtro adicional de especialidad psicológica (TCC, psicoanalítica, humanista, etc.) y énfasis en la verificación COLPSIC como diferenciador clave.

---

## 3. Límites

### ✅ Dentro del scope

- Strip de 3 stats: Total de psicólogos · Verificados COLPSIC · Que sigues
- Filtros: búsqueda por nombre/especialidad · **especialidad psicológica (filtro adicional)** · ciudad · orden · botón [Limpiar filtros]
- Grid de cards: 10 por página (igual a especialistas)
- Cada card: todos los campos de especialistas + **badge COLPSIC verificado** especial
- Acciones: [Ver perfil] + [+Seguir / ✓ Siguiendo] toggle
- Paginación numérica

### ❌ Fuera del scope (No-Gos)

- Agendar cita directamente desde el directorio
- Filtros adicionales más allá de los especificados

---

## 4. Solución Visible

### Strip de stats (dinámica con JS)

| Stat | Descripción |
|---|---|
| **Total psicólogos** | Total de profesionales con rol "Psicólogo" activos |
| **Verificados COLPSIC** | Profesionales con tarjeta COLPSIC verificada |
| **Que sigues** | Psicólogos que el usuario autenticado sigue |

### Barra de filtros (diferencias respecto a especialistas)

| Filtro | Tipo | Descripción |
|---|---|---|
| Búsqueda | Input texto | Por nombre del profesional o especialidad |
| **Especialidad psicológica** | Dropdown (adicional) | TCC · Psicoanalítica · Humanista · Sistémica · Cognitiva · EMDR · Mindfulness · Gestalt · Otra |
| Ciudad | Dropdown | Lista de ciudades |
| Ordenar | Dropdown | Relevante · Mejor valorado · Más seguidores · A-Z |
| Botón **[Limpiar filtros]** | Botón texto | Restablece todos los filtros |

### Card de psicólogo

Igual a la card de especialistas más:

| Elemento adicional | Descripción |
|---|---|
| Badge **"✓ COLPSIC"** | Badge especial verde/teal que indica verificación ante COLPSIC |
| N° tarjeta profesional | Texto pequeño: "Tarjeta N° COLPSIC: XXXXX" (los últimos 5 dígitos para privacidad) |

**Acciones de la card** (idénticas a especialistas):

| Acción | Resultado |
|---|---|
| **[Ver perfil]** | → `perfil-orador.html` del psicólogo |
| **[+ Seguir / ✓ Siguiendo]** | Toggle seguir/dejar de seguir |

### Paginación

| Elemento | Descripción |
|---|---|
| Registros por página | 10 cards por página |
| Controles | [‹ Anterior] · páginas numeradas · [Siguiente ›] |
| Texto resumen | "Mostrando 1–10 de X psicólogos" |

### Nota informativa (banner superior)

```
🛡️ Todos los psicólogos listados aquí han sido verificados ante el 
   Colegio Colombiano de Psicólogos (COLPSIC).
```

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Escribir en búsqueda | Filtra en tiempo real (debounce 300ms) |
| Seleccionar especialidad psicológica | Filtra por enfoque terapéutico |
| Seleccionar ciudad | Filtra por ciudad |
| Seleccionar orden | Reordena el grid |
| Clic **[Limpiar filtros]** | Restablece todos los filtros |
| Clic **[Ver perfil]** | → `perfil-orador.html` |
| Clic **[+ Seguir]** | Sigue al psicólogo |
| Clic **[✓ Siguiendo]** | Deja de seguir |
| Navegar entre páginas | Carga la página del grid |

---

## 6. Restricciones

- Solo se muestran profesionales con **Estado = Activo** y **Rol = Psicólogo** (o que tengan tarjeta COLPSIC registrada).
- El grid muestra **10 cards por página**.
- La nota informativa del banner siempre es visible.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Psicólogos visibles | `Profesionales` donde `Estado = Activo` y `TipoRol = Psicologo` |
| Badge COLPSIC | Muestra si `Profesionales.Verificado = true` y tiene `NumeroTarjetaProfesional` |
| Filtro especialidad psicológica | `ProfesionalesEspecialidades.TipoEnfoque = X` |
| N° tarjeta visible | Solo últimos 5 dígitos de `NumeroTarjetaProfesional` para privacidad |
| Toggle seguir | Igual que en el directorio de especialistas |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Profesional con tarjeta COLPSIC revocada | Proceso de re-verificación periódica; el admin puede desactivar la verificación |
| Filtro de especialidad psicológica sin resultados | Mostrar estado vacío con [Limpiar filtros] |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Lista de psicólogos | `Profesionales` (TipoRol = Psicologo, Estado = Activo) |
| Verificación COLPSIC | `Profesionales.Verificado`, `NumeroTarjetaProfesional` |
| Especialidad psicológica | `ProfesionalesEspecialidades.TipoEnfoque` |
| Rating, seguidores, tarifa | Mismo que directorio de especialistas |
| Seguimiento del usuario | `Seguimientos` (UsuarioId, ProfesionalId) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Solo psicólogos verificados | No aparecen profesionales sin tarjeta COLPSIC |
| Filtro de especialidad funcional | Filtra correctamente por enfoque terapéutico |
| Badge COLPSIC visible | Se muestra en todas las cards de psicólogos verificados |
| Paginación correcta | 10 por página con navegación funcional |
| Toggle seguir correcto | El estado persiste en la BD |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

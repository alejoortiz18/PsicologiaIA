# Landing Page — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 1 — Público | **Apetito:** 1–2 semanas

---

## 1. Problema

Los visitantes que llegan a la plataforma no tienen contexto sobre qué es Trébol, qué ofrece ni por qué deberían registrarse. Sin una landing page clara, la conversión de visitante a usuario registrado es nula.

---

## 2. Apetito

**1 a 2 semanas.**
Esta es la primera impresión del sistema. Define la marca, genera confianza, capta usuarios y establece la estructura UX global que se replicará en el resto de la aplicación.

---

## 3. Límites

### ✅ Dentro del scope

- Cinta promocional superior con profesional destacado (scroll automático derecha → izquierda)
- Banner principal con datos generales de la plataforma
- Sección de especialidades en tarjetas
- Cinta de los 3 eventos con mayor número de inscritos
- Pie de página institucional
- Botón: Iniciar sesión
- Botón: Registro

### ❌ Fuera del scope (No-Gos)

- Funcionalidades de usuario autenticado
- Pasarela de pagos
- Panel de administración
- Filtros o búsqueda de profesionales
- Chat o mensajería

---

## 4. Solución Visible

### Estructura de la página (de arriba hacia abajo)

| Sección | Descripción |
|---|---|
| **Cinta superior** | Texto animado (scroll derecha → izquierda) con perfil de profesional destacado |
| **Banner principal** | Imágenes de la plataforma, número de profesionales y eventos activos, mensajes motivacionales |
| **Sección de especialidades** | Galería de tarjetas con todas las especialidades psicológicas disponibles |
| **Cinta de eventos destacados** | Tarjetas de los 3 eventos con mayor número de inscritos |
| **Pie de página** | Información institucional, términos, política de privacidad y contacto |

### Convenciones visuales

| Elemento | Estándar |
|---|---|
| Fechas | `DD MMM YYYY` → ej: `8 Oct 2026` |
| Horas | Formato 12H → ej: `3PM`, `3:30PM` |
| Mensajes del sistema | Siempre mediante **modal** (nunca `alert()` nativo) |
| Logotipo | Esquina superior izquierda, visible en todo momento |
| Pestaña del navegador | Icono + nombre de la aplicación |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Hacer clic en "Iniciar sesión" | Redirige a la vista de Login |
| Hacer clic en "Registro" | Redirige a la selección de perfil (Usuario / Profesional) |
| Ver tarjeta de especialidad | Solo visualización; sin interacción adicional |
| Ver tarjeta de evento destacado | Visualización de nombre, fecha (`DD MMM YYYY`), hora (12H), cupos y orador |
| Hacer clic en botón dentro de tarjeta de evento | Redirige a Login (acceso restringido para no autenticados) |

---

## 6. Restricciones

- La landing page es **pública**: no requiere autenticación para ser visualizada.
- El profesional destacado en la cinta superior es **elegido por la plataforma** (no por el profesional).
- Los 3 eventos de la cinta son los de **mayor número de inscritos** actuales; se actualizan dinámicamente.
- No se puede inscribir ni interactuar con eventos desde esta vista sin estar autenticado.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Cinta superior | Muestra un solo profesional destacado a la vez, seleccionado desde el panel de administración |
| Eventos destacados | Se seleccionan automáticamente por número de inscritos (Top 3) |
| Datos del banner | `Número de profesionales` y `eventos activos` se obtienen en tiempo real desde la base de datos |
| Visibilidad de especialidades | Se muestran todas las especialidades con al menos un profesional activo en la plataforma |
| Pie de página | Los enlaces a términos, política de privacidad y contacto deben existir antes del lanzamiento |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| La cinta animada puede ser lenta en dispositivos de bajo rendimiento | Usar CSS puro para el scroll, no JavaScript pesado |
| Los datos en tiempo real (profesionales, eventos) pueden generar consultas lentas | Usar caché con tiempo de expiración corto (ej: 5 minutos) |
| Imagen de la landing muy pesada afecta el tiempo de carga | Optimizar imágenes con formato WebP y lazy loading |

---

## 9. Datos Necesarios

| Dato | Fuente |
|---|---|
| Número de profesionales activos | `Tabla: Profesionales` (estado = Activo) |
| Número de eventos activos | `Tabla: Eventos` (estado = Abierto y vigente) |
| Profesional destacado | `Tabla: Configuracion` (campo: ProfesionalDestacado) |
| Top 3 eventos por inscritos | `Tabla: Inscripciones` (agrupado por EventoId, TOP 3) |
| Lista de especialidades | `Tabla: Especialidades` |
| Textos del pie de página | `Tabla: Configuracion` o archivos estáticos |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Carga de la página | Menos de **2 segundos** en condiciones normales |
| Visibilidad correcta de eventos | Los 3 eventos mostrados son los de mayor cantidad de inscritos |
| Profesional destacado visible | La cinta superior muestra al profesional configurado por el administrador |
| Accesos sin error | Los botones de Login y Registro redirigen correctamente sin errores 404 |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

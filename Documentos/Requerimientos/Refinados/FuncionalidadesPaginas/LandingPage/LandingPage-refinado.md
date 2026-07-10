# Landing Page — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 1 — Público | **Apetito:** 1–2 semanas

---

## 1. Problema

Los visitantes que llegan a la plataforma no tienen contexto sobre qué es Trébol, qué ofrece ni por qué deberían registrarse. Sin una landing page clara, la conversión de visitante a usuario registrado es nula.

---

## 2. Apetito

**1 a 2 semanas.**
Primera impresión del sistema. Define la marca, genera confianza, muestra estadísticas reales, presenta las especialidades disponibles, exhibe los Top 3 eventos más populares y proporciona un CTA claro para profesionales.

---

## 3. Límites

### ✅ Dentro del scope

- Ticker bar animado (CSS scroll) con profesional destacado
- Navbar pública: logo + [Iniciar sesión] + [Registrarse]
- Hero section: H1 + estadísticas reales (248 profesionales / 1340 eventos / 12k+ usuarios)
- Grid de 12 especialidades en cards
- Sección "Top 3 eventos" ranqueados #1 #2 #3 con cupos, orador, precio
- CTA para profesionales ("¿Eres profesional de la salud mental?")
- Footer institucional con columnas: Plataforma, Profesionales, Legal, Contacto

### ❌ Fuera del scope (No-Gos)

- Funcionalidades de usuario autenticado
- Pasarela de pagos
- Panel de administración
- Filtros o búsqueda de profesionales
- Chat o mensajería

---

## 4. Solución Visible

### Ticker bar superior (CSS animado)

| Elemento | Descripción |
|---|---|
| Animación | Texto desplazándose de derecha a izquierda (CSS `marquee` o `animation: ticker`) |
| Contenido | Perfil del profesional destacado: avatar miniatura + nombre + especialidad + frase corta |
| Actualización | El profesional destacado es configurado por el administrador |

### Navbar pública

| Elemento | Posición | Acción |
|---|---|---|
| Logo Trébol | Izquierda | Recarga la landing page |
| **[Iniciar sesión]** | Derecha | → `login.html` |
| **[Registrarse]** | Derecha (CTA principal) | → `registro-seleccion.html` |

### Hero Section

| Elemento | Descripción |
|---|---|
| H1 | "Tu bienestar mental, conectado con los mejores profesionales" (texto principal) |
| Subtítulo | Descripción breve de la plataforma |
| Estadísticas en tiempo real | 3 contadores destacados: **248** profesionales · **1340** eventos · **12k+** usuarios |
| CTA principal | Botón **[Comienza ahora]** → `registro-seleccion.html` |
| CTA secundario | Botón **[Conoce los profesionales]** → ancla a sección especialidades |

### Grid de 12 Especialidades

| Elemento | Descripción |
|---|---|
| Tarjeta por especialidad | Ícono + nombre de la especialidad |
| Especialidades ejemplo | Psicología clínica, Terapia de pareja, Psicología infantil, Ansiedad y estrés, Depresión, Trauma y PTSD, Adicciones, Orientación vocacional, Coaching, Terapia familiar, Mindfulness, Neuropsicología |
| Interacción | Solo visual; clic redirige a Login para no autenticados |

### Sección "Top 3 Eventos" (rankeados)

| Elemento | Descripción |
|---|---|
| Badge de ranking | `#1`, `#2`, `#3` visible en la tarjeta |
| Nombre del evento | Título de la sala/conferencia |
| Orador | Avatar + nombre del profesional |
| Fecha y hora | `DD MMM YYYY · H:MMAM/PM` |
| Cupos disponibles | `X cupos restantes` |
| Precio | `$XX.000 COP` o "Entrada libre" |
| Botón **[Ver evento]** | → `login.html` (acceso restringido para no autenticados) |

Los Top 3 se seleccionan automáticamente por **número de inscritos** (descendente) y se actualizan dinámicamente.

### CTA para Profesionales

| Elemento | Descripción |
|---|---|
| Titular | "¿Eres profesional de la salud mental?" |
| Subtexto | Beneficios de unirse: alcance, pacientes, salas, ingresos |
| Botón **[Registrarme como profesional]** | → `registro-seleccion.html` (selecciona perfil Profesional) |

### Footer — 4 columnas

| Columna | Contenido |
|---|---|
| **Plataforma** | Sobre Trébol · Blog · Preguntas frecuentes |
| **Profesionales** | Cómo registrarse · Beneficios · Requisitos COLPSIC |
| **Legal** | Términos y condiciones · Política de privacidad · Política de cookies |
| **Contacto** | Email de soporte · Redes sociales |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Clic en **[Iniciar sesión]** | → `login.html` |
| Clic en **[Registrarse]** | → `registro-seleccion.html` |
| Clic en **[Comienza ahora]** | → `registro-seleccion.html` |
| Clic en tarjeta de especialidad | → `login.html` (acceso restringido) |
| Clic en **[Ver evento]** (Top 3) | → `login.html` (acceso restringido) |
| Clic en **[Registrarme como profesional]** | → `registro-seleccion.html` |

---

## 6. Restricciones

- La landing page es **pública**: no requiere autenticación.
- El profesional destacado en el ticker es **elegido por el administrador**, no por el profesional.
- Los Top 3 eventos se actualizan automáticamente por número de inscritos; no son editables manualmente.
- Los botones de eventos redirigen a Login para visitantes no autenticados.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Ticker profesional destacado | Configurado desde el panel Admin (`Configuracion.ProfesionalDestacado`) |
| Estadísticas Hero | Contadores en tiempo real desde BD; caché con TTL de 5 minutos |
| Top 3 eventos | `TOP 3 FROM Inscripciones GROUP BY SalaId ORDER BY COUNT DESC` |
| Especialidades | Solo las que tienen al menos 1 profesional activo |
| Precio "Entrada libre" | `Precio = 0` o `Precio IS NULL` |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Ticker pesado en dispositivos lentos | CSS puro para la animación; no JavaScript pesado |
| Estadísticas en tiempo real lentas | Caché con TTL de 5 minutos |
| Imágenes pesadas afectan carga | Imágenes en WebP + lazy loading |

---

## 9. Datos Necesarios

| Dato | Fuente |
|---|---|
| Profesional destacado | `Configuracion.ProfesionalDestacadoId` → `Profesionales` |
| Contador profesionales | `COUNT(Profesionales)` donde `Estado = Activo` |
| Contador eventos | `COUNT(Salas)` donde hay eventos abiertos y vigentes |
| Contador usuarios | `COUNT(Usuarios)` donde `Estado = Activo` |
| Top 3 eventos | `Salas` + `Inscripciones` (agrupado, TOP 3 por inscritos) |
| Lista de especialidades | `Especialidades` (con al menos 1 profesional activo) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Carga de la página | Menos de **2 segundos** |
| Estadísticas correctas | Los 3 contadores del Hero reflejan datos reales |
| Top 3 eventos correctos | Los eventos mostrados son los de mayor cantidad de inscritos |
| Navegación sin errores | [Iniciar sesión] y [Registrarse] redirigen correctamente sin 404 |
| Ticker visible | El profesional destacado se muestra correctamente |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

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

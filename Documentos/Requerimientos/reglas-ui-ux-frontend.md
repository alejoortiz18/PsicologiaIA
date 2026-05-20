# Reglas de Desarrollo UI/UX — Frontend

> **Referencia metodológica:** [Shape Up by Basecamp (Ryan Singer)](https://basecamp.com/shapeup)
>
> Este documento establece las reglas y estándares que rigen el diseño y desarrollo del frontend del sistema. Está refinado bajo los principios de **Shape Up**: trabajo acotado, soluciones rough-pero-resueltas, sin rabbit holes y con apetito definido.

---

## Índice

1. [Filosofía de Diseño](#1-filosofía-de-diseño)
   - 1.1 [Texto, idioma y codificación (es-CO)](#11-texto-idioma-y-codificación-es-co)
2. [Ciclos y Apetito (Shape Up)](#2-ciclos-y-apetito-shape-up)
3. [Componentes — Tablas](#3-componentes--tablas)
4. [Componentes — Modales y Mensajes](#4-componentes--modales-y-mensajes)
5. [Componentes — Formularios](#5-componentes--formularios)
   - 5.5 Formularios de múltiples pasos (Wizard)
6. [Componentes — Navegación](#6-componentes--navegación)
   - 6.3 Tabs (prof-tabs-bar — estándar del sistema)
7. [Componentes — Botones y Acciones](#7-componentes--botones-y-acciones)
8. [Feedback al Usuario](#8-feedback-al-usuario)
9. [Tipografía y Colores](#9-tipografía-y-colores)
10. [Layout y Responsividad](#10-layout-y-responsividad)
    - 10.4 Layout de dos paneles (mensajería)
    - 10.5 Componente de calendario (3 vistas)
    - 10.6 Componente de sala de cita / conferencia
11. [Animaciones y Transiciones](#11-animaciones-y-transiciones)
12. [Accesibilidad](#12-accesibilidad)
13. [Rendimiento Frontend](#13-rendimiento-frontend)
14. [Rabbit Holes — Qué Evitar](#14-rabbit-holes--qué-evitar)
15. [Checklist de Entrega (Done = Deployed)](#15-checklist-de-entrega-done--deployed)

---

## 1. Filosofía de Diseño

> *"Shaping means making sure the work is rough, solved, and bounded before handing it to a team."*
> — Shape Up, Cap. 2

El frontend no comienza con wireframes de alta fidelidad ni con listas infinitas de tareas. Se parte de una **idea resuelta pero intencionalmente rough**, con límites claros de lo que entra y lo que no.

### Principios fundamentales

| Principio | Descripción |
|-----------|-------------|
| **Rough, no vago** | Los bocetos son aproximados, pero el problema y la solución están resueltos antes de implementar |
| **Acotado** | Cada feature tiene un alcance explícito. Lo que no está en scope es un **No-Go** |
| **Resuelto** | No se entrega trabajo sin que las decisiones de UX críticas estén tomadas |
| **Consistencia primero** | La interfaz se ve y se siente igual en toda la aplicación |
| **El usuario nunca se queda sin respuesta** | Toda acción produce feedback visible |
| **Texto correcto en español (Colombia)** | Sin caracteres corruptos; tildes y ñ bien codificadas en todo el ciclo de desarrollo |

### 1.1 Texto, idioma y codificación (es-CO)

Regla transversal para **todo el ciclo de desarrollo** (vistas, constantes, correos, mensajes de API, documentación de UI, pruebas E2E y commits): el texto visible para el usuario debe estar en **español de Colombia (`es-CO`)** y guardarse siempre en **UTF-8**.

#### Idioma y ortografía

- Usar vocabulario y convenciones de **español de Colombia** (no mezclar con otro español salvo acuerdo explícito del producto).
- Escribir tildes y caracteres propios del español de forma correcta: **á, é, í, ó, ú, ñ, ü**, signos **¿** y **¡** cuando correspondan.
- Ejemplos correctos: *configuración*, *contraseña*, *identificación*, *¿Olvidaste tu contraseña?*, *¡Registro exitoso!*
- Evitar anglicismos innecesarios en la UI cuando exista un término claro en español (salvo nombres de producto acordados, p. ej. *Trébol*).

#### Prohibido: caracteres corruptos (mojibake)

No debe aparecer en la aplicación, correos, BD ni documentación copiada al repo texto con secuencias típicas de **codificación incorrecta**, por ejemplo:

| ❌ Incorrecto (corrupto) | ✅ Debe decirse |
|--------------------------|-----------------|
| `configuraciÃ³n` | configuración |
| `contraseÃ±a` | contraseña |
| `Ã©xito` | éxito |
| `Â¿` / `Â¡` | ¿ / ¡ |
| `â€™` / `â€œ` | comillas tipográficas o ASCII `'` `"` según contexto |

Estos errores suelen originarse por: archivo guardado en ANSI/Windows-1252, copiar desde Word/PDF sin UTF-8, o mezclar bytes UTF-8 leídos como Latin-1. **No se aceptan en revisión ni en producción.**

#### Reglas técnicas en el repositorio

| Ámbito | Regla |
|--------|--------|
| **Archivos fuente** | `.cshtml`, `.cs`, `.js`, `.css`, `.json`, `.md`, `.sql` con texto en español: **UTF-8** (configurar el editor/IDE en UTF-8). |
| **Razor / HTML** | Preferir el carácter Unicode en el fuente (`ó`, `ñ`) en lugar de entidades HTML (`&oacute;`) salvo en plantillas de correo donde el cliente lo exija. |
| **API y constantes** | Mensajes de `RegistroConstant`, validaciones, toasts y modales: revisar que no lleguen cadenas ya corruptas desde BD o seeds. |
| **Correos** | Mismo estándar de tildes; plantilla en UTF-8 y `charset=UTF-8` en el HTML del correo. |
| **Pruebas y capturas** | Playwright y revisiones manuales deben comprobar que labels y mensajes no muestran `Ã` ni secuencias similares. |
| **Commits y PR** | Si un diff introduce mojibake, se corrige antes de merge. |

#### Verificación rápida antes de entregar

1. Buscar en los archivos tocados patrones sospechosos: `Ã`, `Â`, `â€`, `ï¿½`.
2. Abrir la pantalla en el navegador y leer títulos, errores y botones (no solo el código).
3. Si el texto se pegó desde otro documento, reescribirlo en el IDE o validar codificación del archivo.

> **Responsabilidad:** Aplica a desarrolladores, revisores de código, IA/asistentes y quien redacte copy. Es parte de la calidad de la UI, no un detalle opcional.

### Jerarquía de prioridades de diseño

```
1. Accesibilidad       → siempre
2. Feedback al usuario → siempre
3. Consistencia visual → siempre
4. Estética            → después de lo anterior
5. Animaciones/polish  → al final, si queda apetito
```

---

## 2. Ciclos y Apetito (Shape Up)

> *"We call this the appetite. It's not an estimate — it's a deliberate choice about how much time we're willing to spend on a problem."*
> — Shape Up, Cap. 3

Antes de construir cualquier pantalla o componente, se debe definir:

### Plantilla de Apetito por Feature

```markdown
**Feature:** [Nombre del componente/pantalla]
**Apetito:** Small Batch (≤ 2 días) | Medium (1 semana) | Large (2–3 semanas)
**Problema real que resuelve:** [descripción en 1–2 oraciones]
**Solución acotada:** [qué incluye exactamente]
**No-Gos (fuera de scope):** [qué NO se hará]
**Rabbit holes identificados:** [riesgos o complejidades ocultas]
```

### Tipos de batch UI

| Tipo | Apetito | Ejemplos |
|------|---------|---------|
| **Small Batch** | 1–2 días | Cambio de color, nuevo botón, ajuste de modal |
| **Medium Batch** | 1 semana | Nuevo formulario, tabla con filtros, flujo de 2 pasos |
| **Large Batch** | 2–3 semanas | Módulo completo, dashboard, flujo multistep complejo |

> **Regla:** Si una feature UI no cabe en 3 semanas, **debe cortarse el scope**, no extenderse el tiempo.

---

## 3. Componentes — Tablas

> Regla base: **Toda tabla de datos del sistema DEBE tener paginación de 10 registros por página.**

### 3.1 Paginación

- **Registros por página por defecto:** `10`
- **Opciones permitidas de registros por página:** `10 | 25 | 50`
- La paginación se muestra **siempre**, incluso si hay menos de 10 registros (deshabilitada si no aplica)
- El selector de registros por página se ubica en la **esquina inferior derecha**
- La información de paginación muestra: *"Mostrando X–Y de Z registros"*

```
┌──────────────────────────────────────────────────────┐
│ Tabla de datos                                       │
├──┬──────────────┬──────────────┬────────────────────┤
│  │ Columna 1    │ Columna 2    │ Acciones           │
├──┼──────────────┼──────────────┼────────────────────┤
│  │ ...          │ ...          │ [Ver] [Editar]     │
└──┴──────────────┴──────────────┴────────────────────┘
  Mostrando 1–10 de 47 registros    [◀] [1][2][3] [▶]
                               Registros por página: [10▾]
```

### 3.2 Estructura obligatoria de tablas

| Elemento | Obligatorio | Descripción |
|----------|-------------|-------------|
| Encabezado con nombre de columna | ✅ | Siempre visible, con borde inferior |
| Ordenamiento por columna | ✅ | Al menos 1 columna debe ser ordenable |
| Estado vacío | ✅ | Mensaje claro cuando no hay datos |
| Estado de carga | ✅ | Skeleton o spinner mientras carga |
| Paginación | ✅ | 10 por página, siempre visible |
| Acciones por fila | ✅ si aplica | Botones: Ver, Editar, Eliminar |
| Filtro/búsqueda | ⚠️ recomendado | Para tablas con más de 20 registros esperados |
| Selección múltiple | ❌ solo si el caso de uso lo requiere | No agregar sin necesidad |

### 3.3 Estado vacío de tabla

Cuando no hay registros, la tabla debe mostrar:
- Ícono ilustrativo (no emoji)
- Texto claro: *"No se encontraron registros"*
- Acción sugerida si aplica (ej: *"Crear nuevo paciente"*)

### 3.4 Columna de acciones

- Las acciones siempre van en la **última columna**
- Máximo **3 acciones visibles** por fila; el resto en un menú desplegable `⋮`
- **Eliminar** siempre requiere confirmación mediante modal (ver Sección 4)

---

## 4. Componentes — Modales y Mensajes

> Regla base: **Todos los mensajes del sistema (confirmaciones, errores, advertencias, éxito) se muestran mediante Modal. No se usan `alert()`, `confirm()` ni notificaciones nativas del navegador.**

### 4.1 Tipos de modal y cuándo usar cada uno

| Tipo | Uso | Color | Ícono |
|------|-----|-------|-------|
| **Confirmación** | Antes de acciones destructivas o irreversibles | Neutro/Azul | ⚠️ |
| **Éxito** | Operación completada correctamente | Verde | ✅ |
| **Error** | Fallo del sistema o validación crítica | Rojo | ✗ |
| **Advertencia** | Acción de riesgo moderado | Amarillo/Naranja | ⚠️ |
| **Información** | Datos importantes que el usuario debe leer | Azul | ℹ️ |
| **Formulario** | Crear o editar un registro sin cambiar de página | Neutro | — |

### 4.2 Estructura estándar de un modal

```
┌─────────────────────────────────────────────┐
│  [✕]                                        │  ← Botón cerrar (esquina sup. derecha)
│                                             │
│  [Ícono]  Título del Modal                  │  ← Título claro y conciso
│                                             │
│  Descripción del mensaje o contenido del    │  ← Máximo 3 líneas para mensajes
│  formulario va aquí.                        │     simples
│                                             │
│              [Cancelar]  [Confirmar]        │  ← Acciones alineadas a la derecha
└─────────────────────────────────────────────┘
```

### 4.3 Reglas de comportamiento del modal

- **Fondo oscurecido** (`backdrop`) siempre activo — opacidad `0.5`
- **No se cierra** al hacer clic en el backdrop si contiene un formulario con datos ingresados
- **Sí se cierra** al hacer clic en el backdrop si es solo un mensaje informativo
- La tecla `Esc` **siempre cierra** el modal (excepto procesos en curso)
- El foco del teclado queda **atrapado dentro del modal** mientras esté abierto (accesibilidad)
- Los modales **no se apilan** — solo puede haber un modal activo a la vez

### 4.4 Modal de confirmación de eliminación

Obligatorio antes de cualquier eliminación:

```
┌─────────────────────────────────────────────┐
│  [✕]                                        │
│                                             │
│  ⚠️  Eliminar [nombre del registro]         │
│                                             │
│  Esta acción no se puede deshacer. ¿Estás   │
│  seguro de que deseas eliminar este         │
│  registro?                                  │
│                                             │
│              [Cancelar]  [Eliminar]         │
│                          (rojo, 800ms delay)│
└─────────────────────────────────────────────┘
```

> **Regla anti-click-accidental:** El botón de confirmación destructiva tiene un delay de activación de **800ms** (se habilita al aparecer, no instantáneamente).

### 4.5 Toast / Notificaciones no intrusivas

Para mensajes que **no requieren acción del usuario** (guardado exitoso en background, etc.), se usa un **toast** (no un modal):

- Posición: **esquina superior derecha**
- Duración: **4 segundos** antes de desaparecer automáticamente
- El usuario puede cerrarlos manualmente
- Máximo **2 toasts** visibles simultáneamente
- **No usar toasts para errores críticos** — usar modal

---

## 5. Componentes — Formularios

### 5.1 Estructura de campos

- Cada campo tiene su `<label>` siempre visible (nunca solo placeholder)
- El label va **encima** del campo, no al lado
- Los campos requeridos se marcan con `*` rojo
- El placeholder es un **ejemplo de valor**, no la descripción del campo

```
Nombre del paciente *
┌─────────────────────────────┐
│ Ej: Juan García             │
└─────────────────────────────┘
Apellidos *
┌─────────────────────────────┐
│ Ej: García López            │
└─────────────────────────────┘
```

### 5.2 Validación y errores

- La validación se ejecuta **al salir del campo** (`onBlur`), no al escribir
- El mensaje de error aparece **debajo del campo** que lo originó (no solo al tope)
- El mensaje es específico: *"El email debe tener formato válido"*, nunca solo *"Campo inválido"*
- El campo en error tiene borde **rojo** y el mensaje en color rojo

```
Email *
┌─────────────────────────────┐  ← borde rojo
│ juan@                       │
└─────────────────────────────┘
⚠ Ingresa un email con formato válido (ej: usuario@dominio.com)
```

### 5.3 Botones del formulario

- **Guardar/Confirmar**: primario, alineado a la derecha
- **Cancelar**: secundario, a la izquierda del primario
- Mientras el formulario se envía: el botón primario muestra un spinner y se deshabilita
- Nunca se envía el formulario dos veces (double-submit protegido)

### 5.4 Campos de Fecha y Hora

#### Fecha

- El formato de visualización de fechas en toda la aplicación es: **`DD MMM YYYY`**
- Ejemplo canónico: **`15 Oct 2026`** (día sin cero inicial, mes abreviado en 3 letras con mayúscula inicial, año 4 dígitos)
- Este formato aplica en: tablas, labels de solo lectura, modales, reportes y cualquier texto de la UI
- Los meses abreviados en español son: `Ene Feb Mar Abr May Jun Jul Ago Sep Oct Nov Dic`
- En **inputs de formulario**, el campo fecha usa un date picker nativo o componente visual — el valor seleccionado se muestra en el formato `DD MMM YYYY`
- **Nunca** mostrar fechas en formato ISO (`2026-10-15`) ni en formato largo sin abreviar (`15 de octubre de 2026`) en la interfaz de usuario

```
Fecha de consulta *
┌─────────────────────────────┐
│ 15 Oct 2026          [📅]   │
└─────────────────────────────┘
```

#### Hora

- El formato de hora en toda la aplicación es: **12 horas con sufijo AM/PM en mayúsculas**
- Ejemplo canónico: **`3PM`**, **`10AM`**, **`12PM`**, **`12AM`**
- Reglas del formato:
  - Sin cero inicial en la hora: `3PM` (no `03PM`)
  - Sin minutos cuando son en punto: `3PM` (no `3:00PM`)
  - **Con minutos** solo cuando no son en punto: `3:30PM`, `10:45AM`
  - Sufijo `AM` / `PM` sin espacio y en mayúsculas pegado a la hora

```
Hora de consulta *
┌─────────────────────────────┐
│ 3:30PM               [🕐]   │
└─────────────────────────────┘
```

#### Fecha y Hora combinadas

- Cuando se muestra fecha y hora juntas se separan con un espacio: **`DD MMM YYYY H[MM]AM/PM`**
- Ejemplos: `8 Oct 2026 3PM` · `15 Oct 2026 10:30AM` · `1 Ene 2027 12PM`

```
Próxima cita *
┌─────────────────────────────┐
│ 8 Oct 2026 3PM       [📅]   │
└─────────────────────────────┘
```

#### Tabla de formatos — Referencia rápida

| Contexto | Ejemplo |
|----------|---------|
| Solo fecha | `8 Oct 2026` |
| Solo hora (en punto) | `3PM` |
| Solo hora (con minutos) | `3:30PM` |
| Fecha y hora | `8 Oct 2026 3PM` |
| Fecha y hora con minutos | `8 Oct 2026 3:30PM` |

#### Formatos prohibidos

| ❌ Prohibido | ✅ Correcto |
|-------------|------------|
| `2026-10-08` | `8 Oct 2026` |
| `08/10/2026` | `8 Oct 2026` |
| `15:00` / `15:30` (formato 24H) | `3PM` / `3:30PM` |
| `3:00 pm` (minúsculas con espacio) | `3PM` |
| `03PM` (cero inicial) | `3PM` |
| `8 de octubre de 2026 a las 3PM` | `8 Oct 2026 3PM` |

### 5.5 Formularios de múltiples pasos (Wizard)

Para flujos que requieren más de un paso secuencial (ej: inscripción, pago):

**Estructura obligatoria:**
```
[Paso 1: Confirmación] ─●─ [Paso 2: Pago] ─●─ [Paso 3: Resultado]
```

**Reglas:**
- Máximo **3 pasos** por wizard. Si se necesitan más, rediseñar el flujo.
- El indicador de pasos es visible en todo momento (barra superior con conectores).
- El paso actual está resaltado; los completados con indicador de check.
- Cada paso tiene un **botón “Volver”** que regresa al paso anterior sin perder datos.
- El botón de avance es el **único botón primario** del paso.
- Los pasos completados permanecen accesibles (el usuario puede volver).
- El paso de resultado tiene **3 estados obligatorios**: éxito, rechazado/error, sin disponibilidad.
- El tiempo de procesamiento simulado o real se comunica con un spinner en el botón o en pantalla.

---
- Si un formulario tiene más de **6 campos**, se divide en **secciones con encabezado**
- Si supera **12 campos** o tiene flujo de pasos, se usa un **wizard multistep** con indicador de progreso
- El indicador de progreso muestra: *"Paso 2 de 4"* + barra o dots

---

## 6. Componentes — Navegación

### 6.1 Menú principal (Sidebar)

- El sidebar es **fijo** (no scroll con el contenido)
- El ítem activo está visualmente destacado (color de fondo o borde lateral)
- Los submenús se expanden con animación suave (`200ms ease`)
- El sidebar es colapsable en pantallas < 1024px

### 6.2 Breadcrumbs

- Obligatorio en cualquier vista que esté a **más de 1 nivel de profundidad**
- Formato: `Inicio / Pacientes / Juan García / Historial`
- El último ítem (página actual) no es un link

### 6.3 Tabs

- Máximo **6 tabs** visibles horizontalmente.
- El tab activo tiene indicador visual claro: **borde inferior de 3px en color acento**.
- Los tabs no tienen scroll horizontal — si no caben, se usa un contenedor con `overflow-x: auto` y `scrollbar: none`.

#### Estilo estándar de tabs (prof-tabs-bar)

En toda la aplicación se usa el componente `prof-tabs-bar` como estándar para navegación por tabs:

```html
<nav class="prof-tabs-bar" aria-label="[Descripción de la sección]">
  <ul class="prof-tabs-bar__list" role="tablist">
    <li><a href="..." class="prof-tab-link active" aria-current="page">
      <span class="tab-icon">[emoji]</span>[Label]
    </a></li>
    <li><a href="..." class="prof-tab-link">
      <span class="tab-icon">[emoji]</span>[Label]
      <span class="tab-badge">[n]</span> <!-- opcional: contador -->
    </a></li>
  </ul>
</nav>
```

**Reglas del componente:**
- Fondo blanco (`color-surface`), bordes redondeados (`radius-xl`), sombra suave.
- Tab activo: color primario + borde inferior de 3px en color acento.
- Badges de conteo: fondo pale cuando inactivo, fondo primario cuando activo.
- Para tabs que navegan entre páginas: usar `<a href>`. Para tabs que cambian contenido en la misma página: usar `<button>` con `role="tab"`.
- Iconos via `<span class="tab-icon">`: opacidad 0.75 en inactivo, 1 en activo.

---

## 7. Componentes — Botones y Acciones

### 7.1 Jerarquía visual de botones

| Tipo | Uso | Apariencia |
|------|-----|------------|
| **Primario** | Acción principal de la página/modal | Fondo sólido, color principal |
| **Secundario** | Acción alternativa | Borde, sin fondo o fondo suave |
| **Ghost/Texto** | Acciones terciarias | Solo texto, sin borde ni fondo |
| **Peligro** | Eliminar, acción destructiva | Rojo sólido |
| **Deshabilitado** | Acción no disponible | Opacidad 40%, no clickeable |

### 7.2 Reglas de botones

- **Solo un botón primario** por vista/modal
- Tamaño mínimo: **44 × 44px** (área de toque — accesibilidad táctil)
- Los botones de ícono solo **siempre tienen `aria-label`**
- Los botones muestran estado de carga (spinner) durante operaciones async
- **No usar `disabled` como estado permanente** — si la acción no aplica, ocultarlo o explicar por qué

---

## 8. Feedback al Usuario

> *"Nobody says 'I don't know'"* — Shape Up, Cap. 13
>
> Aplicado al frontend: el sistema **siempre comunica su estado** al usuario.

### 8.1 Estados que siempre deben comunicarse

| Estado | Cómo mostrarlo |
|--------|---------------|
| Cargando datos | Skeleton loader o spinner centrado |
| Guardando | Botón con spinner + texto *"Guardando..."* |
| Éxito | Toast verde o modal de éxito |
| Error de servidor | Modal de error con mensaje y opción de reintentar |
| Sin conexión | Banner persistente en top de página |
| Sin resultados | Estado vacío con ilustración y mensaje |
| Acceso denegado | Página 403 con explicación y botón de regreso |

### 8.2 Tiempos de respuesta percibida

| Tiempo | Comportamiento requerido |
|--------|--------------------------|
| < 100ms | Sin indicador (respuesta inmediata) |
| 100ms – 1s | Spinner en el botón que originó la acción |
| 1s – 3s | Skeleton loader en el área de contenido |
| > 3s | Spinner global + mensaje *"Cargando, por favor espera..."* |
| Timeout (> 10s) | Modal de error con opción de reintentar |

---

## 9. Tipografía y Colores

### 9.1 Tipografía

| Elemento | Tamaño | Peso | Interlineado |
|----------|--------|------|--------------|
| Título de página (h1) | 24px | 700 | 1.3 |
| Título de sección (h2) | 20px | 600 | 1.3 |
| Título de card/modal (h3) | 16px | 600 | 1.4 |
| Cuerpo de texto | 14–16px | 400 | 1.6 |
| Texto auxiliar/meta | 12px | 400 | 1.5 |
| Labels de formulario | 14px | 500 | 1.4 |

- **Tamaño mínimo de texto** en la aplicación: **12px**
- Nunca usar menos de 12px para texto legible
- Fuente principal: definida en el sistema de diseño del proyecto
- **Idioma del copy:** español Colombia (`es-CO`); ver [§ 1.1 Texto, idioma y codificación](#11-texto-idioma-y-codificación-es-co)

### 9.2 Sistema de colores semánticos

Usar **tokens semánticos**, nunca valores hexadecimales directos en componentes:

| Token | Uso |
|-------|-----|
| `--color-primary` | Acciones principales, links, selección |
| `--color-danger` | Eliminar, errores, alertas críticas |
| `--color-warning` | Advertencias, acciones reversibles con cuidado |
| `--color-success` | Confirmaciones, guardado exitoso |
| `--color-info` | Información neutral |
| `--color-text-primary` | Texto principal |
| `--color-text-secondary` | Texto auxiliar, placeholders |
| `--color-background` | Fondo de página |
| `--color-surface` | Fondo de cards, modales, tablas |
| `--color-border` | Bordes de inputs, tablas, divisores |

### 9.3 Contraste (Accesibilidad WCAG AA)

- Texto normal: relación de contraste mínima **4.5:1**
- Texto grande (≥ 18px): relación mínima **3:1**
- Componentes interactivos (borde de input): mínima **3:1**

---

## 10. Layout y Responsividad

### 10.1 Breakpoints estándar

| Nombre | Rango | Comportamiento |
|--------|-------|----------------|
| **Mobile** | < 768px | Sidebar colapsado, layout de 1 columna |
| **Tablet** | 768px – 1023px | Sidebar colapsable, layout 1–2 columnas |
| **Desktop** | ≥ 1024px | Sidebar visible, layout completo |

### 10.2 Reglas de layout

- **Mobile-first**: el CSS base es para mobile, con `min-width` para breakpoints superiores
- **Sin scroll horizontal** en ningún breakpoint
- El contenido nunca queda oculto o inaccesible en mobile
- Las tablas en mobile pueden tener scroll horizontal **solo dentro de su contenedor** (no la página)
- Los modales en mobile ocupan **100% del ancho** con `border-radius` solo en top

### 10.3 Grid y espaciado

- Usar sistema de **espaciado en múltiplos de 4px**: 4, 8, 12, 16, 24, 32, 48, 64
- El contenido principal tiene padding horizontal de **24px** en desktop, **16px** en mobile
- Cards y contenedores tienen `border-radius` consistente definido en el design system

### 10.4 Layout de dos paneles (mensajería)

Para vistas de tipo cliente de correo o mensajería:

```
[■ Lista de conversaciones (360px) ] [ Chat activo (flex: 1) ]
```

- Panel izquierdo: **ancho fijo** (~360px), scroll interno en la lista.
- Panel derecho: ocupa el resto del espacio con `flex: 1`.
- En mobile (≤ 768px): solo se muestra un panel a la vez; la selección de conversación navega al panel de chat.
- Las conversaciones muestran: avatar, nombre, etiqueta de rol, preview del último mensaje, hora y badge de no leídos.

### 10.5 Componente de calendario (3 vistas)

El componente de calendario del sistema expone **3 vistas**:

| Vista | Descripción |
|---|---|
| Mensual | Cuadrícula 7×6 de días con estados de color |
| Semanal | Columnas por día con franjas horarias (64px/hora), eventos posicionados absolutamente |
| Diaria | Una columna con todos los slots del día |

**Reglas del calendario:**
- La vista activa se selecciona mediante **pills de selección** (Mensual / Semanal / Diaria).
- La línea de hora actual es **roja** con punto indicador. Auto-scroll a la hora actual al cargar.
- Los estados de celda se distinguen únicamente por color (no solo por color — también patrón o texto para accesibilidad).
- El botón **“Hoy”** navega a la fecha actual en cualquier vista.
- Los eventos clickeables abren un **modal de detalle** (no navegan a otra página).
- Los slots ocupados no son clickeables y muestran patrón rayado o icono de candado.

**Estados estándar de celdas de calendario:**

| Estado | Color | Descripción |
|---|---|---|
| Disponible | Verde | Slot reservable |
| Ocupado | Gris rayado | Ya tiene cita o evento |
| Bloqueado | Gris sólido | No disponible por el profesional |
| Fuera de horario | Rayas diagonales | Fuera del horario laboral |
| Pasado | Atenuado | Fecha ya transcurrida |
| Mi reserva | Color acento / rosa | Reserva del usuario actual |

### 10.6 Componente de sala de cita / conferencia

**Sala de cita privada (1:1):**
- Layout: área de video (60-70% del ancho) + panel lateral fijo (~340px).
- Controles flotantes sobre el video (círculos con iconos).
- Panel lateral con **tabs** para organizar información (Sesión / Recomendaciones).
- Timer de sesión siempre visible en el header.

**Sala de conferencia en vivo:**
- Misma estructura con panel lateral de **3 tabs**: Preguntas / Asistentes / Info.
- Chip de estado visible en el header (“EN VIVO”, “Preguntas habilitadas”).
- El toggle de preguntas produce feedback visual inmediato (chip cambia de color + toast).
---

## 11. Animaciones y Transiciones
> *"Animation should convey meaning, not just look pretty."*

### 11.1 Duraciones estándar

| Tipo de animación | Duración | Easing |
|------------------|----------|--------|
| Hover, focus, active | 150ms | `ease` |
| Apertura de modal | 200ms | `ease-out` |
| Cierre de modal | 150ms | `ease-in` |
| Despliegue de menú/dropdown | 200ms | `ease-out` |
| Toast aparecer/desaparecer | 300ms | `ease` |
| Transición entre páginas | 250ms | `ease-in-out` |

### 11.2 Reglas de animación

- **No animar** `width`, `height` ni `top/left` directamente — usar `transform` y `opacity`
- **Siempre respetar** `prefers-reduced-motion`: si el usuario lo tiene activado, eliminar o reducir animaciones
- Las animaciones son **funcionales**, no decorativas: deben indicar apertura, cierre, éxito, error o transición
- No usar animaciones con duración > **500ms** en acciones del usuario

---

## 12. Accesibilidad

> Mínimo estándar: **WCAG 2.1 nivel AA**

### 12.1 Checklist de accesibilidad obligatorio

- [ ] Todos los elementos interactivos son alcanzables con `Tab`
- [ ] El orden de foco sigue el orden visual lógico
- [ ] Los botones de ícono tienen `aria-label` descriptivo
- [ ] Las imágenes tienen `alt` (decorativas con `alt=""`)
- [ ] Los modales atrapan el foco mientras están abiertos
- [ ] `Esc` cierra modales y dropdowns
- [ ] Los colores no son el único medio para comunicar información
- [ ] Los mensajes de error son leídos por lectores de pantalla (`role="alert"`)
- [ ] Los formularios tienen `label` asociado con `for` / `htmlFor`
- [ ] La jerarquía de encabezados es secuencial (`h1` → `h2` → `h3`)

### 12.2 Roles ARIA esenciales

| Elemento | Role / Atributo |
|----------|----------------|
| Modal abierto | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` |
| Mensajes de error | `role="alert"` |
| Botón de ícono | `aria-label="Descripción de la acción"` |
| Cargando | `aria-busy="true"` + `aria-live="polite"` |
| Tabla | `<caption>` descriptivo |

---

## 13. Rendimiento Frontend

### 13.1 Imágenes

- Formato: **WebP** preferido, JPEG como fallback
- Las imágenes tienen dimensiones explícitas (previene CLS — Cumulative Layout Shift)
- Las imágenes debajo del fold usan `loading="lazy"`
- Tamaño máximo de imagen sin comprimir: **200KB**

### 13.2 Carga de página

- **Largest Contentful Paint (LCP):** < 2.5 segundos
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Contentful Paint (FCP):** < 1.8 segundos
- Reservar espacio para contenido que carga async (skeleton loaders)

### 13.3 Código

- No cargar librerías enteras si solo se usa una función
- Los componentes de terceros (calendarios, editores, etc.) se cargan bajo demanda (lazy import)
- No hacer llamadas API innecesarias al montar componentes sin acción del usuario

---

## 14. Rabbit Holes — Qué Evitar

> *"Rabbit holes are the parts of the project that look like they might fit in the appetite but, when you actually start working on them, they turn out to be much bigger than expected."*
> — Shape Up, Cap. 5

Los siguientes patrones están **explícitamente prohibidos** por ser rabbit holes comunes en frontend:

### 14.1 Anti-patrones de UX

| ❌ Anti-patrón | ✅ Alternativa |
|----------------|---------------|
| Usar `alert()` / `confirm()` del navegador | Modal personalizado (Sección 4) |
| Placeholder como único label del campo | Label visible siempre encima del campo |
| Tablas sin paginación | Paginación de 10 por defecto (Sección 3) |
| Errores solo al tope del formulario | Error inline bajo cada campo |
| Botones sin estado de carga | Spinner durante operaciones async |
| Modales apilados (modal dentro de modal) | Rediseñar flujo — un modal a la vez |
| Deshabilitar el zoom en mobile | Nunca usar `user-scalable=no` |
| Hover como único trigger de información | Información accesible sin hover |
| Scroll horizontal en página completa | Tablas con overflow-x interno |
| Animaciones sin `prefers-reduced-motion` | Siempre incluir media query de reducción |

### 14.2 Anti-patrones de desarrollo

| ❌ Qué evitar | Motivo |
|---------------|--------|
| Componentes con responsabilidad múltiple | Dificulta mantenimiento y reutilización |
| Estilos inline en componentes | Rompe consistencia del design system |
| Hardcodear colores hexadecimales | Usar tokens semánticos |
| Lógica de negocio en componentes UI | Separar en servicios/hooks |
| Copiar componentes en lugar de reutilizarlos | Crear componente compartido |
| Texto con mojibake (`Ã³`, `Ã±`, `Â¿`, etc.) | Corregir codificación UTF-8 y tildes en español Colombia |
| Copiar strings desde Word/PDF sin revisar encoding | Escribir o pegar en IDE UTF-8 y validar en navegador |

---

## 15. Checklist de Entrega (Done = Deployed)

> *"Done means deployed."*
> — Shape Up, Cap. 10

Antes de considerar una pantalla o feature frontend como **terminada**, debe pasar este checklist:

### 15.1 Funcionalidad

- [ ] Todos los estados de la pantalla están implementados: vacío, cargando, con datos, error
- [ ] Paginación implementada en toda tabla (10 por defecto)
- [ ] Todos los mensajes usan modal o toast (sin `alert` nativo)
- [ ] Confirmación de eliminación con modal implementada
- [ ] Formularios con validación inline y mensajes específicos
- [ ] Estados de carga en botones durante operaciones async
- [ ] Double-submit protegido

### 15.2 Calidad visual

- [ ] Consistente con el design system del proyecto
- [ ] Responsive: probado en mobile (< 768px), tablet y desktop
- [ ] Sin scroll horizontal en ningún breakpoint
- [ ] Espaciado consistente (múltiplos de 4px)
- [ ] Jerarquía tipográfica correcta
- [ ] Texto en **español Colombia** con tildes y ñ correctas (sin `Ã`, `Â`, `â€` ni secuencias corruptas)
- [ ] Archivos con copy en español guardados en **UTF-8**

### 15.3 Accesibilidad

- [ ] Navegable completamente con teclado
- [ ] `aria-label` en todos los botones de ícono
- [ ] Modales con foco atrapado y `Esc` funcional
- [ ] Contraste verificado (4.5:1 mínimo)
- [ ] Mensajes de error con `role="alert"`

### 15.4 Rendimiento

- [ ] Sin llamadas API redundantes
- [ ] Imágenes optimizadas y con `loading="lazy"` donde aplica
- [ ] Sin layout shift visible al cargar contenido

### 15.5 Revisión final (Scope Hammer)

> *"Scope hammering means cutting scope to fit the appetite. It's not lowering quality, it's making trade-offs."*
> — Shape Up, Cap. 14

Antes de entregar, preguntar:
- ¿Hay algo que agregué que nadie pidió?
- ¿Hay algo nice-to-have que puedo mover al siguiente ciclo?
- ¿El resultado resuelve el problema original?

---

## Glosario (Shape Up aplicado a Frontend)

| Término | Definición |
|---------|------------|
| **Apetito** | Tiempo máximo que se asigna a un feature UI. Fijo. El scope se ajusta a él |
| **Fat marker sketch** | Boceto rough del layout — suficiente para entender la solución, sin detalle pixel-perfect |
| **Rabbit hole** | Parte de un feature que parece pequeña pero es un problema sin fondo |
| **No-Go** | Decisión explícita de lo que NO se va a implementar en este ciclo |
| **Done = Deployed** | Una feature frontend no está terminada hasta que está en producción |
| **Scope hammering** | Cortar scope activamente para no exceder el apetito. No es bajar calidad |
| **Circuit breaker** | Si un feature no se termina en el ciclo asignado, **no se extiende** — se re-shapea en el siguiente |
| **Cool-down** | Período entre ciclos para bugs, deuda técnica menor y refinamiento |

---

*Documento creado bajo metodología [Shape Up — Basecamp](https://basecamp.com/shapeup) | Versión 1.1 | Mayo 2026*

---

## Email Templates — CTA Button Style (Norma)

Todas las plantillas de correo del sistema que incluyen un botón de llamada a la acción deben seguir un patrón único y comprobable para garantizar contraste, legibilidad y consistencia en clientes de correo.

Reglas obligatorias:

- Color de fondo del botón: `#000000` (negro)
- Color de texto: `#FFFFFF` (blanco) con `!important` para evitar overrides por clientes de correo
- Tipografía: `font-family: 'Segoe UI', Arial, sans-serif; font-size: 1.1rem; font-weight: 700`
- Padding: `18px 56px`, `border-radius: 50px`
- Border: `2px solid #FFFFFF`
- Box-shadow: `0 6px 20px rgba(0,0,0,.8)` (opcional, mejora legibilidad en algunos clientes)
- Usar `display:inline-block` y `text-decoration:none`

Ejemplo de inline style que se debe usar en plantillas HTML de correo:

```
style="display:inline-block;background:#000000;color:#FFFFFF !important;font-size:1.1rem;font-weight:700;font-family:'Segoe UI',Arial,sans-serif;text-decoration:none;padding:18px 56px;border-radius:50px;letter-spacing:.5px;box-shadow:0 6px 20px rgba(0,0,0,.8);border:2px solid #FFFFFF;-webkit-appearance:none;-moz-appearance:none;appearance:none;"
```

Implementación recomendada:

- Centralizar estilo en un helper o plantilla base para correos y aplicar en todas las funciones que generan HTML de correo.
- Añadir pruebas visuales (Playwright) para cada plantilla principal que incluya CTA.
- Documentar nuevas plantillas de correo en el repositorio y referenciar esta norma.


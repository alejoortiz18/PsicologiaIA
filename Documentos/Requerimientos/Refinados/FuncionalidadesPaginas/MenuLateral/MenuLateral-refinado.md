# Menú Lateral (Sidebar) — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 3–5 días

---

## 1. Problema

Una vez autenticado, el usuario o profesional necesita un punto de navegación central, siempre visible, que le permita moverse entre las secciones de la plataforma de forma clara y eficiente, respetando los permisos de su perfil.

---

## 2. Apetito

**3 a 5 días.**
Sidebar fijo renderizado según el rol activo en sesión. Ítems diferenciados por perfil, submenús colapsables, indicador de ítem activo y sección de perfil del usuario en la parte inferior.

---

## 3. Límites

### ✅ Dentro del scope

- Sidebar fijo visible en todas las vistas internas (post-login)
- Ítems diferenciados: **Usuario** vs **Profesional**
- Submenú **"Profesionales ▾"** con ítems anidados (diferente contenido por rol)
- Submenú **"Mi perfil ▾"** para el profesional (5 secciones de tabs)
- Logo Trébol en la parte superior del sidebar
- Indicador visual del ítem activo (resaltado)
- Badge de mensajes no leídos junto al ítem "Mensajes"

### ❌ Fuera del scope (No-Gos)

- Versión colapsable/hamburguesa para móvil (módulo de responsividad)
- Notificaciones push en el sidebar
- Acceso al panel de Administrador desde este sidebar

---

## 4. Solución Visible

### Sidebar — Perfil Usuario

| Ítem de menú | Tipo | Destino |
|---|---|---|
| Logo Trébol | Logo clickeable | → `home-usuario.html` |
| **Inicio** | Ítem simple | → `home-usuario.html` |
| **Profesionales ▾** | Submenú colapsable | — |
| &nbsp;&nbsp;&nbsp;↳ Especialistas | Sub-ítem | → `especialistas.html` |
| &nbsp;&nbsp;&nbsp;↳ Psicólogos | Sub-ítem | → `psicologos.html` |
| &nbsp;&nbsp;&nbsp;↳ Mis mentores | Sub-ítem | → `mis-mentores.html` |
| **Mis citas** | Ítem simple | → `citas-usuario.html` |
| **Mensajes** | Ítem con badge | → `mensajes-usuario.html` — badge con conteo de no leídos |
| **Mi perfil** | Ítem simple | → `perfil-usuario.html` |
| **Calendario** | Ítem simple | → `calendario-usuario.html` |

### Sidebar — Perfil Profesional

| Ítem de menú | Tipo | Destino |
|---|---|---|
| Logo Trébol | Logo clickeable | → `home-profesional.html` |
| **Inicio** | Ítem simple | → `home-profesional.html` |
| **Mis eventos** | Ítem simple | → `mis-eventos.html` |
| **Profesionales ▾** | Submenú colapsable | — |
| &nbsp;&nbsp;&nbsp;↳ Especialistas | Sub-ítem | → `especialistas.html` |
| &nbsp;&nbsp;&nbsp;↳ Psicólogos | Sub-ítem | → `psicologos.html` |
| &nbsp;&nbsp;&nbsp;↳ Mis colegas | Sub-ítem | → `mis-colegas.html` |
| **Citas** | Ítem simple | → `citas-profesional.html` |
| **Mensajes** | Ítem con badge | → `mensajes-profesional.html` — badge con conteo de no leídos |
| **Mi perfil ▾** | Submenú colapsable | — |
| &nbsp;&nbsp;&nbsp;↳ Información | Sub-ítem | → `perfil-profesional.html` (Tab 1) |
| &nbsp;&nbsp;&nbsp;↳ Salas | Sub-ítem | → `perfil-profesional.html` (Tab 2 – Salas) |
| &nbsp;&nbsp;&nbsp;↳ Calendario | Sub-ítem | → `perfil-profesional.html` (Tab 3 – Calendario) |
| &nbsp;&nbsp;&nbsp;↳ Citas | Sub-ítem + badge | → `perfil-profesional.html` (Tab 4 – Citas) |
| &nbsp;&nbsp;&nbsp;↳ Indicadores | Sub-ítem | → `perfil-profesional.html` (Tab 5 – KPIs) |

### Convenciones visuales

| Elemento | Estándar |
|---|---|
| Logo | Parte superior del sidebar; siempre visible |
| Ítem activo | Fondo diferenciado + color primario (verde Trébol) |
| Submenús | Se despliegan al hacer clic en el ítem padre; ícono ▾ rota a ▴ |
| Badge Mensajes | Número de mensajes no leídos en círculo rojo; oculto si es 0 |
| Badge Citas (profesional) | Número de citas pendientes de confirmar |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Clic en ítem simple | Navega directamente a la vista destino |
| Clic en ítem con submenú | Colapsa/despliega el submenú |
| Clic en sub-ítem | Navega a la vista destino; marca el ítem padre como activo también |
| Badge Mensajes actualizado | Se recarga el conteo de mensajes no leídos al navegar |

---

## 6. Restricciones

- El sidebar es **exclusivo de vistas internas** (post-login); no aparece en Landing Page, Login ni Registro.
- Los ítems exclusivos de Profesional ("Mis eventos", "Mis colegas", "Mi perfil ▾ submenú") **no son visibles** para el rol Usuario.
- El sidebar se renderiza según el **tipo de perfil en la cookie de sesión**.
- Los sub-ítems de "Mi perfil" del profesional activan el tab correspondiente en `perfil-profesional.html`.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Renderizado por rol | Ítems filtrados según `TipoPerfil` de la cookie de sesión |
| Ítem activo | Resaltado según la URL actual (comparación exacta de ruta) |
| Badge Mensajes | `COUNT(Mensajes no leídos)` del usuario/profesional en sesión |
| Badge Citas (profesional) | `COUNT(Citas con Estado = Pendiente de confirmar)` |
| Submenús | Estado persistente durante la sesión (recordar abierto/cerrado) |

---

## 8. Datos Necesarios

| Dato | Fuente |
|---|---|
| Tipo de perfil activo | Cookie de sesión (`TipoPerfil`: Usuario / Profesional) |
| Ruta activa actual | URL del request actual |
| Conteo mensajes no leídos | `COUNT(Mensajes)` donde `DestinatarioId = sesión` y `Leido = false` |
| Conteo citas pendientes (profesional) | `COUNT(Citas)` donde `ProfesionalId = sesión` y `Estado = Pendiente` |

---

## 9. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Ítems correctos por rol | Un Usuario no ve "Mis eventos" ni "Mis colegas"; un Profesional sí |
| Navegación sin errores | Todos los ítems redirigen a la vista correcta |
| Ítem activo marcado | El ítem de la vista actual siempre aparece resaltado |
| Badge Mensajes correcto | El número refleja los mensajes no leídos reales |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

---

## 1. Problema

Una vez autenticado, el usuario o profesional necesita un punto de navegación central, siempre visible, que le permita moverse entre las secciones de la plataforma de forma clara y eficiente, respetando los permisos de su perfil.

---

## 2. Apetito

**3 a 5 días.**
Componente de navegación lateral fijo, renderizado según el perfil activo en la sesión, con ítems diferenciados por rol.

---

## 3. Límites

### ✅ Dentro del scope

- Menú lateral fijo visible en todas las vistas internas tras iniciar sesión
- Ítems de menú diferenciados por perfil (Usuario / Profesional)
- Submenús para la sección de Profesionales
- Logotipo visible en la parte superior del sidebar
- Indicador visual del ítem activo

### ❌ Fuera del scope (No-Gos)

- Menú colapsable / versión móvil hamburguesa (se define en módulo de responsividad)
- Notificaciones o badges en los ítems del menú (se define en módulo de notificaciones)
- Acceso al panel de Administrador desde este menú

---

## 4. Solución Visible

### Menú — Perfil Usuario

| Ítem de menú | Destino |
|---|---|
| Inicio (Home) | Dashboard principal del usuario |
| Profesionales > Especialistas | Listado de especialistas disponibles |
| Profesionales > Psicólogos | Listado de psicólogos disponibles |
| Profesionales > Mis mentores | Profesionales que el usuario sigue |
| Mis citas | Citas privadas programadas del usuario |
| Mi perfil | Información personal y configuración del usuario |
| Calendario | Visualización de citas agendadas en formato calendario |

### Menú — Perfil Profesional

Incluye todos los ítems del Perfil Usuario más:

| Ítem de menú | Destino |
|---|---|
| Mis eventos | Salas y sesiones creadas por el profesional |

### Convenciones visuales

| Elemento | Estándar |
|---|---|
| Logotipo | Esquina superior del sidebar; siempre visible |
| Ítem activo | Destacado visualmente (color, borde o fondo diferenciado) |
| Submenús | Se despliegan al hacer clic o hover sobre el ítem padre |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Hacer clic en "Inicio" | Navega al Dashboard del perfil activo |
| Hacer clic en "Especialistas" | Navega al listado de especialistas |
| Hacer clic en "Psicólogos" | Navega al listado de psicólogos |
| Hacer clic en "Mis mentores" | Navega al listado de profesionales seguidos |
| Hacer clic en "Mis citas" | Navega a la vista de citas del usuario |
| Hacer clic en "Mi perfil" | Navega a la vista de perfil del usuario |
| Hacer clic en "Calendario" | Navega a la vista de calendario |
| Hacer clic en "Mis eventos" *(solo Profesional)* | Navega a la gestión de salas y eventos del profesional |

---

## 6. Restricciones

- El menú lateral es **exclusivo de vistas internas** (post-login); no aparece en Landing Page, Login ni Registro.
- Los ítems exclusivos del Profesional ("Mis eventos") **no son visibles** para el perfil Usuario.
- El menú se renderiza según el tipo de perfil almacenado en la **cookie de sesión**.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Visibilidad por perfil | Los ítems se filtran según el tipo de sesión (Usuario / Profesional) |
| Ítem activo | El sistema resalta el ítem que corresponde a la vista actual |
| Logotipo | Siempre visible en la parte superior del sidebar |
| Persistencia | El menú permanece visible en todas las vistas internas sin recargarse |

---

## 8. Datos Necesarios

| Dato | Fuente |
|---|---|
| Tipo de perfil activo | Cookie de sesión (TipoPerfil: Usuario / Profesional) |
| Ruta activa actual | URL de la vista actual para resaltar el ítem correspondiente |

---

## 9. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Ítems correctos por perfil | Un Usuario no ve "Mis eventos"; un Profesional sí |
| Navegación sin errores | Todos los ítems redirigen a la vista correcta |
| Ítem activo marcado | El ítem de la vista actual siempre aparece resaltado |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

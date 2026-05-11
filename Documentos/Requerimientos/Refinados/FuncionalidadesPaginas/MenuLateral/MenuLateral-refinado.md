# Menú Lateral (Sidebar) — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 3–5 días

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

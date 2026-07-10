# Trébol — Constitución del Proyecto

Constitución de desarrollo para **Trébol** (PsicologiaIA): plataforma de salud mental en ASP.NET Core MVC con frontend alineado al prototipo HTML y reglas UI/UX del producto.

## Core Principles

### I. Arquitectura en capas (backend)

- El backend sigue la solución **Trebol** en capas: `Trebol.Web` → `Trebol.Domain` / `Trebol.Infrastructure` → `Trebol.Model` / `Trebol.Constants` / `Trebol.Helpers`.
- Los **Controllers** solo orquestan: validación de entrada, autorización, llamada a repositorios/servicios, selección de vista o JSON.
- La lógica de persistencia vive en **repositorios** e **stored procedures** (SQL Server `TrebolDB`); no duplicar reglas de negocio críticas solo en la vista.
- Nuevas dependencias se registran en los contenedores de DI existentes (`DependencyContainer`, `*AccessDependency`).
- Referencia obligatoria: `.agents/skills/dotnet-layered-architecture/SKILL.md`.

### II. Prototipo como fuente visual de verdad

- La carpeta **`Prototipo/`** (HTML estático + `css/styles.css` + `js/app.js`) define layout, jerarquía, copy y patrones de interacción objetivo.
- Antes de crear o refactorizar una vista MVC, identificar el HTML equivalente en `Prototipo/` (mapa: `specs/001-profesional-vistas-prototipo/prototipo-mapa.md`).
- Reutilizar clases y tokens de **`wwwroot/css/trebol.css`** y componentes ya usados en vistas existentes; no introducir frameworks CSS paralelos.
- **Toda funcionalidad nueva** MUST reutilizar los **mismos patrones** ya establecidos en la app: modales (estructura estándar), tablas con paginación, formularios, cards, toasts, badges — ver `reglas-ui-ux-frontend.md` y `.cursor/rules/trebol-datos-reales-y-prueba-visual.mdc`.
- **En conflicto menor con otro documento, prevalece el prototipo** (salvo seguridad); desviaciones mayores se documentan en la spec activa.

### II-b. Decisiones autónomas del agente

- El equipo delega en el agente las **mejores decisiones técnicas y de refinamiento** rutinarias: no pedir confirmación para alinear specs, corregir bugs obvios en alcance, o completar pasos Spec Kit lógicos.
- Preguntar al usuario solo ante bloqueos de entorno, trade-offs de producto irreversibles o ambigüedad que cambie el modelo de negocio.
- Regla Cursor: `.cursor/rules/trebol-prototipo-alineacion.mdc`.

### III. UI/UX obligatorio (es-CO)

- Todo texto visible al usuario: **español de Colombia**, codificación **UTF-8**, sin mojibake (`Ã³`, etc.).
- Prohibido `alert()` / `confirm()` / `prompt()` nativos; usar **modales** y **toasts** según `Documentos/Requerimientos/reglas-ui-ux-frontend.md`.
- Modales: acciones destructivas con retardo en botón confirmar; formularios con datos no se cierran por clic en backdrop; foco atrapado y `Esc` coherente con el tipo de modal.
- Referencia obligatoria: `Documentos/Requerimientos/reglas-ui-ux-frontend.md` (v1.1+).

### IV. Spec-driven antes de implementar (Spec Kit)

- Features no triviales siguen el flujo: **`/speckit-specify`** → **`/speckit-plan`** → **`/speckit-tasks`** → **`/speckit-implement`**.
- Las specs viven bajo el flujo Spec Kit (`.specify/templates/`, artefactos generados por el agente); los requerimientos refinados del producto están en `Documentos/Requerimientos/`.
- Alcance acotado (Shape Up): definir **No-Go** explícitos; evitar rabbit holes listados en reglas UI/UX §14.

### V. Pruebas, datos reales y verificación

- **Política global de implementación**: `.cursor/rules/trebol-datos-reales-y-prueba-visual.mdc` — UI/UX alineada al prototipo, componentes estándar (modales, tablas paginadas, toasts, forms), datos reales desde BD y prueba visual Playwright obligatoria en todo cambio.
- **Prueba visual obligatoria**: tras todo cambio en UI, flujo o integración vista↔backend, ejecutar Playwright en `Test/` y guardar capturas en `Test/screenshots/` antes de dar por cerrado.
- **Datos reales únicamente**: prohibido mock, fixtures embebidos o datos quemados en Controllers/Views/Repositories; toda entidad de negocio viene de `TrebolDB` vía repositorios y SPs. Estados vacíos se muestran con UI real, sin rellenar con datos ficticios.
- **Consistencia de componentes**: modales con formato único (§4 reglas UI); tablas con paginación 10/página; mensajes vía modal o toast según tipo — nunca `alert`/`confirm` nativos.
- Flujos críticos tienen prueba **Playwright** en `Test/` (Node + Chromium); no abrir Gmail en CI local salvo que se pida explícitamente.
- Cuentas y datos de prueba: `Documentos/CuentasPrueba.md`; archivos PDF: `Documentos/ArchivosPrueba/`.
- App de desarrollo: `https://localhost:7072` (`Trebol.Web`, perfil `https`).
- Tras cambios en vistas admin o flujos de registro: ejecutar el script E2E correspondiente antes de dar por cerrado.

### VI. Seguridad y secretos

- **Nunca** commitear contraseñas SMTP, tokens ni `appsettings.Development.json` con secretos reales en repos públicos.
- Admin de pruebas documentado en `CuentasPrueba.md`; SMTP vía `appsettings.Development.json` (local only).
- Validar anti-forgery en POST; autorización por rol (`Usuario`, `Profesional`, `Admin`) en controllers.

## Stack y estructura

| Área | Tecnología / ruta |
|------|-------------------|
| Backend | ASP.NET Core MVC, C#, SQL Server |
| Frontend | Razor + `trebol.css` + `trebol.js` |
| Prototipo | `Prototipo/*.html` |
| E2E | Playwright (`Test/*.js`) |
| Spec Kit | `.specify/`, `.cursor/skills/speckit-*` |
| Requerimientos | `Documentos/Requerimientos/` |
| Planes manuales | `Documentos/PlanEjecucion/Playwright/` |

### Roles y homes

- **Usuario** → `HomeUsuario`
- **Profesional** → `HomeProfesional`
- **Admin** → `Admin/BandejaNotificaciones`

### Flujo profesional (referencia)

Registro → confirmación correo → aprobación admin → uso de módulos (citas, salas, mensajes, directorio, perfil). Diagrama y etapas documentados en `Test/CrearCuentaProfesional.js` y planes Playwright.

## Workflow de desarrollo

1. Leer requerimiento refinado en `Documentos/Requerimientos/Refinados/` si existe.
2. Comparar con prototipo HTML y reglas UI/UX.
3. Spec/plan/tareas (Spec Kit) para cambios amplios o multi-vista.
4. Implementar diff mínimo reutilizando patrones estándar (modal, tabla paginada, toast, forms); respetar convenciones del archivo circundante.
5. Probar con Playwright + captura visual; datos siempre desde BD (sin mocks).
6. No crear commits salvo petición explícita del equipo.

## Governance

- Esta constitución prevalece sobre improvisación del agente cuando haya conflicto.
- En empate: **reglas UI/UX** > **prototipo** > **requerimiento refinado** > **código existente**.
- Enmiendas: editar este archivo y anotar versión/fecha abajo; cambios grandes requieren `/speckit-constitution` o revisión humana.

**Version**: 1.2.1 | **Ratified**: 2026-05-19 | **Last Amended**: 2026-05-20

# Feature Specification: Vistas profesional alineadas al prototipo

**Feature Branch**: `001-profesional-vistas-prototipo`

**Created**: 2026-05-19

**Status**: Draft

**Input**: User description: "Completar y alinear todas las vistas restantes del rol Profesional con los HTML de referencia en Prototipo/, respetando reglas UI/UX (es-CO, modales, toasts) y requerimientos refinados existentes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Perfil profesional unificado con pestañas (Priority: P1)

Como **profesional autenticado**, quiero gestionar mi información, salas, calendario, citas e indicadores desde **un solo perfil con pestañas**, como en el prototipo `perfil-profesional.html`, para no saltar entre pantallas dispersas.

**Why this priority**: Es el mayor hueco funcional respecto al prototipo; hoy solo existe el formulario de información personal sin la barra de tabs ni las cuatro secciones restantes.

**Independent Test**: Iniciar sesión como profesional activo, abrir Mi perfil, navegar las cinco pestañas y verificar que cada una muestra contenido coherente con su HTML de referencia (`perfil-profesional.html`, `perfil-pro-salas.html`, `perfil-pro-calendario.html`, `perfil-pro-citas.html`, `perfil-pro-kpi.html`).

**Acceptance Scenarios**:

1. **Given** un profesional con sesión iniciada, **When** abre Mi perfil, **Then** ve la barra de pestañas con: Información personal, Salas y eventos, Calendario, Citas (con conteo si hay pendientes), Indicadores.
2. **Given** está en Información personal, **When** edita datos permitidos y guarda, **Then** recibe confirmación visible (toast o modal de éxito, no alert nativo) y los cambios persisten.
3. **Given** está en la pestaña Citas, **When** revisa la lista, **Then** ve sus citas con estados comprensibles y acciones acordes al prototipo (ver, confirmar/cancelar según estado).
4. **Given** está en Indicadores, **When** carga la pestaña, **Then** ve métricas resumidas de actividad (citas, eventos, ingresos o equivalentes definidos en requerimiento refinado), aunque algunos valores puedan ser cero.

---

### User Story 2 - Directorio de colegas y especialistas operativo (Priority: P1)

Como **profesional**, quiero explorar Especialistas, Psicólogos y Mis colegas desde el submenú lateral, como en `especialistas.html`, `psicologos.html` y `mis-colegas.html`, para descubrir y relacionarme con otros profesionales.

**Why this priority**: Dos de las tres rutas del directorio fallan hoy; el menú lateral ya promete esta funcionalidad.

**Independent Test**: Tras login profesional, abrir cada submenú Profesionales → Especialistas / Psicólogos / Mis colegas; cada pantalla carga sin error y muestra listado o estado vacío amigable.

**Acceptance Scenarios**:

1. **Given** un profesional autenticado, **When** navega a Especialistas, **Then** la página carga correctamente con filtros y listado (o mensaje vacío), sin pantalla de error.
2. **Given** un profesional autenticado, **When** navega a Psicólogos, **Then** ocurre lo mismo con criterios propios de psicólogos verificados.
3. **Given** un profesional autenticado, **When** navega a Mis colegas, **Then** ve colegas agregados o un mensaje claro para agregar desde el directorio.
4. **Given** aplica filtros o búsqueda, **When** envía el formulario, **Then** la lista se actualiza sin perder el contexto de navegación.

---

### User Story 3 - Inicio profesional como panel de control (Priority: P2)

Como **profesional**, quiero un **inicio** que resuma citas del día, eventos activos y accesos rápidos, alineado a `home-profesional.html`, para orientarme al entrar a la plataforma.

**Why this priority**: El home ya tiene estructura parcial; falta paridad visual y de enlaces con el prototipo (KPIs, paneles, acciones rápidas).

**Independent Test**: Login → Inicio; verificar presencia de resumen de citas, eventos y enlaces a Citas, Mensajes y perfil; captura comparable al prototipo en layout de dos columnas donde aplique.

**Acceptance Scenarios**:

1. **Given** un profesional con citas próximas, **When** abre Inicio, **Then** ve al menos las citas más relevantes del periodo mostrado en el prototipo.
2. **Given** tiene salas o eventos activos, **When** revisa el panel correspondiente, **Then** puede ir a gestionarlos con un clic.
3. **Given** no tiene actividad reciente, **When** abre Inicio, **Then** ve estados vacíos claros, no paneles rotos.

---

### User Story 4 - Salas de cita y conferencia (Priority: P2)

Como **profesional**, quiero **ingresar a una cita privada** y **gestionar una sala de conferencia** con interfaces dedicadas (`sala-profesional.html`, `sala-conferencia-profesional.html`), para atender pacientes y eventos en vivo.

**Why this priority**: Son flujos críticos del producto citados en requerimientos refinados pero aún no expuestos como vistas completas para el rol profesional.

**Independent Test**: Desde una cita confirmada del día (o dato de prueba), usar Ingresar → sala de cita; desde Mis eventos o Salas, abrir gestión de conferencia.

**Acceptance Scenarios**:

1. **Given** una cita en estado que permite ingreso, **When** el profesional pulsa Ingresar, **Then** accede a la vista de sala con video/chat según diseño prototipo.
2. **Given** una sala de conferencia activa propia, **When** abre Gestionar, **Then** ve controles de sala alineados al prototipo de conferencia profesional.
3. **Given** intenta ingresar fuera de ventana permitida, **When** pulsa Ingresar, **Then** recibe mensaje claro (modal o toast) sin romper la sesión.

---

### User Story 5 - Perfil público del orador (Priority: P3)

Como **profesional**, quiero que pacientes y colegas vean mi **perfil público de orador** (`perfil-orador.html`, `orador-calendario.html`, `orador-salas.html`, `orador-comentarios.html`) con salas, calendario público y comentarios, para darme a conocer e inscribir participantes.

**Why this priority**: Existe base en PerfilOrador pero no paridad con el conjunto de pantallas orador del prototipo.

**Independent Test**: Abrir perfil orador público del profesional de prueba; navegar subvistas equivalentes; verificar coherencia con prototipo.

**Acceptance Scenarios**:

1. **Given** un visitante o usuario autenticado, **When** abre el perfil orador de un profesional activo, **Then** ve nombre, especialidad, foto y salas disponibles.
2. **Given** el profesional dueño del perfil, **When** accede a Mis salas (orador), **Then** puede revisar el mismo contenido desde su sesión.

---

### User Story 6 - Recorrido E2E de todas las vistas del menú (Priority: P2)

Como **equipo de producto**, quiero un **recorrido automatizado** que visite todas las rutas del menú profesional y las compare con prototipo, para detectar regresiones.

**Why this priority**: Ya existe script parcial; debe cubrir el menú completo y reportar fallos.

**Independent Test**: Ejecutar `Test/VistasProfesional.js` tras los cambios; todas las rutas del menú lateral responden OK; capturas en `Test/screenshots/vistas-profesional/`.

**Acceptance Scenarios**:

1. **Given** un profesional ACTIVO en entorno de prueba, **When** corre el script E2E, **Then** login y navegación por Inicio, Mis eventos, directorio (×3), Mi perfil, Citas y Mensajes terminan sin error HTTP.
2. **Given** rutas adicionales acordadas (Salas, Calendario, perfil orador), **When** el script las incluye, **Then** también pasan o quedan documentadas como fuera de alcance explícito.

---

### Edge Cases

- Profesional sin citas, salas ni colegas: cada vista muestra **estado vacío** con copy en español Colombia, no error técnico.
- Profesional recién aprobado: Inicio y perfil cargan aunque KPIs sean cero.
- Directorio sin resultados de búsqueda: mensaje “sin coincidencias”, no tabla rota.
- Sesión expirada al navegar: redirección a login con mensaje comprensible.
- Textos con tildes y ñ en toda la UI; prohibido mojibake en etiquetas y mensajes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El rol Profesional MUST tener acceso a todas las entradas del menú lateral definidas en `Prototipo/home-profesional.html` (Inicio, Mis eventos, Profesionales con tres subítems, Mi perfil, Citas, Mensajes).
- **FR-002**: Mi perfil MUST implementar **cinco pestañas** equivalentes al prototipo y al documento refinado `PerfilProfesional-refinado.md`.
- **FR-003**: Especialistas y Psicólogos MUST cargar listados funcionales (corrección del fallo actual que impide usar esas pantallas).
- **FR-004**: Todas las interacciones de confirmación, error y éxito MUST usar **modales y toasts** según `Documentos/Requerimientos/reglas-ui-ux-frontend.md`; prohibidos diálogos nativos del navegador.
- **FR-005**: Copy visible MUST estar en **español de Colombia (UTF-8)** con ortografía correcta.
- **FR-006**: Layout, jerarquía visual y componentes MUST tomar como referencia los HTML en `Prototipo/`; mapa de trazabilidad en `specs/001-profesional-vistas-prototipo/prototipo-mapa.md`. En duda, **prevalece el prototipo** sobre interpretaciones ad hoc.
- **FR-007**: Inicio profesional MUST presentar resumen de citas y eventos con enlaces a las vistas detalladas, según `HomeProfesional-refinado.md`.
- **FR-008**: MUST existir vistas de **sala de cita privada** y **sala de conferencia** accesibles desde los puntos de entrada definidos en prototipo (citas activas, gestión de eventos).
- **FR-009**: Perfil orador público MUST ser visible para terceros y coherente con las pantallas `perfil-orador.html` y relacionadas.
- **FR-010**: MUST mantenerse un script E2E que recorra las rutas del menú profesional y genere evidencia (capturas) tras cada entrega mayor.

### Key Entities

- **Profesional**: Usuario verificado que ofrece citas y eventos; estados relevantes ACTIVO, PENDIENTE_APROBACION, etc.
- **Cita**: Sesión privada profesional–paciente; estados Pendiente, Confirmada, Cancelada, Completada.
- **Sala / Evento**: Conferencia o espacio grupal; puede estar activa, programada o cerrada.
- **Colega / Seguimiento**: Relación entre profesionales en el directorio.
- **Conversación / Mensaje**: Hilo asíncrono con pacientes (alias, no nombre real donde aplique).
- **Indicadores (KPI)**: Métricas agregadas de citas, eventos e ingresos del profesional.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un profesional activo puede abrir **las 8 entradas del menú lateral** (incluidos 3 subítems de Profesionales) en menos de **5 minutos** sin encontrar pantallas de error.
- **SC-002**: **100 %** de las pestañas del perfil profesional son navegables y muestran contenido o estado vacío válido en prueba con cuenta de demostración.
- **SC-003**: El recorrido E2E automatizado del menú profesional pasa **sin fallos** en entorno local estándar (`https://localhost:7072`).
- **SC-004**: En revisión UX, al menos **90 %** de los bloques principales de cada vista tienen correspondencia visual clara con su HTML en `Prototipo/` (misma jerarquía: sidebar, título, paneles, acciones).
- **SC-005**: Cero usos de `alert`, `confirm` o `prompt` nativos en las vistas incluidas en este alcance.

## Assumptions

- El flujo de **registro, confirmación de correo y aprobación admin** ya está implementado y probado; fuera de alcance salvo regresiones.
- **Admin** y **Usuario** no se modifican en esta feature salvo rutas compartidas (p. ej. PerfilOrador público).
- Datos de prueba: `Documentos/CuentasPrueba.md`, PDFs en `Documentos/ArchivosPrueba/`, scripts en `Test/`.
- KPIs pueden mostrar ceros si no hay historial; no se exige integración de pagos en vivo para cerrar la pestaña Indicadores v1.
- Gmail no se usa en pruebas automatizadas; confirmaciones por token BD o Yopmail solo donde ya esté definido.
- Requerimientos refinados en `Documentos/Requerimientos/Refinados/FuncionalidadesPaginas/` prevalecen sobre detalles no dibujados en prototipo cuando hay conflicto menor.

## Out of Scope

- Rediseño de landing pública o flujos de registro.
- App móvil nativa o PWA offline.
- Integración de videollamada real (WebRTC proveedor); v1 puede usar layout fiel al prototipo con placeholders documentados si el backend de media no está listo.
- Bandeja admin y aprobación de profesionales (ya cubiertos en ciclo anterior).

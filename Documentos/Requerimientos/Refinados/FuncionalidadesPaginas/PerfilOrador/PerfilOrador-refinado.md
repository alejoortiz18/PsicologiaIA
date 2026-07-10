# Perfil del Orador (Profesional Público) — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1–2 semanas

---

## 1. Problema

Los usuarios necesitan conocer en detalle a los profesionales de la plataforma para tomar decisiones informadas sobre a quién seguir, con quién inscribirse a un evento, a quién contactar o en quién confiar para una cita. El perfil público es la carta de presentación completa del profesional.

---

## 2. Apetito

**1 a 2 semanas.**
Vista de perfil público con header destacado, 4 tabs cross-page (Cuenta / Salas / Comentarios / Calendario), botones de seguimiento y mensajería, y modal de agendamiento de cita.

---

## 3. Límites

### ✅ Dentro del scope

- Header del perfil: avatar, nombre, badge "Verificada", stats, botones de acción
- **Tab 1 — Cuenta:** bio, cómo trabajo, idiomas, experiencia, formación (`perfil-orador.html`)
- **Tab 2 — Salas** (badge con conteo): grid de salas + modal Detalle (`orador-salas.html`)
- **Tab 3 — Comentarios:** score 4.9/5, distribución, feed, formulario (`orador-comentarios.html`)
- **Tab 4 — Calendario:** grilla semanal + modal de agendamiento de cita (`orador-calendario.html`)
- Botón **[+ Seguir / ✓ Siguiendo]** toggle
- Botón **[💬 Mensaje]** → `mensajes-usuario.html`

### ❌ Fuera del scope (No-Gos)

- Edición del perfil desde esta vista (corresponde a `PerfilProfesional` propio)
- Proceso de inscripción a sala completo (corresponde a `InscripcionPago`)
- Mensajería directa completa (corresponde al módulo de mensajería)

---

## 4. Solución Visible

### Header del perfil

| Elemento | Descripción |
|---|---|
| Avatar grande | Foto circular del profesional (tamaño prominente) |
| Nombre completo | Nombre del profesional |
| Badge **"Verificada/o"** | Insignia verde — solo si el profesional está verificado por COLPSIC |
| Estadísticas inline | `1248 seguidores · 28 salas · 12 años de experiencia` |
| Botón **[+ Seguir]** | Verde outline; al seguir cambia a **[✓ Siguiendo]** (toggle) |
| Botón **[💬 Mensaje]** | → `mensajes-usuario.html` con la conversación con este profesional |

### Navegación de 4 tabs (cross-page)

| Tab | Archivo | Badge |
|---|---|---|
| **Cuenta** | `perfil-orador.html` | — |
| **Salas** | `orador-salas.html` | Número de salas activas (ej: `28`) |
| **Comentarios** | `orador-comentarios.html` | — |
| **Calendario** | `orador-calendario.html` | — |

---

### Tab 1 — Cuenta (`perfil-orador.html`)

| Sección | Campos |
|---|---|
| **Bio** | Texto libre de presentación personal |
| **Cómo trabajo** | Metodología terapéutica o enfoque de trabajo |
| **Idiomas** | Lista de idiomas que habla el profesional |
| **Experiencia** | Años de experiencia en la profesión + resumen de trayectoria |
| **Formación** | Pregrado y posgrado: título · universidad · año de egreso |

---

### Tab 2 — Salas (`orador-salas.html`)

#### Strip de estadísticas de salas

| Tarjeta | Descripción |
|---|---|
| Total salas | Número total de salas creadas |
| Abiertas | Salas con estado Abierta |
| Próximas | Salas con evento futuro |
| Completadas | Salas con eventos pasados |

#### Grid de cards de sala (4 por fila)

| Campo | Descripción |
|---|---|
| Nombre de la sala | Título principal |
| Estado | Badge: Abierta (verde) / Cerrada (gris) / En vivo (rojo pulsante) |
| Asistentes inscritos | `X / Y cupos` |
| Precio | `$XX.000 COP` o "Entrada libre" |
| Botón **[Detalle]** | Abre modal `DetalleSala` (título, descripción, fecha, cupos, precio, 4 últimos comentarios, [Ingresar/Registrarse]) |
| Botón **[Inscribirse]** | → `inscripcion-pago.html` (si hay cupos) |

---

### Tab 3 — Comentarios (`orador-comentarios.html`)

#### Resumen de valoraciones

| Elemento | Descripción |
|---|---|
| Score general | `4.9 / 5` (número grande prominente) |
| Total valoraciones | `134 valoraciones` |
| Distribución por estrellas | Barras de progreso: ⭐⭐⭐⭐⭐ → ⭐ con porcentaje y conteo |

#### Feed de comentarios

| Elemento | Descripción |
|---|---|
| Avatar del autor | Foto o inicial del comentarista |
| Alias del autor | Nombre anónimo (alias) — nunca nombre real visible para otros usuarios |
| Estrellas del comentario | Rating individual (1–5) |
| Texto del comentario | Contenido del comentario |
| Fecha | `DD MMM YYYY` |
| Respuesta del profesional | Sub-comentario indentado debajo del comentario original |
| Botón **[Responder]** | Solo visible para el profesional dueño del perfil |

#### Formulario de nuevo comentario (usuarios autenticados)

| Campo | Descripción |
|---|---|
| Rating con estrellas | Selección interactiva de 1 a 5 estrellas |
| Textarea | Texto del comentario (mínimo 20 caracteres) |
| Botón **[Publicar comentario]** | Envía el comentario → aparece en el feed |

---

### Tab 4 — Calendario (`orador-calendario.html`)

#### Toolbar de navegación

| Elemento | Descripción |
|---|---|
| Botón **[Hoy]** | Navega a la semana actual |
| Botones **[‹] [›]** | Navega semana anterior / siguiente |
| Título semana | `"12–18 May 2026"` |

#### Leyenda de colores

| Color | Significado |
|---|---|
| Verde | Horario disponible para agendar |
| Gris | No disponible / bloqueado |
| Rosa/Morado | Ya ocupado (cita existente) |

#### Grilla semanal

| Elemento | Descripción |
|---|---|
| Columnas | Lun · Mar · Mié · Jue · Vie · Sáb · Dom |
| Filas | Horas de 8:00 AM a 9:00 PM en bloques de 1 hora |
| Bloque disponible | Verde clickeable; al hacer clic abre modal de agendamiento |
| Bloque bloqueado | Gris; no clickeable |
| Bloque ocupado | Rosa; al hacer clic muestra info de la cita sin detalle del paciente |

#### Modal de agendamiento de cita (al clic en bloque disponible)

| Elemento | Descripción |
|---|---|
| Título | "Agendar cita con [Nombre profesional]" |
| Fecha y hora | Precargadas del bloque seleccionado |
| Selector **Tipo de sesión** | Psicológica / Asesoría puntual |
| Campo **Motivo de consulta** | Textarea opcional |
| Desglose de precio | Tarifa base: `$XX.000 COP` + Cargo de servicio: `$5.000 COP` = Total: `$XX.000 COP` |
| Botón **[Continuar al pago]** | → `pago-cita.html` con datos precargados |
| Botón **[Cancelar]** | Cierra el modal sin agendar |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Clic **[+ Seguir]** | Sigue al profesional; contador +1; botón → **[✓ Siguiendo]** |
| Clic **[✓ Siguiendo]** | Modal de confirmación "¿Dejar de seguir?"; al confirmar: contador -1 |
| Clic **[💬 Mensaje]** | → `mensajes-usuario.html` |
| Cambiar tab | Navega a la página del tab correspondiente |
| Clic **[Detalle]** en sala | Abre modal de DetalleSala |
| Clic **[Inscribirse]** en sala | → `inscripcion-pago.html` |
| Publicar comentario | Comentario aparece en el feed |
| Clic en bloque verde (calendario) | Abre modal de agendamiento |
| Clic **[Continuar al pago]** | → `pago-cita.html` |

---

## 6. Restricciones

- Esta vista es de **solo lectura** para los usuarios; no pueden editar el perfil del profesional.
- El botón **[+ Seguir]** solo está disponible para usuarios autenticados.
- Los autores de comentarios son **anónimos para otros usuarios** (solo el profesional ve quién comentó).
- Solo el **profesional dueño del perfil** puede responder comentarios.
- Los bloques del calendario solo son clickeables si tienen estado **Disponible**.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Seguimiento único | Un usuario no puede seguir al mismo profesional dos veces |
| Anonimato en comentarios | Otros usuarios ven solo alias; el profesional ve el nombre completo |
| Solo el profesional responde | Los usuarios no pueden responder entre sí en el perfil del orador |
| Rating | Promedio de todos los comentarios con rating numérico (`AVG(Rating)`) |
| Precio cita | `Tarifa base del profesional + $5.000 COP tarifa de servicio` |
| Badge Salas | `COUNT(Salas)` donde `ProfesionalId` y `Estado = Abierta` |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Comentarios inapropiados | El profesional puede reportarlos; moderación en módulo Admin |
| Tabs con carga lenta | Carga lazy de cada tab; caché por profesionalId |
| Contador seguidores desactualizado | Actualización inmediata en tiempo real tras la acción |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Datos del perfil | `Profesionales.*` |
| Seguidores | `COUNT(Seguidores)` donde `ProfesionalId` |
| Estado de seguimiento del usuario | `Seguidores` (UsuarioId + ProfesionalId) |
| Salas del profesional | `Salas` (ProfesionalId) + `Eventos` |
| Comentarios | `ComentariosProfesional` (ProfesionalId, Rating, Texto, Fecha) |
| Horarios del calendario | `HorariosDisponibles` + `HorariosBlockeados` + `Citas` (ProfesionalId) |
| Tarifa del profesional | `Profesionales.TarifaHora` |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Header correcto | Stats (seguidores, salas, años) muestran datos reales |
| Tabs funcionales | Los 4 tabs cargan su contenido sin errores |
| Toggle Seguir actualizado | El contador cambia inmediatamente tras la acción |
| Modal agendamiento completo | Precio desglosado visible; botón navega a pago-cita |
| Comentarios anónimos | Otros usuarios no ven el nombre real del autor |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

---

## 1. Problema

Los usuarios necesitan conocer en detalle a los profesionales de la plataforma para tomar decisiones informadas sobre a quién seguir, con quién inscribirse o a quién contactar. El perfil público es la carta de presentación del profesional.

---

## 2. Apetito

**1 a 2 semanas.**
Vista de perfil público del profesional organizada en tres tabs: información de la cuenta, salas creadas y comentarios recibidos.

---

## 3. Límites

### ✅ Dentro del scope

- Tab 1: Información del perfil del profesional
- Tab 2: Salas creadas por el profesional con acceso al historial de mensajes
- Tab 3: Comentarios al profesional con lógica de visibilidad por rol
- Botón seguir / dejar de seguir
- Botón contactar (solo visible para el profesional en la sección de comentarios)

### ❌ Fuera del scope (No-Gos)

- Edición del perfil desde esta vista (corresponde al módulo `PerfilProfesional` propio)
- Proceso de inscripción a sala (corresponde al módulo `InscripcionPago`)
- Mensajería directa completa (corresponde al módulo de mensajería)

---

## 4. Solución Visible

### Tab 1 — Cuenta del Profesional

| Campo | Descripción |
|---|---|
| Foto de perfil | Imagen del profesional |
| Nombre o alias | Nombre público del profesional |
| Descripción personal | Texto libre de presentación |
| Idiomas | Idiomas que habla el profesional |
| Seguidores | Número de usuarios que lo siguen |
| Botón seguir / dejar de seguir | Acción inmediata con actualización del contador |
| Sobre mí | Texto libre del profesional |
| Cómo trabajo | Metodología o enfoque terapéutico |
| Experiencia | Años de experiencia en la profesión |
| Estudios | Pregrado y posgrado |

### Tab 2 — Salas Creadas

Galería de tarjetas con:

| Campo | Descripción |
|---|---|
| Nombre de la sala | — |
| Estado | Abierta / Cerrada |
| Precios | Monto de inscripción o "Entrada libre" |
| Botón "Detalle" | Abre un **modal** con los **10 últimos mensajes** del evento |

**Modal de mensajes:**
- Muestra los 10 mensajes más recientes del evento
- Botón "Ver más" dentro del modal: abre una página completa con **todos los mensajes**
- La página completa muestra los mensajes en **tabla paginada (10 por página)**
- En esa página, el usuario puede **actualizar, agregar o eliminar únicamente sus propios mensajes**

### Tab 3 — Comentarios al Profesional

| Elemento | Descripción |
|---|---|
| Comentarios del usuario logueado | Se muestran a la **derecha en azul** |
| Comentarios de otros usuarios | Se muestran a la **izquierda en gris** |
| Respuestas del profesional | Se muestran como **subcomentarios** debajo del comentario original |

**Visibilidad de comentarios según el rol:**

| Quien los ve | Información visible |
|---|---|
| El profesional | Autor del comentario, fecha `DD MMM YYYY`, hora `H[MM]AM/PM`, botón "Contactar" |
| Otros usuarios | Solo el mensaje y la fecha/hora (sin nombre del autor) |

**Restricciones del sistema de comentarios:**
- Solo el **profesional** puede responder los comentarios de su propio perfil.
- Los usuarios **no reciben comentarios** en su perfil; esta funcionalidad es exclusiva del perfil profesional.

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Cambiar de tab | Muestra el contenido del tab seleccionado |
| Hacer clic en "Seguir" | El profesional suma un seguidor; el botón cambia a "Dejar de seguir" |
| Hacer clic en "Dejar de seguir" | El profesional pierde un seguidor; el botón cambia a "Seguir" |
| Hacer clic en "Detalle" en una sala | Abre modal con los últimos 10 mensajes del evento |
| Hacer clic en "Ver más" en el modal | Abre la página completa de mensajes (paginada, 10 por página) |
| Dejar un comentario | El comentario aparece a la derecha en azul (propio) |
| *Solo profesional:* Hacer clic en "Contactar" | Inicia la conversación con el usuario que comentó |
| *Solo profesional:* Responder un comentario | La respuesta aparece como subcomentario |

---

## 6. Restricciones

- Esta vista es de **solo lectura** para el rol Usuario (no puede editar datos del profesional).
- El botón "Seguir / Dejar de seguir" está disponible solo para usuarios autenticados.
- La identidad del autor de los comentarios es **anónima para otros usuarios** (solo visible para el profesional).
- Los comentarios son una funcionalidad **exclusiva del perfil Profesional**; el perfil Usuario no tiene sección de comentarios públicos.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Seguimiento | Un usuario solo puede seguir a un profesional una vez (no duplicar) |
| Comentarios propios | Se muestran a la derecha en azul para diferenciarse visualmente |
| Anonimato de comentarios | Otros usuarios no ven quién escribió un comentario |
| Solo el profesional responde | Los usuarios no pueden responder comentarios de otros usuarios |
| Modal de mensajes | Muestra los **10 mensajes más recientes** del evento |
| Página completa de mensajes | Paginación de **10 mensajes por página** |
| Edición de mensajes | El usuario solo puede editar o eliminar **sus propios mensajes** |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Comentarios inapropiados | El profesional puede reportarlos; el módulo de moderación se encarga (fuera de este scope) |
| Carga lenta de tabs con muchos datos | Cargar cada tab de forma lazy (solo cuando se selecciona) |
| Contador de seguidores desactualizado | Actualizar el contador en tiempo real o refrescar al hacer la acción |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Datos del perfil | `Profesionales.*` |
| Número de seguidores | `Seguidores` (COUNT por ProfesionalId) |
| Estado de seguimiento del usuario logueado | `Seguidores` (UsuarioId + ProfesionalId) |
| Idiomas | `ProfesionalesIdiomas` |
| Estudios | `ProfesionalesEstudios` |
| Salas creadas | `Salas` (ProfesionalId) + `Eventos` |
| Mensajes del evento | `MensajesEvento` (EventoId, ordenado por Fecha DESC) |
| Comentarios al profesional | `ComentariosProfesional` (ProfesionalId) |
| Autor del comentario | `Usuarios.NombreCompleto` (solo visible para el Profesional) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Tabs cargan correctamente | Cada tab muestra su contenido sin errores |
| Seguir / dejar de seguir actualizado | El contador de seguidores cambia inmediatamente tras la acción |
| Comentarios propios diferenciados | Los comentarios del usuario logueado aparecen en azul a la derecha |
| Modal de mensajes funcional | Muestra los 10 últimos mensajes al hacer clic en "Detalle" |
| Anonimato respetado | Otros usuarios no ven el nombre del autor de comentarios |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

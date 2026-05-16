# Perfil del Usuario — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1 semana

---

## 1. Problema

El usuario necesita un espacio centralizado donde pueda ver su información de cuenta, actualizar los campos editables (alias y celular), revisar los eventos en los que está inscrito y consultar sus próximas citas privadas desde una vista unificada.

---

## 2. Apetito

**1 semana.**
Vista de perfil con header editable, formulario con campos mixtos (editables / no editables), modal de confirmación al guardar, y 2 tabs: Eventos inscritos | Próximas citas.

---

## 3. Límites

### ✅ Dentro del scope

- Header: avatar editable + nombre + alias público "@alias"
- Formulario con campos no editables (nombre, email, cédula) + editables (alias, celular)
- Botón **[Guardar cambios]** con modal de confirmación
- **Tab 1 — Eventos inscritos:** tabla de 7 eventos con paginación
- **Tab 2 — Próximas citas:** tabla de citas con botón **[Ingresar]**

### ❌ Fuera del scope (No-Gos)

- Historial de pagos (módulo financiero del usuario)
- Cambio de contraseña desde el perfil (módulo de seguridad)
- Gestión de privacidad avanzada
- Subida de documentos (exclusivo del Profesional)

---

## 4. Solución Visible

### Header del perfil

| Elemento | Descripción |
|---|---|
| Avatar circular | Foto del usuario; ícono de edición ✏️ sobre la imagen |
| Al clic en avatar | Abre selector de archivo (formatos JPG/PNG, máx. 2 MB) |
| Nombre completo | Mostrado debajo del avatar (no editable directamente en el header) |
| Alias público | `@luna-verde` — nombre visible en la plataforma; editable en el formulario |

### Formulario de datos personales

| Campo | Editable | Justificación |
|---|---|---|
| Nombre completo | ❌ No | Dato de identidad; solo cambia por proceso administrativo |
| Correo electrónico | ❌ No | Identificador de cuenta |
| Número de cédula | ❌ No | Documento de identidad |
| Alias (@seudónimo) | ✅ Sí | Nombre público elegido por el usuario |
| Número de celular | ✅ Sí | Contacto editable |

> Los campos no editables se muestran con fondo gris y sin borde de enfoque.

### Botón de guardado

| Elemento | Descripción |
|---|---|
| Botón **[Guardar cambios]** | CTA verde; activo solo si hay cambios pendientes |
| **Modal de confirmación** | "¿Guardar los cambios en tu perfil?" + [Confirmar] + [Cancelar] |
| **Modal de éxito** | "¡Perfil actualizado correctamente!" + [Aceptar] |

---

### Tab 1 — Eventos inscritos

| Columna | Descripción |
|---|---|
| **Evento** | Nombre del evento / sala |
| **Orador** | Avatar + nombre del profesional |
| **Fecha** | `DD MMM YYYY` |
| **Hora** | Formato 12H (ej: `3PM`) |
| **Estado inscripción** | Badge: Confirmada (verde) / Cancelada (rojo) / Pendiente de pago (amarillo) |
| **Acciones** | Botón **[Ver detalle]** → modal de DetalleSala |

Muestra hasta **7 eventos por página** con paginación. Si no hay eventos: "No tienes eventos inscritos. [Explorar eventos]"

---

### Tab 2 — Próximas citas

| Columna | Descripción |
|---|---|
| **Profesional** | Avatar + nombre del profesional |
| **Tipo** | Psicológica / Asesoría puntual |
| **Fecha** | `DD MMM YYYY` |
| **Hora** | Formato 12H |
| **Estado** | Badge: Programada (verde) / Cancelada (rojo) / Movida (amarillo) |
| **Acciones** | Botón **[Ingresar]** (solo el día de la cita) → `sala-usuario.html` |

Muestra hasta **10 citas por página**. Si no hay citas: "No tienes citas próximas. [Agendar cita]"

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Clic en avatar | Abre selector de archivo para cambiar foto |
| Editar alias o celular | Campos se vuelven activos para edición |
| Clic **[Guardar cambios]** | Abre modal de confirmación |
| Confirmar en modal | Datos actualizados; modal de éxito |
| Navegar al Tab Eventos | Muestra tabla de eventos inscritos |
| Navegar al Tab Citas | Muestra tabla de próximas citas |
| Clic **[Ingresar]** en cita del día | Navega a `sala-usuario.html` |
| Clic **[Ver detalle]** en evento | Abre modal de `DetalleSala` |
| Navegar páginas en tab | Paginación (7 eventos / 10 citas por página) |

---

## 6. Restricciones

- Nombre, correo y cédula son **inmutables** desde esta vista; fondo gris sin interacción.
- La foto de perfil acepta formatos **JPG/PNG** con tamaño máximo de **2 MB**.
- El botón **[Guardar cambios]** solo se habilita cuando hay **cambios reales** en los campos editables.
- El botón **[Ingresar]** solo es visible y activo el **día de la cita** (validado con fecha del servidor).
- Los tabs se muestran siempre; si no hay datos, se muestra un mensaje vacío con CTA.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Campos inmutables | Nombre, correo, cédula: solo legibles |
| Alias | Puede modificarse libremente; debe ser único en la plataforma |
| Confirmación de cambios | Doble confirmación: modal de confirmación + modal de éxito |
| Tab Eventos | `Inscripciones` (UsuarioId, Estado = cualquiera) + `Salas` + `Eventos` |
| Tab Citas | `Citas` (UsuarioId, Estado = Programada, FechaHora >= Hoy) |
| Botón "Ingresar" | Solo activo si `fecha_servidor == fecha_cita` |
| Paginación | 7 por página en Tab Eventos; 10 en Tab Citas |
| Formato fechas | `DD MMM YYYY` |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Alias duplicado al editar | Validación de unicidad en backend antes de guardar |
| Foto muy pesada | Límite de 2 MB + redimensionamiento automático en el servidor |
| Usuario sin eventos/citas ve tabs vacíos | Mostrar mensaje amigable con CTA para explorar |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Nombre completo | `Usuarios.NombreCompleto` (solo lectura) |
| Correo electrónico | `Usuarios.Correo` (solo lectura) |
| Número de cédula | `Usuarios.NumeroDocumento` (solo lectura) |
| Alias | `Usuarios.Alias` (editable, único) |
| Celular | `Usuarios.Celular` (editable) |
| Foto de perfil | `Usuarios.FotoPerfil` (editable) |
| Eventos inscritos | `Inscripciones` (UsuarioId) + `Salas` + `Profesionales` |
| Próximas citas | `Citas` (UsuarioId, Estado = Programada, FechaHora >= Hoy) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Edición exitosa | Alias y celular se guardan correctamente; modal de éxito visible |
| Campos inmutables protegidos | No es posible editar nombre, correo ni cédula |
| Tab Eventos correcto | Muestra los eventos inscritos del usuario |
| Tab Citas correcto | Muestra próximas citas con botón [Ingresar] condicional |
| Paginación correcta | 7 eventos / 10 citas por página |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

---

## 1. Problema

El usuario necesita un espacio centralizado donde pueda ver y actualizar su información personal, revisar los eventos públicos en los que se ha registrado y consultar sus próximas citas privadas.

---

## 2. Apetito

**1 semana.**
Vista de perfil con formulario editable de datos personales, tab de eventos públicos inscritos y tab de próximas citas privadas.

---

## 3. Límites

### ✅ Dentro del scope

- Formulario editable de datos personales del usuario
- Tab de eventos públicos en los que está inscrito
- Tab de próximas citas privadas
- Actualización de datos con confirmación en **modal**

### ❌ Fuera del scope (No-Gos)

- Historial de pagos (corresponde al módulo financiero del usuario)
- Gestión de privacidad y alias (puede definirse como módulo independiente)
- Cambio de contraseña desde el perfil (puede corresponder al módulo de seguridad)
- Subir documentos (exclusivo del Profesional)

---

## 4. Solución Visible

### Formulario de datos personales

| Campo | ¿Editable? |
|---|---|
| Nombre completo | No |
| Correo electrónico | No |
| Número de identificación | No |
| Alias (seudónimo) | Sí |
| Número de celular | Sí |
| Foto de perfil | Sí |

> Los campos Nombre, Correo y Número de identificación son de **solo lectura** para garantizar la integridad de la cuenta.

### Tab — Eventos públicos

| Campo | Descripción |
|---|---|
| Nombre del evento | — |
| Nombre del profesional / orador | — |
| Fecha de inicio | `DD MMM YYYY` |
| Hora | Formato 12H |
| Estado de inscripción | Confirmada / Cancelada / Pendiente de pago |

### Tab — Próximas citas

| Campo | Descripción |
|---|---|
| Nombre del profesional | — |
| Fecha de la cita | `DD MMM YYYY` |
| Hora | Formato 12H |
| Tipo de cita | Psicológica / Asesoría puntual |
| Estado | Programada / Cancelada / Movida |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Editar alias o celular y guardar | Modal de confirmación; al confirmar, los datos se actualizan |
| Cambiar foto de perfil | Selector de imagen; al guardar, se actualiza la foto |
| Navegar al tab de eventos | Muestra los eventos públicos en los que está inscrito |
| Navegar al tab de citas | Muestra las próximas citas privadas programadas |

---

## 6. Restricciones

- Nombre completo, correo y número de documento son **campos de solo lectura** y no pueden modificarse desde esta vista.
- La foto de perfil debe cumplir con los formatos y tamaño máximo definidos por el sistema.
- Los listados de tabs se muestran con **paginación de 10 registros** por página.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Campos inmutables | Nombre, correo y documento solo pueden cambiar mediante proceso administrativo |
| Alias | Puede modificarse libremente desde el perfil |
| Confirmación de cambios | Toda actualización requiere confirmación en **modal** antes de guardar |
| Paginación en tabs | 10 registros por página en cada tab |
| Formato de fechas | `DD MMM YYYY` en todos los listados |

---

## 8. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Nombre completo | `Usuarios.NombreCompleto` (solo lectura) |
| Correo electrónico | `Usuarios.Correo` (solo lectura) |
| Número de identificación | `Usuarios.NumeroDocumento` (solo lectura) |
| Alias | `Usuarios.Alias` (editable) |
| Celular | `Usuarios.Celular` (editable) |
| Foto de perfil | `Usuarios.FotoPerfil` (editable) |
| Eventos inscritos | `Inscripciones` (UsuarioId, Estado) + `Eventos` |
| Próximas citas | `Citas` (UsuarioId, FechaHora >= Hoy, Estado = Programada) |

---

## 9. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Edición exitosa | Los datos editados se guardan correctamente y se reflejan de inmediato |
| Campos inmutables protegidos | No es posible editar nombre, correo ni documento desde la interfaz |
| Tabs cargan correctamente | Cada tab muestra su contenido sin errores |
| Paginación correcta | Máximo 10 registros por página en cada tab |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

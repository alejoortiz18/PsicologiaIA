# Perfil del Usuario — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1 semana

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

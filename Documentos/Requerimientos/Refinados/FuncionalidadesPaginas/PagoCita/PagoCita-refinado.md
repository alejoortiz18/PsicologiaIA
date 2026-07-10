# Pago de Cita — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1–2 semanas

---

## 1. Problema

El usuario que acaba de agendar una cita con un profesional necesita completar el pago de forma clara y segura, con un resumen visible de la cita que está pagando, el desglose de precios y los métodos de pago disponibles, antes de confirmar la transacción.

---

## 2. Apetito

**1 a 2 semanas.**
Página de pago con header simple (sin sidebar), resumen de la cita, desglose de precio (tarifa base + tarifa de servicio $5.000 COP + Total), selección de método de pago (Tarjeta / PSE / Efecty), formulario condicional para tarjeta, nota de seguridad y modal de éxito con datos de la cita confirmada.

---

## 3. Límites

### ✅ Dentro del scope

- Layout sin sidebar (cabecera simple solo con logo)
- Resumen de la cita: avatar del profesional · nombre · especialidad · tipo sesión · fecha · hora · duración
- Desglose de precio: tarifa base + $5.000 COP (tarifa de servicio) + **Total**
- Métodos de pago: **Tarjeta de crédito/débito** · **PSE** · **Efecty**
- Formulario condicional para tarjeta (número · nombre · fecha expiración · CVV)
- Nota de seguridad: 🔒
- Botón **[Confirmar pago]** → loading → modal de éxito
- Modal de éxito con código de cita → `citas-usuario.html`

### ❌ Fuera del scope (No-Gos)

- Gestión de facturas
- Reembolsos o cancelación desde esta vista
- Guardar tarjeta para usos futuros (primera versión)

---

## 4. Solución Visible

### Header (sin sidebar)

| Elemento | Descripción |
|---|---|
| Logo Trébol | Centrado o izquierda; sin menú lateral |
| Paso indicativo | Texto: "Confirmar pago" o breadcrumb simple |

### Sección — Resumen de la cita

| Elemento | Descripción |
|---|---|
| Avatar del profesional | Foto circular del profesional |
| Nombre del profesional | "Dra. Valentina García" |
| Especialidad | "Psicología clínica" |
| Tipo de sesión | Badge: "Psicológica" o "Asesoría puntual" |
| Fecha | Formato `DD MMM YYYY` (ej: "14 Ago 2026") |
| Hora | Formato 12H (ej: "3PM") |
| Duración | "60 minutos" |

### Sección — Desglose de precio

| Concepto | Valor |
|---|---|
| Tarifa base (profesional) | `$XX.XXX COP` |
| Tarifa de servicio Trébol | `$5.000 COP` |
| **Total a pagar** | **`$XX.XXX COP`** (línea destacada, negrita) |

### Sección — Método de pago

| Método | Descripción |
|---|---|
| **Tarjeta de crédito/débito** | Despliega formulario de tarjeta al seleccionar |
| **PSE** (Pagos Seguros en Línea) | Redirige al portal PSE del banco seleccionado |
| **Efecty** | Genera un código para pago en punto Efecty |

Selector tipo radio con íconos de cada método.

### Formulario condicional — Tarjeta (solo visible si se selecciona Tarjeta)

| Campo | Obligatorio | Notas |
|---|---|---|
| Número de tarjeta | Sí | 16 dígitos; máscara visual |
| Nombre del titular | Sí | Como aparece en la tarjeta |
| Fecha de expiración | Sí | MM/AA |
| CVV | Sí | 3–4 dígitos; campo enmascarado |

> **Nota de seguridad:** 🔒 *"Tu información de pago está protegida con cifrado SSL. No almacenamos los datos de tu tarjeta."*

### Botón de acción

| Elemento | Descripción |
|---|---|
| Botón **[Confirmar pago]** | Verde; spinner durante el proceso; deshabilitado al hacer clic |
| Estado de carga | "Procesando pago..." con spinner |

### Modal de éxito

| Elemento | Descripción |
|---|---|
| Ícono ✅ | Confirmación visual |
| Título | "¡Cita confirmada!" |
| Código de cita | `TRB-YYYY-XXXXX` |
| Resumen | Nombre del profesional + fecha + hora |
| Instrucciones | "Recibirás un correo con los detalles. El día de tu cita encontrarás el botón [Ingresar] activo en tu lista de citas." |
| Botón **[Ver mis citas]** | → `citas-usuario.html` |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Llegar a la página | Ve el resumen de la cita y el desglose de precio |
| Seleccionar "Tarjeta" | Despliega el formulario de tarjeta |
| Seleccionar "PSE" | Se activa flujo de redirección al portal del banco |
| Seleccionar "Efecty" | Se genera el código al confirmar |
| Completar formulario de tarjeta + [Confirmar pago] | Loading → modal de éxito |
| Clic [Ver mis citas] (en modal) | → `citas-usuario.html` |

---

## 6. Restricciones

- El usuario no puede acceder a esta página sin venir del flujo de agendamiento de cita.
- El botón [Confirmar pago] queda **deshabilitado** durante el procesamiento (anti-doble pago).
- El sistema no almacena datos de tarjeta (el procesamiento se delega a la pasarela de pago).
- La tarifa de servicio **siempre es $5.000 COP** y no es negociable.
- El pago es requerido para confirmar la cita; sin pago no hay cita.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Tarifa de servicio | Siempre **$5.000 COP** adicional a la tarifa base del profesional |
| Anti-doble pago | Botón deshabilitado durante el procesamiento |
| Datos de tarjeta | **No se almacenan** en la BD; se procesan por la pasarela |
| Código de cita | Formato `TRB-YYYY-XXXXX` (año + número único) |
| Estado de cita tras pago | `Citas.Estado` → `Confirmada` |
| Notificación de pago | Correo de confirmación al usuario; notificación al profesional |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Doble clic en [Confirmar pago] | Botón deshabilitado al primer clic |
| Pago exitoso pero cita no confirmada | Registrar el pago antes de confirmar la cita; rollback si falla |
| Datos de tarjeta expuestos | Procesamiento 100% por pasarela externa; cifrado SSL |
| PSE / Efecty falla | Mostrar error claro + opción de reintentar o cambiar método |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Datos de la cita | `Citas` (CitaId, UsuarioId, ProfesionalId, FechaHora, Tipo, Estado) |
| Datos del profesional | `Profesionales.NombreCompleto`, `FotoPerfil`, `Especialidad`, `TarifaBase` |
| Tarifa de servicio | Constante del sistema: $5.000 COP |
| Total | `TarifaBase + 5000` |
| Registro de pago | `Pagos` (PagoId, CitaId, UsuarioId, Monto, Metodo, Estado, Timestamp) |
| Código de cita | Generado: `TRB-{Año}-{SecuencialPadded}` |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Desglose de precio correcto | Tarifa base + $5.000 COP = Total mostrado |
| Formulario de tarjeta condicional | Solo aparece al seleccionar método Tarjeta |
| Anti-doble pago efectivo | El botón queda deshabilitado tras el primer clic |
| Modal de éxito con código | Se genera y muestra el código `TRB-YYYY-XXXXX` |
| Estado de cita actualizado | `Citas.Estado = Confirmada` tras el pago exitoso |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

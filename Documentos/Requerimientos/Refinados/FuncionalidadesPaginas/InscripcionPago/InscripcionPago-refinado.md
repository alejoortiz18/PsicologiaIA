# Inscripción y Pago — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 2–3 semanas

---

## 1. Problema

Cuando un usuario decide inscribirse a un evento de pago o reservar una cita privada, necesita un flujo de pago seguro, con validación de cupos en tiempo real, confirmación clara del resultado y trazabilidad completa de la transacción.

---

## 2. Apetito

**2 a 3 semanas.**
Flujo completo de inscripción y pago: validación de cupos, integración con pasarela de pago, estados de la transacción, confirmación por correo y registro de trazabilidad.

---

## 3. Límites

### ✅ Dentro del scope

- Validación de cupos en tiempo real antes y después del pago
- Flujo de pago mediante pasarela integrada (tarjeta crédito/débito, PSE, transferencia bancaria)
- Gestión de estados de la inscripción (pendiente, aprobado, rechazado, confirmado, sin cupos, reembolso pendiente, cancelado)
- Correo de confirmación de inscripción exitosa
- Registro de trazabilidad de cada transacción
- Prevención de sobreventa (doble validación de cupos)

### ❌ Fuera del scope (No-Gos)

- Panel de administración de pagos (corresponde al módulo financiero del Admin)
- Procesamiento de reembolsos automáticos (se registra el estado; el reembolso lo gestiona el Admin)
- Suscripciones o pagos recurrentes
- Múltiples monedas (se configura una moneda base)

---

## 4. Solución Visible

### Paso 1 — Confirmación de inscripción

| Elemento | Descripción |
|---|---|
| Nombre del evento | — |
| Fecha y hora | `DD MMM YYYY H[MM]AM/PM` |
| Nombre del orador | — |
| Cupos disponibles | Número actualizado en tiempo real |
| Precio | Monto total a pagar |
| Botón "Confirmar y pagar" | Inicia el proceso de pago |
| Botón "Cancelar" | Regresa al Home sin generar ningún registro |

### Paso 2 — Proceso de pago (Pasarela)

| Elemento | Descripción |
|---|---|
| Métodos de pago disponibles | Tarjeta crédito, tarjeta débito, PSE, transferencia bancaria |
| Formulario de pago | Provisto por la pasarela; el sistema no almacena datos de tarjeta |
| Spinner / indicador de progreso | Visible durante el procesamiento del pago |

### Paso 3 — Resultado del pago

| Estado | Vista mostrada |
|---|---|
| Pago aprobado → Inscripción confirmada | Modal de éxito con detalles de la inscripción |
| Pago rechazado | Modal de error con opción de intentar nuevamente |
| Sin cupos al momento del pago | Modal informativo: "Sin cupos disponibles"; inicio de proceso de reembolso |
| Inscripción cancelada | Modal de confirmación de cancelación |

---

## 5. Estados de la Inscripción

| Estado | Descripción |
|---|---|
| **Pendiente de pago** | Orden generada, pago no procesado aún |
| **Pago aprobado** | La pasarela confirmó el pago exitosamente |
| **Pago rechazado** | La pasarela rechazó la transacción |
| **Inscripción confirmada** | Cupo asignado y registro completado |
| **Sin cupos** | No había disponibilidad al momento de finalizar el pago |
| **Reembolso pendiente** | Pago realizado pero sin cupos disponibles; en espera de devolución |
| **Inscripción cancelada** | El usuario canceló antes de completar el proceso |

---

## 6. Correo de Confirmación

Tras inscripción exitosa, el sistema envía al usuario un correo con:

| Campo | Descripción |
|---|---|
| Nombre del evento | — |
| Fecha | `DD MMM YYYY` |
| Hora | Formato 12H (ej: `3PM`) |
| Sala asignada | Nombre o identificador de la sala |
| Código de inscripción | Identificador único de la inscripción |
| Valor pagado | Monto de la transacción |
| Recomendaciones previas | Indicaciones del profesional para el evento |

---

## 7. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Hacer clic en "Confirmar y pagar" | Validación de cupos en tiempo real; si hay cupos, avanza al pago |
| Completar el pago en la pasarela | El sistema recibe la respuesta y actualiza el estado de la inscripción |
| Pago aprobado | Modal de éxito + correo de confirmación enviado |
| Pago rechazado | Modal de error + opción de reintentar |
| Sin cupos post-pago | Modal informativo + proceso de reembolso iniciado |
| Hacer clic en "Cancelar" | Regresa al Home; no se genera ningún registro |

---

## 8. Restricciones

- El sistema **valida los cupos dos veces**: antes de redirigir a la pasarela y después de recibir la confirmación de pago.
- El sistema **nunca almacena** datos de tarjeta de crédito/débito; el formulario de pago es provisto y gestionado por la pasarela.
- La inscripción a un evento de pago **requiere completar el pago** para ser confirmada; no se puede reservar un cupo sin pagar.
- El botón "Confirmar y pagar" se deshabilita durante el procesamiento (prevención de doble envío).

---

## 9. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Validación de cupos | Se realiza en dos momentos: antes del pago y después de la confirmación de la pasarela |
| Prevención de sobreventa | Si los cupos se agotan entre el inicio y la confirmación del pago, se registra "Sin cupos" y se inicia el reembolso |
| Token de inscripción | Se genera automáticamente tras la confirmación de pago exitosa |
| Trazabilidad | Cada transacción registra: usuario, evento, método de pago, monto, fecha y estado |
| Protección doble envío | El botón de pago se deshabilita durante el procesamiento |
| Correo de confirmación | Se envía solo tras el estado **Inscripción confirmada** |

---

## 10. Riesgos

| Riesgo | Mitigación |
|---|---|
| Cupos agotados entre validación y pago | Doble validación: antes y después del pago; proceso de reembolso si falla |
| Respuesta lenta de la pasarela | Mostrar spinner; definir timeout máximo de respuesta |
| Pago procesado pero inscripción no confirmada | Registrar el estado "Pago aprobado" separado de "Inscripción confirmada"; proceso de reconciliación |
| Correo de confirmación no entregado | Configurar reenvío automático; el código de inscripción también aparece en pantalla al finalizar |

---

## 11. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Inscripción | `Inscripciones` (InscripcionId, UsuarioId, EventoId, Estado, FechaInscripcion, CodigoInscripcion) |
| Pago | `Pagos` (PagoId, InscripcionId, Monto, MetodoPago, Estado, FechaPago, ReferenciaPassarela) |
| Cupos disponibles | `Salas.CupoMaximo` - COUNT(`Inscripciones` con Estado = Confirmado) |
| Token de inscripción | `Inscripciones.CodigoInscripcion` (generado automáticamente) |
| Trazabilidad | `LogPagos` (PagoId, Evento, Timestamp, Resultado) |
| Datos del evento para el correo | `Eventos.*` + `Salas.Nombre` + `Profesionales.Alias` |

---

## 12. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Cupos validados correctamente | No se confirman inscripciones cuando no hay cupos disponibles |
| Sin sobreventa | El sistema nunca asigna más cupos que el máximo configurado |
| Correo de confirmación entregado | El correo llega al usuario en menos de **60 segundos** tras la confirmación |
| Estados registrados correctamente | Cada transacción tiene su estado correcto en la base de datos |
| Trazabilidad completa | Cada pago tiene registro de método, monto, fecha y resultado |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

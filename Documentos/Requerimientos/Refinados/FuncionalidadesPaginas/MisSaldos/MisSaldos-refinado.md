# Mis Saldos — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 3 — Módulo financiero del Usuario | **Apetito:** 2–3 semanas
> **Script BD:** `Proyecto MVC/Database/48_MisSaldosUsuarioFinanciero.sql`

---

## 1. Problema

El usuario necesita visibilidad privada de sus pagos, devoluciones y saldos internos, con trazabilidad cuando un evento se cancela o un profesional no asiste a una cita. Debe poder reutilizar el dinero en la plataforma o solicitar desembolso bancario con reglas claras de comisión, plazos y retractación.

---

## 2. Apetito

**2 a 3 semanas.**
Tab **Mis Saldos** en Perfil Usuario, tab **Novedades**, datos bancarios obligatorios, ledger de saldo a favor / dinero en tránsito, flujos de evento cancelado e inasistencia del profesional, panel financiero del profesional con descuentos explicados.

---

## 3. Límites

### ✅ Dentro del scope

- Tab **Mis Saldos** (después de Mi agenda) con KPIs, filtros y tarjetas Saldo a favor / Dinero en tránsito
- Tab **Novedades** en Perfil Usuario
- Datos bancarios obligatorios del usuario (`CuentaBancariaUsuario`)
- Ledger `MovimientoSaldoUsuario` con estados y trazabilidad
- Flujo evento cancelado / reprogramado → 3 opciones al usuario
- Flujo profesional no asiste → detección por ingreso a sala + 5 min de gracia
- Desembolso bancario con comisión parametrizable (perfil Sistema futuro)
- Recarga de saldo a favor y pago mixto (saldo + pasarela)
- Notificaciones: modal al ingresar + bandeja + correo
- Descuentos visibles en panel financiero del profesional

### ❌ Fuera del scope (No-Gos)

- Perfil Sistema / Admin para parametrización (se deja preparado en `Configuracion`)
- Prototipo HTML (siguiente iteración)
- Implementación MVC completa de flujos (spec + BD en esta entrega)

---

## 4. Conceptos financieros

| Concepto | Descripción |
|---|---|
| **Saldo a favor** | Crédito interno en la plataforma. Origen: devoluciones o recarga voluntaria. Uso: citas o eventos con cualquier profesional. |
| **Dinero en tránsito** | Monto solicitado para desembolso bancario. Retención 15–30 días hábiles. Solo se activa al pulsar **Retirar** desde la tarjeta Saldo a favor. |
| **Comisión de retiro** | Porcentaje parametrizable aplicado **solo** al desembolso bancario. Se muestra monto bruto, comisión y neto a consignar. |

**Flujo:**

```
Pago original → (novedad) → Saldo a favor → [Retirar] → Dinero en tránsito → Cuenta bancaria
                                    ↓
                          Cita / evento / recarga
```

---

## 5. Ubicación en Perfil Usuario

Orden de tabs:

1. Información personal
2. Eventos inscritos
3. Mi agenda
4. **Mis Saldos** *(nuevo)*
5. **Novedades** *(nuevo)*

Ambos tabs son **100 % privados** para el usuario autenticado con rol Usuario.

---

## 6. Tab Mis Saldos — Solución visible

### KPIs (con filtro por rango de fechas)

| KPI | Descripción |
|---|---|
| Total pagado | Suma de pagos en citas + eventos |
| Total eventos asistidos | Eventos con asistencia confirmada |
| Total citas | Citas privadas (seguimiento + asesoría) |
| Dinero a favor | Suma de movimientos en estado `SaldoFavor` |
| Dinero en tránsito | Suma de movimientos en estado `EnTransito` |

### Tarjetas

| Tarjeta | Contenido | Acción |
|---|---|---|
| **Saldo a favor** | Monto disponible | Botón **Retirar** → flujo bancario |
| **Dinero en tránsito** | Montos en proceso, plazo estimado | Cancelar solicitud (≤ 5 días hábiles) |

### Desglose

- Tabla paginada (10/página): pagos agrupados por profesional
- Totales de citas vs eventos según filtro de fecha

---

## 7. Datos bancarios del usuario

| Regla | Detalle |
|---|---|
| Obligatoriedad | Banco, tipo de cuenta, número, titular — **obligatorios** antes de cualquier desembolso |
| Ubicación UI | Tab Información personal (editable) |
| Tabla BD | `CuentaBancariaUsuario` (1:1 con `Usuario`) |
| Modal previo al retiro | Texto legal sobre verificación de datos + Aceptar / Cancelar |
| Datos inválidos | Desembolso **congelado** hasta actualizar cuenta |
| 3 meses sin actualizar | Correo de advertencia; si persiste, retención del monto en tránsito por la plataforma |

---

## 8. Desembolso bancario (Saldo a favor → Dinero en tránsito)

| Paso | Comportamiento |
|---|---|
| 1 | Usuario pulsa **Retirar** en tarjeta Saldo a favor |
| 2 | Validar `CuentaBancariaUsuario` completa y activa |
| 3 | Modal advertencia datos bancarios |
| 4 | Mostrar: monto bruto, comisión (%), monto neto a consignar |
| 5 | Confirmar → movimiento pasa a `EnTransito`; descuenta saldo a favor |
| 6 | Informar: desembolso en **15 a 30 días hábiles** |
| 7 | **5 días hábiles** para cancelar → vuelve a `SaldoFavor` |
| 8 | Pasados 5 días → no retractable; esperar desembolso o retención |

Parámetros en `Configuracion`: `Financiero.ComisionRetiroPorcentaje`, `Financiero.DiasRetractacionRetiro`, `Financiero.DiasDesembolsoMin`, `Financiero.DiasDesembolsoMax`, `Financiero.MesesRetencionCuentaInvalida`.

---

## 9. Uso del saldo a favor

| Regla | Detalle |
|---|---|
| Citas | Cualquier profesional |
| Eventos | Cualquier profesional / sala |
| Saldo insuficiente | Recarga adicional de saldo a favor |
| Pago mixto | Saldo a favor + método de pasarela |
| Método de pago BD | `SaldoFavor` en `PagoCita` y `PagoInscripcion` |

---

## 10. Evento cancelado o reprogramado

### Notificación

Modal al ingresar + bandeja + correo. Informa cancelación y, si aplica, nueva fecha propuesta.

### Tres opciones (siempre visibles)

| # | Opción | Comportamiento |
|---|---|---|
| 1 | **Aceptar nueva fecha** | Habilitada solo si hay fecha propuesta; inscripción se reprograma |
| 2 | **Retirar dinero** | Pago total → Saldo a favor; descuento al profesional; notificación al profesional |
| 3 | **Explorar alternativas** | Directorio / otros eventos del profesional |

- Si el evento se cancela **de nuevo** tras aceptar fecha → mismas 3 opciones.
- Inscripción / evento → estado **Cancelada** cuando corresponda.
- Inscripción en decisión → `PendienteDecisionUsuario`.

---

## 11. Profesional no asiste a cita privada

### Detección de asistencia (confirmado)

| Regla | Valor |
|---|---|
| Criterio | **Ingreso a la sala de videollamada** (`CitaAsistencia`) |
| Gracia | **5 minutos** después de la hora programada |
| Falta del profesional | No ingresó a sala tras 5 min → flujo de novedad |
| Usuario presente | Si ingresó y profesional no → modal 3 opciones |

### Reporte anticipado del profesional

- Solo **hasta 5 minutos antes** de la hora de la cita.
- Cita → `PendienteDecisionUsuario` hasta que el usuario elija.
- Usuario recibe notificación (modal + bandeja + correo).

### Modal — 3 opciones

| # | Opción | Resultado |
|---|---|---|
| 1 | **Esperar 5 minutos más** | Timer; si profesional no aparece → mismo modal |
| 2 | **Reagendar con el profesional** | Calendario del profesional |
| 3 | **Retirar dinero** | Monto pagado → Saldo a favor; descuento profesional; redirect Home |

Al retirar: cita → **Cancelada**.

### Usuario no asiste

1. Profesional propone reagendamiento → usuario debe **aceptar**.
2. Si no acepta → usuario propone otras fechas → profesional **acepta**.
3. Sin devolución automática por inasistencia del usuario.

---

## 12. Tab Novedades (Perfil Usuario)

Lista novedades pendientes (`NovedadUsuario`): eventos cancelados, citas con profesional ausente, decisiones pendientes. Cada ítem abre el flujo de 3 opciones.

---

## 13. Panel financiero del profesional

Tabla `AjusteSaldoProfesional`: cada descuento por saldo a favor al usuario con monto, motivo, referencia (cita/inscripción) y fecha. Visible en panel financiero del profesional.

---

## 14. Reglas de negocio — resumen

| ID | Regla |
|---|---|
| RN-01 | Saldo a favor ≠ dinero en tránsito; el retiro bancario es un paso explícito |
| RN-02 | Comisión solo en desembolso bancario |
| RN-03 | Retractación de retiro: 5 días hábiles |
| RN-04 | Desembolso: 15–30 días hábiles |
| RN-05 | Descuento al saldo por pagar del profesional en cada crédito al usuario |
| RN-06 | Detección inasistencia: ingreso a sala + 5 min gracia |
| RN-07 | Datos bancarios obligatorios para retiro |
| RN-08 | Retención por cuenta inválida 3 meses sin corrección |

---

## 15. Datos necesarios (BD)

| Entidad | Propósito |
|---|---|
| `CuentaBancariaUsuario` | Datos bancarios del usuario |
| `MovimientoSaldoUsuario` | Ledger saldo a favor / en tránsito |
| `SaldoRecarga` | Recargas voluntarias de saldo |
| `CitaAsistencia` | Ingreso a sala y reporte de ausencia |
| `NovedadUsuario` | Novedades pendientes en perfil |
| `AjusteSaldoProfesional` | Descuentos en panel financiero profesional |
| `Configuracion` | Parámetros financieros |

Estados ampliados:

- `Cita.Estado`: + `PendienteDecisionUsuario`
- `Inscripcion.Estado`: + `PendienteDecisionUsuario`, `ReembolsoPendiente`

---

## 16. Métricas de éxito

| Métrica | Criterio |
|---|---|
| KPIs correctos | Totales coinciden con ledger y pagos reales |
| Retiro bancario | Comisión y neto visibles; estado EnTransito registrado |
| Evento cancelado | 3 opciones; saldo a favor y descuento profesional trazables |
| Inasistencia profesional | Detección a los 5 min; modal y estados correctos |
| Datos bancarios | Bloqueo de retiro si incompletos |

---

*Documento refinado v1 | Junio 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

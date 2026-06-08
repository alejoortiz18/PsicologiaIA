# Prompt de continuación — Módulo Mis Saldos (Usuario)

Copia y pega el bloque siguiente en un chat nuevo de Cursor para retomar la implementación desde donde quedó.

---

## PROMPT (copiar desde aquí)

Continúa la implementación del **módulo Mis Saldos** del rol **Usuario** en el proyecto Trébol (ASP.NET Core MVC + SQL Server TrebolDB).

### Contexto ya completado

**Requisitos funcionales** (cerrados):
- `Documentos/Requerimientos/Refinados/FuncionalidadesPaginas/MisSaldos/MisSaldos-refinado.md`

**Base de datos** (diseñada y migrada):
- Script: `Proyecto MVC/Database/48_MisSaldosUsuarioFinanciero.sql` — **ya aplicado en TrebolDB**
- Doc BD: `Documentos/Requerimientos/Refinados/BaseDatos/BaseDatos-refinado.md` (§7.5–7.11)

**Tablas nuevas:**
- `CuentaBancariaUsuario` — datos bancarios obligatorios del usuario (1:1)
- `MovimientoSaldoUsuario` — ledger saldo a favor / dinero en tránsito
- `SaldoRecarga` — recargas voluntarias
- `CitaAsistencia` — ingreso a sala + detección inasistencia
- `NovedadUsuario` — tab Novedades en perfil
- `AjusteSaldoProfesional` — descuentos en panel financiero del profesional

**Estados ampliados:**
- `Cita`: + `PendienteDecisionUsuario`
- `Inscripcion`: + `PendienteDecisionUsuario`, `ReembolsoPendiente`
- `PagoCita` / `PagoInscripcion`: método `SaldoFavor`
- `MovimientoSaldoUsuario.Estado`: `SaldoFavor`, `EnTransito`, `Desembolsado`, `Retractado`, `Congelado`, `Retenido`

**Enums C# actualizados:**
- `EstadoCita`, `EstadoInscripcion`, `MetodoPago`
- Nuevos: `EstadoMovimientoSaldo`, `TipoMovimientoSaldo`
- Stubs: `Trebol.Model/Entities/TrebolEntities/TrebolEntities.cs`

**SP existente:**
- `sp_RegistrarIngresoCitaSala` — registrar ingreso usuario/profesional a sala de cita

**Parámetros Configuracion:**
- `Financiero.ComisionRetiroPorcentaje` = 3.5
- `Financiero.DiasRetractacionRetiro` = 5
- `Financiero.DiasDesembolsoMin` = 15
- `Financiero.DiasDesembolsoMax` = 30
- `Financiero.MesesRetencionCuentaInvalida` = 3
- `Financiero.MinutosGraciaInasistencia` = 5

### Decisiones de producto (no cambiar sin acuerdo)

1. **Saldo a favor ≠ retiro bancario.** Devoluciones van primero a saldo a favor; el botón **Retirar** en esa tarjeta inicia el desembolso bancario → dinero en tránsito.
2. **Comisión** solo al desembolsar a banco; mostrar bruto, comisión y neto a consignar.
3. **Retractación:** 5 días hábiles; después no se puede cancelar.
4. **Desembolso:** 15–30 días hábiles.
5. **Saldo a favor** usable en citas y eventos con **cualquier profesional**; permite recarga y pago mixto (saldo + pasarela).
6. **Evento cancelado/reprogramado:** siempre 3 opciones (Aceptar nueva fecha si aplica / Retirar dinero → saldo a favor / Explorar alternativas).
7. **Profesional no asiste cita:** detección por **ingreso a sala de videollamada** + **5 min de gracia**; modal 3 opciones (Esperar 5 min / Reagendar / Retirar → saldo a favor).
8. **Profesional reporta ausencia:** solo hasta 5 min antes de la cita; cita → `PendienteDecisionUsuario`.
9. **Usuario no asiste:** profesional propone reagendamiento → usuario acepta; si no, usuario propone fechas → profesional acepta. Sin devolución automática.
10. **Datos bancarios obligatorios** en perfil; si inválidos con desembolso en tránsito → congelar; 3 meses sin corregir → retención + correo.
11. **Descuento al saldo por pagar del profesional** + notificación en su panel financiero.
12. **Notificaciones:** modal al ingresar + bandeja + correo.

### Ubicación UI (Perfil Usuario)

Tabs en orden:
1. Información personal *(agregar campos bancarios aquí)*
2. Eventos inscritos
3. Mi agenda
4. **Mis Saldos** *(nuevo)*
5. **Novedades** *(nuevo)*

Vista actual tabs: `Proyecto MVC/Trebol.Web/Views/PerfilUsuario/_PerfilUsuarioShell.cshtml`

### Pendiente de implementar (prioridad sugerida)

**Fase A — UI + datos bancarios**
- [x] Tab **Mis Saldos** en Perfil Usuario: KPIs, filtro fecha, tarjetas Saldo a favor / Dinero en tránsito, desglose por profesional
- [x] Tab **Novedades** en Perfil Usuario
- [x] Campos bancarios en Información personal (`CuentaBancariaUsuario`) — obligatorios, validación
- [x] Retiro bancario (modal + endpoint) y retractación
- [ ] Prototipo HTML en `Prototipo/` (pendiente alinear perfil-usuario.html)

**Fase B — Backend**
- [ ] Repositorios + SPs: saldos, movimientos, novedades, cuenta bancaria usuario
- [ ] Controller/endpoints: KPIs Mis Saldos, retiro bancario, retractación, recarga saldo
- [ ] Integrar `SaldoFavor` en flujos `PagoCita` e inscripción/pago eventos
- [ ] Constantes en `Trebol.Constants` para mensajes

**Fase C — Flujos de negocio**
- [ ] Evento cancelado/reprogramado → `NovedadUsuario` + 3 opciones + crédito saldo a favor + `AjusteSaldoProfesional`
- [ ] Cita: `sp_RegistrarIngresoCitaSala` desde `SalaPrivadaUsuario` / profesional
- [ ] Job/timer: evaluar inasistencia a los 5 min → novedad + modal
- [ ] Reporte anticipado profesional (≤5 min antes)
- [ ] Flujo usuario no asiste → reagendamiento propuesto

**Fase D — Profesional + notificaciones**
- [ ] Panel financiero profesional: listado `AjusteSaldoProfesional`
- [ ] Bandeja notificaciones + correos transaccionales

**Fase E — Prueba visual**
- [ ] Script Playwright en `Test/` con `headless: false`
- [ ] Capturas en `Test/screenshots/`
- [ ] App en `https://localhost:7072`

### Reglas del proyecto (obligatorias)

- Prototipo prevalece: `Prototipo/` + `reglas-ui-ux-frontend.md`
- Datos reales desde TrebolDB — sin mocks
- Paginación tablas: 10 registros/página
- Modales estándar (no alert/confirm nativos)
- Arquitectura: `.agents/skills/dotnet-layered-architecture/SKILL.md`
- Diff mínimo; no refactorizar fuera del alcance

### Tu tarea ahora

Empieza por **[indica fase: A / B / C / D / E o "todo el flujo completo"]**.

Sigue las reglas del workspace, revisa el refinado y el script SQL antes de codear, y ejecuta prueba visual Playwright antes de dar por cerrado.

## FIN DEL PROMPT

---

*Generado: junio 2026 — conversación Mis Saldos Usuario*

# Mapa Prototipo → MVC (rol Profesional)

Referencia viva para alinear vistas. Actualizar cuando se implemente una pantalla.

| Prioridad | Prototipo | Vista MVC / ruta | Estado | Notas |
|-----------|-----------|-------------------|--------|-------|
| P1 | `home-profesional.html` | `HomeProfesional/Index` | Parcial | KPIs, paneles citas/eventos; enlaces a detalle |
| P1 | `mis-eventos.html` | `MisEventos/Index` | Existe | Verificar paridad grid/lista |
| P1 | `especialistas.html` | `Directorio/Especialistas` | OK | Fix partial `@section` + SP params (2026-05-19) |
| P1 | `psicologos.html` | `Directorio/Psicologos` | OK | Mismo fix que Especialistas |
| P1 | `mis-colegas.html` | `Directorio/MisColegas` | OK | Refinar filtros/copy vs prototipo |
| P1 | `perfil-profesional.html` | `PerfilProfesional/Index` | OK | Formulario completo + catálogos BD + estudios |
| P1 | `perfil-pro-salas.html` | `PerfilProfesional/Salas` | OK | Stats + tabla paginada + filtros + modales |
| P1 | `perfil-pro-calendario.html` | `PerfilProfesional/Calendario` | OK | Calendario mensual + horario semanal + bloqueos BD |
| P1 | `perfil-pro-citas.html` | `PerfilProfesional/Citas` | OK | Stats + tabs próximas/historial + tabla paginada |
| P1 | `perfil-pro-kpi.html` | `PerfilProfesional/Indicadores` | OK | KPIs desde `ObtenerResumenPerfilAsync` + dashboard SP |
| P2 | `citas-profesional.html` | `PerfilProfesional/Citas` | OK | Alias visual; redirect legacy `Citas/ListaProfesional` |
| P2 | `mensajes-profesional.html` | `Mensajeria/Index`, `Conversacion` | Existe | Layout dos paneles §10.4 reglas UI |
| P2 | `sala-profesional.html` | `Salas/SalaPrivadaProfesional` | **OK** | Entrada desde cita → Ingresar |
| P2 | `sala-conferencia-profesional.html` | `Salas/SalaConferenciaProfesional` | **OK** | Gestionar desde Mis eventos / perfil salas |
| P3 | `perfil-orador.html` | `PerfilOrador/Index/{id}` | Parcial | Ruta: `/PerfilOrador/Index/{id}` |
| P3 | `orador-salas.html` | `PerfilOrador/MisSalas` | Existe | No en menú lateral |
| P3 | `orador-calendario.html` | *(sin vista dedicada)* | **Falta** | Calendario público orador |
| P3 | `orador-comentarios.html` | *(sin vista)* | **Falta** | Comentarios en perfil orador |

## Menú lateral (referencia `home-profesional.html`)

**Principal:** Inicio · Mis eventos · Profesionales (Especialistas, Psicólogos, Mis colegas)  
**Mi espacio:** Mi perfil · Citas · Mensajes  

No incluido en menú prototipo pero existe en MVC: `Salas`, `Calendario` → accesibles vía **tabs del perfil** (`PerfilProfesional/Salas`, `Calendario`).

## Assets compartidos

- CSS: `Prototipo/css/styles.css` ≈ `Trebol.Web/wwwroot/css/trebol.css`
- JS: `Prototipo/js/app.js` ≈ `Trebol.Web/wwwroot/js/trebol.js`
- Layout interno: `Views/Shared/_LayoutInterno.cshtml` + `_MenuLateral.cshtml`

## Verificación

```powershell
node Test/VistasProfesional.js
```

Capturas: `Test/screenshots/vistas-profesional/`

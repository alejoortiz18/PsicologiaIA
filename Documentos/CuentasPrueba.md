# Cuentas y Credenciales de Prueba

## Cuenta Administradora de la Aplicación

| Campo | Valor |
|---|---|
| Email login admin Trebol | **psicologiatrevol@gmail.com** |
| Contraseña login app | **Gm41l.C0m** |
| SMTP (envío correos) | **psicologiatrevol@gmail.com** (contraseña de aplicación en `appsettings.Development.json`) |

> Pruebas Playwright (`Test/CrearCuentaProfesional.js`): admin **psicologiatrevol@gmail.com**, sin abrir Gmail; confirmación de correo del pro con token desde BD; Yopmail solo para correos de rechazo/aprobación al profesional.

---

## Cuentas de Prueba (Usuarios y Profesionales)

Usar la plataforma **https://yopmail.com/es/** para generar correos temporales al momento de probar registros de usuarios y profesionales.

### Profesionales activos (Playwright)

| Correo | Contraseña | Id | Notas |
|---|---|---|---|
| `trebol.pro.test1779247556952@yopmail.com` | `Password123!` | 50 | Usado en `Test/VistasProfesional.js` |
| `trebol.pro.test1779283938868@yopmail.com` | `Password123!` | 51 | Creado por `Test/CrearCuentaProfesional.js` (flujo completo E2E) |
| `trebol.pro.test1779242138062@yopmail.com` | `Password123!` | 45 | Auto-aprobado vía script |

### Auto-aprobar pendientes (solo dev)

Profesionales en `PENDIENTE_APROBACION` (correo ya confirmado):

```powershell
node Test/auto-aprobar-profesionales.js           # aprobar todos
node Test/auto-aprobar-profesionales.js --list     # solo listar
node Test/auto-aprobar-profesionales.js --id=45
```

No aplica a `PENDIENTE_VALIDACION` (falta confirmar correo).

---

## Archivos de Prueba para Inscripción de Profesional

Siempre usar los archivos ubicados en `Documentos/ArchivosPrueba/`:

- `CedulaPrueba.pdf` — Documento de identidad de prueba
- `TarjetaProfesionalPrueba.pdf` — Tarjeta profesional de prueba

# Cuentas y Credenciales de Prueba

## Cuenta Administradora de la Aplicación

| Campo | Valor |
|---|---|
| Email login admin Trebol | **psicologiatrevol@gmail.com** |
| Contraseña login app | **Gm41l.C0m** |
| SMTP (envío correos) | Ver `appsettings.Development.json` → suele ser `reisavertv@gmail.com` |

> Pruebas Playwright (`Test/CrearCuentaProfesional.js`): admin **psicologiatrevol@gmail.com**, sin abrir Gmail; confirmación de correo del pro con token desde BD; Yopmail solo para correos de rechazo/aprobación al profesional.

---

## Cuentas de Prueba (Usuarios y Profesionales)

Usar la plataforma **https://yopmail.com/es/** para generar correos temporales al momento de probar registros de usuarios y profesionales.

---

## Archivos de Prueba para Inscripción de Profesional

Siempre usar los archivos ubicados en `Documentos/ArchivosPrueba/`:

- `CedulaPrueba.pdf` — Documento de identidad de prueba
- `TarjetaProfesionalPrueba.pdf` — Tarjeta profesional de prueba

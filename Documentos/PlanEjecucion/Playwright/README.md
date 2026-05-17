# Índice de Pruebas Playwright — Proyecto Trebol

Todas las pruebas usan **Chromium visible** (`--browser=chrome`) y la app corriendo en `https://localhost:7072`.

---

## Convenciones generales

- Los refs `[ref-xxx]` se reemplazan con los IDs reales obtenidos de `playwright-cli snapshot` en cada ejecución.
- Documentar evidencia con `playwright-cli screenshot --filename=nombre.png` en cada paso clave.
- **Cuentas de prueba:** generar correos temporales en https://yopmail.com/es/
- **Admin:** `psicologiatrevol@gmail.com` / contraseña app SMTP: `equz uibq uefq kdin`
- **Archivos para inscripción profesional:** siempre usar los de `Documentos/ArchivosPrueba/`

---

## Archivos de prueba

| # | Archivo | Funcionalidad | Depende de |
|---|---------|---------------|------------|
| 1 | [InicioSesion-Playwright.md](InicioSesion-Playwright.md) | Login de todos los roles, logout, credenciales inválidas | — |
| 2 | [CrearCuentaUsuario-Playwright.md](CrearCuentaUsuario-Playwright.md) | Registro usuario + activación por correo Yopmail | — |
| 3 | [CrearCuentaProfesional-Playwright.md](CrearCuentaProfesional-Playwright.md) | Registro profesional + PDFs + activación Yopmail | — |
| 4 | [RestablecerContrasena-Playwright.md](RestablecerContrasena-Playwright.md) | Recuperación de contraseña + verificar nuevo login | #2 (cuenta activa) |
| 5 | [AprobacionProfesional-Playwright.md](AprobacionProfesional-Playwright.md) | Admin aprueba/rechaza profesional pendiente | #3 |
| 6 | [AgendarCita-Playwright.md](AgendarCita-Playwright.md) | Agendar, ver y cancelar citas | #2 + #3 + #5 |
| 7 | [GestionSalas-Playwright.md](GestionSalas-Playwright.md) | Crear sala (profesional), inscribirse a sala (usuario) | #2 + #3 + #5 |
| 8 | [Mensajeria-Playwright.md](Mensajeria-Playwright.md) | Enviar y recibir mensajes entre usuario y profesional | #2 + #3 + #5 |
| 9 | [PerfilUsuario-Playwright.md](PerfilUsuario-Playwright.md) | Actualizar perfil de usuario y profesional, subir foto | #2 + #3 + #5 |
| 10 | [Directorio-Playwright.md](Directorio-Playwright.md) | Explorar directorio, filtrar, seguir, colegas, mentores | #2 + #3 + #5 |

---

## Orden recomendado de ejecución (primera vez)

```
1. CrearCuentaUsuario       → crea la cuenta base de usuario
2. CrearCuentaProfesional   → crea la cuenta base de profesional (queda pendiente)
3. AprobacionProfesional    → admin aprueba el profesional (requiere login admin)
4. InicioSesion             → verifica todos los logins con cuentas ya activas
5. RestablecerContrasena    → prueba recuperación sobre la cuenta de usuario
6. PerfilUsuario            → actualiza datos de perfil
7. Directorio               → navega, filtra, sigue profesionales
8. AgendarCita              → agenda y cancela cita
9. GestionSalas             → crea sala (prof) + inscripción (usuario)
10. Mensajeria              → conversación entre usuario y profesional
```

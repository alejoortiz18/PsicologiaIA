# Prueba: Aprobación de Profesional (Admin)
**Funcionalidad cubierta:** El administrador revisa la bandeja de notificaciones, visualiza la solicitud del profesional pendiente, descarga/revisa los archivos adjuntos y aprueba o rechaza la solicitud.

---

## Prerrequisitos
- La aplicación debe estar corriendo en `https://localhost:7072`
- `playwright-cli` instalado y disponible en el PATH
- Dependencia: **CrearCuentaProfesional-Playwright.md** — debe existir al menos un profesional en estado Pendiente
- Credenciales del admin disponibles

---

## Datos de prueba

| Rol   | Correo                       | Contraseña |
|-------|------------------------------|------------|
| Admin | psicologiatrevol@gmail.com   | Gm41l.C0m  |

---

## Flujo 1 — Aprobar profesional

### Paso 1 — Login como administrador

```bash
playwright-cli open --browser=chrome https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "psicologiatrevol@gmail.com"
playwright-cli fill [ref-password] "Gm41l.C0m"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot
```

**Resultado esperado:** Redirección a `/Admin/BandejaNotificaciones`.

---

### Paso 2 — Revisar la bandeja de notificaciones

```bash
playwright-cli snapshot
playwright-cli screenshot --filename=admin-bandeja-notificaciones.png
```

**Resultado esperado:** Lista de notificaciones con al menos una solicitud de profesional pendiente de aprobación. Cada notificación debe mostrar el nombre del profesional y la opción de aprobar/rechazar.

---

### Paso 3 — Ver detalle del profesional pendiente

```bash
# Hacer clic en la notificación o en el botón "Ver" del profesional pendiente
playwright-cli click [ref-ver-profesional-pendiente]
playwright-cli snapshot
```

**Resultado esperado:** Se muestra información del profesional: nombre, correo, especialidad, y los archivos PDF subidos (cédula y tarjeta profesional).

---

### Paso 4 — Aprobar al profesional

```bash
playwright-cli screenshot --filename=admin-profesional-detalle.png

# Hacer clic en el botón "Aprobar"
playwright-cli click [ref-btn-aprobar]

# Si aparece un diálogo de confirmación, aceptarlo
playwright-cli dialog-accept

playwright-cli snapshot
playwright-cli screenshot --filename=admin-profesional-aprobado.png
```

**Resultado esperado:** Mensaje de éxito. La notificación se actualiza o desaparece. El profesional queda en estado Activo.

---

### Paso 5 — Verificar que el profesional puede ingresar

> Usar **InicioSesion-Playwright.md → Caso 3** con las credenciales del profesional aprobado.

```bash
playwright-cli goto https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "trebol.pro.test@yopmail.com"
playwright-cli fill [ref-password] "Password123!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot

playwright-cli screenshot --filename=profesional-aprobado-login.png
```

**Resultado esperado:** Login exitoso. Redirección a `/HomeProfesional/Index`.

---

## Flujo 2 — Rechazar profesional

### Paso 1 — Login como administrador (si no hay sesión activa)

```bash
playwright-cli open --browser=chrome https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "psicologiatrevol@gmail.com"
playwright-cli fill [ref-password] "Gm41l.C0m"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot
```

---

### Paso 2 — Seleccionar un profesional pendiente y rechazarlo

```bash
# Navegar a la bandeja si no está ya en ella
playwright-cli goto https://localhost:7072/Admin/BandejaNotificaciones
playwright-cli snapshot

# Hacer clic en el botón "Rechazar" de una solicitud
playwright-cli click [ref-btn-rechazar]
playwright-cli snapshot

# Ingresar motivo del rechazo en el campo correspondiente
playwright-cli fill [ref-motivo-rechazo] "Los documentos presentados no son legibles. Por favor, suba documentos de mayor calidad."

playwright-cli click [ref-btn-confirmar-rechazo]
playwright-cli snapshot

playwright-cli screenshot --filename=admin-profesional-rechazado.png
```

**Resultado esperado:** Mensaje de éxito. La solicitud es rechazada y el profesional recibe notificación por correo.

---

### Paso 3 — Verificar que el profesional rechazado no puede ingresar

```bash
playwright-cli goto https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "trebol.pro.rechazado@yopmail.com"
playwright-cli fill [ref-password] "Password123!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot

playwright-cli screenshot --filename=profesional-rechazado-login-bloqueado.png
```

**Resultado esperado:** Error de cuenta bloqueada/pendiente. No permite el acceso.

---

## Flujo 3 — Marcar notificaciones como leídas

```bash
playwright-cli goto https://localhost:7072/Admin/BandejaNotificaciones
playwright-cli snapshot

# Marcar una notificación individual como leída
playwright-cli click [ref-btn-marcar-leida]
playwright-cli snapshot

# Marcar todas las notificaciones como leídas
playwright-cli click [ref-btn-marcar-todas-leidas]
playwright-cli snapshot

playwright-cli screenshot --filename=admin-notificaciones-leidas.png
```

**Resultado esperado:** Las notificaciones marcadas cambian visualmente de estado (no leídas → leídas). El contador de notificaciones se actualiza.

---

## Notas
- Los `[ref-xxx]` deben reemplazarse con refs reales del snapshot.
- Para probar rechazo, registrar un segundo profesional con `trebol.pro.rechazado@yopmail.com` usando **CrearCuentaProfesional-Playwright.md**.
- El admin debe revisar el correo en psicologiatrevol@gmail.com solo si se necesita verificar que el correo de aprobación/rechazo llegó.

# Prueba: Inicio de Sesión
**Funcionalidad cubierta:** Login de todos los roles (Usuario, Profesional, Admin), cierre de sesión y credenciales inválidas.

---

## Prerrequisitos
- La aplicación debe estar corriendo en `https://localhost:7072`
- Contar con al menos una cuenta activa de cada rol (ver dependencias)
- `playwright-cli` instalado y disponible en el PATH

---

## Datos de prueba

| Rol          | Correo                          | Contraseña            |
|--------------|---------------------------------|-----------------------|
| Admin        | psicologiatrevol@gmail.com      | Gm41l.C0m                |
| Usuario      | trebol.usuario.test@yopmail.com | (la usada en registro)|
| Profesional  | trebol.pro.test@yopmail.com     | (la usada en registro)|

> Los correos de usuario y profesional se generan en https://yopmail.com/es/

---

## Caso 1 — Login exitoso como Administrador

```bash
# Abrir navegador Chromium visible
playwright-cli open --browser=chrome https://localhost:7072/Login

# Tomar snapshot para identificar los campos
playwright-cli snapshot

# Completar campo Correo (usar el ref del snapshot)
playwright-cli fill [ref-correo] "psicologiatrevol@gmail.com"

# Completar campo Contraseña
playwright-cli fill [ref-password] "Gm41l.C0m1."

# Hacer clic en el botón Ingresar
playwright-cli click [ref-btn-ingresar]

# Tomar snapshot para verificar redirección
playwright-cli snapshot
```

**Resultado esperado:** Redirección a `/Admin/BandejaNotificaciones`. El menú de navegación muestra el nombre del admin.

---

## Caso 2 — Login exitoso como Usuario

```bash
playwright-cli open --browser=chrome https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "trebol.usuario.test@yopmail.com"
playwright-cli fill [ref-password] "Password123!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot
```

**Resultado esperado:** Redirección a `/HomeUsuario/Index`.

---

## Caso 3 — Login exitoso como Profesional

```bash
playwright-cli open --browser=chrome https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "trebol.pro.test@yopmail.com"
playwright-cli fill [ref-password] "Password123!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot
```

**Resultado esperado:** Redirección a `/HomeProfesional/Index`.

---

## Caso 4 — Credenciales inválidas

```bash
playwright-cli open --browser=chrome https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "correo.invalido@yopmail.com"
playwright-cli fill [ref-password] "ContraseñaIncorrecta"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot
```

**Resultado esperado:** Permanece en `/Login`. Aparece mensaje de error de credenciales inválidas. No hay redirección.

---

## Caso 5 — Cuenta bloqueada / pendiente de aprobación

```bash
playwright-cli open --browser=chrome https://localhost:7072/Login
playwright-cli snapshot

# Usar correo de profesional pendiente de aprobación
playwright-cli fill [ref-correo] "trebol.pro.pendiente@yopmail.com"
playwright-cli fill [ref-password] "Password123!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot
```

**Resultado esperado:** Permanece en `/Login`. Aparece mensaje de cuenta bloqueada/pendiente.

---

## Caso 6 — Cierre de sesión

```bash
# Con sesión activa (ejecutar después de Caso 1, 2 o 3)
playwright-cli snapshot

# Hacer clic en el botón/enlace de Cerrar Sesión
playwright-cli click [ref-btn-logout]
playwright-cli snapshot
```

**Resultado esperado:** Redirección a `/Login`. Al intentar acceder a una ruta protegida como `/HomeUsuario/Index`, debe redirigir al Login nuevamente.

---

## Caso 7 — Formulario vacío (validaciones cliente)

```bash
playwright-cli open --browser=chrome https://localhost:7072/Login
playwright-cli snapshot

# Clic en Ingresar sin llenar campos
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot
```

**Resultado esperado:** Mensajes de validación en ambos campos. No se envía el formulario.

---

## Notas
- Los `[ref-xxx]` deben reemplazarse con los refs reales obtenidos del `playwright-cli snapshot` en el momento de ejecución.
- Usar `playwright-cli screenshot --filename=login-caso-N.png` para documentar evidencia de cada caso.

# Prueba: Restablecer Contraseña
**Funcionalidad cubierta:** Solicitud de recuperación de contraseña → recibir enlace en Yopmail → ingresar nueva contraseña → verificar login con la nueva contraseña.

---

## Prerrequisitos
- La aplicación debe estar corriendo en `https://localhost:7072`
- `playwright-cli` instalado y disponible en el PATH
- Contar con una cuenta de usuario activa con correo en Yopmail
- Dependencia: si se usa una cuenta de test, primero ejecutar **CrearCuentaUsuario-Playwright.md** para crearla

---

## Datos de prueba

| Campo           | Valor                                     |
|-----------------|-------------------------------------------|
| Correo          | trebol.usuario.test@yopmail.com           |
| Contraseña actual| Password123!                             |
| Nueva contraseña| NuevoPass456!                             |

---

## Flujo completo

### Paso 1 — Navegar a solicitar recuperación

```bash
playwright-cli open --browser=chrome https://localhost:7072/Recuperacion/SolicitarRecuperacion
playwright-cli snapshot
```

**Resultado esperado:** Formulario con campo de correo electrónico y botón para solicitar recuperación.

---

### Paso 2 — Ingresar correo registrado

```bash
playwright-cli fill [ref-correo] "trebol.usuario.test@yopmail.com"
playwright-cli screenshot --filename=recuperacion-solicitar.png
playwright-cli click [ref-btn-solicitar]
playwright-cli snapshot
```

**Resultado esperado:** Mensaje genérico: "Si el correo existe, recibirás un enlace de recuperación en breve." La página permanece en `/Recuperacion/SolicitarRecuperacion`.

---

### Paso 3 — Abrir Yopmail y buscar el correo de recuperación

```bash
playwright-cli tab-new https://yopmail.com/es/
playwright-cli snapshot

playwright-cli fill [ref-input-yopmail] "trebol.usuario.test"
playwright-cli press Enter
playwright-cli snapshot
```

**Resultado esperado:** Bandeja de entrada de Yopmail con un correo de recuperación de contraseña de Trebol.

---

### Paso 4 — Abrir el correo y obtener el enlace

```bash
playwright-cli click [ref-correo-recuperacion]
playwright-cli snapshot
```

> Leer el enlace de recuperación del cuerpo del correo. Tiene la forma:
> `https://localhost:7072/Recuperacion/RestablecerPassword?token=XXXX`
> Copiar el token o el enlace completo.

---

### Paso 5 — Navegar al enlace de restablecimiento

```bash
# Opción A: navegar directamente al enlace del correo
playwright-cli tab-select 0
playwright-cli goto "https://localhost:7072/Recuperacion/RestablecerPassword?token=[TOKEN_DEL_CORREO]"
playwright-cli snapshot
```

**Resultado esperado:** Formulario para ingresar nueva contraseña con el token prellenado.

---

### Paso 6 — Ingresar nueva contraseña

```bash
playwright-cli fill [ref-nueva-password] "NuevoPass456!"
playwright-cli fill [ref-confirmar-password] "NuevoPass456!"
playwright-cli screenshot --filename=recuperacion-nueva-password.png
playwright-cli click [ref-btn-restablecer]
playwright-cli snapshot
```

**Resultado esperado:** Mensaje: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." Redirección a `/Login`.

---

### Paso 7 — Verificar login con nueva contraseña

> Este paso usa **InicioSesion-Playwright.md → Caso 2** con la nueva contraseña.

```bash
playwright-cli snapshot

playwright-cli fill [ref-correo] "trebol.usuario.test@yopmail.com"
playwright-cli fill [ref-password] "NuevoPass456!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot

playwright-cli screenshot --filename=recuperacion-login-nueva-password.png
```

**Resultado esperado:** Login exitoso. Redirección a `/HomeUsuario/Index`. La contraseña fue cambiada correctamente.

---

### Paso 8 — Verificar que la contraseña anterior ya no funciona

```bash
playwright-cli goto https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "trebol.usuario.test@yopmail.com"
playwright-cli fill [ref-password] "Password123!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot

playwright-cli screenshot --filename=recuperacion-password-antigua-invalida.png
```

**Resultado esperado:** Error de credenciales inválidas. La contraseña anterior ya no es válida.

---

## Caso adicional — Correo no registrado (seguridad anti-enumeración)

```bash
playwright-cli open --browser=chrome https://localhost:7072/Recuperacion/SolicitarRecuperacion
playwright-cli snapshot

playwright-cli fill [ref-correo] "correo.inexistente@yopmail.com"
playwright-cli click [ref-btn-solicitar]
playwright-cli snapshot
```

**Resultado esperado:** El sistema muestra el **mismo mensaje genérico** que si el correo existiera. No debe revelar si el correo está o no registrado.

---

## Caso adicional — Token inválido o expirado

```bash
playwright-cli open --browser=chrome "https://localhost:7072/Recuperacion/RestablecerPassword?token=TOKEN_INVENTADO_INVALIDO"
playwright-cli snapshot

playwright-cli fill [ref-nueva-password] "NuevoPass456!"
playwright-cli fill [ref-confirmar-password] "NuevoPass456!"
playwright-cli click [ref-btn-restablecer]
playwright-cli snapshot
```

**Resultado esperado:** Mensaje de error indicando que el token es inválido o ha expirado. No se actualiza la contraseña.

---

## Caso adicional — Formulario de solicitud vacío

```bash
playwright-cli open --browser=chrome https://localhost:7072/Recuperacion/SolicitarRecuperacion
playwright-cli snapshot
playwright-cli click [ref-btn-solicitar]
playwright-cli snapshot
```

**Resultado esperado:** Mensaje de validación: campo de correo es requerido.

---

## Notas
- Después de restablecer la contraseña en una prueba, actualizar el dato de prueba para las siguientes pruebas que dependan del login.
- Los `[ref-xxx]` deben reemplazarse con refs reales del snapshot.
- Usar `playwright-cli screenshot` en cada paso clave para documentar evidencia.

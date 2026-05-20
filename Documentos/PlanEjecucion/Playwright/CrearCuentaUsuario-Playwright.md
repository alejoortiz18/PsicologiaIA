# Prueba: Crear Cuenta de Usuario
**Funcionalidad cubierta:** Registro completo de usuario — selección de perfil → formulario → correo de activación en Yopmail → activar cuenta → primer login.

---

## Prerrequisitos
- La aplicación debe estar corriendo en `https://localhost:7072`
- `playwright-cli` instalado y disponible en el PATH
- Acceso a https://yopmail.com/es/ para recibir el correo de activación

---

## Datos de prueba

| Campo              | Valor de prueba                         |
|--------------------|-----------------------------------------|
| Nombre completo    | Juan Test Usuario                       |
| Correo             | trebol.usuario.test@yopmail.com         |
| Número documento   | 1234567890                              |
| Contraseña         | Password123!                            |

> **Correo yopmail:** el bandeja se consulta en https://yopmail.com/es/ escribiendo `trebol.usuario.test` en el campo de búsqueda.

---

## Flujo completo

### Paso 1 — Navegar a selección de perfil

```bash
playwright-cli open --browser=chrome https://localhost:7072/Registro/SeleccionPerfil
playwright-cli snapshot
```

**Resultado esperado:** Pantalla con dos opciones: "Soy Usuario" y "Soy Profesional".

---

### Paso 2 — Seleccionar perfil Usuario

```bash
# Hacer clic en el botón/tarjeta de "Usuario"
playwright-cli click [ref-opcion-usuario]
playwright-cli snapshot
```

**Resultado esperado:** Redirección a `/Registro/RegistroUsuario`. Se muestra el formulario de registro.

---

### Paso 3 — Llenar el formulario de registro

```bash
playwright-cli snapshot

playwright-cli fill [ref-nombre-completo] "Juan Test Usuario"
playwright-cli fill [ref-correo] "trebol.usuario.test@yopmail.com"
playwright-cli fill [ref-numero-documento] "1234567890"
playwright-cli fill [ref-password] "Password123!"
playwright-cli fill [ref-confirm-password] "Password123!"

playwright-cli screenshot --filename=registro-usuario-formulario.png

# Enviar formulario
playwright-cli click [ref-btn-registrar]
playwright-cli snapshot
```

**Resultado esperado:** Redirección a `/Registro/ActivarCuenta`. Aparece un mensaje indicando que se envió un correo de confirmación.

---

### Paso 4 — Abrir Yopmail y obtener el token de activación

```bash
# Abrir nueva pestaña para Yopmail
playwright-cli tab-new https://yopmail.com/es/

playwright-cli snapshot

# Ingresar el correo en el campo de búsqueda de Yopmail
playwright-cli fill [ref-input-yopmail] "trebol.usuario.test"
playwright-cli press Enter
playwright-cli snapshot
```

**Resultado esperado:** Se muestra la bandeja de entrada con un correo de "Trebol" o "reisavertv".

---

### Paso 5 — Leer el correo y copiar el token

```bash
# Hacer clic en el correo de activación
playwright-cli click [ref-correo-activacion]
playwright-cli snapshot

# Leer el contenido del correo para obtener el token o código de activación
playwright-cli eval "document.querySelector('[ref-iframe-correo]')?.contentDocument?.body?.innerText"
```

> **Nota:** Yopmail muestra el correo en un iframe. Si el contenido no es directamente accesible, hacer clic en "Ver en una pestaña nueva" o copiar visualmente el token desde la pantalla.

**Resultado esperado:** El correo contiene un código/token de activación o un enlace con el token. Anotar ese valor.

---

### Paso 6 — Ingresar el token de activación

```bash
# Volver a la pestaña de la aplicación
playwright-cli tab-select 0
playwright-cli snapshot

# Ingresar el token copiado desde el correo
playwright-cli fill [ref-token-activacion] "[TOKEN_DEL_CORREO]"
playwright-cli click [ref-btn-activar]
playwright-cli snapshot
```

**Resultado esperado:** Mensaje de éxito. Redirección automática a `/Login`.

---

### Paso 7 — Verificar login con la cuenta activada

> Este paso usa el procedimiento de **InicioSesion-Playwright.md → Caso 2**.

```bash
playwright-cli fill [ref-correo] "trebol.usuario.test@yopmail.com"
playwright-cli fill [ref-password] "Password123!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot

playwright-cli screenshot --filename=registro-usuario-login-exitoso.png
```

**Resultado esperado:** Redirección a `/HomeUsuario/Index`. La cuenta está activa y operativa.

---

## Caso adicional — Correo ya registrado

```bash
playwright-cli open --browser=chrome https://localhost:7072/Registro/RegistroUsuario
playwright-cli snapshot

playwright-cli fill [ref-nombre-completo] "Otro Usuario"
playwright-cli fill [ref-correo] "trebol.usuario.test@yopmail.com"
playwright-cli fill [ref-numero-documento] "9999999999"
playwright-cli fill [ref-password] "Password123!"
playwright-cli fill [ref-confirm-password] "Password123!"
playwright-cli click [ref-btn-registrar]
playwright-cli snapshot
```

**Resultado esperado:** Error de validación indicando que el correo ya está registrado.

---

## Caso adicional — Contraseñas que no coinciden

```bash
playwright-cli open --browser=chrome https://localhost:7072/Registro/RegistroUsuario
playwright-cli snapshot

playwright-cli fill [ref-nombre-completo] "Nuevo Usuario"
playwright-cli fill [ref-correo] "trebol.nuevo@yopmail.com"
playwright-cli fill [ref-numero-documento] "1111111111"
playwright-cli fill [ref-password] "Password123!"
playwright-cli fill [ref-confirm-password] "OtraPassword456!"
playwright-cli click [ref-btn-registrar]
playwright-cli snapshot
```

**Resultado esperado:** Error de validación. Las contraseñas no coinciden. No se procesa el registro.

---

## Notas
- Los `[ref-xxx]` deben reemplazarse con los refs reales obtenidos del `playwright-cli snapshot`.
- Cada correo de prueba es único. Variar el nombre del correo en Yopmail para pruebas repetidas, ej: `trebol.usuario.test2@yopmail.com`.
- Documentar evidencia con `playwright-cli screenshot --filename=nombre.png` en cada paso clave.

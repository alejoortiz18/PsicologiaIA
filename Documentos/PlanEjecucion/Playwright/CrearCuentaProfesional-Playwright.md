# Prueba: Crear Cuenta de Profesional
**Funcionalidad cubierta:** Registro completo de profesional — selección de perfil → formulario + archivos PDF → correo de activación en Yopmail → activar cuenta (estado Pendiente) → el admin aprueba → primer login.

---

## Prerrequisitos
- La aplicación debe estar corriendo en `https://localhost:7072`
- `playwright-cli` instalado y disponible en el PATH
- Acceso a https://yopmail.com/es/ para recibir el correo de activación
- Archivos de prueba disponibles en `Documentos/ArchivosPrueba/`:
  - `CedulaPrueba.pdf`
  - `TarjetaProfesionalPrueba.pdf`
- Cuenta admin activa (ver `InicioSesion-Playwright.md → Caso 1`)

---

## Datos de prueba

| Campo               | Valor de prueba                          |
|---------------------|------------------------------------------|
| Nombre completo     | Dra. Ana Test Profesional                |
| Correo              | trebol.pro.test@yopmail.com              |
| Número documento    | 9876543210                               |
| Número de registro  | PSI-001-2026                             |
| Especialidad        | (seleccionar la primera disponible)      |
| Contraseña          | Password123!                             |
| Cédula PDF          | Documentos/ArchivosPrueba/CedulaPrueba.pdf |
| Tarjeta profesional | Documentos/ArchivosPrueba/TarjetaProfesionalPrueba.pdf |

> **Correo yopmail:** consultar en https://yopmail.com/es/ con el nombre `trebol.pro.test`

---

## Flujo completo

### Paso 1 — Navegar a selección de perfil

```bash
playwright-cli open --browser=chrome https://localhost:7072/Registro/SeleccionPerfil
playwright-cli snapshot
```

**Resultado esperado:** Pantalla con opciones "Soy Usuario" y "Soy Profesional".

---

### Paso 2 — Seleccionar perfil Profesional

```bash
playwright-cli click [ref-opcion-profesional]
playwright-cli snapshot
```

**Resultado esperado:** Redirección a `/Registro/RegistroProfesional`. Se muestra el formulario con campos adicionales.

---

### Paso 3 — Llenar el formulario de registro profesional

```bash
playwright-cli snapshot

playwright-cli fill [ref-nombre-completo] "Dra. Ana Test Profesional"
playwright-cli fill [ref-correo] "trebol.pro.test@yopmail.com"
playwright-cli fill [ref-numero-documento] "9876543210"
playwright-cli fill [ref-numero-registro] "PSI-001-2026"

# Seleccionar especialidad del dropdown
playwright-cli select [ref-especialidad] [valor-primera-opcion]

playwright-cli fill [ref-password] "Password123!"
playwright-cli fill [ref-confirm-password] "Password123!"
```

---

### Paso 4 — Subir archivos PDF de prueba

```bash
# Subir cédula (CedulaPrueba.pdf)
playwright-cli upload [ref-input-cedula] "e:\Proyecto Psicologia\Proyecto con IA\PsicologiaIA\Documentos\ArchivosPrueba\CedulaPrueba.pdf"

# Subir tarjeta profesional (TarjetaProfesionalPrueba.pdf)
playwright-cli upload [ref-input-tarjeta] "e:\Proyecto Psicologia\Proyecto con IA\PsicologiaIA\Documentos\ArchivosPrueba\TarjetaProfesionalPrueba.pdf"

playwright-cli screenshot --filename=registro-profesional-formulario.png

# Enviar formulario
playwright-cli click [ref-btn-registrar]
playwright-cli snapshot
```

**Resultado esperado:** Redirección a `/Registro/ActivarCuentaProfesional`. Mensaje indicando que se envió correo de activación.

---

### Paso 5 — Abrir Yopmail y obtener el token

> **Tiempo máximo de espera en bandeja Yopmail del profesional:** 10 segundos (el script `Test/CrearCuentaProfesional.js` hace reintentos cada ~2s dentro de ese límite).

```bash
playwright-cli tab-new https://yopmail.com/es/
playwright-cli snapshot

playwright-cli fill [ref-input-yopmail] "trebol.pro.test"
playwright-cli press Enter
playwright-cli snapshot
```

**Resultado esperado:** Bandeja de entrada con correo de activación de Trebol.

---

### Paso 6 — Validar formato y leer el token del correo de confirmación

```bash
playwright-cli click [ref-correo-activacion]
playwright-cli snapshot
```

#### Validar estructura del correo de confirmación:

El correo debe coincidir con el formato de **confirmacion_preview.html** (ver `Test/email-preview/confirmacion_preview.html`):

- ✅ Encabezado con gradiente verde (Trébol: `#1A3C34` a `#2D6A4F`)
- ✅ Emoji 🍀 en el título
- ✅ Título: "Confirma tu correo" 
- ✅ Subtítulo: "Hola [Nombre], un paso más para unirte a Trébol"
- ✅ Cuerpo: Mención a "solicitud de registro como profesional en Trébol"
- ✅ Recuadro informativo: "Este enlace es válido por **72 horas**"
- ✅ Botón negro redondeado: "✅ Confirmar correo y crear contraseña"
- ✅ Enlace alternativo con token visible
- ✅ Pie de página: "© 2026 Trébol · Plataforma de Psicología · Correo automático, no respondas."

```bash
# Verificar elementos visuales del correo
playwright-cli evaluate "document.body.innerHTML.includes('Confirma tu correo')" # Debe ser true
playwright-cli evaluate "document.body.innerHTML.includes('72 horas')" # Debe ser true
playwright-cli evaluate "document.body.innerHTML.includes('Confirmar correo')" # Debe ser true
```

> Leer el token o código de activación del URL o del cuerpo del correo. Anotarlo para el siguiente paso.

---

### Paso 7 — Activar cuenta profesional

```bash
playwright-cli tab-select 0
playwright-cli snapshot

playwright-cli fill [ref-token-activacion] "[TOKEN_DEL_CORREO]"
playwright-cli click [ref-btn-activar]
playwright-cli snapshot
```

**Resultado esperado:** Mensaje de activación exitosa. Redirección a `/Login`. La cuenta queda en estado **Pendiente** (no puede ingresar aún hasta aprobación del admin).

---

### Paso 8 — Verificar que el login está bloqueado (estado Pendiente)

> Usar **InicioSesion-Playwright.md → Caso 5** con las credenciales del profesional recién creado.

```bash
playwright-cli goto https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "trebol.pro.test@yopmail.com"
playwright-cli fill [ref-password] "Password123!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot

playwright-cli screenshot --filename=profesional-pendiente-bloqueado.png
```

**Resultado esperado:** Error de cuenta pendiente/bloqueada. No permite ingresar.

---

### Paso 9 — Admin aprueba al profesional y validar correo de confirmación

> Este paso usa el procedimiento de **AprobacionProfesional-Playwright.md**.  
> Después de la aprobación, continuar con el Sub-paso 9.1.

---

#### Sub-paso 9.1 — Verificar correo de confirmación en Yopmail

Después de que el admin aprueba al profesional, debe llegar un correo de bienvenida/confirmación en la bandeja de Yopmail.

```bash
playwright-cli tab-select 1
playwright-cli snapshot

# Actualizar bandeja de Yopmail para recibir nuevo correo
playwright-cli press F5
playwright-cli wait 2000
playwright-cli snapshot
```

**Resultado esperado:** Nuevo correo de bienvenida/confirmación visible en la bandeja.

```bash
# Abrir el correo de bienvenida (debe ser diferente al de confirmación anterior)
playwright-cli click [ref-correo-bienvenida]
playwright-cli snapshot
```

#### Validar estructura del correo de bienvenida/aprobación:

El correo debe coincidir con el formato de **bienvenida_preview.html** (ver `Test/email-preview/bienvenida_preview.html`):

- ✅ Encabezado con gradiente verde (Trébol: `#1A3C34` a `#52B788`)
- ✅ Emoji 🍀 grande en el título
- ✅ Título: "¡Bienvenido a Trébol, [Nombre]!"
- ✅ Subtítulo: "Tu solicitud fue **aprobada**. Ya puedes ingresar a la plataforma."
- ✅ Recuadro de confirmación: Emoji ✅ + "¡Tu cuenta está activa y lista para usar!"
- ✅ Texto: "Ahora puedes iniciar sesión con tu correo y contraseña, publicar salas de conferencia, gestionar citas..."
- ✅ Botón negro redondeado: "Ir al inicio de sesión →"
- ✅ Enlace del botón apunta a `/Login`
- ✅ Pie de página: "© 2026 Trébol · Plataforma de Psicología"

```bash
# Verificar elementos visuales del correo de bienvenida
playwright-cli evaluate "document.body.innerHTML.includes('¡Bienvenido')" # Debe ser true
playwright-cli evaluate "document.body.innerHTML.includes('Tu solicitud fue')" # Debe ser true
playwright-cli evaluate "document.body.innerHTML.includes('Tu cuenta está activa')" # Debe ser true
playwright-cli evaluate "document.body.innerHTML.includes('Ir al inicio de sesión')" # Debe ser true
```

**Validación completada:** El formato del correo es correcto con todos los elementos esperados.

---

### Paso 10 — Primer login del profesional aprobado

```bash
playwright-cli tab-select 0
playwright-cli goto https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "trebol.pro.test@yopmail.com"
playwright-cli fill [ref-password] "Password123!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot

playwright-cli screenshot --filename=profesional-login-exitoso.png
```

**Resultado esperado:** Redirección a `/HomeProfesional/Index`. Cuenta activa y operativa.

---

## Resumen de Validaciones por Paso

| Paso | Correo | Tipo | Validaciones de Formato |
|------|--------|------|------------------------|
| 4 | Confirmación | Activación | Logo 🍀, "Confirma tu correo", "72 horas", botón "Confirmar correo" |
| 9.1 | Bienvenida | Aprobación | Logo 🍀, "¡Bienvenido", "aprobada", ✅ "Tu cuenta está activa", botón "Ir al inicio de sesión" |
| Resultado final | N/A | Login | Acceso permitido a `/HomeProfesional/Index` |

---

## Caso adicional — Formulario sin archivos PDF

```bash
playwright-cli open --browser=chrome https://localhost:7072/Registro/RegistroProfesional
playwright-cli snapshot

playwright-cli fill [ref-nombre-completo] "Test Sin Archivos"
playwright-cli fill [ref-correo] "trebol.sinarchivos@yopmail.com"
playwright-cli fill [ref-numero-documento] "5555555555"
playwright-cli fill [ref-numero-registro] "PSI-999"
playwright-cli select [ref-especialidad] [valor-primera-opcion]
playwright-cli fill [ref-password] "Password123!"
playwright-cli fill [ref-confirm-password] "Password123!"

# NO subir ningún archivo PDF
playwright-cli click [ref-btn-registrar]
playwright-cli snapshot
```

**Resultado esperado:** Error de validación indicando que los archivos PDF son requeridos.

---

## Notas
- Los `[ref-xxx]` deben reemplazarse con los refs reales del `playwright-cli snapshot`.
- Siempre usar los PDFs de `Documentos/ArchivosPrueba/` para las pruebas de inscripción.
- Usar correos distintos de Yopmail para cada ejecución de prueba, ej: `trebol.pro.test2@yopmail.com`.
- El flujo completo requiere también ejecutar **AprobacionProfesional-Playwright.md** para completar el ciclo.
- **Validaciones de Correo:** Los formatos esperados de correo están almacenados en `Test/email-preview/`:
  - `confirmacion_preview.html` — Para correos de confirmación/activación (Pasos 4-6)
  - `bienvenida_preview.html` — Para correos de bienvenida/aprobación (Paso 9.1)
- Utilizar `playwright-cli evaluate` para validar que elementos HTML clave estén presentes en cada correo.
- Los correos deben incluir estilos consistentes: gradientes verdes, emojis (🍀, ✅), botones redondeados negros y pies de página con branding.

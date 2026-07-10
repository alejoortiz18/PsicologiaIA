# Prueba: Gestión de Perfil (Usuario y Profesional)
**Funcionalidad cubierta:** Ver y actualizar perfil del usuario (nombre, foto), ver y actualizar perfil del profesional (nombre, especialidad, foto).

---

## Prerrequisitos
- La aplicación debe estar corriendo en `https://localhost:7072`
- `playwright-cli` instalado y disponible en el PATH
- Dependencias requeridas:
  - Cuenta de usuario activa → **CrearCuentaUsuario-Playwright.md**
  - Cuenta de profesional activa y aprobada → **CrearCuentaProfesional-Playwright.md** + **AprobacionProfesional-Playwright.md**

---

## Datos de prueba

| Rol          | Correo                              | Contraseña    |
|--------------|-------------------------------------|---------------|
| Usuario      | trebol.usuario.test@yopmail.com     | Password123!  |
| Profesional  | trebol.pro.test@yopmail.com         | Password123!  |

---

## Flujo 1 — Perfil del Usuario

### Paso 1 — Login como usuario

```bash
playwright-cli open --browser=chrome https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "trebol.usuario.test@yopmail.com"
playwright-cli fill [ref-password] "Password123!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot
```

---

### Paso 2 — Navegar al perfil

```bash
playwright-cli goto https://localhost:7072/PerfilUsuario/Index
playwright-cli snapshot
playwright-cli screenshot --filename=perfil-usuario-inicial.png
```

**Resultado esperado:** Vista del perfil con los datos actuales del usuario: nombre completo, correo, número de documento, y foto (o avatar por defecto).

---

### Paso 3 — Actualizar nombre

```bash
# Limpiar el campo de nombre y escribir el nuevo valor
playwright-cli triple-click [ref-nombre-completo]
playwright-cli fill [ref-nombre-completo] "Juan Actualizado"

playwright-cli screenshot --filename=perfil-usuario-editado.png
playwright-cli click [ref-btn-guardar]
playwright-cli snapshot

playwright-cli screenshot --filename=perfil-usuario-guardado.png
```

**Resultado esperado:** Mensaje de éxito "Perfil actualizado". El nombre se refleja en el perfil y en el menú de navegación.

---

### Paso 4 — Subir foto de perfil

```bash
playwright-cli goto https://localhost:7072/PerfilUsuario/Index
playwright-cli snapshot

# Subir una imagen de perfil (usar cualquier imagen disponible)
playwright-cli upload [ref-input-foto] "e:\Proyecto Psicologia\Proyecto con IA\PsicologiaIA\Documentos\imagenes\[imagen-de-prueba.jpg]"

playwright-cli click [ref-btn-guardar]
playwright-cli snapshot

playwright-cli screenshot --filename=perfil-usuario-con-foto.png
```

**Resultado esperado:** La foto de perfil se actualiza visualmente en el perfil y en el avatar del menú.

---

### Paso 5 — Validar campos requeridos vacíos

```bash
playwright-cli goto https://localhost:7072/PerfilUsuario/Index
playwright-cli snapshot

# Vaciar el campo de nombre
playwright-cli triple-click [ref-nombre-completo]
playwright-cli fill [ref-nombre-completo] ""

playwright-cli click [ref-btn-guardar]
playwright-cli snapshot
```

**Resultado esperado:** Mensaje de validación: el nombre es requerido. No se guarda.

---

## Flujo 2 — Perfil del Profesional

### Paso 1 — Login como profesional

```bash
playwright-cli open --browser=chrome https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "trebol.pro.test@yopmail.com"
playwright-cli fill [ref-password] "Password123!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot
```

---

### Paso 2 — Navegar al perfil profesional

```bash
playwright-cli goto https://localhost:7072/PerfilProfesional/Index
playwright-cli snapshot
playwright-cli screenshot --filename=perfil-profesional-inicial.png
```

**Resultado esperado:** Vista del perfil con los datos del profesional: nombre, especialidad, número de registro, correo, y foto.

---

### Paso 3 — Actualizar información profesional

```bash
# Actualizar nombre
playwright-cli triple-click [ref-nombre-completo]
playwright-cli fill [ref-nombre-completo] "Dra. Ana Test Profesional Actualizada"

# Actualizar descripción/biografía si existe el campo
playwright-cli triple-click [ref-descripcion]
playwright-cli fill [ref-descripcion] "Psicóloga clínica con 10 años de experiencia en terapia cognitivo-conductual."

playwright-cli screenshot --filename=perfil-profesional-editado.png
playwright-cli click [ref-btn-guardar]
playwright-cli snapshot

playwright-cli screenshot --filename=perfil-profesional-guardado.png
```

**Resultado esperado:** Mensaje de éxito. Los cambios se reflejan en el perfil.

---

### Paso 4 — Subir foto de perfil profesional

```bash
playwright-cli goto https://localhost:7072/PerfilProfesional/Index
playwright-cli snapshot

playwright-cli upload [ref-input-foto] "e:\Proyecto Psicologia\Proyecto con IA\PsicologiaIA\Documentos\imagenes\[imagen-de-prueba.jpg]"

playwright-cli click [ref-btn-guardar]
playwright-cli snapshot

playwright-cli screenshot --filename=perfil-profesional-con-foto.png
```

**Resultado esperado:** Foto de perfil actualizada en el perfil y en el menú de navegación.

---

### Paso 5 — Verificar que el perfil público refleja los cambios

```bash
# El profesional tiene un perfil público accesible por usuarios
# Usar el ID del profesional
playwright-cli goto https://localhost:7072/PerfilOrador/[id-del-profesional]
playwright-cli snapshot

playwright-cli screenshot --filename=perfil-orador-publico.png
```

**Resultado esperado:** El perfil público del profesional muestra los datos actualizados (nombre, foto, descripción, especialidad).

---

## Caso adicional — Foto con formato inválido

```bash
playwright-cli goto https://localhost:7072/PerfilUsuario/Index
playwright-cli snapshot

# Intentar subir un PDF como foto
playwright-cli upload [ref-input-foto] "e:\Proyecto Psicologia\Proyecto con IA\PsicologiaIA\Documentos\ArchivosPrueba\CedulaPrueba.pdf"

playwright-cli click [ref-btn-guardar]
playwright-cli snapshot
```

**Resultado esperado:** Error de validación indicando que el formato del archivo no es válido para foto de perfil.

---

## Notas
- Los `[ref-xxx]` deben reemplazarse con refs reales del snapshot.
- Si no hay imágenes de prueba en `Documentos/imagenes/`, usar cualquier imagen `.jpg` o `.png` disponible localmente.
- Usar `playwright-cli screenshot` en cada paso para documentar el antes y después del perfil.

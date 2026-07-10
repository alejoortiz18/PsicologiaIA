# Prueba: Gestión de Salas de Conferencia
**Funcionalidad cubierta:** El profesional crea una sala de conferencia, ve su lista de salas, consulta el detalle, y cierra una sala. El usuario se inscribe a una sala disponible.

---

## Prerrequisitos
- La aplicación debe estar corriendo en `https://localhost:7072`
- `playwright-cli` instalado y disponible en el PATH
- Dependencias requeridas:
  - Cuenta de profesional activa y aprobada → **CrearCuentaProfesional-Playwright.md** + **AprobacionProfesional-Playwright.md**
  - Cuenta de usuario activa → **CrearCuentaUsuario-Playwright.md** (para prueba de inscripción)

---

## Datos de prueba

| Rol          | Correo                              | Contraseña    |
|--------------|-------------------------------------|---------------|
| Profesional  | trebol.pro.test@yopmail.com         | Password123!  |
| Usuario      | trebol.usuario.test@yopmail.com     | Password123!  |

---

## Flujo 1 — Profesional crea una sala

### Paso 1 — Login como profesional

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

### Paso 2 — Navegar a la sección de Salas

```bash
playwright-cli goto https://localhost:7072/Salas/Index
playwright-cli snapshot
playwright-cli screenshot --filename=salas-lista-vacia.png
```

**Resultado esperado:** Lista de salas del profesional (puede estar vacía en la primera ejecución).

---

### Paso 3 — Crear nueva sala

```bash
playwright-cli click [ref-btn-nueva-sala]
playwright-cli snapshot

# Llenar el formulario de creación de sala
playwright-cli fill [ref-titulo-sala] "Taller de Manejo del Estrés"
playwright-cli fill [ref-descripcion-sala] "Sesión grupal para técnicas de reducción de estrés y ansiedad."
playwright-cli fill [ref-fecha-sala] "2026-07-15"
playwright-cli fill [ref-hora-sala] "15:00"
playwright-cli fill [ref-capacidad-sala] "20"
playwright-cli fill [ref-precio-sala] "50000"

playwright-cli screenshot --filename=salas-nueva-formulario.png
playwright-cli click [ref-btn-crear-sala]
playwright-cli snapshot
```

**Resultado esperado:** Mensaje de éxito: sala creada. Redirección a `/Salas/Index` con la nueva sala en la lista.

---

### Paso 4 — Ver lista de salas creadas

```bash
playwright-cli snapshot
playwright-cli screenshot --filename=salas-lista-con-sala.png
```

**Resultado esperado:** La sala "Taller de Manejo del Estrés" aparece en la lista con su información básica.

---

### Paso 5 — Ver detalle de la sala

```bash
playwright-cli click [ref-btn-detalle-sala]
playwright-cli snapshot
playwright-cli screenshot --filename=salas-detalle.png
```

**Resultado esperado:** Vista de detalle con: título, descripción, fecha, hora, capacidad total, inscritos actuales y precio.

---

### Paso 6 — Cerrar la sala

```bash
# Desde la lista o el detalle, hacer clic en "Cerrar sala"
playwright-cli click [ref-btn-cerrar-sala]

# Si aparece diálogo de confirmación
playwright-cli dialog-accept

playwright-cli snapshot
playwright-cli screenshot --filename=salas-cerrada.png
```

**Resultado esperado:** La sala cambia a estado "Cerrada". Los usuarios inscritos no pueden unirse.

---

## Flujo 2 — Usuario se inscribe a una sala

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

### Paso 2 — Buscar salas disponibles

```bash
# Navegar al perfil del orador/profesional o al directorio que muestra salas
playwright-cli goto https://localhost:7072/PerfilOrador/[id-del-profesional]
playwright-cli snapshot

playwright-cli screenshot --filename=salas-disponibles-usuario.png
```

**Resultado esperado:** Se muestran las salas abiertas del profesional con botón de inscripción.

---

### Paso 3 — Inscribirse a la sala

```bash
playwright-cli click [ref-btn-inscribirse]
playwright-cli snapshot

playwright-cli screenshot --filename=salas-inscripcion-exitosa.png
```

**Resultado esperado:** Mensaje de éxito. El usuario queda inscrito. El botón puede cambiar a "Ya inscrito" o "Pagar inscripción".

---

## Caso adicional — Formulario de sala vacío

```bash
playwright-cli goto https://localhost:7072/Salas/Nueva
playwright-cli snapshot

playwright-cli click [ref-btn-crear-sala]
playwright-cli snapshot
```

**Resultado esperado:** Mensajes de validación en todos los campos requeridos. No se crea la sala.

---

## Caso adicional — Usuario intenta acceder a /Salas/Index (solo profesionales)

```bash
# Con sesión activa como usuario
playwright-cli goto https://localhost:7072/Salas/Index
playwright-cli snapshot
```

**Resultado esperado:** Redirección a `/Login` o página de acceso denegado. Los usuarios no tienen acceso a la gestión de salas.

---

## Notas
- Los `[ref-xxx]` deben reemplazarse con refs reales del snapshot.
- Para probar la inscripción del usuario se necesita el ID del profesional en la URL de perfil del orador.
- Usar `playwright-cli screenshot` en cada paso para documentar evidencia.

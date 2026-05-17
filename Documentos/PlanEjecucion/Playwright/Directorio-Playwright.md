# Prueba: Directorio de Profesionales
**Funcionalidad cubierta:** El usuario navega por el directorio de psicólogos y especialistas, aplica filtros, sigue y deja de seguir a un profesional. El profesional ve sus mentores y colegas, y gestiona la relación de colega.

---

## Prerrequisitos
- La aplicación debe estar corriendo en `https://localhost:7072`
- `playwright-cli` instalado y disponible en el PATH
- Dependencias requeridas:
  - Cuenta de usuario activa → **CrearCuentaUsuario-Playwright.md**
  - Al menos un profesional aprobado → **CrearCuentaProfesional-Playwright.md** + **AprobacionProfesional-Playwright.md**
  - Para colegas/mentores: al menos dos profesionales aprobados

---

## Datos de prueba

| Rol          | Correo                              | Contraseña    |
|--------------|-------------------------------------|---------------|
| Usuario      | trebol.usuario.test@yopmail.com     | Password123!  |
| Profesional  | trebol.pro.test@yopmail.com         | Password123!  |

---

## Flujo 1 — Usuario explora el directorio de psicólogos

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

### Paso 2 — Navegar al directorio de psicólogos

```bash
playwright-cli goto https://localhost:7072/Directorio/Psicologos
playwright-cli snapshot
playwright-cli screenshot --filename=directorio-psicologos.png
```

**Resultado esperado:** Lista de psicólogos disponibles con su nombre, especialidad, foto y opciones de acción (agendar cita, enviar mensaje, seguir).

---

### Paso 3 — Aplicar filtros de búsqueda

```bash
# Filtrar por nombre
playwright-cli fill [ref-filtro-nombre] "Ana"
playwright-cli click [ref-btn-buscar]
playwright-cli snapshot
playwright-cli screenshot --filename=directorio-filtro-nombre.png

# Filtrar por especialidad
playwright-cli fill [ref-filtro-especialidad] "Clínica"
playwright-cli click [ref-btn-buscar]
playwright-cli snapshot
playwright-cli screenshot --filename=directorio-filtro-especialidad.png

# Limpiar filtros
playwright-cli goto https://localhost:7072/Directorio/Psicologos
playwright-cli snapshot
```

**Resultado esperado:** La lista se filtra según los criterios ingresados. Sin resultados muestra un mensaje apropiado.

---

### Paso 4 — Seguir a un profesional

```bash
playwright-cli goto https://localhost:7072/Directorio/Psicologos
playwright-cli snapshot

# Hacer clic en "Seguir" del profesional de prueba
playwright-cli click [ref-btn-seguir-profesional]
playwright-cli snapshot

playwright-cli screenshot --filename=directorio-siguiendo-profesional.png
```

**Resultado esperado:** El botón cambia a "Dejar de seguir" o similar. El contador de seguidores del profesional aumenta.

---

### Paso 5 — Dejar de seguir al profesional

```bash
playwright-cli click [ref-btn-dejar-seguir]
playwright-cli snapshot

playwright-cli screenshot --filename=directorio-dejado-seguir.png
```

**Resultado esperado:** El botón vuelve a "Seguir". El contador de seguidores disminuye.

---

### Paso 6 — Navegar al directorio de especialistas

```bash
playwright-cli goto https://localhost:7072/Directorio/Especialistas
playwright-cli snapshot
playwright-cli screenshot --filename=directorio-especialistas.png
```

**Resultado esperado:** Lista de especialistas con los mismos controles de acción que el directorio de psicólogos.

---

## Flujo 2 — Profesional gestiona colegas y mentores

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

### Paso 2 — Ver directorio de psicólogos como profesional

```bash
playwright-cli goto https://localhost:7072/Directorio/Psicologos
playwright-cli snapshot
playwright-cli screenshot --filename=directorio-profesional-psicologos.png
```

**Resultado esperado:** Lista de psicólogos. Para los profesionales también aparece la opción de "Agregar como colega".

---

### Paso 3 — Agregar como colega

```bash
# Buscar otro profesional en el directorio
playwright-cli click [ref-btn-agregar-colega]
playwright-cli snapshot

playwright-cli screenshot --filename=directorio-colega-agregado.png
```

**Resultado esperado:** El profesional queda marcado como colega. El botón cambia a "Quitar colega".

---

### Paso 4 — Ver lista de Mis Colegas

```bash
playwright-cli goto https://localhost:7072/Directorio/MisColegas
playwright-cli snapshot
playwright-cli screenshot --filename=directorio-mis-colegas.png
```

**Resultado esperado:** Lista de colegas agregados por el profesional.

---

### Paso 5 — Ver lista de Mis Mentores

```bash
playwright-cli goto https://localhost:7072/Directorio/Mentores
playwright-cli snapshot
playwright-cli screenshot --filename=directorio-mis-mentores.png
```

**Resultado esperado:** Lista de mentores que siguen al profesional actual.

---

### Paso 6 — Quitar colega

```bash
playwright-cli goto https://localhost:7072/Directorio/MisColegas
playwright-cli snapshot

playwright-cli click [ref-btn-quitar-colega]
playwright-cli snapshot

playwright-cli screenshot --filename=directorio-colega-quitado.png
```

**Resultado esperado:** El colega desaparece de la lista "Mis Colegas".

---

## Caso adicional — Usuario intenta acceder a /Directorio/MisColegas (solo profesionales)

```bash
# Con sesión activa como usuario
playwright-cli goto https://localhost:7072/Directorio/MisColegas
playwright-cli snapshot
```

**Resultado esperado:** Redirección a `/Login` o página de acceso denegado. Los usuarios no tienen acceso a la vista de colegas.

---

## Caso adicional — Directorio sin profesionales registrados (filtro sin resultados)

```bash
playwright-cli goto "https://localhost:7072/Directorio/Psicologos?nombre=ProfesionalInexistente12345"
playwright-cli snapshot
playwright-cli screenshot --filename=directorio-sin-resultados.png
```

**Resultado esperado:** Mensaje indicando que no hay profesionales que coincidan con el filtro.

---

## Notas
- Los `[ref-xxx]` deben reemplazarse con refs reales del snapshot.
- La vista de colegas y mentores requiere que haya más de un profesional registrado y aprobado.
- Usar `playwright-cli screenshot` para documentar los estados antes y después de seguir/dejar de seguir.

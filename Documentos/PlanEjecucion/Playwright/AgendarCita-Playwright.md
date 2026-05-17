# Prueba: Agendar, Ver y Cancelar Citas
**Funcionalidad cubierta:** El usuario busca un profesional, agenda una cita, la visualiza en su lista, ve el detalle, y la cancela. El profesional también puede ver y cancelar sus citas.

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

## Flujo 1 — Usuario agenda una cita

### Paso 1 — Login como usuario

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

### Paso 2 — Navegar al directorio de profesionales

```bash
# Ir al directorio de psicólogos o especialistas desde el menú
playwright-cli click [ref-menu-directorio]
playwright-cli snapshot

# O navegar directamente
playwright-cli goto https://localhost:7072/Directorio/Psicologos
playwright-cli snapshot
```

**Resultado esperado:** Lista de profesionales disponibles.

---

### Paso 3 — Seleccionar un profesional y agendar cita

```bash
# Hacer clic en "Agendar cita" del profesional de prueba
playwright-cli click [ref-btn-agendar-cita-profesional]
playwright-cli snapshot
```

**Resultado esperado:** Redirección a `/Citas/NuevaCita?profesionalId=X`. Se muestra el formulario de nueva cita con el profesional prellenado.

---

### Paso 4 — Llenar el formulario de la cita

```bash
playwright-cli snapshot

# Seleccionar fecha (debe ser futura)
playwright-cli fill [ref-fecha-cita] "2026-06-01"

# Seleccionar hora
playwright-cli fill [ref-hora-cita] "10:00"

# Ingresar motivo de consulta
playwright-cli fill [ref-motivo] "Consulta inicial de evaluación psicológica"

playwright-cli screenshot --filename=cita-nueva-formulario.png
playwright-cli click [ref-btn-confirmar-cita]
playwright-cli snapshot
```

**Resultado esperado:** Mensaje de éxito: cita agendada. Redirección a `/Citas/Index`.

---

### Paso 5 — Ver la lista de citas del usuario

```bash
playwright-cli goto https://localhost:7072/Citas/Index
playwright-cli snapshot
playwright-cli screenshot --filename=citas-lista-usuario.png
```

**Resultado esperado:** La cita recién agendada aparece en la lista con estado "Pendiente" o "Confirmada".

---

### Paso 6 — Ver el detalle de la cita

```bash
# Hacer clic en el botón "Ver detalle" o en la cita
playwright-cli click [ref-btn-ver-detalle-cita]
playwright-cli snapshot
playwright-cli screenshot --filename=cita-detalle.png
```

**Resultado esperado:** Vista de detalle con toda la información: profesional, fecha, hora, motivo, estado.

---

### Paso 7 — Cancelar la cita

```bash
# Volver a la lista o desde el detalle
playwright-cli go-back
playwright-cli snapshot

playwright-cli click [ref-btn-cancelar-cita]

# Si aparece diálogo de confirmación
playwright-cli dialog-accept

playwright-cli snapshot
playwright-cli screenshot --filename=cita-cancelada.png
```

**Resultado esperado:** La cita cambia a estado "Cancelada" o desaparece de la lista activa.

---

## Flujo 2 — Profesional ve sus citas agendadas

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

### Paso 2 — Ver lista de citas del profesional

```bash
playwright-cli goto https://localhost:7072/Citas/ListaProfesional
playwright-cli snapshot
playwright-cli screenshot --filename=citas-lista-profesional.png
```

**Resultado esperado:** Lista de citas agendadas con el profesional. Se muestra la cita creada en el Flujo 1 (si aún no fue cancelada).

---

### Paso 3 — Filtrar citas por estado

```bash
# Filtrar por estado "Pendiente"
playwright-cli goto "https://localhost:7072/Citas/ListaProfesional?estado=Pendiente"
playwright-cli snapshot

# Filtrar por estado "Cancelada"
playwright-cli goto "https://localhost:7072/Citas/ListaProfesional?estado=Cancelada"
playwright-cli snapshot

playwright-cli screenshot --filename=citas-filtro-estado.png
```

**Resultado esperado:** La lista se filtra correctamente por el estado seleccionado.

---

### Paso 4 — Ver detalle de cita como profesional

```bash
playwright-cli goto "https://localhost:7072/Citas/ListaProfesional?estado=Todos"
playwright-cli snapshot

playwright-cli click [ref-btn-ver-detalle-cita]
playwright-cli snapshot
playwright-cli screenshot --filename=cita-detalle-profesional.png
```

---

## Caso adicional — Formulario con fecha pasada

```bash
# Con sesión activa como usuario
playwright-cli goto https://localhost:7072/Citas/NuevaCita?profesionalId=1
playwright-cli snapshot

playwright-cli fill [ref-fecha-cita] "2020-01-01"
playwright-cli fill [ref-hora-cita] "08:00"
playwright-cli fill [ref-motivo] "Fecha en el pasado"
playwright-cli click [ref-btn-confirmar-cita]
playwright-cli snapshot
```

**Resultado esperado:** Error de validación. La fecha debe ser futura.

---

## Notas
- Los `[ref-xxx]` deben reemplazarse con refs reales del snapshot.
- Usar fechas futuras válidas al momento de ejecutar la prueba.
- Documentar evidencia con `playwright-cli screenshot` en cada paso importante.

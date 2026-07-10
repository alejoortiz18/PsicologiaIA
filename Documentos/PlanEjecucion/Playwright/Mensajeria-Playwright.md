# Prueba: Mensajería
**Funcionalidad cubierta:** Usuario envía un mensaje a un profesional, profesional responde, ambos ven el historial de conversación, y los mensajes se marcan como leídos.

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

## Flujo 1 — Usuario inicia una conversación con un profesional

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

### Paso 2 — Navegar a mensajería desde el directorio o perfil del profesional

```bash
# Ir al directorio de psicólogos
playwright-cli goto https://localhost:7072/Directorio/Psicologos
playwright-cli snapshot

# Hacer clic en el botón de mensajería del profesional de prueba
playwright-cli click [ref-btn-enviar-mensaje-profesional]
playwright-cli snapshot
```

**Resultado esperado:** Redirección a `/Mensajeria/Conversacion?conversacionId=X` o apertura de la pantalla de mensajería.

---

### Paso 3 — Ver bandeja de mensajes del usuario

```bash
playwright-cli goto https://localhost:7072/Mensajeria/Index
playwright-cli snapshot
playwright-cli screenshot --filename=mensajeria-bandeja-usuario.png
```

**Resultado esperado:** Lista de conversaciones del usuario. Puede estar vacía si es la primera vez.

---

### Paso 4 — Enviar un mensaje

```bash
# Abrir una conversación o crear una nueva
playwright-cli click [ref-conversacion]
playwright-cli snapshot

# Escribir el mensaje en el campo de texto
playwright-cli fill [ref-campo-mensaje] "Hola, me gustaría agendar una consulta para hablar sobre manejo de ansiedad."

playwright-cli screenshot --filename=mensajeria-mensaje-escrito.png

# Enviar el mensaje
playwright-cli click [ref-btn-enviar]
playwright-cli snapshot

playwright-cli screenshot --filename=mensajeria-mensaje-enviado.png
```

**Resultado esperado:** El mensaje aparece en la conversación. La bandeja muestra la conversación con el último mensaje.

---

### Paso 5 — Enviar un segundo mensaje en la misma conversación

```bash
playwright-cli fill [ref-campo-mensaje] "Tengo disponibilidad los martes y jueves por la tarde."
playwright-cli click [ref-btn-enviar]
playwright-cli snapshot
```

**Resultado esperado:** El segundo mensaje aparece en el hilo de conversación.

---

## Flujo 2 — Profesional responde el mensaje

### Paso 1 — Login como profesional (nueva pestaña o nueva sesión)

```bash
# Cerrar sesión del usuario primero
playwright-cli goto https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "trebol.pro.test@yopmail.com"
playwright-cli fill [ref-password] "Password123!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot
```

---

### Paso 2 — Ver bandeja de mensajes del profesional

```bash
playwright-cli goto https://localhost:7072/Mensajeria/Index
playwright-cli snapshot
playwright-cli screenshot --filename=mensajeria-bandeja-profesional.png
```

**Resultado esperado:** La conversación con el usuario aparece en la bandeja con indicador de mensajes no leídos.

---

### Paso 3 — Abrir la conversación y responder

```bash
playwright-cli click [ref-conversacion-usuario]
playwright-cli snapshot
playwright-cli screenshot --filename=mensajeria-conversacion-abierta.png

# Responder al mensaje
playwright-cli fill [ref-campo-mensaje] "Hola! Claro que sí. Tengo disponibilidad el próximo martes a las 4pm. ¿Le viene bien?"
playwright-cli click [ref-btn-enviar]
playwright-cli snapshot

playwright-cli screenshot --filename=mensajeria-respuesta-profesional.png
```

**Resultado esperado:** La respuesta del profesional aparece en la conversación. Los mensajes previos del usuario se marcan como leídos.

---

## Flujo 3 — Usuario lee la respuesta

### Paso 1 — Login como usuario

```bash
playwright-cli goto https://localhost:7072/Login
playwright-cli snapshot

playwright-cli fill [ref-correo] "trebol.usuario.test@yopmail.com"
playwright-cli fill [ref-password] "Password123!"
playwright-cli click [ref-btn-ingresar]
playwright-cli snapshot
```

---

### Paso 2 — Abrir la conversación

```bash
playwright-cli goto https://localhost:7072/Mensajeria/Index
playwright-cli snapshot

# La conversación debe mostrar indicador de mensaje no leído
playwright-cli screenshot --filename=mensajeria-mensaje-no-leido.png

playwright-cli click [ref-conversacion-profesional]
playwright-cli snapshot

playwright-cli screenshot --filename=mensajeria-respuesta-leida.png
```

**Resultado esperado:** La respuesta del profesional es visible. Al abrir la conversación, los mensajes se marcan como leídos y el indicador de no leído desaparece.

---

## Caso adicional — Mensaje vacío

```bash
# Con sesión activa en una conversación abierta
playwright-cli snapshot

# Intentar enviar sin texto
playwright-cli click [ref-btn-enviar]
playwright-cli snapshot
```

**Resultado esperado:** El mensaje no se envía. Validación que el texto no puede estar vacío.

---

## Notas
- Los `[ref-xxx]` deben reemplazarse con refs reales del snapshot.
- La mensajería es bidireccional: usuarios y profesionales pueden iniciar conversaciones.
- Usar `playwright-cli screenshot` para documentar el estado de los mensajes leídos/no leídos.

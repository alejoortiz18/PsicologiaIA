# Sala de Videollamada — Vista del Usuario — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1–2 semanas

---

## 1. Problema

El usuario que ingresa a su cita privada necesita una sala de videollamada funcional con controles básicos (micrófono, cámara, chat lateral, participantes) y acceso a la información de la sesión, con un flujo claro de salida hacia su historial de citas.

---

## 2. Apetito

**1 a 2 semanas.**
Sala de videollamada con video principal, strip de controles, panel de chat lateral (toggle), información de la sesión, botón de reporte técnico y confirmación al colgar.

---

## 3. Límites

### ✅ Dentro del scope

- Video del profesional como pantalla principal (área grande)
- Video propio del usuario (ventana pequeña, esquina de la pantalla principal)
- Strip de controles: micrófono · cámara · compartir pantalla · chat · participantes · colgar
- Panel de chat lateral (toggle on/off)
- Info de sesión: nombre del profesional + tipo de sesión + timer en tiempo real
- Botón **[Reportar problema técnico]**
- Modal de confirmación al colgar → `citas-usuario.html`

### ❌ Fuera del scope (No-Gos)

- Grabación de la sesión (razones éticas y legales)
- Historial clínico ni notas del profesional
- Pago dentro de la sala
- Notas privadas del usuario (a diferencia de la sala del profesional)

---

## 4. Solución Visible

### Área de video principal

| Elemento | Descripción |
|---|---|
| Video principal | Stream de video del profesional; ocupa ~80% del ancho de la pantalla |
| Video propio | Video del usuario en ventana flotante pequeña (esquina inferior derecha); draggable |
| Indicador de conexión | Barra o ícono de señal en la esquina superior del video principal |
| Nombre del profesional | Etiqueta superpuesta en la parte inferior del video principal |

### Strip de controles (barra inferior)

| Control | Ícono | Estado activo | Estado inactivo | Acción |
|---|---|---|---|---|
| **Micrófono** | 🎤 | Activo (verde) | Silenciado (rojo con tachado) | Toggle on/off del micrófono propio |
| **Cámara** | 📷 | Activa (verde) | Desactivada (rojo con tachado) | Toggle on/off de la cámara propia |
| **Compartir pantalla** | 🖥 | Compartiendo (azul) | No compartiendo (gris) | Abre selector de ventana a compartir |
| **Chat** | 💬 | Panel abierto (azul) | Panel cerrado (gris) | Toggle del panel de chat lateral |
| **Participantes** | 👥 | — | — | Toggle de la lista de participantes (solo profesional + usuario) |
| **Colgar** | 📞 | — | Rojo sólido | Abre modal de confirmación de salida |

### Panel de chat lateral (toggle)

| Elemento | Descripción |
|---|---|
| Ancho | ~280px; empuja el video o superpone según resolución |
| Encabezado | "Chat de sesión" |
| Lista de mensajes | Burbujas: mensajes del usuario (derecha, azul) / mensajes del profesional (izquierda, gris) |
| Campo de entrada | Input de texto + botón [Enviar] |
| Scroll automático | Siempre al último mensaje |

### Información de la sesión (panel superior o lateral)

| Elemento | Descripción |
|---|---|
| Nombre del profesional | "Sesión con Dra. Valentina García" |
| Tipo de sesión | Badge: "Psicológica" o "Asesoría puntual" |
| Timer | Contador ascendente `00:00:00` desde el inicio de la conexión |

### Botón "Reportar problema técnico"

| Elemento | Descripción |
|---|---|
| Posición | Esquina superior derecha (discreta, secundario) |
| Acción | Abre modal con checkbox de problemas comunes + campo de descripción libre |
| Modal | Selección: Audio · Video · Conexión · Otro + textarea + [Enviar reporte] |

### Modal de confirmación al colgar

| Elemento | Descripción |
|---|---|
| Título | "¿Deseas salir de la sesión?" |
| Mensaje | "La sesión con [nombre profesional] será finalizada." |
| Botón **[Salir de la sesión]** | Naranja/Rojo — termina la conexión y navega a `citas-usuario.html` |
| Botón **[Continuar en la sesión]** | Verde — cierra el modal y regresa a la sala |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Clic 🎤 (toggle) | Activa / silencia el micrófono propio |
| Clic 📷 (toggle) | Activa / desactiva la cámara propia |
| Clic 🖥 (compartir pantalla) | Abre selector del OS para elegir ventana a compartir |
| Clic 💬 (toggle chat) | Abre / cierra el panel de chat lateral |
| Enviar mensaje en el chat | Mensaje aparece como burbuja a la derecha |
| Clic 📞 (colgar) | Abre modal de confirmación |
| Confirmar salida | Conexión terminada → `citas-usuario.html` |
| Clic [Reportar problema] | Abre modal de reporte técnico |
| Enviar reporte | Reporte registrado; modal se cierra |

---

## 6. Restricciones

- La sala solo es accesible si la cita tiene **Estado = Confirmada** y la fecha del servidor coincide con la fecha de la cita.
- El video del profesional es la **pantalla principal**; no se puede intercambiar posición.
- No se puede grabar la sesión (sin botón de grabación).
- El chat de la sala es **exclusivo de la sesión activa**; no se guarda el historial completo del chat en la vista del usuario.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Acceso a la sala | `CItaId` válida + `Estado = Confirmada` + `DATE(FechaHora) = TODAY` |
| Timer | Inicia al conectarse el segundo participante; se muestra en tiempo real |
| Chat de sesión | Mensajes visibles solo durante la sesión; no persisten en el historial del usuario |
| Reporte técnico | Se guarda en `ReportesTecnicos` (CitaId, UsuarioId, Tipo, Descripcion, Timestamp) |
| Salida con confirmación | Siempre muestra modal antes de navegar fuera |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Conexión inestable | Mostrar indicador de señal; reintentar conexión automáticamente |
| Profesional no conectado | Mostrar "Esperando al profesional..." con contador de espera |
| Cierre accidental del navegador | Modal nativo de confirmación del navegador al intentar cerrar |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Datos de la cita | `Citas` (CitaId, UsuarioId, ProfesionalId, FechaHora, Estado, Tipo) |
| Datos del profesional | `Profesionales.NombreCompleto`, `Profesionales.FotoPerfil` |
| Token de sala (WebRTC) | Generado en el servidor al acceder; efímero |
| Reportes técnicos | `ReportesTecnicos` (CitaId, UsuarioId, Tipo, Descripcion, Timestamp) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Acceso correcto | Solo usuarios con cita válida del día pueden entrar |
| Controles funcionales | Mic, cámara y chat operan correctamente |
| Modal de salida obligatorio | No se puede salir sin la confirmación del modal |
| Timer correcto | El contador inicia al conectarse el segundo participante |
| Reporte técnico guardado | El reporte se persiste en la BD correctamente |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

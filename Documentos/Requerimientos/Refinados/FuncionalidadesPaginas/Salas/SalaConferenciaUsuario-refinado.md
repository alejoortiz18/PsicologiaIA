# Sala de Conferencia — Vista del Usuario — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1–2 semanas

---

## 1. Problema

El usuario inscrito en una sala de conferencia necesita unirse como espectador/participante: ver el video del ponente en pantalla grande, tener acceso a un chat en tiempo real, ver la lista de participantes, levantar la mano para intervenir, y salir del evento con confirmación.

---

## 2. Apetito

**1 a 2 semanas.**
Sala de conferencia con video del ponente (70–80% del ancho), panel lateral Chat|Participantes, información de la sala, badge "🔴 En vivo" pulsante, controles básicos del asistente y modal suave al salir.

---

## 3. Límites

### ✅ Dentro del scope

- Video del ponente (profesional) como pantalla principal (70–80% del ancho)
- Panel lateral con dos tabs: **Chat** y **Participantes**
- Info de la sala: título · nombre del orador · asistentes en línea · duración
- Badge **"🔴 En vivo"** pulsante mientras el evento está activo
- Controles del asistente: 🤚 Levantar mano · 💬 Chat · 📞 Salir
- Modal de confirmación al salir → `mis-eventos.html`

### ❌ Fuera del scope (No-Gos)

- Hablar o encender cámara (solo el ponente lo hace)
- Moderación de participantes (corresponde a `sala-conferencia-profesional.html`)
- Grabación del evento
- Pago dentro de la sala

---

## 4. Solución Visible

### Layout principal

| Zona | Proporción | Descripción |
|---|---|---|
| Video del ponente | ~70–80% ancho | Stream de video/audio del profesional ponente |
| Panel lateral | ~20–30% ancho | Tabs: Chat · Participantes |

### Área de video del ponente

| Elemento | Descripción |
|---|---|
| Video principal | Stream del ponente; fondo oscuro |
| Badge **"🔴 En vivo"** | Ícono pulsante rojo + texto "En vivo"; esquina superior izquierda del video |
| Nombre del ponente | Etiqueta superpuesta en parte inferior del video |
| Indicador de participantes | "👥 142 viendo" en esquina superior del video |

### Panel lateral — Tab "Chat"

| Elemento | Descripción |
|---|---|
| Historial de mensajes | Feed de mensajes públicos de todos los participantes |
| Formato mensaje | `@alias (H:MMAM/PM): texto` |
| Campo de entrada | Input + botón [Enviar]; máx. 500 caracteres |
| Mensajes del ponente | Destacados con borde izquierdo verde |

### Panel lateral — Tab "Participantes"

| Elemento | Descripción |
|---|---|
| Contador | "142 participantes" |
| Lista | Alias de los participantes; el ponente aparece primero con ícono de micrófono |
| Estado de manos levantadas | Ícono 🤚 junto al alias de quien levantó la mano |

### Información de la sala (barra superior o panel compacto)

| Elemento | Descripción |
|---|---|
| Título de la sala | Nombre del evento |
| Nombre del orador | "Por Dra. Valentina García" |
| Asistentes en línea | "142 / 200" |
| Duración | Timer de duración del evento desde que inició (ascendente) |

### Controles del asistente (barra inferior)

| Control | Ícono | Estado activo | Acción |
|---|---|---|---|
| **Levantar mano** | 🤚 | Activo (amarillo) | Toggle: levanta / baja la mano; notifica al ponente |
| **Chat** | 💬 | Panel visible (azul) | Toggle del panel lateral de chat |
| **Salir** | 📞 | Rojo | Abre modal de confirmación de salida |

### Modal de confirmación al salir

| Elemento | Descripción |
|---|---|
| Título | "¿Deseas salir del evento?" |
| Mensaje | "Podrás volver a unirte si el evento sigue activo." |
| Botón **[Salir del evento]** | Naranja/Rojo — cierra conexión → `mis-eventos.html` |
| Botón **[Seguir viendo]** | Verde — cierra modal y regresa a la sala |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Entrar a la sala | Conecta al stream del ponente; chat histórico visible |
| Clic 🤚 (levantar mano) | Mano levantada (amarillo); el ponente recibe notificación |
| Clic 🤚 (bajar mano) | Mano bajada; estado vuelve a gris |
| Escribir en el chat | Mensaje visible para todos los participantes |
| Clic Tab "Participantes" | Cambia el panel lateral a lista de asistentes |
| Clic 📞 (salir) | Abre modal de confirmación |
| Confirmar salida | Conexión cerrada → `mis-eventos.html` |

---

## 6. Restricciones

- El usuario **no puede activar micrófono ni cámara** (modo espectador).
- El acceso a la sala requiere **inscripción previa** al evento.
- El chat es público; el ponente puede moderar los mensajes.
- No se puede unir si el evento está en **Estado = Finalizado**.
- El usuario puede salir y volver a unirse si el evento sigue activo.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Acceso a la sala | `SalaId` válida + `Estado = En vivo` + `UsuarioId` tiene inscripción activa |
| Modo espectador | No hay micrófono ni cámara para asistentes |
| Chat en tiempo real | Mensajes por WebSocket; máx. 500 caracteres |
| Levantar mano | Solo un flag de notificación para el ponente; no concede micrófono automáticamente |
| Salida con confirmación | Siempre muestra modal antes de navegar fuera |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Sala con muchos participantes (lag) | Usar CDN de video para el stream; chat con throttling |
| Usuario sale accidentalmente | Modal de confirmación antes de salir |
| Chat con mensajes ofensivos | El ponente puede eliminar mensajes (en su vista) |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Datos de la sala | `Salas` (SalaId, ProfesionalId, Titulo, Descripcion, Estado, FechaHora) |
| Inscripción del usuario | `InscripcionesSalas` (SalaId, UsuarioId, Estado) |
| Datos del ponente | `Profesionales.NombreCompleto`, `Profesionales.FotoPerfil` |
| Mensajes del chat | `ChatSala` (SalaId, UsuarioId, Alias, Texto, Timestamp) |
| Participantes activos | Conteo en tiempo real (WebSocket) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Acceso correcto | Solo usuarios inscritos pueden entrar |
| Badge "En vivo" visible | Solo cuando el evento está activo |
| Chat funcional | Los mensajes aparecen en tiempo real |
| Levantar mano funcional | El flag llega al panel del ponente |
| Modal de salida obligatorio | No se puede salir sin confirmar |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

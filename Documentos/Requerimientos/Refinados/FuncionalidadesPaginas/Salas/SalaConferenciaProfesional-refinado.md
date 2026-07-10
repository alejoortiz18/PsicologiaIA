# Sala de Conferencia — Vista del Profesional Ponente — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 3 — Herramientas del Profesional | **Apetito:** 1–2 semanas

---

## 1. Problema

El profesional que conduce una sala de conferencia en vivo necesita un panel de moderación completo: controles de transmisión, gestión de participantes (silenciar, aprobar/denegar manos levantadas), compartir pantalla o slides, y un flujo de cierre de sala con confirmación que desconecte a todos los asistentes.

---

## 2. Apetito

**1 a 2 semanas.**
Layout idéntico a `sala-conferencia-usuario.html` más panel de Moderación (manos levantadas, silenciar individual), controles adicionales (compartir pantalla/slides, aprobar/denegar manos), y el botón "Finalizar sala" con modal danger que desconecta a todos los asistentes.

---

## 3. Límites

### ✅ Dentro del scope

- Mismo layout base que `sala-conferencia-usuario.html` (video ponente, panel lateral, info sala, badge En vivo)
- **Controles adicionales del ponente:** micrófono · cámara · compartir pantalla · compartir slides
- **Panel de Moderación:** lista de manos levantadas, botón silenciar individual
- Botones aprobar / denegar mano levantada
- Botón **[Finalizar sala]** (danger) → modal → desconecta todos → `mis-eventos.html`
- Badge **"🔴 En vivo"** pulsante mientras la sala está activa

### ❌ Fuera del scope (No-Gos)

- Grabación del evento
- Cobro o facturación desde la sala
- Múltiples ponentes simultáneos

---

## 4. Solución Visible

### Área de video principal

| Elemento | Descripción |
|---|---|
| Video del ponente (propio) | Stream propio del profesional como pantalla principal |
| Vista previa de participantes | Miniaturas de participantes que han sido habilitados para hablar (si aplica) |
| Badge **"🔴 En vivo"** | Pulsante rojo + texto "En vivo"; esquina superior |
| Contador de asistentes | "👥 142 / 200 conectados" |

### Panel lateral — Tab "Chat" (igual a sala-usuario)

Adicionalmente el ponente puede **eliminar mensajes** inapropiados (ícono 🗑 al hover sobre cada mensaje).

### Panel lateral — Tab "Participantes"

| Elemento | Descripción |
|---|---|
| Contador | "142 / 200 conectados" |
| Lista | Alias + indicador de mano levantada 🤚 |
| Botón silenciar individual | Solo si el participante tiene micrófono activo (habilitado) |

### Panel de Moderación (panel adicional exclusivo del ponente)

| Elemento | Descripción |
|---|---|
| Título | "Moderación" |
| Lista de manos levantadas | Alias + timestamp de cuando levantó la mano; ordenados por tiempo ASC |
| Botón **[Aprobar]** | Verde — habilita el micrófono del participante para hablar |
| Botón **[Denegar]** | Gris — baja la mano sin habilitar el micrófono |
| Notificación nueva mano | Toast discreto: "@alias levantó la mano" |

### Strip de controles del ponente (barra inferior)

| Control | Ícono | Acción |
|---|---|---|
| **Micrófono** | 🎤 | Toggle on/off del micrófono propio |
| **Cámara** | 📷 | Toggle on/off de la cámara propia |
| **Compartir pantalla** | 🖥 | Abre selector del OS para compartir ventana |
| **Compartir slides** | 📊 | Abre selector de archivo (PDF/PPT); comparte como video stream |
| **Chat** | 💬 | Toggle del panel lateral |
| **Finalizar sala** | ⏹ | Danger (rojo oscuro) — abre modal de confirmación |

### Modal de confirmación — Finalizar sala

| Elemento | Descripción |
|---|---|
| Título | "¿Deseas terminar la transmisión?" |
| Mensaje | "Todos los asistentes serán desconectados y la sala quedará en estado **Finalizada**." |
| Botón **[Finalizar sala]** | Rojo sólido — termina el stream, desconecta a todos → `mis-eventos.html` |
| Botón **[Continuar transmitiendo]** | Verde — cierra el modal sin acción |

---

## 5. Acciones del Profesional (Ponente)

| Acción | Resultado |
|---|---|
| Clic 🎤 (toggle) | Activa / silencia el micrófono propio |
| Clic 📷 (toggle) | Activa / desactiva la cámara propia |
| Clic 🖥 (compartir pantalla) | Comparte la pantalla seleccionada como video stream |
| Clic 📊 (compartir slides) | Comparte el archivo seleccionado como video stream |
| Clic 💬 (toggle chat) | Abre / cierra el panel de chat |
| Eliminar mensaje del chat | Mensaje eliminado para todos |
| Clic **[Aprobar]** mano levantada | El participante puede hablar; su alias muestra ícono 🎙 |
| Clic **[Denegar]** mano levantada | La mano se baja sin habilitación |
| Clic silenciar participante | El micrófono del participante se desactiva |
| Clic **[Finalizar sala]** | Abre modal de confirmación |
| Confirmar finalizar | Stream terminado → todos desconectados → Estado sala = Finalizada → `mis-eventos.html` |

---

## 6. Restricciones

- Solo el profesional dueño de la sala puede acceder a esta vista.
- **Un solo ponente activo** por sala en esta versión.
- Al finalizar la sala, el **Estado cambia a "Finalizada"** de forma irreversible.
- Los participantes reciben una notificación/mensaje al ser desconectados.
- No hay grabación de la sala.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Acceso exclusivo | Solo `ProfesionalId = Sala.ProfesionalId` puede entrar a esta vista |
| Finalizar sala | Estado → `Finalizada`; todos los participantes son desconectados; irreversible |
| Silenciar participante | Solo disponible si el participante tiene micrófono habilitado |
| Aprobar mano levantada | El sistema notifica al participante que puede hablar |
| Manos levantadas | Se ordenan por timestamp ASC (primero en levantar, primero en la lista) |
| Eliminar mensaje de chat | El mensaje desaparece para todos; se registra en log de moderación |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Cierre accidental de la sala | Modal de confirmación con texto claro sobre el impacto |
| Participante con comportamiento inapropiado | Silenciar + eliminar mensajes; en futuro: expulsar participante |
| Fallo del stream del ponente | Reconexión automática; los participantes ven "Reconectando..." |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Datos de la sala | `Salas` (SalaId, ProfesionalId, Titulo, Estado, Capacidad) |
| Asistentes activos | Conteo en tiempo real (WebSocket) |
| Manos levantadas | `ManosLevantadas` (SalaId, UsuarioId, Alias, Timestamp) |
| Mensajes del chat | `ChatSala` (SalaId, UsuarioId, Alias, Texto, Timestamp, Eliminado) |
| Log de moderación | `LogModeracion` (SalaId, ProfesionalId, Accion, TargetAlias, Timestamp) |
| Estado de la sala | `Salas.Estado` → `En vivo` → `Finalizada` |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Acceso exclusivo al ponente | Solo el dueño de la sala puede entrar |
| Manos levantadas en tiempo real | Las notificaciones llegan al ponente en < 2 segundos |
| Finalizar sala completo | Estado cambia a Finalizada y todos son desconectados |
| Eliminar mensajes funcional | El mensaje desaparece para todos los participantes |
| Modal de salida obligatorio | No se puede finalizar sin confirmar |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

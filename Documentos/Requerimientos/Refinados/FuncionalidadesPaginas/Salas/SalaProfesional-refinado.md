# Sala de Videollamada — Vista del Profesional — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 3 — Herramientas del Profesional | **Apetito:** 1–2 semanas

---

## 1. Problema

El profesional que atiende una cita privada necesita la misma sala de videollamada que el usuario pero con funcionalidades adicionales: panel de notas clínicas privadas, acceso al historial del paciente y un flujo de cierre que regresa a su gestión de citas.

---

## 2. Apetito

**1 a 2 semanas.**
Sala de videollamada con layout idéntico a `sala-usuario.html` más panel de notas clínicas privadas, toggle de historial del paciente, y botón "Terminar sesión" con confirmación que navega a `citas-profesional.html`.

---

## 3. Límites

### ✅ Dentro del scope

- Mismo layout base que `sala-usuario.html` (video principal, strip controles, chat lateral)
- **Panel adicional: Notas clínicas privadas** — textarea + guardar localmente (localStorage / BD)
- **Toggle: Historial del paciente** — datos básicos del alias del paciente y sesiones previas
- Datos del paciente: alias · tipo de cita · número de sesión
- Botón **[Terminar sesión]** (danger) → modal de confirmación → `citas-profesional.html`

### ❌ Fuera del scope (No-Gos)

- Grabación de la sesión
- Historial clínico completo (módulo independiente)
- Cobro o facturación desde la sala

---

## 4. Solución Visible

### Área de video principal

Idéntica a `sala-usuario.html`:

| Elemento | Descripción |
|---|---|
| Video principal | Stream de video del paciente (pantalla grande) |
| Video propio | Video del profesional (ventana flotante pequeña) |
| Indicador de conexión | Barra de señal en esquina superior |
| Nombre del paciente | Alias superpuesto en la parte inferior (`@alias-paciente`) |

### Strip de controles (idéntico a sala-usuario)

| Control | Ícono | Acción |
|---|---|---|
| **Micrófono** | 🎤 | Toggle on/off |
| **Cámara** | 📷 | Toggle on/off |
| **Compartir pantalla** | 🖥 | Compartir presentación / pantalla |
| **Chat** | 💬 | Toggle panel de chat |
| **Participantes** | 👥 | Toggle lista de participantes |
| **Terminar sesión** | 📞 | Danger (rojo) — abre modal de confirmación |

### Panel de chat lateral (toggle) — igual a sala-usuario

### Información de la sesión (panel superior)

| Elemento | Descripción |
|---|---|
| Alias del paciente | `@alias-del-paciente` (sin nombre real en la sala) |
| Tipo de cita | Badge: "Psicológica" o "Asesoría puntual" |
| Número de sesión | "Sesión #4" (sesión número N con este paciente) |
| Timer | Contador ascendente `00:00:00` |

### Panel lateral adicional — Notas Clínicas Privadas

| Elemento | Descripción |
|---|---|
| Título | "Notas de sesión (privadas)" |
| Textarea | Campo de texto libre; amplio; autoguardado cada 30 segundos |
| Botón **[Guardar notas]** | Guarda manualmente en la BD (endpoint protegido); toast "Notas guardadas" |
| Nota de privacidad | "Estas notas son visibles únicamente para ti." |
| Notas previas | Sección colapsable con las notas de sesiones anteriores con este paciente |

### Toggle — Historial del paciente

| Elemento | Descripción |
|---|---|
| Botón toggle | "Ver historial del paciente" / "Ocultar historial" |
| Panel historial | Despliegue lateral o inferior con: número de sesiones totales, fechas de sesiones anteriores, tipo de consulta |

### Modal de confirmación — Terminar sesión

| Elemento | Descripción |
|---|---|
| Título | "¿Terminar la sesión?" (rojo) |
| Mensaje | "La sesión con @[alias-paciente] será finalizada. Las notas serán guardadas automáticamente." |
| Botón **[Terminar sesión]** | Danger (rojo) — guarda notas + finaliza conexión → `citas-profesional.html` |
| Botón **[Continuar en la sesión]** | Verde — cierra el modal sin acción |

---

## 5. Acciones del Profesional

| Acción | Resultado |
|---|---|
| Clic 🎤 (toggle) | Activa / silencia el micrófono |
| Clic 📷 (toggle) | Activa / desactiva la cámara |
| Clic 🖥 (compartir pantalla) | Abre selector para compartir presentación o pantalla |
| Clic 💬 (toggle chat) | Abre / cierra panel de chat |
| Escribir notas clínicas | Autoguardado cada 30s; también guardado manual con [Guardar notas] |
| Toggle historial paciente | Muestra / oculta el historial de sesiones previas |
| Clic **[Terminar sesión]** | Abre modal de confirmación |
| Confirmar terminar | Notas guardadas → conexión finalizada → `citas-profesional.html` |

---

## 6. Restricciones

- La sala solo es accesible si la cita tiene **Estado = Confirmada** y la fecha del servidor coincide.
- Las **notas clínicas son estrictamente privadas** del profesional; ningún otro rol puede leerlas.
- El profesional **solo ve el alias** del paciente en la sala (no el nombre real).
- No hay grabación de sesión.
- Al terminar la sesión, **las notas se guardan automáticamente** antes de navegar.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Acceso a la sala | `CitaId` válida + `Estado = Confirmada` + `DATE(FechaHora) = TODAY` |
| Alias del paciente | Se muestra `Usuarios.Alias` nunca `Usuarios.NombreCompleto` en la sala |
| Notas clínicas | Solo lectura/escritura del profesional dueño de la cita |
| Autoguardado | Cada 30 segundos si hay cambios en las notas |
| Número de sesión | `COUNT(Citas completadas)` entre este par profesional-paciente + 1 |
| Terminar sesión | Siempre guarda notas antes de cerrar la conexión |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Notas perdidas si cierra el navegador | Autoguardado cada 30s + guardar al iniciar el cierre de la ventana |
| Identidad del paciente expuesta | Usar siempre alias; nunca mostrar nombre real en la sala |
| Conexión inestable | Indicador de señal; reconexión automática |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Datos de la cita | `Citas` (CitaId, UsuarioId, ProfesionalId, FechaHora, Estado, Tipo) |
| Alias del paciente | `Usuarios.Alias` |
| Número de sesión | `COUNT(Citas)` entre par + 1 |
| Notas de sesión | `NotasSesion` (CitaId, ProfesionalId, Texto, FechaGuardado) |
| Historial de sesiones | `Citas` (UsuarioId + ProfesionalId, Estado = Completada, ORDER BY FechaHora DESC) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Acceso correcto | Solo el profesional de la cita puede entrar |
| Notas guardadas | Las notas persisten en la BD tras la sesión |
| Alias del paciente | El nombre real nunca se muestra en la sala |
| Modal de salida obligatorio | No se puede terminar sin confirmar |
| Redirección correcta | Al terminar → `citas-profesional.html` |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

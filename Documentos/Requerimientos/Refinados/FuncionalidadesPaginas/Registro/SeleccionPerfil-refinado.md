# Selección de Perfil de Registro — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 1 — Público | **Apetito:** 1–2 días

---

## 1. Problema

Antes de registrarse, el visitante debe elegir el tipo de cuenta que desea crear (Usuario o Profesional), ya que cada perfil tiene un flujo, formulario y términos distintos. El botón "Continuar" no debe habilitarse hasta que el usuario acepte explícitamente los términos.

---

## 2. Apetito

**1 a 2 días.**
Pantalla de selección con 2 cards diferenciadas, caja de términos con checkbox y botón Continuar condicionado.

---

## 3. Límites

### ✅ Dentro del scope

- 2 cards de selección: "Soy Usuario" y "Soy Profesional"
- Caja de términos y condiciones con scroll (`<textarea>` readonly o `<div>` scrolleable)
- Checkbox "He leído y acepto los términos y condiciones"
- Botón **[Continuar]** deshabilitado hasta que el checkbox esté marcado
- Nota especial para profesionales: "La verificación ante COLPSIC toma 3 a 5 días hábiles"
- Link **[Volver al inicio]** → Landing Page

### ❌ Fuera del scope (No-Gos)

- Los formularios de registro (cada uno en su propio documento)
- Registro con redes sociales
- Vista previa de beneficios por perfil

---

## 4. Solución Visible

### 2 Cards de selección (lado a lado)

#### Card — Soy Usuario

| Elemento | Descripción |
|---|---|
| Ícono | 👤 Usuario / persona |
| Título | "Soy Usuario" |
| Subtítulo | "Quiero acceder a sesiones y eventos de bienestar mental" |
| Descripción breve | "Agenda citas con profesionales, inscríbete a eventos y cuida tu salud mental." |

#### Card — Soy Profesional

| Elemento | Descripción |
|---|---|
| Ícono | 🏥 Profesional / maletín médico |
| Título | "Soy Profesional" |
| Subtítulo | "Soy psicólogo o terapeuta y quiero ofrecer mis servicios" |
| Descripción breve | "Crea salas, gestiona citas y conecta con pacientes. Requiere verificación COLPSIC." |
| Nota de verificación | "⏱ La aprobación toma **3 a 5 días hábiles**" (visible solo en esta card) |

#### Selección visual

| Estado | Apariencia |
|---|---|
| Sin selección | Ambas cards con borde gris |
| Seleccionada | Card con borde verde + fondo verde suave + ícono ✓ |

### Caja de Términos y Condiciones

| Elemento | Descripción |
|---|---|
| Área de texto | Scroll interno (max-height 150px); texto completo de los T&C |
| Contenido | T&C generales de la plataforma; si el perfil seleccionado es Profesional, se añaden cláusulas adicionales sobre la verificación COLPSIC y responsabilidades profesionales |
| Checkbox | `[ ] He leído y acepto los términos y condiciones` |

### Botón Continuar

| Estado | Apariencia |
|---|---|
| Sin selección de perfil O sin checkbox | Gris / deshabilitado (`disabled`) |
| Con perfil seleccionado Y checkbox marcado | Verde / habilitado |

### Botón Volver

| Elemento | Destino |
|---|---|
| Link/botón **[Volver al inicio]** | → Landing Page (`index.html`) |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Clic en card "Soy Usuario" | Card se selecciona (borde verde); los T&C estándar se cargan en la caja |
| Clic en card "Soy Profesional" | Card se selecciona; los T&C incluyen cláusulas adicionales de profesional |
| Marcar checkbox | Botón [Continuar] se habilita si también hay card seleccionada |
| Clic **[Continuar]** (con usuario) | → `registro-usuario.html` |
| Clic **[Continuar]** (con profesional) | → `registro-profesional.html` |
| Clic **[Volver al inicio]** | → `index.html` (Landing Page) |

---

## 6. Restricciones

- El botón **[Continuar]** solo se habilita cuando **ambas condiciones** se cumplen: card seleccionada + checkbox marcado.
- Desmarcar el checkbox **deshabilita** el botón aunque haya card seleccionada.
- Los T&C del profesional incluyen cláusulas adicionales sobre la verificación COLPSIC; no se pueden omitir.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Selección requerida | No se puede avanzar sin seleccionar un tipo de perfil |
| Aceptación obligatoria | No se puede avanzar sin marcar el checkbox de T&C |
| T&C diferenciados | Usuario: T&C estándar; Profesional: T&C estándar + cláusulas COLPSIC |
| Botón Continuar | `disabled` hasta que perfil seleccionado + checkbox marcado |

---

## 8. Datos Necesarios

| Dato | Fuente |
|---|---|
| Texto T&C — Usuario | `Tabla: Configuracion` o archivo estático versionado |
| Texto T&C — Profesional | `Tabla: Configuracion` o archivo estático versionado (incluye adendas COLPSIC) |

---

## 9. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Selección de card funcional | La card seleccionada se resalta visualmente |
| T&C dinámicos | El texto de T&C cambia según el perfil seleccionado |
| Bloqueo sin aceptación | No es posible avanzar sin checkbox marcado |
| Redirección correcta | Usuario → `registro-usuario.html`; Profesional → `registro-profesional.html` |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

---

## 1. Problema

Antes de registrarse, el visitante debe elegir el tipo de cuenta que desea crear (Usuario o Profesional), ya que cada perfil tiene un flujo, formulario y términos distintos.

---

## 2. Apetito

**1 a 2 días.**
Pantalla de selección simple con dos opciones claras que redirigen al formulario correspondiente.

---

## 3. Límites

### ✅ Dentro del scope

- Vista con dos opciones: "Registrarme como Usuario" y "Registrarme como Profesional"
- Presentación de términos y condiciones diferenciados por perfil
- Aceptación obligatoria de términos antes de continuar
- Botón Volver al Landing Page

### ❌ Fuera del scope (No-Gos)

- El formulario de registro en sí (está en sus propios documentos)
- Registro con redes sociales
- Vista previa de beneficios por perfil (fuera del apetito de este módulo)

---

## 4. Solución Visible

| Elemento | Descripción |
|---|---|
| Opción "Registrarme como Usuario" | Tarjeta o botón destacado que inicia el flujo de registro de usuario |
| Opción "Registrarme como Profesional" | Tarjeta o botón destacado que inicia el flujo de registro profesional |
| Términos y condiciones | Cada opción presenta sus propios términos; la aceptación es obligatoria antes de continuar |
| Botón "Volver" | Regresa al Landing Page |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Seleccionar "Usuario" y aceptar términos | Redirige al formulario de Registro de Usuario |
| Seleccionar "Profesional" y aceptar términos | Redirige al formulario de Registro de Profesional |
| Hacer clic en "Volver" | Regresa al Landing Page |

---

## 6. Restricciones

- El botón de continuar en cada opción solo se habilita tras la aceptación explícita de los términos y condiciones.
- Los términos de Usuario y Profesional son independientes; si difieren, se presentan por separado.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Aceptación obligatoria | No se puede avanzar al formulario sin aceptar los términos del perfil seleccionado |
| Términos diferenciados | Cada perfil tiene su propio texto de términos y condiciones |

---

## 8. Datos Necesarios

| Dato | Fuente |
|---|---|
| Texto de términos — Usuario | `Tabla: Configuracion` o archivo estático versionado |
| Texto de términos — Profesional | `Tabla: Configuracion` o archivo estático versionado |

---

## 9. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Redirección correcta | Cada opción lleva al formulario correcto sin errores |
| Términos visibles | Los términos se muestran completos antes de aceptar |
| Bloqueo sin aceptación | No es posible avanzar sin marcar la aceptación de términos |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

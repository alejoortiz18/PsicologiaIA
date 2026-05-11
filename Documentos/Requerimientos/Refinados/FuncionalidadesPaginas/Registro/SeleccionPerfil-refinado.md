# Selección de Perfil de Registro — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 1 — Público | **Apetito:** 1–2 días

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

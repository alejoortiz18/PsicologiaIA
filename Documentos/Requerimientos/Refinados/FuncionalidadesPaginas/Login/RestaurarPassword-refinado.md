# Restablecer Contraseña — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 1 — Público | **Apetito:** 3–5 días

---

## 1. Problema

Los usuarios y profesionales que olvidan su contraseña necesitan un mecanismo seguro y autoasistido para recuperar el acceso sin intervención manual del administrador.

---

## 2. Apetito

**3 a 5 días.**
Flujo de recuperación por correo electrónico con token temporal de un solo uso y tiempo de expiración definido.

---

## 3. Límites

### ✅ Dentro del scope

- Vista para ingresar el correo registrado
- Envío de correo con enlace + token de recuperación (vigencia: 1 hora)
- Vista para establecer la nueva contraseña (con validación de token)
- Opción de reenvío de correo si el token expiró
- Mensajes de resultado en modal (éxito, error, token expirado)

### ❌ Fuera del scope (No-Gos)

- Recuperación por SMS o número de celular
- Preguntas de seguridad
- Recuperación por código de un solo uso (OTP) en tiempo real
- Cambio de contraseña desde dentro de la sesión activa (corresponde al módulo de Perfil)

---

## 4. Solución Visible

### Paso 1 — Solicitar recuperación

| Elemento | Descripción |
|---|---|
| Logo de la aplicación | Visible en la parte superior |
| Campo correo electrónico | Obligatorio; debe coincidir con un correo registrado |
| Botón "Enviar enlace" | Inicia el proceso; muestra spinner durante el envío |
| Botón "Volver" | Regresa al Login |
| Mensaje de resultado | Modal: confirmación de envío (sin revelar si el correo existe) |

### Paso 2 — Establecer nueva contraseña (desde el enlace del correo)

| Elemento | Descripción |
|---|---|
| Campo nueva contraseña | Obligatorio; con reglas de complejidad visibles |
| Campo confirmar contraseña | Debe coincidir con el campo anterior |
| Botón "Guardar contraseña" | Con spinner; deshabilita el botón durante el proceso |
| Mensaje de éxito | Modal: "Tu contraseña ha sido actualizada. Ya puedes iniciar sesión." |
| Mensaje de token inválido/expirado | Modal con opción de solicitar nuevo enlace |

### Convenciones visuales

| Elemento | Estándar |
|---|---|
| Mensajes del sistema | Siempre mediante **modal** |
| Spinner | Visible durante el envío; botón deshabilitado |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Ingresar correo y hacer clic en "Enviar enlace" | Sistema procesa la solicitud y muestra modal de confirmación |
| Hacer clic en el enlace del correo | Redirige a la vista de nueva contraseña con token en la URL |
| Establecer nueva contraseña y guardar | Sistema actualiza la contraseña y muestra modal de éxito |
| Token expirado: hacer clic en "Reenviar enlace" | Sistema genera nuevo token y envía nuevo correo |
| Hacer clic en "Volver" | Regresa al Login |

---

## 6. Flujo del Sistema

```
1. El usuario ingresa su correo y hace clic en "Enviar enlace".
2. El sistema verifica internamente si el correo existe en la base de datos.
   → Si existe: genera un token de recuperación con vigencia de 1 hora
                y envía correo con el enlace de restablecimiento.
   → Si NO existe: muestra el mismo mensaje de confirmación (no revela si el correo existe).
3. El usuario hace clic en el enlace del correo.
4. El sistema valida el token:
   → Token válido y no expirado: muestra el formulario de nueva contraseña.
   → Token inválido o expirado: muestra modal con mensaje de error y
     opción para solicitar un nuevo enlace.
5. El usuario establece su nueva contraseña.
6. El sistema guarda el hash de la nueva contraseña e invalida el token utilizado.
7. El sistema muestra modal de éxito y redirige al Login.
```

---

## 7. Restricciones

- El sistema **nunca** debe confirmar si un correo existe o no en la base de datos (misma respuesta independientemente del resultado).
- El token de recuperación es de **un solo uso**: se invalida inmediatamente después de ser utilizado.
- Un token expirado no puede reutilizarse; el usuario debe solicitar uno nuevo.
- La nueva contraseña debe cumplir las reglas de complejidad definidas en los requisitos generales de seguridad.
- **La nueva contraseña nunca se almacena en texto plano.** Debe aplicarse doble encriptación: **Hash + Salt** usando el algoritmo **Argon2** (con salt embebido). Esta operación se realiza en la **Capa Helpers** antes de persistir el dato en base de datos.

---

## 8. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Token de recuperación | Vigencia: **1 hora** desde la generación |
| Mensaje de confirmación | Siempre el mismo texto, independientemente de si el correo existe |
| Token de un solo uso | Se invalida inmediatamente después de su uso exitoso |
| Contraseña | Debe cumplir las reglas de complejidad del sistema |
| **Encriptación de contraseña** | La nueva contraseña se almacena con **Hash + Salt (Argon2)** — nunca en texto plano. Implementado en la **Capa Helpers** |
| Reenvío | Solo se puede reenviar si el token anterior expiró o fue invalidado |

---

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Enumeración de correos (user enumeration) | Mostrar siempre el mismo mensaje de confirmación sin distinguir si el correo existe |
| Token adivinable | Usar tokens criptográficamente seguros (GUID o similar de alta entropía) |
| Múltiples solicitudes de recuperación activas | Solo el token más reciente es válido; los anteriores se invalidan al generar uno nuevo |

---

## 10. Datos Necesarios

| Dato | Fuente / Destino |
|---|---|
| Correo electrónico | `Tabla: Usuarios` / `Tabla: Profesionales` |
| Token de recuperación | `Tabla: TokensRecuperacion` (TokenId, UsuarioId, Token, FechaExpiracion, Usado) |
| Contraseña (hash Argon2 + salt embebido) | `Tabla: Usuarios.PasswordHash` / `Tabla: Profesionales.PasswordHash` — generado con **Argon2** en la Capa Helpers |
| Fecha de expiración del token | Calculada: FechaCreacion + 1 hora |

---

## 11. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Correo de recuperación entregado | El correo llega en menos de **60 segundos** |
| Token válido funciona | El formulario de nueva contraseña se muestra sin errores |
| Token expirado informado | El modal de token expirado aparece con opción de reenvío |
| Contraseña actualizada | El usuario puede iniciar sesión con la nueva contraseña inmediatamente |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

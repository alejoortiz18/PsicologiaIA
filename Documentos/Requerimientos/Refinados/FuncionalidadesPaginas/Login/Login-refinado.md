# Login — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 1 — Público | **Apetito:** 3–5 días

---

## 1. Problema

Los usuarios y profesionales registrados necesitan un punto de entrada seguro a la plataforma. La vista de login debe autenticar al usuario, identificar su perfil y dirigirlo a su experiencia correcta sin exponer información sensible ante errores.

---

## 2. Apetito

**3 a 5 días.**
Formulario simple de autenticación con validación básica, generación de cookies de sesión y redirección según perfil.

---

## 3. Límites

### ✅ Dentro del scope

- Formulario con campo correo electrónico y contraseña
- Botón Iniciar sesión con spinner (protección doble envío)
- Botón Restablecer contraseña (redirige al flujo de recuperación)
- Botón Crear cuenta (redirige al registro)
- Botón Volver (regresa al Landing Page)
- Mensaje de error genérico en modal (sin revelar si el error es en correo o contraseña)
- Generación de cookies de sesión según perfil (Usuario / Profesional)

### ❌ Fuera del scope (No-Gos)

- Autenticación con redes sociales (Google, Facebook)
- Autenticación en dos factores (2FA)
- Bloqueo automático de cuenta por intentos fallidos (se define en módulo de seguridad)
- Recordar dispositivo / sesión persistente

---

## 4. Solución Visible

### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Logo de la aplicación | Visible en la parte superior de la pantalla |
| Campo correo electrónico | Obligatorio; validación de formato de email |
| Campo contraseña | Obligatorio; texto enmascarado |
| Botón "Iniciar sesión" | Envía el formulario; muestra spinner durante el proceso |
| Botón "Restablecer contraseña" | Redirige al flujo de restauración de contraseña |
| Botón "Crear cuenta" | Redirige a la selección de perfil de registro |
| Botón "Volver" | Regresa al Landing Page |

### Convenciones visuales

| Elemento | Estándar |
|---|---|
| Mensajes de error | Siempre mediante **modal** (nunca `alert()` nativo ni texto inline) |
| Spinner | Visible en el botón durante el envío; botón deshabilitado para evitar doble envío |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Completar campos y hacer clic en "Iniciar sesión" | El sistema valida y autentica |
| Hacer clic en "Restablecer contraseña" | Redirige a la vista de restauración de contraseña |
| Hacer clic en "Crear cuenta" | Redirige a la selección de perfil (Usuario / Profesional) |
| Hacer clic en "Volver" | Regresa al Landing Page |

---

## 6. Flujo del Sistema

```
1. El usuario completa los campos de correo y contraseña.
2. El sistema valida que ambos campos estén completos (validación frontend).
3. El sistema verifica las credenciales contra la base de datos.
4. El sistema identifica si el usuario es de tipo Usuario o Profesional.
5. Si las credenciales son correctas:
   → Genera las cookies de sesión correspondientes al perfil.
   → Redirige al Dashboard del perfil correspondiente.
6. Si las credenciales son incorrectas:
   → Muestra mensaje genérico en modal: "Correo o contraseña incorrectos."
   → No revela cuál de los dos campos es incorrecto.
7. Si algún campo está vacío:
   → Muestra mensaje en modal indicando que ambos campos son obligatorios.
```

---

## 7. Restricciones

- El mensaje de error **nunca** debe indicar si el correo existe o si la contraseña es incorrecta (prevención de enumeración de usuarios).
- El botón "Iniciar sesión" se deshabilita mientras el sistema procesa la solicitud.
- Las cookies de sesión se configuran según el perfil (Usuario / Profesional); no son intercambiables.
- Un profesional no puede iniciar sesión si su cuenta está en estado PENDIENTE DE VALIDACIÓN o RECHAZADA.
- **La verificación de la contraseña se realiza comparando el hash Argon2 de la contraseña ingresada con el hash almacenado.** Nunca se desencripta ni se compara texto plano. La operación se realiza en la **Capa Helpers**.

---

## 8. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Campos obligatorios | Correo y contraseña son requeridos antes del envío |
| Mensaje de error genérico | El error nunca especifica si es correo o contraseña incorrectos |
| Cookie de sesión por perfil | Se genera una cookie diferente para Usuario y para Profesional |
| Estado de cuenta | Solo cuentas con estado ACTIVO pueden iniciar sesión |
| Redirección post-login | Usuario → Dashboard Usuario; Profesional → Dashboard Profesional |
| **Verificación de contraseña** | Se compara el hash **Argon2** de la contraseña ingresada vs. el hash almacenado. Nunca se compara texto plano. Implementado en la **Capa Helpers** |

---

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Fuerza bruta sobre el login | Implementar rate limiting por IP en el servidor (fuera del scope de esta vista) |
| Exposición de estado de cuenta en el mensaje de error | Usar siempre el mismo mensaje genérico independientemente del motivo del fallo |
| Sesión no expirada correctamente | Definir tiempo de expiración de cookie en módulo de seguridad |

---

## 10. Datos Necesarios

| Dato | Fuente |
|---|---|
| Correo electrónico | `Tabla: Usuarios` / `Tabla: Profesionales` |
| Contraseña (hash Argon2 + salt embebido) | `Tabla: Usuarios.PasswordHash` / `Tabla: Profesionales.PasswordHash` — verificado con **Argon2** en la Capa Helpers |
| Tipo de perfil | `Tabla: Usuarios.TipoPerfil` o tabla de discriminación |
| Estado de cuenta | `Tabla: Usuarios.Estado` (ACTIVO / PENDIENTE / RECHAZADO) |

---

## 11. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Autenticación exitosa | El usuario autenticado llega a su Dashboard en menos de **2 segundos** |
| Error sin exposición | Ningún mensaje de error revela información específica del campo incorrecto |
| Sin doble envío | El botón se deshabilita durante el procesamiento |
| Redirección correcta | Usuario → su dashboard; Profesional → su dashboard |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

# Login — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 1 — Público | **Apetito:** 3–5 días

---

## 1. Problema

Los usuarios y profesionales registrados necesitan un punto de entrada seguro a la plataforma. La vista de login debe autenticar al usuario, identificar su perfil y dirigirlo a su experiencia correcta (home usuario / perfil profesional / bandeja admin) sin exponer información sensible ante errores.

---

## 2. Apetito

**3 a 5 días.**
Layout split 50/50 con formulario de autenticación, validación básica, generación de cookies de sesión y redirección según rol (3 roles: Usuario / Profesional / Admin).

---

## 3. Límites

### ✅ Dentro del scope

- Layout split 50/50: panel izquierdo decorativo + panel derecho con formulario
- Panel izquierdo: gradiente verde, estadísticas de la plataforma
- Campo email + campo password con toggle 👁 (mostrar/ocultar)
- Link "¿Olvidaste tu contraseña?" → `restablecer-contraseña`
- Botón "Iniciar sesión" con estado loading (1.4 segundos simulados + spinner)
- Cuentas de prueba visibles en el formulario (ambiente de desarrollo)
- Redirección por rol: Usuario → `home-usuario.html` / Profesional → `perfil-profesional.html` / Admin → `bandeja-notificaciones.html`
- Modal de error: "Correo o contraseña incorrectos."

### ❌ Fuera del scope (No-Gos)

- Autenticación con redes sociales (Google, Facebook)
- Autenticación en dos factores (2FA)
- Bloqueo automático de cuenta por intentos fallidos
- Recordar dispositivo / sesión persistente

---

## 4. Solución Visible

### Layout split 50/50

#### Panel izquierdo — Decorativo (50%)

| Elemento | Descripción |
|---|---|
| Fondo | Gradiente verde (color principal de marca Trébol) |
| Logo grande | Logo de Trébol centrado |
| Estadísticas de la plataforma | 3 contadores: profesionales activos · eventos disponibles · usuarios registrados |
| Frase motivacional | "Tu bienestar mental está a un clic" (o similar) |

#### Panel derecho — Formulario (50%)

| Elemento | Descripción |
|---|---|
| Logo pequeño | Logo Trébol en la esquina superior |
| Título | "Iniciar sesión" |
| Campo email | Obligatorio; validación de formato email; placeholder "tu@correo.com" |
| Campo contraseña | Obligatorio; enmascarado por defecto; ícono 👁 toggle visible/oculto |
| Link **"¿Olvidaste tu contraseña?"** | Debajo del campo contraseña → flujo de restablecimiento |
| Botón **"Iniciar sesión"** | CTA principal; muestra spinner + estado loading ~1.4s; deshabilitado durante proceso |
| Sección cuentas de prueba | Solo en ambiente de desarrollo: 3 botones de acceso rápido por rol |

### Cuentas de prueba (solo desarrollo)

| Rol | Email | Botón de acceso rápido |
|---|---|---|
| Usuario | usuario@trebol.com | [Ingresar como Usuario] |
| Profesional | profesional@trebol.com | [Ingresar como Profesional] |
| Admin | admin@trebol.com | [Ingresar como Admin] |

### Modal de error

| Elemento | Descripción |
|---|---|
| Título | "Error de autenticación" |
| Mensaje | "Correo o contraseña incorrectos. Por favor verifica tus datos." |
| Botón **"Intentar de nuevo"** | Cierra el modal; el formulario queda disponible |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Completar email + password y clic "Iniciar sesión" | Spinner loading ~1.4s → autenticación → redirección por rol |
| Clic 👁 en campo contraseña | Alterna entre texto enmascarado y texto visible |
| Clic "¿Olvidaste tu contraseña?" | → flujo de restablecimiento de contraseña |
| Credenciales incorrectas | Modal de error: "Correo o contraseña incorrectos." |
| Autenticación exitosa — rol Usuario | → `home-usuario.html` |
| Autenticación exitosa — rol Profesional | → `perfil-profesional.html` |
| Autenticación exitosa — rol Admin | → `bandeja-notificaciones.html` |

---

## 6. Flujo del Sistema

```
1. El usuario completa email y contraseña.
2. Validación frontend: ambos campos requeridos; email con formato válido.
3. El sistema verifica credenciales contra la base de datos.
4. El sistema verifica el hash Argon2 de la contraseña ingresada vs. el almacenado.
5. Si las credenciales son correctas:
   → Identifica el rol (Usuario / Profesional / Admin).
   → Genera cookie de sesión según el rol.
   → Redirige al dashboard del rol correspondiente.
6. Si las credenciales son incorrectas:
   → Muestra modal: "Correo o contraseña incorrectos."
   → No revela cuál campo es incorrecto.
7. Si la cuenta está PENDIENTE o RECHAZADA:
   → Muestra modal con mensaje apropiado; no permite el ingreso.
```

---

## 7. Restricciones

- El mensaje de error **nunca** indica si el error es en el correo o en la contraseña (prevención de enumeración de usuarios).
- El botón "Iniciar sesión" se **deshabilita** durante el procesamiento.
- Las cookies de sesión son **diferentes por rol** y no son intercambiables.
- Un profesional en estado PENDIENTE o RECHAZADO **no puede iniciar sesión**.
- La verificación de contraseña compara el **hash Argon2** del input vs. el almacenado. Nunca texto plano. Operación en la **Capa Helpers**.

---

## 8. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Campos obligatorios | Email y contraseña requeridos antes del envío |
| Mensaje de error genérico | Nunca especifica si es email o contraseña incorrecta |
| Cookie de sesión por rol | Cookies diferenciadas: Usuario / Profesional / Admin |
| Estado de cuenta | Solo cuentas con `Estado = ACTIVO` pueden iniciar sesión |
| Redirección post-login | Usuario → `home-usuario` · Profesional → `perfil-profesional` · Admin → `bandeja-notificaciones` |
| Verificación de contraseña | Hash **Argon2** comparado en la **Capa Helpers**; nunca texto plano |

---

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Fuerza bruta sobre el login | Rate limiting por IP (definido en módulo de seguridad, fuera de este scope) |
| Enumeración de usuarios | Mensaje genérico siempre, independientemente del motivo del fallo |
| Sesión no expirada correctamente | TTL de cookie definido en módulo de seguridad |

---

## 10. Datos Necesarios

| Dato | Fuente |
|---|---|
| Correo electrónico | `Usuarios.Correo` / `Profesionales.Correo` |
| Hash de contraseña | `Usuarios.PasswordHash` / `Profesionales.PasswordHash` — verificado con Argon2 |
| Rol / tipo de perfil | Discriminador de tabla o campo `TipoPerfil` |
| Estado de cuenta | `Usuarios.Estado` / `Profesionales.Estado` |

---

## 11. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Login exitoso | Usuario autenticado llega al dashboard correcto en < 2 segundos |
| Error sin exposición | Ningún mensaje revela información del campo incorrecto |
| Sin doble envío | Botón deshabilitado durante el procesamiento |
| Redirección correcta por rol | 3 roles redirigen al dashboard correcto |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

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

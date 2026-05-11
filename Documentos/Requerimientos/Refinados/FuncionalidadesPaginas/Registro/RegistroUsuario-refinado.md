# Registro de Usuario — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 1 — Público | **Apetito:** 1 semana

---

## 1. Problema

Las personas que quieren acceder a la plataforma como pacientes o participantes necesitan un proceso de registro simple, sin carga de documentos, que garantice la unicidad de la cuenta y confirme la identidad a través del correo electrónico.

---

## 2. Apetito

**1 semana.**
Formulario de registro, validación de duplicados, envío de correo de validación, flujo de creación de contraseña con token, y activación de cuenta.

---

## 3. Límites

### ✅ Dentro del scope

- Formulario de registro con los datos requeridos
- Validación de unicidad: correo y número de documento
- Creación de cuenta en estado PENDIENTE
- Envío de correo de validación con enlace + token (vigencia: 1 hora)
- Vista de creación de contraseña desde el enlace del correo
- Validación del token (válido / expirado / inválido)
- Opción de reenvío del correo de validación
- Activación de cuenta tras establecer la contraseña

### ❌ Fuera del scope (No-Gos)

- Registro con redes sociales
- Carga de documentos (solo aplica al Profesional)
- Validación manual de identidad
- Completar perfil extendido (foto, descripción) — corresponde al módulo de Perfil

---

## 4. Solución Visible

### Formulario de registro

| Campo | Obligatorio | Descripción |
|---|---|---|
| Nombre completo | Sí | Nombre y apellidos del usuario |
| Correo electrónico | Sí | Usado como identificador de acceso |
| Número de identificación | Sí | Documento de identidad |
| Alias (seudónimo) | Sí | Nombre visible en la plataforma si elige anonimato |
| Número de celular | Sí | Contacto del usuario |

### Acciones en el formulario

| Elemento | Descripción |
|---|---|
| Botón "Registrar" | Envía el formulario; spinner activo durante el proceso (protección doble envío) |
| Botón "Volver al Landing Page" | Cancela el proceso y regresa a la página principal |
| Mensajes de error | Siempre en **modal** |

### Vista de creación de contraseña (desde el correo)

| Elemento | Descripción |
|---|---|
| Campo nueva contraseña | Con reglas de complejidad visibles |
| Campo confirmar contraseña | Debe coincidir con el anterior |
| Botón "Guardar" | Spinner activo; deshabilitado durante el proceso |
| Modal de éxito | "Tu cuenta ha sido activada. Ya puedes iniciar sesión." |
| Modal de token inválido/expirado | Mensaje de error + opción de reenvío del correo |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Completar el formulario y hacer clic en "Registrar" | El sistema valida, crea la cuenta PENDIENTE y envía el correo de validación |
| Hacer clic en el enlace del correo | Redirige a la vista de creación de contraseña con token |
| Establecer contraseña y guardar | La cuenta se activa; modal de éxito y redirección al Login |
| Token expirado: solicitar reenvío | El sistema genera un nuevo token y reenvía el correo |
| Hacer clic en "Volver al Landing Page" | Regresa al Landing Page |

---

## 6. Flujo del Sistema

```
1. El usuario completa el formulario y acepta los términos y condiciones.
2. El sistema valida que el correo y el número de documento no estén ya registrados.
   → Si ya existen: muestra mensaje de error en modal.
3. El sistema crea el usuario en estado PENDIENTE.
4. El sistema envía un correo de validación con enlace + token (vigencia: 1 hora).
5. El usuario hace clic en el enlace del correo.
6. El sistema valida el token:
   → Token válido: muestra el formulario para establecer contraseña.
   → Token inválido o expirado: muestra mensaje en modal y opción de reenvío.
7. El usuario establece su contraseña.
8. El sistema activa la cuenta (estado ACTIVO) e invalida el token.
9. El sistema muestra modal de éxito y redirige al Login.
```

---

## 7. Restricciones

- No se puede registrar con un correo o número de documento ya existente en el sistema.
- La cuenta permanece en estado PENDIENTE hasta que el usuario activa su correo y establece contraseña.
- Un usuario en estado PENDIENTE no puede iniciar sesión.
- El token del correo de validación tiene vigencia de **1 hora**.
- El token es de **un solo uso**: se invalida tras ser utilizado.
- **La contraseña nunca se almacena en texto plano.** Debe aplicarse doble encriptación: **Hash + Salt** usando el algoritmo **Argon2** (con salt embebido). Esta operación se realiza en la **Capa Helpers** antes de persistir el dato en base de datos.

---

## 8. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Unicidad de correo | No se permiten dos cuentas con el mismo correo electrónico |
| Unicidad de documento | No se permiten dos cuentas con el mismo número de identificación |
| Estado inicial | La cuenta se crea en estado **PENDIENTE** |
| Token de validación | Vigencia: **1 hora**; de un solo uso |
| Activación | La cuenta cambia a estado **ACTIVO** solo tras establecer contraseña con token válido |
| **Encriptación de contraseña** | La contraseña se almacena con **Hash + Salt (Argon2)** — nunca en texto plano. Implementado en la **Capa Helpers** |
| Protección doble envío | El botón "Registrar" se deshabilita durante el envío |
| Reenvío | Solo si el token anterior expiró o no fue utilizado |

---

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Correo de validación llega como spam | Configurar correctamente SPF, DKIM y DMARC del servidor de correo |
| Token expirado sin opción de reenvío | Siempre mostrar el botón de reenvío en la pantalla de token inválido/expirado |
| Registro masivo de cuentas falsas | Implementar CAPTCHA en el formulario de registro (puede definirse en módulo de seguridad) |

---

## 10. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Nombre completo | `Usuarios.NombreCompleto` |
| Correo electrónico | `Usuarios.Correo` (único) |
| Número de identificación | `Usuarios.NumeroDocumento` (único) |
| Alias | `Usuarios.Alias` |
| Número de celular | `Usuarios.Celular` |
| Estado de cuenta | `Usuarios.Estado` (PENDIENTE / ACTIVO) |
| Token de validación | `TokensValidacion` (Token, UsuarioId, FechaExpiracion, Usado) |
| Contraseña (hash Argon2 + salt embebido) | `Usuarios.PasswordHash` — generado con **Argon2** en la Capa Helpers |

---

## 11. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Registro sin duplicados | El sistema rechaza correos y documentos ya registrados con mensaje en modal |
| Correo de validación entregado | El correo llega en menos de **60 segundos** |
| Activación exitosa | El usuario puede iniciar sesión tras establecer su contraseña |
| Token expirado manejado | La pantalla de token expirado muestra la opción de reenvío correctamente |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

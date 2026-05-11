# Registro de Profesional — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 1 — Público | **Apetito:** 1–2 semanas

---

## 1. Problema

Los psicólogos y terapeutas certificados necesitan registrarse en la plataforma con un proceso de validación riguroso que garantice la autenticidad de su identidad y habilitación profesional, antes de poder ofrecer servicios.

---

## 2. Apetito

**1 a 2 semanas.**
Formulario con carga de documentos, validación de duplicados, envío al administrador, verificación ante COLPSIC, aprobación manual y flujo de activación de cuenta con contraseña.

---

## 3. Límites

### ✅ Dentro del scope

- Formulario de registro con datos personales y documentos adjuntos
- Carga obligatoria de PDF: documento de identidad y tarjeta profesional
- Validación de unicidad: correo, número de documento, número de tarjeta profesional
- Creación de cuenta en estado PENDIENTE DE VALIDACIÓN
- Envío de datos y documentos al correo del administrador
- Validación automática ante COLPSIC del número de tarjeta profesional
- Notificación al profesional sobre el estado de su solicitud
- Flujo de aprobación/rechazo por el administrador
- Envío de enlace + token para establecer contraseña tras aprobación (vigencia: 1 día)
- Vista de creación de contraseña desde el enlace del correo
- Activación de cuenta tras establecer la contraseña

### ❌ Fuera del scope (No-Gos)

- Panel del administrador para gestión de validaciones (corresponde al módulo Admin)
- Completar perfil extendido (foto, estudios, experiencia) — corresponde al módulo de Perfil Profesional
- Registro con redes sociales

---

## 4. Solución Visible

### Formulario de registro

| Campo | Obligatorio | Descripción |
|---|---|---|
| Nombre completo | Sí | Nombre y apellidos del profesional |
| Correo electrónico | Sí | Usado como identificador de acceso |
| Número de identificación | Sí | Cédula de identidad |
| Alias | Sí | Nombre público en la plataforma |
| Número de celular | Sí | Contacto del profesional |
| Número de tarjeta profesional | Sí | Número emitido por COLPSIC |
| Copia PDF de la cédula de identidad | Sí | Archivo adjunto obligatorio |
| Copia PDF de la tarjeta profesional | Sí | Archivo adjunto obligatorio |

### Acciones en el formulario

| Elemento | Descripción |
|---|---|
| Botón "Registrar" | Envía el formulario; spinner activo (protección doble envío) |
| Cargador de PDF | Muestra el nombre del archivo seleccionado; solo acepta formato PDF |
| Botón "Volver al Landing Page" | Cancela el proceso y regresa a la página principal |
| Mensajes de error | Siempre en **modal** |

### Vista de creación de contraseña (desde el correo de aprobación)

| Elemento | Descripción |
|---|---|
| Campo nueva contraseña | Con reglas de complejidad visibles |
| Campo confirmar contraseña | Debe coincidir con el anterior |
| Botón "Guardar" | Spinner activo; deshabilitado durante el proceso |
| Modal de éxito | "Tu cuenta ha sido activada. Ya puedes iniciar sesión." |
| Modal de token inválido/expirado | Mensaje de error + opción de solicitar reenvío |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Completar formulario y adjuntar documentos | El sistema valida, crea cuenta PENDIENTE y notifica al administrador |
| Recibir notificación de aprobación | El profesional recibe enlace + token para establecer contraseña |
| Hacer clic en el enlace del correo | Redirige a la vista de creación de contraseña |
| Establecer contraseña y guardar | La cuenta se activa; modal de éxito y redirección al Login |
| Recibir notificación de rechazo | El profesional recibe correo con el motivo del rechazo |
| Token expirado: solicitar reenvío | El sistema genera un nuevo token y reenvía el correo |

---

## 6. Flujo del Sistema

```
1. El profesional completa el formulario y adjunta los documentos PDF.
2. El sistema valida que no existan duplicados de correo, documento ni número de tarjeta.
   → Si existen: muestra error en modal.
3. El sistema crea la cuenta en estado PENDIENTE DE VALIDACIÓN.
4. El sistema envía los datos y documentos adjuntos al correo del administrador.
5. El sistema valida automáticamente el número de tarjeta profesional ante COLPSIC.
   → Validación exitosa: el sistema notifica al profesional que sus datos están siendo revisados.
   → Validación fallida: el sistema notifica al administrador para revisión manual.
6. El administrador revisa los documentos:
   → Aprobado:
     - El sistema habilita la cuenta.
     - El sistema envía correo con enlace + token para establecer contraseña (vigencia: 1 día).
   → Rechazado:
     - El sistema notifica al profesional con el motivo del rechazo.
     - La cuenta permanece en estado RECHAZADO.
7. El profesional hace clic en el enlace del correo de aprobación.
8. El sistema valida el token:
   → Token válido: muestra formulario de nueva contraseña.
   → Token inválido o expirado: muestra modal con opción de solicitar nuevo enlace.
9. El profesional establece su contraseña; el sistema activa la cuenta (estado ACTIVO).
10. El sistema muestra modal de éxito y redirige al Login.
```

---

## 7. Restricciones

- No se puede registrar con un correo, número de documento o número de tarjeta profesional ya existente.
- La cuenta permanece en estado PENDIENTE DE VALIDACIÓN hasta la aprobación del administrador.
- Un profesional en estado PENDIENTE o RECHAZADO no puede iniciar sesión.
- El token de contraseña tiene vigencia de **1 día** (diferente al token del Usuario que es de 1 hora).
- El token es de **un solo uso**: se invalida tras ser utilizado.
- Solo se aceptan archivos PDF en la carga de documentos.
- **La contraseña nunca se almacena en texto plano.** Debe aplicarse doble encriptación: **Hash + Salt** usando el algoritmo **Argon2** (con salt embebido). Esta operación se realiza en la **Capa Helpers** antes de persistir el dato en base de datos.

---

## 8. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Unicidad de correo | No se permiten dos cuentas con el mismo correo |
| Unicidad de documento | No se permiten dos cuentas con el mismo número de identificación |
| Unicidad de tarjeta profesional | No se permiten dos cuentas con el mismo número de tarjeta COLPSIC |
| Estado inicial | La cuenta se crea en estado **PENDIENTE DE VALIDACIÓN** |
| Validación COLPSIC | El sistema verifica automáticamente el número de tarjeta profesional |
| Token de contraseña | Vigencia: **1 día**; de un solo uso |
| Activación | Solo tras aprobación del administrador y establecimiento de contraseña |
| Formato de documentos | Solo se aceptan archivos **PDF** |
| Protección doble envío | El botón "Registrar" se deshabilita durante el envío |
| **Encriptación de contraseña** | La contraseña se almacena con **Hash + Salt (Argon2)** — nunca en texto plano. Implementado en la **Capa Helpers** |

---

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| API de COLPSIC no disponible | Tener un flujo alternativo de revisión manual cuando la API falla |
| Documentos PDF muy pesados | Definir límite de tamaño máximo por archivo (ej: 5 MB) |
| Correo de aprobación llega como spam | Configurar correctamente SPF, DKIM y DMARC del servidor de correo |
| Token expirado antes de que el profesional lo use | Ofrecer siempre la opción de reenvío; el administrador puede reactivar el envío |

---

## 10. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Nombre completo | `Profesionales.NombreCompleto` |
| Correo electrónico | `Profesionales.Correo` (único) |
| Número de identificación | `Profesionales.NumeroDocumento` (único) |
| Alias | `Profesionales.Alias` |
| Número de celular | `Profesionales.Celular` |
| Número de tarjeta profesional | `Profesionales.NumerTarjetaProfesional` (único) |
| PDF cédula | `Profesionales.UrlDocumentoIdentidad` (ruta del archivo) |
| PDF tarjeta profesional | `Profesionales.UrlTarjetaProfesional` (ruta del archivo) |
| Estado de cuenta | `Profesionales.Estado` (PENDIENTE / ACTIVO / RECHAZADO) |
| Token de activación | `TokensActivacion` (Token, ProfesionalId, FechaExpiracion, Usado) |
| Contraseña (hash Argon2 + salt embebido) | `Profesionales.PasswordHash` — generado con **Argon2** en la Capa Helpers |

---

## 11. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Registro sin duplicados | El sistema rechaza correo, documento y tarjeta ya registrados con modal |
| Notificación al administrador | El correo con documentos llega al administrador tras el registro |
| Validación COLPSIC | El sistema intenta la validación automática y registra el resultado |
| Correo de aprobación entregado | El profesional recibe el enlace tras la aprobación del administrador |
| Activación exitosa | El profesional puede iniciar sesión tras establecer su contraseña |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

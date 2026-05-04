# Documento Base de Refinamiento – Proyecto Trébol

| Campo         | Detalle                                      |
|---------------|----------------------------------------------|
| Proyecto      | Trébol                                       |
| Versión       | 1.0                                          |
| Tecnología    | .NET Core 10                                 |
| Base de Datos | SQL Server                                   |
| Plataforma    | Web MVC                                      |
| Metodología   | Shape Up (Basecamp)                          |
| Documento     | Requisitos Generales y Plan de Refinamiento  |

---

## 1. Visión General

Trébol es una plataforma web de telepsicología que conecta:

- Personas que buscan acompañamiento y ayuda psicológica.
- Profesionales certificados en salud mental (psicólogos, terapeutas y especialistas médicos).
- Espacios públicos de bienestar emocional (conferencias y salas abiertas).
- Sesiones privadas pagas con seguimiento clínico.
- Comunidad profesional especializada con mensajería y derivaciones.

**Énfasis estratégico:**

| Pilar                        | Descripción                                                        |
|------------------------------|--------------------------------------------------------------------|
| Anonimato opcional           | El usuario puede participar con alias en conferencias y asesorías  |
| Seguridad emocional          | Moderación activa, protección de datos y buen trato               |
| Validación profesional real  | Verificación ante COLPSIC y organismos equivalentes               |
| Escalabilidad                | Arquitectura preparada para crecimiento                           |
| Telepsicología moderna       | Videollamadas, chat, historial clínico digital                    |
| Conferencias en vivo         | Salas públicas y privadas con gestión de cupos                    |
| Seguimiento clínico ético    | Historial psicológico privado, compartible bajo consentimiento    |
| Monetización para profesionales | Desembolsos mensuales transparentes con detalle de retenciones |

---

## 2. Metodología de Refinamiento (Shape Up)

Cada módulo se refinará con la siguiente estructura:

| # | Sección              | Contenido                                           |
|---|----------------------|-----------------------------------------------------|
| 1 | **Problema**         | Qué necesidad real resuelve el módulo               |
| 2 | **Apetito**          | Tiempo razonable estimado de construcción           |
| 3 | **Límites**          | Qué entra y qué queda fuera del alcance             |
| 4 | **Solución visible** | Qué pantallas existen y qué muestra el usuario      |
| 5 | **Acciones**         | Qué puede hacer cada actor en el módulo             |
| 6 | **Restricciones**    | Qué no puede hacer el sistema o el usuario          |
| 7 | **Reglas de negocio**| Validaciones internas y lógica del sistema          |
| 8 | **Riesgos**          | Qué puede salir mal (rabbit holes)                  |
| 9 | **Datos necesarios** | Qué guarda la base de datos                        |
| 10| **Métricas de éxito**| Cómo saber si el módulo funciona correctamente      |

---

## 3. Arquitectura General de Producto (Macro Módulos)

### 3.1 Landing Page Pública

Contenido visible sin iniciar sesión:

- Inicio (banner principal con mensajes de aliento, datos de la plataforma y profesionales destacados)
- Cómo funciona
- Especialidades disponibles (tarjetas por área psicológica)
- Salas activas y conferencias próximas
- Cinta informativa con profesionales destacados seleccionados por la plataforma
- Los 3 eventos con mayor número de inscritos (sección promocional)
- Registro de usuario
- Registro de profesional
- Login
- Términos y condiciones (diferenciados por perfil)
- Pie de página con información del sitio

---

### 3.2 Aplicación Interna – Perfil Usuario / Paciente

Acceso post-login para el perfil usuario:

| Módulo                    | Descripción                                                               |
|---------------------------|---------------------------------------------------------------------------|
| Dashboard personal        | Próximas citas, eventos inscritos, sala más próxima, salas abiertas       |
| Publicaciones (Muro)      | Ver publicaciones de profesionales, comentar de forma anónima, ver eventos del día con cuenta regresiva |
| Buscar profesionales      | Por nombre, cédula, especialidad, área de interés                         |
| Perfil del profesional    | Tabs: información, salas/eventos, comentarios al profesional              |
| Agendar citas             | Calendario del profesional, selección de horario, pago previo             |
| Entrar a salas/eventos    | Inscripción, proceso de pago, acceso a conferencias                       |
| Ver historial de sesiones | Citas recibidas, canceladas, movidas, duración y recomendaciones          |
| Historial de pagos        | Detalle de pagos realizados                                               |
| Opiniones                 | Comentar eventos y profesionales                                          |
| Configuración de privacidad | Mostrar nombre real o alias (aplica según tipo de interacción)          |
| Áreas de interés          | Selección múltiple; visible solo para profesionales                       |
| Mi perfil                 | Datos personales, alias, eventos registrados, próximas citas              |

---

### 3.3 Aplicación Interna – Perfil Profesional

Acceso post-login para el perfil profesional:

| Módulo                        | Descripción                                                                           |
|-------------------------------|---------------------------------------------------------------------------------------|
| Dashboard profesional         | Panel centralizado con métricas clave (ver detalle §3.3.1)                           |
| Publicaciones (Muro)          | Crear publicaciones; ver comentarios anónimos de usuarios                            |
| Agenda laboral                | Calendario propio, bloqueo de franjas, citas programadas por mes                     |
| Pacientes                     | Historial privado de pacientes, historial psicológico, medicamentos recetados        |
| Historial clínico             | Registro por paciente, compartible bajo criterio del profesional                     |
| Derivaciones                  | Trasladar pacientes a colegas con copia de datos; gestionar remisiones a centros     |
| Crear y gestionar salas       | Salas públicas o privadas (pagas o gratuitas), múltiples eventos por sala            |
| Conferencias                  | Abrir sala, gestionar cámara/micrófono, moderar comentarios, expulsar usuarios       |
| Pagos e ingresos              | Saldo a favor, desembolsos mensuales, detalle de retenciones e impuestos             |
| Cuentas bancarias             | Configurar cuentas para recibir desembolsos                                          |
| Perfil profesional            | Datos personales, estudios, idiomas, especialidad, foto                              |
| Mensajería entre profesionales| Chat directo con colegas, filtro por cargo o área de interés                         |
| Control de sesiones           | Una sola sesión activa por dispositivo; control anti-fraude con log de auditoría     |

#### 3.3.1 Dashboard Profesional – Métricas Clave

El dashboard del profesional mostrará en un panel centralizado:

- Total de pagos acumulados en la plataforma.
- Cantidad de eventos creados.
- Cantidad de seguidores.
- Cantidad de "Me gusta" recibidos.
- Total cobrado históricamente a través de la aplicación.
- **Valor del próximo desembolso** (saldo a favor, neto después de retenciones e impuestos).
- Cantidad de próximos eventos propios.
- Estadísticas de sesiones: realizadas, ingresos y usuarios atendidos.

---

### 3.4 Aplicación Interna – Perfil Administrador del Sistema

Acceso exclusivo para el administrador de la plataforma:

| Módulo                        | Descripción                                                                         |
|-------------------------------|-------------------------------------------------------------------------------------|
| Moderación                    | Gestión de reportes de expulsiones, palabras inapropiadas y violaciones de política |
| Verificación profesional      | Revisión manual de documentos de profesionales cuando falla la API de COLPSIC       |
| Finanzas                      | Gestión de desembolsos, retenciones y estados de pago                               |
| Políticas del sistema         | Configuración del porcentaje de retención de la plataforma (acceso exclusivo)       |
| Soporte                       | Atención a incidencias de usuarios y profesionales                                  |
| Auditoría                     | Log de sesiones concurrentes, expulsiones, faltas y acciones críticas del sistema   |
| Métricas globales             | Estadísticas generales de la plataforma                                             |

---

## 4. Menú Lateral (Compartido por Perfil)

Los ítems del menú se muestran u ocultan según el perfil autenticado:

| Ítem de menú               | Usuario | Profesional |
|----------------------------|:-------:|:-----------:|
| Home                       | ✓       | ✓           |
| Publicaciones              | ✓       | ✓           |
| Profesionales              | ✓       | ✓           |
| — Especialistas            | ✓       | ✓           |
| — Psicólogos               | ✓       | ✓           |
| — Mis mentores / Colegas   | ✓       | ✓           |
| Mis citas                  | ✓       | ✓           |
| Calendario                 | ✓       | ✓           |
| Mi perfil                  | ✓       | ✓           |
| Ver mis salas              | —       | ✓           |
| Mis eventos                | —       | ✓           |

---

## 5. Reglas de Negocio Globales

### 5.1 Privacidad y Anonimato del Usuario

| Tipo de interacción                    | Nombre visible para el profesional |
|----------------------------------------|------------------------------------|
| Conferencia (sala pública)             | Nombre real **o** alias (elige el usuario) |
| Cita de asesoría                       | Nombre real **o** alias (elige el usuario) |
| Cita de seguimiento / proceso terapéutico | Nombre real **obligatorio**     |

- Los profesionales siempre muestran su nombre real; no aplica alias para ellos.
- El usuario puede cambiar su preferencia desde la configuración de su perfil.

### 5.2 Protección de Datos de Contacto en Chat

- Está prohibido compartir teléfonos, correos u otros datos de contacto por chat.
- El sistema detecta automáticamente intentos de envío y encripta el contenido (`XXX`).
- **1ª y 2ª falta**: advertencia al infractor; contenido encriptado.
- **3ª falta (usuario)**: bloqueo de mensajes en la sala; reporte al correo de la plataforma.
- **Si es el profesional**: mensaje de advertencia sobre sanciones económicas.

### 5.3 Moderación de Lenguaje en Conferencias

- El sistema reemplaza palabras obscenas o groseras por `XXX`.
- A las **3 faltas** de vocabulario inapropiado, el usuario queda bloqueado para enviar mensajes en la sala.
- El profesional puede expulsar a un usuario; el sistema solicita el motivo y notifica al correo de la plataforma.
- Un usuario expulsado/bloqueado por un profesional no puede ver el perfil, salas, eventos ni ningún dato relacionado con ese profesional.

### 5.4 Control de Sesiones Concurrentes (Perfil Profesional)

- Un profesional no puede tener sesiones activas en dos dispositivos al mismo tiempo.
- Si se detecta una sesión activa al intentar iniciar sesión:
  - Se muestra un modal con detalle de la sesión existente (dispositivo, IP, fecha/hora).
  - El profesional puede elegir cerrar la sesión anterior previa **confirmación de contraseña**.
  - El dispositivo anterior recibe notificación de cierre forzado.
- Cada evento queda registrado en el **log de auditoría** del administrador.
- Esta restricción aplica únicamente al perfil profesional; no aplica a reconexiones en el mismo dispositivo.

### 5.5 Desembolsos y Retenciones

- La plataforma retiene todos los pagos realizados por usuarios a profesionales.
- Los desembolsos se ejecutan automáticamente entre el **1° y el 5° de cada mes**.
- El porcentaje de retención y comisión es configurado por el **Administrador del Sistema** desde la sección **Políticas del Sistema**.
- El saldo visible para el profesional es siempre el monto **neto** (después de retenciones e impuestos).
- Cada profesional recibe notificación con el desglose: monto bruto, retención, impuestos y monto neto.

### 5.6 Validación de Profesionales

La validación de tarjeta profesional es **100% manual**. Los organismos de referencia (COLPSIC y ReTHUS) no disponen de API pública, por lo que el sistema no realiza ninguna consulta automática.

**Organismos de referencia para el administrador:**

| Tipo de profesional          | Organismo de validación | Fuente de consulta manual                                                                                   |
|------------------------------|-------------------------|-------------------------------------------------------------------------------------------------------------|
| Psicólogo / Terapeuta        | **COLPSIC**             | [Verificación de tarjetas COLPSIC](https://sara.colpsic.org.co/publico/verificacion-tarjetas) |
| Médico / Especialista médico | **ReTHUS**              | [Consulta pública ReTHUS](https://web.sispro.gov.co/THS/Cliente/ConsultasPublicas/ConsultaPublicaDeTHxIdentificacion.aspx) |

**Flujo:**

1. Una vez confirmado el correo, el sistema actualiza el estado del profesional a **Por validar documentos**.
2. El sistema envía automáticamente un correo al **administrador de la plataforma** con los datos completos del profesional y sus documentos adjuntos.
3. El administrador consulta manualmente el organismo correspondiente (COLPSIC o ReTHUS) y verifica la tarjeta profesional.
4. **Si aprueba**: habilita la cuenta desde el panel de administración; el sistema notifica al profesional por correo que su cuenta está activa.
5. **Si rechaza**: registra el motivo; el sistema notifica al profesional por correo con el motivo del rechazo.

### 5.7 Registro y Unicidad

- La aplicación no permite registrar el mismo número de documento o correo electrónico más de una vez.
- Para profesionales, tampoco se permite duplicar el número de tarjeta profesional.
- Los errores de duplicado se muestran en modales con mensajes descriptivos.

---

## 6. Plan de Refinamiento por Fases

El refinamiento se realiza de adelante hacia atrás: primero lo visible para el usuario, luego la lógica interna, y finalmente la infraestructura y seguridad.

---

### Fase 1 — Lo que ve el mundo (Sin autenticación)

| # | Módulo                    | Estado     | Referencia                        |
|---|---------------------------|------------|-----------------------------------|
| 1 | Landing Page Pública      | Pendiente  | §3.1, Funcionalidades §2          |
| 2 | Registro Usuario          | Pendiente  | Funcionalidades §4.2              |
| 3 | Registro Profesional      | Pendiente  | Funcionalidades §4.3              |
| 4 | Login                     | Pendiente  | Funcionalidades §3                |
| 5 | Recuperación de acceso    | Pendiente  | Funcionalidades §3                |
| 6 | Términos y consentimiento | Pendiente  | Funcionalidades §4.1              |

---

### Fase 2 — Experiencia del Usuario Autenticado

| #  | Módulo                          | Estado     | Referencia                                  |
|----|---------------------------------|------------|---------------------------------------------|
| 7  | Dashboard usuario               | Pendiente  | Funcionalidades §7, §3.2                    |
| 8  | Publicaciones (Muro)            | Pendiente  | Funcionalidades §6, DocTecnicoRoles §2.7    |
| 9  | Buscar y explorar profesionales | Pendiente  | Funcionalidades §7.3, DocTecnicoRoles §3.2  |
| 10 | Perfil profesional público      | Pendiente  | Funcionalidades §7.3                        |
| 11 | Agenda y reserva de citas       | Pendiente  | Funcionalidades §13, DocTecnicoRoles §3.5   |
| 12 | Pagos                           | Pendiente  | DocTecnicoRoles §4.2                        |
| 13 | Historial de sesiones y pagos   | Pendiente  | Funcionalidades §11.1, DocTecnicoRoles §3.5 |
| 14 | Opiniones y comentarios         | Pendiente  | Funcionalidades §7.3                        |
| 15 | Áreas de interés                | Pendiente  | Funcionalidades §15                         |
| 16 | Configuración de privacidad     | Pendiente  | Funcionalidades §16                         |

---

### Fase 3 — Experiencia del Profesional Autenticado

| #  | Módulo                               | Estado     | Referencia                                    |
|----|--------------------------------------|------------|-----------------------------------------------|
| 17 | Dashboard profesional                | Pendiente  | §3.3.1, DocTecnicoRoles §2.5                  |
| 18 | Agenda laboral y calendario          | Pendiente  | Funcionalidades §10 Tab3/4, DocTecnicoRoles §2.3 |
| 19 | Gestión de pacientes                 | Pendiente  | DocTecnicoRoles §2.4                          |
| 20 | Historial clínico                    | Pendiente  | DocTecnicoRoles §2.4                          |
| 21 | Derivaciones a colegas y centros     | Pendiente  | DocTecnicoRoles §2.4                          |
| 22 | Crear y administrar salas            | Pendiente  | Funcionalidades §10 Tab2, DocTecnicoRoles §2.2|
| 23 | Conferencias en vivo                 | Pendiente  | Funcionalidades §12                           |
| 24 | Pagos, saldo e ingresos              | Pendiente  | DocTecnicoRoles §2.6, §4.5                    |
| 25 | Mensajería entre profesionales       | Pendiente  | DocTecnicoRoles §2.5                          |
| 26 | Perfil profesional (edición)         | Pendiente  | Funcionalidades §10 Tab1                      |
| 27 | Control de sesiones concurrentes     | Pendiente  | Funcionalidades §14, §5.4                     |

---

### Fase 4 — Sistema Interno, Seguridad y Administración

| #  | Módulo                               | Estado     | Referencia                              |
|----|--------------------------------------|------------|-----------------------------------------|
| 28 | Validación COLPSIC y perfiles médicos| Pendiente  | Funcionalidades §4.3.1, §5.6            |
| 29 | Moderación de contenido              | Pendiente  | Funcionalidades §11.3, §12.3, §5.2, §5.3|
| 30 | Verificación manual de profesionales | Pendiente  | §5.6, §3.4                              |
| 31 | Auditoría y log de eventos           | Pendiente  | Funcionalidades §14, §3.4               |
| 32 | Políticas del sistema (Admin)        | Pendiente  | DocTecnicoRoles §4.5, §3.4              |
| 33 | Gestión de desembolsos (Admin)       | Pendiente  | DocTecnicoRoles §4.5                    |
| 34 | Notificaciones (correo y sistema)    | Pendiente  | DocTecnicoRoles §4.3, §4.5              |
| 35 | Seguridad y tokens                   | Pendiente  | Funcionalidades §4.2, §4.3, §14         |
| 36 | Reportes y métricas globales         | Pendiente  | §3.4                                    |
| 37 | Escalabilidad técnica                | Pendiente  | —                                       |

---

## 7. Plantilla Shape Up por Módulo

Cada módulo de las fases anteriores se refinará usando la siguiente plantilla:

```markdown
## Módulo N – [Nombre del Módulo]

### Problema
[Qué necesidad real resuelve este módulo y para quién.]

### Apetito
[Tiempo razonable estimado. Ej: ciclo corto (1–2 semanas) o ciclo largo (4–6 semanas).]

### Límites (Scope)
**Entra:**
- ...

**No entra (No-Gos):**
- ...

### Solución Visible
[Qué pantallas existen y qué muestra el usuario. Puede incluir descripción de flujo o boceto.]

### Acciones del Usuario / Actor
- [Actor]: puede hacer X.
- [Actor]: puede hacer Y.

### Restricciones
- [Actor] no puede hacer Z.

### Reglas de Negocio
- Validación / lógica interna del sistema.

### Riesgos (Rabbit Holes)
- Qué puede complicarse o desviarse del alcance.

### Datos Necesarios
| Campo | Tipo | Descripción |
|-------|------|-------------|
| ...   | ...  | ...         |

### Métricas de Éxito
- Cómo saber que el módulo funciona correctamente.
```

---

## 8. Actores del Sistema

| Actor             | Descripción                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| **Visitante**     | Accede al landing page sin autenticación; puede registrarse o hacer login   |
| **Usuario**       | Paciente o persona que busca acompañamiento; acceso completo post-login     |
| **Profesional**   | Psicólogo, terapeuta o especialista validado; crea salas y atiende pacientes|
| **Administrador** | Gestiona la plataforma, valida profesionales y configura políticas del sistema|

---

## 9. Estados del Sistema

### Estados de un Usuario / Profesional

| Estado                   | Descripción                                                       |
|--------------------------|-------------------------------------------------------------------|
| Pendiente                | Registro iniciado, correo sin verificar                          |
| Por validar documentos   | Correo verificado, documentos en revisión (solo profesionales)   |
| Documentos en revisión   | API de COLPSIC consultada o revisión manual en curso             |
| Activo                   | Cuenta habilitada y operativa                                    |
| Bloqueado                | Cuenta suspendida por infracciones o decisión del administrador  |
| Rechazado                | Documentos no válidos; cuenta no habilitada                      |

### Estados de una Inscripción / Pago

| Estado                 | Descripción                                          |
|------------------------|------------------------------------------------------|
| Pendiente de pago      | Orden generada, esperando transacción               |
| Pago aprobado          | Transacción exitosa                                  |
| Pago rechazado         | Transacción fallida                                  |
| Inscripción confirmada | Usuario registrado en el evento                     |
| Sin cupos              | No hay disponibilidad en el evento                  |
| Reembolso pendiente    | Pago realizado pero cupos agotados durante el proceso|
| Inscripción cancelada  | Cancelada por el usuario o por el sistema           |

---

## 10. Recomendación Estratégica de Inicio

Comenzar el refinamiento detallado por el **Módulo 1: Landing Page Pública**, ya que define:

- La identidad visual y marca del producto.
- La confianza y primera impresión del visitante.
- La captación y conversión de nuevos usuarios y profesionales.
- La estructura UX global de toda la aplicación.

Desde allí, seguir el orden de fases definido en §6, refinando módulo por módulo con la plantilla Shape Up de §7 antes de iniciar el desarrollo de cada uno.

---

## 11. Referencias Cruzadas

| Documento                          | Ruta                                                                              |
|------------------------------------|-----------------------------------------------------------------------------------|
| Actores y Roles (refinado)         | `Documentos/Requerimientos/Refinados/Funciones/DocTecnicoRoles-refinado.md`       |
| Funcionalidades del Sistema (refinado) | `Documentos/Requerimientos/Refinados/Funciones/Funcionalidades-refinado.md`   |
| Reglas de Refinamiento             | `Documentos/Requerimientos/Refinados/Refinamiento-refinado.md`                    |

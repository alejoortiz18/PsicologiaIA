# Requisitos Generales del Sistema — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server

---

## 1. Visión General

**Trébol** es una plataforma web que conecta personas que buscan apoyo psicológico con profesionales certificados en salud mental. Ofrece un entorno seguro, escalable y éticamente responsable para la telepsicología moderna.

### Pilares de la plataforma

| Pilar | Descripción |
|---|---|
| Anonimato opcional | El usuario decide si interactúa con su nombre real o un alias |
| Seguridad emocional | Entorno controlado y moderado para la salud mental |
| Validación profesional real | Solo profesionales con documentación verificada pueden operar |
| Escalabilidad | Diseñada para crecer en usuarios, salas y sesiones simultáneas |
| Telepsicología moderna | Conferencias en vivo, citas privadas y seguimiento clínico digital |
| Monetización clara | Modelo de ingresos transparente para profesionales y la plataforma |

---

## 2. Módulos Macro del Sistema

### 2.1 Landing Page Pública

Vista visible sin necesidad de iniciar sesión. Contiene:

- Inicio y presentación de la plataforma
- Cómo funciona Trébol
- Búsqueda de profesionales
- Salas activas disponibles
- Conferencias próximas
- Banner promocional con profesional destacado
- Registro de usuario
- Registro de profesional
- Inicio de sesión
- Términos y condiciones

---

### 2.2 Aplicación Interna — Usuario / Paciente

Disponible tras iniciar sesión:

| Módulo | Funcionalidades principales |
|---|---|
| Dashboard personal | Tarjetas: Eventos inscritos, Próximas citas, Sala más próxima, Mis mentores. Tabla de próximas citas. Sección de eventos de hoy. Galeria de salas abiertas. |
| Buscar profesionales | Búsqueda en directorios: Especialistas y Psicólogos (por nombre, especialidad, ciudad, orden) |
| Mis mentores | Listado de profesionales seguidos con fecha de inicio y opción de dejar de seguir |
| Agendar sesiones | Selección de horario en el calendario del profesional (vistas Mensual/Semanal/Diaria) |
| Pago de cita privada | Checkout con Tarjeta / PSE / Nequi, vista previa de tarjeta en tiempo real |
| Salas y eventos | Exploración, filtrado e inscripción a eventos públicos (wizard de 3 pasos) |
| Sala de cita privada | Cámara, micrófono, chat, control de alias, nota privada, recomendaciones del profesional |
| Sala de conferencia | Transmisión en vivo, preguntas anónimas, mensaje privado al ponente |
| Historial de sesiones | Registro de citas anteriores y su estado |
| Pagos | Historial de transacciones y comprobantes |
| Mensajería | Conversaciones con profesionales (no con otros usuarios) |
| Calendario personal | Vistas Semanal/Diaria de citas y eventos inscritos con indicadores de color |
| Configuración | Datos personales (alias y celular editables) y foto de perfil |
| Privacidad | Gestión de alias y anonimato en citas de tipo asesoría |

---

### 2.3 Aplicación Interna — Profesional

| Módulo | Funcionalidades principales |
|---|---|
| **Dashboard profesional** | Tarjetas: Citas hoy, Mis eventos hoy, Citas próximas, Seguidores. Tabla de citas del día. Eventos de hoy con acceso directo. Eventos de colegas agrupados por proximidad. |
| **Agenda** | Calendario propio (vistas Mensual/Semanal/Diaria) con disponibilidad configurable y citas programadas |
| **Citas privadas** | Gestión de citas (Próximas / Historial), filtros, nueva cita, ingresar a sala en vivo |
| **Sala de cita privada** | Cámara, micrófono, chat, panel clínico (Sesión / Recomendaciones), mover cita, finalizar |
| **Salas** | Creación, configuración, administración y duplicación de salas |
| **Sala de conferencia** | Transmisión en vivo, toggle de preguntas, lista de asistentes, mensajes privados, finalizar |
| **Mis eventos** | Panel KPI (salas, inscritos, ingresos del mes), sección de eventos de hoy, tabla con filtros |
| **Indicadores (KPI)** | Métricas de consultas, clientes, ingresos, saldo por pagar, salas y eventos por período |
| **Mis colegas** | Colegas vinculados, pacientes compartidos, derivaciones activas, desvincular |
| **Pagos e ingresos** | Control de ingresos, comisiones y configuración bancaria |
| **Perfil profesional** | 5 tabs: Información personal, Salas y eventos, Calendario, Citas, Indicadores |
| **Mensajería** | Comunicación con usuarios y otros profesionales; etiquetas de rol por contacto |
| **Derivaciones** | Traslado de pacientes a otros especialistas con compartición controlada de datos |

**Métricas del dashboard profesional:**

| Métrica | Descripción |
|---|---|
| Citas hoy | Número de citas del día actual |
| Mis eventos hoy | Salas que se realizan hoy |
| Citas próximas | Total de citas próximas agendadas |
| Seguidores | Usuarios que siguen al profesional |

---

### 2.4 Módulo de Administración

| Módulo | Responsabilidad |
|---|---|
| Bandeja de notificaciones | Interfaz tipo cliente de correo para gestionar solicitudes de registro profesional y alertas del sistema. Carpetas: Recibidos, Registros profesionales, Leídos. |
| Verificación profesional | Aprobar (activa la cuenta y envía enlace de contraseña) o rechazar (con motivo obligatorio) solicitudes de registro |
| Moderación | Gestión de contenido, reportes y bloqueos |
| Finanzas | Comisiones, liquidaciones y pagos a profesionales |
| Soporte | Atención de incidencias y resolución de problemas |
| Auditoría | Trazabilidad de acciones críticas del sistema |
| Métricas globales | Reportes de uso, crecimiento y salud de la plataforma |

---

## 3. Método de Refinamiento (Shape Up aplicado)

Cada módulo del sistema se refina siguiendo esta estructura antes de ser entregado al equipo de desarrollo:

| Paso | Contenido |
|---|---|
| **1. Problema** | Qué necesidad real resuelve el módulo |
| **2. Apetito** | Tiempo razonable y fijo de construcción |
| **3. Límites** | Qué entra y qué NO entra en este ciclo (No-Gos explícitos) |
| **4. Solución visible** | Qué pantallas existen y cómo se ven |
| **5. Acciones del usuario** | Qué puede hacer el usuario en este módulo |
| **6. Restricciones** | Qué no puede hacer el sistema en este alcance |
| **7. Reglas de negocio** | Validaciones internas del módulo |
| **8. Riesgos** | Rabbit holes identificados y cómo se mitigan |
| **9. Datos necesarios** | Qué guarda la base de datos para este módulo |
| **10. Métricas de éxito** | Cómo saber si el módulo funciona correctamente |

> **Principio Shape Up:** El tiempo es fijo; el scope se ajusta. Si un módulo no cabe en el apetito definido, se corta el scope — no se extiende el plazo.

---

## 4. Orden de Refinamiento por Fases

El refinamiento sigue un orden de afuera hacia adentro: primero lo que el usuario ve, luego la lógica interna.

### Fase 1 — Lo que ve el mundo (Público)

| # | Módulo |
|---|---|
| 1 | Landing Page Pública |
| 2 | Registro de Usuario |
| 3 | Registro de Profesional |
| 4 | Login |
| 5 | Recuperación de acceso |
| 6 | Términos y consentimiento |

### Fase 2 — Experiencia del Usuario

| # | Módulo |
|---|---|
| 7 | Dashboard del usuario |
| 8 | Búsqueda de profesionales |
| 9 | Perfil público del profesional |
| 10 | Agenda y reserva de citas |
| 11 | Pagos del usuario |
| 12 | Historial de sesiones |
| 13 | Opiniones anónimas |
| 14 | Privacidad y seudónimo |

### Fase 3 — Herramientas del Profesional

| # | Módulo |
|---|---|
| 15 | Dashboard profesional |
| 16 | Agenda laboral y calendario |
| 17 | Gestión de pacientes |
| 18 | Historial clínico |
| 19 | Compartir datos del historial |
| 20 | Crear salas públicas |
| 21 | Conferencias pagas y gratuitas |
| 22 | Ingresos y retiros |
| 23 | Mensajería entre profesionales |
| 24 | Derivaciones a otros especialistas |

### Fase 4 — Sistema Interno

| # | Módulo |
|---|---|
| 25 | Validación ante COLPSIC |
| 26 | Moderación y auditoría |
| 27 | Notificaciones automáticas |
| 28 | Seguridad y control de sesiones |
| 29 | Reportes administrativos |
| 30 | Escalabilidad técnica |

---

## 5. Recomendación Estratégica — Módulo de Arranque

### Módulo 1: Landing Page Pública

**Apetito:** 1–2 semanas  
**Motivo:** Es la primera impresión del sistema. Define la marca, genera confianza, capta usuarios y establece la estructura UX global que se replicará en el resto de la aplicación.

**Alcance del módulo 1:**
- Banner principal con información de la plataforma
- Cinta de profesional destacado (parte superior)
- Sección de especialidades en tarjetas
- Cinta de los 3 eventos más populares
- Pie de página institucional
- Botones de acceso: Iniciar sesión y Registro

**No-Gos (fuera de scope del módulo 1):**
- Funcionalidades de usuario autenticado
- Pasarela de pagos
- Panel de administración

Desde este módulo se establece el sistema de diseño (colores, tipografía, componentes) que todos los demás módulos heredarán.

---

## 6. Estándares de UI/UX Transversales

> Todos los módulos del sistema deben cumplir con las [Reglas de Desarrollo UI/UX](../../reglas-ui-ux-frontend.md) del proyecto.

| Estándar | Regla |
|---|---|
| Tablas | Paginación de **10 registros** por página como valor por defecto |
| Mensajes del sistema | Siempre mediante **modal** (confirmaciones, errores, advertencias, éxito) |
| Fechas | Formato `DD MMM YYYY` → ej: `8 Oct 2026` |
| Horas | Formato 12H → ej: `3PM`, `3:30PM` |
| Fecha + hora | `8 Oct 2026 3PM` |
| Eliminación de registros | Siempre requiere confirmación en **modal** con delay de 800ms en el botón de confirmar |
| Estados de carga | Skeleton loader o spinner según el tiempo de espera esperado |
| Formularios | Validación `onBlur` con mensaje de error debajo de cada campo |
| Accesibilidad | WCAG 2.1 nivel AA como mínimo |

---

## 7. Estándar de Seguridad — Contraseñas (Regla Transversal)

> Esta regla aplica a **todos los perfiles** del sistema sin excepción: Usuario, Profesional y cualquier actor futuro con autenticación.

| Aspecto | Regla |
|---|---|
| **Almacenamiento** | Las contraseñas **nunca** se almacenan en texto plano |
| **Algoritmo** | Doble encriptación **Hash + Salt** usando **Argon2** (el salt queda embebido en el hash; se almacena en un único campo `PasswordHash`) |
| **Capa de implementación** | **Capa Helpers** — clase `PasswordHelper` con métodos `HashPassword` y `VerifyPassword` |
| **Generación del hash** | Al momento de establecer o cambiar la contraseña (activación de cuenta, restablecimiento) |
| **Verificación** | En el login, la contraseña ingresada se hashea con Argon2 y se compara contra el hash almacenado. Nunca se desencripta |
| **Prohibición** | Ningún controlador, repositorio ni servicio debe manipular contraseñas directamente; siempre a través de `PasswordHelper` |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

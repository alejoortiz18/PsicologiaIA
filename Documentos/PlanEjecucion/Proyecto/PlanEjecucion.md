# Plan de Ejecución — Proyecto Trébol

> **Versión:** 2.0 | **Fecha:** Mayo 2026
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Metodología:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Principio:** El tiempo es fijo; el scope se ajusta. Cada tarea es un ciclo de construcción concreto y entregable.

---

## Índice

- [Convenciones del Plan](#convenciones-del-plan)
- [Fase 0 — Base de Datos](#fase-0--base-de-datos)
- [Fase 1 — Infraestructura y Arquitectura Base](#fase-1--infraestructura-y-arquitectura-base)
- [Fase 2 — Autenticación y Registro](#fase-2--autenticación-y-registro)
- [Fase 3 — Experiencia del Usuario](#fase-3--experiencia-del-usuario)
- [Fase 4 — Herramientas del Profesional](#fase-4--herramientas-del-profesional)
- [Fase 5 — Sistema Interno y Administración](#fase-5--sistema-interno-y-administración)
- [Resumen de Tareas](#resumen-de-tareas)

---

## Convenciones del Plan

| Símbolo | Significado |
|---|---|
| `[ ]` | Tarea pendiente |
| `[x]` | Tarea completada |
| `[~]` | Tarea en progreso |
| **Apetito** | Duración estimada del ciclo |
| **Entregable** | Qué debe existir y funcionar al terminar |
| **Documento de referencia** | Requerimiento refinado que guía la tarea |

---

## Fase 0 — Base de Datos

> **Objetivo:** Tener el modelo de datos completo, funcional y sin datos, listo para que todas las demás fases construyan sobre él.
> **Principio de seguridad:** Las contraseñas se almacenan con Hash + Salt (Argon2). El campo `PasswordHash` nunca contiene texto plano.

---

### T-00.1 — Crear la base de datos y catálogos base

**Apetito:** 1 día
**Documento de referencia:** [BaseDatos-refinado.md](../../Requerimientos/Refinados/BaseDatos/BaseDatos-refinado.md) — Sección 1 y 2

**Entregable:**
- Base de datos `TrebolDB` creada en SQL Server
- Tablas de catálogos creadas y con datos iniciales:
  - `Pais`
  - `Ciudad`
  - `Especialidad`
  - `Categoria`
  - `Idioma`

**Tareas:**
- [ ] Crear la base de datos `TrebolDB`
- [ ] Crear tabla `Pais` con datos iniciales (Colombia, Venezuela, Ecuador, etc.)
- [ ] Crear tabla `Ciudad` con ciudades principales por país
- [ ] Crear tabla `Especialidad` con especialidades psicológicas iniciales
- [ ] Crear tabla `Categoria` con categorías de salas iniciales
- [ ] Crear tabla `Idioma` con idiomas más comunes
- [ ] Crear tabla `Configuracion` con valores iniciales del sistema

---

### T-00.2 — Crear tablas de Usuarios y Autenticación

**Apetito:** 1 día
**Documento de referencia:** [BaseDatos-refinado.md](../../Requerimientos/Refinados/BaseDatos/BaseDatos-refinado.md) — Secciones 3 y 3.9

**Entregable:**
- Tablas de usuarios, administrador y tokens creadas con constraints y claves únicas

**Tareas:**
- [ ] Crear tabla `Usuario` (con campo `PasswordHash` — hash Argon2, nunca texto plano)
- [ ] Crear tabla `Profesional` (con campo `PasswordHash` — hash Argon2, nunca texto plano)
- [ ] Crear tabla `Administrador` (con campo `PasswordHash` — hash Argon2; campos: AdminId, Nombre, Correo, PasswordHash, Estado, FechaCreacion)
- [ ] Crear tabla `ProfesionalEspecialidad`
- [ ] Crear tabla `ProfesionalEstudio`
- [ ] Crear tabla `ProfesionalIdioma`
- [ ] Crear tabla `TokenValidacion` (activación de cuenta usuario)
- [ ] Crear tabla `TokenActivacion` (activación de cuenta profesional)
- [ ] Crear tabla `TokenRecuperacion` (recuperación de contraseña)
- [ ] Crear tabla `Sesion`
- [ ] Verificar constraints, índices únicos y CHECK constraints

---

### T-00.3 — Crear tablas de Disponibilidad y Cuentas Bancarias

**Apetito:** 0.5 día
**Documento de referencia:** [BaseDatos-refinado.md](../../Requerimientos/Refinados/BaseDatos/BaseDatos-refinado.md) — Sección 4

**Entregable:**
- Tablas de disponibilidad y datos bancarios del profesional creadas

**Tareas:**
- [ ] Crear tabla `HorarioDisponible`
- [ ] Crear tabla `HorarioBloqueado`
- [ ] Crear tabla `CuentaBancaria`

---

### T-00.4 — Crear tablas de Salas, Eventos, Mensajería e Interacción Social

**Apetito:** 1.5 días
**Documento de referencia:** [BaseDatos-refinado.md](../../Requerimientos/Refinados/BaseDatos/BaseDatos-refinado.md) — Secciones 5, 7, 8.5, 8.6, 8.7 y 8.8

**Entregable:**
- Tablas de salas, eventos, inscripciones, pagos, mensajería, colaboración y notificaciones creadas

**Tareas:**
- [ ] Crear tabla `Sala`
- [ ] Crear tabla `Evento`
- [ ] Crear tabla `MensajeEvento`
- [ ] Crear tabla `Inscripcion`
- [ ] Crear tabla `Pago`
- [ ] Crear tabla `LogPago`
- [ ] Crear tabla `Seguidor`
- [ ] Crear tabla `MeGusta`
- [ ] Crear tabla `ComentarioProfesional`
- [ ] Crear tabla `RespuestaComentario`
- [ ] Crear tabla `Conversacion` (ConversacionId, UsuarioId, ProfesionalId, FechaInicio, UltimoMensaje, Estado)
- [ ] Crear tabla `MensajePrivado` (MensajeId, ConversacionId, EmisorTipo, EmisorId, Contenido, FechaEnvio, Leido)
- [ ] Crear tabla `ColaboracionProfesional` (ColaboracionId, ProfesionalSolicitanteId, ProfesionalReceptorId, Estado, FechaSolicitud, FechaAceptacion)
- [ ] Crear tabla `Notificacion` (NotificacionId, DestinatarioTipo, DestinatarioId, Tipo, Titulo, Mensaje, Leida, FechaCreacion, FechaLectura, EntidadRelacionadaTipo, EntidadRelacionadaId)
- [ ] Verificar constraints y FK entre tablas nuevas y existentes

---

### T-00.5 — Crear tablas de Citas, Pago de Cita e Historial Clínico

**Apetito:** 0.5 día
**Documento de referencia:** [BaseDatos-refinado.md](../../Requerimientos/Refinados/BaseDatos/BaseDatos-refinado.md) — Secciones 6 y 7.4

**Entregable:**
- Tablas del módulo de citas privadas y pagos de cita creadas

**Tareas:**
- [ ] Crear tabla `Cita`
- [ ] Crear tabla `PagoCita` (PagoCitaId, CitaId, UsuarioId, ProfesionalId, MontoBase, ComisionPlataforma, Total, MetodoPago, Estado, FechaTransaccion, ReferenciaPago)
- [ ] Crear tabla `Recomendacion`
- [ ] Crear tabla `ComentarioPrivado`
- [ ] Crear tabla `HistorialClinico`
- [ ] Verificar FK de `PagoCita` con `Cita`, `Usuario` y `Profesional`

---

### T-00.6 — Crear índices y vistas

**Apetito:** 1 día
**Documento de referencia:** [BaseDatos-refinado.md](../../Requerimientos/Refinados/BaseDatos/BaseDatos-refinado.md) — Secciones 11, 12, 12.6 y 12.7

**Entregable:**
- Todos los índices creados; vistas (incluidas las nuevas de directorio y calificaciones) funcionales y verificadas

**Tareas:**
- [ ] Crear índices sobre columnas de búsqueda y filtro (correo, estado, FK, fechas)
- [ ] Crear vista `vw_SalasActivas`
- [ ] Crear vista `vw_TopEventosInscritos`
- [ ] Crear vista `vw_ProximasCitasUsuario`
- [ ] Crear vista `vw_ProximasCitasProfesional`
- [ ] Crear vista `vw_ResumenProfesional`
- [ ] Crear vista `vw_DirectorioProfesionales` (Sección 12.6 — agrega nombre, especialidades, calificación promedio, seguidores, tarifa, ciudad, estado verificado, badge COLPSIC)
- [ ] Crear vista `vw_CalificacionResumenProfesional` (Sección 12.7 — distribución de estrellas: total por 1★–5★, promedio ponderado, total de reseñas)
- [ ] Verificar resultados de cada vista con datos de prueba manuales

---

### T-00.7 — Crear Stored Procedures

**Apetito:** 1.5 días
**Documento de referencia:** [BaseDatos-refinado.md](../../Requerimientos/Refinados/BaseDatos/BaseDatos-refinado.md) — Secciones 13, 13.13 y 13.14

> **Nota:** Los SPs reciben el hash ya generado. La encriptación Argon2 ocurre en la Capa Helpers, nunca dentro del SP.

**Entregable:**
- Todos los Stored Procedures creados, probados con datos de prueba

**Tareas:**
- [ ] Crear `sp_RegistrarUsuario`
- [ ] Crear `sp_ActivarUsuario` (recibe `@PasswordHash` generado con Argon2 en Helpers)
- [ ] Crear `sp_RegistrarProfesional`
- [ ] Crear `sp_AprobarProfesional`
- [ ] Crear `sp_ValidarLogin` (compara hash Argon2 contra `Usuario`, `Profesional` **y `Administrador`**; retorna `TipoEntidad`; nunca texto plano)
- [ ] Crear `sp_GenerarTokenRecuperacion`
- [ ] Crear `sp_RestablecerPassword` (recibe `@PasswordHash` generado con Argon2 en Helpers)
- [ ] Crear `sp_ObtenerSalasActivas`
- [ ] Crear `sp_InscribirUsuarioEvento`
- [ ] Crear `sp_ConfirmarPago`
- [ ] Crear `sp_AgendarCita`
- [ ] Crear `sp_ToggleSeguidor`
- [ ] Crear `sp_EnviarMensajePrivado` (Sección 13.13 — recibe ConversacionId o crea una nueva si no existe, inserta en `MensajePrivado`, actualiza `UltimoMensaje` en `Conversacion`, valida que el emisor tenga permiso para iniciar el hilo)
- [ ] Crear `sp_ObtenerDirectorioProfesionales` (Sección 13.14 — usa `vw_DirectorioProfesionales`; acepta parámetros: @Busqueda, @Ciudad, @Especialidad, @Orden, @Pagina, @TamañoPagina; retorna página de resultados + total de registros)
- [ ] Probar cada SP con EXEC manual desde SQL Server Management Studio

---

## Fase 1 — Infraestructura y Arquitectura Base

> **Objetivo:** Tener el proyecto .NET configurado con todas las capas, conexión a BD funcional, y los helpers transversales listos.

---

### T-01.1 — Crear la solución y proyectos por capa

**Apetito:** 0.5 día
**Documento de referencia:** [Arquitectura-refinado-v2.md](../../Requerimientos/Refinados/Funciones/Arquitectura-refinado-v2.md)

**Entregable:**
- Solución `.sln` con los 6 proyectos correctamente referenciados entre sí

**Tareas:**
- [ ] Crear solución `Trebol.sln`
- [ ] Crear proyecto `Trebol.Web` — Presentation (MVC)
- [ ] Crear proyecto `Trebol.Constants` — constantes y mensajes
- [ ] Crear proyecto `Trebol.Domain` — reglas de negocio
- [ ] Crear proyecto `Trebol.Helpers` — utilidades reutilizables
- [ ] Crear proyecto `Trebol.Infrastructure` — repositorios y acceso a BD
- [ ] Crear proyecto `Trebol.Model` — DTOs, Entities, Enums, AppDbContext
- [ ] Configurar referencias entre proyectos

---

### T-01.2 — Configurar Entity Framework Core y AppDbContext

**Apetito:** 0.5 día
**Documento de referencia:** [Arquitectura-refinado-v2.md](../../Requerimientos/Refinados/Funciones/Arquitectura-refinado-v2.md) — Sección 1.6

**Entregable:**
- `AppDbContext` configurado; conexión a SQL Server verificada

**Tareas:**
- [ ] Instalar paquetes NuGet: `Microsoft.EntityFrameworkCore.SqlServer`, `Microsoft.EntityFrameworkCore.Tools`
- [ ] Crear entidades en `Trebol.Model/Entities` (una por tabla)
- [ ] Configurar `AppDbContext` con todos los `DbSet<T>`
- [ ] Configurar cadena de conexión en `appsettings.json`
- [ ] Verificar conexión con un query simple a `Configuracion`

---

### T-01.3 — Implementar PasswordHelper (Argon2)

**Apetito:** 0.5 día
**Documento de referencia:** [Arquitectura-refinado-v2.md](../../Requerimientos/Refinados/Funciones/Arquitectura-refinado-v2.md) — Sección 1.4 y [RequisitosGenerales-refinado-v2.md](../../Requerimientos/Refinados/Funciones/RequisitosGenerales-refinado-v2.md) — Sección 7

> **Regla transversal:** Este helper es el único componente autorizado para generar y verificar hashes. Todos los módulos con contraseña dependen de él.

**Entregable:**
- `PasswordHelper` funcional, probado con valores conocidos

**Tareas:**
- [ ] Instalar paquete NuGet: `Konscious.Security.Cryptography.Argon2` (o equivalente)
- [ ] Crear clase `PasswordHelper` en `Trebol.Helpers`
- [ ] Implementar método `HashPassword(string password) → string` (Argon2 con salt aleatorio embebido)
- [ ] Implementar método `VerifyPassword(string password, string hash) → bool`
- [ ] Registrar `PasswordHelper` en el contenedor de dependencias (Helpers `AccessDependency`)
- [ ] Verificar que un hash nunca es igual al texto original

---

### T-01.4 — Implementar repositorios base e Infrastructure AccessDependency

**Apetito:** 0.5 día
**Documento de referencia:** [Arquitectura-refinado-v2.md](../../Requerimientos/Refinados/Funciones/Arquitectura-refinado-v2.md) — Sección 1.5

**Entregable:**
- Patrón Repository base configurado; `AddInfrastructure` registrado

**Tareas:**
- [ ] Crear interfaz `IRepository<T>` con operaciones CRUD básicas
- [ ] Implementar `Repository<T>` base en `Trebol.Infrastructure`
- [ ] Crear extensión `AddInfrastructure(IServiceCollection, IConfiguration)` en Infrastructure
- [ ] Crear extensión `AddApplication(IServiceCollection)` en Helpers/Domain
- [ ] Registrar ambas extensiones en `Program.cs`

---

### T-01.5 — Configurar constantes, AutoMapper y filtros globales

**Apetito:** 0.5 día
**Documento de referencia:** [Arquitectura-refinado-v2.md](../../Requerimientos/Refinados/Funciones/Arquitectura-refinado-v2.md) — Secciones 1.1 y 1.2

**Entregable:**
- Constantes de mensajes, paginación y estados configuradas; AutoMapper con perfiles base

**Tareas:**
- [ ] Crear constantes de mensajes del sistema en `Trebol.Constants`
- [ ] Crear constantes de paginación (valor por defecto: `10`)
- [ ] Crear constantes de estados (PENDIENTE, ACTIVO, BLOQUEADO, PENDIENTE_VALIDACION, RECHAZADO)
- [ ] Configurar AutoMapper con perfiles base en `Trebol.Web`
- [ ] Configurar filtro global de autenticación/autorización por cookie de sesión

---

## Fase 2 — Autenticación y Registro

> **Objetivo:** Cualquier persona puede registrarse como usuario o profesional, validar su correo, establecer contraseña e iniciar sesión.

---

### T-02.1 — Landing Page

**Apetito:** 1–2 semanas
**Documento de referencia:** [LandingPage-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/LandingPage/LandingPage-refinado.md)

**Entregable:**
- Landing page pública visible y funcional con todos sus elementos

**Tareas:**
- [ ] Crear controlador `LandingController`
- [ ] Crear vista `Index` con estructura completa (cinta superior, banner, especialidades, eventos, pie de página)
- [ ] Implementar cinta superior con profesional destacado (dato desde `Configuracion.ProfesionalDestacadoId`)
- [ ] Implementar sección de especialidades desde tabla `Especialidad`
- [ ] Implementar cinta de los 3 eventos más populares desde `vw_TopEventosInscritos`
- [ ] Botón "Iniciar sesión" → `/Login`
- [ ] Botón "Registro" → `/Registro/SeleccionPerfil`
- [ ] Pie de página con información institucional

---

### T-02.2 — Selección de Perfil de Registro

**Apetito:** 1–2 días
**Documento de referencia:** [SeleccionPerfil-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Registro/SeleccionPerfil-refinado.md)

**Entregable:**
- Vista de selección con dos opciones; términos y condiciones por perfil; redirección correcta

**Tareas:**
- [ ] Crear `RegistroController` con acción `SeleccionPerfil`
- [ ] Crear vista con tarjetas: "Registrarme como Usuario" y "Registrarme como Profesional"
- [ ] Implementar términos y condiciones por perfil (modal o sección desplegable)
- [ ] Aceptación obligatoria antes de continuar (validación frontend)
- [ ] Botón "Volver" → Landing Page

---

### T-02.3 — Registro de Usuario

**Apetito:** 1 semana
**Documento de referencia:** [RegistroUsuario-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Registro/RegistroUsuario-refinado.md)

**Entregable:**
- Usuario puede registrarse, recibir correo de validación y activar su cuenta con contraseña (Argon2)

**Tareas:**
- [ ] Crear acción `RegistroUsuario` (GET + POST) en `RegistroController`
- [ ] Crear formulario con campos: Nombre, Correo, Documento, Alias, Celular
- [ ] Implementar repositorio `IUsuarioRepository` con método de registro (llama a `sp_RegistrarUsuario`)
- [ ] Validar unicidad de correo y documento (mensaje en modal si ya existe)
- [ ] Generar token de validación (GUID criptográfico, vigencia 1 hora) y guardarlo en `TokenValidacion`
- [ ] Enviar correo con enlace + token (plantilla en `Trebol.Constants`)
- [ ] Crear vista y acción `CrearContrasena` que recibe el token
- [ ] Validar token (válido / expirado / inválido)
- [ ] Si válido: formulario de nueva contraseña con reglas de complejidad visibles
- [ ] Al guardar: hashear con `PasswordHelper.HashPassword()` → llamar `sp_ActivarUsuario`
- [ ] Modal de éxito + redirección al Login
- [ ] Implementar reenvío de correo de validación
- [ ] Botón "Volver al Landing Page"

---

### T-02.4 — Registro de Profesional

**Apetito:** 1–2 semanas
**Documento de referencia:** [RegistroProfesional-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Registro/RegistroProfesional-refinado.md)

**Entregable:**
- Profesional puede registrarse con documentos, llegar al administrador y activar cuenta con contraseña (Argon2) tras aprobación

**Tareas:**
- [ ] Crear acción `RegistroProfesional` (GET + POST) en `RegistroController`
- [ ] Crear formulario con campos: Nombre, Correo, Documento, Celular, N° Tarjeta Profesional
- [ ] Implementar carga de PDF: cédula y tarjeta profesional (solo PDF, máximo 5 MB)
- [ ] Validar unicidad de correo, documento y número de tarjeta (mensajes en modal)
- [ ] Crear cuenta en estado `PENDIENTE_VALIDACION` (llama a `sp_RegistrarProfesional`)
- [ ] Enviar correo al administrador con datos y documentos adjuntos
- [ ] Implementar validación automática ante COLPSIC del número de tarjeta (servicio externo)
- [ ] Notificar al profesional que sus datos están siendo revisados
- [ ] Crear acción `AprobarProfesional` (panel admin): llama a `sp_AprobarProfesional`
  - Aprobado: genera token de activación (vigencia 1 día) y envía correo al profesional
  - Rechazado: envía correo con motivo al profesional
- [ ] Crear vista `ActivarCuentaProfesional` (desde enlace del correo de aprobación)
- [ ] Al guardar contraseña: hashear con `PasswordHelper.HashPassword()` → `sp_ActivarUsuario` equivalente para profesional
- [ ] Modal de éxito + redirección al Login

---

### T-02.5 — Login

**Apetito:** 3–5 días
**Documento de referencia:** [Login-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Login/Login-refinado.md)

**Entregable:**
- Login funcional para Usuario y Profesional con cookies de sesión diferenciadas

**Tareas:**
- [ ] Crear `LoginController` con acción `Index` (GET + POST)
- [ ] Crear formulario con campos: correo electrónico y contraseña
- [ ] Al autenticar: hashear contraseña con `PasswordHelper.HashPassword()` → llamar `sp_ValidarLogin`
- [ ] Si credenciales correctas: generar cookie de sesión según `TipoEntidad` (Usuario / Profesional)
- [ ] Redirigir según perfil: Usuario → Home Usuario; Profesional → Home Profesional
- [ ] Si incorrectas: mostrar mensaje genérico en modal (sin revelar qué campo falló)
- [ ] Protección doble envío (spinner + botón deshabilitado)
- [ ] Botón "Restablecer contraseña" → flujo de recuperación
- [ ] Botón "Crear cuenta" → Selección de Perfil
- [ ] Botón "Volver" → Landing Page

---

### T-02.6 — Restablecer Contraseña

**Apetito:** 3–5 días
**Documento de referencia:** [RestaurarPassword-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Login/RestaurarPassword-refinado.md)

**Entregable:**
- Flujo de recuperación de contraseña con token de un solo uso y hash Argon2 en el restablecimiento

**Tareas:**
- [ ] Crear acción `SolicitarRecuperacion` (GET + POST): recibe correo
- [ ] Llamar a `sp_GenerarTokenRecuperacion` (invalida tokens anteriores; siempre responde OK sin revelar si existe el correo)
- [ ] Enviar correo con enlace + token (vigencia 1 hora) si el correo existe internamente
- [ ] Crear acción `RestablecerPassword` (GET + POST): recibe token de la URL
- [ ] Validar token: válido → formulario; expirado/inválido → modal con opción de reenvío
- [ ] Al guardar: hashear con `PasswordHelper.HashPassword()` → llamar a `sp_RestablecerPassword`
- [ ] Modal de éxito + redirección al Login

---

## Fase 3 — Experiencia del Usuario

> **Objetivo:** El usuario autenticado puede explorar salas, inscribirse a eventos, pagar, ver su perfil y gestionar sus citas.

---

### T-03.1 — Menú Lateral (Sidebar)

**Apetito:** 3–5 días
**Documento de referencia:** [MenuLateral-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/MenuLateral/MenuLateral-refinado.md)

**Entregable:**
- Sidebar fijo renderizado según perfil activo en sesión

**Tareas:**
- [ ] Crear componente de layout `_LayoutInterno.cshtml` con sidebar
- [ ] Renderizar ítems según perfil leído desde la cookie de sesión
- [ ] Menú Usuario: Inicio, Profesionales (Especialistas / Psicólogos / Mis mentores), Mis citas, Mi perfil
- [ ] Menú Profesional: Inicio, Mis eventos, Calendario, Mis citas, Mi perfil
- [ ] Indicador visual del ítem activo
- [ ] Logotipo visible en la parte superior del sidebar

---

### T-03.2 — Home del Usuario

**Apetito:** 1–2 semanas
**Documento de referencia:** [HomeUsuario-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Home/HomeUsuario-refinado.md)

**Entregable:**
- Dashboard del usuario con resumen de actividad y galería de salas filtrable

**Tareas:**
- [ ] Crear `HomeController` (Usuario) con acción `Index`
- [ ] Sección superior: eventos registrados, próximas citas, sala más próxima
- [ ] Galería de salas desde `vw_SalasActivas` con paginación de 10 registros
- [ ] Filtro por categoría de sala
- [ ] Filtro por fecha de inicio
- [ ] Búsqueda por nombre de sala o nombre de orador
- [ ] Sección de salas destacadas (más solicitadas)
- [ ] Sección de salas que comienzan hoy
- [ ] Tarjeta de sala con: nombre, fecha/hora, cupos, precio, me gusta, botones "Ver más" y "Registrarse"

---

### T-03.3 — Detalle de Sala (Modal)

**Apetito:** 3–5 días
**Documento de referencia:** [DetalleSala-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/DetalleSala/DetalleSala-refinado.md)

**Entregable:**
- Modal de detalle de sala con información completa y acciones de navegación

**Tareas:**
- [ ] Implementar modal que se abre al hacer clic en "Ver más" en la tarjeta
- [ ] Mostrar información completa: sala, evento, orador, cupos disponibles
- [ ] Botón "Registrarse" → inicia flujo de inscripción
- [ ] Botón "Ver información del orador" → navega a perfil del profesional
- [ ] Cierre del modal con X o clic fuera

---

### T-03.4 — Inscripción y Pago

**Apetito:** 2–3 semanas
**Documento de referencia:** [InscripcionPago-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/InscripcionPago/InscripcionPago-refinado.md)

**Entregable:**
- Flujo completo de inscripción con pasarela de pago, doble validación de cupos y todos los estados

**Tareas:**
- [ ] Crear `InscripcionController` con flujo de pasos
- [ ] Paso 1: confirmación de datos del evento (nombre, fecha, orador, precio)
- [ ] Validar cupos en tiempo real (llamar a `sp_InscribirUsuarioEvento`)
- [ ] Para salas gratuitas: inscripción directa → correo de confirmación
- [ ] Para salas de pago: paso 2 con pasarela integrada (tarjeta, PSE, transferencia)
- [ ] Implementar `sp_ConfirmarPago` con doble validación de cupos (prevención de sobreventa)
- [ ] Gestionar todos los estados: `PendientePago`, `PagoAprobado`, `PagoRechazado`, `Confirmada`, `SinCupos`, `ReembolsoPendiente`, `Cancelada`
- [ ] Enviar correo de confirmación con código de inscripción
- [ ] Registrar trazabilidad en `LogPago`
- [ ] Mostrar resultado en modal según estado

---

### T-03.5 — Perfil del Orador (Público)

**Apetito:** 1–2 semanas
**Documento de referencia:** [PerfilOrador-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/PerfilOrador/PerfilOrador-refinado.md)

**Entregable:**
- Vista pública del perfil del profesional con **4 tabs** funcionales y sistema de calificaciones

**Tareas:**
- [ ] Crear `PerfilOradorController` con acción `Detalle(int profesionalId)`
- [ ] Tab 1 — Cuenta: información del profesional (nombre, foto, especialidades, idiomas, seguidores, "Sobre mí", "Cómo trabajo"), calificación promedio (4.9/5), barra de distribución de estrellas desde `vw_CalificacionResumenProfesional`
- [ ] Tab 2 — Salas: salas creadas por el profesional con próximas fechas, cupos y botón inscribirse
- [ ] Tab 3 — Comentarios: comentarios públicos con lógica de visibilidad por rol (usuarios ven todos; profesional puede responder los suyos)
- [ ] Tab 4 — Calendario: disponibilidad del profesional con modal de agendar cita → `pago-cita` (redirige a T-03.11)
- [ ] Botón seguir / dejar de seguir (llama a `sp_ToggleSeguidor`)
- [ ] Navegación por tabs sin recarga de página completa

---

### T-03.6 — Perfil del Usuario

**Apetito:** 1 semana
**Documento de referencia:** [PerfilUsuario-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/PerfilUsuario/PerfilUsuario-refinado.md)

**Entregable:**
- Vista de perfil del usuario con formulario editable y tabs de eventos y citas

**Tareas:**
- [ ] Crear `PerfilUsuarioController` con acción `Index`
- [ ] Formulario de datos personales (solo editable: Alias, Celular, Foto de perfil)
- [ ] Campos no editables: Nombre, Correo, Documento
- [ ] Tab de eventos inscritos con paginación de 10 registros
- [ ] Tab de próximas citas privadas desde `vw_ProximasCitasUsuario`
- [ ] Confirmación de cambios en modal

---

### T-03.7 — Citas del Usuario (Lista)

**Apetito:** 1–2 semanas
**Documento de referencia:** [CitasUsuario-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Citas/CitasUsuario-refinado.md)

**Entregable:**
- Vista de **lista de citas** del usuario con estadísticas, tabs de estado y acciones por cita

**Tareas:**
- [ ] Crear `CitasController` (Usuario) con acción `Index`
- [ ] Tira de estadísticas superior: total citas, citas completadas, próxima cita (fecha y profesional)
- [ ] Tabs de filtro: **Próximas** | **Historial** (activo por defecto: Próximas)
- [ ] Tabla de citas con columnas: Profesional, Especialidad, Tipo, Fecha, Hora, Duración, Estado, Acciones
- [ ] Botón **Unirse** (citas en estado Confirmada y fecha próxima) → navega a sala-usuario (T-03.9)
- [ ] Botón **Ver detalle** → modal con resumen completo de la cita (profesional, notas, recomendaciones)
- [ ] Botón **Cancelar** → modal de confirmación con mensaje de política de cancelación
- [ ] Botón principal **Agendar cita** → flujo de agendamiento (T-04.8)
- [ ] Paginación 10 registros por página
- [ ] Mensaje de estado vacío si no hay citas en la tab activa

---

### T-03.8 — Mis Eventos (listado del usuario)

**Apetito:** 3–5 días

**Entregable:**
- Lista de eventos en los que el usuario está inscrito con su estado actual

**Tareas:**
- [ ] Acción `MisEventos` en `HomeController` o controlador dedicado
- [ ] Listado con: nombre del evento, sala, fecha, estado de inscripción, código de inscripción
- [ ] Paginación de 10 registros

---

### T-03.9 — Sala Privada del Usuario

**Apetito:** 1–2 semanas
**Documento de referencia:** [SalaUsuario-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Salas/SalaUsuario-refinado.md)

**Entregable:**
- Sala de videollamada para citas privadas desde la perspectiva del usuario

**Tareas:**
- [ ] Crear `SalaUsuarioController` con acción `Unirse(int citaId)`
- [ ] Área de video principal (placeholder WebRTC; integración real en T-05.5)
- [ ] Ventana de vista propia (picture-in-picture, esquina inferior derecha)
- [ ] Tira de controles: Micrófono (toggle), Cámara (toggle), Compartir pantalla, Chat (toggle panel), Participantes, Colgar (botón rojo)
- [ ] Panel lateral de Chat (toggle): lista de mensajes, input + enviar
- [ ] Información de sesión visible: nombre del profesional, tipo de cita, contador de duración (MM:SS)
- [ ] Botón "Reportar problema" (abre modal con textarea y envío)
- [ ] Modal de confirmación al colgar: "¿Seguro que deseas terminar la sesión?" → Confirmar → `citas-usuario` (T-03.7)
- [ ] Proteger acceso: solo el usuario dueño de la cita puede entrar, y solo si el estado es `Confirmada`

---

### T-03.10 — Sala de Conferencia del Usuario (Asistente)

**Apetito:** 1–2 semanas
**Documento de referencia:** [SalaConferenciaUsuario-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Salas/SalaConferenciaUsuario-refinado.md)

**Entregable:**
- Sala de conferencia desde la perspectiva del asistente/usuario inscrito

**Tareas:**
- [ ] Crear `SalaConferenciaController` acción `AsistenteUnirse(int eventoId)`
- [ ] Video del presentador ocupa 70–80% del ancho; panel lateral ocupa el resto
- [ ] Panel lateral con dos tabs: **Chat** | **Participantes**
- [ ] Chat: burbujas de mensajes, input + enviar (mensajes van a `MensajeEvento`)
- [ ] Participantes: lista con avatar y alias; contador total visible en encabezado del panel
- [ ] Botón "✋ Levantar la mano" (toggle; envía evento SignalR al moderador — infraestructura T-05.5)
- [ ] Badge "🔴 En vivo" pulsante en la parte superior de la pantalla
- [ ] Modal de salida suave: "¿Deseas salir de la sala?" → Salir → `home-usuario`
- [ ] Deshabilitar controles de cámara y micrófono propios (modo asistente, solo escucha)

---

### T-03.11 — Pago de Cita

**Apetito:** 3–5 días
**Documento de referencia:** [PagoCita-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/PagoCita/PagoCita-refinado.md)

**Entregable:**
- Checkout independiente para el pago de citas privadas con registro en tabla `PagoCita`

**Tareas:**
- [ ] Crear `PagoCitaController` con acción `Index(int citaId)`
- [ ] Layout sin sidebar (página de pago de flujo completo)
- [ ] Resumen del agendamiento: profesional (alias + especialidad), tipo de cita, fecha, hora, duración
- [ ] Desglose de precio: Tarifa base, Comisión plataforma ($5.000 COP), **Total**
- [ ] Tres métodos de pago con selector radio: **Tarjeta de crédito/débito**, **PSE**, **Efecty**
- [ ] Formulario condicional: si Tarjeta → mostrar campos número, nombre, vencimiento, CVV (enmascarados); si PSE → selector banco + tipo persona; si Efecty → instrucciones de código
- [ ] Validación frontend de campos de pago antes de enviar
- [ ] Al confirmar: crear registro en `PagoCita` con estado `PendientePago` → llamar pasarela → actualizar a `PagoAprobado` o `PagoRechazado`
- [ ] Modal de éxito: "Pago realizado — Tu cita está confirmada" + botón → `citas-usuario` (T-03.7)
- [ ] Modal de fallo: mensaje descriptivo + opción de reintentar o cambiar método

---

### T-03.12 — Calendario del Usuario

**Apetito:** 3–5 días
**Documento de referencia:** [CalendarioUsuario-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/CalendarioUsuario/CalendarioUsuario-refinado.md)

**Entregable:**
- Calendario personal con citas y eventos inscritos, vistas semana/mes/día

**Tareas:**
- [ ] Crear `CalendarioUsuarioController` con acción `Index`
- [ ] Barra de herramientas: botón **[Hoy]**, flechas **[‹]** **[›]**, título de período actual
- [ ] Pills de vista: **Semana** | **Mes** | **Día** (semana activa por defecto)
- [ ] Leyenda de colores: rosa = cita privada, verde = sala/conferencia
- [ ] Vista semana: cuadrícula de 7 columnas × rango 08:00–21:00 con bloques de eventos proporcionales a la duración
- [ ] Bloques de evento: mostrar nombre del profesional/sala, hora inicio–fin, color según tipo
- [ ] Clic en bloque → modal de detalle: nombre, profesional/orador, fecha, hora, duración, estado, botón acción (Unirse / Ver sala)
- [ ] Vista mes: grilla de calendario mensual con puntos de color en días con eventos
- [ ] Vista día: columna única con todos los eventos del día seleccionado

---

### T-03.13 — Mensajería del Usuario

**Apetito:** 1 semana
**Documento de referencia:** [MensajesUsuario-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Mensajeria/MensajesUsuario-refinado.md)

**Entregable:**
- Chat del usuario con sus profesionales usando tablas `Conversacion` + `MensajePrivado`

**Tareas:**
- [ ] Crear `MensajeriaController` acción `IndexUsuario`
- [ ] Layout de dos paneles: panel izquierdo (lista de conversaciones) + panel derecho (chat activo)
- [ ] Panel izquierdo: avatar del profesional (alias), último mensaje truncado, timestamp, badge de no leídos; ordenado por `UltimoMensaje` DESC
- [ ] Panel derecho: encabezado con alias del profesional + "Ver perfil del profesional" (→ T-03.5), burbujas de mensajes (propios a la derecha, del profesional a la izquierda), input de texto + botón Enviar
- [ ] Al enviar: llamar a `sp_EnviarMensajePrivado` → actualizar UI sin recargar (fetch/AJAX)
- [ ] Marcar mensajes como leídos al abrir la conversación
- [ ] Solo usuarios con cita activa o que sigan al profesional pueden iniciar hilo nuevo
- [ ] Alias exclusivo: nunca mostrar nombre real del profesional en este módulo
- [ ] Estado vacío: "Aún no tienes conversaciones activas"

---

### T-03.14 — Directorio de Especialistas y Psicólogos

**Apetito:** 1 semana
**Documentos de referencia:** [Especialistas-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Directorios/Especialistas-refinado.md), [Psicologos-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Directorios/Psicologos-refinado.md)

**Entregable:**
- Directorios filtrables de especialistas y psicólogos con toggle de seguimiento

**Tareas:**
- [ ] Crear `DirectorioController` con acciones `Especialistas` y `Psicologos`
- [ ] Tira de estadísticas: Total profesionales, Verificados, Que sigues
- [ ] Barra de búsqueda y filtros: nombre, ciudad, especialidad, ordenar por (Relevancia / A-Z / Mayor calificación / Más seguidores)
- [ ] Tarjetas de profesional (datos desde `vw_DirectorioProfesionales`): avatar, nombre, especialidad principal, tags de especialidades secundarias, calificación ★ (promedio), número de seguidores, tarifa por hora, ciudad, badge "Verificado" (COLPSIC)
- [ ] Botón **[Ver perfil]** → T-03.5 (PerfilOrador)
- [ ] Botón **[+ Seguir]** / **[✓ Siguiendo]** con toggle que llama a `sp_ToggleSeguidor`; animación de cambio de estado inmediata
- [ ] Paginación 10 registros por página con total visible ("Mostrando X de Y profesionales")
- [ ] Para `Psicologos`: mismo componente con filtro predeterminado en especialidad Psicología y badge COLPSIC destacado

---

### T-03.15 — Mis Mentores

**Apetito:** 3–5 días
**Documento de referencia:** [MisMentores-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Directorios/MisMentores-refinado.md)

**Entregable:**
- Lista de profesionales seguidos por el usuario con opción de dejar de seguir

**Tareas:**
- [ ] Crear acción `MisMentores` en `DirectorioController`
- [ ] Estadísticas dinámicas: total seguidos, especialistas, psicólogos (recalcular al deseguir)
- [ ] Filtros: búsqueda por nombre/alias, tipo (Especialista / Psicólogo), ordenar (Reciente / A-Z / Popular)
- [ ] Tarjetas de mentor: mismos datos que directorio (avatar, especialidad, calificación, seguidores, tarifa)
- [ ] Botón **[✓ Siguiendo]** → al hacer clic mostrar modal: "¿Dejar de seguir a [alias]? Ya no aparecerá en tu lista de mentores." → Confirmar → llamar `sp_ToggleSeguidor` → eliminar tarjeta con animación
- [ ] Estado vacío: "Aún no sigues a ningún profesional. Explora el directorio." + botón → T-03.14

---

## Fase 4 — Herramientas del Profesional

> **Objetivo:** El profesional autenticado puede gestionar su perfil, salas, eventos, citas y su historial clínico.

---

### T-04.1 — Home del Profesional

**Apetito:** 1 semana
**Documento de referencia:** [HomeProfesional-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Home/HomeProfesional-refinado.md)

**Entregable:**
- Dashboard profesional con métricas, próxima cita y solicitudes pendientes

**Tareas:**
- [ ] Crear `HomeProfesionalController` con acción `Index`
- [ ] Tira de 4 KPIs: Citas hoy, Salas activas, Mensajes sin leer, Ingresos del mes
- [ ] Tarjeta de próxima cita con datos del paciente (alias), tipo, fecha/hora y botón "Unirse"
- [ ] Sección de solicitudes pendientes de cita (con accept/reject rápido)
- [ ] Métricas adicionales desde `vw_ResumenProfesional`: ingresos totales, seguidores, salas, eventos
- [ ] Saldo a favor (próximo pago) desde tabla `PagoCita` en estado pendiente de desembolso

---

### T-04.2 — Perfil del Profesional (Propio)

**Apetito:** 1–2 semanas
**Documento de referencia:** [PerfilProfesional-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/PerfilProfesional/PerfilProfesional-refinado.md)

**Entregable:**
- Vista de perfil propio con **5 tabs** editables y restricción de sesión única

**Tareas:**
- [ ] Crear `PerfilProfesionalController` con acción `Index`
- [ ] Tab 1 — Información personal: formulario editable (excepto nombre, correo, documento, tarjeta COLPSIC)
  - Campos editables: celular, foto, país, ciudad, especialidades, idiomas, ocupación, género, "Sobre mí", "Cómo trabajo", años de experiencia, valor por hora
- [ ] Tab 2 — Salas: salas y eventos propios con inscritos y detalle (src: perfil-pro-salas.html)
- [ ] Tab 3 — Calendario: disponibilidad con horarios bloqueados y ocupados (src: perfil-pro-calendario.html)
- [ ] Tab 4 — Citas: próximas citas privadas y eventos agendados (src: perfil-pro-citas.html)
- [ ] Tab 5 — Indicadores: KPI dashboard del profesional (src: perfil-pro-kpi.html) → ver T-04.13
- [ ] Validar sesión única activa del profesional (un dispositivo a la vez)

---

### T-04.3 — Mis Eventos (Profesional)

**Apetito:** 1 semana
**Documento de referencia:** [MisEventos-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/MisEventos/MisEventos-refinado.md)

**Entregable:**
- Lista de salas propias del profesional con estado e inscritos

**Tareas:**
- [ ] Crear `MisEventosController` con acción `Index`
- [ ] Listado de salas creadas: nombre, estado, inscritos, cupo máximo
- [ ] Acción habilitar / deshabilitar sala
- [ ] Acceso al detalle de cada sala y sus eventos
- [ ] Paginación de 10 registros

---

### T-04.4 — Citas del Profesional (Lista)

**Apetito:** 1–2 semanas
**Documento de referencia:** [CitasProfesional-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Citas/CitasProfesional-refinado.md)

**Entregable:**
- Vista de **lista de citas** del profesional con estadísticas, tabs, acciones y modal de nueva cita

**Tareas:**
- [ ] Crear `CitasController` (Profesional) con acción `Index`
- [ ] Tira de estadísticas superior: total citas, citas hoy, pacientes activos, próxima cita
- [ ] Tabs de filtro: **Próximas** | **Historial** (activo por defecto: Próximas)
- [ ] Tabla de citas con columnas: Paciente (alias), Tipo, Fecha, Hora, Duración, Estado, Acciones
- [ ] Botón **Iniciar sesión** (citas próximas confirmadas) → navega a sala-profesional (T-04.9)
- [ ] Botón **Ver detalle** → modal con resumen completo (paciente en alias, notas clínicas, recomendaciones)
- [ ] Botón **Cancelar** → modal de confirmación
- [ ] Botón principal **+ Nueva cita** → modal de agendar cita (seleccionar paciente, tipo, fecha/hora)
- [ ] Paginación 10 registros por página
- [ ] Paciente siempre mostrado con alias (nunca nombre real)

---

### T-04.5 — Historial Clínico

**Apetito:** 1 semana

**Entregable:**
- El profesional puede ver y registrar el historial clínico de cada paciente

**Tareas:**
- [ ] Crear `HistorialClinicoController`
- [ ] Vista de historial por paciente: citas anteriores, notas, medicamentos, seguimiento
- [ ] Formulario de registro por sesión
- [ ] Control de privacidad: solo visible para el profesional

---

### T-04.6 — Gestión de Salas y Eventos

**Apetito:** 1–2 semanas

**Entregable:**
- El profesional puede crear salas, configurar eventos y gestionar cupos e inscritos

**Tareas:**
- [ ] Crear `SalasController` con CRUD de salas
- [ ] Formulario de sala: nombre, descripción, categoría, tipo, cupo máximo, precio, chat habilitado
- [ ] Crear eventos dentro de una sala (fechas, nombre, descripción)
- [ ] Ver lista de inscritos por evento
- [ ] Habilitar / deshabilitar sala y eventos

---

### T-04.7 — Calendario de Disponibilidad

**Apetito:** 1 semana

**Entregable:**
- El profesional puede gestionar su disponibilidad y los usuarios pueden ver los espacios disponibles

**Tareas:**
- [ ] Crear `CalendarioController`
- [ ] Vista del calendario con horarios disponibles del profesional
- [ ] Acción para bloquear horas (`HorarioBloqueado`)
- [ ] Acción para configurar horarios recurrentes (`HorarioDisponible`)
- [ ] Vista del calendario para el usuario (solo lectura, espacios disponibles para agendar)

---

### T-04.8 — Agendamiento de Citas (desde el Usuario)

**Apetito:** 1 semana

**Entregable:**
- Usuario puede seleccionar horario disponible del profesional y agendar una cita con pago

**Tareas:**
- [ ] Acción `Agendar(int profesionalId)` en `CitasController`
- [ ] Mostrar calendario del profesional con espacios disponibles
- [ ] Seleccionar tipo de cita: Seguimiento o Asesoría (puntual / anónima)
- [ ] Confirmar y pagar (integración con pasarela)
- [ ] Llamar a `sp_AgendarCita` (valida conflictos de horario y bloqueos)
- [ ] Notificación al profesional de la nueva cita

---

### T-04.9 — Sala Privada del Profesional

**Apetito:** 1–2 semanas
**Documento de referencia:** [SalaProfesional-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Salas/SalaProfesional-refinado.md)

**Entregable:**
- Sala de videollamada para citas privadas desde la perspectiva del profesional

**Tareas:**
- [ ] Crear `SalaProfesionalController` con acción `Iniciar(int citaId)`
- [ ] Mismo layout de video que T-03.9 (área principal + pip + controles)
- [ ] Panel lateral con tres tabs: **Chat** | **Notas clínicas** | **Historial del paciente**
- [ ] Tab Notas clínicas: textarea privada (no visible para el paciente), guardado automático cada 30 segundos en `HistorialClinico`, indicador de guardado
- [ ] Tab Historial del paciente: citas anteriores (alias, fecha, duración, notas), solo visible para citas de tipo Seguimiento
- [ ] Paciente siempre mostrado con alias (nunca nombre real)
- [ ] Botón **"Terminar sesión"** (color danger) → modal: "¿Finalizar la consulta? Las notas se guardarán automáticamente." → Confirmar → guardar notas → redirigir a `citas-profesional` (T-04.4)
- [ ] Controles de micrófono, cámara, compartir pantalla, colgar (igual que sala usuario)
- [ ] Proteger acceso: solo el profesional dueño de la cita puede entrar

---

### T-04.10 — Sala de Conferencia del Profesional (Moderador)

**Apetito:** 1–2 semanas
**Documento de referencia:** [SalaConferenciaProfesional-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Salas/SalaConferenciaProfesional-refinado.md)

**Entregable:**
- Sala de conferencia desde la perspectiva del orador/moderador con controles de moderación

**Tareas:**
- [ ] Crear acción `ModeradorUnirse(int eventoId)` en `SalaConferenciaController`
- [ ] Mismo layout base que T-03.10 (video principal + panel lateral Chat|Participantes)
- [ ] Panel lateral con tab adicional: **Moderación**
- [ ] Tab Moderación: lista de manos levantadas (alias + botón Aprobar / Denegar), lista completa de participantes con botón silenciar individualmente
- [ ] Controles adicionales del moderador: compartir pantalla, compartir diapositivas, silenciar todos
- [ ] Botón **"Finalizar sala"** (danger, borde rojo) → modal: "Todos los asistentes serán desconectados. ¿Deseas finalizar la sala?" → Confirmar → emitir evento SignalR de cierre (T-05.5) → redirigir a `mis-eventos` (T-04.3)
- [ ] Badge "🔴 En vivo" pulsante igual que vista asistente
- [ ] Contador de participantes en tiempo real vía SignalR

---

### T-04.11 — Mensajería del Profesional

**Apetito:** 1 semana
**Documento de referencia:** [MensajesProfesional-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Mensajeria/MensajesProfesional-refinado.md)

**Entregable:**
- Chat del profesional con sus pacientes; alias obligatorio en todo momento

**Tareas:**
- [ ] Crear acción `IndexProfesional` en `MensajeriaController`
- [ ] Mismo layout de dos paneles que T-03.13
- [ ] Panel izquierdo: pacientes listados siempre con alias, último mensaje, badge no leídos; ordenado por `UltimoMensaje` DESC
- [ ] Panel derecho: alias del paciente en encabezado (**NUNCA** nombre real, en ningún estado de la UI), burbujas de mensajes, input + enviar
- [ ] Al enviar: llamar a `sp_EnviarMensajePrivado` → actualizar UI sin recargar
- [ ] Marcar mensajes como leídos al abrir la conversación; actualizar badge en panel izquierdo
- [ ] El profesional no puede iniciar conversaciones nuevas; solo responder hilos iniciados por usuarios
- [ ] Estado vacío: "No tienes conversaciones activas"

---

### T-04.12 — Mis Colegas

**Apetito:** 1 semana
**Documento de referencia:** [MisColegas-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Directorios/MisColegas-refinado.md)

**Entregable:**
- Gestión de red de colegas del profesional con estados de presencia y privacidad de pacientes

**Tareas:**
- [ ] Crear `MisColegasController` con acción `Index`
- [ ] Estadísticas superiores: Profesionales vinculados, Pacientes compartidos, Derivaciones activas
- [ ] Filtros: búsqueda por nombre/alias, tipo de especialidad, estado (Todos / En línea / En consulta / Desconectado)
- [ ] Tarjetas de colega: avatar, alias, especialidad, indicador de estado con colores (verde=En línea, amarillo=En consulta, gris=Desconectado)
- [ ] Botón **[Ver pacientes]** → modal con nota de privacidad: "Solo se muestran pacientes que han dado consentimiento para derivación" + lista con alias únicamente
- [ ] Botón **[💬 Mensaje]** → abre conversación en T-04.11
- [ ] Botón **[Ver perfil]** → T-03.5 (PerfilOrador)
- [ ] Botón **[Desvincular]** → modal de confirmación → actualizar `ColaboracionProfesional` a estado Inactivo → eliminar tarjeta con animación
- [ ] CRUD sobre tabla `ColaboracionProfesional`: enviar solicitud, aceptar, rechazar, desvincular

---

### T-04.13 — Indicadores KPI del Profesional

**Apetito:** 3–5 días
**Documento de referencia:** [PerfilProfesional-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/PerfilProfesional/PerfilProfesional-refinado.md) — Tab 5 (perfil-pro-kpi.html)

**Entregable:**
- Dashboard de indicadores de desempeño con gráfico de barras y tabla de detalle

**Tareas:**
- [ ] Implementar acción `Indicadores` en `PerfilProfesionalController` (también accesible como Tab 5 del perfil)
- [ ] Selector de período: **[Todo]** | **[Este año]** | **[Este mes]** (recalcula todos los KPIs al cambiar)
- [ ] 6 tarjetas KPI: Consultas totales, Clientes únicos, Ingresos generados, **Saldo por pagar** (destacado con color diferente), Salas creadas, Eventos realizados
- [ ] Caja de saldo pendiente resaltada: banco, IBAN/cuenta, fecha estimada de pago
- [ ] Gráfico de barras CSS-puro (sin librería externa): 6 meses recientes, barra por mes, valor visible encima de cada barra
- [ ] Tabla de detalle: listado de citas/eventos del período con fecha, tipo, ingreso, estado de pago
- [ ] Todos los datos desde `vw_ResumenProfesional` + consultas a `PagoCita` filtradas por período

---

## Fase 5 — Sistema Interno y Administración

> **Objetivo:** El administrador puede validar profesionales, moderar contenido y consultar métricas del sistema.

---

### T-05.1 — Panel de Administración — Verificación Profesional y Bandeja de Notificaciones

**Apetito:** 1 semana
**Documento de referencia:** [BandejaNotificaciones-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/BandejaNotificaciones/BandejaNotificaciones-refinado.md)

**Entregable:**
- El administrador puede ver solicitudes pendientes, aprobar o rechazar profesionales, y gestionar todas las notificaciones del sistema

**Tareas:**
- [ ] Crear `AdminController` con secciones de verificación y bandeja
- [ ] Tabs de filtro en bandeja: **Todas** | **Pendientes** | **Aprobadas** | **Rechazadas** | **Sistema** (usa tabla `Notificacion` con filtro por `Tipo`)
- [ ] Lista de notificaciones con punto de estado de color (naranja=Pendiente, verde=Aprobada, rojo=Rechazada, gris=Sistema), título, mensaje truncado, timestamp, indicador leída/no leída
- [ ] Botón **"Marcar todas leídas"** → UPDATE masivo en `Notificacion` para el administrador
- [ ] Clic en notificación de tipo `SolicitudProfesional` → panel de detalle con documentos adjuntos (cédula, tarjeta profesional en PDF)
- [ ] Botón **Aprobar** → llama a `sp_AprobarProfesional(@Aprobado = 1)` → genera token de activación → notifica al profesional por correo
- [ ] Botón **Rechazar** → textarea de motivo (campo requerido, mínimo 20 caracteres) → `sp_AprobarProfesional(@Aprobado = 0, @MotivoRechazo)` → notifica al profesional por correo
- [ ] Paginación 10 registros por página con total visible

---

### T-05.2 — Panel de Administración — Moderación y Gestión

**Apetito:** 1–2 semanas

**Entregable:**
- El administrador puede gestionar usuarios, salas, comentarios y pagos

**Tareas:**
- [ ] Gestión de usuarios: listar, bloquear/desbloquear
- [ ] Gestión de salas: ver, habilitar/deshabilitar
- [ ] Moderación de comentarios públicos
- [ ] Control de pagos y reembolsos pendientes
- [ ] Configuración del sistema (tabla `Configuracion`)

---

### T-05.3 — Notificaciones y Correos Automáticos

**Apetito:** 1 semana

**Entregable:**
- Servicio de correo configurado con todas las plantillas del sistema

**Tareas:**
- [ ] Configurar servicio de correo (SMTP o proveedor externo)
- [ ] Plantilla: correo de validación de cuenta (Usuario)
- [ ] Plantilla: correo de aprobación de cuenta (Profesional)
- [ ] Plantilla: correo de rechazo con motivo (Profesional)
- [ ] Plantilla: correo de recuperación de contraseña
- [ ] Plantilla: correo de confirmación de inscripción (con código)
- [ ] Plantilla: correo de confirmación de cita agendada
- [ ] Configurar SPF, DKIM y DMARC para evitar spam

---

### T-05.4 — Seguridad: Control de Sesiones y Rate Limiting

**Apetito:** 1 semana
**Documento de referencia:** [RequisitosGenerales-refinado-v2.md](../../Requerimientos/Refinados/Funciones/RequisitosGenerales-refinado-v2.md) — Sección 7

**Entregable:**
- Sesiones gestionadas correctamente; profesional con sesión única activa; protección básica contra fuerza bruta

**Tareas:**
- [ ] Implementar cierre automático de sesión por inactividad
- [ ] Implementar restricción de sesión única para el Profesional (invalidar sesiones anteriores al iniciar una nueva)
- [ ] Implementar rate limiting por IP en el endpoint de login
- [ ] Implementar limpieza automática de tokens expirados (background job)

---

### T-05.5 — Infraestructura de Video en Tiempo Real (SignalR/WebRTC)

**Apetito:** 1–2 semanas
**Habilita:** T-03.9, T-03.10, T-04.9, T-04.10

**Entregable:**
- Infraestructura compartida de comunicación en tiempo real para las 4 salas de video del sistema

**Tareas:**
- [ ] Instalar paquetes NuGet: `Microsoft.AspNetCore.SignalR` y configurar en `Program.cs`
- [ ] Crear `VideoHub` (SignalR Hub) en `Trebol.Web/Hubs/` con grupos por sala (`JoinRoom`, `LeaveRoom`)
- [ ] Implementar señalización WebRTC: eventos `Offer`, `Answer`, `IceCandidate` entre peers
- [ ] Eventos de sala privada (T-03.9 / T-04.9): `UserJoined`, `UserLeft`, `SessionEnded`
- [ ] Eventos de conferencia (T-03.10 / T-04.10): `AttendeeJoined`, `AttendeeLeft`, `HandRaised`, `HandLowered`, `HandApproved`, `HandDenied`, `ParticipantMuted`, `AllMuted`, `RoomClosed`
- [ ] Gestión de estado de conexión: reconexia automática, indicador de estado en UI (Conectado / Reconectando / Desconectado)
- [ ] Listas de participantes en tiempo real: actualización instantánea al entrar/salir
- [ ] Autorizar acceso al Hub mediante cookie de sesión (solo usuarios/profesionales autenticados con cita/inscripción válida)
- [ ] Prueba de integración: dos navegadores en sala privada → verificar establecimiento de conexión peer-to-peer
- [ ] Prueba de integración: moderador finaliza sala → verificar que todos los asistentes reciben evento `RoomClosed`

---

## Resumen de Tareas

| # | Tarea | Fase | Apetito | Estado |
|---|---|---|---|---|
| T-00.1 | BD — Catálogos base | 0 | 1 día | `[ ]` |
| T-00.2 | BD — Usuarios, Administrador y autenticación | 0 | 1 día | `[ ]` |
| T-00.3 | BD — Disponibilidad y cuentas bancarias | 0 | 0.5 día | `[ ]` |
| T-00.4 | BD — Salas, eventos, mensajería, social | 0 | 1.5 días | `[ ]` |
| T-00.5 | BD — Citas, PagoCita e historial clínico | 0 | 0.5 día | `[ ]` |
| T-00.6 | BD — Índices y vistas (+ directorio y calificaciones) | 0 | 1 día | `[ ]` |
| T-00.7 | BD — Stored Procedures (+ mensajería + directorio) | 0 | 1.5 días | `[ ]` |
| T-01.1 | Arquitectura — Solución y proyectos | 1 | 0.5 día | `[ ]` |
| T-01.2 | Arquitectura — EF Core y AppDbContext | 1 | 0.5 día | `[ ]` |
| T-01.3 | Arquitectura — PasswordHelper (Argon2) | 1 | 0.5 día | `[ ]` |
| T-01.4 | Arquitectura — Repositorios base | 1 | 0.5 día | `[ ]` |
| T-01.5 | Arquitectura — Constantes, AutoMapper, filtros | 1 | 0.5 día | `[ ]` |
| T-02.1 | Landing Page | 2 | 1–2 semanas | `[ ]` |
| T-02.2 | Selección de Perfil | 2 | 1–2 días | `[ ]` |
| T-02.3 | Registro Usuario | 2 | 1 semana | `[ ]` |
| T-02.4 | Registro Profesional | 2 | 1–2 semanas | `[ ]` |
| T-02.5 | Login | 2 | 3–5 días | `[ ]` |
| T-02.6 | Restablecer Contraseña | 2 | 3–5 días | `[ ]` |
| T-03.1 | Menú Lateral (Sidebar) | 3 | 3–5 días | `[ ]` |
| T-03.2 | Home del Usuario | 3 | 1–2 semanas | `[ ]` |
| T-03.3 | Detalle de Sala (Modal) | 3 | 3–5 días | `[ ]` |
| T-03.4 | Inscripción y Pago | 3 | 2–3 semanas | `[ ]` |
| T-03.5 | Perfil del Orador — 4 tabs (Cuenta/Salas/Comentarios/Calendario) | 3 | 1–2 semanas | `[ ]` |
| T-03.6 | Perfil del Usuario | 3 | 1 semana | `[ ]` |
| T-03.7 | Citas del Usuario (Lista — Próximas/Historial) | 3 | 1–2 semanas | `[ ]` |
| T-03.8 | Mis Eventos (Usuario) | 3 | 3–5 días | `[ ]` |
| T-03.9 | Sala Privada del Usuario | 3 | 1–2 semanas | `[ ]` |
| T-03.10 | Sala de Conferencia del Usuario (Asistente) | 3 | 1–2 semanas | `[ ]` |
| T-03.11 | Pago de Cita | 3 | 3–5 días | `[ ]` |
| T-03.12 | Calendario del Usuario | 3 | 3–5 días | `[ ]` |
| T-03.13 | Mensajería del Usuario | 3 | 1 semana | `[ ]` |
| T-03.14 | Directorio de Especialistas y Psicólogos | 3 | 1 semana | `[ ]` |
| T-03.15 | Mis Mentores | 3 | 3–5 días | `[ ]` |
| T-04.1 | Home del Profesional | 4 | 1 semana | `[ ]` |
| T-04.2 | Perfil del Profesional — 5 tabs (Info/Salas/Calendario/Citas/Indicadores) | 4 | 1–2 semanas | `[ ]` |
| T-04.3 | Mis Eventos (Profesional) | 4 | 1 semana | `[ ]` |
| T-04.4 | Citas del Profesional (Lista — Próximas/Historial) | 4 | 1–2 semanas | `[ ]` |
| T-04.5 | Historial Clínico | 4 | 1 semana | `[ ]` |
| T-04.6 | Gestión de Salas y Eventos | 4 | 1–2 semanas | `[ ]` |
| T-04.7 | Calendario de Disponibilidad | 4 | 1 semana | `[ ]` |
| T-04.8 | Agendamiento de Citas (Usuario) | 4 | 1 semana | `[ ]` |
| T-04.9 | Sala Privada del Profesional | 4 | 1–2 semanas | `[ ]` |
| T-04.10 | Sala de Conferencia del Profesional (Moderador) | 4 | 1–2 semanas | `[ ]` |
| T-04.11 | Mensajería del Profesional | 4 | 1 semana | `[ ]` |
| T-04.12 | Mis Colegas | 4 | 1 semana | `[ ]` |
| T-04.13 | Indicadores KPI del Profesional | 4 | 3–5 días | `[ ]` |
| T-05.1 | Admin — Verificación Profesional y Bandeja Notificaciones | 5 | 1 semana | `[ ]` |
| T-05.2 | Admin — Moderación y Gestión | 5 | 1–2 semanas | `[ ]` |
| T-05.3 | Notificaciones y Correos Automáticos | 5 | 1 semana | `[ ]` |
| T-05.4 | Seguridad — Sesiones y Rate Limiting | 5 | 1 semana | `[ ]` |
| T-05.5 | Infraestructura de Video en Tiempo Real (SignalR/WebRTC) | 5 | 1–2 semanas | `[ ]` |

---

*Plan de Ejecución v2.0 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

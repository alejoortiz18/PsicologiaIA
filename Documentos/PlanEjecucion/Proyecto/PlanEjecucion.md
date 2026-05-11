# Plan de Ejecución — Proyecto Trébol

> **Versión:** 1.0 | **Fecha:** Mayo 2026
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
**Documento de referencia:** [BaseDatos-refinado.md](../../Requerimientos/Refinados/BaseDatos/BaseDatos-refinado.md) — Sección 3

**Entregable:**
- Tablas de usuarios y tokens creadas con constraints y claves únicas

**Tareas:**
- [ ] Crear tabla `Usuario` (con campo `PasswordHash` — hash Argon2, nunca texto plano)
- [ ] Crear tabla `Profesional` (con campo `PasswordHash` — hash Argon2, nunca texto plano)
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

### T-00.4 — Crear tablas de Salas, Eventos e Interacción Social

**Apetito:** 1 día
**Documento de referencia:** [BaseDatos-refinado.md](../../Requerimientos/Refinados/BaseDatos/BaseDatos-refinado.md) — Secciones 5, 7 y 8

**Entregable:**
- Tablas de salas, eventos, inscripciones, pagos e interacción social creadas

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

---

### T-00.5 — Crear tablas de Citas e Historial Clínico

**Apetito:** 0.5 día
**Documento de referencia:** [BaseDatos-refinado.md](../../Requerimientos/Refinados/BaseDatos/BaseDatos-refinado.md) — Sección 6

**Entregable:**
- Tablas del módulo de citas privadas creadas

**Tareas:**
- [ ] Crear tabla `Cita`
- [ ] Crear tabla `Recomendacion`
- [ ] Crear tabla `ComentarioPrivado`
- [ ] Crear tabla `HistorialClinico`

---

### T-00.6 — Crear índices y vistas

**Apetito:** 0.5 día
**Documento de referencia:** [BaseDatos-refinado.md](../../Requerimientos/Refinados/BaseDatos/BaseDatos-refinado.md) — Secciones 11 y 12

**Entregable:**
- Todos los índices creados; vistas funcionales y verificadas

**Tareas:**
- [ ] Crear índices sobre columnas de búsqueda y filtro (correo, estado, FK, fechas)
- [ ] Crear vista `vw_SalasActivas`
- [ ] Crear vista `vw_TopEventosInscritos`
- [ ] Crear vista `vw_ProximasCitasUsuario`
- [ ] Crear vista `vw_ProximasCitasProfesional`
- [ ] Crear vista `vw_ResumenProfesional`
- [ ] Verificar resultados de cada vista con datos de prueba manuales

---

### T-00.7 — Crear Stored Procedures

**Apetito:** 1 día
**Documento de referencia:** [BaseDatos-refinado.md](../../Requerimientos/Refinados/BaseDatos/BaseDatos-refinado.md) — Sección 13

> **Nota:** Los SPs reciben el hash ya generado. La encriptación Argon2 ocurre en la Capa Helpers, nunca dentro del SP.

**Entregable:**
- Todos los Stored Procedures creados, probados con datos de prueba

**Tareas:**
- [ ] Crear `sp_RegistrarUsuario`
- [ ] Crear `sp_ActivarUsuario` (recibe `@PasswordHash` generado con Argon2 en Helpers)
- [ ] Crear `sp_RegistrarProfesional`
- [ ] Crear `sp_AprobarProfesional`
- [ ] Crear `sp_ValidarLogin` (compara hash Argon2; nunca texto plano)
- [ ] Crear `sp_GenerarTokenRecuperacion`
- [ ] Crear `sp_RestablecerPassword` (recibe `@PasswordHash` generado con Argon2 en Helpers)
- [ ] Crear `sp_ObtenerSalasActivas`
- [ ] Crear `sp_InscribirUsuarioEvento`
- [ ] Crear `sp_ConfirmarPago`
- [ ] Crear `sp_AgendarCita`
- [ ] Crear `sp_ToggleSeguidor`
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
- Vista pública del perfil del profesional con 3 tabs funcionales

**Tareas:**
- [ ] Crear `PerfilOradorController` con acción `Detalle(int profesionalId)`
- [ ] Tab 1: información del profesional (nombre, foto, especialidades, idiomas, seguidores, "Sobre mí", "Cómo trabajo")
- [ ] Tab 2: salas creadas por el profesional con historial de mensajes
- [ ] Tab 3: comentarios públicos al profesional con lógica de visibilidad por rol
- [ ] Botón seguir / dejar de seguir (llama a `sp_ToggleSeguidor`)
- [ ] Lógica de visibilidad de comentarios (usuarios ven todos; profesional puede responder los suyos)

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

### T-03.7 — Citas del Usuario

**Apetito:** 1–2 semanas
**Documento de referencia:** [CitasUsuario-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Citas/CitasUsuario-refinado.md)

**Entregable:**
- Vista de cita activa para el usuario con controles de sesión y recomendaciones

**Tareas:**
- [ ] Crear `CitasController` (Usuario) con vista de cita activa
- [ ] Pantalla principal: cámara del profesional + vista propia (ventana pequeña)
- [ ] Controles: cámara, audio, enviar mensaje
- [ ] Historial de la cita: fecha, hora, estado, duración
- [ ] Recomendaciones del profesional visibles durante la sesión
- [ ] Campo de comentario privado del usuario (solo visible para sí mismo)
- [ ] Opción de anonimato: mostrar nombre real o alias

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

## Fase 4 — Herramientas del Profesional

> **Objetivo:** El profesional autenticado puede gestionar su perfil, salas, eventos, citas y su historial clínico.

---

### T-04.1 — Home del Profesional

**Apetito:** 1 semana

**Entregable:**
- Dashboard profesional con métricas y accesos rápidos

**Tareas:**
- [ ] Crear `HomeProfesionalController` con acción `Index`
- [ ] Métricas desde `vw_ResumenProfesional`: ingresos, seguidores, salas, eventos, me gusta
- [ ] Saldo a favor (próximo pago)
- [ ] Próximas citas desde `vw_ProximasCitasProfesional`

---

### T-04.2 — Perfil del Profesional (Propio)

**Apetito:** 1–2 semanas
**Documento de referencia:** [PerfilProfesional-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/PerfilProfesional/PerfilProfesional-refinado.md)

**Entregable:**
- Vista de perfil propio con 4 tabs editables y restricción de sesión única

**Tareas:**
- [ ] Crear `PerfilProfesionalController` con acción `Index`
- [ ] Tab 1: formulario de información personal editable (excepto nombre, correo, documento, tarjeta)
  - Campos editables: celular, foto, país, ciudad, especialidades, idiomas, ocupación, género, "Sobre mí", "Cómo trabajo", años de experiencia, valor por hora
- [ ] Tab 2: salas y eventos propios con inscritos y detalle
- [ ] Tab 3: calendario de disponibilidad con horarios bloqueados y ocupados
- [ ] Tab 4: próximas citas privadas y eventos agendados
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

### T-04.4 — Citas del Profesional

**Apetito:** 1–2 semanas
**Documento de referencia:** [CitasProfesional-refinado.md](../../Requerimientos/Refinados/FuncionalidadesPaginas/Citas/CitasProfesional-refinado.md)

**Entregable:**
- Vista de cita activa del profesional con controles, recomendaciones clínicas e historial

**Tareas:**
- [ ] Crear `CitasController` (Profesional) con vista de cita activa
- [ ] Indicador de usuario en línea
- [ ] Controles: cámara, audio
- [ ] Contador de duración de la sesión
- [ ] Registro, edición y visualización de recomendaciones clínicas con fecha y hora automática
- [ ] Acceso al historial clínico del paciente (solo en citas de seguimiento)
- [ ] Botón cerrar sesión (con confirmación en modal)
- [ ] Botón mover cita (con calendario de espacios disponibles)

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

## Fase 5 — Sistema Interno y Administración

> **Objetivo:** El administrador puede validar profesionales, moderar contenido y consultar métricas del sistema.

---

### T-05.1 — Panel de Administración — Verificación Profesional

**Apetito:** 1 semana

**Entregable:**
- El administrador puede ver solicitudes pendientes, aprobar o rechazar profesionales con motivo

**Tareas:**
- [ ] Crear `AdminController` con sección de verificación
- [ ] Listado de profesionales en estado `PENDIENTE_VALIDACION`
- [ ] Vista de detalle con documentos adjuntos
- [ ] Botón Aprobar → llama a `sp_AprobarProfesional(@Aprobado = 1)` → genera token de activación
- [ ] Botón Rechazar → modal para ingresar motivo → `sp_AprobarProfesional(@Aprobado = 0, @MotivoRechazo)`
- [ ] Notificación automática al profesional en ambos casos

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

### T-05.5 — Mensajería entre Profesionales

**Apetito:** 1 semana

**Entregable:**
- Los profesionales pueden enviarse mensajes directos entre sí

**Tareas:**
- [ ] Crear sistema de mensajería básico entre profesionales
- [ ] Listado de conversaciones
- [ ] Vista de conversación con historial de mensajes
- [ ] Límite de mensajes iniciales del usuario al profesional (2 mensajes antes de respuesta)

---

## Resumen de Tareas

| # | Tarea | Fase | Apetito | Estado |
|---|---|---|---|---|
| T-00.1 | BD — Catálogos base | 0 | 1 día | `[ ]` |
| T-00.2 | BD — Usuarios y autenticación | 0 | 1 día | `[ ]` |
| T-00.3 | BD — Disponibilidad y cuentas bancarias | 0 | 0.5 día | `[ ]` |
| T-00.4 | BD — Salas, eventos, inscripciones, social | 0 | 1 día | `[ ]` |
| T-00.5 | BD — Citas e historial clínico | 0 | 0.5 día | `[ ]` |
| T-00.6 | BD — Índices y vistas | 0 | 0.5 día | `[ ]` |
| T-00.7 | BD — Stored Procedures | 0 | 1 día | `[ ]` |
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
| T-03.5 | Perfil del Orador (Público) | 3 | 1–2 semanas | `[ ]` |
| T-03.6 | Perfil del Usuario | 3 | 1 semana | `[ ]` |
| T-03.7 | Citas del Usuario | 3 | 1–2 semanas | `[ ]` |
| T-03.8 | Mis Eventos (Usuario) | 3 | 3–5 días | `[ ]` |
| T-04.1 | Home del Profesional | 4 | 1 semana | `[ ]` |
| T-04.2 | Perfil del Profesional (Propio) | 4 | 1–2 semanas | `[ ]` |
| T-04.3 | Mis Eventos (Profesional) | 4 | 1 semana | `[ ]` |
| T-04.4 | Citas del Profesional | 4 | 1–2 semanas | `[ ]` |
| T-04.5 | Historial Clínico | 4 | 1 semana | `[ ]` |
| T-04.6 | Gestión de Salas y Eventos | 4 | 1–2 semanas | `[ ]` |
| T-04.7 | Calendario de Disponibilidad | 4 | 1 semana | `[ ]` |
| T-04.8 | Agendamiento de Citas (Usuario) | 4 | 1 semana | `[ ]` |
| T-05.1 | Admin — Verificación Profesional | 5 | 1 semana | `[ ]` |
| T-05.2 | Admin — Moderación y Gestión | 5 | 1–2 semanas | `[ ]` |
| T-05.3 | Notificaciones y Correos | 5 | 1 semana | `[ ]` |
| T-05.4 | Seguridad — Sesiones y Rate Limiting | 5 | 1 semana | `[ ]` |
| T-05.5 | Mensajería entre Profesionales | 5 | 1 semana | `[ ]` |

---

*Plan de Ejecución v1.0 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

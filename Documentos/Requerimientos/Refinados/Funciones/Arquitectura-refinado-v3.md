# Arquitectura Técnica — Proyecto Trébol

> **Versión:** 3.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Stack:** ASP.NET Core MVC (.NET 10) · Entity Framework Core · SQL Server (`TrebolDB`)
> **Patrón:** Arquitectura en capas · Sin APIs REST · Cookie Authentication (3 roles)
> **Metodología:** Shape Up — ciclos de construcción por funcionalidad
> **Fecha:** Mayo 2026

---

## 1. Estructura de la Solución

```
Trebol.sln
├── Trebol.Web/                                    ← Presentación (MVC, Views, ViewModels)
│   ├── Controllers/
│   │   ├── LandingController.cs                   → Index (landing pública)
│   │   ├── LoginController.cs                     → Login, Logout (3 roles: Usuario/Profesional/Admin)
│   │   ├── RegistroController.cs                  → SeleccionPerfil, RegistroUsuario, RegistroProfesional, ActivarCuenta, ActivarCuentaProfesional
│   │   ├── RecuperacionController.cs              → SolicitarRecuperacion, RestablecerPassword
│   │   ├── HomeUsuarioController.cs               → Index (dashboard usuario)
│   │   ├── HomeProfesionalController.cs           → Index (dashboard profesional)
│   │   ├── CalendarioController.cs                → Index (calendario usuario), Disponibilidad (pro), BloqueHorario CRUD
│   │   ├── CitasController.cs                     → Index (lista usuario), ListaProfesional, NuevaCita, Cancelar, Detalle
│   │   ├── SalasController.cs                     → SalaPrivadaUsuario, SalaPrivadaProfesional, SalaConferenciaUsuario, SalaConferenciaProfesional
│   │   ├── PagoCitaController.cs                  → Index, ConfirmarPago
│   │   ├── InscripcionController.cs               → Paso1, Paso2, Paso3, ConfirmarPago
│   │   ├── MensajeriaController.cs                → IndexUsuario, IndexProfesional, EnviarMensaje, ObtenerMensajes
│   │   ├── PerfilOradorController.cs              → Cuenta, Salas, Comentarios, Calendario, Agendar, ToggleSeguir, AgregarComentario
│   │   ├── PerfilUsuarioController.cs             → Index, Actualizar, SubirFoto
│   │   ├── PerfilProfesionalController.cs         → Info, Salas, Calendario, Citas, Indicadores, Actualizar, SubirFoto
│   │   ├── MisEventosController.cs                → Index, Crear, Editar, Duplicar, Eliminar, CopiarLink, Gestionar
│   │   ├── DirectorioController.cs                → Especialistas, Psicologos, MisMentores, MisColegas, ToggleSeguir, ToggleColega
│   │   └── AdminController.cs                     → BandejaNotificaciones, Aprobar, Rechazar, MarcarLeidas
│   │
│   ├── Views/
│   │   ├── Shared/
│   │   │   ├── _Layout.cshtml                     → Layout público (sin sidebar)
│   │   │   ├── _LayoutInterno.cshtml              → Layout autenticado (con sidebar)
│   │   │   ├── _LayoutAdmin.cshtml                → Layout admin (bandeja)
│   │   │   ├── _SidebarUsuario.cshtml             → Sidebar usuario
│   │   │   ├── _SidebarProfesional.cshtml         → Sidebar profesional
│   │   │   ├── _Modal.cshtml                      → Modal reutilizable
│   │   │   └── _ValidationScripts.cshtml
│   │   ├── Landing/
│   │   │   └── Index.cshtml                       → Ticker, hero, especialidades, top-3 eventos, CTA
│   │   ├── Login/
│   │   │   └── Index.cshtml                       → Split 50/50, 3 cuentas demo, toggle contraseña
│   │   ├── Registro/
│   │   │   ├── SeleccionPerfil.cshtml             → Cards Usuario/Profesional + T&C
│   │   │   ├── RegistroUsuario.cshtml             → Formulario (sin contraseña)
│   │   │   ├── RegistroProfesional.cshtml         → Formulario + PDF upload
│   │   │   ├── ActivarCuenta.cshtml               → Nueva contraseña (token usuario)
│   │   │   └── ActivarCuentaProfesional.cshtml    → Nueva contraseña (token profesional)
│   │   ├── Recuperacion/
│   │   │   ├── SolicitarRecuperacion.cshtml
│   │   │   └── RestablecerPassword.cshtml
│   │   ├── HomeUsuario/
│   │   │   └── Index.cshtml                       → 4 KPIs, próxima cita, eventos recomendados, profesionales sugeridos
│   │   ├── HomeProfesional/
│   │   │   └── Index.cshtml                       → 4 KPIs, próxima cita, salas activas, solicitudes pendientes
│   │   ├── Calendario/
│   │   │   ├── Index.cshtml                       → Calendario usuario (Semana/Mes/Día, color-coded)
│   │   │   └── Disponibilidad.cshtml              → Editor disponibilidad profesional
│   │   ├── Citas/
│   │   │   ├── Index.cshtml                       → Lista usuario (stats strip, tabs Próximas/Historial, tabla)
│   │   │   ├── ListaProfesional.cshtml            → Lista profesional + modal nueva cita
│   │   │   └── NuevaCita.cshtml                   → Modal/formulario nueva cita
│   │   ├── Salas/
│   │   │   ├── SalaPrivadaUsuario.cshtml          → Video room, controles, chat, hang-up
│   │   │   ├── SalaPrivadaProfesional.cshtml      → + notas clínicas privadas, historial
│   │   │   ├── SalaConferenciaUsuario.cshtml      → Presenter video, raise hand, 🔴 En vivo
│   │   │   └── SalaConferenciaProfesional.cshtml  → + panel moderación, Finalizar sala
│   │   ├── PagoCita/
│   │   │   └── Index.cshtml                       → Checkout cita (resumen + $5.000 COP + métodos)
│   │   ├── Inscripcion/
│   │   │   ├── Paso1.cshtml                       → Detalles evento
│   │   │   ├── Paso2.cshtml                       → Datos personales
│   │   │   └── Paso3.cshtml                       → Pago (tarjeta/PSE/Efecty)
│   │   ├── Mensajeria/
│   │   │   ├── IndexUsuario.cshtml                → Split panel: conversaciones + chat
│   │   │   └── IndexProfesional.cshtml            → Split panel: conversaciones + chat (alias-only)
│   │   ├── PerfilOrador/
│   │   │   ├── Cuenta.cshtml                      → Tab 1: bio, idiomas, formación
│   │   │   ├── Salas.cshtml                       → Tab 2: grid salas + modal detalle
│   │   │   ├── Comentarios.cshtml                 → Tab 3: score 4.9/5, distribución, feed, form
│   │   │   └── Calendario.cshtml                  → Tab 4: grilla + modal agendar cita
│   │   ├── PerfilUsuario/
│   │   │   └── Index.cshtml                       → Formulario + tabs: Eventos inscritos / Próximas citas
│   │   ├── PerfilProfesional/
│   │   │   ├── Info.cshtml                        → Tab 1: formulario editable completo
│   │   │   ├── Salas.cshtml                       → Tab 2: gestión salas propias
│   │   │   ├── Calendario.cshtml                  → Tab 3: editor disponibilidad
│   │   │   ├── Citas.cshtml                       → Tab 4: lista citas profesional
│   │   │   └── Indicadores.cshtml                 → Tab 5: 6 KPIs + gráfico barras
│   │   ├── MisEventos/
│   │   │   └── Index.cshtml                       → Stats strip, tabla, modal crear sala
│   │   ├── Directorio/
│   │   │   ├── Especialistas.cshtml               → Grid cards, filtros, follow toggle
│   │   │   ├── Psicologos.cshtml                  → Grid cards + badge COLPSIC
│   │   │   ├── MisMentores.cshtml                 → Lista seguidos, unfollow confirm
│   │   │   └── MisColegas.cshtml                  → Red colegas, estado en línea
│   │   └── Admin/
│   │       └── BandejaNotificaciones.cshtml       → Tabs filtro, lista dots, modal aprobación
│   │
│   ├── ViewModels/
│   │   ├── Landing/
│   │   │   └── LandingViewModel.cs                → ProfesionalDestacado, Especialidades, TopEventos
│   │   ├── Auth/
│   │   │   ├── LoginViewModel.cs                  → Correo, Password
│   │   │   ├── RegistroUsuarioViewModel.cs
│   │   │   ├── RegistroProfesionalViewModel.cs    → + IFormFile CedulaPdf, TarjetaPdf
│   │   │   ├── ActivarCuentaViewModel.cs          → Token, Password, ConfirmPassword
│   │   │   └── SolicitarRecuperacionViewModel.cs
│   │   ├── HomeUsuario/
│   │   │   └── HomeUsuarioViewModel.cs            → 4 KPIs, ProximaCita, EventosRecomendados, Sugeridos
│   │   ├── HomeProfesional/
│   │   │   └── HomeProfesionalViewModel.cs        → 4 KPIs, ProximaCita, SalasActivas, Solicitudes
│   │   ├── Citas/
│   │   │   ├── CitasUsuarioViewModel.cs
│   │   │   ├── CitasProfesionalViewModel.cs
│   │   │   └── NuevaCitaViewModel.cs
│   │   ├── Inscripcion/
│   │   │   ├── Paso1ViewModel.cs
│   │   │   ├── Paso2ViewModel.cs
│   │   │   └── Paso3ViewModel.cs
│   │   ├── PerfilOrador/
│   │   │   ├── PerfilOradorViewModel.cs
│   │   │   ├── OradorSalasViewModel.cs
│   │   │   ├── OradorComentariosViewModel.cs
│   │   │   └── OradorCalendarioViewModel.cs
│   │   ├── PerfilProfesional/
│   │   │   ├── InfoProfesionalViewModel.cs
│   │   │   ├── SalasProfesionalViewModel.cs
│   │   │   ├── CalendarioProfesionalViewModel.cs
│   │   │   ├── CitasProfesionalTabViewModel.cs
│   │   │   └── IndicadoresViewModel.cs            → KPIs, periodo, gráfico
│   │   ├── PerfilUsuario/
│   │   │   └── PerfilUsuarioViewModel.cs
│   │   ├── Directorio/
│   │   │   ├── DirectorioViewModel.cs
│   │   │   └── FiltroDirectorioViewModel.cs
│   │   ├── MisEventos/
│   │   │   └── MisEventosViewModel.cs
│   │   ├── Mensajeria/
│   │   │   ├── MensajeriaViewModel.cs
│   │   │   └── EnviarMensajeViewModel.cs
│   │   └── Admin/
│   │       └── BandejaViewModel.cs
│   │
│   ├── AutoMapper/
│   │   └── TrebolAutoMapperProfile.cs             → Perfil único de AutoMapper (entidades ↔ DTOs ↔ ViewModels)
│   ├── DependencyContainer/
│   │   └── DependencyContainer.cs                 → Centraliza todo el registro de dependencias
│   ├── Filters/
│   │   ├── AutenticacionFilter.cs                 → Valida cookie de sesión activa
│   │   └── RolAuthorizationFilter.cs              → Valida rol (Usuario/Profesional/Admin)
│   └── wwwroot/
│       ├── css/
│       ├── js/
│       ├── uploads/
│       │   └── profesionales/{profesionalId}/     → PDFs cédula + tarjeta
│       └── lib/
│
├── Trebol.Constants/                              ← Mensajes y configuración sin dependencias externas
│   ├── Messages/
│   │   ├── AuthConstant.cs
│   │   ├── RegistroConstant.cs
│   │   ├── CitaConstant.cs
│   │   ├── InscripcionConstant.cs
│   │   ├── PagoConstant.cs
│   │   ├── SalaConstant.cs
│   │   ├── PerfilConstant.cs
│   │   ├── MensajeriaConstant.cs
│   │   └── EmailConstant.cs
│   └── Pagination/
│       └── PaginacionConstant.cs
│
├── Trebol.Domain/                                 ← Contratos de repositorios (interfaces + domain services)
│   └── Interfaces/
│       ├── IUsuarioRepository.cs
│       ├── IProfesionalRepository.cs
│       ├── IAdministradorRepository.cs
│       ├── ISalaRepository.cs
│       ├── IEventoRepository.cs
│       ├── ICitaRepository.cs
│       ├── IInscripcionRepository.cs
│       ├── IPagoRepository.cs
│       ├── IMensajeriaRepository.cs
│       ├── IDirectorioRepository.cs
│       ├── ICalendarioRepository.cs
│       ├── INotificacionRepository.cs
│       └── Catalogos/
│           ├── ICatalogoRepository.cs
│           └── IConfiguracionRepository.cs
│
├── Trebol.Helpers/                                ← Utilidades transversales
│   ├── Security/
│   │   ├── IPasswordHelper.cs
│   │   └── PasswordHelper.cs                      → Argon2 con salt embebido
│   ├── Email/
│   │   ├── IEmailHelper.cs
│   │   └── EmailHelper.cs
│   ├── Archivos/
│   │   ├── IArchivoHelper.cs
│   │   └── ArchivoHelper.cs                       → Validación y guardado PDF (máx 5 MB)
│   ├── Token/
│   │   ├── ITokenHelper.cs
│   │   └── TokenHelper.cs                         → Generación GUID criptográfico para tokens
│   └── AccessDependency/
│       └── HelperAccessDependency.cs
│
├── Trebol.Infrastructure/                         ← Repositorios, EF Core, Migrations
│   ├── Repositories/
│   │   ├── UsuarioRepository.cs
│   │   ├── ProfesionalRepository.cs
│   │   ├── AdministradorRepository.cs
│   │   ├── SalaRepository.cs
│   │   ├── EventoRepository.cs
│   │   ├── CitaRepository.cs
│   │   ├── InscripcionRepository.cs
│   │   ├── PagoRepository.cs
│   │   ├── MensajeriaRepository.cs
│   │   ├── DirectorioRepository.cs
│   │   ├── CalendarioRepository.cs
│   │   ├── NotificacionRepository.cs
│   │   └── Catalogos/
│   │       ├── CatalogoRepository.cs
│   │       └── ConfiguracionRepository.cs
│   ├── Migrations/
│   └── AccessDependency/
│       └── InfrastructureAccessDependency.cs
│
└── Trebol.Model/                                  ← Capa central (DTOs, Entidades, Enums, AppDbContext)
    ├── DTOs/
    │   ├── Auth/
    │   │   ├── UsuarioSesionDto.cs
    │   │   ├── LoginDto.cs
    │   │   └── ActivarCuentaDto.cs
    │   ├── Usuario/
    │   │   ├── UsuarioDto.cs
    │   │   └── ActualizarUsuarioDto.cs
    │   ├── Profesional/
    │   │   ├── ProfesionalDto.cs
    │   │   ├── RegistroProfesionalDto.cs
    │   │   └── ActualizarProfesionalDto.cs
    │   ├── Sala/
    │   │   ├── SalaDto.cs
    │   │   ├── SalaListaDto.cs
    │   │   └── CrearSalaDto.cs
    │   ├── Evento/
    │   │   ├── EventoDto.cs
    │   │   └── CrearEventoDto.cs
    │   ├── Cita/
    │   │   ├── CitaDto.cs
    │   │   ├── CitaListaDto.cs
    │   │   └── CrearCitaDto.cs
    │   ├── Inscripcion/
    │   │   ├── InscripcionDto.cs
    │   │   └── CrearInscripcionDto.cs
    │   ├── Pago/
    │   │   ├── PagoDto.cs
    │   │   └── ConfirmarPagoDto.cs
    │   ├── Mensajeria/
    │   │   ├── ConversacionDto.cs
    │   │   └── MensajePrivadoDto.cs
    │   ├── Directorio/
    │   │   ├── ProfesionalDirectorioDto.cs
    │   │   └── FiltroDirectorioDto.cs
    │   ├── Dashboard/
    │   │   ├── DashboardUsuarioDto.cs
    │   │   └── DashboardProfesionalDto.cs
    │   └── Admin/
    │       └── NotificacionDto.cs
    ├── Entities/
    │   └── TrebolEntities/
    │       ├── AppDbContext.cs
    │       ├── Configurations/
    │       │   ├── UsuarioConfiguration.cs
    │       │   ├── ProfesionalConfiguration.cs
    │       │   ├── AdministradorConfiguration.cs
    │       │   ├── SalaConfiguration.cs
    │       │   ├── EventoConfiguration.cs
    │       │   ├── MensajeEventoConfiguration.cs
    │       │   ├── CitaConfiguration.cs
    │       │   ├── PagoCitaConfiguration.cs
    │       │   ├── InscripcionConfiguration.cs
    │       │   ├── PagoConfiguration.cs
    │       │   ├── LogPagoConfiguration.cs
    │       │   ├── MensajePrivadoConfiguration.cs
    │       │   ├── ConversacionConfiguration.cs
    │       │   ├── ColaboracionProfesionalConfiguration.cs
    │       │   ├── NotificacionConfiguration.cs
    │       │   ├── ComentarioProfesionalConfiguration.cs
    │       │   ├── RespuestaComentarioConfiguration.cs
    │       │   ├── SeguidorConfiguration.cs
    │       │   ├── MeGustaConfiguration.cs
    │       │   ├── RecomendacionConfiguration.cs
    │       │   ├── ComentarioPrivadoConfiguration.cs
    │       │   ├── HistorialClinicoConfiguration.cs
    │       │   ├── HorarioDisponibleConfiguration.cs
    │       │   ├── HorarioBloqueadoConfiguration.cs
    │       │   ├── CuentaBancariaConfiguration.cs
    │       │   ├── ProfesionalEspecialidadConfiguration.cs
    │       │   ├── ProfesionalEstudioConfiguration.cs
    │       │   ├── ProfesionalIdiomaConfiguration.cs
    │       │   ├── TokenValidacionConfiguration.cs
    │       │   ├── TokenActivacionConfiguration.cs
    │       │   ├── TokenRecuperacionConfiguration.cs
    │       │   ├── SesionConfiguration.cs
    │       │   ├── ConfiguracionConfiguration.cs
    │       │   ├── EspecialidadConfiguration.cs
    │       │   ├── CategoriaConfiguration.cs
    │       │   ├── IdiomaConfiguration.cs
    │       │   ├── PaisConfiguration.cs
    │       │   └── CiudadConfiguration.cs
    │       └── (38 clases de entidad, una por tabla)
    ├── Models/
    │   ├── ResultadoOperacion.cs
    │   └── PaginacionModel.cs
    └── Enums/
        ├── RolUsuario.cs
        ├── EstadoUsuario.cs
        ├── EstadoProfesional.cs
        ├── EstadoCita.cs
        ├── TipoCita.cs
        ├── EstadoInscripcion.cs
        ├── EstadoPago.cs
        ├── MetodoPago.cs
        ├── TipoSala.cs
        ├── EstadoSala.cs
        ├── EstadoEvento.cs
        ├── TipoEntidad.cs
        ├── EstadoColaboracion.cs
        ├── TipoNotificacion.cs
        └── EstadoNotificacion.cs
```

---

## 2. Flujo de Dependencias entre Capas

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Trebol.Web (MVC)                              │
│   Controllers · Views · ViewModels · AutoMapper · Filters            │
└────────┬──────────────┬──────────────┬──────────────┬───────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
  Trebol.Domain   Trebol.Model   Trebol.Constants  Trebol.Helpers
  (interfaces)    (DTOs, Enums)  (mensajes)        (password, email)
         │              ▲              ▲              ▲
         │              │              │              │
         ▼              │              │              │
  Trebol.Infrastructure ┘──────────────┘──────────────┘
  (repositories + EF Core + Migrations)
         │
         ▼
     SQL Server (TrebolDB)
```

### Reglas estrictas de dependencias

| Capa | Puede referenciar | NUNCA puede referenciar |
|---|---|---|
| `Trebol.Constants` | _(ninguna)_ | Cualquier otra capa |
| `Trebol.Model` | `Trebol.Constants` | `Trebol.Web`, `Trebol.Infrastructure`, `Trebol.Helpers` |
| `Trebol.Helpers` | `Trebol.Constants`, `Trebol.Model` | `Trebol.Web`, `Trebol.Infrastructure`, `Trebol.Domain` |
| `Trebol.Domain` | `Trebol.Model` | `Trebol.Web`, `Trebol.Infrastructure`, `Trebol.Helpers` |
| `Trebol.Infrastructure` | `Trebol.Domain`, `Trebol.Model`, `Trebol.Constants` | `Trebol.Web`, `Trebol.Helpers` |
| `Trebol.Web` | `Trebol.Domain`, `Trebol.Model`, `Trebol.Constants`, `Trebol.Helpers` | `Trebol.Infrastructure` (solo vía interfaces) |

### Notas de arquitectura específicas para Trébol

- **`Trebol.Domain`** contiene únicamente interfaces de repositorios. No existe capa `Application` separada — la lógica de negocio compleja vive dentro de los Stored Procedures en SQL Server.
- Los controladores son **thin**: validan `ModelState`, llaman al repositorio correspondiente, y redirigen. No contienen lógica de negocio.
- **`Trebol.Web`** nunca instancia directamente un repositorio de `Infrastructure`; siempre inyecta la interfaz de `Domain`.
- Los Stored Procedures manejan operaciones transaccionales complejas (registro, pago, agendamiento, seguimiento).
- EF Core se usa para lecturas, actualizaciones de perfil y consultas de catálogos.

---

## 3. Capa Model — Entidades y Tipos Centrales

### 3.1 Scaffold de Entidades desde SQL Server

```bash
dotnet ef dbcontext scaffold \
  "Server=.\SQLEXPRESS;Database=TrebolDB;Trusted_Connection=True;TrustServerCertificate=True;" \
  Microsoft.EntityFrameworkCore.SqlServer \
  --output-dir Entities/TrebolEntities \
  --context AppDbContext \
  --context-namespace Trebol.Model.Entities.TrebolEntities \
  --namespace Trebol.Model.Entities.TrebolEntities \
  --project "Trebol.Model\Trebol.Model.csproj" \
  --startup-project "Trebol.Web\Trebol.Web.csproj" \
  --force
```

### 3.2 Tabla de Entidades → Tablas SQL Server

| Clase Entidad | Tabla SQL Server | Descripción |
|---|---|---|
| `Pais` | `Pais` | Catálogo de países |
| `Ciudad` | `Ciudad` | Catálogo de ciudades por país |
| `Especialidad` | `Especialidad` | Catálogo de especialidades psicológicas |
| `Categoria` | `Categoria` | Categorías de salas/eventos |
| `Idioma` | `Idioma` | Catálogo de idiomas |
| `Usuario` | `Usuario` | Pacientes/usuarios de la plataforma |
| `Profesional` | `Profesional` | Psicólogos/especialistas |
| `Administrador` | `Administrador` | Administradores del sistema |
| `ProfesionalEspecialidad` | `ProfesionalEspecialidad` | Relación N:M profesional-especialidad |
| `ProfesionalEstudio` | `ProfesionalEstudio` | Estudios/formación del profesional |
| `ProfesionalIdioma` | `ProfesionalIdioma` | Idiomas que domina el profesional |
| `TokenValidacion` | `TokenValidacion` | Tokens de validación genéricos |
| `TokenActivacion` | `TokenActivacion` | Tokens de activación de cuenta |
| `TokenRecuperacion` | `TokenRecuperacion` | Tokens de recuperación de contraseña |
| `HorarioDisponible` | `HorarioDisponible` | Disponibilidad semanal del profesional |
| `HorarioBloqueado` | `HorarioBloqueado` | Bloqueos puntuales de horario |
| `CuentaBancaria` | `CuentaBancaria` | Cuenta bancaria del profesional para pagos |
| `Sala` | `Sala` | Salas de conferencia (públicas/privadas) |
| `Evento` | `Evento` | Eventos/conferencias del profesional |
| `MensajeEvento` | `MensajeEvento` | Chat dentro de un evento en vivo |
| `Cita` | `Cita` | Citas privadas entre usuario y profesional |
| `PagoCita` | `PagoCita` | Pago asociado a una cita |
| `Recomendacion` | `Recomendacion` | Recomendaciones/seguimientos clínicos |
| `ComentarioPrivado` | `ComentarioPrivado` | Notas clínicas privadas del profesional |
| `HistorialClinico` | `HistorialClinico` | Historial clínico del usuario |
| `Inscripcion` | `Inscripcion` | Inscripción de usuario a un evento |
| `Pago` | `Pago` | Pago de inscripción a evento |
| `LogPago` | `LogPago` | Log de intentos y respuestas de pasarela |
| `Seguidor` | `Seguidor` | Relación seguidor (usuario→profesional) |
| `MeGusta` | `MeGusta` | Me gusta en salas/eventos |
| `ComentarioProfesional` | `ComentarioProfesional` | Comentarios públicos en perfil del profesional |
| `RespuestaComentario` | `RespuestaComentario` | Respuestas a comentarios del profesional |
| `Conversacion` | `Conversacion` | Hilo de mensajería privada |
| `MensajePrivado` | `MensajePrivado` | Mensajes dentro de una conversación |
| `ColaboracionProfesional` | `ColaboracionProfesional` | Red de colegas entre profesionales |
| `Notificacion` | `Notificacion` | Notificaciones del sistema (admin) |
| `Sesion` | `Sesion` | Registro de sesiones activas |
| `Configuracion` | `Configuracion` | Configuración global del sistema |

### 3.3 AppDbContext

```csharp
// Model/Entities/TrebolEntities/AppDbContext.cs
namespace Trebol.Model.Entities.TrebolEntities;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Catálogos
    public DbSet<Pais>                       Paises                       { get; set; }
    public DbSet<Ciudad>                     Ciudades                     { get; set; }
    public DbSet<Especialidad>               Especialidades               { get; set; }
    public DbSet<Categoria>                  Categorias                   { get; set; }
    public DbSet<Idioma>                     Idiomas                      { get; set; }

    // Usuarios y roles
    public DbSet<Usuario>                    Usuarios                     { get; set; }
    public DbSet<Profesional>                Profesionales                { get; set; }
    public DbSet<Administrador>              Administradores              { get; set; }

    // Perfil profesional
    public DbSet<ProfesionalEspecialidad>    ProfesionalEspecialidades    { get; set; }
    public DbSet<ProfesionalEstudio>         ProfesionalEstudios          { get; set; }
    public DbSet<ProfesionalIdioma>          ProfesionalIdiomas           { get; set; }
    public DbSet<CuentaBancaria>             CuentasBancarias             { get; set; }

    // Seguridad / tokens
    public DbSet<TokenValidacion>            TokensValidacion             { get; set; }
    public DbSet<TokenActivacion>            TokensActivacion             { get; set; }
    public DbSet<TokenRecuperacion>          TokensRecuperacion           { get; set; }
    public DbSet<Sesion>                     Sesiones                     { get; set; }

    // Disponibilidad
    public DbSet<HorarioDisponible>          HorariosDisponibles          { get; set; }
    public DbSet<HorarioBloqueado>           HorariosBloqueados           { get; set; }

    // Salas y eventos
    public DbSet<Sala>                       Salas                        { get; set; }
    public DbSet<Evento>                     Eventos                      { get; set; }
    public DbSet<MensajeEvento>              MensajesEvento               { get; set; }

    // Citas y pagos
    public DbSet<Cita>                       Citas                        { get; set; }
    public DbSet<PagoCita>                   PagosCita                    { get; set; }

    // Inscripciones y pagos de eventos
    public DbSet<Inscripcion>                Inscripciones                { get; set; }
    public DbSet<Pago>                       Pagos                        { get; set; }
    public DbSet<LogPago>                    LogsPago                     { get; set; }

    // Clínico
    public DbSet<Recomendacion>              Recomendaciones              { get; set; }
    public DbSet<ComentarioPrivado>          ComentariosPrivados          { get; set; }
    public DbSet<HistorialClinico>           HistorialesClinicos          { get; set; }

    // Social
    public DbSet<Seguidor>                   Seguidores                   { get; set; }
    public DbSet<MeGusta>                    MeGustas                     { get; set; }
    public DbSet<ComentarioProfesional>      ComentariosProfesionales     { get; set; }
    public DbSet<RespuestaComentario>        RespuestasComentario         { get; set; }

    // Mensajería
    public DbSet<Conversacion>              Conversaciones               { get; set; }
    public DbSet<MensajePrivado>            MensajesPrivados             { get; set; }

    // Red profesional
    public DbSet<ColaboracionProfesional>   ColaboracionesProfesionales  { get; set; }

    // Sistema
    public DbSet<Notificacion>              Notificaciones               { get; set; }
    public DbSet<Configuracion>             Configuraciones              { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
```

### 3.4 ResultadoOperacion

```csharp
// Model/Models/ResultadoOperacion.cs
namespace Trebol.Model.Models;

public class ResultadoOperacion
{
    public bool   Exito   { get; init; }
    public string Mensaje { get; init; } = string.Empty;

    public static ResultadoOperacion Ok(string mensaje = "")
        => new() { Exito = true,  Mensaje = mensaje };

    public static ResultadoOperacion Fail(string mensaje)
        => new() { Exito = false, Mensaje = mensaje };
}

public class ResultadoOperacion<T> : ResultadoOperacion
{
    public T? Datos { get; init; }

    public static ResultadoOperacion<T> Ok(T datos, string mensaje = "")
        => new() { Exito = true, Datos = datos, Mensaje = mensaje };

    public new static ResultadoOperacion<T> Fail(string mensaje)
        => new() { Exito = false, Mensaje = mensaje };
}
```

### 3.5 PaginacionModel

```csharp
// Model/Models/PaginacionModel.cs
namespace Trebol.Model.Models;

public class PaginacionModel
{
    public int Pagina         { get; set; } = 1;
    public int TamanioPagina  { get; set; } = PaginacionConstant.TamanioDefecto;
    public int TotalRegistros { get; set; }
    public int TotalPaginas   => (int)Math.Ceiling((double)TotalRegistros / TamanioPagina);
}
```

### 3.6 Enums

```csharp
// Model/Enums/RolUsuario.cs
public enum RolUsuario
{
    Usuario,
    Profesional,
    Admin
}

// Model/Enums/EstadoUsuario.cs
public enum EstadoUsuario
{
    Pendiente,    // Registrado, aún no activó su cuenta
    Activo,       // Cuenta activa y operativa
    Bloqueado     // Acceso revocado por admin
}

// Model/Enums/EstadoProfesional.cs
public enum EstadoProfesional
{
    PendienteValidacion,  // Documentos enviados, en revisión (3-5 días hábiles)
    Activo,               // Verificado y operativo
    Rechazado,            // Documentos no válidos
    Bloqueado             // Acceso revocado por admin
}

// Model/Enums/EstadoCita.cs
public enum EstadoCita
{
    Programada,   // Agendada y con pago confirmado
    Cancelada,    // Cancelada por usuario o profesional
    Movida,       // Reprogramada
    Finalizada    // Sesión completada
}

// Model/Enums/TipoCita.cs
public enum TipoCita
{
    Seguimiento,  // Cita de seguimiento de caso existente
    Asesoria      // Consulta/asesoría puntual
}

// Model/Enums/EstadoInscripcion.cs
public enum EstadoInscripcion
{
    PendientePago,       // Inscripción iniciada, pago no completado
    PagoAprobado,        // Pago procesado exitosamente
    PagoRechazado,       // Pago rechazado por la pasarela
    Confirmada,          // Inscripción confirmada y cupo reservado
    SinCupos,            // Evento lleno al momento del intento
    ReembolsoPendiente,  // Cancelación solicitada, reembolso en proceso
    Cancelada            // Inscripción cancelada
}

// Model/Enums/EstadoPago.cs
public enum EstadoPago
{
    Pendiente,   // En espera de respuesta de la pasarela
    Aprobado,    // Transacción exitosa
    Rechazado    // Transacción fallida
}

// Model/Enums/MetodoPago.cs
public enum MetodoPago
{
    TarjetaCredito,
    TarjetaDebito,
    PSE,
    Efecty
}

// Model/Enums/TipoSala.cs
public enum TipoSala
{
    Publica,   // Sala de conferencia abierta al público
    Privada    // Sala de cita privada (1 a 1)
}

// Model/Enums/EstadoSala.cs
public enum EstadoSala
{
    Abierta,  // Sala activa y en curso
    Cerrada   // Sala finalizada
}

// Model/Enums/EstadoEvento.cs
public enum EstadoEvento
{
    Abierto,   // Con cupos disponibles, inscripciones habilitadas
    Cerrado,   // Sin cupos o fuera de fecha
    Cancelado  // Evento cancelado por el profesional
}

// Model/Enums/TipoEntidad.cs
public enum TipoEntidad
{
    Usuario,
    Profesional,
    Admin
}

// Model/Enums/EstadoColaboracion.cs
public enum EstadoColaboracion
{
    Activa,    // Colaboración vigente
    Pendiente, // Solicitud enviada, no aceptada aún
    Inactiva   // Colaboración terminada
}

// Model/Enums/TipoNotificacion.cs
public enum TipoNotificacion
{
    RegistroProfesional,  // Solicitud de alta de nuevo profesional
    Sistema               // Notificación interna del sistema
}

// Model/Enums/EstadoNotificacion.cs
public enum EstadoNotificacion
{
    Pendiente,  // Sin revisar
    Aprobada,   // Profesional aprobado
    Rechazada,  // Profesional rechazado
    Leida       // Notificación revisada sin acción
}
```

---

## 4. Capa Domain — Interfaces de Repositorios

```csharp
// Domain/Interfaces/IUsuarioRepository.cs
namespace Trebol.Domain.Interfaces;

public interface IUsuarioRepository
{
    Task<ResultadoOperacion<int>> RegistrarAsync(RegistroUsuarioDto dto, CancellationToken ct = default);
    Task<ResultadoOperacion>      ActivarAsync(string token, string passwordHash, CancellationToken ct = default);
    Task<Usuario?>                ObtenerPorCorreoAsync(string correo, CancellationToken ct = default);
    Task<Usuario?>                ObtenerPorIdAsync(int usuarioId, CancellationToken ct = default);
    Task<ResultadoOperacion>      ActualizarAsync(ActualizarUsuarioDto dto, CancellationToken ct = default);
    Task<ResultadoOperacion>      SubirFotoAsync(int usuarioId, string rutaFoto, CancellationToken ct = default);
}
```

```csharp
// Domain/Interfaces/IProfesionalRepository.cs
namespace Trebol.Domain.Interfaces;

public interface IProfesionalRepository
{
    Task<ResultadoOperacion<int>> RegistrarAsync(RegistroProfesionalDto dto, CancellationToken ct = default);
    Task<Profesional?>            ObtenerPorIdAsync(int id, CancellationToken ct = default);
    Task<Profesional?>            ObtenerPorCorreoAsync(string correo, CancellationToken ct = default);
    Task<ResultadoOperacion>      ActualizarAsync(ActualizarProfesionalDto dto, CancellationToken ct = default);
    Task<ResultadoOperacion>      AprobarAsync(int profesionalId, bool aprobado, string? motivoRechazo = null, CancellationToken ct = default);
    Task<ResultadoOperacion>      SubirFotoAsync(int profesionalId, string rutaFoto, CancellationToken ct = default);
    Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerDirectorioAsync(FiltroDirectorioDto filtro, CancellationToken ct = default);
}
```

```csharp
// Domain/Interfaces/IAdministradorRepository.cs
namespace Trebol.Domain.Interfaces;

public interface IAdministradorRepository
{
    Task<Administrador?> ObtenerPorCorreoAsync(string correo, CancellationToken ct = default);
    Task<Administrador?> ObtenerPorIdAsync(int administradorId, CancellationToken ct = default);
}
```

```csharp
// Domain/Interfaces/ICitaRepository.cs
namespace Trebol.Domain.Interfaces;

public interface ICitaRepository
{
    Task<ResultadoOperacion<int>>       AgendarAsync(CrearCitaDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<CitaListaDto>>   ObtenerPorUsuarioAsync(int usuarioId, string estado, int pagina, CancellationToken ct = default);
    Task<IReadOnlyList<CitaListaDto>>   ObtenerPorProfesionalAsync(int profesionalId, string estado, int pagina, CancellationToken ct = default);
    Task<CitaDto?>                      ObtenerDetalleAsync(int citaId, CancellationToken ct = default);
    Task<ResultadoOperacion>            CancelarAsync(int citaId, int solicitanteId, CancellationToken ct = default);
    Task<ResultadoOperacion>            MoverAsync(int citaId, DateTime nuevaFechaHora, CancellationToken ct = default);
    Task<ResultadoOperacion>            FinalizarAsync(int citaId, CancellationToken ct = default);
}
```

```csharp
// Domain/Interfaces/ISalaRepository.cs
namespace Trebol.Domain.Interfaces;

public interface ISalaRepository
{
    Task<ResultadoOperacion<int>>    CrearAsync(CrearSalaDto dto, CancellationToken ct = default);
    Task<SalaDto?>                   ObtenerPorIdAsync(int salaId, CancellationToken ct = default);
    Task<IReadOnlyList<SalaListaDto>> ObtenerPorProfesionalAsync(int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion>         CerrarAsync(int salaId, int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion>         EliminarAsync(int salaId, int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion>         DuplicarAsync(int salaId, int profesionalId, CancellationToken ct = default);
}
```

```csharp
// Domain/Interfaces/IEventoRepository.cs
namespace Trebol.Domain.Interfaces;

public interface IEventoRepository
{
    Task<ResultadoOperacion<int>>     CrearAsync(CrearEventoDto dto, CancellationToken ct = default);
    Task<EventoDto?>                  ObtenerPorIdAsync(int eventoId, CancellationToken ct = default);
    Task<IReadOnlyList<EventoDto>>    ObtenerPorProfesionalAsync(int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion>          ActualizarAsync(CrearEventoDto dto, CancellationToken ct = default);
    Task<ResultadoOperacion>          EliminarAsync(int eventoId, int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion>          DuplicarAsync(int eventoId, CancellationToken ct = default);
}
```

```csharp
// Domain/Interfaces/IInscripcionRepository.cs
namespace Trebol.Domain.Interfaces;

public interface IInscripcionRepository
{
    Task<ResultadoOperacion<int>> IniciarAsync(CrearInscripcionDto dto, CancellationToken ct = default);
    Task<InscripcionDto?>         ObtenerPorIdAsync(int inscripcionId, CancellationToken ct = default);
    Task<ResultadoOperacion>      ConfirmarAsync(int inscripcionId, CancellationToken ct = default);
    Task<ResultadoOperacion>      CancelarAsync(int inscripcionId, CancellationToken ct = default);
    Task<bool>                    YaEstaInscritoAsync(int usuarioId, int eventoId, CancellationToken ct = default);
}
```

```csharp
// Domain/Interfaces/IPagoRepository.cs
namespace Trebol.Domain.Interfaces;

public interface IPagoRepository
{
    Task<ResultadoOperacion<int>> CrearPagoInscripcionAsync(ConfirmarPagoDto dto, CancellationToken ct = default);
    Task<ResultadoOperacion<int>> CrearPagoCitaAsync(ConfirmarPagoDto dto, CancellationToken ct = default);
    Task<PagoDto?>                ObtenerPorIdAsync(int pagoId, CancellationToken ct = default);
    Task<ResultadoOperacion>      RegistrarLogAsync(int pagoId, string respuestaPasarela, CancellationToken ct = default);
}
```

```csharp
// Domain/Interfaces/IMensajeriaRepository.cs
namespace Trebol.Domain.Interfaces;

public interface IMensajeriaRepository
{
    Task<ResultadoOperacion<int>>          EnviarMensajeAsync(int autorId, string tipoAutor, int destinoId, string texto, CancellationToken ct = default);
    Task<IReadOnlyList<ConversacionDto>>   ObtenerConversacionesAsync(int entidadId, string tipoEntidad, CancellationToken ct = default);
    Task<IReadOnlyList<MensajePrivadoDto>> ObtenerMensajesAsync(int conversacionId, CancellationToken ct = default);
    Task                                   MarcarLeidosAsync(int conversacionId, int lectorId, CancellationToken ct = default);
}
```

```csharp
// Domain/Interfaces/IDirectorioRepository.cs
namespace Trebol.Domain.Interfaces;

public interface IDirectorioRepository
{
    Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerEspecialistasAsync(FiltroDirectorioDto filtro, CancellationToken ct = default);
    Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerPsicologosAsync(FiltroDirectorioDto filtro, CancellationToken ct = default);
    Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerMisMentoresAsync(int usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<ProfesionalDirectorioDto>> ObtenerMisColegasAsync(int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion>                       ToggleSeguirAsync(int usuarioId, int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion>                       ToggleColegaAsync(int profesionalId, int colegaId, CancellationToken ct = default);
}
```

```csharp
// Domain/Interfaces/ICalendarioRepository.cs
namespace Trebol.Domain.Interfaces;

public interface ICalendarioRepository
{
    Task<IReadOnlyList<HorarioDisponible>> ObtenerDisponibilidadAsync(int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion>               GuardarDisponibilidadAsync(int profesionalId, IEnumerable<HorarioDisponible> horarios, CancellationToken ct = default);
    Task<ResultadoOperacion>               BloquearHorarioAsync(int profesionalId, DateTime inicio, DateTime fin, string? motivo, CancellationToken ct = default);
    Task<ResultadoOperacion>               DesbloquearHorarioAsync(int bloqueoId, int profesionalId, CancellationToken ct = default);
    Task<IReadOnlyList<CitaListaDto>>      ObtenerCitasCalendarioAsync(int usuarioId, DateTime inicio, DateTime fin, CancellationToken ct = default);
}
```

```csharp
// Domain/Interfaces/INotificacionRepository.cs
namespace Trebol.Domain.Interfaces;

public interface INotificacionRepository
{
    Task<IReadOnlyList<NotificacionDto>> ObtenerPendientesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<NotificacionDto>> ObtenerTodasAsync(string? filtro, CancellationToken ct = default);
    Task<ResultadoOperacion>             MarcarLeidaAsync(int notificacionId, CancellationToken ct = default);
    Task<ResultadoOperacion>             MarcarTodasLeidasAsync(CancellationToken ct = default);
}
```

```csharp
// Domain/Interfaces/Catalogos/ICatalogoRepository.cs
namespace Trebol.Domain.Interfaces.Catalogos;

public interface ICatalogoRepository
{
    Task<IReadOnlyList<Pais>>         ObtenerPaisesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Ciudad>>       ObtenerCiudadesPorPaisAsync(int paisId, CancellationToken ct = default);
    Task<IReadOnlyList<Especialidad>> ObtenerEspecialidadesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Categoria>>    ObtenerCategoriasAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Idioma>>       ObtenerIdiomasAsync(CancellationToken ct = default);
}
```

```csharp
// Domain/Interfaces/Catalogos/IConfiguracionRepository.cs
namespace Trebol.Domain.Interfaces.Catalogos;

public interface IConfiguracionRepository
{
    Task<string?> ObtenerValorAsync(string clave, CancellationToken ct = default);
    Task<ResultadoOperacion> ActualizarValorAsync(string clave, string valor, CancellationToken ct = default);
}
```

---

## 5. Capa Constants

```csharp
// Constants/Messages/AuthConstant.cs
namespace Trebol.Constants.Messages;

public static class AuthConstant
{
    public const string CredencialesInvalidas  = "Correo o contraseña incorrectos.";
    public const string CuentaBloqueada        = "Tu cuenta está bloqueada. Contacta al administrador.";
    public const string CuentaPendiente        = "Tu cuenta aún no ha sido activada. Revisa tu correo.";
    public const string TokenInvalido          = "El enlace es inválido o ha expirado.";
    public const string TokenUsado             = "Este enlace ya fue utilizado.";
    public const string SesionCerrada          = "Tu sesión ha expirado. Por favor inicia sesión de nuevo.";
    public const string AccesoDenegado         = "No tienes permiso para acceder a esta sección.";
}
```

```csharp
// Constants/Messages/RegistroConstant.cs
namespace Trebol.Constants.Messages;

public static class RegistroConstant
{
    public const string CorreoDuplicado         = "Ya existe una cuenta con este correo electrónico.";
    public const string DocumentoDuplicado      = "Ya existe una cuenta con este número de documento.";
    public const string TarjetaDuplicada        = "El número de tarjeta profesional ya está registrado.";
    public const string RegistroExitoso         = "Tu cuenta fue creada. Revisa tu correo para activarla.";
    public const string RegistroProfesionalOk   = "Tu solicitud fue enviada. El proceso de verificación toma 3 a 5 días hábiles.";
    public const string ArchivoPdfRequerido     = "Solo se permiten archivos PDF (máximo 5 MB).";
    public const string CuentaActivada          = "¡Tu cuenta está activa! Ya puedes iniciar sesión.";
    public const string TokenActivacionInvalido = "El enlace de activación es inválido o ha expirado.";
}
```

```csharp
// Constants/Messages/CitaConstant.cs
namespace Trebol.Constants.Messages;

public static class CitaConstant
{
    public const string HorarioNoDisponible = "El profesional no tiene disponibilidad en ese horario.";
    public const string HorarioBloqueado    = "El horario seleccionado está bloqueado.";
    public const string CitaAgendada        = "Tu cita fue agendada exitosamente.";
    public const string CitaCancelada       = "La cita fue cancelada.";
    public const string CitaMovida          = "La cita fue reprogramada exitosamente.";
    public const string CitaFinalizada      = "La sesión fue marcada como finalizada.";
    public const string CitaNoEncontrada    = "La cita solicitada no existe o no te pertenece.";
}
```

```csharp
// Constants/Messages/InscripcionConstant.cs
namespace Trebol.Constants.Messages;

public static class InscripcionConstant
{
    public const string SinCupos              = "Lo sentimos, el evento ya no tiene cupos disponibles.";
    public const string YaInscrito            = "Ya estás inscrito en este evento.";
    public const string InscripcionConfirmada = "¡Ya estás inscrito! Revisa tu correo con los detalles.";
    public const string EventoNoDisponible    = "Este evento no está disponible para inscripción.";
    public const string InscripcionCancelada  = "Tu inscripción fue cancelada exitosamente.";
}
```

```csharp
// Constants/Messages/PagoConstant.cs
namespace Trebol.Constants.Messages;

public static class PagoConstant
{
    public const string PagoAprobado    = "¡Cita confirmada! Revisa tu correo.";
    public const string PagoRechazado   = "El pago fue rechazado. Verifica tus datos e intenta de nuevo.";
    public const string PagoPendiente   = "Tu pago está siendo procesado.";
    public const decimal TarifaFijaCita = 5000m;  // $5.000 COP tarifa plataforma por cita
}
```

```csharp
// Constants/Messages/SalaConstant.cs
namespace Trebol.Constants.Messages;

public static class SalaConstant
{
    public const string SalaCreada      = "La sala fue creada exitosamente.";
    public const string SalaCerrada     = "La sala fue cerrada.";
    public const string SalaEliminada   = "La sala fue eliminada.";
    public const string SalaDuplicada   = "La sala fue duplicada exitosamente.";
    public const string SalaNoEncontrada = "La sala solicitada no existe o no te pertenece.";
    public const string AccesoNoPermitido = "No tienes acceso a esta sala.";
}
```

```csharp
// Constants/Messages/PerfilConstant.cs
namespace Trebol.Constants.Messages;

public static class PerfilConstant
{
    public const string ActualizacionExitosa   = "Tu perfil fue actualizado correctamente.";
    public const string FotoActualizada        = "Tu foto de perfil fue actualizada.";
    public const string FormatoImagenInvalido  = "Solo se permiten imágenes JPG o PNG (máximo 2 MB).";
    public const string ComentarioRegistrado   = "Tu comentario fue enviado. ¡Gracias por tu opinión!";
    public const string SeguimientoActivado    = "Ahora sigues a este profesional.";
    public const string SeguimientoDesactivado = "Dejaste de seguir a este profesional.";
}
```

```csharp
// Constants/Messages/MensajeriaConstant.cs
namespace Trebol.Constants.Messages;

public static class MensajeriaConstant
{
    public const string MensajeEnviado      = "Mensaje enviado.";
    public const string MensajeVacio        = "El mensaje no puede estar vacío.";
    public const string ConversacionNoExiste = "La conversación no existe o no tienes acceso.";
}
```

```csharp
// Constants/Messages/EmailConstant.cs
namespace Trebol.Constants.Messages;

public static class EmailConstant
{
    public const string AsuntoActivacion      = "Activa tu cuenta en Trébol";
    public const string AsuntoRecuperacion    = "Restablece tu contraseña en Trébol";
    public const string AsuntoConfirmacionCita = "Tu cita fue confirmada — Trébol";
    public const string AsuntoInscripcion     = "Tu inscripción fue confirmada — Trébol";
    public const string AsuntoAprobacionPro   = "Tu cuenta profesional fue aprobada — Trébol";
    public const string AsuntoRechazo         = "Actualización sobre tu solicitud — Trébol";
}
```

```csharp
// Constants/Pagination/PaginacionConstant.cs
namespace Trebol.Constants.Pagination;

public static class PaginacionConstant
{
    public const int TamanioDefecto = 10;
    public const int TamanioDirectorio = 12;
    public const int TamanioMensajes   = 20;
}
```

---

## 6. Capa Helpers

### 6.1 IPasswordHelper / PasswordHelper (Argon2)

```csharp
// Helpers/Security/IPasswordHelper.cs
namespace Trebol.Helpers.Security;

public interface IPasswordHelper
{
    string HashPassword(string password);
    bool   VerifyPassword(string password, string hash);
}
```

```csharp
// Helpers/Security/PasswordHelper.cs
// NuGet: Konscious.Security.Cryptography.Argon2
// Salt (32 bytes) embebido en el hash — se almacena en DB como campo único NVARCHAR(500)
// Es el ÚNICO componente autorizado para generar o verificar contraseñas en todo el sistema
namespace Trebol.Helpers.Security;

public sealed class PasswordHelper : IPasswordHelper
{
    private const int SaltSize       = 32;
    private const int HashSize       = 32;
    private const int Parallelism    = 4;
    private const int MemorySize     = 65536; // 64 MB
    private const int Iterations     = 3;

    public string HashPassword(string password)
    {
        var salt = new byte[SaltSize];
        RandomNumberGenerator.Fill(salt);

        using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
        {
            Salt                = salt,
            DegreeOfParallelism = Parallelism,
            MemorySize          = MemorySize,
            Iterations          = Iterations
        };

        var hash     = argon2.GetBytes(HashSize);
        var combined = new byte[SaltSize + HashSize];
        Buffer.BlockCopy(salt, 0, combined, 0,        SaltSize);
        Buffer.BlockCopy(hash, 0, combined, SaltSize, HashSize);
        return Convert.ToBase64String(combined);
    }

    public bool VerifyPassword(string password, string storedHash)
    {
        var combined    = Convert.FromBase64String(storedHash);
        var salt        = combined[..SaltSize];
        var storedBytes = combined[SaltSize..];

        using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
        {
            Salt                = salt,
            DegreeOfParallelism = Parallelism,
            MemorySize          = MemorySize,
            Iterations          = Iterations
        };

        var computedHash = argon2.GetBytes(HashSize);
        return CryptographicOperations.FixedTimeEquals(computedHash, storedBytes);
    }
}
```

### 6.2 ITokenHelper / TokenHelper

```csharp
// Helpers/Token/ITokenHelper.cs
namespace Trebol.Helpers.Token;

public interface ITokenHelper
{
    string GenerarToken();
}
```

```csharp
// Helpers/Token/TokenHelper.cs
// Genera un token URL-safe criptográficamente seguro (64 bytes → Base64 → reemplazos URL-safe)
namespace Trebol.Helpers.Token;

public sealed class TokenHelper : ITokenHelper
{
    public string GenerarToken()
        => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
                  .Replace("+", "-")
                  .Replace("/", "_")
                  .Replace("=", "");
}
```

### 6.3 IArchivoHelper / ArchivoHelper

```csharp
// Helpers/Archivos/IArchivoHelper.cs
namespace Trebol.Helpers.Archivos;

public interface IArchivoHelper
{
    Task<string> GuardarPdfAsync(IFormFile archivo, int profesionalId, string tipo);
    bool         EsPdfValido(IFormFile archivo);
}
```

```csharp
// Helpers/Archivos/ArchivoHelper.cs
// Solo permite archivos PDF, tamaño máximo 5 MB
// Guarda en wwwroot/uploads/profesionales/{profesionalId}/{tipo}_{timestamp}.pdf
namespace Trebol.Helpers.Archivos;

public sealed class ArchivoHelper : IArchivoHelper
{
    private const long MaxTamañoBytes = 5 * 1024 * 1024; // 5 MB
    private readonly IWebHostEnvironment _env;

    public ArchivoHelper(IWebHostEnvironment env) => _env = env;

    public bool EsPdfValido(IFormFile archivo)
        => archivo is not null
        && archivo.Length > 0
        && archivo.Length <= MaxTamañoBytes
        && Path.GetExtension(archivo.FileName).Equals(".pdf", StringComparison.OrdinalIgnoreCase);

    public async Task<string> GuardarPdfAsync(IFormFile archivo, int profesionalId, string tipo)
    {
        if (!EsPdfValido(archivo))
            throw new InvalidOperationException(RegistroConstant.ArchivoPdfRequerido);

        var carpeta = Path.Combine(_env.WebRootPath, "uploads", "profesionales", profesionalId.ToString());
        Directory.CreateDirectory(carpeta);

        var nombreArchivo = $"{tipo}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}.pdf";
        var rutaCompleta  = Path.Combine(carpeta, nombreArchivo);

        await using var stream = new FileStream(rutaCompleta, FileMode.Create);
        await archivo.CopyToAsync(stream);

        return Path.Combine("uploads", "profesionales", profesionalId.ToString(), nombreArchivo)
                   .Replace("\\", "/");
    }
}
```

### 6.4 IEmailHelper / EmailHelper

```csharp
// Helpers/Email/IEmailHelper.cs
namespace Trebol.Helpers.Email;

public interface IEmailHelper
{
    Task EnviarAsync(string destinatario, string asunto, string cuerpoHtml, CancellationToken ct = default);
    Task EnviarActivacionAsync(string destinatario, string token, CancellationToken ct = default);
    Task EnviarRecuperacionAsync(string destinatario, string token, CancellationToken ct = default);
    Task EnviarConfirmacionCitaAsync(string destinatario, CitaDto cita, CancellationToken ct = default);
}
```

### 6.5 HelperAccessDependency

```csharp
// Helpers/AccessDependency/HelperAccessDependency.cs
namespace Trebol.Helpers.AccessDependency;

public static class HelperAccessDependency
{
    public static IServiceCollection AddHelpers(this IServiceCollection services)
    {
        services.AddScoped<IPasswordHelper, PasswordHelper>();
        services.AddScoped<IEmailHelper,    EmailHelper>();
        services.AddScoped<IArchivoHelper,  ArchivoHelper>();
        services.AddScoped<ITokenHelper,    TokenHelper>();
        return services;
    }
}
```

---

## 7. Capa Infrastructure

### 7.1 InfrastructureAccessDependency

```csharp
// Infrastructure/AccessDependency/InfrastructureAccessDependency.cs
namespace Trebol.Infrastructure.AccessDependency;

public static class InfrastructureAccessDependency
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration          configuration)
    {
        // EF Core con SQL Server
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("TrebolDB"),
                sql => sql.MigrationsAssembly("Trebol.Infrastructure")));

        // Repositorios principales
        services.AddScoped<IUsuarioRepository,       UsuarioRepository>();
        services.AddScoped<IProfesionalRepository,   ProfesionalRepository>();
        services.AddScoped<IAdministradorRepository, AdministradorRepository>();
        services.AddScoped<ICitaRepository,          CitaRepository>();
        services.AddScoped<ISalaRepository,          SalaRepository>();
        services.AddScoped<IEventoRepository,        EventoRepository>();
        services.AddScoped<IInscripcionRepository,   InscripcionRepository>();
        services.AddScoped<IPagoRepository,          PagoRepository>();
        services.AddScoped<IMensajeriaRepository,    MensajeriaRepository>();
        services.AddScoped<IDirectorioRepository,    DirectorioRepository>();
        services.AddScoped<ICalendarioRepository,    CalendarioRepository>();
        services.AddScoped<INotificacionRepository,  NotificacionRepository>();

        // Repositorios de catálogos
        services.AddScoped<ICatalogoRepository,      CatalogoRepository>();
        services.AddScoped<IConfiguracionRepository, ConfiguracionRepository>();

        return services;
    }
}
```

### 7.2 Ejemplo de Repositorio con Stored Procedures (UsuarioRepository)

```csharp
// Infrastructure/Repositories/UsuarioRepository.cs
// Patrón: SP para operaciones transaccionales, EF Core para lecturas simples
namespace Trebol.Infrastructure.Repositories;

public sealed class UsuarioRepository : IUsuarioRepository
{
    private readonly AppDbContext  _context;
    private readonly string        _connectionString;

    public UsuarioRepository(AppDbContext context, IConfiguration configuration)
    {
        _context          = context;
        _connectionString = configuration.GetConnectionString("TrebolDB")!;
    }

    // ──────────────────────── Stored Procedures ────────────────────────

    public async Task<ResultadoOperacion<int>> RegistrarAsync(
        RegistroUsuarioDto dto, CancellationToken ct = default)
    {
        await using var connection = new SqlConnection(_connectionString);

        var parameters = new DynamicParameters();
        parameters.Add("@NombreCompleto",  dto.NombreCompleto);
        parameters.Add("@Correo",          dto.Correo);
        parameters.Add("@NumeroDocumento", dto.NumeroDocumento);
        parameters.Add("@Alias",           dto.Alias);
        parameters.Add("@Celular",         dto.Celular);
        parameters.Add("@CiudadId",        dto.CiudadId);
        parameters.Add("@TokenActivacion", dto.TokenActivacion);
        parameters.Add("@UsuarioId",       dbType: DbType.Int32,  direction: ParameterDirection.Output);
        parameters.Add("@Resultado",       dbType: DbType.String, size: 100, direction: ParameterDirection.Output);

        await connection.ExecuteAsync(
            "sp_RegistrarUsuario", parameters,
            commandType: CommandType.StoredProcedure);

        var resultado  = parameters.Get<string>("@Resultado");
        var usuarioId  = parameters.Get<int>("@UsuarioId");

        return resultado == "OK"
            ? ResultadoOperacion<int>.Ok(usuarioId,  RegistroConstant.RegistroExitoso)
            : ResultadoOperacion<int>.Fail(resultado);
    }

    public async Task<ResultadoOperacion> ActivarAsync(
        string token, string passwordHash, CancellationToken ct = default)
    {
        await using var connection = new SqlConnection(_connectionString);

        var parameters = new DynamicParameters();
        parameters.Add("@Token",        token);
        parameters.Add("@PasswordHash", passwordHash);
        parameters.Add("@Resultado",    dbType: DbType.String, size: 100, direction: ParameterDirection.Output);

        await connection.ExecuteAsync(
            "sp_ActivarCuentaUsuario", parameters,
            commandType: CommandType.StoredProcedure);

        var resultado = parameters.Get<string>("@Resultado");
        return resultado == "OK"
            ? ResultadoOperacion.Ok(RegistroConstant.CuentaActivada)
            : ResultadoOperacion.Fail(resultado);
    }

    // ──────────────────────── EF Core (lecturas) ────────────────────────

    public async Task<Usuario?> ObtenerPorCorreoAsync(string correo, CancellationToken ct = default)
        => await _context.Usuarios
                         .AsNoTracking()
                         .FirstOrDefaultAsync(u => u.Correo == correo, ct);

    public async Task<Usuario?> ObtenerPorIdAsync(int usuarioId, CancellationToken ct = default)
        => await _context.Usuarios
                         .AsNoTracking()
                         .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId, ct);

    public async Task<ResultadoOperacion> ActualizarAsync(
        ActualizarUsuarioDto dto, CancellationToken ct = default)
    {
        var usuario = await _context.Usuarios.FindAsync([dto.UsuarioId], ct);
        if (usuario is null) return ResultadoOperacion.Fail("Usuario no encontrado.");

        // Mapeo manual — AutoMapper no se usa en Infrastructure
        usuario.NombreCompleto = dto.NombreCompleto;
        usuario.Celular        = dto.Celular;
        usuario.CiudadId       = dto.CiudadId;

        await _context.SaveChangesAsync(ct);
        return ResultadoOperacion.Ok(PerfilConstant.ActualizacionExitosa);
    }

    public async Task<ResultadoOperacion> SubirFotoAsync(
        int usuarioId, string rutaFoto, CancellationToken ct = default)
    {
        var usuario = await _context.Usuarios.FindAsync([usuarioId], ct);
        if (usuario is null) return ResultadoOperacion.Fail("Usuario no encontrado.");

        usuario.FotoPerfil = rutaFoto;
        await _context.SaveChangesAsync(ct);
        return ResultadoOperacion.Ok(PerfilConstant.FotoActualizada);
    }
}
```

### 7.3 Reglas de EF Core en Infrastructure

| Regla | Aplicación |
|---|---|
| `.AsNoTracking()` | Todas las consultas de solo lectura |
| `.OnDelete(DeleteBehavior.Restrict)` | Todas las FKs en `*Configuration.cs` — sin cascadas |
| `CancellationToken` | Todos los métodos async reciben `ct` |
| Proyecciones `.Select(...)` | Listados y grillas (evita cargar entidades completas) |
| `.Include()` | Solo en perfiles completos o detalles con relaciones necesarias |
| Stored Procedures | Registro, login, activación, aprobación, pago, agendamiento, toggle seguir/colega, mensajería |
| EF Core directo | Actualizaciones de perfil, lecturas de catálogos, consultas por ID |

---

## 8. Capa Presentación — Controllers

### 8.1 Tabla de Responsabilidades

| Controller | Acciones principales | Roles permitidos |
|---|---|---|
| `LandingController` | `Index` | Público (sin auth) |
| `LoginController` | `Index` (GET+POST), `Logout` | Público |
| `RegistroController` | `SeleccionPerfil`, `RegistroUsuario`, `RegistroProfesional`, `ActivarCuenta`, `ActivarCuentaProfesional` | Público |
| `RecuperacionController` | `SolicitarRecuperacion` (GET+POST), `RestablecerPassword` (GET+POST) | Público |
| `HomeUsuarioController` | `Index` | `Usuario` |
| `HomeProfesionalController` | `Index` | `Profesional` |
| `CalendarioController` | `Index`, `Disponibilidad`, `BloquearHorario`, `DesbloquearHorario` | `Usuario` (Index), `Profesional` (resto) |
| `CitasController` | `Index`, `ListaProfesional`, `NuevaCita`, `Cancelar`, `Detalle` | `Usuario`, `Profesional` |
| `SalasController` | `SalaPrivadaUsuario`, `SalaPrivadaProfesional`, `SalaConferenciaUsuario`, `SalaConferenciaProfesional` | Según rol |
| `PagoCitaController` | `Index` (GET+POST), `ConfirmarPago` | `Usuario` |
| `InscripcionController` | `Paso1`, `Paso2`, `Paso3`, `ConfirmarPago` | `Usuario` |
| `MensajeriaController` | `IndexUsuario`, `IndexProfesional`, `EnviarMensaje`, `ObtenerMensajes` | Según rol |
| `PerfilOradorController` | `Cuenta`, `Salas`, `Comentarios`, `Calendario`, `Agendar`, `ToggleSeguir`, `AgregarComentario` | `Usuario` (seguir/comentar/agendar), Público (ver) |
| `PerfilUsuarioController` | `Index`, `Actualizar`, `SubirFoto` | `Usuario` |
| `PerfilProfesionalController` | `Info`, `Salas`, `Calendario`, `Citas`, `Indicadores`, `Actualizar`, `SubirFoto` | `Profesional` |
| `MisEventosController` | `Index`, `Crear`, `Editar`, `Duplicar`, `Eliminar`, `CopiarLink`, `Gestionar` | `Profesional` |
| `DirectorioController` | `Especialistas`, `Psicologos`, `MisMentores`, `MisColegas`, `ToggleSeguir`, `ToggleColega` | `Usuario` (primeros 3), `Profesional` (MisColegas) |
| `AdminController` | `BandejaNotificaciones`, `Aprobar`, `Rechazar`, `MarcarLeidas` | `Admin` |

### 8.2 Ejemplo de Controller — CitasController

```csharp
// Web/Controllers/CitasController.cs
namespace Trebol.Web.Controllers;

[Authorize]
public class CitasController : Controller
{
    private readonly ICitaRepository _citaRepo;
    private readonly IMapper         _mapper;

    public CitasController(ICitaRepository citaRepo, IMapper mapper)
    {
        _citaRepo = citaRepo;
        _mapper   = mapper;
    }

    // GET /Citas — lista de citas del usuario autenticado
    [HttpGet]
    [Authorize(Roles = "Usuario")]
    public async Task<IActionResult> Index(string estado = "Proximas", int pagina = 1)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var citas     = await _citaRepo.ObtenerPorUsuarioAsync(usuarioId, estado, pagina);
        var vm        = _mapper.Map<CitasUsuarioViewModel>(citas);
        return View(vm);
    }

    // GET /Citas/ListaProfesional
    [HttpGet]
    [Authorize(Roles = "Profesional")]
    public async Task<IActionResult> ListaProfesional(string estado = "Proximas", int pagina = 1)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var citas         = await _citaRepo.ObtenerPorProfesionalAsync(profesionalId, estado, pagina);
        var vm            = _mapper.Map<CitasProfesionalViewModel>(citas);
        return View(vm);
    }

    // POST /Citas/Cancelar
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Cancelar(int citaId)
    {
        var solicitanteId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado     = await _citaRepo.CancelarAsync(citaId, solicitanteId);

        return Json(resultado.Exito
            ? new { exito = true,  mensaje = CitaConstant.CitaCancelada }
            : new { exito = false, mensaje = resultado.Mensaje });
    }

    // POST /Citas/NuevaCita
    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Usuario")]
    public async Task<IActionResult> NuevaCita(NuevaCitaViewModel vm)
    {
        if (!ModelState.IsValid)
            return View(vm);

        var dto       = _mapper.Map<CrearCitaDto>(vm);
        var resultado = await _citaRepo.AgendarAsync(dto);

        if (!resultado.Exito)
        {
            ModelState.AddModelError("", resultado.Mensaje);
            return View(vm);
        }

        TempData["Mensaje"] = CitaConstant.CitaAgendada;
        return RedirectToAction(nameof(Index));
    }
}
```

### 8.3 Ejemplo de Controller — RegistroController

```csharp
// Web/Controllers/RegistroController.cs
namespace Trebol.Web.Controllers;

public class RegistroController : Controller
{
    private readonly IUsuarioRepository     _usuarioRepo;
    private readonly IProfesionalRepository _profesionalRepo;
    private readonly IPasswordHelper        _passwordHelper;
    private readonly ITokenHelper           _tokenHelper;
    private readonly IEmailHelper           _emailHelper;
    private readonly IArchivoHelper         _archivoHelper;
    private readonly IMapper                _mapper;

    public RegistroController(
        IUsuarioRepository     usuarioRepo,
        IProfesionalRepository profesionalRepo,
        IPasswordHelper        passwordHelper,
        ITokenHelper           tokenHelper,
        IEmailHelper           emailHelper,
        IArchivoHelper         archivoHelper,
        IMapper                mapper)
    {
        _usuarioRepo     = usuarioRepo;
        _profesionalRepo = profesionalRepo;
        _passwordHelper  = passwordHelper;
        _tokenHelper     = tokenHelper;
        _emailHelper     = emailHelper;
        _archivoHelper   = archivoHelper;
        _mapper          = mapper;
    }

    [HttpGet]
    public IActionResult SeleccionPerfil() => View();

    [HttpGet]
    public IActionResult RegistroUsuario() => View();

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RegistroUsuario(RegistroUsuarioViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        var token = _tokenHelper.GenerarToken();
        var dto   = _mapper.Map<RegistroUsuarioDto>(vm);
        dto.TokenActivacion = token;

        var resultado = await _usuarioRepo.RegistrarAsync(dto);
        if (!resultado.Exito)
        {
            ModelState.AddModelError("", resultado.Mensaje);
            return View(vm);
        }

        await _emailHelper.EnviarActivacionAsync(vm.Correo, token);
        TempData["Mensaje"] = RegistroConstant.RegistroExitoso;
        return RedirectToAction(nameof(SeleccionPerfil));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RegistroProfesional(RegistroProfesionalViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        if (!_archivoHelper.EsPdfValido(vm.CedulaPdf) || !_archivoHelper.EsPdfValido(vm.TarjetaPdf))
        {
            ModelState.AddModelError("", RegistroConstant.ArchivoPdfRequerido);
            return View(vm);
        }

        var token = _tokenHelper.GenerarToken();
        var dto   = _mapper.Map<RegistroProfesionalDto>(vm);
        dto.TokenActivacion = token;

        var resultado = await _profesionalRepo.RegistrarAsync(dto);
        if (!resultado.Exito)
        {
            ModelState.AddModelError("", resultado.Mensaje);
            return View(vm);
        }

        // Guardar PDFs después de obtener el ProfesionalId
        dto.RutaCedulaPdf  = await _archivoHelper.GuardarPdfAsync(vm.CedulaPdf,  resultado.Datos, "cedula");
        dto.RutaTarjetaPdf = await _archivoHelper.GuardarPdfAsync(vm.TarjetaPdf, resultado.Datos, "tarjeta");

        await _emailHelper.EnviarActivacionAsync(vm.Correo, token);
        TempData["Mensaje"] = RegistroConstant.RegistroProfesionalOk;
        return RedirectToAction(nameof(SeleccionPerfil));
    }

    // GET /Registro/ActivarCuenta?token=...
    [HttpGet]
    public IActionResult ActivarCuenta(string token)
        => View(new ActivarCuentaViewModel { Token = token });

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ActivarCuenta(ActivarCuentaViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        var passwordHash = _passwordHelper.HashPassword(vm.Password);
        var resultado    = await _usuarioRepo.ActivarAsync(vm.Token, passwordHash);

        if (!resultado.Exito)
        {
            ModelState.AddModelError("", resultado.Mensaje);
            return View(vm);
        }

        TempData["Mensaje"] = RegistroConstant.CuentaActivada;
        return RedirectToAction("Index", "Login");
    }
}
```

---

## 9. Autenticación y Seguridad

### 9.1 Configuración de Cookie — Program.cs

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// ── Autenticación por cookie ──────────────────────────────────────────
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath          = "/Login";
        options.LogoutPath         = "/Login/Logout";
        options.AccessDeniedPath   = "/Login";
        options.ExpireTimeSpan     = TimeSpan.FromHours(8);
        options.SlidingExpiration  = true;
        options.Cookie.HttpOnly    = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.SameSite    = SameSiteMode.Strict;
        options.Cookie.Name        = "trebol_auth";
    });

// ── Sin caché en páginas protegidas (Back button post-logout) ─────────
builder.Services.AddControllersWithViews(options =>
    options.Filters.Add(new ResponseCacheAttribute
    {
        NoStore  = true,
        Location = ResponseCacheLocation.None
    }));

// ── Dependencias (Helpers + Infrastructure + AutoMapper) ──────────────
builder.Services.DependencyInjection(builder.Configuration);

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Landing}/{action=Index}/{id?}");

app.Run();
```

### 9.2 Flujo de Login

```csharp
// Web/Controllers/LoginController.cs
namespace Trebol.Web.Controllers;

public class LoginController : Controller
{
    private readonly IUsuarioRepository     _usuarioRepo;
    private readonly IProfesionalRepository _profesionalRepo;
    private readonly IAdministradorRepository _adminRepo;
    private readonly IPasswordHelper        _passwordHelper;

    public LoginController(
        IUsuarioRepository       usuarioRepo,
        IProfesionalRepository   profesionalRepo,
        IAdministradorRepository adminRepo,
        IPasswordHelper          passwordHelper)
    {
        _usuarioRepo     = usuarioRepo;
        _profesionalRepo = profesionalRepo;
        _adminRepo       = adminRepo;
        _passwordHelper  = passwordHelper;
    }

    [HttpGet]
    public IActionResult Index()
    {
        if (User.Identity?.IsAuthenticated == true)
            return RedirectByRole();
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Index(LoginViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        // 1. Buscar entidad por correo (usuario, profesional o admin)
        // 2. Verificar password con Argon2 (PasswordHelper.VerifyPassword)
        // 3. Verificar estado de la cuenta
        // La validación real ocurre en sp_ValidarLogin — devuelve EntidadId + TipoEntidad

        // Llamar SP centralizado de login
        await using var connection = new SqlConnection(/* connection string */);
        var parameters = new DynamicParameters();
        parameters.Add("@Correo",      vm.Correo);
        parameters.Add("@EntidadId",   dbType: DbType.Int32,  direction: ParameterDirection.Output);
        parameters.Add("@TipoEntidad", dbType: DbType.String, size: 20,  direction: ParameterDirection.Output);
        parameters.Add("@PasswordHash",dbType: DbType.String, size: 500, direction: ParameterDirection.Output);
        parameters.Add("@Resultado",   dbType: DbType.String, size: 100, direction: ParameterDirection.Output);

        await connection.ExecuteAsync("sp_ObtenerCredenciales", parameters,
            commandType: CommandType.StoredProcedure);

        var resultado    = parameters.Get<string>("@Resultado");
        var storedHash   = parameters.Get<string>("@PasswordHash");
        var tipoEntidad  = parameters.Get<string>("@TipoEntidad");
        var entidadId    = parameters.Get<int>("@EntidadId");

        // Verificar password con Argon2
        if (resultado != "OK" || !_passwordHelper.VerifyPassword(vm.Password, storedHash))
        {
            ModelState.AddModelError("", AuthConstant.CredencialesInvalidas);
            return View(vm);
        }

        // Emitir cookie con claims de rol
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, entidadId.ToString()),
            new(ClaimTypes.Email,          vm.Correo),
            new(ClaimTypes.Role,           tipoEntidad)   // "Usuario", "Profesional", "Admin"
        };

        var identity  = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme, principal);

        // Redirigir por rol
        return tipoEntidad switch
        {
            "Usuario"      => RedirectToAction("Index", "HomeUsuario"),
            "Profesional"  => RedirectToAction("Index", "HomeProfesional"),
            "Admin"        => RedirectToAction("BandejaNotificaciones", "Admin"),
            _              => RedirectToAction("Index", "Landing")
        };
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Index", "Login");
    }

    private IActionResult RedirectByRole()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        return role switch
        {
            "Usuario"     => RedirectToAction("Index", "HomeUsuario"),
            "Profesional" => RedirectToAction("Index", "HomeProfesional"),
            "Admin"       => RedirectToAction("BandejaNotificaciones", "Admin"),
            _             => RedirectToAction("Index", "Landing")
        };
    }
}
```

### 9.3 Claims en la Cookie

| Claim | Valor | Descripción |
|---|---|---|
| `ClaimTypes.NameIdentifier` | `EntidadId` | `UsuarioId` / `ProfesionalId` / `AdministradorId` |
| `ClaimTypes.Email` | `Correo` | Dirección de correo del autenticado |
| `ClaimTypes.Role` | `"Usuario"` / `"Profesional"` / `"Admin"` | Rol para autorización |

### 9.4 Privacidad en Citas

- El profesional **nunca** ve el nombre real del paciente en la sala privada ni en la mensajería.
- Se muestra únicamente el **alias** del usuario.
- Esta restricción se aplica **a nivel de query** en `CitaRepository` y `MensajeriaRepository` — los Stored Procedures devuelven el alias en lugar del nombre completo.

---

## 10. DependencyContainer

```csharp
// Web/DependencyContainer/DependencyContainer.cs
namespace Trebol.Web.DependencyContainer;

public static class DependencyContainer
{
    public static IServiceCollection DependencyInjection(
        this IServiceCollection services,
        IConfiguration          configuration)
    {
        // ── Capa Infrastructure (repositorios + DbContext) ────────────
        services.AddInfrastructure(configuration);

        // ── Capa Helpers ──────────────────────────────────────────────
        services.AddHelpers();

        // ── AutoMapper ────────────────────────────────────────────────
        services.AddAutoMapper(typeof(TrebolAutoMapperProfile));

        // ── HttpContextAccessor (para acceder a User en helpers) ─────
        services.AddHttpContextAccessor();

        return services;
    }
}
```

### 10.1 TrebolAutoMapperProfile

```csharp
// Web/AutoMapper/TrebolAutoMapperProfile.cs
namespace Trebol.Web.AutoMapper;

public sealed class TrebolAutoMapperProfile : Profile
{
    public TrebolAutoMapperProfile()
    {
        // Auth
        CreateMap<RegistroUsuarioViewModel,    RegistroUsuarioDto>();
        CreateMap<RegistroProfesionalViewModel, RegistroProfesionalDto>()
            .ForMember(d => d.CedulaPdf,  opt => opt.Ignore())   // IFormFile no se mapea
            .ForMember(d => d.TarjetaPdf, opt => opt.Ignore());
        CreateMap<ActivarCuentaViewModel,      ActivarCuentaDto>();

        // Citas
        CreateMap<NuevaCitaViewModel, CrearCitaDto>();
        CreateMap<IReadOnlyList<CitaListaDto>, CitasUsuarioViewModel>()
            .ForMember(d => d.Citas, opt => opt.MapFrom(s => s));
        CreateMap<IReadOnlyList<CitaListaDto>, CitasProfesionalViewModel>()
            .ForMember(d => d.Citas, opt => opt.MapFrom(s => s));

        // Salas
        CreateMap<CrearSalaDto, MisEventosViewModel>().ReverseMap();

        // Mensajería
        CreateMap<EnviarMensajeViewModel, MensajePrivadoDto>();

        // Perfil usuario
        CreateMap<PerfilUsuarioViewModel, ActualizarUsuarioDto>().ReverseMap();
        CreateMap<Usuario, PerfilUsuarioViewModel>();

        // Perfil profesional
        CreateMap<InfoProfesionalViewModel, ActualizarProfesionalDto>().ReverseMap();
        CreateMap<Profesional, InfoProfesionalViewModel>();

        // Directorio
        CreateMap<FiltroDirectorioViewModel, FiltroDirectorioDto>();
        CreateMap<ProfesionalDirectorioDto,  DirectorioViewModel>();

        // Inscripción
        CreateMap<Paso2ViewModel, CrearInscripcionDto>();
        CreateMap<Paso3ViewModel, ConfirmarPagoDto>();

        // Dashboard
        CreateMap<DashboardUsuarioDto,      HomeUsuarioViewModel>();
        CreateMap<DashboardProfesionalDto,  HomeProfesionalViewModel>();

        // Admin
        CreateMap<NotificacionDto, BandejaViewModel>();
    }
}
```

---

## 11. Reglas de Código Transversales

### 11.1 Controllers — Thin Controllers

Los controllers **no contienen lógica de negocio**. Su responsabilidad es:

1. Validar `ModelState`
2. Extraer el `Id` del usuario/profesional autenticado desde los claims
3. Llamar al repositorio correspondiente
4. Mapear resultado a ViewModel
5. Retornar `View()`, `RedirectToAction()` o `Json()`

```csharp
// ✅ CORRECTO — Controller delgado
public async Task<IActionResult> Index()
{
    var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var datos     = await _homeRepo.ObtenerDashboardAsync(usuarioId);
    var vm        = _mapper.Map<HomeUsuarioViewModel>(datos);
    return View(vm);
}

// ❌ INCORRECTO — Lógica de negocio en controller
public async Task<IActionResult> Index()
{
    var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var citas     = await _context.Citas.Where(c => c.UsuarioId == usuarioId).ToListAsync();
    var proximas  = citas.Where(c => c.FechaHora > DateTime.Now && c.Estado == "Programada");
    // ... más lógica ...
}
```

### 11.2 Mensajes — Solo desde Constants

```csharp
// ✅ CORRECTO
return Json(new { exito = true, mensaje = CitaConstant.CitaCancelada });

// ❌ INCORRECTO
return Json(new { exito = true, mensaje = "La cita fue cancelada." });
```

### 11.3 Contraseñas — Solo IPasswordHelper

```csharp
// ✅ CORRECTO — En LoginController
var esValido = _passwordHelper.VerifyPassword(vm.Password, storedHash);

// ❌ INCORRECTO — Nunca directamente
var hash = SHA256.HashData(Encoding.UTF8.GetBytes(vm.Password));
```

### 11.4 Alias de Paciente — Privacidad Clínica

```csharp
// ✅ CORRECTO — El SP devuelve alias, nunca nombre real
// sp_ObtenerCitasProfesional → campo: PacienteAlias (NUNCA PacienteNombre)

// ❌ INCORRECTO — No exponer nombre real en salas privadas o mensajería
SELECT u.NombreCompleto AS Paciente -- PROHIBIDO en queries del profesional
```

### 11.5 Paginación

```csharp
// Todos los listados usan PaginacionConstant.TamanioDefecto = 10
// Aplicar en SP con OFFSET/FETCH NEXT o en EF Core con .Skip().Take()
var resultado = await _repo.ObtenerPorUsuarioAsync(usuarioId, estado, pagina);
// pagina = número de página (1-based)
// TamanioPagina = PaginacionConstant.TamanioDefecto (10)
```

### 11.6 Formato de Fechas y Horas

| Tipo | Formato | Ejemplo |
|---|---|---|
| Fecha | `DD MMM YYYY` | `16 May 2026` |
| Hora | 12H sin minutos si es en punto | `3PM`, `10AM` |
| Hora con minutos | 12H con minutos | `3:30PM`, `10:15AM` |
| Fecha + hora | `DD MMM YYYY · HH:MMam/pm` | `16 May 2026 · 3:30PM` |

### 11.7 Confirmaciones — Siempre Modal

Todos los mensajes de confirmación, error o éxito se muestran usando el componente `_Modal.cshtml`.
**Nunca** usar `alert()` nativo del navegador.

```cshtml
<!-- ✅ CORRECTO — modal reutilizable -->
@await Html.PartialAsync("_Modal", new ModalViewModel { Mensaje = TempData["Mensaje"]?.ToString() })

<!-- ❌ INCORRECTO -->
<script>alert('Operación exitosa');</script>
```

### 11.8 Resumen de Reglas EF Core

| Regla | Descripción |
|---|---|
| `.AsNoTracking()` | En **todas** las consultas de solo lectura |
| `.OnDelete(DeleteBehavior.Restrict)` | En **todas** las FKs — nunca Cascade |
| Proyecciones | Usar `.Select(x => new Dto { ... })` en listados |
| `.Include()` | Solo cuando se necesitan navegaciones completas (perfil detallado) |
| `CancellationToken` | Pasado a **todos** los métodos `async` |
| Stored Procedures | Para operaciones con múltiples tablas o reglas de negocio complejas |

---

## 12. Configuración de appsettings.json

```json
{
  "ConnectionStrings": {
    "TrebolDB": "Server=.\\SQLEXPRESS;Database=TrebolDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Email": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "Usuario": "noreply@trebol.com",
    "Password": "",
    "NombreRemitente": "Trébol Salud Mental"
  },
  "Plataforma": {
    "TarifaFijaCitaCOP": 5000,
    "DiasValidezTokenActivacion": 7,
    "DiasValidezTokenRecuperacion": 1
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

---

## 13. Resumen de Páginas del Prototipo ↔ Controllers

| Prototipo HTML | Controller → Acción | Rol |
|---|---|---|
| `index.html` | `LandingController.Index` | Público |
| `login.html` | `LoginController.Index` | Público |
| `registro-seleccion.html` | `RegistroController.SeleccionPerfil` | Público |
| `registro-usuario.html` | `RegistroController.RegistroUsuario` | Público |
| `registro-profesional.html` | `RegistroController.RegistroProfesional` | Público |
| `home-usuario.html` | `HomeUsuarioController.Index` | Usuario |
| `home-profesional.html` | `HomeProfesionalController.Index` | Profesional |
| `calendario-usuario.html` | `CalendarioController.Index` | Usuario |
| `citas-usuario.html` | `CitasController.Index` | Usuario |
| `citas-profesional.html` | `CitasController.ListaProfesional` | Profesional |
| `sala-usuario.html` | `SalasController.SalaPrivadaUsuario` | Usuario |
| `sala-profesional.html` | `SalasController.SalaPrivadaProfesional` | Profesional |
| `sala-conferencia-usuario.html` | `SalasController.SalaConferenciaUsuario` | Usuario |
| `sala-conferencia-profesional.html` | `SalasController.SalaConferenciaProfesional` | Profesional |
| `pago-cita.html` | `PagoCitaController.Index` | Usuario |
| `inscripcion-pago.html` | `InscripcionController.Paso1` → `Paso2` → `Paso3` | Usuario |
| `mensajes-usuario.html` | `MensajeriaController.IndexUsuario` | Usuario |
| `mensajes-profesional.html` | `MensajeriaController.IndexProfesional` | Profesional |
| `perfil-usuario.html` | `PerfilUsuarioController.Index` | Usuario |
| `perfil-profesional.html` | `PerfilProfesionalController.Info` | Profesional |
| `perfil-pro-salas.html` | `PerfilProfesionalController.Salas` | Profesional |
| `perfil-pro-calendario.html` | `PerfilProfesionalController.Calendario` | Profesional |
| `perfil-pro-citas.html` | `PerfilProfesionalController.Citas` | Profesional |
| `perfil-pro-kpi.html` | `PerfilProfesionalController.Indicadores` | Profesional |
| `perfil-orador.html` | `PerfilOradorController.Cuenta` | Público / Usuario |
| `orador-salas.html` | `PerfilOradorController.Salas` | Público / Usuario |
| `orador-comentarios.html` | `PerfilOradorController.Comentarios` | Público / Usuario |
| `orador-calendario.html` | `PerfilOradorController.Calendario` | Usuario |
| `mis-eventos.html` | `MisEventosController.Index` | Profesional |
| `especialistas.html` | `DirectorioController.Especialistas` | Usuario |
| `psicologos.html` | `DirectorioController.Psicologos` | Usuario |
| `mis-mentores.html` | `DirectorioController.MisMentores` | Usuario |
| `mis-colegas.html` | `DirectorioController.MisColegas` | Profesional |
| `bandeja-notificaciones.html` | `AdminController.BandejaNotificaciones` | Admin |

---

*Documento refinado v3 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

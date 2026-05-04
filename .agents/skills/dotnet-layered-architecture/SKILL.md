---
name: dotnet-layered-architecture
description: >
  Aplica convenciones de arquitectura en capas para proyectos ASP.NET Core MVC con C#.
  Usalo cuando diseñes la estructura del proyecto, crees controllers, services, repositories,
  helpers, constants, mappers, cookies de sesion o cualquier clase del backend.
  El nombre de la aplicacion es Trebol.
applyTo: "**/*.cs,**/*.csproj,**/*.sln"
---

# Arquitectura en Capas – ASP.NET Core MVC (.NET 10) — Aplicacion: Trebol

Guia de convenciones y patrones para proyectos C# con arquitectura en capas sobre ASP.NET Core MVC.

## Estructura de Proyectos (Solucion)

```
Trebol.sln
├── Trebol.Web/                        ← Capa de Presentacion (MVC)
│   ├── Controllers/
│   ├── Views/
│   ├── ViewModels/
│   ├── AutoMapper/
│   │   └── AutoMapperTrebol.cs        ← Perfil unico de AutoMapper
│   ├── DependencyContainer/
│   │   └── DependencyContainer.cs     ← Punto unico de registro de dependencias
│   └── wwwroot/
├── Trebol.Application/                ← Capa de Aplicacion (logica de negocio)
│   ├── Services/
│   ├── Interfaces/
│   └── AccessDependency/
│       └── ApplicationAccessDependency.cs
├── Trebol.Models/                     ← Capa de Modelos (DTOs, entidades, enums)
│   ├── DTOs/
│   │   ├── Paciente/
│   │   │   ├── PacienteDto.cs
│   │   │   ├── PacienteListaDto.cs
│   │   │   ├── CrearPacienteDto.cs
│   │   │   └── EditarPacienteDto.cs
│   │   ├── Sesion/
│   │   │   ├── SesionDto.cs
│   │   │   └── CrearSesionDto.cs
│   │   ├── Dashboard/
│   │   └── Cuenta/
│   │       ├── UsuarioSesionDto.cs
│   │       └── LoginDto.cs
│   ├── Entities/
│   │   └── TrebolEntities/            ← Carpeta nombrada: {NombreProyecto}Entities
│   │       ├── AppDbContext.cs
│   │       ├── Configurations/
│   │       │   ├── PacienteConfiguration.cs
│   │       │   └── SesionConfiguration.cs
│   │       ├── Paciente.cs
│   │       └── Sesion.cs
│   ├── Models/
│   │   ├── ResultadoOperacion.cs
│   │   └── PaginacionModel.cs
│   └── Enums/
│       ├── EstadoPaciente.cs
│       ├── RolUsuario.cs
│       └── TipoSesion.cs
├── Trebol.Domain/                     ← Capa de Dominio (solo interfaces de repositorio)
│   └── Interfaces/
│       ├── IPacienteRepository.cs
│       └── ISesionRepository.cs
├── Trebol.Infrastructure/             ← Capa de Infraestructura (repositorios, migraciones)
│   ├── Repositories/
│   ├── Migrations/
│   └── AccessDependency/
│       └── InfrastructureAccessDependency.cs
├── Trebol.Helpers/                    ← Capa de Helpers (utilidades reutilizables)
│   ├── Email/
│   │   ├── IEmailHelper.cs
│   │   └── EmailHelper.cs
│   ├── Security/
│   │   ├── ICodigoHelper.cs
│   │   ├── CodigoGeneradorHelper.cs
│   │   └── PasswordHelper.cs
│   └── AccessDependency/
│       └── HelperAccessDependency.cs
└── Trebol.Constants/                  ← Capa de Constantes (mensajes, sin dependencias)
    └── Messages/
        ├── InicioSesionConstant.cs
        ├── PacienteConstant.cs
        └── EmailConstant.cs
```

---

## Trebol.Models ← capa central de modelos

- Referenciado por **todas** las capas. Unica fuente de verdad para entidades, DTOs, enums y modelos.
- Tiene package reference a `Microsoft.EntityFrameworkCore.SqlServer`.
- **No** referencia Application, Infrastructure, Web ni Domain.
- Carpeta de entidades se nombra **`TrebolEntities`** (sin punto ni espacio).

```csharp
// Models/Enums/EstadoPaciente.cs
public enum EstadoPaciente { Activo, Inactivo }

// Models/Enums/RolUsuario.cs
public enum RolUsuario { Administrador, Psicologo, Recepcionista }

// Models/Enums/TipoSesion.cs
public enum TipoSesion { Individual, Grupal, Virtual }

// Models/Models/ResultadoOperacion.cs
public class ResultadoOperacion
{
    public bool   Exito   { get; init; }
    public string Mensaje { get; init; } = string.Empty;
    public static ResultadoOperacion Ok(string mensaje = "")  => new() { Exito = true,  Mensaje = mensaje };
    public static ResultadoOperacion Fail(string mensaje)     => new() { Exito = false, Mensaje = mensaje };
}

public class ResultadoOperacion<T> : ResultadoOperacion
{
    public T? Datos { get; init; }
    public static ResultadoOperacion<T> Ok(T datos, string mensaje = "")
        => new() { Exito = true, Datos = datos, Mensaje = mensaje };
}

// Models/Models/PaginacionModel.cs
public class PaginacionModel
{
    public int Pagina        { get; set; } = 1;
    public int TamanioPagina { get; set; } = 10;
    public static readonly int[] OpcionesTamanio = [10, 25, 50, 100];
}
```

---

## Trebol.Domain

- Contiene **unicamente interfaces de repositorio**. Las entidades viven en Trebol.Models.
- Referencia Trebol.Models. **No** contiene logica ni implementaciones.

```csharp
// Domain/Interfaces/IPacienteRepository.cs
public interface IPacienteRepository
{
    Task<Paciente?> ObtenerPorIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Paciente>> ObtenerActivosAsync(CancellationToken ct = default);
    void Agregar(Paciente paciente);
    void Actualizar(Paciente paciente);
    Task<int> GuardarCambiosAsync(CancellationToken ct = default);
}
```

---

## Trebol.Constants

- Sin dependencias externas. Solo `string const`.
- **Regla:** todo mensaje visible al usuario debe venir de una clase Constant. Nunca strings hardcodeados en controllers o services.

```csharp
// Constants/Messages/InicioSesionConstant.cs
public static class InicioSesionConstant
{
    public const string UsuarioIncorrecto = "Datos incorrectos";
    public const string UsuarioInactivo   = "La cuenta no se ha activado";
    public const string UsuarioBienvenido = "Bienvenid@ a Trebol.";
    public const string SesionExpirada    = "Tu sesion ha expirado. Por favor inicia sesion nuevamente.";
    public const string AccesoDenegado    = "No tienes permisos para acceder a esta seccion.";
}

// Constants/Messages/PacienteConstant.cs
public static class PacienteConstant
{
    public const string DocumentoDuplicado   = "Ya existe un paciente registrado con ese documento.";
    public const string PacienteNoEncontrado = "El paciente no fue encontrado.";
    public const string PacienteDesactivado  = "El paciente fue desactivado exitosamente.";
    public const string PacienteCreado       = "El paciente fue registrado exitosamente.";
    public const string PacienteActualizado  = "El paciente fue actualizado exitosamente.";
}

// Constants/Messages/EmailConstant.cs
public static class EmailConstant
{
    #region RESTABLECER CONTRASENA
    public const string AsuntoRestablecerContrasena = "Restablecer Contrasena – Trebol";
    public const string CuerpoRestablecerContrasena = @"
        <p>Estimado usuario,</p>
        <p>Utilice el siguiente codigo para restablecer su contrasena en <strong>Trebol</strong>:</p>
        <h2 style='color: #1e3a8a;'>{codigo}</h2>
        <p><strong>Vigencia: 1 hora.</strong> Si no solicito este cambio, ignore este mensaje.</p>
        <p>Atentamente,<br/><strong>Equipo Trebol</strong></p>";
    #endregion

    #region CREAR USUARIO
    public const string AsuntoUsuarioNuevo = "Bienvenid@ a Trebol";
    public const string CuerpoCrearUsuario = @"
        <p>Tu cuenta en <strong>Trebol</strong> ha sido creada exitosamente.</p>
        <ul>
          <li><strong>Correo:</strong> {correo}</li>
          <li><strong>Contrasena temporal:</strong> {contrasenaTemp}</li>
        </ul>
        <p>Debes cambiar tu contrasena al iniciar sesion por primera vez.</p>
        <p>Atentamente,<br/><strong>Equipo Trebol</strong></p>";
    #endregion
}
```

---

## Trebol.Helpers

Cada helper tiene su interfaz para inyeccion de dependencias y testing. Registrar en `HelperAccessDependency`.

```csharp
// Helpers/Email/IEmailHelper.cs
public interface IEmailHelper
{
    Task EnviarCorreoAsync(string destinatario, string asunto, string cuerpo);
    Task EnviarCorreoConCodigoAsync(string destinatario, string asunto, string plantilla, string codigo);
    Task EnviarCorreoNuevoUsuarioAsync(string destinatario, string asunto, string plantilla, string correo, string contrasenaTemp);
}

// Helpers/Email/EmailHelper.cs
// Configurar en appsettings.json:
// "Email": { "Host": "smtp.proveedor.com", "Port": "587", "Remitente": "noreply@trebol.com", "Contrasena": "" }
public class EmailHelper(IConfiguration config) : IEmailHelper
{
    private SmtpClient CrearCliente() => new()
    {
        Host                  = config["Email:Host"]!,
        Port                  = int.Parse(config["Email:Port"]!),
        EnableSsl             = true,
        UseDefaultCredentials = false,
        Credentials           = new NetworkCredential(config["Email:Remitente"], config["Email:Contrasena"])
    };

    public async Task EnviarCorreoAsync(string destinatario, string asunto, string cuerpo)
    {
        using var smtp = CrearCliente();
        using var msg  = new MailMessage(config["Email:Remitente"]!, destinatario)
            { Subject = asunto, Body = cuerpo, IsBodyHtml = true };
        await smtp.SendMailAsync(msg);
    }

    public async Task EnviarCorreoConCodigoAsync(string destinatario, string asunto, string plantilla, string codigo)
        => await EnviarCorreoAsync(destinatario, asunto, plantilla.Replace("{codigo}", codigo));

    public async Task EnviarCorreoNuevoUsuarioAsync(string destinatario, string asunto, string plantilla, string correo, string contrasenaTemp)
        => await EnviarCorreoAsync(destinatario, asunto,
            plantilla.Replace("{correo}", correo).Replace("{contrasenaTemp}", contrasenaTemp));
}

// Helpers/Security/PasswordHelper.cs  (clase estatica, no necesita interfaz)
public static class PasswordHelper
{
    private const int Iteraciones = 10000;
    private const int TamanioHash = 32; // 256 bits

    /// <summary>Genera hash + salt con PBKDF2/SHA-256. Almacenar ambos en BD como VARBINARY(64).</summary>
    public static (byte[] Hash, byte[] Salt) CrearHash(string password)
    {
        byte[] salt = new byte[16];
        using (var rng = RandomNumberGenerator.Create()) rng.GetBytes(salt);
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iteraciones, HashAlgorithmName.SHA256);
        return (pbkdf2.GetBytes(TamanioHash), salt);
    }

    public static bool VerificarPassword(string password, byte[] hashGuardado, byte[] saltGuardado)
    {
        using var pbkdf2 = new Rfc2898DeriveBytes(password, saltGuardado, Iteraciones, HashAlgorithmName.SHA256);
        return pbkdf2.GetBytes(TamanioHash).SequenceEqual(hashGuardado);
    }

    public static string GenerarContrasenaTemp(int longitud = 10)
    {
        const string chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#";
        var random = RandomNumberGenerator.GetBytes(longitud);
        return new string(random.Select(b => chars[b % chars.Length]).ToArray());
    }
}

// Helpers/Security/ICodigoHelper.cs
public interface ICodigoHelper { string GenerarCodigoUnico(); }

// Helpers/Security/CodigoGeneradorHelper.cs
public class CodigoGeneradorHelper : ICodigoHelper
{
    public string GenerarCodigoUnico()
    {
        BigInteger bigInt = new BigInteger(Guid.NewGuid().ToByteArray());
        if (bigInt < 0) bigInt = -bigInt;
        return Base36Encode(bigInt)[..8].ToUpper();
    }
    private static string Base36Encode(BigInteger value)
    {
        const string C = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var sb = new System.Text.StringBuilder();
        do { sb.Insert(0, C[(int)(value % 36)]); value /= 36; } while (value > 0);
        return sb.ToString();
    }
}

// Helpers/AccessDependency/HelperAccessDependency.cs
public static class HelperAccessDependency
{
    public static IServiceCollection AddHelpers(this IServiceCollection services)
    {
        services.AddScoped<IEmailHelper, EmailHelper>();
        services.AddScoped<ICodigoHelper, CodigoGeneradorHelper>();
        return services;
    }
}
```

> **Seguridad:** nunca MD5/SHA1 para contrasenas. Almacenar Hash y Salt en columnas `VARBINARY(64)` separadas.

---

## Trebol.Application

- Services orquestan logica de negocio; reciben y devuelven DTOs de `Trebol.Models/DTOs/`.
- **Nunca** exponen entidades hacia la capa Web.
- Referencia: Trebol.Domain + Trebol.Models + Trebol.Helpers + Trebol.Constants.

```csharp
// Application/AccessDependency/ApplicationAccessDependency.cs
public static class ApplicationAccessDependency
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IPacienteService, PacienteService>();
        services.AddScoped<IUsuarioService, UsuarioService>();
        services.AddScoped<ISesionService, SesionService>();
        return services;
    }
}
```

---

## Trebol.Infrastructure

- **No** contiene `AppDbContext.cs` ni configuraciones → viven en `Trebol.Models/Entities/TrebolEntities/`.
- Solo contiene repositorios, migraciones y su AccessDependency.
- Referencia: Trebol.Domain + Trebol.Models.

```csharp
// Infrastructure/AccessDependency/InfrastructureAccessDependency.cs
public static class InfrastructureAccessDependency
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("Default"),
                sql => sql.MigrationsAssembly("Trebol.Infrastructure")));

        services.AddScoped<IPacienteRepository, PacienteRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ISesionRepository, SesionRepository>();
        return services;
    }
}
```

Scaffold de entidades desde BD existente (destino: `Trebol.Models/Entities/TrebolEntities`):

```bash
dotnet ef dbcontext scaffold \
  "Server=SERVIDOR\SQLEXPRESS;Database=Trebol;Trusted_Connection=True;TrustServerCertificate=True;" \
  Microsoft.EntityFrameworkCore.SqlServer \
  -o Entities/TrebolEntities \
  --context AppDbContext \
  --force \
  --project "ruta\Trebol.Models\Trebol.Models.csproj" \
  --startup-project "ruta\Trebol.Web\Trebol.Web.csproj"
```

> Namespace de `AppDbContext.cs` tras scaffold: `Trebol.Models.Entities.TrebolEntities`
> Crear carpeta `Entities/TrebolEntities/Configurations/` y colocar los `IEntityTypeConfiguration<T>` alli.

---

## Trebol.Web — Controllers (delgados)

```csharp
// Web/Controllers/PacienteController.cs
[Authorize]
public class PacienteController(IPacienteService pacienteService) : Controller
{
    public async Task<IActionResult> Index()
        => View(await pacienteService.ObtenerTodosAsync());

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Crear(CrearPacienteViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);
        await pacienteService.CrearAsync(vm.ToDto());
        TempData["Exito"] = PacienteConstant.PacienteCreado;
        return RedirectToAction(nameof(Index));
    }
}
```

### ViewModels con DataAnnotations e IValidatableObject

```csharp
// Web/ViewModels/Paciente/CrearPacienteViewModel.cs
public class CrearPacienteViewModel : IValidatableObject
{
    [Required(ErrorMessage = "El nombre completo es obligatorio.")]
    [MaxLength(200)]
    public string NombreCompleto { get; set; } = string.Empty;

    [Required(ErrorMessage = "El documento es obligatorio.")]
    [RegularExpression(@"^\d{6,12}$", ErrorMessage = "El documento debe tener entre 6 y 12 digitos.")]
    public string Documento { get; set; } = string.Empty;

    [Required(ErrorMessage = "La fecha de nacimiento es obligatoria.")]
    [DataType(DataType.Date)]
    public DateOnly FechaNacimiento { get; set; }

    [Required(ErrorMessage = "El tipo de sesion es obligatorio.")]
    public TipoSesion TipoSesion { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (FechaNacimiento > DateOnly.FromDateTime(DateTime.Today))
            yield return new ValidationResult(
                "La fecha de nacimiento no puede ser futura.",
                [nameof(FechaNacimiento)]);
    }
}
```

### Cookies de Sesion (Autenticacion segura)

```csharp
// Web/Controllers/CuentaController.cs
public class CuentaController(IUsuarioService usuarioService) : Controller
{
    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        var usuario = await usuarioService.ValidarCredencialesAsync(vm.Correo, vm.Password);
        if (usuario is null)
        {
            ModelState.AddModelError(string.Empty, InicioSesionConstant.UsuarioIncorrecto);
            return View(vm);
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(ClaimTypes.Email,          usuario.Correo),
            new(ClaimTypes.Role,           usuario.Rol.ToString())
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)),
            new AuthenticationProperties { IsPersistent = false, ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(30) });

        return RedirectToAction("Index", "Dashboard");
    }

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        Response.Headers.CacheControl = "no-cache, no-store, must-revalidate";
        Response.Headers.Pragma       = "no-cache";
        Response.Headers.Expires      = "0";
        return RedirectToAction("Login");
    }
}
```

Configuracion de cookies en `Program.cs`:

```csharp
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath         = "/Cuenta/Login";
        options.LogoutPath        = "/Cuenta/Logout";
        options.AccessDeniedPath  = "/Cuenta/Acceso-Denegado";
        options.ExpireTimeSpan    = TimeSpan.FromMinutes(30);
        options.SlidingExpiration = true;
        options.Cookie.HttpOnly   = true;                          // Mitiga XSS
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;  // Solo HTTPS
        options.Cookie.SameSite   = SameSiteMode.Strict;          // Mitiga CSRF
    });

// Evitar cache de paginas protegidas (boton Atras no muestra contenido tras logout)
builder.Services.AddControllersWithViews(options =>
    options.Filters.Add(new ResponseCacheAttribute { NoStore = true, Location = ResponseCacheLocation.None }));
```

---

## DependencyContainer — Punto unico de registro

```csharp
// Web/DependencyContainer/DependencyContainer.cs
public static class DependencyContainer
{
    public static IServiceCollection DependencyInjection(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddInfrastructure(configuration);   // EF Core + repositorios
        services.AddApplication();                   // services de negocio
        services.AddHelpers();                       // Email, Password, Codigo
        services.AddAutoMapper(typeof(AutoMapperTrebol));

        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.LoginPath         = "/Cuenta/Login";
                options.LogoutPath        = "/Cuenta/Logout";
                options.AccessDeniedPath  = "/Cuenta/Acceso-Denegado";
                options.ExpireTimeSpan    = TimeSpan.FromMinutes(30);
                options.SlidingExpiration = true;
                options.Cookie.HttpOnly   = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.SameSite   = SameSiteMode.Strict;
            });

        services.AddAuthorization();
        services.AddControllersWithViews(options =>
            options.Filters.Add(new ResponseCacheAttribute
                { NoStore = true, Location = ResponseCacheLocation.None }));

        return services;
    }
}

// Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.DependencyInjection(builder.Configuration);
var app = builder.Build();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();   // ANTES de UseAuthorization
app.UseAuthorization();
app.MapDefaultControllerRoute();
app.Run();
```

---

## Convenciones de Nomenclatura

| Elemento | Convencion | Ejemplo |
|---|---|---|
| Clases | PascalCase | `PacienteService` |
| Interfaces | PascalCase con `I` prefijo | `IPacienteRepository` |
| Metodos async | PascalCase + sufijo `Async` | `ObtenerPorIdAsync` |
| Variables locales | camelCase | `pacienteDto` |
| Constantes | PascalCase | `PacienteNoEncontrado` |
| DTOs | Nombre + `Dto` | `PacienteDto`, `CrearPacienteDto` |
| ViewModels | Nombre + `ViewModel` | `CrearPacienteViewModel` |
| AutoMapper perfil | `AutoMapper` + proyecto | `AutoMapperTrebol` |
| Carpeta entidades | `{Proyecto}Entities` | `TrebolEntities` |
| Modelos resultado | Nombre + `Operacion`/`Model` | `ResultadoOperacion` |
| AccessDependency | Capa + `AccessDependency` | `HelperAccessDependency` |
| DependencyContainer | Siempre `DependencyContainer` | `DependencyContainer.cs` |
| Constants | Contexto + `Constant` | `InicioSesionConstant`, `PacienteConstant` |
| Helpers | Funcion + `Helper` | `PasswordHelper`, `EmailHelper` |

---

## Flujo de Referencias entre Capas

```
Web ---------> Application ---------> Domain
                    |                    |
                 Helpers            Infrastructure
                    |                    |
                    +--------------------+
                              |
                           Models <-------- Constants
```

| Capa | Referencia a |
|---|---|
| Constants | nadie |
| Models | solo Microsoft.EntityFrameworkCore.SqlServer |
| Helpers | Constants |
| Domain | Models |
| Application | Domain + Models + Helpers + Constants |
| Infrastructure | Domain + Models |
| Web | Application + Models + Constants (Helpers via interfaces) |

**Reglas absolutas:**
- NUNCA Infrastructure referencia Web.
- NUNCA Application referencia Infrastructure directamente.
- NUNCA ninguna capa referencia Web.

---

## Reglas Generales

- `SET NOCOUNT ON` en todos los Stored Procedures.
- Todos los metodos con BD: `async/await` con `CancellationToken`.
- Strings de conexion desde `appsettings.json` o variables de entorno. **Nunca hardcodeados.**
- Habilitar Nullable reference types: `<Nullable>enable</Nullable>` en todos los proyectos.
- Validar `ModelState.IsValid` en cada `[HttpPost]` antes de llamar al servicio.
- `[ValidateAntiForgeryToken]` en todos los formularios POST (prevencion CSRF).
- Mensajes al usuario siempre desde clases `Constant`. **Nunca strings literales en controllers.**
- Nunca exponer entidades desde Controllers; usar DTOs.
- `HttpOnly=true`, `SecurePolicy=Always`, `SameSite=Strict` en cookies (mitigacion XSS/CSRF).
- `IsPersistent=false`: sesion muere al cerrar el navegador.
- `NoStore=true` en ResponseCache: el navegador no cachea paginas protegidas tras logout.

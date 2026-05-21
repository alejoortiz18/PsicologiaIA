using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Trebol.Domain.Interfaces;
using Trebol.Domain.Interfaces.Catalogos;
using Trebol.Infrastructure.Repositories;
using Trebol.Infrastructure.Repositories.Catalogos;
using Trebol.Model.Entities.TrebolEntities;

namespace Trebol.Infrastructure.AccessDependency;

public static class InfrastructureAccessDependency
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── DbContext ─────────────────────────────────────────────────────
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("TrebolDB"),
                sql => sql.MigrationsAssembly("Trebol.Infrastructure")));

        // ── Repositorios ──────────────────────────────────────────────────
        services.AddScoped<ILoginRepository,        LoginRepository>();
        services.AddScoped<IUsuarioRepository,      UsuarioRepository>();
        services.AddScoped<IProfesionalRepository,  ProfesionalRepository>();
        services.AddScoped<ICitaRepository,         CitaRepository>();
        services.AddScoped<ISalaRepository,         SalaRepository>();
        services.AddScoped<IInscripcionRepository,  InscripcionRepository>();
        services.AddScoped<IPagoRepository,         PagoRepository>();
        services.AddScoped<IMensajeriaRepository,   MensajeriaRepository>();
        services.AddScoped<IDirectorioRepository,   DirectorioRepository>();
        services.AddScoped<ICalendarioRepository,   CalendarioRepository>();
        services.AddScoped<INotificacionRepository, NotificacionRepository>();
        services.AddScoped<ICatalogoRepository,     CatalogoRepository>();
        services.AddScoped<IConfiguracionRepository, ConfiguracionRepository>();
        services.AddScoped<ILandingRepository,         LandingRepository>();

        return services;
    }
}

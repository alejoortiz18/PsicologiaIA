using Microsoft.AspNetCore.Authentication.Cookies;
using Trebol.Helpers.AccessDependency;
using Trebol.Infrastructure.AccessDependency;
using Trebol.Web.AutoMapper;

namespace Trebol.Web.DependencyContainer;

public static class DependencyContainer
{
    public static IServiceCollection DependencyInjection(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── Infraestructura (repositorios + DbContext) ─────────────────────
        services.AddInfrastructure(configuration);

        // ── Helpers (PasswordHelper, TokenHelper, EmailHelper, ArchivoHelper)
        services.AddHelpers();

        // ── AutoMapper ────────────────────────────────────────────────────
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(TrebolAutoMapperProfile).Assembly));

        // ── Autenticación por cookie ──────────────────────────────────────
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.LoginPath          = "/Login";
                options.LogoutPath         = "/Login/Logout";
                options.AccessDeniedPath   = "/Login";
                options.ExpireTimeSpan     = TimeSpan.FromHours(
                    int.TryParse(configuration["App:SessionExpirationHours"], out var h) ? h : 8);
                options.SlidingExpiration  = true;
                options.Cookie.HttpOnly    = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.SameSite    = SameSiteMode.Strict;
            });

        // ── Sesión (para almacenar hash temporal durante activación) ──────
        services.AddSession(options =>
        {
            options.IdleTimeout        = TimeSpan.FromMinutes(30);
            options.Cookie.HttpOnly    = true;
            options.Cookie.IsEssential = true;
        });
        services.AddHttpContextAccessor();

        // ── Prevenir caché de páginas protegidas (Back button tras logout) ─
        services.AddControllersWithViews(options =>
            options.Filters.Add(new Microsoft.AspNetCore.Mvc.ResponseCacheAttribute
            {
                NoStore  = true,
                Location = Microsoft.AspNetCore.Mvc.ResponseCacheLocation.None
            }));

        return services;
    }
}

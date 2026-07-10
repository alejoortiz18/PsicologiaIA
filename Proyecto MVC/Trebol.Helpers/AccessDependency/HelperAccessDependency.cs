using Microsoft.Extensions.DependencyInjection;
using Trebol.Helpers.Archivos;
using Trebol.Helpers.Email;
using Trebol.Helpers.Security;
using Trebol.Helpers.Token;

namespace Trebol.Helpers.AccessDependency;

public static class HelperAccessDependency
{
    public static IServiceCollection AddHelpers(this IServiceCollection services)
    {
        services.AddScoped<IPasswordHelper, PasswordHelper>();
        services.AddScoped<ITokenHelper,    TokenHelper>();
        services.AddScoped<IEmailHelper,    EmailHelper>();
        services.AddScoped<IArchivoHelper,  ArchivoHelper>();
        return services;
    }
}

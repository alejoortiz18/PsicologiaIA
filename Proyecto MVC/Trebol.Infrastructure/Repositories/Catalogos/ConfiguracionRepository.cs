using Microsoft.EntityFrameworkCore;
using Trebol.Domain.Interfaces.Catalogos;
using Trebol.Model.Entities.TrebolEntities;

namespace Trebol.Infrastructure.Repositories.Catalogos;

public class ConfiguracionRepository(AppDbContext context) : IConfiguracionRepository
{
    public async Task<string?> ObtenerValorAsync(string clave, CancellationToken ct = default)
    {
        var config = await context.Configuraciones
                                  .AsNoTracking()
                                  .FirstOrDefaultAsync(c => c.Clave == clave, ct);
        return config?.Valor;
    }

    public async Task<IReadOnlyDictionary<string, string>> ObtenerTodasAsync(CancellationToken ct = default)
    {
        var configs = await context.Configuraciones.AsNoTracking().ToListAsync(ct);
        return configs.ToDictionary(c => c.Clave, c => c.Valor);
    }
}

using Microsoft.EntityFrameworkCore;
using Trebol.Domain.Interfaces.Catalogos;
using Trebol.Model.Entities.TrebolEntities;

namespace Trebol.Infrastructure.Repositories.Catalogos;

public class CatalogoRepository(AppDbContext context) : ICatalogoRepository
{
    public async Task<IReadOnlyList<Pais>> ObtenerPaisesAsync(CancellationToken ct = default)
        => await context.Paises.AsNoTracking().OrderBy(p => p.Nombre).ToListAsync(ct);

    public async Task<IReadOnlyList<Ciudad>> ObtenerCiudadesAsync(int? paisId = null, CancellationToken ct = default)
    {
        var query = context.Ciudades.AsNoTracking();
        if (paisId.HasValue) query = query.Where(c => c.PaisId == paisId.Value);
        return await query.OrderBy(c => c.Nombre).ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Especialidad>> ObtenerEspecialidadesAsync(CancellationToken ct = default)
        => await context.Especialidades.AsNoTracking().OrderBy(e => e.Nombre).ToListAsync(ct);

    public async Task<IReadOnlyList<Categoria>> ObtenerCategoriasAsync(CancellationToken ct = default)
        => await context.Categorias.AsNoTracking().OrderBy(c => c.Nombre).ToListAsync(ct);

    public async Task<IReadOnlyList<Idioma>> ObtenerIdiomasAsync(CancellationToken ct = default)
        => await context.Idiomas.AsNoTracking().OrderBy(i => i.Nombre).ToListAsync(ct);
}

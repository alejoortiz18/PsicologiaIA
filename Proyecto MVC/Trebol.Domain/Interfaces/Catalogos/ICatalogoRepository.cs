using Trebol.Model.Entities.TrebolEntities;

namespace Trebol.Domain.Interfaces.Catalogos;

public interface ICatalogoRepository
{
    Task<IReadOnlyList<Pais>>         ObtenerPaisesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Ciudad>>       ObtenerCiudadesAsync(int? paisId = null, CancellationToken ct = default);
    Task<IReadOnlyList<Especialidad>> ObtenerEspecialidadesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Categoria>>    ObtenerCategoriasAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Idioma>>       ObtenerIdiomasAsync(CancellationToken ct = default);
}

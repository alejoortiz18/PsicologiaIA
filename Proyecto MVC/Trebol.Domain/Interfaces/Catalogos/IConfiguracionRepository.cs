namespace Trebol.Domain.Interfaces.Catalogos;

public interface IConfiguracionRepository
{
    Task<string?> ObtenerValorAsync(string clave, CancellationToken ct = default);
    Task<IReadOnlyDictionary<string, string>> ObtenerTodasAsync(CancellationToken ct = default);
}

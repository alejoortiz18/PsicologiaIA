using Trebol.Constants.Configuracion;
using Trebol.Domain.Interfaces.Catalogos;

namespace Trebol.Web.Services;

public interface ICitaPrecioService
{
    Task<(decimal Subtotal, decimal PorcentajeIva, decimal MontoIva, decimal Total)> CalcularAsync(
        decimal tarifaHora, int duracionMinutos, CancellationToken ct = default);
}

public class CitaPrecioService(IConfiguracionRepository configRepo) : ICitaPrecioService
{
    public async Task<(decimal Subtotal, decimal PorcentajeIva, decimal MontoIva, decimal Total)> CalcularAsync(
        decimal tarifaHora, int duracionMinutos, CancellationToken ct = default)
    {
        var subtotal = tarifaHora * (duracionMinutos / 60m);
        if (duracionMinutos == 90) subtotal = tarifaHora * 1.5m;

        var ivaTxt = await configRepo.ObtenerValorAsync(ConfiguracionClavesConstant.PorcentajeIvaCita, ct);
        var porcentaje = decimal.TryParse(ivaTxt, System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out var p)
            ? p
            : ConfiguracionClavesConstant.PorcentajeIvaCitaDefault;

        if (subtotal <= 0)
            return (0, porcentaje, 0, 0);

        var montoIva = Math.Round(subtotal * porcentaje / 100m, 0, MidpointRounding.AwayFromZero);
        return (subtotal, porcentaje, montoIva, subtotal + montoIva);
    }
}

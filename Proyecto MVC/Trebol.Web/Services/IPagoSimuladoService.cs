using Trebol.Model.DTOs.Pago;
using Trebol.Model.Models;

namespace Trebol.Web.Services;

public interface IPagoSimuladoService
{
    ResultadoOperacion ValidarTarjeta(TarjetaPagoDto tarjeta);

    ResultadoOperacion ValidarPago(TarjetaPagoDto pago);
}

using System.Text.RegularExpressions;
using Trebol.Constants.Pagos;
using Trebol.Model.DTOs.Pago;
using Trebol.Model.Models;

namespace Trebol.Web.Services;

public partial class PagoSimuladoService : IPagoSimuladoService
{
    public ResultadoOperacion ValidarPago(TarjetaPagoDto pago)
    {
        var metodo = (pago.MetodoPago ?? "TarjetaCredito").Trim();
        return metodo switch
        {
            "PSE" => ValidarPse(pago),
            "TarjetaCredito" or "TarjetaDebito" => ValidarTarjeta(pago),
            "Efecty" or "Nequi" => ResultadoOperacion.Ok("Pago simulado aprobado."),
            _ => ResultadoOperacion.Fail("Selecciona un método de pago válido.")
        };
    }

    public ResultadoOperacion ValidarTarjeta(TarjetaPagoDto tarjeta)
    {
        var numero = SoloDigitos(tarjeta.Numero);
        if (numero.Length < 13)
            return ResultadoOperacion.Fail(TarjetaPruebaConstant.MensajeInvalida);

        if (numero == TarjetaPruebaConstant.NumeroRechazada)
            return ResultadoOperacion.Fail(TarjetaPruebaConstant.MensajeRechazado);

        if (numero != TarjetaPruebaConstant.NumeroAprobada)
            return ResultadoOperacion.Fail(
                "Solo se acepta la tarjeta de prueba 4242 4242 4242 4242 en este entorno de desarrollo.");

        var cvv = tarjeta.Cvv?.Trim() ?? "";
        if (cvv != TarjetaPruebaConstant.CvvValido)
            return ResultadoOperacion.Fail("CVV inválido para la tarjeta de prueba (usa 123).");

        var venc = (tarjeta.Vencimiento ?? "").Trim();
        if (!Regex.IsMatch(venc, @"^\d{2}/\d{2}$") || venc != TarjetaPruebaConstant.VencimientoValido)
            return ResultadoOperacion.Fail("Vencimiento inválido (usa 12/30).");

        if (string.IsNullOrWhiteSpace(tarjeta.Nombre))
            return ResultadoOperacion.Fail("Indica el nombre en la tarjeta.");

        return ResultadoOperacion.Ok(TarjetaPruebaConstant.MensajeAprobado);
    }

    private static ResultadoOperacion ValidarPse(TarjetaPagoDto pago)
    {
        var banco = (pago.PseBanco ?? "").Trim().ToLowerInvariant();
        var tipo = (pago.PseTipoDocumento ?? "").Trim().ToUpperInvariant();
        var doc = SoloDigitos(pago.PseNumeroDocumento);

        if (banco != PsePruebaConstant.Banco)
            return ResultadoOperacion.Fail("Banco de prueba: selecciona Bancolombia.");

        if (tipo != PsePruebaConstant.TipoDocumento)
            return ResultadoOperacion.Fail("Tipo de documento de prueba: CC.");

        if (doc != PsePruebaConstant.NumeroDocumento)
            return ResultadoOperacion.Fail(
                "Documento de prueba PSE: usa 4242424242 (mismo número que la tarjeta de prueba).");

        return ResultadoOperacion.Ok(PsePruebaConstant.MensajeAprobado);
    }

    private static string SoloDigitos(string? valor)
        => string.IsNullOrEmpty(valor) ? "" : Regex.Replace(valor, @"\D", "");
}

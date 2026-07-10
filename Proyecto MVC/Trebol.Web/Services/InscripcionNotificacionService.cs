using System.Globalization;
using System.Text;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Helpers.Email;
using Trebol.Model.DTOs.Inscripcion;
using Trebol.Web.Services.Facturacion;

namespace Trebol.Web.Services;

public class InscripcionNotificacionService(
    IServiceScopeFactory scopeFactory,
    ILogger<InscripcionNotificacionService> logger) : IInscripcionNotificacionService
{
    private const decimal TarifaPlataforma = 5000m;
    private static readonly CultureInfo EsCo = new("es-CO");

    public void EnviarConfirmacionEnSegundoPlano(int inscripcionId, string? metodoPagoOverride = null)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var inscripcionRepo = scope.ServiceProvider.GetRequiredService<IInscripcionRepository>();
                var emailHelper = scope.ServiceProvider.GetRequiredService<IEmailHelper>();
                var facturaGen = scope.ServiceProvider.GetRequiredService<IFacturaInscripcionGenerator>();

                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(45));
                var datos = await inscripcionRepo.ObtenerConfirmacionAsync(inscripcionId, cts.Token);
                if (datos is null || string.IsNullOrWhiteSpace(datos.Correo))
                    return;

                if (!string.IsNullOrWhiteSpace(metodoPagoOverride))
                    datos = datos with { MetodoPago = metodoPagoOverride };

                var conTarifa = datos with
                {
                    TarifaPlataforma = datos.PrecioEntrada > 0 ? TarifaPlataforma : 0m
                };

                var pdf = facturaGen.GenerarPdf(conTarifa);
                var cuerpo = ConstruirCuerpoHtml(conTarifa);
                var nombrePdf = $"Factura_{conTarifa.NumeroFactura}.pdf";

                await emailHelper.EnviarConAdjuntosAsync(
                    conTarifa.Correo,
                    EmailConstant.AsuntoConfirmacionInscripcion,
                    cuerpo,
                    [(pdf, nombrePdf, "application/pdf")],
                    cts.Token);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "No se pudo enviar confirmación de inscripción {InscripcionId}", inscripcionId);
            }
        });
    }

    private static string ConstruirCuerpoHtml(InscripcionConfirmacionDto d)
    {
        var fechaEvento = d.FechaEvento.HasValue
            ? d.FechaEvento.Value.ToString("dddd d 'de' MMMM yyyy, HH:mm", EsCo)
            : "Por confirmar";
        var precioTxt = d.PrecioEntrada <= 0
            ? "Entrada libre"
            : d.Total.ToString("C0", EsCo);
        var pagoLinea = string.IsNullOrWhiteSpace(d.MetodoPago)
            ? ""
            : $"<li><strong>Método de pago:</strong> {FormatearMetodoPago(d.MetodoPago)}</li>";

        var sb = new StringBuilder(EmailConstant.CuerpoConfirmacionInscripcion);
        sb.Replace("{nombre}", d.NombreParticipante);
        sb.Replace("{documento}", TextoDocumento(d.Documento));
        sb.Replace("{evento}", d.TituloEvento);
        sb.Replace("{codigo}", d.CodigoInscripcion);
        sb.Replace("{orador}", d.NombreOrador);
        sb.Replace("{fecha}", fechaEvento);
        sb.Replace("{precio}", precioTxt);
        sb.Replace("{factura}", d.NumeroFactura);
        sb.Replace("{metodoPago}", pagoLinea);
        return sb.ToString();
    }

    private static string TextoDocumento(string? documento)
        => string.IsNullOrWhiteSpace(documento) ? "—" : documento.Trim();

    private static string FormatearMetodoPago(string metodo) => metodo switch
    {
        "TarjetaCredito" or "tarjeta" => "Tarjeta de crédito",
        "TarjetaDebito" or "debito"   => "Tarjeta débito",
        "PSE" or "pse"                => "PSE",
        "transferencia" or "Efecty"   => "Transferencia / Efecty",
        _ => metodo
    };
}

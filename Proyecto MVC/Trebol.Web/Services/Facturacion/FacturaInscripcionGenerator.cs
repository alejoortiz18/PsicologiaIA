using System.Globalization;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Trebol.Model.DTOs.Inscripcion;

namespace Trebol.Web.Services.Facturacion;

public class FacturaInscripcionGenerator : IFacturaInscripcionGenerator
{
    private static readonly CultureInfo EsCo = new("es-CO");

    static FacturaInscripcionGenerator()
        => QuestPDF.Settings.License = LicenseType.Community;

    public byte[] GenerarPdf(InscripcionConfirmacionDto d)
    {
        var fechaEmision = DateTime.Now;
        var esGratis = d.PrecioEntrada <= 0;

        return Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(48);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken3));

                page.Header().Column(col =>
                {
                    col.Item().Text("Trébol").FontSize(22).Bold().FontColor("#1A3C34");
                    col.Item().Text("Comprobante de inscripción a evento").FontSize(11).FontColor(Colors.Grey.Darken1);
                    col.Item().PaddingTop(8).LineHorizontal(1).LineColor("#1A3C34");
                });

                page.Content().PaddingVertical(16).Column(col =>
                {
                    col.Spacing(12);

                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text($"N° {d.NumeroFactura}").Bold().FontSize(12);
                            c.Item().Text($"Código inscripción: {d.CodigoInscripcion}");
                            c.Item().Text($"Fecha emisión: {fechaEmision:dd/MM/yyyy HH:mm}");
                            c.Item().Text($"Estado: {d.EstadoInscripcion}");
                        });
                        row.ConstantItem(180).Column(c =>
                        {
                            c.Item().Text("Cliente").Bold();
                            c.Item().Text(d.NombreParticipante);
                            c.Item().Text($"N° documento: {TextoDocumento(d.Documento)}");
                            c.Item().Text(d.Correo);
                        });
                    });

                    col.Item().Background("#F4F7F5").Padding(12).Column(c =>
                    {
                        c.Item().Text("Detalle del evento").Bold().FontColor("#1A3C34");
                        c.Item().Text(d.TituloEvento).FontSize(11).Bold();
                        if (!string.IsNullOrWhiteSpace(d.Categoria))
                            c.Item().Text($"Categoría: {d.Categoria}");
                        c.Item().Text($"Orador: {d.NombreOrador}");
                        if (d.FechaEvento.HasValue)
                        {
                            var fin = d.FechaFinEvento.HasValue
                                ? $" – {d.FechaFinEvento.Value:HH:mm}"
                                : "";
                            var fechaTxt = d.FechaEvento.Value.ToString("dddd d 'de' MMMM yyyy, HH:mm", EsCo);
                            c.Item().Text($"Fecha: {fechaTxt}{fin}");
                        }
                    });

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.RelativeColumn(3);
                            cols.RelativeColumn(1);
                        });

                        static void HeaderCell(IContainer c, string text) =>
                            c.Background("#1A3C34").Padding(6).Text(text).FontColor(Colors.White).Bold();

                        table.Header(h =>
                        {
                            h.Cell().Element(c => HeaderCell(c, "Concepto"));
                            h.Cell().Element(c => HeaderCell(c, "Valor"));
                        });

                        void Row(string concepto, decimal valor)
                        {
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).Text(concepto);
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6)
                                .AlignRight().Text(valor.ToString("C0", EsCo));
                        }

                        if (esGratis)
                            Row("Entrada al evento", 0m);
                        else
                        {
                            Row("Entrada al evento", d.PrecioEntrada);
                            if (d.TarifaPlataforma > 0)
                                Row("Tarifa de servicio plataforma", d.TarifaPlataforma);
                        }

                        table.Cell().Padding(6).Text("Total").Bold();
                        table.Cell().Padding(6).AlignRight().Text(d.Total.ToString("C0", EsCo)).Bold();
                    });

                    if (!esGratis && !string.IsNullOrWhiteSpace(d.MetodoPago))
                        col.Item().Text($"Método de pago: {d.MetodoPago}");

                    col.Item().Text(
                        "Documento generado automáticamente por Trébol. No constituye factura electrónica DIAN; es comprobante de inscripción y pago simulado.")
                        .FontSize(8).FontColor(Colors.Grey.Medium);
                });

                page.Footer().AlignCenter().Text(t =>
                {
                    t.Span("Trébol · ");
                    t.Span(DateTime.Now.Year.ToString());
                });
            });
        }).GeneratePdf();
    }

    private static string TextoDocumento(string? documento)
        => string.IsNullOrWhiteSpace(documento) ? "—" : documento.Trim();
}

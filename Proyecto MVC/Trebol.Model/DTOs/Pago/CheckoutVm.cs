namespace Trebol.Model.DTOs.Pago;

public class CheckoutVm
{
    public string Tipo { get; set; } = "inscripcion";
    public int ReferenciaId { get; set; }
    public int? InscripcionId { get; set; }
    public int? CitaId { get; set; }
    public int SalaId { get; set; }
    public int ProfesionalId { get; set; }

    public string Titulo { get; set; } = string.Empty;
    public string Subtitulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? NombreProfesional { get; set; }
    public string? FotoOrador { get; set; }

    public DateTime? FechaEvento { get; set; }
    public DateTime? FechaHoraCita { get; set; }
    public DateTime? FechaHoraFinCita { get; set; }
    public int DuracionMinutos { get; set; } = 60;

    public int CuposDisponibles { get; set; }
    public int Capacidad { get; set; }
    public int TotalInscritos { get; set; }

    public decimal Subtotal { get; set; }
    public decimal TarifaPlataforma { get; set; } = 5000m;
    public decimal Total => Subtotal + (RequierePago ? TarifaPlataforma : 0);
    public bool RequierePago => Subtotal > 0;

    public string? CodigoInscripcion { get; set; }
    public string MetodoPago { get; set; } = "TarjetaCredito";
}

public class TarjetaPagoDto
{
    public string Numero      { get; set; } = string.Empty;
    public string Vencimiento { get; set; } = string.Empty;
    public string Cvv         { get; set; } = string.Empty;
    public string Nombre      { get; set; } = string.Empty;
    public string MetodoPago  { get; set; } = "TarjetaCredito";

    public string? PseBanco           { get; set; }
    public string? PseTipoDocumento   { get; set; }
    public string? PseNumeroDocumento { get; set; }
    public string? PseEmail           { get; set; }
}

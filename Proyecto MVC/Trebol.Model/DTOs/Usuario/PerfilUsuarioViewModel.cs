using Trebol.Model.DTOs.Cita;
using Trebol.Model.DTOs.Common;
using TrebolEntity = Trebol.Model.Entities.TrebolEntities;

namespace Trebol.Model.DTOs.Usuario;

public class PerfilUsuarioViewModel
{
    public TrebolEntity.Usuario Usuario { get; set; } = new();
    public IReadOnlyList<InscripcionPerfilDto> EventosInscritos { get; set; } = [];
    public IReadOnlyList<CitaListaDto> CitasProximas { get; set; } = [];
    public PaginacionVm PaginacionEventos { get; set; } = new();
    public string? MensajeExito { get; set; }
    public string CitasCalendarioJson { get; set; } = "[]";

    public MisSaldosResumenDto ResumenSaldos { get; set; } = new();
    public IReadOnlyList<PagoPorProfesionalDto> PagosPorProfesional { get; set; } = [];
    public IReadOnlyList<MovimientoEnTransitoDto> MovimientosEnTransito { get; set; } = [];
    public PaginacionVm PaginacionPagos { get; set; } = new();
    public MisSaldosFiltroDto FiltroSaldos { get; set; } = new();
    public decimal ComisionRetiroPorcentaje { get; set; }

    public CuentaBancariaUsuarioDto? CuentaBancaria { get; set; }
    public IReadOnlyList<NovedadUsuarioDto> Novedades { get; set; } = [];
    public PaginacionVm PaginacionNovedades { get; set; } = new();
    public int TotalNovedadesPendientes { get; set; }
}

public class InscripcionPerfilDto
{
    public int       SalaId            { get; set; }
    public int       InscripcionId     { get; set; }
    public string    Titulo            { get; set; } = string.Empty;
    public string    NombreProfesional { get; set; } = string.Empty;
    public DateTime? FechaInicio       { get; set; }
    public DateTime? FechaFin          { get; set; }
    public string    EstadoSala        { get; set; } = string.Empty;
    public string    EstadoInscripcion { get; set; } = string.Empty;
    public decimal   Precio            { get; set; }
    public bool      EnVivo            { get; set; }
    public bool      Finalizado        { get; set; }
}

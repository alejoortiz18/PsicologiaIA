namespace Trebol.Model.DTOs.Usuario;

public class MisSaldosResumenDto
{
    public decimal TotalPagado           { get; set; }
    public int     TotalEventosAsistidos { get; set; }
    public int     TotalCitas            { get; set; }
    public decimal SaldoFavor            { get; set; }
    public decimal DineroEnTransito      { get; set; }
}

public class PagoPorProfesionalDto
{
    public int     ProfesionalId       { get; set; }
    public string  NombreProfesional   { get; set; } = string.Empty;
    public string  FotoProfesional     { get; set; } = string.Empty;
    public decimal TotalPagado         { get; set; }
    public int     TotalTransacciones  { get; set; }
    public int     TotalRegistros      { get; set; }
}

public class MovimientoEnTransitoDto
{
    public int       MovimientoSaldoUsuarioId { get; set; }
    public decimal   MontoBruto               { get; set; }
    public decimal   Comision                 { get; set; }
    public decimal   MontoNeto                { get; set; }
    public string    Estado                   { get; set; } = string.Empty;
    public DateTime? FechaLimiteRetractacion  { get; set; }
    public DateTime? FechaEstimadaDesembolso  { get; set; }
    public DateTime  FechaCreacion            { get; set; }
    public string    Banco                    { get; set; } = string.Empty;
    public string    NumeroCuenta             { get; set; } = string.Empty;
    public string    TipoCuenta               { get; set; } = string.Empty;
    public string    Titular                  { get; set; } = string.Empty;
    public bool      PuedeRetractar           { get; set; }
}

public class CuentaBancariaUsuarioDto
{
    public int     CuentaBancariaUsuarioId { get; set; }
    public int     UsuarioId               { get; set; }
    public string  Banco                   { get; set; } = string.Empty;
    public string  TipoCuenta              { get; set; } = string.Empty;
    public string  NumeroCuenta            { get; set; } = string.Empty;
    public string  Titular                 { get; set; } = string.Empty;
    public string? DocumentoTitular        { get; set; }
    public string  Estado                  { get; set; } = string.Empty;
    public bool    EstaCompleta =>
        !string.IsNullOrWhiteSpace(Banco)
        && !string.IsNullOrWhiteSpace(TipoCuenta)
        && !string.IsNullOrWhiteSpace(NumeroCuenta)
        && !string.IsNullOrWhiteSpace(Titular);
}

public class GuardarCuentaBancariaUsuarioDto
{
    public string  Banco             { get; set; } = string.Empty;
    public string  TipoCuenta      { get; set; } = string.Empty;
    public string  NumeroCuenta    { get; set; } = string.Empty;
    public string  Titular         { get; set; } = string.Empty;
    public string? DocumentoTitular { get; set; }
}

public class NovedadUsuarioDto
{
    public int       NovedadUsuarioId { get; set; }
    public string    TipoNovedad      { get; set; } = string.Empty;
    public string    EntidadTipo      { get; set; } = string.Empty;
    public int       EntidadId        { get; set; }
    public string    Titulo           { get; set; } = string.Empty;
    public string    Mensaje          { get; set; } = string.Empty;
    public string    Estado           { get; set; } = string.Empty;
    public string?   OpcionElegida    { get; set; }
    public DateTime  FechaCreacion    { get; set; }
    public DateTime? FechaResolucion  { get; set; }
    public int       TotalRegistros   { get; set; }
}

public class RetiroSaldoResultadoDto
{
    public bool     Exito     { get; set; }
    public string   Mensaje   { get; set; } = string.Empty;
    public decimal? MontoBruto { get; set; }
    public decimal? Comision  { get; set; }
    public decimal? MontoNeto { get; set; }
}

public class MisSaldosFiltroDto
{
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
    public int       PaginaPagos { get; set; } = 1;
}

public class NovedadPendienteModalDto
{
    public int       NovedadUsuarioId { get; set; }
    public string    TipoNovedad      { get; set; } = string.Empty;
    public string    EntidadTipo      { get; set; } = string.Empty;
    public int       EntidadId        { get; set; }
    public string    Titulo           { get; set; } = string.Empty;
    public string    Mensaje          { get; set; } = string.Empty;
    public int?      ProfesionalId    { get; set; }
    public bool      EsCita           => EntidadTipo == "Cita";
    public bool      EsEvento         => EntidadTipo == "Inscripcion";
}

public class ResolverNovedadResultadoDto
{
    public bool    Exito          { get; set; }
    public string  Mensaje        { get; set; } = string.Empty;
    public string? RedirectUrl    { get; set; }
    public int?    ProfesionalId  { get; set; }
}

public class EvaluarInasistenciaDto
{
    public bool RequiereModal      { get; set; }
    public int? NovedadUsuarioId   { get; set; }
}

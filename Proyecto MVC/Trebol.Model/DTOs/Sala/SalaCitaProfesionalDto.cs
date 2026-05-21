using Trebol.Model.Enums;

namespace Trebol.Model.DTOs.Sala;

public class SalaCitaProfesionalDto
{
    public int        CitaId          { get; set; }
    public int        UsuarioId       { get; set; }
    public int        ProfesionalId   { get; set; }
    public string     AliasUsuario    { get; set; } = string.Empty;
    public DateTime   FechaHora       { get; set; }
    public DateTime   FechaHoraFin    { get; set; }
    public int        DuracionMinutos { get; set; }
    public TipoCita   Tipo            { get; set; }
    public EstadoCita Estado          { get; set; }
    public int        NumeroSesion    { get; set; }
    public bool       EsHoy           { get; set; }
}

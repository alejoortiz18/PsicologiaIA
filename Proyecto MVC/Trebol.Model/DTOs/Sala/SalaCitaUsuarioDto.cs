using Trebol.Model.Enums;

namespace Trebol.Model.DTOs.Sala;

public class SalaCitaUsuarioDto
{
    public int        CitaId                 { get; set; }
    public int        UsuarioId              { get; set; }
    public int        ProfesionalId          { get; set; }
    public string     NombreProfesional      { get; set; } = string.Empty;
    public string?    FotoProfesional        { get; set; }
    public string     AliasUsuario           { get; set; } = string.Empty;
    public bool       MostrarAlias           { get; set; }
    public DateTime   FechaHora              { get; set; }
    public DateTime   FechaHoraFin           { get; set; }
    public int        DuracionMinutos        { get; set; }
    public TipoCita   Tipo                   { get; set; }
    public EstadoCita Estado                   { get; set; }
    public bool       EsHoy                    { get; set; }
    public string?    RecomendacionContenido  { get; set; }
    public DateTime?  RecomendacionFecha     { get; set; }
    public string?    NotaPrivadaContenido   { get; set; }
    public DateTime?  NotaPrivadaFecha       { get; set; }
}

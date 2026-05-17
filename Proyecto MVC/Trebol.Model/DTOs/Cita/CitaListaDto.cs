using Trebol.Model.Enums;

namespace Trebol.Model.DTOs.Cita;

public class CitaListaDto
{
    public int        CitaId         { get; set; }
    public string     NombreProfesional { get; set; } = string.Empty;
    public string     FotoProfesional   { get; set; } = string.Empty;
    public string     AliasUsuario      { get; set; } = string.Empty;  // Privacidad Ley 1581
    public DateTime   FechaHora         { get; set; }
    public int        DuracionMinutos   { get; set; }
    public TipoCita   Tipo              { get; set; }
    public EstadoCita Estado            { get; set; }
    public decimal    Monto             { get; set; }
}

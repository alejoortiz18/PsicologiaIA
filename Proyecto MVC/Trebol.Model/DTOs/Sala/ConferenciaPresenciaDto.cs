namespace Trebol.Model.DTOs.Sala;

public class ConferenciaPresenciaDto
{
    public bool      ProfesionalPresente { get; set; }
    public DateTime? ProfesionalIngreso  { get; set; }
}

public class EvaluarInasistenciaConferenciaDto
{
    public bool RequiereModal        { get; set; }
    public int? NovedadUsuarioId     { get; set; }
    public bool ProfesionalPresente   { get; set; }
}

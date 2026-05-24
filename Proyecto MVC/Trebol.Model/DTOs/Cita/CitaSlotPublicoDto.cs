namespace Trebol.Model.DTOs.Cita;

public class CitaSlotPublicoDto
{
    public DateTime FechaHora       { get; set; }
    public int      DuracionMinutos { get; set; }
    public int?     UsuarioId             { get; set; }
    public int?     ProfesionalClienteId  { get; set; }
}

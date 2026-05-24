using Trebol.Model.Enums;

namespace Trebol.Model.DTOs.Cita;

public class CrearCitaDto
{
    public int?     UsuarioId             { get; set; }
    public int?     ProfesionalClienteId  { get; set; }
    public int      ProfesionalId         { get; set; }
    public DateTime FechaHora             { get; set; }
    public int      DuracionMinutos       { get; set; }
    public TipoCita Tipo                  { get; set; }
    public string?  Notas                 { get; set; }
}

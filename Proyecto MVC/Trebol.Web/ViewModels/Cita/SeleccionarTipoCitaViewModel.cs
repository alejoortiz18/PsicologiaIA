using System.ComponentModel.DataAnnotations;
using Trebol.Model.Enums;

namespace Trebol.Web.ViewModels.Cita;

public class SeleccionarTipoCitaViewModel
{
    public int ProfesionalId { get; set; }

    [Required]
    public DateTime FechaHora { get; set; }

    public int DuracionMinutos { get; set; } = 60;

    [Required(ErrorMessage = "Selecciona el tipo de cita.")]
    public TipoCita? Tipo { get; set; }

    public string NombreProfesional { get; set; } = string.Empty;
}

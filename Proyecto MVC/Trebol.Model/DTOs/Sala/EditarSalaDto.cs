using System.ComponentModel.DataAnnotations;
using Trebol.Model.Enums;

namespace Trebol.Model.DTOs.Sala;

public class EditarSalaDto
{
    public int SalaId { get; set; }
    public int ProfesionalId { get; set; }

    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(300)]
    public string Titulo { get; set; } = string.Empty;

    public string? Descripcion { get; set; }

    public TipoSala Tipo { get; set; }

    [Range(1, 500)]
    public int Capacidad { get; set; }

    public DateTime? FechaInicio { get; set; }

    [Range(0, 10_000_000)]
    public decimal? Precio { get; set; }
}

using System.ComponentModel.DataAnnotations;
using Trebol.Model.Enums;

namespace Trebol.Model.DTOs.Sala;

public class CrearSalaDto
{
    public int ProfesionalId { get; set; }

    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(300)]
    public string Titulo { get; set; } = string.Empty;

    public string? Descripcion { get; set; }

    public TipoSala Tipo { get; set; } = TipoSala.Publica;

    public int? CategoriaId { get; set; }

    [Range(1, 5000, ErrorMessage = "La capacidad debe estar entre 1 y 5000.")]
    public int Capacidad { get; set; } = 100;

    [Required(ErrorMessage = "La fecha y hora de inicio son obligatorias.")]
    public DateTime? FechaInicio { get; set; }

    [Range(15, 480, ErrorMessage = "La duración debe estar entre 15 y 480 minutos.")]
    public int DuracionMinutos { get; set; } = 120;

    [Range(0, 10_000_000)]
    public decimal? Precio { get; set; }
}

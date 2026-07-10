using System.ComponentModel.DataAnnotations;

namespace Trebol.Model.DTOs.Profesional;

public class GuardarEstudioDto
{
    public int? EstudioId { get; set; }

    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(300)]
    public string Titulo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La institución es obligatoria.")]
    [StringLength(300)]
    public string Universidad { get; set; } = string.Empty;

    [Range(1950, 2100)]
    public short? AnoEgreso { get; set; }

    [Required(ErrorMessage = "El tipo de formación es obligatorio.")]
    public string Nivel { get; set; } = "Pregrado";
}

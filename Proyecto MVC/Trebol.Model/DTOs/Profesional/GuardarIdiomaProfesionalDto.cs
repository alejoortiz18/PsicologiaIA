using System.ComponentModel.DataAnnotations;

namespace Trebol.Model.DTOs.Profesional;

public class GuardarIdiomaProfesionalDto
{
    [Range(1, int.MaxValue)]
    public int IdiomaId { get; set; }

    [Required]
    public string Nivel { get; set; } = "Intermedio";
}

using Trebol.Model.DTOs.Profesional;
using Trebol.Model.DTOs.Publico;
using Trebol.Model.DTOs.Sala;
using Trebol.Model.Entities.TrebolEntities;

namespace Trebol.Model.DTOs.PerfilOrador;

public class PerfilOradorPublicoVm
{
    public string TabActivo { get; set; } = "cuenta";
    public ProfesionalDto Perfil { get; set; } = new();
    public PerfilProfesionalResumenDto Resumen { get; set; } = new();
    public bool EsSeguido { get; set; }
    public bool PuedeSeguir { get; set; }
    public string SubtituloPerfil { get; set; } = string.Empty;
    public string TextoComoTrabajo { get; set; } = string.Empty;
    public IReadOnlyList<string> LineasExperiencia { get; set; } = [];
    public IReadOnlyList<ProfesionalEstudioDto> Estudios { get; set; } = [];
    public IReadOnlyList<SalaDto> Salas { get; set; } = [];
    public IReadOnlyList<EventoPublicoDto> SalasEventos { get; set; } = [];
    public IReadOnlyList<ComentarioPerfilDto> Comentarios { get; set; } = [];
    public ResumenComentariosPerfilDto ResumenComentarios { get; set; } = new();
    public IReadOnlyList<HorarioDisponible> Disponibilidad { get; set; } = [];
    public IReadOnlyList<HorarioBloqueado> Bloqueos { get; set; } = [];
    public int? UsuarioActualId { get; set; }
    public bool PuedeComentar { get; set; }
}

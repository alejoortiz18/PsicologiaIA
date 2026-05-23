using Trebol.Model.DTOs.Auth;
using Trebol.Model.DTOs.Dashboard;
using Trebol.Model.DTOs.PerfilOrador;
using Trebol.Model.DTOs.Profesional;
using Trebol.Model.Entities.TrebolEntities;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface IProfesionalRepository
{
    Task<ResultadoOperacion<int>> RegistrarAsync(RegistroProfesionalDto dto, CancellationToken ct = default);
    Task<bool>                    EsTokenValidoAsync(string token, CancellationToken ct = default);
    Task<ResultadoOperacion>      ConfirmarEmailAsync(string token, string passwordHash, CancellationToken ct = default);
    Task<Profesional?>            ObtenerPorCorreoAsync(string correo, CancellationToken ct = default);
    Task<Profesional?>            ObtenerPorIdAsync(int profesionalId, CancellationToken ct = default);
    Task<ProfesionalDto?>         ObtenerDtoAsync(int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion>      ActualizarAsync(ActualizarProfesionalDto dto, CancellationToken ct = default);
    Task<DashboardProfesionalDto> ObtenerDashboardAsync(int profesionalId, CancellationToken ct = default);
    Task<int> ContarSeguidoresAsync(int profesionalId, CancellationToken ct = default);
    Task<IReadOnlyList<ProfesionalEstudioDto>> ObtenerEstudiosAsync(int profesionalId, CancellationToken ct = default);
    Task<IReadOnlyList<string>> ObtenerEspecialidadesAsync(int profesionalId, CancellationToken ct = default);
    Task<IReadOnlyList<string>> ObtenerIdiomasAsync(int profesionalId, CancellationToken ct = default);
    Task<PerfilProfesionalResumenDto> ObtenerResumenPerfilAsync(int profesionalId, CancellationToken ct = default);
    Task<IReadOnlyList<ComentarioPerfilDto>> ObtenerComentariosPublicosAsync(int profesionalId, int? usuarioActualId, CancellationToken ct = default);
    Task<ResumenComentariosPerfilDto> ObtenerResumenComentariosAsync(int profesionalId, CancellationToken ct = default);
    Task<ResultadoOperacion> CrearComentarioPublicoAsync(CrearComentarioPerfilDto dto, CancellationToken ct = default);
    Task<ResultadoOperacion>      AprobarAsync(int profesionalId, bool aprobado, string? motivoRechazo = null, CancellationToken ct = default);
    Task<ResultadoOperacion>      ReenviarDocumentosAsync(int profesionalId, CancellationToken ct = default);
}

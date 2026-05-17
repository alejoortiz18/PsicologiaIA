using Trebol.Model.DTOs.Auth;
using Trebol.Model.DTOs.Dashboard;
using Trebol.Model.DTOs.Usuario;
using Trebol.Model.Entities.TrebolEntities;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface IUsuarioRepository
{
    Task<ResultadoOperacion<int>> RegistrarAsync(RegistroUsuarioDto dto, CancellationToken ct = default);
    Task<ResultadoOperacion>      ActivarAsync(string token, string passwordHash, CancellationToken ct = default);
    Task<Usuario?>                ObtenerPorCorreoAsync(string correo, CancellationToken ct = default);
    Task<Usuario?>                ObtenerPorIdAsync(int usuarioId, CancellationToken ct = default);
    Task<UsuarioDto?>             ObtenerDtoAsync(int usuarioId, CancellationToken ct = default);
    Task<ResultadoOperacion>      ActualizarAsync(ActualizarUsuarioDto dto, CancellationToken ct = default);
    Task<DashboardUsuarioDto>     ObtenerDashboardAsync(int usuarioId, CancellationToken ct = default);
}

using Trebol.Model.DTOs.Auth;
using Trebol.Model.Entities.TrebolEntities;
using Trebol.Model.Models;

namespace Trebol.Domain.Interfaces;

public interface ILoginRepository
{
    Task<UsuarioSesionDto?> ValidarLoginAsync(string correo, string password, CancellationToken ct = default);
    Task<ResultadoOperacion> SolicitarRecuperacionAsync(string correo, string token, CancellationToken ct = default);
    Task<ResultadoOperacion> RestablecerPasswordAsync(string token, string passwordHash, CancellationToken ct = default);
}

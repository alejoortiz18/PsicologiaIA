namespace Trebol.Helpers.Security;

public interface IPasswordHelper
{
    /// <summary>Genera hash Argon2id con salt embebido. Almacenar como NVARCHAR(500).</summary>
    string HashPassword(string password);

    /// <summary>Verifica que el password en texto plano coincida con el hash almacenado.</summary>
    bool VerifyPassword(string password, string storedHash);
}

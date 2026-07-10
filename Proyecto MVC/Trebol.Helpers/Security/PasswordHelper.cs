using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;

namespace Trebol.Helpers.Security;

/// <summary>
/// Implementación de hash de contraseñas usando Argon2id.
/// El salt (32 bytes) se embebe en el hash resultante → un único campo NVARCHAR(500) en BD.
/// ÚNICO componente autorizado para generar o verificar contraseñas en el sistema.
/// </summary>
public class PasswordHelper : IPasswordHelper
{
    private const int SaltSize          = 32;      // 256 bits
    private const int HashSize          = 32;      // 256 bits
    private const int Parallelism       = 4;
    private const int MemorySize        = 65536;   // 64 MB
    private const int Iterations        = 3;

    public string HashPassword(string password)
    {
        var salt = new byte[SaltSize];
        RandomNumberGenerator.Fill(salt);

        var hash = ComputeHash(password, salt);

        // Concatenar: [salt (32 bytes)] + [hash (32 bytes)] → Base64
        var combined = new byte[SaltSize + HashSize];
        Buffer.BlockCopy(salt, 0, combined, 0,        SaltSize);
        Buffer.BlockCopy(hash, 0, combined, SaltSize, HashSize);

        return Convert.ToBase64String(combined);
    }

    public bool VerifyPassword(string password, string storedHash)
    {
        byte[] combined;
        try
        {
            combined = Convert.FromBase64String(storedHash);
        }
        catch (FormatException)
        {
            return false;
        }

        if (combined.Length != SaltSize + HashSize)
            return false;

        var salt        = combined[..SaltSize];
        var storedBytes = combined[SaltSize..];

        var computedHash = ComputeHash(password, salt);

        // Comparación en tiempo constante para prevenir timing attacks
        return CryptographicOperations.FixedTimeEquals(computedHash, storedBytes);
    }

    private static byte[] ComputeHash(string password, byte[] salt)
    {
        using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
        {
            Salt                = salt,
            DegreeOfParallelism = Parallelism,
            MemorySize          = MemorySize,
            Iterations          = Iterations
        };
        return argon2.GetBytes(HashSize);
    }
}

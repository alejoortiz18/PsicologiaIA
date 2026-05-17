using System.Security.Cryptography;

namespace Trebol.Helpers.Token;

/// <summary>
/// Genera tokens de activación cortos (6 caracteres) criptográficamente seguros.
/// Usa mayúsculas, minúsculas, dígitos y símbolos para máxima entropía en poco espacio.
/// </summary>
public class TokenHelper : ITokenHelper
{
    // 72 caracteres: A-Z, a-z, 0-9, símbolos seguros para mostrar en pantalla/correo
    private const string Chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789#@!$&*";
    private const int    Largo = 6;

    public string GenerarToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(Largo);
        var chars = new char[Largo];
        for (int i = 0; i < Largo; i++)
            chars[i] = Chars[bytes[i] % Chars.Length];
        return new string(chars);
    }
}

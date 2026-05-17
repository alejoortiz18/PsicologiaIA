namespace Trebol.Helpers.Token;

public interface ITokenHelper
{
    /// <summary>Genera un token criptográficamente seguro, URL-safe, de 64 bytes en Base64.</summary>
    string GenerarToken();
}

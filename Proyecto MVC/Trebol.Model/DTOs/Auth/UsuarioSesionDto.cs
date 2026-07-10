namespace Trebol.Model.DTOs.Auth;

/// <summary>
/// DTO que se almacena en la cookie de sesión tras login exitoso.
/// </summary>
public class UsuarioSesionDto
{
    public int    EntidadId    { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo       { get; set; } = string.Empty;
    public string TipoEntidad  { get; set; } = string.Empty;  // "Usuario", "Profesional", "Admin"
    public string? FotoUrl     { get; set; }
}

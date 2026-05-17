namespace Trebol.Model.DTOs.Auth;

public class ActivarCuentaDto
{
    public string Token           { get; set; } = string.Empty;
    public string Password        { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
    public string TipoEntidad     { get; set; } = string.Empty;  // "Usuario" o "Profesional"
}

namespace Trebol.Model.DTOs.Usuario;

public class UsuarioDto
{
    public int     UsuarioId       { get; set; }
    public string  NombreCompleto  { get; set; } = string.Empty;
    public string  Correo          { get; set; } = string.Empty;
    public string  Alias           { get; set; } = string.Empty;
    public string? Celular         { get; set; }
    public string? FotoUrl         { get; set; }
    public DateOnly? FechaNacimiento { get; set; }
    public string? Ciudad          { get; set; }
    public string  Estado          { get; set; } = string.Empty;
}

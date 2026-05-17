namespace Trebol.Model.DTOs.Usuario;

public class RegistroUsuarioDto
{
    public string NombreCompleto   { get; set; } = string.Empty;
    public string Correo           { get; set; } = string.Empty;
    public string NumeroDocumento  { get; set; } = string.Empty;
    public string Alias            { get; set; } = string.Empty;
    public string? Celular         { get; set; }
    public DateOnly? FechaNacimiento { get; set; }
    public int?   CiudadId         { get; set; }
}

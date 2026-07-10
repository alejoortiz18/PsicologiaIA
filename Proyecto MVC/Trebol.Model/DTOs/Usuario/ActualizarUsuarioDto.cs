namespace Trebol.Model.DTOs.Usuario;

public class ActualizarUsuarioDto
{
    public int    UsuarioId       { get; set; }
    public string NombreCompleto  { get; set; } = string.Empty;
    public string Alias           { get; set; } = string.Empty;
    public string? Celular        { get; set; }
    public DateOnly? FechaNacimiento { get; set; }
    public int?   CiudadId        { get; set; }
    public string? FotoUrl        { get; set; }
}

namespace Trebol.Model.DTOs.Profesional;

public class RegistroProfesionalDto
{
    public string NombreCompleto      { get; set; } = string.Empty;
    public string Correo              { get; set; } = string.Empty;
    public string NumeroDocumento     { get; set; } = string.Empty;
    public string NumeroCedula        { get; set; } = string.Empty;  // Tarjeta profesional COLPSIC
    public string Especialidad        { get; set; } = string.Empty;
    public string? Celular            { get; set; }
    public int?   CiudadId            { get; set; }
    public string RutaPdfCedula       { get; set; } = string.Empty;
    public string RutaPdfTarjeta      { get; set; } = string.Empty;
    // Token de confirmación de correo generado en el controller
    public string Token               { get; set; } = string.Empty;
    public DateTime Expiracion        { get; set; }
}

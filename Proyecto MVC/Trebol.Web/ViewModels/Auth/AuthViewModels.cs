using System.ComponentModel.DataAnnotations;

namespace Trebol.Web.ViewModels.Auth;

public class LoginViewModel
{
    [Required(ErrorMessage = "El correo es requerido.")]
    [EmailAddress(ErrorMessage = "Correo inválido.")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida.")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;
}

public class RegistroUsuarioViewModel
{
    [Required] public string NombreCompleto  { get; set; } = string.Empty;
    [Required][EmailAddress] public string Correo { get; set; } = string.Empty;
    [Required][DataType(DataType.Password)][MinLength(8)] public string Password { get; set; } = string.Empty;
    [Required][Compare("Password", ErrorMessage = "Las contraseñas no coinciden.")]
    [DataType(DataType.Password)] public string ConfirmarPassword { get; set; } = string.Empty;
    [Required] public string NumeroDocumento { get; set; } = string.Empty;
}

public class RegistroProfesionalViewModel
{
    [Required] public string NombreCompleto  { get; set; } = string.Empty;
    [Required][EmailAddress] public string Correo { get; set; } = string.Empty;
    [Required] public string NumeroDocumento { get; set; } = string.Empty;
    [Required] public int EspecialidadId     { get; set; }
    [Required] public string NumeroRegistro  { get; set; } = string.Empty;
    [Required] public IFormFile? FotocopiaCedula    { get; set; }
    [Required] public IFormFile? FotocopiaTarjeta   { get; set; }
}

public class ConfirmarEmailViewModel
{
    [Required] public string Token            { get; set; } = string.Empty;
    [Required][DataType(DataType.Password)][MinLength(8, ErrorMessage = "Mínimo 8 caracteres.")]
    public string Password                    { get; set; } = string.Empty;
    [Required][Compare("Password", ErrorMessage = "Las contraseñas no coinciden.")]
    [DataType(DataType.Password)] public string ConfirmarPassword { get; set; } = string.Empty;
}

public class ReenviarDocumentosViewModel
{
    [Required][EmailAddress] public string Correo { get; set; } = string.Empty;
    [Required] public IFormFile? FotocopiaCedula  { get; set; }
    [Required] public IFormFile? FotocopiaTarjeta { get; set; }
}

public class ActivarCuentaViewModel
{
    public int    UsuarioId { get; set; }
    [Required] public string Token    { get; set; } = string.Empty;
    // Sólo requerido si no hay hash en sesión
    [DataType(DataType.Password)]
    public string? Password { get; set; }
}

public class SolicitarRecuperacionViewModel
{
    [Required][EmailAddress] public string Correo { get; set; } = string.Empty;
}

public class RestablecerPasswordViewModel
{
    public string Correo { get; set; } = string.Empty;
    public string Token  { get; set; } = string.Empty;

    [Required][DataType(DataType.Password)][MinLength(8)]
    public string NuevoPassword { get; set; } = string.Empty;

    [Required][Compare("NuevoPassword", ErrorMessage = "Las contraseñas no coinciden.")]
    [DataType(DataType.Password)]
    public string ConfirmarPassword { get; set; } = string.Empty;
}

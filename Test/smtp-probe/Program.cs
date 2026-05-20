using Microsoft.Extensions.Configuration;
using Trebol.Helpers.Email;

var config = new ConfigurationBuilder()
    .SetBasePath(Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "Proyecto MVC", "Trebol.Web")))
    .AddJsonFile("appsettings.json", optional: false)
    .AddJsonFile("appsettings.Development.json", optional: true)
    .Build();

var remitente = config["Email:Remitente"];
Console.WriteLine($"Remitente: {remitente}");
Console.WriteLine($"Contrasena configurada: {!string.IsNullOrWhiteSpace(config["Email:Contrasena"])}");

var helper = new EmailHelper(config);
try
{
    await helper.EnviarAsync(remitente!, "[Trébol] Prueba SMTP MailKit", "<p>Prueba desde SmtpProbe</p>");
    Console.WriteLine("OK: correo enviado con MailKit.");
    return 0;
}
catch (Exception ex)
{
    Console.WriteLine($"FALLO: {ex.Message}");
    if (ex.InnerException != null) Console.WriteLine($"  -> {ex.InnerException.Message}");
    return 1;
}

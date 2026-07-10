using System.Globalization;

namespace Trebol.Web.Helpers;

public static class MensajeriaUiHelper
{
    private static readonly string[] AvatarGradients =
    [
        "linear-gradient(135deg,#2D6A4F,#52B788)",
        "linear-gradient(135deg,#1565C0,#1976D2)",
        "linear-gradient(135deg,#4A148C,#6A1B9A)",
        "linear-gradient(135deg,#E65100,#F57C00)",
        "linear-gradient(135deg,#2D4A8F,#5C6BC0)",
        "linear-gradient(135deg,#1A3C34,#26A69A)"
    ];

    public static string AvatarGradient(int seed) =>
        AvatarGradients[Math.Abs(seed) % AvatarGradients.Length];

    public static string Iniciales(string? nombre)
    {
        var partes = (nombre ?? "?").Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (partes.Length == 0) return "?";
        return string.Concat(partes.Take(2).Select(p => p.Length > 0 ? char.ToUpper(p[0], CultureInfo.CurrentCulture) : '?'));
    }

    public static string FormatearTiempoLista(DateTime? fecha)
    {
        if (fecha is null) return string.Empty;
        var hoy = DateTime.Today;
        var d = fecha.Value;
        if (d.Date == hoy) return d.ToString("h:mm tt", CultureInfo.CurrentCulture);
        if (d.Date == hoy.AddDays(-1)) return "Ayer";
        return d.ToString("dd/MM/yy", CultureInfo.CurrentCulture);
    }

    public static string FormatearSeparadorFecha(DateTime fecha)
    {
        var hoy = DateTime.Today;
        if (fecha.Date == hoy) return $"Hoy, {fecha:dd MMMM yyyy}";
        if (fecha.Date == hoy.AddDays(-1)) return $"Ayer, {fecha:dd MMMM yyyy}";
        return fecha.ToString("dddd, dd MMMM yyyy", new CultureInfo("es-CO"));
    }

    public static string SubtituloContacto(string tipoOtro) =>
        tipoOtro.Equals("Profesional", StringComparison.OrdinalIgnoreCase) ? "Profesional" : "Usuario";

    public static bool EsProfesional(string tipoOtro) =>
        tipoOtro.Equals("Profesional", StringComparison.OrdinalIgnoreCase);
}

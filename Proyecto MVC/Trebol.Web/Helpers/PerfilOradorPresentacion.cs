using Trebol.Model.DTOs.PerfilOrador;
using Trebol.Model.DTOs.Profesional;

namespace Trebol.Web.Helpers;

public static class PerfilOradorPresentacion
{
    public static void EnriquecerTabCuenta(PerfilOradorPublicoVm vm, bool puedeSeguir)
    {
        var p = vm.Perfil;
        vm.PuedeSeguir       = puedeSeguir;
        vm.SubtituloPerfil   = ConstruirSubtitulo(p);
        vm.TextoComoTrabajo  = ConstruirComoTrabajo(p);
        vm.LineasExperiencia = ConstruirLineasExperiencia(p, vm.Estudios);
    }

    public static IReadOnlyList<string> EspecialidadesVisibles(ProfesionalDto p)
        => p.Especialidades
            .Where(e => !string.IsNullOrWhiteSpace(e))
            .Select(e => e.Trim())
            .Where(e => !CoincideConTitulo(e, p.Titulo))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

    public static string ConstruirSubtitulo(ProfesionalDto p)
    {
        var titulo = p.Titulo?.Trim() ?? "";
        var specs  = EspecialidadesVisibles(p);

        if (!string.IsNullOrWhiteSpace(titulo) && specs.Count >= 2)
            return $"{titulo} · Especialista en {specs[0]} y {specs[1]}";
        if (!string.IsNullOrWhiteSpace(titulo) && specs.Count == 1)
            return $"{titulo} · Especialista en {specs[0]}";
        if (!string.IsNullOrWhiteSpace(titulo))
            return titulo;
        if (specs.Count >= 2)
            return $"Especialista en {specs[0]} y {specs[1]}";
        if (specs.Count == 1)
            return specs[0];

        return "Profesional de salud";
    }

    public static string ConstruirComoTrabajo(ProfesionalDto p)
    {
        var titulo = p.Titulo?.Trim() ?? "";
        var specs  = EspecialidadesVisibles(p);

        if (specs.Count > 0)
        {
            var areas = specs.Count <= 3
                ? string.Join(", ", specs)
                : string.Join(", ", specs.Take(3)) + " y otras áreas";
            return $"Trabajo con un enfoque colaborativo donde la persona es protagonista. Utilizo técnicas basadas en evidencia en {areas.ToLowerInvariant()}.";
        }

        if (!string.IsNullOrWhiteSpace(titulo))
            return $"Trabajo con un enfoque colaborativo y orientado a resultados, adaptado a las necesidades de cada persona, desde mi práctica como {titulo.ToLowerInvariant()}.";

        return "Trabajo con un enfoque colaborativo donde la persona es protagonista de su proceso, con técnicas basadas en evidencia según cada caso.";
    }

    public static IReadOnlyList<string> ConstruirLineasExperiencia(
        ProfesionalDto p,
        IReadOnlyList<ProfesionalEstudioDto> estudios)
    {
        var lineas = new List<string>();

        if (p.AnosExperiencia is > 0)
            lineas.Add($"📍 {p.AnosExperiencia} años de experiencia profesional");

        var rol   = string.IsNullOrWhiteSpace(p.Titulo) ? "Práctica profesional" : p.Titulo.Trim();
        var ciudad = p.Ciudad?.Trim();
        lineas.Add(string.IsNullOrWhiteSpace(ciudad)
            ? $"📍 {rol} · actualidad"
            : $"📍 {rol} · {ciudad} · actualidad");

        foreach (var est in estudios.Take(2))
        {
            var periodo = est.AnoEgreso.HasValue ? est.AnoEgreso.Value.ToString() : "—";
            lineas.Add($"📍 {est.Titulo} · {est.Universidad} · {periodo}");
        }

        return lineas;
    }

    private static bool CoincideConTitulo(string especialidad, string? titulo)
        => !string.IsNullOrWhiteSpace(titulo)
           && string.Equals(especialidad.Trim(), titulo.Trim(), StringComparison.OrdinalIgnoreCase);
}

using Trebol.Model.Enums;

namespace Trebol.Web.Helpers;

/// <summary>Etiquetas y textos de ayuda para tipos de cita (Asesoría / Seguimiento).</summary>
public static class CitaTipoHelper
{
    public static string Etiqueta(TipoCita tipo) => tipo switch
    {
        TipoCita.Seguimiento => "Proceso profesional o terapéutico",
        _                    => "Asesoría"
    };

    public static string Descripcion(TipoCita tipo) => tipo switch
    {
        TipoCita.Seguimiento =>
            "Acompañamiento en varias sesiones para trabajar de forma más profunda " +
            "tu bienestar emocional o un proceso terapéutico con el profesional.",
        _ =>
            "Una sesión puntual para orientarte, aclarar dudas o recibir guía en un tema concreto. " +
            "No implica un proceso continuo."
    };
}

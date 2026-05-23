namespace Trebol.Model.DTOs.PerfilOrador;

public class ComentarioPerfilDto
{
    public int     ComentarioId   { get; set; }
    public int     UsuarioId      { get; set; }
    public string  NombreUsuario  { get; set; } = string.Empty;
    public string  Iniciales      { get; set; } = string.Empty;
    public string  Contenido      { get; set; } = string.Empty;
    public byte?   Puntuacion     { get; set; }
    public DateTime Fecha         { get; set; }
    public bool    EsPropio       { get; set; }
}

public class ResumenComentariosPerfilDto
{
    public double Promedio       { get; set; }
    public int    Total          { get; set; }
    public int    Estrellas5     { get; set; }
    public int    Estrellas4     { get; set; }
    public int    Estrellas3     { get; set; }
    public int    Estrellas2     { get; set; }
    public int    Estrellas1     { get; set; }

    public int Porcentaje(byte estrellas)
    {
        if (Total == 0) return 0;
        var n = estrellas switch
        {
            5 => Estrellas5,
            4 => Estrellas4,
            3 => Estrellas3,
            2 => Estrellas2,
            1 => Estrellas1,
            _ => 0
        };
        return (int)Math.Round(n * 100.0 / Total);
    }
}

public class CrearComentarioPerfilDto
{
    public int    ProfesionalId { get; set; }
    public int    UsuarioId     { get; set; }
    public string Contenido     { get; set; } = string.Empty;
    public byte   Puntuacion    { get; set; }
}

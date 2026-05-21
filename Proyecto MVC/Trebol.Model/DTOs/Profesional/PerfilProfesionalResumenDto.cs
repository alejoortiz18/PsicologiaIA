namespace Trebol.Model.DTOs.Profesional;

public class PerfilProfesionalResumenDto
{
    public int TotalSeguidores  { get; set; }
    public int TotalSalas       { get; set; }
    public int SalasAbiertas    { get; set; }
    public int SalasCerradas    { get; set; }
    public int SalasProximas    { get; set; }
    public int CitasProximas    { get; set; }
    public int CitasPendientes  { get; set; }
    public int CitasCompletadas { get; set; }
    public int CitasCanceladas  { get; set; }
    public int CitasTotal       { get; set; }
    public decimal IngresosTotal  { get; set; }
    public decimal IngresosMes    { get; set; }
    public int TotalPacientes   { get; set; }
}

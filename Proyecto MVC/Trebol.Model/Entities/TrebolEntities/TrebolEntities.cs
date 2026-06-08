// ============================================================
// ENTIDADES STUB — Trebol.Model
// Estas clases son placeholders para compilación.
// Se reemplazarán con el scaffold de EF Core una vez creada
// la base de datos TrebolDB:
//
//   dotnet ef dbcontext scaffold \
//     "Server=.\SQLEXPRESS;Database=TrebolDB;Trusted_Connection=True;TrustServerCertificate=True;" \
//     Microsoft.EntityFrameworkCore.SqlServer \
//     -o Entities/TrebolEntities \
//     --context AppDbContext --force \
//     --project Trebol.Model --startup-project Trebol.Web
// ============================================================
namespace Trebol.Model.Entities.TrebolEntities;

// ── Catálogos ─────────────────────────────────────────────────
public class Pais          { public int PaisId { get; set; } public string Nombre { get; set; } = string.Empty; public string Codigo { get; set; } = string.Empty; public string Moneda { get; set; } = string.Empty; }
public class Ciudad        { public int CiudadId { get; set; } public int PaisId { get; set; } public string Nombre { get; set; } = string.Empty; }
public class Especialidad  { public int EspecialidadId { get; set; } public string Nombre { get; set; } = string.Empty; }
public class Categoria     { public int CategoriaId { get; set; } public string Nombre { get; set; } = string.Empty; }
public class Idioma        { public int IdiomaId { get; set; } public string Nombre { get; set; } = string.Empty; }
public class Configuracion
{
    public int ConfigId { get; set; }
    public string Clave { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
}

// ── Actores ───────────────────────────────────────────────────
public class Usuario
{
    public int       UsuarioId         { get; set; }
    public string    NombreCompleto    { get; set; } = string.Empty;
    public string    Correo            { get; set; } = string.Empty;
    public string    NumeroDocumento   { get; set; } = string.Empty;
    public string    Alias             { get; set; } = string.Empty;
    public string?   Celular           { get; set; }
    public DateOnly? FechaNacimiento   { get; set; }
    public int?      CiudadId          { get; set; }
    public string?   FotoPerfil        { get; set; }
    public string?   PasswordHash      { get; set; }
    public string    Estado            { get; set; } = "Pendiente";
    public DateTime  FechaCreacion     { get; set; }
    public DateTime  FechaModificacion { get; set; }
}

public class Profesional
{
    public int      ProfesionalId             { get; set; }
    public string   NombreCompleto            { get; set; } = string.Empty;
    public string   Correo                    { get; set; } = string.Empty;
    public string   NumeroDocumento           { get; set; } = string.Empty;
    public string   Alias                     { get; set; } = string.Empty;
    public string?  Celular                   { get; set; }
    public string   NumerTarjetaProfesional   { get; set; } = string.Empty;
    public string?  UrlDocumentoIdentidad     { get; set; }
    public string?  UrlTarjetaProfesional     { get; set; }
    public string?  PasswordHash              { get; set; }
    public int?     PaisId                    { get; set; }
    public int?     CiudadId                  { get; set; }
    public string?  Ocupacion                 { get; set; }
    public string?  TipoProfesional           { get; set; }
    public string?  SobreMi                   { get; set; }
    public byte?    AnosExperiencia           { get; set; }
    public string?  FotoPerfil                { get; set; }
    public decimal? ValorPorHora              { get; set; }
    public string   Estado                    { get; set; } = "Pendiente";
    public string?  MotivoRechazo             { get; set; }
    public DateTime FechaCreacion             { get; set; }
    public DateTime FechaModificacion         { get; set; }
}

public class Administrador
{
    public int    AdministradorId { get; set; }
    public string NombreCompleto  { get; set; } = string.Empty;
    public string Correo          { get; set; } = string.Empty;
    public string PasswordHash    { get; set; } = string.Empty;
    public string Estado          { get; set; } = "Activo";
    public DateTime FechaCreacion    { get; set; }
    public DateTime FechaModificacion { get; set; }
}

// ── Perfil profesional ────────────────────────────────────────
public class ProfesionalEspecialidad { public int Id { get; set; } public int ProfesionalId { get; set; } public int EspecialidadId { get; set; } }
public class ProfesionalEstudio      { public int EstudioId { get; set; } public int ProfesionalId { get; set; } public string Titulo { get; set; } = string.Empty; public string Institucion { get; set; } = string.Empty; public int Anio { get; set; } }
public class ProfesionalIdioma       { public int Id { get; set; } public int ProfesionalId { get; set; } public int IdiomaId { get; set; } }

// ── Tokens ────────────────────────────────────────────────────
public class TokenValidacion   { public int TokenId { get; set; } public int UsuarioId { get; set; } public string Token { get; set; } = string.Empty; public DateTime Expiracion { get; set; } public bool Usado { get; set; } }
public class TokenActivacion   { public int TokenId { get; set; } public int ProfesionalId { get; set; } public string Token { get; set; } = string.Empty; public DateTime Expiracion { get; set; } public bool Usado { get; set; } }
public class TokenRecuperacion { public int TokenId { get; set; } public string TipoEntidad { get; set; } = string.Empty; public int EntidadId { get; set; } public string Token { get; set; } = string.Empty; public DateTime Expiracion { get; set; } public bool Usado { get; set; } }
public class Sesion            { public int SesionId { get; set; } public string TipoEntidad { get; set; } = string.Empty; public int EntidadId { get; set; } public DateTime Inicio { get; set; } public DateTime? Fin { get; set; } public string? Ip { get; set; } }

// ── Disponibilidad ────────────────────────────────────────────
public class HorarioDisponible { public int HorarioId { get; set; } public int ProfesionalId { get; set; } public byte DiaSemana { get; set; } public TimeOnly HoraInicio { get; set; } public TimeOnly HoraFin { get; set; } public bool Estado { get; set; } = true; }
public class HorarioBloqueado  { public int BloqueoId { get; set; } public int ProfesionalId { get; set; } public DateTime FechaHoraInicio { get; set; } public DateTime FechaHoraFin { get; set; } public string? Motivo { get; set; } public DateTime FechaCreacion { get; set; } }
public class CuentaBancaria
{
    public int CuentaId { get; set; }
    public int ProfesionalId { get; set; }
    public string Banco { get; set; } = string.Empty;
    public string NumeroCuenta { get; set; } = string.Empty;
    public string TipoCuenta { get; set; } = string.Empty;
}

public class CuentaBancariaUsuario
{
    public int CuentaBancariaUsuarioId { get; set; }
    public int UsuarioId { get; set; }
    public string Banco { get; set; } = string.Empty;
    public string TipoCuenta { get; set; } = string.Empty;
    public string NumeroCuenta { get; set; } = string.Empty;
    public string Titular { get; set; } = string.Empty;
    public string? DocumentoTitular { get; set; }
    public string Estado { get; set; } = "Activa";
    public DateTime FechaCreacion { get; set; }
    public DateTime FechaModificacion { get; set; }
}

public class MovimientoSaldoUsuario
{
    public int MovimientoSaldoUsuarioId { get; set; }
    public int UsuarioId { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public string? OrigenEntidad { get; set; }
    public int? OrigenEntidadId { get; set; }
    public int? ProfesionalId { get; set; }
    public int? PagoCitaId { get; set; }
    public int? PagoInscripcionId { get; set; }
    public int? SaldoRecargaId { get; set; }
    public decimal MontoBruto { get; set; }
    public decimal Comision { get; set; }
    public decimal MontoNeto { get; set; }
    public string Estado { get; set; } = "SaldoFavor";
    public int? CuentaBancariaUsuarioId { get; set; }
    public DateTime? FechaLimiteRetractacion { get; set; }
    public DateTime? FechaEstimadaDesembolso { get; set; }
    public DateTime? FechaDesembolso { get; set; }
    public string? Notas { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime FechaModificacion { get; set; }
}

public class SaldoRecarga
{
    public int SaldoRecargaId { get; set; }
    public int UsuarioId { get; set; }
    public decimal Monto { get; set; }
    public string MetodoPago { get; set; } = string.Empty;
    public string Estado { get; set; } = "Pendiente";
    public string? ReferenciaPassarela { get; set; }
    public int? MovimientoSaldoUsuarioId { get; set; }
    public DateTime FechaPago { get; set; }
    public DateTime FechaModificacion { get; set; }
}

public class CitaAsistencia
{
    public int CitaAsistenciaId { get; set; }
    public int CitaId { get; set; }
    public DateTime? UsuarioIngresoSala { get; set; }
    public DateTime? ProfesionalIngresoSala { get; set; }
    public bool ProfesionalReportoAusencia { get; set; }
    public DateTime? FechaReporteAusencia { get; set; }
    public string? MensajeReporteAusencia { get; set; }
    public bool EvaluacionCompleta { get; set; }
    public string? TipoAusencia { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime FechaModificacion { get; set; }
}

public class NovedadUsuario
{
    public int NovedadUsuarioId { get; set; }
    public int UsuarioId { get; set; }
    public string TipoNovedad { get; set; } = string.Empty;
    public string EntidadTipo { get; set; } = string.Empty;
    public int EntidadId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
    public string Estado { get; set; } = "Pendiente";
    public string? OpcionElegida { get; set; }
    public DateTime? FechaResolucion { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime FechaModificacion { get; set; }
}

public class AjusteSaldoProfesional
{
    public int AjusteSaldoProfesionalId { get; set; }
    public int ProfesionalId { get; set; }
    public int MovimientoSaldoUsuarioId { get; set; }
    public decimal Monto { get; set; }
    public string MotivoCodigo { get; set; } = string.Empty;
    public string MotivoDetalle { get; set; } = string.Empty;
    public int? CitaId { get; set; }
    public int? InscripcionId { get; set; }
    public DateTime FechaCreacion { get; set; }
}

// ── Salas y eventos ───────────────────────────────────────────
public class Sala
{
    public int      SalaId            { get; set; }
    public int      ProfesionalId     { get; set; }
    public int?     CategoriaId       { get; set; }
    public string   Nombre            { get; set; } = string.Empty;
    public string?  Descripcion       { get; set; }
    public string   Tipo              { get; set; } = "Publica";
    public int      CupoMaximo        { get; set; }
    public decimal  Precio            { get; set; }
    public bool     ChatHabilitado    { get; set; } = true;
    public string   Estado            { get; set; } = "Abierta";
    public DateTime FechaCreacion     { get; set; }
    public DateTime FechaModificacion { get; set; }
}

public class Evento        { public int EventoId { get; set; } public int SalaId { get; set; } public string Titulo { get; set; } = string.Empty; public DateTime Inicio { get; set; } public DateTime Fin { get; set; } public string Estado { get; set; } = "Abierto"; }
public class MensajeEvento { public int MensajeId { get; set; } public int EventoId { get; set; } public string TipoEmisor { get; set; } = string.Empty; public int EmisorId { get; set; } public string Contenido { get; set; } = string.Empty; public DateTime FechaEnvio { get; set; } }

// ── Inscripciones y pagos ─────────────────────────────────────
public class Inscripcion    { public int InscripcionId { get; set; } public int UsuarioId { get; set; } public int SalaId { get; set; } public string Estado { get; set; } = "PendientePago"; public string? CodigoInscripcion { get; set; } public DateTime FechaInscripcion { get; set; } public DateTime FechaModificacion { get; set; } }
public class PagoInscripcion { public int PagoInscripcionId { get; set; } public int InscripcionId { get; set; } public decimal Monto { get; set; } public string MetodoPago { get; set; } = string.Empty; public string Estado { get; set; } = "Pendiente"; public DateTime FechaPago { get; set; } public DateTime FechaModificacion { get; set; } }
public class Pago        { public int PagoId { get; set; } public int InscripcionId { get; set; } public decimal Monto { get; set; } public string MetodoPago { get; set; } = string.Empty; public string Estado { get; set; } = "Pendiente"; public DateTime FechaTransaccion { get; set; } public string? Referencia { get; set; } }
public class LogPago     { public int LogId { get; set; } public int PagoId { get; set; } public string Evento { get; set; } = string.Empty; public DateTime Fecha { get; set; } public string? Detalle { get; set; } }

// ── Citas ─────────────────────────────────────────────────────
public class Cita            { public int CitaId { get; set; } public int UsuarioId { get; set; } public int ProfesionalId { get; set; } public DateTime FechaHora { get; set; } public DateTime FechaHoraFin { get; set; } public string Tipo { get; set; } = "Seguimiento"; public string Estado { get; set; } = "Programada"; public bool MostrarAlias { get; set; } public DateTime FechaCreacion { get; set; } public DateTime FechaModificacion { get; set; } }
public class PagoCita        { public int PagoCitaId { get; set; } public int CitaId { get; set; } public int UsuarioId { get; set; } public decimal Monto { get; set; } public decimal TarifaPlataforma { get; set; } public string MetodoPago { get; set; } = string.Empty; public string Estado { get; set; } = "Pendiente"; public string? ReferenciaPassarela { get; set; } public DateTime FechaPago { get; set; } public DateTime FechaModificacion { get; set; } }
public class Recomendacion   { public int RecomendacionId { get; set; } public int CitaId { get; set; } public int ProfesionalId { get; set; } public int UsuarioId { get; set; } public string Contenido { get; set; } = string.Empty; public DateTime Fecha { get; set; } }
public class ComentarioPrivado { public int ComentarioId { get; set; } public int CitaId { get; set; } public int ProfesionalId { get; set; } public string Contenido { get; set; } = string.Empty; public DateTime Fecha { get; set; } }
public class HistorialClinico  { public int HistorialId { get; set; } public int UsuarioId { get; set; } public int ProfesionalId { get; set; } public string Resumen { get; set; } = string.Empty; public DateTime Fecha { get; set; } }

// ── Red social ────────────────────────────────────────────────
public class Seguidor               { public int SeguidorId { get; set; } public int UsuarioId { get; set; } public int ProfesionalId { get; set; } public DateTime Fecha { get; set; } }
public class MeGusta                { public int MeGustaId { get; set; } public string TipoEntidad { get; set; } = string.Empty; public int EntidadId { get; set; } public int UsuarioId { get; set; } public DateTime Fecha { get; set; } }
public class ComentarioProfesional  { public int ComentarioId { get; set; } public int ProfesionalId { get; set; } public int UsuarioId { get; set; } public string Contenido { get; set; } = string.Empty; public byte Puntuacion { get; set; } public DateTime Fecha { get; set; } }
public class RespuestaComentario    { public int RespuestaId { get; set; } public int ComentarioId { get; set; } public int ProfesionalId { get; set; } public string Contenido { get; set; } = string.Empty; public DateTime Fecha { get; set; } }
public class ColaboracionProfesional { public int ColaboracionId { get; set; } public int ProfesionalId1 { get; set; } public int ProfesionalId2 { get; set; } public string Estado { get; set; } = "Activa"; public DateTime FechaCreacion { get; set; } public DateTime FechaModificacion { get; set; } }

// ── Mensajería ────────────────────────────────────────────────
public class Conversacion   { public int ConversacionId { get; set; } public int? UsuarioId { get; set; } public int ProfesionalId { get; set; } public int? ProfesionalIdColega { get; set; } public DateTime FechaInicio { get; set; } public DateTime? UltimoMensaje { get; set; } public string Estado { get; set; } = "Activa"; }
public class MensajePrivado { public int MensajePrivadoId { get; set; } public int ConversacionId { get; set; } public int AutorId { get; set; } public string TipoAutor { get; set; } = string.Empty; public string Texto { get; set; } = string.Empty; public bool Leido { get; set; } public DateTime FechaCreacion { get; set; } }

// ── Notificaciones ────────────────────────────────────────────
public class Notificacion { public int NotificacionId { get; set; } public string Tipo { get; set; } = string.Empty; public int? EntidadId { get; set; } public string Titulo { get; set; } = string.Empty; public string? Descripcion { get; set; } public string Estado { get; set; } = "Pendiente"; public bool Leida { get; set; } public DateTime FechaCreacion { get; set; } public DateTime FechaModificacion { get; set; } }

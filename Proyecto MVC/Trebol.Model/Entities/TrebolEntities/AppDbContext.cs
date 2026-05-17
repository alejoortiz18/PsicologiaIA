using Microsoft.EntityFrameworkCore;

namespace Trebol.Model.Entities.TrebolEntities;

/// <summary>
/// Contexto principal de Entity Framework Core para TrebolDB.
/// Este archivo es generado/actualizado con:
///   dotnet ef dbcontext scaffold "..." Microsoft.EntityFrameworkCore.SqlServer
///   -o Entities/TrebolEntities --context AppDbContext --force
///   --project Trebol.Model --startup-project Trebol.Web
/// </summary>
public partial class AppDbContext : DbContext
{
    public AppDbContext() { }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ── Catálogos ────────────────────────────────────────────────────────
    public virtual DbSet<Pais>          Paises          { get; set; }
    public virtual DbSet<Ciudad>        Ciudades        { get; set; }
    public virtual DbSet<Especialidad>  Especialidades  { get; set; }
    public virtual DbSet<Categoria>     Categorias      { get; set; }
    public virtual DbSet<Idioma>        Idiomas         { get; set; }
    public virtual DbSet<Configuracion> Configuraciones { get; set; }

    // ── Actores ──────────────────────────────────────────────────────────
    public virtual DbSet<Usuario>       Usuarios        { get; set; }
    public virtual DbSet<Profesional>   Profesionales   { get; set; }
    public virtual DbSet<Administrador> Administradores { get; set; }

    // ── Perfil profesional ───────────────────────────────────────────────
    public virtual DbSet<ProfesionalEspecialidad> ProfesionalEspecialidades { get; set; }
    public virtual DbSet<ProfesionalEstudio>      ProfesionalEstudios       { get; set; }
    public virtual DbSet<ProfesionalIdioma>       ProfesionalIdiomas        { get; set; }

    // ── Tokens ───────────────────────────────────────────────────────────
    public virtual DbSet<TokenValidacion>   TokensValidacion   { get; set; }
    public virtual DbSet<TokenActivacion>   TokensActivacion   { get; set; }
    public virtual DbSet<TokenRecuperacion> TokensRecuperacion { get; set; }
    public virtual DbSet<Sesion>            Sesiones           { get; set; }

    // ── Disponibilidad ───────────────────────────────────────────────────
    public virtual DbSet<HorarioDisponible>  HorariosDisponibles  { get; set; }
    public virtual DbSet<HorarioBloqueado>   HorariosBloqueados   { get; set; }
    public virtual DbSet<CuentaBancaria>     CuentasBancarias     { get; set; }

    // ── Salas y eventos ──────────────────────────────────────────────────
    public virtual DbSet<Sala>          Salas          { get; set; }
    public virtual DbSet<Evento>        Eventos        { get; set; }
    public virtual DbSet<MensajeEvento> MensajesEvento { get; set; }

    // ── Inscripciones y pagos ────────────────────────────────────────────
    public virtual DbSet<Inscripcion>     Inscripciones    { get; set; }
    public virtual DbSet<PagoInscripcion> PagosInscripcion { get; set; }

    // ── Citas ────────────────────────────────────────────────────────────
    public virtual DbSet<Cita>     Citas     { get; set; }
    public virtual DbSet<PagoCita> PagosCita { get; set; }

    // ── Red social ───────────────────────────────────────────────────────
    public virtual DbSet<Seguidor>               Seguidores             { get; set; }
    public virtual DbSet<ComentarioProfesional>  ComentariosProfesional { get; set; }
    public virtual DbSet<ColaboracionProfesional> ColaboracionesProfesionales { get; set; }

    // ── Mensajería ───────────────────────────────────────────────────────
    public virtual DbSet<Conversacion>   Conversaciones   { get; set; }
    public virtual DbSet<MensajePrivado> MensajesPrivados { get; set; }

    // ── Notificaciones ───────────────────────────────────────────────────
    public virtual DbSet<Notificacion>   Notificaciones   { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // ── Nombres de tabla (todas son SINGULARES en la DB) ─────────────
        modelBuilder.Entity<Pais>().ToTable("Pais");
        modelBuilder.Entity<Ciudad>().ToTable("Ciudad");
        modelBuilder.Entity<Especialidad>().ToTable("Especialidad");
        modelBuilder.Entity<Categoria>().ToTable("Categoria");
        modelBuilder.Entity<Idioma>().ToTable("Idioma");
        modelBuilder.Entity<Configuracion>().ToTable("Configuracion");
        modelBuilder.Entity<Usuario>().ToTable("Usuario");
        modelBuilder.Entity<Profesional>().ToTable("Profesional");
        modelBuilder.Entity<Administrador>().ToTable("Administrador");
        modelBuilder.Entity<ProfesionalEspecialidad>().ToTable("ProfesionalEspecialidad");
        modelBuilder.Entity<ProfesionalEstudio>().ToTable("ProfesionalEstudio");
        modelBuilder.Entity<ProfesionalIdioma>().ToTable("ProfesionalIdioma");
        modelBuilder.Entity<TokenValidacion>().ToTable("TokenValidacion");
        modelBuilder.Entity<TokenActivacion>().ToTable("TokenActivacion");
        modelBuilder.Entity<TokenRecuperacion>().ToTable("TokenRecuperacion");
        modelBuilder.Entity<Sesion>().ToTable("Sesion");
        modelBuilder.Entity<HorarioDisponible>().ToTable("HorarioDisponible");
        modelBuilder.Entity<HorarioBloqueado>().ToTable("HorarioBloqueado");
        modelBuilder.Entity<CuentaBancaria>().ToTable("CuentaBancaria");
        modelBuilder.Entity<Sala>().ToTable("Sala");
        modelBuilder.Entity<Evento>().ToTable("Evento");
        modelBuilder.Entity<MensajeEvento>().ToTable("MensajeEvento");
        modelBuilder.Entity<Inscripcion>().ToTable("Inscripcion");
        modelBuilder.Entity<PagoInscripcion>().ToTable("PagoInscripcion");
        modelBuilder.Entity<Cita>().ToTable("Cita");
        modelBuilder.Entity<PagoCita>().ToTable("PagoCita");
        modelBuilder.Entity<Seguidor>().ToTable("Seguidor");
        modelBuilder.Entity<ComentarioProfesional>().ToTable("ComentarioProfesional");
        modelBuilder.Entity<ColaboracionProfesional>().ToTable("ColaboracionProfesional");
        modelBuilder.Entity<Conversacion>().ToTable("Conversacion");
        modelBuilder.Entity<MensajePrivado>().ToTable("MensajePrivado");
        modelBuilder.Entity<Notificacion>().ToTable("Notificacion");

        // ── PKs no convencionales ─────────────────────────────────────────
        modelBuilder.Entity<Administrador>().HasKey(e => e.AdministradorId);
        modelBuilder.Entity<HorarioDisponible>().HasKey(e => e.HorarioId);
        modelBuilder.Entity<HorarioBloqueado>().HasKey(e => e.BloqueoId);
        modelBuilder.Entity<CuentaBancaria>().HasKey(e => e.CuentaId);
        modelBuilder.Entity<TokenValidacion>().HasKey(e => e.TokenId);
        modelBuilder.Entity<TokenActivacion>().HasKey(e => e.TokenId);
        modelBuilder.Entity<TokenRecuperacion>().HasKey(e => e.TokenId);
        modelBuilder.Entity<Sesion>().HasKey(e => e.SesionId);
        modelBuilder.Entity<MensajeEvento>().HasKey(e => e.MensajeId);
        modelBuilder.Entity<Seguidor>().HasKey(e => e.SeguidorId);
        modelBuilder.Entity<ComentarioProfesional>().HasKey(e => e.ComentarioId);
        modelBuilder.Entity<ColaboracionProfesional>().HasKey(e => e.ColaboracionId);
        modelBuilder.Entity<ProfesionalEstudio>().HasKey(e => e.EstudioId);

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

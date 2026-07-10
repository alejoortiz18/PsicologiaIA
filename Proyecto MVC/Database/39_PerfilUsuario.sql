-- Perfil usuario: eventos inscritos paginados para tab del perfil
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

CREATE OR ALTER PROCEDURE sp_ContarEventosInscritosPerfilUsuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*) AS Total
    FROM   Inscripcion i
    JOIN   Sala s ON s.SalaId = i.SalaId
    WHERE  i.UsuarioId = @UsuarioId
      AND  i.Estado NOT IN (N'Cancelada')
      AND  s.Tipo = N'Publica';
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerEventosInscritosPerfilUsuario
    @UsuarioId    INT,
    @Pagina       INT = 1,
    @TamanoPagina INT = 7
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.SalaId,
           i.InscripcionId,
           COALESCE(ev.Nombre, s.Nombre) AS Titulo,
           p.NombreCompleto AS NombreProfesional,
           ev.FechaInicio,
           ev.FechaFin,
           s.Estado AS EstadoSala,
           i.Estado AS EstadoInscripcion,
           ISNULL(s.Precio, 0) AS Precio,
           CASE WHEN ev.FechaInicio IS NOT NULL
                     AND ev.FechaInicio <= GETDATE()
                     AND (ev.FechaFin IS NULL OR ev.FechaFin >= GETDATE())
                THEN 1 ELSE 0 END AS EnVivo,
           CASE WHEN s.Estado = N'Cerrada'
                     OR (ev.FechaFin IS NOT NULL AND ev.FechaFin < GETDATE())
                THEN 1 ELSE 0 END AS Finalizado
    FROM   Inscripcion i
    JOIN   Sala s ON s.SalaId = i.SalaId
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId
        ORDER  BY e.FechaInicio DESC
    ) ev
    WHERE  i.UsuarioId = @UsuarioId
      AND  i.Estado NOT IN (N'Cancelada')
      AND  s.Tipo = N'Publica'
    ORDER  BY
        CASE WHEN ev.FechaFin IS NOT NULL AND ev.FechaFin < GETDATE() THEN 1 ELSE 0 END,
        ev.FechaInicio DESC
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH  NEXT @TamanoPagina ROWS ONLY;
END
GO

PRINT N'39_PerfilUsuario.sql aplicado.';

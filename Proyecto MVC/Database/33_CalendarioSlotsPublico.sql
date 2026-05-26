-- Calendario público del profesional: citas (privacidad) + eventos/salas públicas
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_ObtenerSlotsCalendarioPublico
    @ProfesionalId          INT,
    @Desde                  DATETIME2(0),
    @Hasta                  DATETIME2(0),
    @ViewerUsuarioId        INT = NULL,
    @ViewerProfesionalId    INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT c.FechaHora,
           DATEDIFF(MINUTE, c.FechaHora, c.FechaHoraFin) AS DuracionMinutos,
           N'CitaPrivada' AS TipoSlot,
           c.Tipo AS TipoCita,
           CASE
               WHEN (@ViewerUsuarioId IS NOT NULL AND c.UsuarioId = @ViewerUsuarioId)
                 OR (@ViewerProfesionalId IS NOT NULL AND c.ProfesionalClienteId = @ViewerProfesionalId)
               THEN NULL
               ELSE N'Ocupado'
           END AS Etiqueta,
           CAST(NULL AS NVARCHAR(300)) AS Subtitulo,
           CASE
               WHEN (@ViewerUsuarioId IS NOT NULL AND c.UsuarioId = @ViewerUsuarioId)
                 OR (@ViewerProfesionalId IS NOT NULL AND c.ProfesionalClienteId = @ViewerProfesionalId)
               THEN 1 ELSE 0
           END AS EsDetalleVisible
    FROM   Cita c
    WHERE  c.ProfesionalId = @ProfesionalId
      AND  c.FechaHora < @Hasta
      AND  c.FechaHoraFin > @Desde
      AND  c.Estado IN (N'Programada', N'Movida')

    UNION ALL

    SELECT e.FechaInicio,
           CASE
               WHEN DATEDIFF(MINUTE, e.FechaInicio, e.FechaFin) BETWEEN 1 AND 480
               THEN DATEDIFF(MINUTE, e.FechaInicio, e.FechaFin)
               ELSE 60
           END AS DuracionMinutos,
           N'EventoPublico' AS TipoSlot,
           CAST(NULL AS NVARCHAR(20)) AS TipoCita,
           COALESCE(NULLIF(LTRIM(RTRIM(e.Nombre)), N''), s.Nombre) AS Etiqueta,
           CASE
               WHEN cat.Nombre IS NOT NULL AND (
                    cat.Nombre LIKE N'%charla%' OR cat.Nombre LIKE N'%conferencia%'
                    OR cat.Nombre LIKE N'%taller%' OR cat.Nombre LIKE N'%webinar%')
               THEN N'Charla'
               ELSE N'Evento público'
           END AS Subtitulo,
           1 AS EsDetalleVisible
    FROM   Evento e
    INNER JOIN Sala s ON s.SalaId = e.SalaId
    LEFT JOIN Categoria cat ON cat.CategoriaId = s.CategoriaId
    WHERE  s.ProfesionalId = @ProfesionalId
      AND  s.Tipo = N'Publica'
      AND  s.Estado = N'Abierta'
      AND  e.Estado = N'Abierto'
      AND  e.FechaInicio >= @Desde
      AND  e.FechaInicio < @Hasta
    ORDER  BY FechaHora;
END
GO

PRINT N'sp_ObtenerSlotsCalendarioPublico aplicado.';
GO

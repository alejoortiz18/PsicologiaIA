-- Calendario del usuario: citas privadas + eventos inscritos
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_ObtenerSlotsCalendarioUsuario
    @UsuarioId INT,
    @Desde     DATETIME2(0),
    @Hasta     DATETIME2(0)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT c.FechaHora,
           DATEDIFF(MINUTE, c.FechaHora, c.FechaHoraFin) AS DuracionMinutos,
           N'CitaPrivada' AS TipoSlot,
           c.Tipo AS TipoCita,
           CAST(NULL AS NVARCHAR(200)) AS Etiqueta,
           CAST(NULL AS NVARCHAR(300)) AS Subtitulo,
           1 AS EsDetalleVisible,
           p.NombreCompleto AS NombreCliente,
           c.Estado AS EstadoCita,
           c.CitaId
    FROM   Cita c
    INNER JOIN Profesional p ON p.ProfesionalId = c.ProfesionalId
    WHERE  c.UsuarioId = @UsuarioId
      AND  c.FechaHora < @Hasta
      AND  c.FechaHoraFin > @Desde
      AND  c.Estado IN (N'Programada', N'Movida', N'Finalizada')

    UNION ALL

    SELECT ev.FechaInicio,
           CASE
               WHEN DATEDIFF(MINUTE, ev.FechaInicio, ev.FechaFin) BETWEEN 1 AND 480
               THEN DATEDIFF(MINUTE, ev.FechaInicio, ev.FechaFin)
               ELSE 60
           END AS DuracionMinutos,
           N'EventoPublico' AS TipoSlot,
           CAST(NULL AS NVARCHAR(20)) AS TipoCita,
           COALESCE(NULLIF(LTRIM(RTRIM(ev.Nombre)), N''), s.Nombre) AS Etiqueta,
           CASE
               WHEN cat.Nombre IS NOT NULL AND (
                    cat.Nombre LIKE N'%charla%' OR cat.Nombre LIKE N'%conferencia%'
                    OR cat.Nombre LIKE N'%taller%' OR cat.Nombre LIKE N'%webinar%')
               THEN N'Charla'
               ELSE N'Evento inscrito'
           END AS Subtitulo,
           1 AS EsDetalleVisible,
           CAST(NULL AS NVARCHAR(200)) AS NombreCliente,
           ev.Estado AS EstadoCita,
           CAST(NULL AS INT) AS CitaId
    FROM   Inscripcion i
    INNER JOIN Sala s ON s.SalaId = i.SalaId
    LEFT JOIN Categoria cat ON cat.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre, e.Estado
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId
        ORDER  BY e.FechaInicio DESC
    ) ev
    WHERE  i.UsuarioId = @UsuarioId
      AND  i.Estado NOT IN (N'Cancelada')
      AND  s.Tipo = N'Publica'
      AND  ev.FechaInicio IS NOT NULL
      AND  ev.FechaInicio < @Hasta
      AND  (
            CASE
                WHEN ev.FechaFin IS NULL THEN DATEADD(MINUTE, 120, ev.FechaInicio)
                WHEN DATEDIFF(MINUTE, ev.FechaInicio, ev.FechaFin) BETWEEN 1 AND 480
                    THEN ev.FechaFin
                ELSE DATEADD(MINUTE, 120, ev.FechaInicio)
            END > @Desde
          )

    ORDER BY FechaHora;
END
GO

PRINT N'sp_ObtenerSlotsCalendarioUsuario aplicado.';
GO

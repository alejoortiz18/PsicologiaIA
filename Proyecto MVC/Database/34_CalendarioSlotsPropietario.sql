-- Calendario del profesional (vista propietario): detalle completo de citas y eventos
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_ObtenerSlotsCalendarioPropietario
    @ProfesionalId INT,
    @Desde         DATETIME2(0),
    @Hasta         DATETIME2(0)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT c.FechaHora,
           DATEDIFF(MINUTE, c.FechaHora, c.FechaHoraFin) AS DuracionMinutos,
           N'CitaPrivada' AS TipoSlot,
           c.Tipo AS TipoCita,
           COALESCE(u.NombreCompleto, pr.NombreCompleto, N'Cliente') AS NombreCliente,
           c.Estado AS EstadoCita,
           c.CitaId,
           CAST(NULL AS NVARCHAR(300)) AS Etiqueta,
           CAST(NULL AS NVARCHAR(300)) AS Subtitulo,
           1 AS EsDetalleVisible
    FROM   Cita c
    LEFT JOIN Usuario u ON u.UsuarioId = c.UsuarioId
    LEFT JOIN Profesional pr ON pr.ProfesionalId = c.ProfesionalClienteId
    WHERE  c.ProfesionalId = @ProfesionalId
      AND  c.FechaHora < @Hasta
      AND  c.FechaHoraFin > @Desde
      AND  c.Estado IN (N'Programada', N'Movida', N'Finalizada', N'Cancelada')

    UNION ALL

    SELECT e.FechaInicio,
           CASE
               WHEN DATEDIFF(MINUTE, e.FechaInicio, e.FechaFin) BETWEEN 1 AND 480
               THEN DATEDIFF(MINUTE, e.FechaInicio, e.FechaFin)
               ELSE 60
           END AS DuracionMinutos,
           N'EventoPublico' AS TipoSlot,
           CAST(NULL AS NVARCHAR(20)) AS TipoCita,
           CAST(NULL AS NVARCHAR(200)) AS NombreCliente,
           e.Estado AS EstadoCita,
           e.EventoId AS CitaId,
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
      AND  e.FechaInicio >= @Desde
      AND  e.FechaInicio < @Hasta
    ORDER  BY FechaHora;
END
GO

PRINT N'sp_ObtenerSlotsCalendarioPropietario aplicado.';
GO

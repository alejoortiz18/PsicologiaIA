-- Cierra eventos y salas cuya fecha de fin ya pasó (Mis eventos / listados profesional).
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_CerrarSalasEventosVencidos
    @ProfesionalId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE e
    SET    e.Estado = N'Cerrado'
    FROM   Evento e
    INNER JOIN Sala s ON s.SalaId = e.SalaId
    WHERE  e.Estado = N'Abierto'
      AND  e.FechaFin < GETDATE()
      AND  (@ProfesionalId IS NULL OR s.ProfesionalId = @ProfesionalId);

    UPDATE s
    SET    s.Estado = N'Cerrada',
           s.FechaModificacion = GETDATE()
    FROM   Sala s
    WHERE  s.Estado = N'Abierta'
      AND  (@ProfesionalId IS NULL OR s.ProfesionalId = @ProfesionalId)
      AND  EXISTS (SELECT 1 FROM Evento e WHERE e.SalaId = s.SalaId)
      AND  NOT EXISTS (
               SELECT 1
               FROM   Evento e
               WHERE  e.SalaId = s.SalaId
                 AND  e.FechaFin >= GETDATE()
                 AND  e.Estado IN (N'Abierto', N'Cerrado')
           );
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerSalasPorProfesional
    @ProfesionalId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.SalaId,
           s.ProfesionalId,
           s.Nombre AS Titulo,
           s.Descripcion,
           s.Tipo,
           s.Estado,
           s.CategoriaId,
           c.Nombre AS Categoria,
           NULL AS ImagenUrl,
           s.CupoMaximo AS Capacidad,
           ev.FechaInicio,
           ev.FechaFin,
           s.Precio,
           (SELECT COUNT(*) FROM Inscripcion i
            WHERE i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')) AS TotalInscritos
    FROM   Sala s
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId
        ORDER  BY e.FechaInicio DESC
    ) ev
    WHERE  s.ProfesionalId = @ProfesionalId
    ORDER  BY ISNULL(ev.FechaInicio, s.FechaCreacion) DESC;
END
GO

PRINT N'sp_CerrarSalasEventosVencidos y sp_ObtenerSalasPorProfesional actualizados.';
GO

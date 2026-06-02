-- Eventos inscritos del usuario que ya finalizaron (sala cerrada o sesión terminada)
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_ObtenerEventosInscritosCerradosUsuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT s.SalaId,
           s.ProfesionalId,
           COALESCE(ev.Nombre, s.Nombre) AS Titulo,
           p.NombreCompleto AS NombreProfesional,
           c.Nombre AS Categoria,
           s.Estado,
           s.CupoMaximo AS Capacidad,
           s.Precio,
           insc.TotalInscritos,
           ev.FechaInicio,
           ev.FechaFin,
           1 AS EsInscrito,
           CASE WHEN EXISTS (
                SELECT 1 FROM Seguidor sg
                WHERE sg.ProfesionalId = s.ProfesionalId AND sg.UsuarioId = @UsuarioId)
                THEN 1 ELSE 0 END AS EsSeguido,
           (SELECT COUNT(*) FROM Seguidor sg WHERE sg.ProfesionalId = s.ProfesionalId) AS TotalSeguidos
    FROM   Inscripcion i
    JOIN   Sala s ON s.SalaId = i.SalaId
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT COUNT(*) AS TotalInscritos
        FROM   Inscripcion ix
        WHERE  ix.SalaId = s.SalaId AND ix.Estado NOT IN (N'Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre, e.Estado AS EstadoEvento
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId
        ORDER  BY e.FechaInicio DESC
    ) ev
    WHERE  i.UsuarioId = @UsuarioId
      AND  i.Estado NOT IN (N'Cancelada')
      AND  s.Tipo = N'Publica'
      AND  (
            s.Estado = N'Cerrada'
            OR ev.EstadoEvento = N'Cerrado'
            OR (
                CASE
                    WHEN ev.FechaInicio IS NULL THEN ev.FechaFin
                    WHEN ev.FechaFin IS NULL THEN DATEADD(MINUTE, 120, ev.FechaInicio)
                    WHEN DATEDIFF(MINUTE, ev.FechaInicio, ev.FechaFin) BETWEEN 15 AND 480
                        THEN ev.FechaFin
                    ELSE DATEADD(MINUTE, 120, ev.FechaInicio)
                END IS NOT NULL
                AND CASE
                    WHEN ev.FechaInicio IS NULL THEN ev.FechaFin
                    WHEN ev.FechaFin IS NULL THEN DATEADD(MINUTE, 120, ev.FechaInicio)
                    WHEN DATEDIFF(MINUTE, ev.FechaInicio, ev.FechaFin) BETWEEN 15 AND 480
                        THEN ev.FechaFin
                    ELSE DATEADD(MINUTE, 120, ev.FechaInicio)
                END < GETDATE()
            )
          )
    ORDER  BY ev.FechaInicio DESC;
END
GO

PRINT N'sp_ObtenerEventosInscritosCerradosUsuario aplicado.';
GO

USE TrebolDB;
GO

CREATE OR ALTER PROCEDURE sp_ObtenerEventosPorProfesionalUsuario
    @ProfesionalId INT,
    @UsuarioId     INT
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
           CASE WHEN EXISTS (
                SELECT 1 FROM Inscripcion i
                WHERE i.SalaId = s.SalaId AND i.UsuarioId = @UsuarioId AND i.Estado NOT IN (N'Cancelada'))
                THEN 1 ELSE 0 END AS EsInscrito,
           CASE WHEN EXISTS (
                SELECT 1 FROM Seguidor sg
                WHERE sg.ProfesionalId = s.ProfesionalId AND sg.UsuarioId = @UsuarioId)
                THEN 1 ELSE 0 END AS EsSeguido,
           (SELECT COUNT(*) FROM Seguidor sg WHERE sg.ProfesionalId = s.ProfesionalId) AS TotalSeguidos
    FROM   Sala s
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId AND p.Estado = N'ACTIVO'
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT COUNT(*) AS TotalInscritos
        FROM   Inscripcion i
        WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto'
        ORDER  BY e.FechaInicio ASC
    ) ev
    WHERE  s.ProfesionalId = @ProfesionalId
      AND  s.Tipo = N'Publica'
    ORDER  BY ISNULL(ev.FechaInicio, s.FechaCreacion) DESC;
END
GO

-- Mis colegas: mismos campos que directorio + solo profesionales ACTIVO (verificados)
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_ObtenerMisColegas
    @ProfesionalId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT p.ProfesionalId,
           p.NombreCompleto,
           p.FotoPerfil AS FotoUrl,
           p.Ocupacion AS Titulo,
           p.SobreMi,
           p.TipoProfesional,
           ci.Nombre AS Ciudad,
           (SELECT AVG(CAST(cp.Puntuacion AS FLOAT))
            FROM   ComentarioProfesional cp
            WHERE  cp.ProfesionalId = p.ProfesionalId AND cp.Estado = 1) AS Calificacion,
           (SELECT COUNT(*) FROM Seguidor s WHERE s.ProfesionalId = p.ProfesionalId) AS TotalSeguidos,
           CAST(0 AS BIT) AS EsSeguido,
           (SELECT STRING_AGG(e3.Nombre, N', ') WITHIN GROUP (ORDER BY e3.Nombre)
            FROM   ProfesionalEspecialidad pe3
            JOIN   Especialidad e3 ON e3.EspecialidadId = pe3.EspecialidadId
            WHERE  pe3.ProfesionalId = p.ProfesionalId) AS EspecialidadesTexto
    FROM   ColaboracionProfesional c
    JOIN   Profesional p ON p.ProfesionalId =
           CASE WHEN c.ProfesionalId1 = @ProfesionalId THEN c.ProfesionalId2 ELSE c.ProfesionalId1 END
    LEFT JOIN Ciudad ci ON ci.CiudadId = p.CiudadId
    WHERE  (c.ProfesionalId1 = @ProfesionalId OR c.ProfesionalId2 = @ProfesionalId)
      AND  p.Estado = N'ACTIVO'
      AND  p.ProfesionalId <> @ProfesionalId
    ORDER BY p.NombreCompleto;
END
GO

PRINT N'sp_ObtenerMisColegas actualizado.';
GO

-- Profesionales con los que el usuario tiene o tuvo citas (asesoría o seguimiento)
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_ObtenerMisMentores
    @UsuarioId INT
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
           AVG(CAST(cp.Puntuacion AS FLOAT)) AS Calificacion,
           (SELECT COUNT(*) FROM Seguidor s WHERE s.ProfesionalId = p.ProfesionalId) AS TotalSeguidos,
           CASE WHEN EXISTS (
                SELECT 1 FROM Seguidor s
                WHERE s.ProfesionalId = p.ProfesionalId AND s.UsuarioId = @UsuarioId)
                THEN 1 ELSE 0 END AS EsSeguido,
           (SELECT STRING_AGG(e3.Nombre, N', ') WITHIN GROUP (ORDER BY e3.Nombre)
            FROM   ProfesionalEspecialidad pe3
            JOIN   Especialidad e3 ON e3.EspecialidadId = pe3.EspecialidadId
            WHERE  pe3.ProfesionalId = p.ProfesionalId) AS EspecialidadesTexto,
           MAX(c.FechaHora) AS UltimaCita,
           COUNT(DISTINCT c.CitaId) AS TotalCitas
    FROM   Cita c
    INNER JOIN Profesional p ON p.ProfesionalId = c.ProfesionalId
    LEFT JOIN Ciudad ci ON ci.CiudadId = p.CiudadId
    LEFT JOIN ComentarioProfesional cp ON cp.ProfesionalId = p.ProfesionalId AND cp.Estado = 1
    WHERE  c.UsuarioId = @UsuarioId
      AND  c.Estado <> N'Cancelada'
      AND  c.Tipo IN (N'Asesoria', N'Seguimiento')
      AND  p.Estado = N'ACTIVO'
    GROUP BY p.ProfesionalId, p.NombreCompleto, p.FotoPerfil, p.Ocupacion, p.SobreMi,
             p.TipoProfesional, ci.Nombre
    ORDER BY MAX(c.FechaHora) DESC;
END
GO

PRINT N'sp_ObtenerMisMentores aplicado.';
GO

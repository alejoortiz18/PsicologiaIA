-- Directorio: filtro Médicos / Psicólogos + conteo para paginación
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_ObtenerDirectorio
    @TipoBusqueda  NVARCHAR(15)  = N'Todos',   -- 'Medicos', 'Psicologos', 'Todos'
    @Especialidad  NVARCHAR(150) = NULL,
    @Ciudad        NVARCHAR(150) = NULL,
    @CalificacionMin DECIMAL(3,1) = NULL,
    @UsuarioId     INT           = NULL,
    @Pagina        INT           = 1,
    @TamanoPagina  INT           = 10
AS
BEGIN
    SET NOCOUNT ON;

    IF @Pagina < 1 SET @Pagina = 1;
    IF @TamanoPagina NOT IN (10, 25, 50) SET @TamanoPagina = 10;

    ;WITH Base AS (
        SELECT p.ProfesionalId,
               p.NombreCompleto,
               p.FotoPerfil,
               p.Ocupacion,
               p.SobreMi,
               p.TipoProfesional,
               ci.Nombre AS Ciudad,
               AVG(CAST(cp.Puntuacion AS FLOAT)) AS Calificacion,
               (SELECT COUNT(*) FROM Seguidor s WHERE s.ProfesionalId = p.ProfesionalId) AS TotalSeguidos,
               CASE WHEN @UsuarioId IS NOT NULL AND EXISTS (
                    SELECT 1 FROM Seguidor s
                    WHERE s.ProfesionalId = p.ProfesionalId AND s.UsuarioId = @UsuarioId)
                    THEN 1 ELSE 0 END AS EsSeguido,
               (SELECT STRING_AGG(e3.Nombre, N', ') WITHIN GROUP (ORDER BY e3.Nombre)
                FROM   ProfesionalEspecialidad pe3
                JOIN   Especialidad e3 ON e3.EspecialidadId = pe3.EspecialidadId
                WHERE  pe3.ProfesionalId = p.ProfesionalId) AS EspecialidadesTexto
        FROM   Profesional p
        LEFT JOIN Ciudad ci ON ci.CiudadId = p.CiudadId
        LEFT JOIN ComentarioProfesional cp ON cp.ProfesionalId = p.ProfesionalId AND cp.Estado = 1
        WHERE  p.Estado = N'ACTIVO'
          AND  (@Ciudad IS NULL OR ci.Nombre LIKE N'%' + @Ciudad + N'%')
          AND  (
                @TipoBusqueda IN (N'Medicos', N'Especialistas')
                AND EXISTS (
                    SELECT 1
                    FROM   ProfesionalEspecialidad peM
                    JOIN   Especialidad eM ON eM.EspecialidadId = peM.EspecialidadId
                    WHERE  peM.ProfesionalId = p.ProfesionalId
                      AND  eM.Nombre = N'M' + NCHAR(0x00E9) + N'dico')
                OR  @TipoBusqueda = N'Psicologos'
                AND EXISTS (
                    SELECT 1
                    FROM   ProfesionalEspecialidad peP
                    JOIN   Especialidad eP ON eP.EspecialidadId = peP.EspecialidadId
                    WHERE  peP.ProfesionalId = p.ProfesionalId
                      AND  (eP.Nombre = N'Psic' + NCHAR(0x00F3) + N'logo'
                            OR eP.Nombre LIKE N'Psicolog%'))
          )
        GROUP BY p.ProfesionalId, p.NombreCompleto, p.FotoPerfil, p.Ocupacion, p.SobreMi, p.TipoProfesional, ci.Nombre
        HAVING (@CalificacionMin IS NULL OR AVG(CAST(cp.Puntuacion AS FLOAT)) >= @CalificacionMin)
           AND (@Especialidad IS NULL OR EXISTS (
                SELECT 1
                FROM   ProfesionalEspecialidad peF
                JOIN   Especialidad eF ON eF.EspecialidadId = peF.EspecialidadId
                WHERE  peF.ProfesionalId = p.ProfesionalId
                  AND  (eF.Nombre LIKE N'%' + @Especialidad + N'%'
                        OR p.NombreCompleto LIKE N'%' + @Especialidad + N'%'
                        OR p.Ocupacion LIKE N'%' + @Especialidad + N'%')))
    )
    SELECT ProfesionalId,
           NombreCompleto,
           FotoPerfil AS FotoUrl,
           Ocupacion AS Titulo,
           SobreMi,
           TipoProfesional,
           Ciudad,
           Calificacion,
           TotalSeguidos,
           EsSeguido,
           EspecialidadesTexto
    FROM   Base
    ORDER  BY TotalSeguidos DESC, NombreCompleto ASC
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH  NEXT @TamanoPagina ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE sp_ContarDirectorio
    @TipoBusqueda  NVARCHAR(15)  = N'Todos',
    @Especialidad  NVARCHAR(150) = NULL,
    @Ciudad        NVARCHAR(150) = NULL,
    @CalificacionMin DECIMAL(3,1) = NULL,
    @UsuarioId     INT           = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(*) AS Total
    FROM   Profesional p
    LEFT JOIN Ciudad ci ON ci.CiudadId = p.CiudadId
    WHERE  p.Estado = N'ACTIVO'
      AND  (@Ciudad IS NULL OR ci.Nombre LIKE N'%' + @Ciudad + N'%')
      AND  (
            @TipoBusqueda IN (N'Medicos', N'Especialistas')
            AND EXISTS (
                SELECT 1
                FROM   ProfesionalEspecialidad peM
                JOIN   Especialidad eM ON eM.EspecialidadId = peM.EspecialidadId
                WHERE  peM.ProfesionalId = p.ProfesionalId
                  AND  eM.Nombre = N'M' + NCHAR(0x00E9) + N'dico')
            OR  @TipoBusqueda = N'Psicologos'
            AND EXISTS (
                SELECT 1
                FROM   ProfesionalEspecialidad peP
                JOIN   Especialidad eP ON eP.EspecialidadId = peP.EspecialidadId
                WHERE  peP.ProfesionalId = p.ProfesionalId
                  AND  (eP.Nombre = N'Psic' + NCHAR(0x00F3) + N'logo'
                        OR eP.Nombre LIKE N'Psicolog%'))
      )
      AND  (@CalificacionMin IS NULL OR (
            SELECT AVG(CAST(cp.Puntuacion AS FLOAT))
            FROM   ComentarioProfesional cp
            WHERE  cp.ProfesionalId = p.ProfesionalId AND cp.Estado = 1
      ) >= @CalificacionMin)
      AND  (@Especialidad IS NULL
            OR p.NombreCompleto LIKE N'%' + @Especialidad + N'%'
            OR p.Ocupacion LIKE N'%' + @Especialidad + N'%'
            OR EXISTS (
                SELECT 1
                FROM   ProfesionalEspecialidad peF
                JOIN   Especialidad eF ON eF.EspecialidadId = peF.EspecialidadId
                WHERE  peF.ProfesionalId = p.ProfesionalId
                  AND  eF.Nombre LIKE N'%' + @Especialidad + N'%'));
END
GO

PRINT N'Directorio — SPs Médicos/Psicólogos y paginación aplicados.';
GO

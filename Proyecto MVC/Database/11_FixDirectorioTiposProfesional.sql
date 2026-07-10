-- Catálogo de especialidades + TipoProfesional + filtros directorio
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM Especialidad)
BEGIN
    SET IDENTITY_INSERT Especialidad ON;
    INSERT INTO Especialidad (EspecialidadId, Nombre, Descripcion, Estado) VALUES
        (1,  N'Psicología Clínica', NULL, 1),
        (2,  N'Psicología Infantil', NULL, 1),
        (3,  N'Neuropsicología', NULL, 1),
        (4,  N'Psicología Organizacional', NULL, 1),
        (5,  N'Terapia Cognitivo-Conductual', NULL, 1),
        (6,  N'Salud Mental', NULL, 1),
        (7,  N'Psicoanálisis', NULL, 1),
        (8,  N'Terapia de Pareja', NULL, 1),
        (9,  N'M' + NCHAR(0x00E9) + N'dico', NULL, 1),
        (10, N'Psic' + NCHAR(0x00F3) + N'logo', NULL, 1);
    SET IDENTITY_INSERT Especialidad OFF;
END
GO

IF COL_LENGTH('Profesional', 'TipoProfesional') IS NULL
BEGIN
    ALTER TABLE Profesional ADD TipoProfesional NVARCHAR(15) NULL;
END
GO

CREATE OR ALTER PROCEDURE sp_RegistrarProfesional
    @NombreCompleto           NVARCHAR(200),
    @Correo                   NVARCHAR(254),
    @NumeroDocumento          NVARCHAR(30),
    @Alias                    NVARCHAR(100),
    @Celular                  NVARCHAR(20)   = NULL,
    @NumerTarjetaProfesional  NVARCHAR(50),
    @UrlDocumentoIdentidad    NVARCHAR(500)  = NULL,
    @UrlTarjetaProfesional    NVARCHAR(500)  = NULL,
    @CiudadId                 INT            = NULL,
    @EspecialidadId           INT            = NULL,
    @Token                    NVARCHAR(500),
    @Expiracion               DATETIME2(0)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Profesional WHERE Correo = @Correo)
    BEGIN SELECT 0 AS Exito, N'El correo ya está registrado.' AS Mensaje, 0 AS Id; RETURN; END

    IF EXISTS (SELECT 1 FROM Profesional WHERE NumeroDocumento = @NumeroDocumento)
    BEGIN SELECT 0 AS Exito, N'El documento ya está registrado.' AS Mensaje, 0 AS Id; RETURN; END

    IF EXISTS (SELECT 1 FROM Profesional WHERE NumerTarjetaProfesional = @NumerTarjetaProfesional)
    BEGIN SELECT 0 AS Exito, N'La tarjeta profesional ya está registrada.' AS Mensaje, 0 AS Id; RETURN; END

    DECLARE @TipoProf NVARCHAR(15) = NULL;
    IF @EspecialidadId IS NOT NULL
    BEGIN
        SELECT @TipoProf = CASE
            WHEN e.Nombre = N'M' + NCHAR(0x00E9) + N'dico' THEN N'Medico'
            WHEN e.Nombre = N'Psic' + NCHAR(0x00F3) + N'logo' OR e.Nombre LIKE N'Psicolog%' THEN N'Psicologo'
            ELSE NULL
        END
        FROM Especialidad e WHERE e.EspecialidadId = @EspecialidadId;
    END

    DECLARE @NuevoId INT;
    INSERT INTO Profesional (NombreCompleto, Correo, NumeroDocumento, Alias, Celular, NumerTarjetaProfesional,
                             UrlDocumentoIdentidad, UrlTarjetaProfesional, CiudadId, TipoProfesional)
    VALUES (@NombreCompleto, @Correo, @NumeroDocumento, @Alias, @Celular, @NumerTarjetaProfesional,
            @UrlDocumentoIdentidad, @UrlTarjetaProfesional, @CiudadId, @TipoProf);

    SET @NuevoId = SCOPE_IDENTITY();

    IF @EspecialidadId IS NOT NULL AND EXISTS (SELECT 1 FROM Especialidad WHERE EspecialidadId = @EspecialidadId)
    BEGIN
        INSERT INTO ProfesionalEspecialidad (ProfesionalId, EspecialidadId)
        VALUES (@NuevoId, @EspecialidadId);
    END

    INSERT INTO TokenActivacion (ProfesionalId, Token, FechaExpiracion, Correo)
    VALUES (@NuevoId, @Token, @Expiracion, @Correo);

    INSERT INTO Notificacion (Tipo, EntidadId, Titulo, Descripcion)
    VALUES (N'RegistroProfesional', @NuevoId,
            N'Nuevo profesional — pendiente de validación de correo',
            N'Profesional: ' + @NombreCompleto + N' | Correo: ' + @Correo + ISNULL(N' | Tipo: ' + @TipoProf, N''));

    SELECT 1 AS Exito, N'Registro exitoso. Revisa tu correo para confirmar tu cuenta.' AS Mensaje, @NuevoId AS Id;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerDirectorio
    @TipoBusqueda  NVARCHAR(15)  = N'Todos',
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
                (
                    @TipoBusqueda IN (N'Medicos', N'Especialistas')
                    AND (
                        p.TipoProfesional = N'Medico'
                        OR EXISTS (
                            SELECT 1
                            FROM   ProfesionalEspecialidad peM
                            JOIN   Especialidad eM ON eM.EspecialidadId = peM.EspecialidadId
                            WHERE  peM.ProfesionalId = p.ProfesionalId
                              AND  eM.Nombre = N'M' + NCHAR(0x00E9) + N'dico')
                    )
                )
                OR (
                    @TipoBusqueda = N'Psicologos'
                    AND (
                        p.TipoProfesional = N'Psicologo'
                        OR EXISTS (
                            SELECT 1
                            FROM   ProfesionalEspecialidad peP
                            JOIN   Especialidad eP ON eP.EspecialidadId = peP.EspecialidadId
                            WHERE  peP.ProfesionalId = p.ProfesionalId
                              AND  (eP.Nombre = N'Psic' + NCHAR(0x00F3) + N'logo' OR eP.Nombre LIKE N'Psicolog%'))
                    )
                )
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
            (
                @TipoBusqueda IN (N'Medicos', N'Especialistas')
                AND (
                    p.TipoProfesional = N'Medico'
                    OR EXISTS (
                        SELECT 1
                        FROM   ProfesionalEspecialidad peM
                        JOIN   Especialidad eM ON eM.EspecialidadId = peM.EspecialidadId
                        WHERE  peM.ProfesionalId = p.ProfesionalId
                          AND  eM.Nombre = N'M' + NCHAR(0x00E9) + N'dico')
                )
            )
            OR (
                @TipoBusqueda = N'Psicologos'
                AND (
                    p.TipoProfesional = N'Psicologo'
                    OR EXISTS (
                        SELECT 1
                        FROM   ProfesionalEspecialidad peP
                        JOIN   Especialidad eP ON eP.EspecialidadId = peP.EspecialidadId
                        WHERE  peP.ProfesionalId = p.ProfesionalId
                          AND  (eP.Nombre = N'Psic' + NCHAR(0x00F3) + N'logo' OR eP.Nombre LIKE N'Psicolog%'))
                )
            )
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

-- Profesionales activos sin tipo: asignar según correos conocidos (ajusta si el mapeo es al revés)
UPDATE p SET TipoProfesional = N'Psicologo'
FROM Profesional p
WHERE p.ProfesionalId = 65 AND p.TipoProfesional IS NULL;

UPDATE p SET TipoProfesional = N'Medico'
FROM Profesional p
WHERE p.ProfesionalId = 66 AND p.TipoProfesional IS NULL;

INSERT INTO ProfesionalEspecialidad (ProfesionalId, EspecialidadId)
SELECT p.ProfesionalId, e.EspecialidadId
FROM   Profesional p
JOIN   Especialidad e ON e.Nombre = CASE
        WHEN p.TipoProfesional = N'Medico' THEN N'M' + NCHAR(0x00E9) + N'dico'
        WHEN p.TipoProfesional = N'Psicologo' THEN N'Psic' + NCHAR(0x00F3) + N'logo'
    END
WHERE  p.Estado = N'ACTIVO'
  AND  p.TipoProfesional IS NOT NULL
  AND  NOT EXISTS (
        SELECT 1 FROM ProfesionalEspecialidad pe
        WHERE pe.ProfesionalId = p.ProfesionalId AND pe.EspecialidadId = e.EspecialidadId);

PRINT N'Directorio: catalogo, TipoProfesional y filtros corregidos.';
GO

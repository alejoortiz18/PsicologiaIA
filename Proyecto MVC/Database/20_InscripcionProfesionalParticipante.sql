-- Permite inscripción a eventos por Usuario o por Profesional (orador de otra sala).
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;
GO

IF COL_LENGTH('Inscripcion', 'ProfesionalInscriptorId') IS NULL
    ALTER TABLE Inscripcion ADD ProfesionalInscriptorId INT NULL;
GO

IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = N'UQ_Inscripcion_Relacion')
    ALTER TABLE Inscripcion DROP CONSTRAINT UQ_Inscripcion_Relacion;
GO

IF COL_LENGTH('Inscripcion', 'UsuarioId') IS NOT NULL
BEGIN
    DECLARE @sql NVARCHAR(MAX) = N'ALTER TABLE Inscripcion ALTER COLUMN UsuarioId INT NULL';
    EXEC sp_executesql @sql;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Inscripcion_ProfesionalInscriptor')
    ALTER TABLE Inscripcion
        ADD CONSTRAINT FK_Inscripcion_ProfesionalInscriptor
        FOREIGN KEY (ProfesionalInscriptorId) REFERENCES Profesional(ProfesionalId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_Inscripcion_Participante')
    ALTER TABLE Inscripcion
        ADD CONSTRAINT CK_Inscripcion_Participante
        CHECK (UsuarioId IS NOT NULL OR ProfesionalInscriptorId IS NOT NULL);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UQ_Inscripcion_Usuario_Sala' AND object_id = OBJECT_ID(N'Inscripcion'))
    CREATE UNIQUE INDEX UQ_Inscripcion_Usuario_Sala
        ON Inscripcion(UsuarioId, SalaId)
        WHERE UsuarioId IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UQ_Inscripcion_Profesional_Sala' AND object_id = OBJECT_ID(N'Inscripcion'))
    CREATE UNIQUE INDEX UQ_Inscripcion_Profesional_Sala
        ON Inscripcion(ProfesionalInscriptorId, SalaId)
        WHERE ProfesionalInscriptorId IS NOT NULL;
GO

CREATE OR ALTER PROCEDURE sp_InscribirSala
    @SalaId                  INT,
    @UsuarioId               INT = NULL,
    @ProfesionalInscriptorId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @UsuarioId IS NULL AND @ProfesionalInscriptorId IS NULL
    BEGIN
        SELECT 0 AS Exito, N'Debe indicar usuario o profesional.' AS Mensaje, 0 AS Id;
        RETURN;
    END

    IF @UsuarioId IS NOT NULL AND EXISTS (
        SELECT 1 FROM Inscripcion
        WHERE SalaId = @SalaId AND UsuarioId = @UsuarioId AND Estado NOT IN (N'Cancelada'))
    BEGIN
        SELECT 0 AS Exito, N'Ya estás inscrito en esta sala.' AS Mensaje, 0 AS Id;
        RETURN;
    END

    IF @ProfesionalInscriptorId IS NOT NULL AND EXISTS (
        SELECT 1 FROM Inscripcion
        WHERE SalaId = @SalaId AND ProfesionalInscriptorId = @ProfesionalInscriptorId AND Estado NOT IN (N'Cancelada'))
    BEGIN
        SELECT 0 AS Exito, N'Ya estás inscrito en esta sala.' AS Mensaje, 0 AS Id;
        RETURN;
    END

    DECLARE @CupoMax INT, @TotalInscritos INT, @Precio DECIMAL(10,2);
    SELECT @CupoMax = CupoMaximo, @Precio = ISNULL(Precio, 0)
    FROM   Sala
    WHERE  SalaId = @SalaId AND Estado = N'Abierta';

    IF @CupoMax IS NULL
    BEGIN
        SELECT 0 AS Exito, N'Sala no disponible.' AS Mensaje, 0 AS Id;
        RETURN;
    END

    SELECT @TotalInscritos = COUNT(*)
    FROM   Inscripcion
    WHERE  SalaId = @SalaId AND Estado NOT IN (N'Cancelada', N'SinCupos');

    IF @TotalInscritos >= @CupoMax
    BEGIN
        SELECT 0 AS Exito, N'La sala está llena.' AS Mensaje, 0 AS Id;
        RETURN;
    END

    DECLARE @Estado NVARCHAR(25) = CASE WHEN @Precio <= 0 THEN N'Confirmada' ELSE N'PendientePago' END;
    DECLARE @Codigo NVARCHAR(50) = CONCAT(N'TRB-', FORMAT(GETDATE(), N'yyMMdd'), N'-', ABS(CHECKSUM(NEWID())) % 100000);

    DECLARE @NuevoId INT;
    INSERT INTO Inscripcion (UsuarioId, ProfesionalInscriptorId, SalaId, CodigoInscripcion, Estado)
    VALUES (@UsuarioId, @ProfesionalInscriptorId, @SalaId, @Codigo, @Estado);
    SET @NuevoId = SCOPE_IDENTITY();

    SELECT 1 AS Exito,
           CASE WHEN @Estado = N'Confirmada' THEN N'Inscripción confirmada.' ELSE N'Inscripción reservada. Completa el pago.' END AS Mensaje,
           @NuevoId AS Id,
           @Estado AS EstadoInscripcion,
           @Precio AS Precio,
           @Codigo AS CodigoInscripcion;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerSalaDetalleUsuario
    @SalaId                  INT,
    @UsuarioId               INT = 0,
    @ProfesionalInscriptorId INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.SalaId,
           s.ProfesionalId,
           COALESCE(ev.Nombre, s.Nombre) AS Titulo,
           ISNULL(ev.Descripcion, s.Descripcion) AS Descripcion,
           p.NombreCompleto AS NombreProfesional,
           p.Ocupacion AS OcupacionOrador,
           p.FotoPerfil AS FotoOrador,
           c.Nombre AS Categoria,
           s.Estado,
           s.CupoMaximo AS Capacidad,
           s.Precio,
           insc.TotalInscritos,
           ev.FechaInicio,
           ev.FechaFin,
           CASE WHEN EXISTS (
                SELECT 1 FROM Inscripcion i
                WHERE i.SalaId = s.SalaId
                  AND i.Estado NOT IN (N'Cancelada')
                  AND (
                        (@UsuarioId > 0 AND i.UsuarioId = @UsuarioId)
                     OR (@ProfesionalInscriptorId > 0 AND i.ProfesionalInscriptorId = @ProfesionalInscriptorId)
                  ))
                THEN 1 ELSE 0 END AS EsInscrito,
           CASE WHEN @UsuarioId > 0 AND EXISTS (
                SELECT 1 FROM Seguidor sg
                WHERE sg.ProfesionalId = s.ProfesionalId AND sg.UsuarioId = @UsuarioId)
                THEN 1 ELSE 0 END AS EsSeguido,
           (SELECT COUNT(*) FROM Seguidor sg WHERE sg.ProfesionalId = s.ProfesionalId) AS TotalSeguidos,
           STUFF((
               SELECT N', ' + e2.Nombre
               FROM   ProfesionalEspecialidad pe
               JOIN   Especialidad e2 ON e2.EspecialidadId = pe.EspecialidadId
               WHERE  pe.ProfesionalId = p.ProfesionalId
               FOR XML PATH(''), TYPE
           ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS EspecialidadesTexto
    FROM   Sala s
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT COUNT(*) AS TotalInscritos
        FROM   Inscripcion i
        WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre, e.Descripcion
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto'
        ORDER  BY e.FechaInicio ASC
    ) ev
    WHERE  s.SalaId = @SalaId AND s.Estado = N'Abierta';
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerEventosPorProfesionalUsuario
    @ProfesionalId             INT,
    @UsuarioId                 INT = 0,
    @ProfesionalInscriptorId INT = 0
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
                WHERE i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')
                  AND (
                        (@UsuarioId > 0 AND i.UsuarioId = @UsuarioId)
                     OR (@ProfesionalInscriptorId > 0 AND i.ProfesionalInscriptorId = @ProfesionalInscriptorId)
                  ))
                THEN 1 ELSE 0 END AS EsInscrito,
           CASE WHEN @UsuarioId > 0 AND EXISTS (
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

PRINT N'Inscripción por usuario o profesional configurada.';
GO

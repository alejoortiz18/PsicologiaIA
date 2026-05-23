-- Mensajería: mensajes entre profesionales, listar conversación, marcar leídos
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('Conversacion', 'ProfesionalIdColega') IS NULL
BEGIN
    ALTER TABLE Conversacion ADD ProfesionalIdColega INT NULL;
    ALTER TABLE Conversacion ADD CONSTRAINT FK_Conv_ProfesionalColega
        FOREIGN KEY (ProfesionalIdColega) REFERENCES Profesional(ProfesionalId);
END
GO

IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = N'UQ_Conversacion_Relacion')
    ALTER TABLE Conversacion DROP CONSTRAINT UQ_Conversacion_Relacion;
GO

ALTER TABLE Conversacion ALTER COLUMN UsuarioId INT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UQ_Conversacion_UsuarioProf')
    CREATE UNIQUE INDEX UQ_Conversacion_UsuarioProf
        ON Conversacion(UsuarioId, ProfesionalId)
        WHERE UsuarioId IS NOT NULL AND ProfesionalIdColega IS NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UQ_Conversacion_Profesionales')
    CREATE UNIQUE INDEX UQ_Conversacion_Profesionales
        ON Conversacion(ProfesionalId, ProfesionalIdColega)
        WHERE UsuarioId IS NULL AND ProfesionalIdColega IS NOT NULL;
GO

CREATE OR ALTER PROCEDURE sp_ObtenerMensajesConversacion
    @ConversacionId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT mp.MensajePrivadoId AS MensajeId,
           mp.ConversacionId,
           mp.TipoAutor AS EmisorTipo,
           mp.AutorId AS EmisorId,
           mp.Texto AS Contenido,
           mp.FechaCreacion AS FechaEnvio,
           mp.Leido
    FROM   MensajePrivado mp
    WHERE  mp.ConversacionId = @ConversacionId
    ORDER  BY mp.FechaCreacion ASC;
END
GO

CREATE OR ALTER PROCEDURE sp_EnviarMensaje
    @AutorId      INT,
    @TipoAutor    NVARCHAR(15),
    @DestinoId    INT,
    @TipoDestino  NVARCHAR(15),
    @Texto        NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    IF LTRIM(RTRIM(ISNULL(@Texto, N''))) = N''
    BEGIN
        SELECT 0 AS Exito, N'El mensaje no puede estar vacío.' AS Mensaje, 0 AS Id;
        RETURN;
    END

    DECLARE @ConversacionId INT;
    DECLARE @UsuarioId INT;
    DECLARE @ProfesionalId INT;
    DECLARE @ProfesionalIdColega INT;
    DECLARE @NuevoId INT;

    IF @TipoAutor = N'Usuario' AND @TipoDestino = N'Profesional'
    BEGIN
        SET @UsuarioId = @AutorId;
        SET @ProfesionalId = @DestinoId;
        SET @ProfesionalIdColega = NULL;

        SELECT @ConversacionId = ConversacionId
        FROM   Conversacion
        WHERE  UsuarioId = @UsuarioId AND ProfesionalId = @ProfesionalId AND ProfesionalIdColega IS NULL;
    END
    ELSE IF @TipoAutor = N'Profesional' AND @TipoDestino = N'Usuario'
    BEGIN
        SET @UsuarioId = @DestinoId;
        SET @ProfesionalId = @AutorId;
        SET @ProfesionalIdColega = NULL;

        SELECT @ConversacionId = ConversacionId
        FROM   Conversacion
        WHERE  UsuarioId = @UsuarioId AND ProfesionalId = @ProfesionalId AND ProfesionalIdColega IS NULL;
    END
    ELSE IF @TipoAutor = N'Profesional' AND @TipoDestino = N'Profesional'
    BEGIN
        SET @UsuarioId = NULL;
        SET @ProfesionalId = CASE WHEN @AutorId < @DestinoId THEN @AutorId ELSE @DestinoId END;
        SET @ProfesionalIdColega = CASE WHEN @AutorId < @DestinoId THEN @DestinoId ELSE @AutorId END;

        SELECT @ConversacionId = ConversacionId
        FROM   Conversacion
        WHERE  UsuarioId IS NULL
          AND  ProfesionalId = @ProfesionalId
          AND  ProfesionalIdColega = @ProfesionalIdColega;
    END
    ELSE
    BEGIN
        SELECT 0 AS Exito, N'Tipo de conversación no soportado.' AS Mensaje, 0 AS Id;
        RETURN;
    END

    IF @ConversacionId IS NULL
    BEGIN
        INSERT INTO Conversacion (UsuarioId, ProfesionalId, ProfesionalIdColega)
        VALUES (@UsuarioId, @ProfesionalId, @ProfesionalIdColega);
        SET @ConversacionId = SCOPE_IDENTITY();
    END

    INSERT INTO MensajePrivado (ConversacionId, AutorId, TipoAutor, Texto)
    VALUES (@ConversacionId, @AutorId, @TipoAutor, @Texto);
    SET @NuevoId = SCOPE_IDENTITY();

    SELECT 1 AS Exito, N'Mensaje enviado.' AS Mensaje, @NuevoId AS Id;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerConversaciones
    @EntidadId   INT,
    @TipoEntidad NVARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH Lista AS (
        SELECT conv.ConversacionId,
               p.ProfesionalId AS OtroId,
               p.NombreCompleto AS OtroNombre,
               p.FotoPerfil AS OtroFoto,
               N'Profesional' AS TipoOtro,
               (SELECT TOP 1 Texto FROM MensajePrivado m WHERE m.ConversacionId = conv.ConversacionId ORDER BY FechaCreacion DESC) AS UltimoMensaje,
               (SELECT TOP 1 FechaCreacion FROM MensajePrivado m WHERE m.ConversacionId = conv.ConversacionId ORDER BY FechaCreacion DESC) AS UltimaFecha,
               (SELECT COUNT(*) FROM MensajePrivado m
                WHERE m.ConversacionId = conv.ConversacionId AND m.Leido = 0
                  AND NOT (m.AutorId = @EntidadId AND m.TipoAutor = @TipoEntidad)) AS MensajesNoLeidos
        FROM   Conversacion conv
        JOIN   Profesional p ON p.ProfesionalId = conv.ProfesionalId
        WHERE  @TipoEntidad = N'Usuario'
          AND  conv.UsuarioId = @EntidadId
          AND  conv.ProfesionalIdColega IS NULL

        UNION ALL

        SELECT conv.ConversacionId,
               u.UsuarioId AS OtroId,
               u.Alias AS OtroNombre,
               u.FotoPerfil AS OtroFoto,
               N'Usuario' AS TipoOtro,
               (SELECT TOP 1 Texto FROM MensajePrivado m WHERE m.ConversacionId = conv.ConversacionId ORDER BY FechaCreacion DESC),
               (SELECT TOP 1 FechaCreacion FROM MensajePrivado m WHERE m.ConversacionId = conv.ConversacionId ORDER BY FechaCreacion DESC),
               (SELECT COUNT(*) FROM MensajePrivado m
                WHERE m.ConversacionId = conv.ConversacionId AND m.Leido = 0
                  AND NOT (m.AutorId = @EntidadId AND m.TipoAutor = @TipoEntidad))
        FROM   Conversacion conv
        JOIN   Usuario u ON u.UsuarioId = conv.UsuarioId
        WHERE  @TipoEntidad = N'Profesional'
          AND  conv.ProfesionalId = @EntidadId
          AND  conv.ProfesionalIdColega IS NULL

        UNION ALL

        SELECT conv.ConversacionId,
               CASE WHEN conv.ProfesionalId = @EntidadId THEN conv.ProfesionalIdColega ELSE conv.ProfesionalId END AS OtroId,
               p.NombreCompleto AS OtroNombre,
               p.FotoPerfil AS OtroFoto,
               N'Profesional' AS TipoOtro,
               (SELECT TOP 1 Texto FROM MensajePrivado m WHERE m.ConversacionId = conv.ConversacionId ORDER BY FechaCreacion DESC),
               (SELECT TOP 1 FechaCreacion FROM MensajePrivado m WHERE m.ConversacionId = conv.ConversacionId ORDER BY FechaCreacion DESC),
               (SELECT COUNT(*) FROM MensajePrivado m
                WHERE m.ConversacionId = conv.ConversacionId AND m.Leido = 0
                  AND NOT (m.AutorId = @EntidadId AND m.TipoAutor = @TipoEntidad))
        FROM   Conversacion conv
        JOIN   Profesional p ON p.ProfesionalId =
               CASE WHEN conv.ProfesionalId = @EntidadId THEN conv.ProfesionalIdColega ELSE conv.ProfesionalId END
        WHERE  @TipoEntidad = N'Profesional'
          AND  conv.UsuarioId IS NULL
          AND  conv.ProfesionalIdColega IS NOT NULL
          AND  (@EntidadId = conv.ProfesionalId OR @EntidadId = conv.ProfesionalIdColega)
    )
    SELECT * FROM Lista
    ORDER  BY UltimaFecha DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_MarcarMensajesLeidos
    @ConversacionId INT,
    @LectorId       INT,
    @TipoLector     NVARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE MensajePrivado
    SET    Leido = 1
    WHERE  ConversacionId = @ConversacionId
      AND  Leido = 0
      AND  NOT (AutorId = @LectorId AND TipoAutor = @TipoLector);
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerDestinoConversacion
    @ConversacionId INT,
    @EntidadId      INT,
    @TipoEntidad    NVARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
           CASE
               WHEN @TipoEntidad = N'Usuario' THEN c.ProfesionalId
               WHEN c.ProfesionalIdColega IS NOT NULL AND c.ProfesionalId = @EntidadId THEN c.ProfesionalIdColega
               WHEN c.ProfesionalIdColega IS NOT NULL THEN c.ProfesionalId
               ELSE c.UsuarioId
           END AS DestinoId,
           CASE
               WHEN @TipoEntidad = N'Usuario' THEN N'Profesional'
               WHEN c.ProfesionalIdColega IS NOT NULL THEN N'Profesional'
               ELSE N'Usuario'
           END AS TipoDestino
    FROM   Conversacion c
    WHERE  c.ConversacionId = @ConversacionId
      AND  (
            (@TipoEntidad = N'Usuario' AND c.UsuarioId = @EntidadId)
         OR (@TipoEntidad = N'Profesional' AND (c.ProfesionalId = @EntidadId OR c.ProfesionalIdColega = @EntidadId))
      );
END
GO

PRINT N'Mensajería: correcciones aplicadas.';
GO

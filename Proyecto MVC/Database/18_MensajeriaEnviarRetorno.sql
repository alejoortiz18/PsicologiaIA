USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
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
        SELECT 0 AS Exito, N'El mensaje no puede estar vacío.' AS Mensaje, 0 AS Id, 0 AS ConversacionId;
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
        SELECT @ConversacionId = ConversacionId FROM Conversacion
        WHERE UsuarioId = @UsuarioId AND ProfesionalId = @ProfesionalId AND ProfesionalIdColega IS NULL;
    END
    ELSE IF @TipoAutor = N'Profesional' AND @TipoDestino = N'Usuario'
    BEGIN
        SET @UsuarioId = @DestinoId;
        SET @ProfesionalId = @AutorId;
        SET @ProfesionalIdColega = NULL;
        SELECT @ConversacionId = ConversacionId FROM Conversacion
        WHERE UsuarioId = @UsuarioId AND ProfesionalId = @ProfesionalId AND ProfesionalIdColega IS NULL;
    END
    ELSE IF @TipoAutor = N'Profesional' AND @TipoDestino = N'Profesional'
    BEGIN
        SET @UsuarioId = NULL;
        SET @ProfesionalId = CASE WHEN @AutorId < @DestinoId THEN @AutorId ELSE @DestinoId END;
        SET @ProfesionalIdColega = CASE WHEN @AutorId < @DestinoId THEN @DestinoId ELSE @AutorId END;
        SELECT @ConversacionId = ConversacionId FROM Conversacion
        WHERE UsuarioId IS NULL AND ProfesionalId = @ProfesionalId AND ProfesionalIdColega = @ProfesionalIdColega;
    END
    ELSE
    BEGIN
        SELECT 0 AS Exito, N'Tipo de conversación no soportado.' AS Mensaje, 0 AS Id, 0 AS ConversacionId;
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

    SELECT 1 AS Exito, N'Mensaje enviado.' AS Mensaje, @NuevoId AS Id, @ConversacionId AS ConversacionId;
END
GO

PRINT N'sp_EnviarMensaje devuelve ConversacionId.';
GO

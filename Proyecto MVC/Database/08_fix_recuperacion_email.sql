-- Recuperación de contraseña: flag EnviarCorreo + búsqueda case-insensitive + admin en restablecer
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_SolicitarRecuperacion
    @Correo  NVARCHAR(200),
    @Token   NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EntidadId     INT;
    DECLARE @TipoEntidad   NVARCHAR(15);
    DECLARE @HorasToken    INT = 2;
    DECLARE @Expiracion    DATETIME2(0);

    SELECT @HorasToken = TRY_CAST(Valor AS INT)
    FROM   ParametroSistema
    WHERE  Clave = N'HorasTokenRecuperacion';

    IF @HorasToken IS NULL OR @HorasToken < 1 SET @HorasToken = 2;
    SET @Expiracion = DATEADD(HOUR, @HorasToken, GETDATE());

    SET @Correo = LTRIM(RTRIM(@Correo));

    IF EXISTS (SELECT 1 FROM Usuario WHERE LOWER(Correo) = LOWER(@Correo))
    BEGIN
        SELECT @EntidadId = UsuarioId, @TipoEntidad = N'Usuario'
        FROM   Usuario WHERE LOWER(Correo) = LOWER(@Correo);
    END
    ELSE IF EXISTS (SELECT 1 FROM Profesional WHERE LOWER(Correo) = LOWER(@Correo))
    BEGIN
        SELECT @EntidadId = ProfesionalId, @TipoEntidad = N'Profesional'
        FROM   Profesional WHERE LOWER(Correo) = LOWER(@Correo);
    END
    ELSE IF EXISTS (SELECT 1 FROM Administrador WHERE LOWER(Correo) = LOWER(@Correo))
    BEGIN
        SELECT @EntidadId = AdministradorId, @TipoEntidad = N'Admin'
        FROM   Administrador WHERE LOWER(Correo) = LOWER(@Correo);
    END

    IF @EntidadId IS NULL
    BEGIN
        SELECT 1 AS Exito, 0 AS EnviarCorreo,
               N'Si el correo existe, recibirás el enlace.' AS Mensaje;
        RETURN;
    END

    UPDATE TokenRecuperacion SET Usado = 1
    WHERE  EntidadId = @EntidadId AND TipoEntidad = @TipoEntidad AND Usado = 0;

    INSERT INTO TokenRecuperacion (EntidadId, TipoEntidad, Token, FechaExpiracion)
    VALUES (@EntidadId, @TipoEntidad, @Token, @Expiracion);

    SELECT 1 AS Exito, 1 AS EnviarCorreo,
           N'Si el correo existe, recibirás el enlace.' AS Mensaje;
END
GO

CREATE OR ALTER PROCEDURE sp_RestablecerPassword
    @Token        NVARCHAR(500),
    @PasswordHash NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @EntidadId   INT;
    DECLARE @TipoEntidad NVARCHAR(15);

    SELECT @EntidadId = EntidadId, @TipoEntidad = TipoEntidad
    FROM   TokenRecuperacion
    WHERE  Token = @Token AND Usado = 0 AND FechaExpiracion > GETDATE();

    IF @EntidadId IS NULL
    BEGIN
        SELECT 0 AS Exito, N'Token inválido o expirado.' AS Mensaje;
        RETURN;
    END

    IF @TipoEntidad = N'Usuario'
        UPDATE Usuario SET PasswordHash = @PasswordHash, FechaModificacion = GETDATE()
        WHERE  UsuarioId = @EntidadId;
    ELSE IF @TipoEntidad = N'Profesional'
        UPDATE Profesional SET PasswordHash = @PasswordHash, FechaModificacion = GETDATE()
        WHERE  ProfesionalId = @EntidadId;
    ELSE IF @TipoEntidad = N'Admin'
        UPDATE Administrador SET PasswordHash = @PasswordHash, FechaModificacion = GETDATE()
        WHERE  AdministradorId = @EntidadId;

    UPDATE TokenRecuperacion SET Usado = 1 WHERE Token = @Token;
    SELECT 1 AS Exito, N'Contraseña restablecida.' AS Mensaje;
END
GO

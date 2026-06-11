CREATE OR ALTER PROCEDURE sp_SolicitarRecuperacion
    @Correo  NVARCHAR(200),
    @Token   NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @EntidadId   INT;
    DECLARE @TipoEntidad NVARCHAR(15);
    DECLARE @Expiracion  DATETIME2(0) = DATEADD(HOUR, 2, GETDATE());

    IF EXISTS (SELECT 1 FROM Usuario WHERE Correo = @Correo)
    BEGIN
        SELECT @EntidadId = UsuarioId, @TipoEntidad = 'Usuario'
        FROM   Usuario WHERE Correo = @Correo;
    END
    ELSE IF EXISTS (SELECT 1 FROM Profesional WHERE Correo = @Correo)
    BEGIN
        SELECT @EntidadId = ProfesionalId, @TipoEntidad = 'Profesional'
        FROM   Profesional WHERE Correo = @Correo;
    END
    ELSE IF EXISTS (SELECT 1 FROM Administrador WHERE Correo = @Correo)
    BEGIN
        SELECT @EntidadId = AdministradorId, @TipoEntidad = 'Admin'
        FROM   Administrador WHERE Correo = @Correo;
    END

    IF @EntidadId IS NULL
    BEGIN
        SELECT 1 AS Exito, N'Si el correo existe, recibiras el enlace.' AS Mensaje;
        RETURN;
    END

    UPDATE TokenRecuperacion SET Usado = 1
    WHERE  EntidadId = @EntidadId AND TipoEntidad = @TipoEntidad AND Usado = 0;

    INSERT INTO TokenRecuperacion (EntidadId, TipoEntidad, Token, FechaExpiracion)
    VALUES (@EntidadId, @TipoEntidad, @Token, @Expiracion);

    SELECT 1 AS Exito, N'Si el correo existe, recibiras el enlace.' AS Mensaje;
END
GO

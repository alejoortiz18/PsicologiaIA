-- Reenvío de correo de confirmación (usuario): invalida tokens previos e inserta uno nuevo.
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_ReenviarConfirmacionUsuario
    @Correo     NVARCHAR(254),
    @Token      NVARCHAR(500),
    @Expiracion DATETIME2(0)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UsuarioId INT;
    DECLARE @Nombre    NVARCHAR(200);

    SELECT @UsuarioId = UsuarioId,
           @Nombre    = NombreCompleto
    FROM   Usuario
    WHERE  Correo = @Correo
      AND  Estado = N'PENDIENTE';

    IF @UsuarioId IS NULL
    BEGIN
        SELECT 0 AS Exito,
               N'Si el correo está pendiente de confirmación, recibirás un nuevo enlace.' AS Mensaje,
               NULL AS NombreCompleto;
        RETURN;
    END

    UPDATE TokenValidacion
    SET    Usado = 1
    WHERE  UsuarioId = @UsuarioId
      AND  Usado = 0;

    INSERT INTO TokenValidacion (UsuarioId, Token, FechaExpiracion)
    VALUES (@UsuarioId, @Token, @Expiracion);

    SELECT 1 AS Exito,
           N'Se generó un nuevo enlace de confirmación.' AS Mensaje,
           @Nombre AS NombreCompleto;
END
GO

PRINT N'sp_ReenviarConfirmacionUsuario aplicado.';
GO

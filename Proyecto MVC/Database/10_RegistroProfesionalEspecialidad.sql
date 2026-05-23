-- Persistir tipo de profesional (Médico / Psicólogo) al registrarse
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
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

    DECLARE @NuevoId INT;
    INSERT INTO Profesional (NombreCompleto, Correo, NumeroDocumento, Alias, Celular, NumerTarjetaProfesional,
                             UrlDocumentoIdentidad, UrlTarjetaProfesional, CiudadId)
    VALUES (@NombreCompleto, @Correo, @NumeroDocumento, @Alias, @Celular, @NumerTarjetaProfesional,
            @UrlDocumentoIdentidad, @UrlTarjetaProfesional, @CiudadId);
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
            N'Profesional: ' + @NombreCompleto + N' | Correo: ' + @Correo);

    SELECT 1 AS Exito, N'Registro exitoso. Revisa tu correo para confirmar tu cuenta.' AS Mensaje, @NuevoId AS Id;
END
GO

PRINT N'Registro profesional — especialidad vinculada al registrarse.';
GO

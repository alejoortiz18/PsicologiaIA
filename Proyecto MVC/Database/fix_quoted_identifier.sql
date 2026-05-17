-- Fix: Recreate sp_RegistrarProfesional with QUOTED_IDENTIFIER ON
-- This is required because the Profesional table has CHECK constraints

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
    @CiudadId                 INT            = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Profesional WHERE Correo = @Correo)
    BEGIN SELECT 0 AS Exito, 'El correo ya está registrado.' AS Mensaje, 0 AS Id; RETURN; END

    IF EXISTS (SELECT 1 FROM Profesional WHERE NumeroDocumento = @NumeroDocumento)
    BEGIN SELECT 0 AS Exito, 'El documento ya está registrado.' AS Mensaje, 0 AS Id; RETURN; END

    IF EXISTS (SELECT 1 FROM Profesional WHERE NumerTarjetaProfesional = @NumerTarjetaProfesional)
    BEGIN SELECT 0 AS Exito, 'La tarjeta profesional ya está registrada.' AS Mensaje, 0 AS Id; RETURN; END

    DECLARE @NuevoId INT;
    INSERT INTO Profesional (NombreCompleto, Correo, NumeroDocumento, Alias, Celular, NumerTarjetaProfesional,
                             UrlDocumentoIdentidad, UrlTarjetaProfesional, CiudadId)
    VALUES (@NombreCompleto, @Correo, @NumeroDocumento, @Alias, @Celular, @NumerTarjetaProfesional,
            @UrlDocumentoIdentidad, @UrlTarjetaProfesional, @CiudadId);
    SET @NuevoId = SCOPE_IDENTITY();

    -- Crear notificación para el administrador
    INSERT INTO Notificacion (Tipo, EntidadId, Titulo, Descripcion)
    VALUES ('RegistroProfesional', @NuevoId,
            'Nuevo profesional pendiente de aprobación',
            'Profesional: ' + @NombreCompleto + ' | Correo: ' + @Correo);

    SELECT 1 AS Exito, 'Registro enviado para revisión.' AS Mensaje, @NuevoId AS Id;
END
GO

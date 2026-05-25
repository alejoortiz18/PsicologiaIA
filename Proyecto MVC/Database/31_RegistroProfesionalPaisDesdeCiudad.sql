-- Al registrar profesional, asignar PaisId según la ciudad elegida
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

    DECLARE @PaisId INT = NULL;
    IF @CiudadId IS NOT NULL
        SELECT @PaisId = PaisId FROM Ciudad WHERE CiudadId = @CiudadId;

    DECLARE @NuevoId INT;
    INSERT INTO Profesional (NombreCompleto, Correo, NumeroDocumento, Alias, Celular, NumerTarjetaProfesional,
                             UrlDocumentoIdentidad, UrlTarjetaProfesional, PaisId, CiudadId, TipoProfesional)
    VALUES (@NombreCompleto, @Correo, @NumeroDocumento, @Alias, @Celular, @NumerTarjetaProfesional,
            @UrlDocumentoIdentidad, @UrlTarjetaProfesional, @PaisId, @CiudadId, @TipoProf);

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

PRINT N'sp_RegistrarProfesional: PaisId desde CiudadId.';
GO

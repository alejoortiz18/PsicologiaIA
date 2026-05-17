USE TrebolDB;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_ValidarLogin
    @Correo NVARCHAR(254)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Usuario WHERE Correo = @Correo)
    BEGIN
        SELECT UsuarioId AS EntidadId, NombreCompleto, Correo, PasswordHash, Estado,
               FotoPerfil AS FotoUrl, 'Usuario' AS TipoEntidad
        FROM   Usuario WHERE Correo = @Correo;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM Profesional WHERE Correo = @Correo)
    BEGIN
        SELECT ProfesionalId AS EntidadId, NombreCompleto, Correo, PasswordHash, Estado,
               FotoPerfil AS FotoUrl, 'Profesional' AS TipoEntidad
        FROM   Profesional WHERE Correo = @Correo;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM Administrador WHERE Correo = @Correo)
    BEGIN
        SELECT AdministradorId AS EntidadId, NombreCompleto, Correo, PasswordHash,
               CASE Estado WHEN 1 THEN 'ACTIVO' ELSE 'BLOQUEADO' END AS Estado,
               NULL AS FotoUrl, 'Admin' AS TipoEntidad
        FROM   Administrador WHERE Correo = @Correo;
        RETURN;
    END
END
GO

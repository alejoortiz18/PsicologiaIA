-- Mis citas (usuario): listados activos y pasados con paginación
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_ContarCitasActivasUsuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*)
    FROM   Cita c
    WHERE  c.UsuarioId = @UsuarioId
      AND  c.Estado IN (N'Programada', N'Movida')
      AND  c.FechaHoraFin >= GETDATE();
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerCitasActivasUsuario
    @UsuarioId    INT,
    @Pagina       INT = 1,
    @TamanoPagina INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.CitaId,
           p.NombreCompleto AS NombreProfesional,
           ISNULL(p.FotoPerfil, N'') AS FotoProfesional,
           u.Alias AS AliasUsuario,
           c.FechaHora,
           DATEDIFF(MINUTE, c.FechaHora, c.FechaHoraFin) AS DuracionMinutos,
           c.Tipo,
           c.Estado,
           ISNULL(pc.Monto, ISNULL(p.ValorPorHora, 0)) AS Monto
    FROM   Cita c
    JOIN   Profesional p ON p.ProfesionalId = c.ProfesionalId
    JOIN   Usuario u ON u.UsuarioId = c.UsuarioId
    LEFT JOIN PagoCita pc ON pc.CitaId = c.CitaId AND pc.Estado = N'Aprobado'
    WHERE  c.UsuarioId = @UsuarioId
      AND  c.Estado IN (N'Programada', N'Movida')
      AND  c.FechaHoraFin >= GETDATE()
    ORDER  BY c.FechaHora ASC
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH  NEXT @TamanoPagina ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE sp_ContarCitasPasadasUsuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*)
    FROM   Cita c
    WHERE  c.UsuarioId = @UsuarioId
      AND  (
            c.Estado IN (N'Finalizada', N'Cancelada')
            OR c.FechaHoraFin < GETDATE()
          );
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerCitasPasadasUsuario
    @UsuarioId    INT,
    @Pagina       INT = 1,
    @TamanoPagina INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.CitaId,
           p.NombreCompleto AS NombreProfesional,
           ISNULL(p.FotoPerfil, N'') AS FotoProfesional,
           u.Alias AS AliasUsuario,
           c.FechaHora,
           DATEDIFF(MINUTE, c.FechaHora, c.FechaHoraFin) AS DuracionMinutos,
           c.Tipo,
           c.Estado,
           ISNULL(pc.Monto, ISNULL(p.ValorPorHora, 0)) AS Monto
    FROM   Cita c
    JOIN   Profesional p ON p.ProfesionalId = c.ProfesionalId
    JOIN   Usuario u ON u.UsuarioId = c.UsuarioId
    LEFT JOIN PagoCita pc ON pc.CitaId = c.CitaId AND pc.Estado = N'Aprobado'
    WHERE  c.UsuarioId = @UsuarioId
      AND  (
            c.Estado IN (N'Finalizada', N'Cancelada')
            OR c.FechaHoraFin < GETDATE()
          )
    ORDER  BY c.FechaHora DESC
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH  NEXT @TamanoPagina ROWS ONLY;
END
GO

PRINT N'Citas usuario activas/pasadas aplicadas.';
GO

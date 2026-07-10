-- Crear sala + evento vigente; fechas en listado del profesional.
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_CrearSala
    @ProfesionalId INT,
    @Nombre        NVARCHAR(300),
    @Descripcion   NVARCHAR(MAX) = NULL,
    @Tipo          NVARCHAR(10)  = N'Publica',
    @CategoriaId   INT           = NULL,
    @CupoMaximo    INT,
    @FechaInicio   DATETIME2(0)  = NULL,
    @Precio        DECIMAL(10,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @NuevoId INT;
    DECLARE @Inicio  DATETIME2(0) = ISNULL(@FechaInicio, GETDATE());
    DECLARE @Fin     DATETIME2(0) = DATEADD(DAY, 30, @Inicio);
    DECLARE @PrecioSala DECIMAL(10,2) = ISNULL(@Precio, 0);

    IF @Tipo NOT IN (N'Publica', N'Privada')
        SET @Tipo = N'Publica';

    INSERT INTO Sala (ProfesionalId, CategoriaId, Nombre, Descripcion, Tipo, CupoMaximo, Precio, FechaCreacion)
    VALUES (@ProfesionalId, @CategoriaId, @Nombre, @Descripcion, @Tipo, @CupoMaximo, @PrecioSala, GETDATE());

    SET @NuevoId = SCOPE_IDENTITY();

    INSERT INTO Evento (SalaId, Nombre, Descripcion, FechaInicio, FechaFin, Estado)
    VALUES (@NuevoId, @Nombre, @Descripcion, @Inicio, @Fin, N'Abierto');

    SELECT 1 AS Exito, N'Sala creada.' AS Mensaje, @NuevoId AS Id;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerSalasPorProfesional
    @ProfesionalId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.SalaId,
           s.ProfesionalId,
           s.Nombre AS Titulo,
           s.Descripcion,
           s.Tipo,
           s.Estado,
           s.CategoriaId,
           c.Nombre AS Categoria,
           NULL AS ImagenUrl,
           s.CupoMaximo AS Capacidad,
           ev.FechaInicio,
           s.Precio,
           (SELECT COUNT(*) FROM Inscripcion i
            WHERE i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')) AS TotalInscritos
    FROM   Sala s
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto'
        ORDER  BY e.FechaInicio ASC
    ) ev
    WHERE  s.ProfesionalId = @ProfesionalId
    ORDER  BY ISNULL(ev.FechaInicio, s.FechaCreacion) DESC;
END
GO

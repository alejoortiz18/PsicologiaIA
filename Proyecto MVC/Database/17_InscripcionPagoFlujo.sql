-- Flujo inscripción: estado según precio y validación de cupos al pagar
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

CREATE OR ALTER PROCEDURE sp_InscribirSala
    @UsuarioId INT,
    @SalaId    INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM Inscripcion
        WHERE UsuarioId = @UsuarioId AND SalaId = @SalaId AND Estado NOT IN ('Cancelada')
    )
    BEGIN
        SELECT 0 AS Exito, 'Ya estás inscrito en esta sala.' AS Mensaje, 0 AS Id;
        RETURN;
    END

    DECLARE @CupoMax INT, @TotalInscritos INT, @Precio DECIMAL(10,2);
    SELECT @CupoMax = CupoMaximo, @Precio = ISNULL(Precio, 0)
    FROM   Sala
    WHERE  SalaId = @SalaId AND Estado = 'Abierta';

    IF @CupoMax IS NULL
    BEGIN
        SELECT 0 AS Exito, 'Sala no disponible.' AS Mensaje, 0 AS Id;
        RETURN;
    END

    SELECT @TotalInscritos = COUNT(*)
    FROM   Inscripcion
    WHERE  SalaId = @SalaId AND Estado NOT IN ('Cancelada', 'SinCupos');

    IF @TotalInscritos >= @CupoMax
    BEGIN
        SELECT 0 AS Exito, 'La sala está llena.' AS Mensaje, 0 AS Id;
        RETURN;
    END

    DECLARE @Estado NVARCHAR(25) = CASE WHEN @Precio <= 0 THEN 'Confirmada' ELSE 'PendientePago' END;
    DECLARE @Codigo NVARCHAR(50) = CONCAT('TRB-', FORMAT(GETDATE(), 'yyMMdd'), '-', ABS(CHECKSUM(NEWID())) % 100000);

    DECLARE @NuevoId INT;
    INSERT INTO Inscripcion (UsuarioId, SalaId, CodigoInscripcion, Estado)
    VALUES (@UsuarioId, @SalaId, @Codigo, @Estado);
    SET @NuevoId = SCOPE_IDENTITY();

    SELECT 1 AS Exito,
           CASE WHEN @Estado = 'Confirmada' THEN 'Inscripción confirmada.' ELSE 'Inscripción reservada. Completa el pago.' END AS Mensaje,
           @NuevoId AS Id,
           @Estado AS EstadoInscripcion,
           @Precio AS Precio,
           @Codigo AS CodigoInscripcion;
END
GO

CREATE OR ALTER PROCEDURE sp_PagarInscripcion
    @InscripcionId INT,
    @MetodoPago    NVARCHAR(25)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SalaId INT, @UsuarioId INT, @EstadoActual NVARCHAR(25);
    SELECT @SalaId = SalaId, @UsuarioId = UsuarioId, @EstadoActual = Estado
    FROM   Inscripcion
    WHERE  InscripcionId = @InscripcionId;

    IF @SalaId IS NULL
    BEGIN
        SELECT 0 AS Exito, 'Inscripción no encontrada.' AS Mensaje;
        RETURN;
    END

    IF @EstadoActual IN ('Confirmada', 'PagoAprobado')
    BEGIN
        SELECT 1 AS Exito, 'Esta inscripción ya está confirmada.' AS Mensaje;
        RETURN;
    END

    DECLARE @CupoMax INT, @TotalInscritos INT, @Precio DECIMAL(10,2);
    SELECT @CupoMax = CupoMaximo, @Precio = ISNULL(Precio, 0)
    FROM   Sala WHERE SalaId = @SalaId;

    SELECT @TotalInscritos = COUNT(*)
    FROM   Inscripcion
    WHERE  SalaId = @SalaId
      AND  Estado IN ('Confirmada', 'PagoAprobado', 'PendientePago')
      AND  InscripcionId <> @InscripcionId;

    IF @TotalInscritos >= @CupoMax
    BEGIN
        UPDATE Inscripcion SET Estado = 'SinCupos', FechaModificacion = GETDATE()
        WHERE  InscripcionId = @InscripcionId;
        SELECT 0 AS Exito, 'Sin cupos disponibles.' AS Mensaje, 'SinCupos' AS Codigo;
        RETURN;
    END

    IF @Precio <= 0
    BEGIN
        UPDATE Inscripcion SET Estado = 'Confirmada', FechaModificacion = GETDATE()
        WHERE  InscripcionId = @InscripcionId;
        SELECT 1 AS Exito, 'Inscripción confirmada (entrada libre).' AS Mensaje, 'Confirmada' AS Codigo;
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM PagoInscripcion WHERE InscripcionId = @InscripcionId AND Estado = 'Aprobado')
    BEGIN
        INSERT INTO PagoInscripcion (InscripcionId, Monto, MetodoPago, Estado)
        VALUES (@InscripcionId, @Precio, @MetodoPago, 'Aprobado');
    END

    UPDATE Inscripcion SET Estado = 'PagoAprobado', FechaModificacion = GETDATE()
    WHERE  InscripcionId = @InscripcionId;

    SELECT 1 AS Exito, 'Pago de inscripción procesado.' AS Mensaje, 'PagoAprobado' AS Codigo;
END
GO

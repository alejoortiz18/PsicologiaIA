-- Índices filtrados en Inscripcion (script 20) exigen QUOTED_IDENTIFIER ON en los SP que hacen UPDATE.
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

CREATE OR ALTER PROCEDURE sp_PagarInscripcion
    @InscripcionId INT,
    @MetodoPago    NVARCHAR(25)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SalaId INT, @EstadoActual NVARCHAR(25);
    SELECT @SalaId = SalaId, @EstadoActual = Estado
    FROM   Inscripcion
    WHERE  InscripcionId = @InscripcionId;

    IF @SalaId IS NULL
    BEGIN
        SELECT 0 AS Exito, N'Inscripción no encontrada.' AS Mensaje;
        RETURN;
    END

    IF @EstadoActual IN (N'Confirmada', N'PagoAprobado')
    BEGIN
        SELECT 1 AS Exito, N'Esta inscripción ya está confirmada.' AS Mensaje;
        RETURN;
    END

    DECLARE @CupoMax INT, @TotalInscritos INT, @Precio DECIMAL(10,2);
    SELECT @CupoMax = CupoMaximo, @Precio = ISNULL(Precio, 0)
    FROM   Sala WHERE SalaId = @SalaId;

    SELECT @TotalInscritos = COUNT(*)
    FROM   Inscripcion
    WHERE  SalaId = @SalaId
      AND  Estado IN (N'Confirmada', N'PagoAprobado', N'PendientePago')
      AND  InscripcionId <> @InscripcionId;

    IF @TotalInscritos >= @CupoMax
    BEGIN
        UPDATE Inscripcion SET Estado = N'SinCupos', FechaModificacion = GETDATE()
        WHERE  InscripcionId = @InscripcionId;
        SELECT 0 AS Exito, N'Sin cupos disponibles.' AS Mensaje, N'SinCupos' AS Codigo;
        RETURN;
    END

    IF @Precio <= 0
    BEGIN
        UPDATE Inscripcion SET Estado = N'Confirmada', FechaModificacion = GETDATE()
        WHERE  InscripcionId = @InscripcionId;
        SELECT 1 AS Exito, N'Inscripción confirmada (entrada libre).' AS Mensaje, N'Confirmada' AS Codigo;
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM PagoInscripcion WHERE InscripcionId = @InscripcionId AND Estado = N'Aprobado')
    BEGIN
        INSERT INTO PagoInscripcion (InscripcionId, Monto, MetodoPago, Estado)
        VALUES (@InscripcionId, @Precio, @MetodoPago, N'Aprobado');
    END

    UPDATE Inscripcion SET Estado = N'PagoAprobado', FechaModificacion = GETDATE()
    WHERE  InscripcionId = @InscripcionId;

    SELECT 1 AS Exito, N'Pago de inscripción procesado.' AS Mensaje, N'PagoAprobado' AS Codigo;
END
GO

PRINT N'sp_PagarInscripcion recreado con QUOTED_IDENTIFIER ON.';
GO

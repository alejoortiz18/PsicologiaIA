-- Reinscripción: reutilizar fila Cancelada/PagoRechazado/SinCupos en lugar de INSERT duplicado
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

CREATE OR ALTER PROCEDURE dbo.sp_InscribirSala
    @SalaId                  INT,
    @UsuarioId               INT = NULL,
    @ProfesionalInscriptorId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @UsuarioId IS NULL AND @ProfesionalInscriptorId IS NULL
    BEGIN
        SELECT 0 AS Exito, N'Debe indicar usuario o profesional.' AS Mensaje, 0 AS Id,
               NULL AS EstadoInscripcion, 0 AS Precio, NULL AS CodigoInscripcion;
        RETURN;
    END

    IF @UsuarioId IS NOT NULL AND EXISTS (
        SELECT 1 FROM Inscripcion
        WHERE SalaId = @SalaId AND UsuarioId = @UsuarioId
          AND Estado NOT IN (N'Cancelada', N'PagoRechazado', N'SinCupos'))
    BEGIN
        SELECT 0 AS Exito, N'Ya estás inscrito en esta sala.' AS Mensaje, 0 AS Id,
               NULL AS EstadoInscripcion, 0 AS Precio, NULL AS CodigoInscripcion;
        RETURN;
    END

    IF @ProfesionalInscriptorId IS NOT NULL AND EXISTS (
        SELECT 1 FROM Inscripcion
        WHERE SalaId = @SalaId AND ProfesionalInscriptorId = @ProfesionalInscriptorId
          AND Estado NOT IN (N'Cancelada', N'PagoRechazado', N'SinCupos'))
    BEGIN
        SELECT 0 AS Exito, N'Ya estás inscrito en esta sala.' AS Mensaje, 0 AS Id,
               NULL AS EstadoInscripcion, 0 AS Precio, NULL AS CodigoInscripcion;
        RETURN;
    END

    DECLARE @CupoMax INT, @TotalInscritos INT, @Precio DECIMAL(10,2);
    SELECT @CupoMax = CupoMaximo, @Precio = ISNULL(Precio, 0)
    FROM   Sala
    WHERE  SalaId = @SalaId AND Estado = N'Abierta';

    IF @CupoMax IS NULL
    BEGIN
        SELECT 0 AS Exito, N'Sala no disponible.' AS Mensaje, 0 AS Id,
               NULL AS EstadoInscripcion, 0 AS Precio, NULL AS CodigoInscripcion;
        RETURN;
    END

    SELECT @TotalInscritos = COUNT(*)
    FROM   Inscripcion
    WHERE  SalaId = @SalaId AND Estado NOT IN (N'Cancelada', N'SinCupos');

    IF @TotalInscritos >= @CupoMax
    BEGIN
        SELECT 0 AS Exito, N'La sala está llena.' AS Mensaje, 0 AS Id,
               NULL AS EstadoInscripcion, 0 AS Precio, NULL AS CodigoInscripcion;
        RETURN;
    END

    DECLARE @Estado NVARCHAR(25) = CASE WHEN @Precio <= 0 THEN N'Confirmada' ELSE N'PendientePago' END;
    DECLARE @Codigo NVARCHAR(50) = CONCAT(N'TRB-', FORMAT(GETDATE(), N'yyMMdd'), N'-', ABS(CHECKSUM(NEWID())) % 100000);
    DECLARE @InscripcionId INT = NULL;
    DECLARE @EstadoPrevio NVARCHAR(25) = NULL;

    IF @UsuarioId IS NOT NULL
    BEGIN
        SELECT TOP 1 @InscripcionId = InscripcionId, @EstadoPrevio = Estado
        FROM   Inscripcion
        WHERE  SalaId = @SalaId AND UsuarioId = @UsuarioId
          AND  Estado IN (N'Cancelada', N'PagoRechazado', N'SinCupos', N'PendientePago')
        ORDER  BY CASE WHEN Estado = N'PendientePago' THEN 0 ELSE 1 END, FechaModificacion DESC;
    END
    ELSE
    BEGIN
        SELECT TOP 1 @InscripcionId = InscripcionId, @EstadoPrevio = Estado
        FROM   Inscripcion
        WHERE  SalaId = @SalaId AND ProfesionalInscriptorId = @ProfesionalInscriptorId
          AND  Estado IN (N'Cancelada', N'PagoRechazado', N'SinCupos', N'PendientePago')
        ORDER  BY CASE WHEN Estado = N'PendientePago' THEN 0 ELSE 1 END, FechaModificacion DESC;
    END

    IF @InscripcionId IS NOT NULL AND @EstadoPrevio = N'PendientePago'
    BEGIN
        SELECT @Codigo = CodigoInscripcion FROM Inscripcion WHERE InscripcionId = @InscripcionId;
        SET @Estado = N'PendientePago';
    END
    ELSE IF @InscripcionId IS NOT NULL
    BEGIN
        UPDATE PagoInscripcion
        SET    Estado = N'Rechazado', FechaModificacion = GETDATE()
        WHERE  InscripcionId = @InscripcionId AND Estado = N'Aprobado';

        UPDATE Inscripcion
        SET    Estado = @Estado,
               CodigoInscripcion = @Codigo,
               FechaModificacion = GETDATE()
        WHERE  InscripcionId = @InscripcionId;
    END
    ELSE
    BEGIN
        INSERT INTO Inscripcion (UsuarioId, ProfesionalInscriptorId, SalaId, CodigoInscripcion, Estado)
        VALUES (@UsuarioId, @ProfesionalInscriptorId, @SalaId, @Codigo, @Estado);
        SET @InscripcionId = SCOPE_IDENTITY();
    END

    SELECT 1 AS Exito,
           CASE WHEN @Estado = N'Confirmada' THEN N'Inscripción confirmada.'
                WHEN @EstadoPrevio = N'PendientePago' THEN N'Continúa con el pago de tu inscripción.'
                ELSE N'Inscripción reservada. Completa el pago.' END AS Mensaje,
           @InscripcionId AS Id,
           @Estado AS EstadoInscripcion,
           @Precio AS Precio,
           @Codigo AS CodigoInscripcion;
END
GO

PRINT N'54_ReinscripcionSalaCancelada — aplicado.';
GO

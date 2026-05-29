-- Fin de evento = inicio + duración (15–480 min). FechaFin a +30 días era ventana legacy; no define cuándo termina la sesión.
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

-- Corrige eventos con FechaFin anómala (+30 días u otra ventana larga).
UPDATE e
SET    e.FechaFin = DATEADD(MINUTE, 120, e.FechaInicio)
FROM   Evento e
WHERE  DATEDIFF(MINUTE, e.FechaInicio, e.FechaFin) > 480
   OR  DATEDIFF(MINUTE, e.FechaInicio, e.FechaFin) < 15;
GO

CREATE OR ALTER PROCEDURE sp_ActualizarSala
    @SalaId        INT,
    @ProfesionalId INT,
    @Nombre        NVARCHAR(300),
    @Descripcion   NVARCHAR(MAX) = NULL,
    @Tipo          NVARCHAR(10)  = N'Publica',
    @CupoMaximo    INT,
    @FechaInicio   DATETIME2(0)  = NULL,
    @Precio        DECIMAL(10,2) = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM Sala
        WHERE SalaId = @SalaId AND ProfesionalId = @ProfesionalId AND Estado = N'Abierta')
    BEGIN
        SELECT 0 AS Exito, N'No puedes editar esta sala (no existe, no es tuya o ya está cerrada).' AS Mensaje;
        RETURN;
    END

    DECLARE @Inscritos INT = (
        SELECT COUNT(*) FROM Inscripcion
        WHERE SalaId = @SalaId AND Estado NOT IN (N'Cancelada', N'SinCupos'));

    IF @CupoMaximo < @Inscritos
    BEGIN
        SELECT 0 AS Exito, N'La capacidad no puede ser menor que el número de inscritos actuales.' AS Mensaje;
        RETURN;
    END

    IF @Tipo NOT IN (N'Publica', N'Privada')
        SET @Tipo = N'Publica';

    UPDATE Sala
    SET    Nombre = @Nombre,
           Descripcion = @Descripcion,
           Tipo = @Tipo,
           CupoMaximo = @CupoMaximo,
           Precio = ISNULL(@Precio, 0),
           FechaModificacion = GETDATE()
    WHERE  SalaId = @SalaId AND ProfesionalId = @ProfesionalId;

    IF @FechaInicio IS NOT NULL
    BEGIN
        UPDATE Evento
        SET    Nombre = @Nombre,
               Descripcion = @Descripcion,
               FechaInicio = @FechaInicio,
               FechaFin = DATEADD(MINUTE, 120, @FechaInicio)
        WHERE  SalaId = @SalaId AND Estado = N'Abierto'
          AND  EventoId = (
                SELECT TOP 1 EventoId FROM Evento
                WHERE SalaId = @SalaId AND Estado = N'Abierto'
                ORDER BY FechaInicio ASC);
    END
    ELSE
    BEGIN
        UPDATE Evento
        SET    Nombre = @Nombre,
               Descripcion = @Descripcion
        WHERE  SalaId = @SalaId AND Estado = N'Abierto'
          AND  EventoId = (
                SELECT TOP 1 EventoId FROM Evento
                WHERE SalaId = @SalaId AND Estado = N'Abierto'
                ORDER BY FechaInicio ASC);
    END

    SELECT 1 AS Exito, N'Sala actualizada correctamente.' AS Mensaje;
END
GO

CREATE OR ALTER PROCEDURE sp_CerrarSalasEventosVencidos
    @ProfesionalId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE e
    SET    e.Estado = N'Cerrado'
    FROM   Evento e
    INNER JOIN Sala s ON s.SalaId = e.SalaId
    WHERE  e.Estado = N'Abierto'
      AND  (@ProfesionalId IS NULL OR s.ProfesionalId = @ProfesionalId)
      AND  (
               (DATEDIFF(MINUTE, e.FechaInicio, e.FechaFin) BETWEEN 15 AND 480 AND e.FechaFin < GETDATE())
            OR (NOT (DATEDIFF(MINUTE, e.FechaInicio, e.FechaFin) BETWEEN 15 AND 480)
                AND DATEADD(MINUTE, 120, e.FechaInicio) < GETDATE())
           );

    UPDATE s
    SET    s.Estado = N'Cerrada',
           s.FechaModificacion = GETDATE()
    FROM   Sala s
    WHERE  s.Estado = N'Abierta'
      AND  (@ProfesionalId IS NULL OR s.ProfesionalId = @ProfesionalId)
      AND  EXISTS (SELECT 1 FROM Evento e WHERE e.SalaId = s.SalaId)
      AND  NOT EXISTS (
               SELECT 1
               FROM   Evento e
               WHERE  e.SalaId = s.SalaId
                 AND  e.Estado IN (N'Abierto', N'Cerrado')
                 AND  (
                          (DATEDIFF(MINUTE, e.FechaInicio, e.FechaFin) BETWEEN 15 AND 480 AND e.FechaFin >= GETDATE())
                       OR (NOT (DATEDIFF(MINUTE, e.FechaInicio, e.FechaFin) BETWEEN 15 AND 480)
                           AND DATEADD(MINUTE, 120, e.FechaInicio) >= GETDATE())
                      )
           );
END
GO

PRINT N'Fin efectivo de evento y cierre automático actualizados.';
GO

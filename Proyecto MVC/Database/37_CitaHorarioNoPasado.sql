-- Rechaza agendar citas en horarios ya transcurridos.
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_AgendarCita
    @UsuarioId             INT = NULL,
    @ProfesionalClienteId  INT = NULL,
    @ProfesionalId         INT,
    @FechaHora             DATETIME2(0),
    @FechaHoraFin          DATETIME2(0),
    @Tipo                  NVARCHAR(15),
    @Notas                 NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @UsuarioId IS NULL AND @ProfesionalClienteId IS NULL
    BEGIN SELECT 0 AS Exito, N'Debe indicar usuario o profesional cliente.' AS Mensaje, 0 AS Id; RETURN; END

    IF @ProfesionalClienteId IS NOT NULL AND @ProfesionalClienteId = @ProfesionalId
    BEGIN SELECT 0 AS Exito, N'No puedes agendar una cita contigo mismo.' AS Mensaje, 0 AS Id; RETURN; END

    IF @FechaHora < GETDATE()
    BEGIN SELECT 0 AS Exito, N'No puedes agendar una cita en un horario que ya pasó.' AS Mensaje, 0 AS Id; RETURN; END

    IF EXISTS (
        SELECT 1 FROM Cita
        WHERE  ProfesionalId = @ProfesionalId
          AND  Estado NOT IN (N'Cancelada')
          AND  @FechaHora < FechaHoraFin
          AND  @FechaHoraFin > FechaHora
    )
    BEGIN SELECT 0 AS Exito, N'El horario no está disponible.' AS Mensaje, 0 AS Id; RETURN; END

    IF EXISTS (
        SELECT 1 FROM HorarioBloqueado
        WHERE  ProfesionalId = @ProfesionalId
          AND  @FechaHora < FechaHoraFin
          AND  @FechaHoraFin > FechaHoraInicio
    )
    BEGIN SELECT 0 AS Exito, N'El profesional tiene bloqueado ese horario.' AS Mensaje, 0 AS Id; RETURN; END

    DECLARE @NuevaCitaId INT;
    INSERT INTO Cita (UsuarioId, ProfesionalClienteId, ProfesionalId, FechaHora, FechaHoraFin, Tipo)
    VALUES (@UsuarioId, @ProfesionalClienteId, @ProfesionalId, @FechaHora, @FechaHoraFin, @Tipo);
    SET @NuevaCitaId = SCOPE_IDENTITY();

    SELECT 1 AS Exito, N'Cita agendada exitosamente.' AS Mensaje, @NuevaCitaId AS Id;
END
GO

PRINT N'sp_AgendarCita: validación horario no pasado aplicada.';
GO

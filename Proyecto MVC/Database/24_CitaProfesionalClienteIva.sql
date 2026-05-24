USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

IF COL_LENGTH('Cita', 'ProfesionalClienteId') IS NULL
    ALTER TABLE Cita ADD ProfesionalClienteId INT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Cita_ProfesionalCliente')
    ALTER TABLE Cita
        ADD CONSTRAINT FK_Cita_ProfesionalCliente
        FOREIGN KEY (ProfesionalClienteId) REFERENCES Profesional(ProfesionalId);
GO

IF COL_LENGTH('Cita', 'UsuarioId') IS NOT NULL
BEGIN
    DECLARE @sql NVARCHAR(MAX) = N'ALTER TABLE Cita ALTER COLUMN UsuarioId INT NULL';
    EXEC sp_executesql @sql;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_Cita_Cliente')
    ALTER TABLE Cita
        ADD CONSTRAINT CK_Cita_Cliente
        CHECK (UsuarioId IS NOT NULL OR ProfesionalClienteId IS NOT NULL);
GO

IF NOT EXISTS (SELECT 1 FROM Configuracion WHERE Clave = N'PorcentajeIvaCita')
    INSERT INTO Configuracion (Clave, Valor, Descripcion)
    VALUES (N'PorcentajeIvaCita', N'19', N'Porcentaje de IVA aplicado al valor de cita privada');
GO

IF COL_LENGTH('PagoCita', 'UsuarioId') IS NOT NULL
BEGIN
    DECLARE @sqlPago NVARCHAR(MAX) = N'ALTER TABLE PagoCita ALTER COLUMN UsuarioId INT NULL';
    EXEC sp_executesql @sqlPago;
END
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

CREATE OR ALTER PROCEDURE sp_PagarCita
    @CitaId                INT,
    @UsuarioId             INT = NULL,
    @ProfesionalClienteId  INT = NULL,
    @MetodoPago            NVARCHAR(25),
    @MontoTotal            DECIMAL(10,2),
    @MontoIva              DECIMAL(10,2) = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM Cita
        WHERE  CitaId = @CitaId AND Estado = N'Programada'
          AND (
                (@UsuarioId IS NOT NULL AND UsuarioId = @UsuarioId)
             OR (@ProfesionalClienteId IS NOT NULL AND ProfesionalClienteId = @ProfesionalClienteId)
          ))
    BEGIN SELECT 0 AS Exito, N'Cita no válida para pago.' AS Mensaje; RETURN; END

    IF NOT EXISTS (SELECT 1 FROM PagoCita WHERE CitaId = @CitaId AND Estado = N'Aprobado')
    BEGIN
        INSERT INTO PagoCita (CitaId, UsuarioId, Monto, TarifaPlataforma, MetodoPago, Estado)
        VALUES (
            @CitaId,
            @UsuarioId,
            @MontoTotal,
            @MontoIva,
            @MetodoPago,
            N'Aprobado'
        );
    END

    SELECT 1 AS Exito, N'Pago procesado correctamente.' AS Mensaje;
END
GO

PRINT N'Cita profesional cliente e IVA configurados.';
GO

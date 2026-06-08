-- Fase C — Novedades financieras: evento cancelado, inasistencia profesional, crédito saldo a favor
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_Cita_Estado')
    ALTER TABLE dbo.Cita DROP CONSTRAINT CK_Cita_Estado;
GO
ALTER TABLE dbo.Cita ADD CONSTRAINT CK_Cita_Estado
    CHECK (Estado IN (N'Programada', N'Cancelada', N'Movida', N'Finalizada', N'PendienteDecisionUsuario'));
GO

-- ============================================================
-- Generar novedades por evento cancelado / reprogramado
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_GenerarNovedadesEventoSala
    @SalaId        INT,
    @TipoNovedad   NVARCHAR(40),
    @TituloExtra   NVARCHAR(200) = NULL,
    @MensajeExtra  NVARCHAR(500) = NULL,
    @NuevaFecha    DATETIME2(0)  = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @TipoNovedad NOT IN (N'EventoCancelado', N'EventoReprogramado')
        RETURN;

    DECLARE @TituloSala NVARCHAR(200);
    DECLARE @ProfesionalId INT;
    SELECT @TituloSala = s.Nombre, @ProfesionalId = s.ProfesionalId
    FROM   Sala s WHERE s.SalaId = @SalaId;

    IF @TipoNovedad = N'EventoCancelado'
    BEGIN
        UPDATE Evento SET Estado = N'Cancelado'
        WHERE  SalaId = @SalaId AND Estado = N'Abierto';
        UPDATE Sala SET Estado = N'Cerrada', FechaModificacion = GETDATE()
        WHERE  SalaId = @SalaId;
    END

    INSERT INTO NovedadUsuario (UsuarioId, TipoNovedad, EntidadTipo, EntidadId, Titulo, Mensaje, Estado)
    SELECT i.UsuarioId,
           @TipoNovedad,
           N'Inscripcion',
           i.InscripcionId,
           ISNULL(@TituloExtra, N'Novedad en evento: ' + @TituloSala),
           ISNULL(@MensajeExtra,
               CASE @TipoNovedad
                   WHEN N'EventoCancelado' THEN N'El evento fue cancelado. Puedes aceptar una nueva fecha, retirar tu dinero a saldo a favor o explorar otras opciones.'
                   ELSE N'El profesional reprogramó el evento'
                        + CASE WHEN @NuevaFecha IS NOT NULL
                               THEN N' para el ' + CONVERT(NVARCHAR(16), @NuevaFecha, 106) + N'.'
                               ELSE N'.' END
                        + N' Elige cómo deseas continuar.'
               END),
           N'Pendiente'
    FROM   Inscripcion i
    WHERE  i.SalaId = @SalaId
      AND  i.Estado IN (N'Confirmada', N'PagoAprobado')
      AND  EXISTS (
          SELECT 1 FROM PagoInscripcion pi
          WHERE pi.InscripcionId = i.InscripcionId AND pi.Estado = N'Aprobado'
      )
      AND  NOT EXISTS (
          SELECT 1 FROM NovedadUsuario n
          WHERE n.UsuarioId = i.UsuarioId AND n.EntidadTipo = N'Inscripcion'
            AND n.EntidadId = i.InscripcionId AND n.Estado = N'Pendiente'
      );

    UPDATE Inscripcion
    SET    Estado = N'PendienteDecisionUsuario', FechaModificacion = GETDATE()
    WHERE  SalaId = @SalaId
      AND  Estado IN (N'Confirmada', N'PagoAprobado')
      AND  EXISTS (
          SELECT 1 FROM NovedadUsuario n
          WHERE n.EntidadId = Inscripcion.InscripcionId AND n.EntidadTipo = N'Inscripcion'
            AND n.Estado = N'Pendiente' AND n.TipoNovedad = @TipoNovedad
      );
END
GO

-- ============================================================
-- Crédito saldo a favor + ajuste profesional (interno)
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_CreditarSaldoFavorUsuario
    @UsuarioId           INT,
    @ProfesionalId       INT,
    @Monto               DECIMAL(12,2),
    @TipoMovimiento      NVARCHAR(40),
    @MotivoCodigo        NVARCHAR(40),
    @MotivoDetalle       NVARCHAR(500),
    @CitaId              INT = NULL,
    @InscripcionId       INT = NULL,
    @PagoCitaId          INT = NULL,
    @PagoInscripcionId   INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @Monto <= 0 RETURN;

    DECLARE @MovId INT;

    INSERT INTO MovimientoSaldoUsuario (
        UsuarioId, TipoMovimiento, OrigenEntidad, OrigenEntidadId, ProfesionalId,
        PagoCitaId, PagoInscripcionId, MontoBruto, Comision, MontoNeto, Estado)
    VALUES (
        @UsuarioId, @TipoMovimiento,
        CASE WHEN @CitaId IS NOT NULL THEN N'Cita' WHEN @InscripcionId IS NOT NULL THEN N'Inscripcion' ELSE N'Evento' END,
        COALESCE(@CitaId, @InscripcionId),
        @ProfesionalId, @PagoCitaId, @PagoInscripcionId,
        @Monto, 0, @Monto, N'SaldoFavor');

    SET @MovId = SCOPE_IDENTITY();

    INSERT INTO AjusteSaldoProfesional (
        ProfesionalId, MovimientoSaldoUsuarioId, Monto, MotivoCodigo, MotivoDetalle, CitaId, InscripcionId)
    VALUES (
        @ProfesionalId, @MovId, @Monto, @MotivoCodigo, @MotivoDetalle, @CitaId, @InscripcionId);
END
GO

-- ============================================================
-- Resolver novedad del usuario (3 opciones)
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_ResolverNovedadUsuario
    @NovedadUsuarioId INT,
    @UsuarioId        INT,
    @OpcionElegida    NVARCHAR(40)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @Tipo NVARCHAR(40), @EntidadTipo NVARCHAR(20), @EntidadId INT, @Estado NVARCHAR(20);
        SELECT @Tipo = TipoNovedad, @EntidadTipo = EntidadTipo, @EntidadId = EntidadId, @Estado = Estado
        FROM   NovedadUsuario
        WHERE  NovedadUsuarioId = @NovedadUsuarioId AND UsuarioId = @UsuarioId;

        IF @Estado IS NULL BEGIN ROLLBACK; SELECT 0 AS Exito, N'Novedad no encontrada.' AS Mensaje; RETURN; END
        IF @Estado <> N'Pendiente' BEGIN ROLLBACK; SELECT 0 AS Exito, N'Esta novedad ya fue resuelta.' AS Mensaje; RETURN; END

        DECLARE @RedirectUrl NVARCHAR(500) = NULL;
        DECLARE @ProfesionalId INT = NULL;

        IF @EntidadTipo = N'Inscripcion'
        BEGIN
            SELECT @ProfesionalId = s.ProfesionalId
            FROM   Inscripcion i JOIN Sala s ON s.SalaId = i.SalaId
            WHERE  i.InscripcionId = @EntidadId AND i.UsuarioId = @UsuarioId;

            IF @ProfesionalId IS NULL BEGIN ROLLBACK; SELECT 0 AS Exito, N'Inscripción no válida.' AS Mensaje; RETURN; END

            IF @OpcionElegida = N'AceptarNuevaFecha'
            BEGIN
                UPDATE Inscripcion SET Estado = N'Confirmada', FechaModificacion = GETDATE()
                WHERE  InscripcionId = @EntidadId;
            END
            ELSE IF @OpcionElegida = N'RetirarDinero'
            BEGIN
                DECLARE @MontoEv DECIMAL(12,2);
                DECLARE @PagoInscId INT;
                SELECT TOP 1 @MontoEv = pi.Monto, @PagoInscId = pi.PagoId
                FROM   PagoInscripcion pi
                WHERE  pi.InscripcionId = @EntidadId AND pi.Estado = N'Aprobado'
                ORDER  BY pi.FechaPago DESC;

                EXEC dbo.sp_CreditarSaldoFavorUsuario
                    @UsuarioId, @ProfesionalId, @MontoEv,
                    N'CreditoEventoCancelado', N'EventoCanceladoRetiro',
                    N'Devolución por evento cancelado o reprogramado — retiro a saldo a favor.',
                    NULL, @EntidadId, NULL, @PagoInscId;

                UPDATE Inscripcion SET Estado = N'Cancelada', FechaModificacion = GETDATE()
                WHERE  InscripcionId = @EntidadId;
                SET @RedirectUrl = N'/HomeUsuario';
            END
            ELSE IF @OpcionElegida = N'ExplorarAlternativas'
            BEGIN
                UPDATE Inscripcion SET Estado = N'Cancelada', FechaModificacion = GETDATE()
                WHERE  InscripcionId = @EntidadId;
                SET @RedirectUrl = N'/Eventos';
            END
            ELSE BEGIN ROLLBACK; SELECT 0 AS Exito, N'Opción no válida para este evento.' AS Mensaje; RETURN; END
        END
        ELSE IF @EntidadTipo = N'Cita'
        BEGIN
            SELECT @ProfesionalId = c.ProfesionalId
            FROM   Cita c
            WHERE  c.CitaId = @EntidadId AND c.UsuarioId = @UsuarioId;

            IF @ProfesionalId IS NULL BEGIN ROLLBACK; SELECT 0 AS Exito, N'Cita no válida.' AS Mensaje; RETURN; END

            IF @OpcionElegida = N'EsperarCincoMinutos'
            BEGIN
                COMMIT TRANSACTION;
                SELECT 1 AS Exito, N'Esperando 5 minutos adicionales.' AS Mensaje, @RedirectUrl AS RedirectUrl, @ProfesionalId AS ProfesionalId;
                RETURN;
            END
            ELSE IF @OpcionElegida = N'Reagendar'
            BEGIN
                UPDATE Cita SET Estado = N'Programada', FechaModificacion = GETDATE()
                WHERE  CitaId = @EntidadId;
                SET @RedirectUrl = N'/PerfilOrador/Calendario?id=' + CAST(@ProfesionalId AS NVARCHAR(20));
            END
            ELSE IF @OpcionElegida = N'RetirarDinero'
            BEGIN
                DECLARE @MontoCita DECIMAL(12,2);
                DECLARE @PagoCitaId INT;
                SELECT TOP 1
                    @MontoCita = pc.Monto + pc.TarifaPlataforma,
                    @PagoCitaId = pc.PagoCitaId
                FROM   PagoCita pc
                WHERE  pc.CitaId = @EntidadId AND pc.Estado = N'Aprobado'
                ORDER  BY pc.FechaPago DESC;

                EXEC dbo.sp_CreditarSaldoFavorUsuario
                    @UsuarioId, @ProfesionalId, @MontoCita,
                    N'CreditoCitaProfesionalAusente', N'CitaProfesionalAusente',
                    N'Devolución por inasistencia del profesional a la cita.',
                    @EntidadId, NULL, @PagoCitaId, NULL;

                UPDATE Cita SET Estado = N'Cancelada', FechaModificacion = GETDATE()
                WHERE  CitaId = @EntidadId;
                SET @RedirectUrl = N'/HomeUsuario';
            END
            ELSE BEGIN ROLLBACK; SELECT 0 AS Exito, N'Opción no válida para esta cita.' AS Mensaje; RETURN; END
        END
        ELSE BEGIN ROLLBACK; SELECT 0 AS Exito, N'Tipo de novedad no soportado.' AS Mensaje; RETURN; END

        UPDATE NovedadUsuario
        SET    Estado = N'Resuelta', OpcionElegida = @OpcionElegida,
               FechaResolucion = GETDATE(), FechaModificacion = GETDATE()
        WHERE  NovedadUsuarioId = @NovedadUsuarioId;

        COMMIT TRANSACTION;
        SELECT 1 AS Exito, N'Novedad resuelta correctamente.' AS Mensaje, @RedirectUrl AS RedirectUrl, @ProfesionalId AS ProfesionalId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId;
    END CATCH
END
GO

-- ============================================================
-- Reporte anticipado del profesional (≤5 min antes)
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_ReportarAusenciaProfesionalCita
    @CitaId         INT,
    @ProfesionalId  INT,
    @Mensaje        NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UsuarioId INT, @FechaHora DATETIME2(0), @Estado NVARCHAR(20);
    SELECT @UsuarioId = UsuarioId, @FechaHora = FechaHora, @Estado = Estado
    FROM   Cita WHERE CitaId = @CitaId AND ProfesionalId = @ProfesionalId;

    IF @UsuarioId IS NULL BEGIN SELECT 0 AS Exito, N'Cita no encontrada.' AS Mensaje; RETURN; END
    IF @Estado NOT IN (N'Programada', N'Movida') BEGIN SELECT 0 AS Exito, N'La cita no admite reporte de ausencia.' AS Mensaje; RETURN; END

    IF GETDATE() > @FechaHora
    BEGIN SELECT 0 AS Exito, N'Solo puedes reportar ausencia hasta 5 minutos antes de la cita.' AS Mensaje; RETURN; END

    IF DATEDIFF(MINUTE, GETDATE(), @FechaHora) > 5
    BEGIN SELECT 0 AS Exito, N'Solo puedes reportar ausencia en los últimos 5 minutos antes de la cita.' AS Mensaje; RETURN; END

    IF NOT EXISTS (SELECT 1 FROM CitaAsistencia WHERE CitaId = @CitaId)
        INSERT INTO CitaAsistencia (CitaId) VALUES (@CitaId);

    UPDATE CitaAsistencia
    SET    ProfesionalReportoAusencia = 1,
           FechaReporteAusencia = GETDATE(),
           MensajeReporteAusencia = @Mensaje,
           TipoAusencia = N'Profesional',
           FechaModificacion = GETDATE()
    WHERE  CitaId = @CitaId;

    UPDATE Cita SET Estado = N'PendienteDecisionUsuario', FechaModificacion = GETDATE()
    WHERE  CitaId = @CitaId;

    IF NOT EXISTS (
        SELECT 1 FROM NovedadUsuario
        WHERE  UsuarioId = @UsuarioId AND EntidadTipo = N'Cita' AND EntidadId = @CitaId AND Estado = N'Pendiente')
    BEGIN
        INSERT INTO NovedadUsuario (UsuarioId, TipoNovedad, EntidadTipo, EntidadId, Titulo, Mensaje, Estado)
        VALUES (
            @UsuarioId, N'ProfesionalReportoAusencia', N'Cita', @CitaId,
            N'El profesional no podrá asistir a tu cita',
            ISNULL(@Mensaje, N'El profesional informó que no podrá asistir. Elige cómo deseas continuar.'),
            N'Pendiente');
    END

    SELECT 1 AS Exito, N'Ausencia reportada. El usuario fue notificado.' AS Mensaje;
END
GO

-- ============================================================
-- Evaluar inasistencia del profesional (5 min gracia, ingreso sala)
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_EvaluarInasistenciaCita
    @CitaId    INT,
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ProfesionalId INT, @FechaHora DATETIME2(0), @Estado NVARCHAR(20);
    SELECT @ProfesionalId = ProfesionalId, @FechaHora = FechaHora, @Estado = Estado
    FROM   Cita WHERE CitaId = @CitaId AND UsuarioId = @UsuarioId;

    IF @ProfesionalId IS NULL BEGIN SELECT 0 AS RequiereModal, NULL AS NovedadUsuarioId; RETURN; END

    DECLARE @MinGracia INT = TRY_CAST((
        SELECT Valor FROM Configuracion WHERE Clave = N'Financiero.MinutosGraciaInasistencia') AS INT);
    IF @MinGracia IS NULL SET @MinGracia = 5;

    DECLARE @UsuarioIngreso DATETIME2(0), @ProfesionalIngreso DATETIME2(0), @Reporto BIT;
    SELECT @UsuarioIngreso = UsuarioIngresoSala,
           @ProfesionalIngreso = ProfesionalIngresoSala,
           @Reporto = ProfesionalReportoAusencia
    FROM   CitaAsistencia WHERE CitaId = @CitaId;

    IF @Reporto = 1 OR @Estado = N'PendienteDecisionUsuario'
    BEGIN
        SELECT TOP 1 1 AS RequiereModal, n.NovedadUsuarioId
        FROM   NovedadUsuario n
        WHERE  n.UsuarioId = @UsuarioId AND n.EntidadTipo = N'Cita' AND n.EntidadId = @CitaId
          AND  n.Estado = N'Pendiente'
        ORDER  BY n.FechaCreacion DESC;
        RETURN;
    END

    IF GETDATE() < DATEADD(MINUTE, @MinGracia, @FechaHora)
    BEGIN SELECT 0 AS RequiereModal, NULL AS NovedadUsuarioId; RETURN; END

    IF @ProfesionalIngreso IS NOT NULL
    BEGIN SELECT 0 AS RequiereModal, NULL AS NovedadUsuarioId; RETURN; END

    IF @UsuarioIngreso IS NULL
    BEGIN SELECT 0 AS RequiereModal, NULL AS NovedadUsuarioId; RETURN; END

    UPDATE Cita SET Estado = N'PendienteDecisionUsuario', FechaModificacion = GETDATE()
    WHERE  CitaId = @CitaId;

    IF NOT EXISTS (SELECT 1 FROM CitaAsistencia WHERE CitaId = @CitaId)
        INSERT INTO CitaAsistencia (CitaId, UsuarioIngresoSala, TipoAusencia, EvaluacionCompleta)
        VALUES (@CitaId, @UsuarioIngreso, N'Profesional', 1);
    ELSE
        UPDATE CitaAsistencia
        SET    TipoAusencia = N'Profesional', EvaluacionCompleta = 1, FechaModificacion = GETDATE()
        WHERE  CitaId = @CitaId;

    DECLARE @NovedadId INT;
    INSERT INTO NovedadUsuario (UsuarioId, TipoNovedad, EntidadTipo, EntidadId, Titulo, Mensaje, Estado)
    VALUES (
        @UsuarioId, N'ProfesionalNoAsistio', N'Cita', @CitaId,
        N'El profesional no ha asistido a la cita',
        N'Pasaron ' + CAST(@MinGracia AS NVARCHAR(10)) + N' minutos y el profesional no ingresó a la sala. Elige cómo deseas continuar.',
        N'Pendiente');
    SET @NovedadId = SCOPE_IDENTITY();

    SELECT 1 AS RequiereModal, @NovedadId AS NovedadUsuarioId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_ObtenerNovedadPendienteUsuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 1
        n.NovedadUsuarioId,
        n.TipoNovedad,
        n.EntidadTipo,
        n.EntidadId,
        n.Titulo,
        n.Mensaje,
        n.Estado,
        n.FechaCreacion,
        CASE n.EntidadTipo
            WHEN N'Cita' THEN (SELECT c.ProfesionalId FROM Cita c WHERE c.CitaId = n.EntidadId)
            WHEN N'Inscripcion' THEN (SELECT s.ProfesionalId FROM Inscripcion i JOIN Sala s ON s.SalaId = i.SalaId WHERE i.InscripcionId = n.EntidadId)
            ELSE NULL
        END AS ProfesionalId
    FROM   NovedadUsuario n
    WHERE  n.UsuarioId = @UsuarioId AND n.Estado = N'Pendiente'
    ORDER  BY n.FechaCreacion ASC;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_CancelarEventoSalaConNovedades
    @SalaId        INT,
    @ProfesionalId INT,
    @Motivo        NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Sala WHERE SalaId = @SalaId AND ProfesionalId = @ProfesionalId)
    BEGIN SELECT 0 AS Exito, N'No autorizado.' AS Mensaje; RETURN; END

    DECLARE @MensajeFinal NVARCHAR(500) = ISNULL(@Motivo, N'El profesional canceló el evento.');

    EXEC dbo.sp_GenerarNovedadesEventoSala
        @SalaId = @SalaId,
        @TipoNovedad = N'EventoCancelado',
        @MensajeExtra = @MensajeFinal;

    SELECT 1 AS Exito, N'Evento cancelado. Se notificó a los usuarios inscritos.' AS Mensaje;
END
GO

PRINT N'50_NovedadesFlujosFinancieros — aplicado.';
GO

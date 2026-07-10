-- Conferencia en vivo: opciones de retiro (saldo a favor, tránsito, salir sin dinero)
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_NovedadUsuario_Opcion')
    ALTER TABLE dbo.NovedadUsuario DROP CONSTRAINT CK_NovedadUsuario_Opcion;
GO

ALTER TABLE dbo.NovedadUsuario ADD CONSTRAINT CK_NovedadUsuario_Opcion CHECK (
    OpcionElegida IS NULL
    OR OpcionElegida IN (
        N'AceptarNuevaFecha',
        N'RetirarDinero',
        N'RetirarSaldoFavor',
        N'ExplorarAlternativas',
        N'EsperarCincoMinutos',
        N'EsperarEnEvento',
        N'SalirConferencia',
        N'Reagendar'
    )
);
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
        END AS ProfesionalId,
        CASE
            WHEN n.TipoNovedad = N'ProfesionalNoIngresoEvento'
                 AND n.EntidadTipo = N'Inscripcion'
                 AND EXISTS (
                     SELECT 1 FROM PagoInscripcion pi
                     WHERE pi.InscripcionId = n.EntidadId AND pi.Estado = N'Aprobado')
            THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
        END AS TienePagoAprobado
    FROM   NovedadUsuario n
    WHERE  n.UsuarioId = @UsuarioId AND n.Estado = N'Pendiente'
    ORDER  BY n.FechaCreacion ASC;
END
GO

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

        IF @Estado IS NULL BEGIN ROLLBACK; SELECT 0 AS Exito, N'Novedad no encontrada.' AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId; RETURN; END
        IF @Estado <> N'Pendiente' BEGIN ROLLBACK; SELECT 0 AS Exito, N'Esta novedad ya fue resuelta.' AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId; RETURN; END

        DECLARE @RedirectUrl NVARCHAR(500) = NULL;
        DECLARE @ProfesionalId INT = NULL;
        DECLARE @MensajeExito NVARCHAR(500) = N'Novedad resuelta correctamente.';

        IF @EntidadTipo = N'Inscripcion'
        BEGIN
            SELECT @ProfesionalId = s.ProfesionalId
            FROM   Inscripcion i JOIN Sala s ON s.SalaId = i.SalaId
            WHERE  i.InscripcionId = @EntidadId AND i.UsuarioId = @UsuarioId;

            IF @ProfesionalId IS NULL BEGIN ROLLBACK; SELECT 0 AS Exito, N'Inscripción no válida.' AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId; RETURN; END

            IF @Tipo = N'ProfesionalNoIngresoEvento'
            BEGIN
                IF @OpcionElegida IN (N'EsperarCincoMinutos', N'EsperarEnEvento')
                BEGIN
                    COMMIT TRANSACTION;
                    SELECT 1 AS Exito, N'Esperando al ponente.' AS Mensaje, NULL AS RedirectUrl, @ProfesionalId AS ProfesionalId;
                    RETURN;
                END
                ELSE IF @OpcionElegida = N'SalirConferencia'
                BEGIN
                    SET @RedirectUrl = N'/Eventos';
                    SET @MensajeExito = N'Saliste del evento. Puedes volver a ingresar cuando lo desees.';
                END
                ELSE IF @OpcionElegida = N'RetirarSaldoFavor'
                BEGIN
                    DECLARE @MontoSaldo DECIMAL(12,2);
                    DECLARE @PagoInscSaldo INT;
                    SELECT TOP 1 @MontoSaldo = pi.Monto, @PagoInscSaldo = pi.PagoId
                    FROM   PagoInscripcion pi
                    WHERE  pi.InscripcionId = @EntidadId AND pi.Estado = N'Aprobado'
                    ORDER  BY pi.FechaPago DESC;

                    IF @MontoSaldo IS NULL BEGIN ROLLBACK; SELECT 0 AS Exito, N'No hay pago aprobado para devolver.' AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId; RETURN; END

                    EXEC dbo.sp_CreditarSaldoFavorUsuario
                        @UsuarioId, @ProfesionalId, @MontoSaldo,
                        N'CreditoEventoProfesionalAusente', N'EventoProfesionalAusente',
                        N'Devolución por inasistencia del profesional al evento en vivo.',
                        NULL, @EntidadId, NULL, @PagoInscSaldo;

                    UPDATE Inscripcion SET Estado = N'Cancelada', FechaModificacion = GETDATE()
                    WHERE  InscripcionId = @EntidadId;
                    SET @RedirectUrl = N'/PerfilUsuario?tab=saldos';
                    SET @MensajeExito = N'Se generó saldo a favor. Tu inscripción al evento fue cancelada.';
                END
                ELSE IF @OpcionElegida = N'RetirarDinero'
                BEGIN
                    DECLARE @MontoEvLive DECIMAL(12,2);
                    DECLARE @PagoInscLive INT;
                    DECLARE @CuentaRetiroId INT;

                    SELECT TOP 1 @MontoEvLive = pi.Monto, @PagoInscLive = pi.PagoId
                    FROM   PagoInscripcion pi
                    WHERE  pi.InscripcionId = @EntidadId AND pi.Estado = N'Aprobado'
                    ORDER  BY pi.FechaPago DESC;

                    IF @MontoEvLive IS NULL BEGIN ROLLBACK; SELECT 0 AS Exito, N'No hay pago aprobado para devolver.' AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId; RETURN; END

                    SELECT @CuentaRetiroId = CuentaBancariaUsuarioId
                    FROM   CuentaBancariaUsuario
                    WHERE  UsuarioId = @UsuarioId AND Estado = N'Activa';

                    IF @CuentaRetiroId IS NULL
                    BEGIN
                        ROLLBACK TRANSACTION;
                        SELECT 0 AS Exito, N'Debes registrar tus datos bancarios antes de retirar.' AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId;
                        RETURN;
                    END

                    EXEC dbo.sp_CreditarSaldoFavorUsuario
                        @UsuarioId, @ProfesionalId, @MontoEvLive,
                        N'CreditoEventoProfesionalAusente', N'EventoProfesionalAusente',
                        N'Devolución por inasistencia del profesional al evento en vivo.',
                        NULL, @EntidadId, NULL, @PagoInscLive;

                    DECLARE @PctStr NVARCHAR(50) = (
                        SELECT Valor FROM Configuracion WHERE Clave = N'Financiero.ComisionRetiroPorcentaje');
                    DECLARE @Pct DECIMAL(9,4) = TRY_CAST(REPLACE(ISNULL(@PctStr, N'0'), N',', N'.') AS DECIMAL(9,4));
                    IF @Pct IS NULL SET @Pct = 0;

                    DECLARE @DiasRetract INT = TRY_CAST((
                        SELECT Valor FROM Configuracion WHERE Clave = N'Financiero.DiasRetractacionRetiro') AS INT);
                    DECLARE @DiasMax INT = TRY_CAST((
                        SELECT Valor FROM Configuracion WHERE Clave = N'Financiero.DiasDesembolsoMax') AS INT);

                    IF @DiasRetract IS NULL SET @DiasRetract = 5;
                    IF @DiasMax IS NULL SET @DiasMax = 30;

                    DECLARE @ComisionRet DECIMAL(12,2) = ROUND(@MontoEvLive * @Pct / 100.0, 0);
                    DECLARE @NetoRet DECIMAL(12,2) = @MontoEvLive - @ComisionRet;
                    DECLARE @AhoraRet DATETIME2(0) = GETDATE();

                    INSERT INTO MovimientoSaldoUsuario (
                        UsuarioId, TipoMovimiento, OrigenEntidad, MontoBruto, Comision, MontoNeto,
                        Estado, CuentaBancariaUsuarioId, FechaLimiteRetractacion, FechaEstimadaDesembolso)
                    VALUES (
                        @UsuarioId, N'DebitoRetiroSaldo', N'Retiro', @MontoEvLive, 0, @MontoEvLive,
                        N'SaldoFavor', @CuentaRetiroId, NULL, NULL);

                    INSERT INTO MovimientoSaldoUsuario (
                        UsuarioId, TipoMovimiento, OrigenEntidad, MontoBruto, Comision, MontoNeto,
                        Estado, CuentaBancariaUsuarioId, FechaLimiteRetractacion, FechaEstimadaDesembolso)
                    VALUES (
                        @UsuarioId, N'RetiroBancario', N'Retiro', @MontoEvLive, @ComisionRet, @NetoRet,
                        N'EnTransito', @CuentaRetiroId,
                        DATEADD(DAY, @DiasRetract, @AhoraRet),
                        DATEADD(DAY, @DiasMax, @AhoraRet));

                    UPDATE Inscripcion SET Estado = N'Cancelada', FechaModificacion = GETDATE()
                    WHERE  InscripcionId = @EntidadId;
                    SET @RedirectUrl = N'/PerfilUsuario?tab=saldos';
                    SET @MensajeExito = N'Tu dinero está en tránsito hacia tu cuenta bancaria. Tu inscripción al evento fue cancelada.';
                END
                ELSE BEGIN ROLLBACK; SELECT 0 AS Exito, N'Opción no válida para este evento.' AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId; RETURN; END
            END
            ELSE IF @OpcionElegida = N'AceptarNuevaFecha'
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
            ELSE BEGIN ROLLBACK; SELECT 0 AS Exito, N'Opción no válida para este evento.' AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId; RETURN; END
        END
        ELSE IF @EntidadTipo = N'Cita'
        BEGIN
            SELECT @ProfesionalId = c.ProfesionalId
            FROM   Cita c
            WHERE  c.CitaId = @EntidadId AND c.UsuarioId = @UsuarioId;

            IF @ProfesionalId IS NULL BEGIN ROLLBACK; SELECT 0 AS Exito, N'Cita no válida.' AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId; RETURN; END

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
            ELSE BEGIN ROLLBACK; SELECT 0 AS Exito, N'Opción no válida para esta cita.' AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId; RETURN; END
        END
        ELSE BEGIN ROLLBACK; SELECT 0 AS Exito, N'Tipo de novedad no soportado.' AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId; RETURN; END

        IF @OpcionElegida <> N'SalirConferencia'
        BEGIN
            UPDATE NovedadUsuario
            SET    Estado = N'Resuelta', OpcionElegida = @OpcionElegida,
                   FechaResolucion = GETDATE(), FechaModificacion = GETDATE()
            WHERE  NovedadUsuarioId = @NovedadUsuarioId;
        END

        COMMIT TRANSACTION;
        SELECT 1 AS Exito, @MensajeExito AS Mensaje, @RedirectUrl AS RedirectUrl, @ProfesionalId AS ProfesionalId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId;
    END CATCH
END
GO

PRINT N'53_ConferenciaOpcionesRetiroEvento — aplicado.';
GO

CREATE OR ALTER PROCEDURE dbo.sp_ObtenerNovedadesUsuario
    @UsuarioId    INT,
    @Estado       NVARCHAR(20) = N'Pendiente',
    @Pagina       INT = 1,
    @TamanoPagina INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    SELECT n.NovedadUsuarioId,
           n.TipoNovedad,
           n.EntidadTipo,
           n.EntidadId,
           n.Titulo,
           n.Mensaje,
           n.Estado,
           n.OpcionElegida,
           n.FechaCreacion,
           n.FechaResolucion,
           CASE
               WHEN n.TipoNovedad = N'ProfesionalNoIngresoEvento'
                    AND n.EntidadTipo = N'Inscripcion'
                    AND EXISTS (
                        SELECT 1 FROM PagoInscripcion pi
                        WHERE pi.InscripcionId = n.EntidadId AND pi.Estado = N'Aprobado')
               THEN CAST(1 AS BIT)
               ELSE CAST(0 AS BIT)
           END AS TienePagoAprobado,
           (SELECT COUNT(*)
            FROM   NovedadUsuario nx
            WHERE  nx.UsuarioId = @UsuarioId
              AND  (@Estado = N'Todos' OR nx.Estado = @Estado)) AS TotalRegistros
    FROM   NovedadUsuario n
    WHERE  n.UsuarioId = @UsuarioId
      AND  (@Estado = N'Todos' OR n.Estado = @Estado)
    ORDER  BY
        CASE WHEN n.Estado = N'Pendiente' THEN 0 ELSE 1 END,
        n.FechaCreacion DESC
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH  NEXT @TamanoPagina ROWS ONLY;
END
GO

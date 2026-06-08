-- Mis Saldos — stored procedures (consultas, cuenta bancaria, retiro, novedades)
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Ampliar tipos de movimiento para débito por retiro
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_MovSaldo_TipoMovimiento')
    ALTER TABLE dbo.MovimientoSaldoUsuario DROP CONSTRAINT CK_MovSaldo_TipoMovimiento;
GO

ALTER TABLE dbo.MovimientoSaldoUsuario ADD CONSTRAINT CK_MovSaldo_TipoMovimiento
    CHECK (TipoMovimiento IN (
        N'CreditoEventoCancelado',
        N'CreditoCitaProfesionalAusente',
        N'RecargaVoluntaria',
        N'DebitoPagoCita',
        N'DebitoPagoEvento',
        N'DebitoRetiroSaldo',
        N'RetiroBancario',
        N'RetractacionRetiro',
        N'RetencionPlataforma'
    ));
GO

CREATE OR ALTER PROCEDURE dbo.sp_ObtenerResumenMisSaldosUsuario
    @UsuarioId INT,
    @FechaDesde DATETIME2(0) = NULL,
    @FechaHasta DATETIME2(0) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @HastaExclusive DATETIME2(0) = CASE
        WHEN @FechaHasta IS NULL THEN NULL
        ELSE DATEADD(DAY, 1, CAST(CAST(@FechaHasta AS DATE) AS DATETIME2(0)))
    END;

    SELECT
        ISNULL((
            SELECT SUM(x.Monto)
            FROM (
                SELECT pc.Monto + pc.TarifaPlataforma AS Monto
                FROM   PagoCita pc
                WHERE  pc.UsuarioId = @UsuarioId AND pc.Estado = N'Aprobado'
                  AND  (@FechaDesde IS NULL OR pc.FechaPago >= @FechaDesde)
                  AND  (@HastaExclusive IS NULL OR pc.FechaPago < @HastaExclusive)
                UNION ALL
                SELECT pi.Monto
                FROM   PagoInscripcion pi
                JOIN   Inscripcion i ON i.InscripcionId = pi.InscripcionId
                WHERE  i.UsuarioId = @UsuarioId AND pi.Estado = N'Aprobado'
                  AND  (@FechaDesde IS NULL OR pi.FechaPago >= @FechaDesde)
                  AND  (@HastaExclusive IS NULL OR pi.FechaPago < @HastaExclusive)
            ) x
        ), 0) AS TotalPagado,

        (
            SELECT COUNT(DISTINCT i.InscripcionId)
            FROM   Inscripcion i
            JOIN   Sala s ON s.SalaId = i.SalaId
            OUTER APPLY (
                SELECT TOP 1 e.FechaFin
                FROM   Evento e
                WHERE  e.SalaId = s.SalaId
                ORDER  BY e.FechaInicio DESC
            ) ev
            WHERE  i.UsuarioId = @UsuarioId
              AND  i.Estado NOT IN (N'Cancelada', N'PendientePago', N'PagoRechazado')
              AND  (s.Estado = N'Cerrada' OR (ev.FechaFin IS NOT NULL AND ev.FechaFin < GETDATE()))
              AND  (@FechaDesde IS NULL OR i.FechaInscripcion >= @FechaDesde)
              AND  (@HastaExclusive IS NULL OR i.FechaInscripcion < @HastaExclusive)
        ) AS TotalEventosAsistidos,

        (
            SELECT COUNT(*)
            FROM   Cita c
            WHERE  c.UsuarioId = @UsuarioId
              AND  (@FechaDesde IS NULL OR c.FechaHora >= @FechaDesde)
              AND  (@HastaExclusive IS NULL OR c.FechaHora < @HastaExclusive)
        ) AS TotalCitas,

        ISNULL((
            SELECT SUM(
                CASE
                    WHEN m.TipoMovimiento IN (
                        N'CreditoEventoCancelado', N'CreditoCitaProfesionalAusente',
                        N'RecargaVoluntaria', N'RetractacionRetiro')
                        AND m.Estado = N'SaldoFavor' THEN m.MontoNeto
                    WHEN m.TipoMovimiento IN (N'DebitoPagoCita', N'DebitoPagoEvento', N'DebitoRetiroSaldo')
                        AND m.Estado = N'SaldoFavor' THEN -m.MontoBruto
                    ELSE 0
                END)
            FROM MovimientoSaldoUsuario m
            WHERE m.UsuarioId = @UsuarioId
        ), 0) AS SaldoFavor,

        ISNULL((
            SELECT SUM(m.MontoBruto)
            FROM   MovimientoSaldoUsuario m
            WHERE  m.UsuarioId = @UsuarioId AND m.Estado = N'EnTransito'
        ), 0) AS DineroEnTransito;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_ObtenerPagosPorProfesionalUsuario
    @UsuarioId    INT,
    @FechaDesde   DATETIME2(0) = NULL,
    @FechaHasta   DATETIME2(0) = NULL,
    @Pagina       INT = 1,
    @TamanoPagina INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @HastaExclusive DATETIME2(0) = CASE
        WHEN @FechaHasta IS NULL THEN NULL
        ELSE DATEADD(DAY, 1, CAST(CAST(@FechaHasta AS DATE) AS DATETIME2(0)))
    END;

    ;WITH Pagos AS (
        SELECT c.ProfesionalId,
               SUM(pc.Monto + pc.TarifaPlataforma) AS TotalPagado,
               COUNT(*) AS TotalTransacciones
        FROM   PagoCita pc
        JOIN   Cita c ON c.CitaId = pc.CitaId
        WHERE  pc.UsuarioId = @UsuarioId AND pc.Estado = N'Aprobado'
          AND  (@FechaDesde IS NULL OR pc.FechaPago >= @FechaDesde)
          AND  (@HastaExclusive IS NULL OR pc.FechaPago < @HastaExclusive)
        GROUP  BY c.ProfesionalId

        UNION ALL

        SELECT s.ProfesionalId,
               SUM(pi.Monto) AS TotalPagado,
               COUNT(*) AS TotalTransacciones
        FROM   PagoInscripcion pi
        JOIN   Inscripcion i ON i.InscripcionId = pi.InscripcionId
        JOIN   Sala s ON s.SalaId = i.SalaId
        WHERE  i.UsuarioId = @UsuarioId AND pi.Estado = N'Aprobado'
          AND  (@FechaDesde IS NULL OR pi.FechaPago >= @FechaDesde)
          AND  (@HastaExclusive IS NULL OR pi.FechaPago < @HastaExclusive)
        GROUP  BY s.ProfesionalId
    ),
    Agrupado AS (
        SELECT ProfesionalId,
               SUM(TotalPagado) AS TotalPagado,
               SUM(TotalTransacciones) AS TotalTransacciones
        FROM   Pagos
        GROUP  BY ProfesionalId
    )
    SELECT a.ProfesionalId,
           pr.NombreCompleto AS NombreProfesional,
           ISNULL(pr.FotoPerfil, N'') AS FotoProfesional,
           a.TotalPagado,
           a.TotalTransacciones,
           (SELECT COUNT(*) FROM Agrupado) AS TotalRegistros
    FROM   Agrupado a
    JOIN   Profesional pr ON pr.ProfesionalId = a.ProfesionalId
    ORDER  BY a.TotalPagado DESC
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH  NEXT @TamanoPagina ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_ObtenerMovimientosEnTransitoUsuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT m.MovimientoSaldoUsuarioId,
           m.MontoBruto,
           m.Comision,
           m.MontoNeto,
           m.Estado,
           m.FechaLimiteRetractacion,
           m.FechaEstimadaDesembolso,
           m.FechaCreacion,
           cb.Banco,
           cb.NumeroCuenta,
           cb.TipoCuenta,
           cb.Titular
    FROM   MovimientoSaldoUsuario m
    LEFT JOIN CuentaBancariaUsuario cb ON cb.CuentaBancariaUsuarioId = m.CuentaBancariaUsuarioId
    WHERE  m.UsuarioId = @UsuarioId
      AND  m.Estado IN (N'EnTransito', N'Congelado')
    ORDER  BY m.FechaCreacion DESC;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_ObtenerCuentaBancariaUsuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CuentaBancariaUsuarioId,
           UsuarioId,
           Banco,
           TipoCuenta,
           NumeroCuenta,
           Titular,
           DocumentoTitular,
           Estado,
           FechaCreacion,
           FechaModificacion
    FROM   CuentaBancariaUsuario
    WHERE  UsuarioId = @UsuarioId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GuardarCuentaBancariaUsuario
    @UsuarioId          INT,
    @Banco              NVARCHAR(200),
    @TipoCuenta         NVARCHAR(30),
    @NumeroCuenta       NVARCHAR(50),
    @Titular            NVARCHAR(200),
    @DocumentoTitular   NVARCHAR(30) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Banco IS NULL OR LTRIM(RTRIM(@Banco)) = N''
    BEGIN SELECT 0 AS Exito, N'El banco es obligatorio.' AS Mensaje; RETURN; END
    IF @NumeroCuenta IS NULL OR LTRIM(RTRIM(@NumeroCuenta)) = N''
    BEGIN SELECT 0 AS Exito, N'El número de cuenta es obligatorio.' AS Mensaje; RETURN; END
    IF @Titular IS NULL OR LTRIM(RTRIM(@Titular)) = N''
    BEGIN SELECT 0 AS Exito, N'El titular es obligatorio.' AS Mensaje; RETURN; END
    IF @TipoCuenta NOT IN (N'Ahorros', N'Corriente')
    BEGIN SELECT 0 AS Exito, N'Tipo de cuenta no válido.' AS Mensaje; RETURN; END

    IF EXISTS (SELECT 1 FROM CuentaBancariaUsuario WHERE UsuarioId = @UsuarioId)
        UPDATE CuentaBancariaUsuario
        SET    Banco = LTRIM(RTRIM(@Banco)),
               TipoCuenta = @TipoCuenta,
               NumeroCuenta = LTRIM(RTRIM(@NumeroCuenta)),
               Titular = LTRIM(RTRIM(@Titular)),
               DocumentoTitular = NULLIF(LTRIM(RTRIM(@DocumentoTitular)), N''),
               Estado = N'Activa',
               FechaModificacion = GETDATE()
        WHERE  UsuarioId = @UsuarioId;
    ELSE
        INSERT INTO CuentaBancariaUsuario (UsuarioId, Banco, TipoCuenta, NumeroCuenta, Titular, DocumentoTitular, Estado)
        VALUES (@UsuarioId, LTRIM(RTRIM(@Banco)), @TipoCuenta, LTRIM(RTRIM(@NumeroCuenta)),
                LTRIM(RTRIM(@Titular)), NULLIF(LTRIM(RTRIM(@DocumentoTitular)), N''), N'Activa');

    SELECT 1 AS Exito, N'Datos bancarios guardados correctamente.' AS Mensaje;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_ContarNovedadesPendientesUsuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*) AS Total
    FROM   NovedadUsuario
    WHERE  UsuarioId = @UsuarioId AND Estado = N'Pendiente';
END
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

CREATE OR ALTER PROCEDURE dbo.sp_SolicitarRetiroSaldoUsuario
    @UsuarioId INT,
    @Monto     DECIMAL(12,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @SaldoDisponible DECIMAL(12,2);
        SELECT @SaldoDisponible = ISNULL(SUM(
            CASE
                WHEN m.TipoMovimiento IN (
                    N'CreditoEventoCancelado', N'CreditoCitaProfesionalAusente',
                    N'RecargaVoluntaria', N'RetractacionRetiro')
                    AND m.Estado = N'SaldoFavor' THEN m.MontoNeto
                WHEN m.TipoMovimiento IN (N'DebitoPagoCita', N'DebitoPagoEvento', N'DebitoRetiroSaldo')
                    AND m.Estado = N'SaldoFavor' THEN -m.MontoBruto
                ELSE 0
            END), 0)
        FROM MovimientoSaldoUsuario m
        WHERE m.UsuarioId = @UsuarioId;

        IF @Monto IS NULL OR @Monto <= 0 SET @Monto = @SaldoDisponible;

        IF @Monto <= 0
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, N'No tienes saldo a favor disponible.' AS Mensaje;
            RETURN;
        END

        IF @Monto > @SaldoDisponible
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, N'El monto supera tu saldo a favor disponible.' AS Mensaje;
            RETURN;
        END

        DECLARE @CuentaId INT;
        SELECT @CuentaId = CuentaBancariaUsuarioId
        FROM   CuentaBancariaUsuario
        WHERE  UsuarioId = @UsuarioId AND Estado = N'Activa';

        IF @CuentaId IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, N'Debes registrar tus datos bancarios antes de retirar.' AS Mensaje;
            RETURN;
        END

        DECLARE @PctStr NVARCHAR(50) = (
            SELECT Valor FROM Configuracion WHERE Clave = N'Financiero.ComisionRetiroPorcentaje');
        DECLARE @Pct DECIMAL(9,4) = TRY_CAST(REPLACE(ISNULL(@PctStr, N'0'), N',', N'.') AS DECIMAL(9,4));
        IF @Pct IS NULL SET @Pct = 0;

        DECLARE @DiasRetract INT = TRY_CAST((
            SELECT Valor FROM Configuracion WHERE Clave = N'Financiero.DiasRetractacionRetiro') AS INT);
        DECLARE @DiasMin INT = TRY_CAST((
            SELECT Valor FROM Configuracion WHERE Clave = N'Financiero.DiasDesembolsoMin') AS INT);
        DECLARE @DiasMax INT = TRY_CAST((
            SELECT Valor FROM Configuracion WHERE Clave = N'Financiero.DiasDesembolsoMax') AS INT);

        IF @DiasRetract IS NULL SET @DiasRetract = 5;
        IF @DiasMin IS NULL SET @DiasMin = 15;
        IF @DiasMax IS NULL SET @DiasMax = 30;

        DECLARE @Comision DECIMAL(12,2) = ROUND(@Monto * @Pct / 100.0, 0);
        DECLARE @Neto DECIMAL(12,2) = @Monto - @Comision;
        DECLARE @Ahora DATETIME2(0) = GETDATE();

        INSERT INTO MovimientoSaldoUsuario (
            UsuarioId, TipoMovimiento, OrigenEntidad, MontoBruto, Comision, MontoNeto,
            Estado, CuentaBancariaUsuarioId, FechaLimiteRetractacion, FechaEstimadaDesembolso)
        VALUES (
            @UsuarioId, N'DebitoRetiroSaldo', N'Retiro', @Monto, 0, @Monto,
            N'SaldoFavor', @CuentaId, NULL, NULL);

        INSERT INTO MovimientoSaldoUsuario (
            UsuarioId, TipoMovimiento, OrigenEntidad, MontoBruto, Comision, MontoNeto,
            Estado, CuentaBancariaUsuarioId, FechaLimiteRetractacion, FechaEstimadaDesembolso)
        VALUES (
            @UsuarioId, N'RetiroBancario', N'Retiro', @Monto, @Comision, @Neto,
            N'EnTransito', @CuentaId,
            DATEADD(DAY, @DiasRetract, @Ahora),
            DATEADD(DAY, @DiasMax, @Ahora));

        COMMIT TRANSACTION;
        SELECT 1 AS Exito,
               N'Retiro solicitado. Tu dinero estará en tránsito entre '
               + CAST(@DiasMin AS NVARCHAR(10)) + N' y '
               + CAST(@DiasMax AS NVARCHAR(10)) + N' días hábiles.' AS Mensaje,
               @Monto AS MontoBruto,
               @Comision AS Comision,
               @Neto AS MontoNeto;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_RetractarRetiroSaldoUsuario
    @UsuarioId                INT,
    @MovimientoSaldoUsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @Estado NVARCHAR(20);
        DECLARE @Monto DECIMAL(12,2);
        DECLARE @Limite DATETIME2(0);

        SELECT @Estado = Estado, @Monto = MontoBruto, @Limite = FechaLimiteRetractacion
        FROM   MovimientoSaldoUsuario
        WHERE  MovimientoSaldoUsuarioId = @MovimientoSaldoUsuarioId AND UsuarioId = @UsuarioId;

        IF @Estado IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, N'Movimiento no encontrado.' AS Mensaje;
            RETURN;
        END

        IF @Estado <> N'EnTransito'
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, N'Solo puedes cancelar retiros en tránsito.' AS Mensaje;
            RETURN;
        END

        IF @Limite IS NOT NULL AND GETDATE() > @Limite
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, N'El plazo de retractación ha vencido.' AS Mensaje;
            RETURN;
        END

        UPDATE MovimientoSaldoUsuario
        SET    Estado = N'Retractado', FechaModificacion = GETDATE()
        WHERE  MovimientoSaldoUsuarioId = @MovimientoSaldoUsuarioId;

        INSERT INTO MovimientoSaldoUsuario (
            UsuarioId, TipoMovimiento, OrigenEntidad, OrigenEntidadId,
            MontoBruto, Comision, MontoNeto, Estado, Notas)
        VALUES (
            @UsuarioId, N'RetractacionRetiro', N'Retiro', @MovimientoSaldoUsuarioId,
            @Monto, 0, @Monto, N'SaldoFavor',
            N'Retractación de retiro bancario');

        COMMIT TRANSACTION;
        SELECT 1 AS Exito, N'Retiro cancelado. El saldo volvió a tu cuenta a favor.' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END
GO

PRINT N'49_MisSaldosSps — procedures aplicados.';
GO

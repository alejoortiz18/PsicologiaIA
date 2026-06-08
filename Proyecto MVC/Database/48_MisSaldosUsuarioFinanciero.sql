-- Mis Saldos — módulo financiero del usuario
-- Tablas: CuentaBancariaUsuario, MovimientoSaldoUsuario, SaldoRecarga,
--         CitaAsistencia, NovedadUsuario, AjusteSaldoProfesional
-- Estados ampliados: Cita, Inscripcion, PagoCita, PagoInscripcion
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- ============================================================
-- 1. ESTADOS — Cita e Inscripcion
-- ============================================================

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_Cita_Estado')
    ALTER TABLE dbo.Cita DROP CONSTRAINT CK_Cita_Estado;
GO

ALTER TABLE dbo.Cita ADD CONSTRAINT CK_Cita_Estado
    CHECK (Estado IN (
        N'Programada',
        N'Cancelada',
        N'Movida',
        N'Finalizada',
        N'PendienteDecisionUsuario'
    ));
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_Inscripcion_Estado')
    ALTER TABLE dbo.Inscripcion DROP CONSTRAINT CK_Inscripcion_Estado;
GO

ALTER TABLE dbo.Inscripcion ADD CONSTRAINT CK_Inscripcion_Estado
    CHECK (Estado IN (
        N'PendientePago',
        N'PagoAprobado',
        N'PagoRechazado',
        N'Confirmada',
        N'SinCupos',
        N'ReembolsoPendiente',
        N'Cancelada',
        N'PendienteDecisionUsuario'
    ));
GO

-- ============================================================
-- 2. METODO DE PAGO — SaldoFavor
-- ============================================================

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_PagoCita_MetodoPago')
    ALTER TABLE dbo.PagoCita DROP CONSTRAINT CK_PagoCita_MetodoPago;
GO

ALTER TABLE dbo.PagoCita ADD CONSTRAINT CK_PagoCita_MetodoPago
    CHECK (MetodoPago IN (
        N'TarjetaCredito', N'TarjetaDebito', N'PSE', N'Efecty', N'Nequi', N'SaldoFavor'
    ));
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_PagoInsc_MetodoPago')
    ALTER TABLE dbo.PagoInscripcion DROP CONSTRAINT CK_PagoInsc_MetodoPago;
GO

ALTER TABLE dbo.PagoInscripcion ADD CONSTRAINT CK_PagoInsc_MetodoPago
    CHECK (MetodoPago IN (
        N'TarjetaCredito', N'TarjetaDebito', N'PSE', N'Efecty', N'Nequi', N'SaldoFavor'
    ));
GO

-- ============================================================
-- 3. CUENTA BANCARIA USUARIO
-- ============================================================

IF OBJECT_ID(N'dbo.CuentaBancariaUsuario', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CuentaBancariaUsuario (
        CuentaBancariaUsuarioId INT             IDENTITY(1,1) NOT NULL,
        UsuarioId               INT             NOT NULL,
        Banco                   NVARCHAR(200)   NOT NULL,
        TipoCuenta              NVARCHAR(30)    NOT NULL,
        NumeroCuenta            NVARCHAR(50)    NOT NULL,
        Titular                 NVARCHAR(200)   NOT NULL,
        DocumentoTitular        NVARCHAR(30)    NULL,
        Estado                  NVARCHAR(20)    NOT NULL DEFAULT N'Activa',
        FechaCreacion           DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        FechaModificacion       DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_CuentaBancariaUsuario PRIMARY KEY (CuentaBancariaUsuarioId),
        CONSTRAINT UQ_CuentaBancariaUsuario_Usuario UNIQUE (UsuarioId),
        CONSTRAINT FK_CuentaBancariaUsuario_Usuario
            FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuario(UsuarioId),
        CONSTRAINT CK_CuentaBancariaUsuario_Tipo
            CHECK (TipoCuenta IN (N'Ahorros', N'Corriente')),
        CONSTRAINT CK_CuentaBancariaUsuario_Estado
            CHECK (Estado IN (N'Activa', N'Invalida', N'PendienteValidacion'))
    );
END
GO

-- ============================================================
-- 4. MOVIMIENTO SALDO USUARIO (ledger)
-- ============================================================

IF OBJECT_ID(N'dbo.MovimientoSaldoUsuario', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.MovimientoSaldoUsuario (
        MovimientoSaldoUsuarioId INT             IDENTITY(1,1) NOT NULL,
        UsuarioId                INT             NOT NULL,
        TipoMovimiento           NVARCHAR(40)    NOT NULL,
        OrigenEntidad            NVARCHAR(20)    NULL,
        OrigenEntidadId          INT             NULL,
        ProfesionalId            INT             NULL,
        PagoCitaId               INT             NULL,
        PagoInscripcionId        INT             NULL,
        SaldoRecargaId           INT             NULL,
        MontoBruto               DECIMAL(12,2)   NOT NULL,
        Comision                 DECIMAL(12,2)   NOT NULL DEFAULT 0,
        MontoNeto                DECIMAL(12,2)   NOT NULL,
        Estado                   NVARCHAR(20)    NOT NULL DEFAULT N'SaldoFavor',
        CuentaBancariaUsuarioId  INT             NULL,
        FechaLimiteRetractacion  DATETIME2(0)    NULL,
        FechaEstimadaDesembolso  DATETIME2(0)    NULL,
        FechaDesembolso          DATETIME2(0)    NULL,
        Notas                    NVARCHAR(500)   NULL,
        FechaCreacion            DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        FechaModificacion        DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_MovimientoSaldoUsuario PRIMARY KEY (MovimientoSaldoUsuarioId),
        CONSTRAINT FK_MovSaldo_Usuario
            FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuario(UsuarioId),
        CONSTRAINT FK_MovSaldo_Profesional
            FOREIGN KEY (ProfesionalId) REFERENCES dbo.Profesional(ProfesionalId),
        CONSTRAINT FK_MovSaldo_PagoCita
            FOREIGN KEY (PagoCitaId) REFERENCES dbo.PagoCita(PagoCitaId),
        CONSTRAINT FK_MovSaldo_CuentaBancaria
            FOREIGN KEY (CuentaBancariaUsuarioId) REFERENCES dbo.CuentaBancariaUsuario(CuentaBancariaUsuarioId),
        CONSTRAINT CK_MovSaldo_TipoMovimiento CHECK (TipoMovimiento IN (
            N'CreditoEventoCancelado',
            N'CreditoEventoProfesionalAusente',
            N'CreditoCitaProfesionalAusente',
            N'RecargaVoluntaria',
            N'DebitoPagoCita',
            N'DebitoPagoEvento',
            N'RetiroBancario',
            N'RetractacionRetiro',
            N'RetencionPlataforma'
        )),
        CONSTRAINT CK_MovSaldo_OrigenEntidad CHECK (
            OrigenEntidad IS NULL
            OR OrigenEntidad IN (N'Cita', N'Inscripcion', N'Evento', N'Recarga', N'Retiro')
        ),
        CONSTRAINT CK_MovSaldo_Estado CHECK (Estado IN (
            N'SaldoFavor',
            N'EnTransito',
            N'Desembolsado',
            N'Retractado',
            N'Congelado',
            N'Retenido'
        )),
        CONSTRAINT CK_MovSaldo_Montos CHECK (MontoBruto > 0 AND MontoNeto >= 0 AND Comision >= 0)
    );
END
GO

-- FK PagoInscripcion (tabla usa PagoId como PK)
IF OBJECT_ID(N'dbo.MovimientoSaldoUsuario', N'U') IS NOT NULL
   AND NOT EXISTS (
       SELECT 1 FROM sys.foreign_keys
       WHERE name = N'FK_MovSaldo_PagoInscripcion'
         AND parent_object_id = OBJECT_ID(N'dbo.MovimientoSaldoUsuario'))
BEGIN
    ALTER TABLE dbo.MovimientoSaldoUsuario
        ADD CONSTRAINT FK_MovSaldo_PagoInscripcion
            FOREIGN KEY (PagoInscripcionId) REFERENCES dbo.PagoInscripcion(PagoId);
END
GO

-- ============================================================
-- 5. RECARGA SALDO A FAVOR
-- ============================================================

IF OBJECT_ID(N'dbo.SaldoRecarga', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SaldoRecarga (
        SaldoRecargaId      INT             IDENTITY(1,1) NOT NULL,
        UsuarioId           INT             NOT NULL,
        Monto               DECIMAL(12,2)   NOT NULL,
        MetodoPago          NVARCHAR(25)    NOT NULL,
        Estado              NVARCHAR(15)    NOT NULL DEFAULT N'Pendiente',
        ReferenciaPassarela NVARCHAR(200)   NULL,
        MovimientoSaldoUsuarioId INT        NULL,
        FechaPago           DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_SaldoRecarga PRIMARY KEY (SaldoRecargaId),
        CONSTRAINT FK_SaldoRecarga_Usuario
            FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuario(UsuarioId),
        CONSTRAINT FK_SaldoRecarga_Movimiento
            FOREIGN KEY (MovimientoSaldoUsuarioId) REFERENCES dbo.MovimientoSaldoUsuario(MovimientoSaldoUsuarioId),
        CONSTRAINT CK_SaldoRecarga_Metodo CHECK (MetodoPago IN (
            N'TarjetaCredito', N'TarjetaDebito', N'PSE', N'Efecty', N'Nequi'
        )),
        CONSTRAINT CK_SaldoRecarga_Estado CHECK (Estado IN (
            N'Pendiente', N'Aprobado', N'Rechazado'
        )),
        CONSTRAINT CK_SaldoRecarga_Monto CHECK (Monto > 0)
    );
END
GO

-- FK circular SaldoRecarga ↔ MovimientoSaldoUsuario
IF OBJECT_ID(N'dbo.MovimientoSaldoUsuario', N'U') IS NOT NULL
   AND NOT EXISTS (
       SELECT 1 FROM sys.foreign_keys
       WHERE name = N'FK_MovSaldo_SaldoRecarga'
         AND parent_object_id = OBJECT_ID(N'dbo.MovimientoSaldoUsuario'))
BEGIN
    ALTER TABLE dbo.MovimientoSaldoUsuario
        ADD CONSTRAINT FK_MovSaldo_SaldoRecarga
            FOREIGN KEY (SaldoRecargaId) REFERENCES dbo.SaldoRecarga(SaldoRecargaId);
END
GO

-- ============================================================
-- 6. ASISTENCIA A CITA (ingreso a sala — 5 min gracia)
-- ============================================================

IF OBJECT_ID(N'dbo.CitaAsistencia', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CitaAsistencia (
        CitaAsistenciaId            INT             IDENTITY(1,1) NOT NULL,
        CitaId                      INT             NOT NULL,
        UsuarioIngresoSala          DATETIME2(0)    NULL,
        ProfesionalIngresoSala      DATETIME2(0)    NULL,
        ProfesionalReportoAusencia  BIT             NOT NULL DEFAULT 0,
        FechaReporteAusencia        DATETIME2(0)    NULL,
        MensajeReporteAusencia      NVARCHAR(500)   NULL,
        EvaluacionCompleta          BIT             NOT NULL DEFAULT 0,
        TipoAusencia                NVARCHAR(20)    NULL,
        FechaCreacion               DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        FechaModificacion           DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_CitaAsistencia PRIMARY KEY (CitaAsistenciaId),
        CONSTRAINT UQ_CitaAsistencia_Cita UNIQUE (CitaId),
        CONSTRAINT FK_CitaAsistencia_Cita
            FOREIGN KEY (CitaId) REFERENCES dbo.Cita(CitaId),
        CONSTRAINT CK_CitaAsistencia_TipoAusencia CHECK (
            TipoAusencia IS NULL
            OR TipoAusencia IN (N'Profesional', N'Usuario', N'Ambos', N'Ninguno')
        )
    );
END
GO

-- ============================================================
-- 7. NOVEDADES USUARIO (tab Novedades en perfil)
-- ============================================================

IF OBJECT_ID(N'dbo.NovedadUsuario', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.NovedadUsuario (
        NovedadUsuarioId    INT             IDENTITY(1,1) NOT NULL,
        UsuarioId           INT             NOT NULL,
        TipoNovedad         NVARCHAR(40)    NOT NULL,
        EntidadTipo         NVARCHAR(20)    NOT NULL,
        EntidadId           INT             NOT NULL,
        Titulo              NVARCHAR(200)   NOT NULL,
        Mensaje             NVARCHAR(1000)  NOT NULL,
        Estado              NVARCHAR(20)    NOT NULL DEFAULT N'Pendiente',
        OpcionElegida       NVARCHAR(40)    NULL,
        FechaResolucion     DATETIME2(0)    NULL,
        FechaCreacion       DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_NovedadUsuario PRIMARY KEY (NovedadUsuarioId),
        CONSTRAINT FK_NovedadUsuario_Usuario
            FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuario(UsuarioId),
        CONSTRAINT CK_NovedadUsuario_Tipo CHECK (TipoNovedad IN (
            N'EventoCancelado',
            N'EventoReprogramado',
            N'ProfesionalNoAsistio',
            N'ProfesionalReportoAusencia',
            N'ProfesionalNoIngresoEvento'
        )),
        CONSTRAINT CK_NovedadUsuario_Entidad CHECK (
            EntidadTipo IN (N'Cita', N'Inscripcion', N'Evento')
        ),
        CONSTRAINT CK_NovedadUsuario_Estado CHECK (
            Estado IN (N'Pendiente', N'Resuelta', N'Expirada')
        ),
        CONSTRAINT CK_NovedadUsuario_Opcion CHECK (
            OpcionElegida IS NULL
            OR OpcionElegida IN (
                N'AceptarNuevaFecha',
                N'RetirarDinero',
                N'ExplorarAlternativas',
                N'EsperarCincoMinutos',
                N'Reagendar'
            )
        )
    );
END
GO

-- ============================================================
-- 8. AJUSTE SALDO PROFESIONAL (panel financiero)
-- ============================================================

IF OBJECT_ID(N'dbo.AjusteSaldoProfesional', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AjusteSaldoProfesional (
        AjusteSaldoProfesionalId INT             IDENTITY(1,1) NOT NULL,
        ProfesionalId            INT             NOT NULL,
        MovimientoSaldoUsuarioId INT             NOT NULL,
        Monto                    DECIMAL(12,2)   NOT NULL,
        MotivoCodigo             NVARCHAR(40)    NOT NULL,
        MotivoDetalle            NVARCHAR(500)   NOT NULL,
        CitaId                   INT             NULL,
        InscripcionId            INT             NULL,
        FechaCreacion            DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_AjusteSaldoProfesional PRIMARY KEY (AjusteSaldoProfesionalId),
        CONSTRAINT FK_AjusteSaldo_Profesional
            FOREIGN KEY (ProfesionalId) REFERENCES dbo.Profesional(ProfesionalId),
        CONSTRAINT FK_AjusteSaldo_Movimiento
            FOREIGN KEY (MovimientoSaldoUsuarioId) REFERENCES dbo.MovimientoSaldoUsuario(MovimientoSaldoUsuarioId),
        CONSTRAINT FK_AjusteSaldo_Cita
            FOREIGN KEY (CitaId) REFERENCES dbo.Cita(CitaId),
        CONSTRAINT FK_AjusteSaldo_Inscripcion
            FOREIGN KEY (InscripcionId) REFERENCES dbo.Inscripcion(InscripcionId),
        CONSTRAINT CK_AjusteSaldo_Motivo CHECK (MotivoCodigo IN (
            N'EventoCanceladoRetiro',
            N'EventoProfesionalAusente',
            N'CitaProfesionalAusente',
            N'EventoReprogramadoRetiro'
        )),
        CONSTRAINT CK_AjusteSaldo_Monto CHECK (Monto > 0)
    );
END
GO

-- ============================================================
-- 9. INDICES
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_MovSaldo_Usuario_Estado'
               AND object_id = OBJECT_ID(N'dbo.MovimientoSaldoUsuario'))
    CREATE INDEX IX_MovSaldo_Usuario_Estado
        ON dbo.MovimientoSaldoUsuario(UsuarioId, Estado);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_NovedadUsuario_Usuario_Estado'
               AND object_id = OBJECT_ID(N'dbo.NovedadUsuario'))
    CREATE INDEX IX_NovedadUsuario_Usuario_Estado
        ON dbo.NovedadUsuario(UsuarioId, Estado)
        WHERE Estado = N'Pendiente';
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AjusteSaldo_Profesional'
               AND object_id = OBJECT_ID(N'dbo.AjusteSaldoProfesional'))
    CREATE INDEX IX_AjusteSaldo_Profesional
        ON dbo.AjusteSaldoProfesional(ProfesionalId, FechaCreacion DESC);
GO

-- ============================================================
-- 10. PARAMETROS FINANCIEROS (Configuracion)
-- ============================================================

MERGE dbo.Configuracion AS tgt
USING (VALUES
    (N'Financiero.ComisionRetiroPorcentaje', N'3.5', N'Porcentaje de comisión al desembolsar saldo a favor a cuenta bancaria'),
    (N'Financiero.DiasRetractacionRetiro',    N'5',   N'Días hábiles para cancelar un retiro bancario'),
    (N'Financiero.DiasDesembolsoMin',        N'15',  N'Días hábiles mínimos de retención en tránsito'),
    (N'Financiero.DiasDesembolsoMax',        N'30',  N'Días hábiles máximos de retención en tránsito'),
    (N'Financiero.MesesRetencionCuentaInvalida', N'3', N'Meses sin actualizar cuenta bancaria antes de retención'),
    (N'Financiero.MinutosGraciaInasistencia', N'5',  N'Minutos de gracia tras hora de cita para detectar inasistencia en sala')
) AS src (Clave, Valor, Descripcion)
ON tgt.Clave = src.Clave
WHEN NOT MATCHED BY TARGET THEN
    INSERT (Clave, Valor, Descripcion, FechaModificacion)
    VALUES (src.Clave, src.Valor, src.Descripcion, GETDATE());
GO

-- ============================================================
-- 11. SP — Registrar ingreso a sala de cita
-- ============================================================

CREATE OR ALTER PROCEDURE dbo.sp_RegistrarIngresoCitaSala
    @CitaId         INT,
    @TipoParticipante NVARCHAR(15),
    @ParticipanteId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @TipoParticipante NOT IN (N'Usuario', N'Profesional')
    BEGIN
        SELECT 0 AS Exito, N'Tipo de participante no válido.' AS Mensaje;
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Cita WHERE CitaId = @CitaId)
    BEGIN
        SELECT 0 AS Exito, N'Cita no encontrada.' AS Mensaje;
        RETURN;
    END

    IF @TipoParticipante = N'Usuario'
       AND NOT EXISTS (SELECT 1 FROM dbo.Cita WHERE CitaId = @CitaId AND UsuarioId = @ParticipanteId)
    BEGIN
        SELECT 0 AS Exito, N'El usuario no pertenece a esta cita.' AS Mensaje;
        RETURN;
    END

    IF @TipoParticipante = N'Profesional'
       AND NOT EXISTS (SELECT 1 FROM dbo.Cita WHERE CitaId = @CitaId AND ProfesionalId = @ParticipanteId)
    BEGIN
        SELECT 0 AS Exito, N'El profesional no pertenece a esta cita.' AS Mensaje;
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.CitaAsistencia WHERE CitaId = @CitaId)
        INSERT INTO dbo.CitaAsistencia (CitaId) VALUES (@CitaId);

    IF @TipoParticipante = N'Usuario'
        UPDATE dbo.CitaAsistencia
        SET    UsuarioIngresoSala = COALESCE(UsuarioIngresoSala, GETDATE()),
               FechaModificacion = GETDATE()
        WHERE  CitaId = @CitaId;
    ELSE
        UPDATE dbo.CitaAsistencia
        SET    ProfesionalIngresoSala = COALESCE(ProfesionalIngresoSala, GETDATE()),
               FechaModificacion = GETDATE()
        WHERE  CitaId = @CitaId;

    SELECT 1 AS Exito, N'Ingreso a sala registrado.' AS Mensaje;
END
GO

PRINT N'Mis Saldos — tablas, estados y parámetros financieros aplicados.';
GO

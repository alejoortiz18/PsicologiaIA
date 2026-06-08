-- Ampliar CHECK constraints para devolución por inasistencia del ponente en evento en vivo
USE TrebolDB;
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_MovSaldo_TipoMovimiento')
    ALTER TABLE dbo.MovimientoSaldoUsuario DROP CONSTRAINT CK_MovSaldo_TipoMovimiento;
GO
ALTER TABLE dbo.MovimientoSaldoUsuario ADD CONSTRAINT CK_MovSaldo_TipoMovimiento
    CHECK (TipoMovimiento IN (
        N'CreditoEventoCancelado',
        N'CreditoEventoProfesionalAusente',
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

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_AjusteSaldo_Motivo')
    ALTER TABLE dbo.AjusteSaldoProfesional DROP CONSTRAINT CK_AjusteSaldo_Motivo;
GO
ALTER TABLE dbo.AjusteSaldoProfesional ADD CONSTRAINT CK_AjusteSaldo_Motivo CHECK (MotivoCodigo IN (
    N'EventoCanceladoRetiro',
    N'EventoProfesionalAusente',
    N'CitaProfesionalAusente',
    N'EventoReprogramadoRetiro'
));
GO

PRINT N'52_MovSaldoTipoEventoAusente — aplicado.';
GO

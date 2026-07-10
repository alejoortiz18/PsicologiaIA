USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

IF OBJECT_ID('PagoProfesional', 'U') IS NULL
BEGIN
    CREATE TABLE PagoProfesional (
        PagoProfesionalId INT             IDENTITY(1,1) NOT NULL,
        ProfesionalId     INT             NOT NULL,
        Monto             DECIMAL(12,2)   NOT NULL,
        FechaPago         DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        Referencia        NVARCHAR(100)   NULL,
        Notas             NVARCHAR(500)   NULL,
        Estado            NVARCHAR(20)    NOT NULL DEFAULT N'Pagado',
        FechaCreacion     DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_PagoProfesional PRIMARY KEY (PagoProfesionalId),
        CONSTRAINT FK_PagoProfesional_Profesional
            FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
        CONSTRAINT CK_PagoProfesional_Estado
            CHECK (Estado IN (N'Pagado', N'Anulado'))
    );
END
GO

PRINT N'PagoProfesional — tabla de liquidaciones al profesional creada.';
GO

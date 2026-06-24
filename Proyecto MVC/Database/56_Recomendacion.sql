-- Recomendaciones del profesional por cita (sala de usuario)
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('Recomendacion', 'U') IS NULL
BEGIN
    CREATE TABLE Recomendacion (
        RecomendacionId INT            IDENTITY(1,1) NOT NULL,
        CitaId          INT            NOT NULL,
        ProfesionalId   INT            NOT NULL,
        UsuarioId       INT            NOT NULL,
        Contenido       NVARCHAR(MAX)  NOT NULL,
        Fecha           DATETIME2(0)   NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_Recomendacion            PRIMARY KEY (RecomendacionId),
        CONSTRAINT FK_Recomendacion_Cita       FOREIGN KEY (CitaId)        REFERENCES Cita(CitaId),
        CONSTRAINT FK_Recomendacion_Profesional FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
        CONSTRAINT FK_Recomendacion_Usuario    FOREIGN KEY (UsuarioId)     REFERENCES Usuario(UsuarioId)
    );

    CREATE INDEX IX_Recomendacion_CitaId ON Recomendacion(CitaId);
END
GO

PRINT N'Tabla Recomendacion aplicada.';
GO

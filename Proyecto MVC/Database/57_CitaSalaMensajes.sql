-- Mensajes de chat y notas privadas en salas de cita privada
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('CitaMensaje', 'U') IS NULL
BEGIN
    CREATE TABLE CitaMensaje (
        CitaMensajeId  INT            IDENTITY(1,1) NOT NULL,
        CitaId         INT            NOT NULL,
        RemitenteTipo  NVARCHAR(20)   NOT NULL,
        RemitenteId    INT            NOT NULL,
        AliasRemitente NVARCHAR(100)  NOT NULL,
        Contenido      NVARCHAR(500)  NOT NULL,
        Fecha          DATETIME2(0)   NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_CitaMensaje      PRIMARY KEY (CitaMensajeId),
        CONSTRAINT FK_CitaMensaje_Cita FOREIGN KEY (CitaId) REFERENCES Cita(CitaId),
        CONSTRAINT CK_CitaMensaje_Tipo CHECK (RemitenteTipo IN ('Usuario', 'Profesional'))
    );

    CREATE INDEX IX_CitaMensaje_CitaId ON CitaMensaje(CitaId);
END
GO

IF OBJECT_ID('CitaNotaPrivada', 'U') IS NULL
BEGIN
    CREATE TABLE CitaNotaPrivada (
        CitaId            INT            NOT NULL,
        UsuarioId         INT            NOT NULL,
        Contenido         NVARCHAR(MAX)  NOT NULL,
        FechaModificacion DATETIME2(0)   NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_CitaNotaPrivada        PRIMARY KEY (CitaId),
        CONSTRAINT FK_CitaNotaPrivada_Cita    FOREIGN KEY (CitaId)    REFERENCES Cita(CitaId),
        CONSTRAINT FK_CitaNotaPrivada_Usuario FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
    );
END
GO

PRINT N'Tablas CitaMensaje y CitaNotaPrivada aplicadas.';
GO

-- ============================================================
-- TrebolDB — Script de creación de base de datos
-- Motor:    SQL Server (.\SQLEXPRESS)
-- Proyecto: Trébol — Plataforma de Salud Mental
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'TrebolDB')
BEGIN
    CREATE DATABASE TrebolDB
        COLLATE Latin1_General_CI_AI;
END
GO

USE TrebolDB;
GO

-- ============================================================
-- CATÁLOGOS
-- ============================================================

IF OBJECT_ID('Pais', 'U') IS NULL
CREATE TABLE Pais (
    PaisId   INT            IDENTITY(1,1) NOT NULL,
    Nombre   NVARCHAR(100)  NOT NULL,
    Codigo   NVARCHAR(5)    NOT NULL,
    Moneda   NVARCHAR(3)    NOT NULL,
    Estado   BIT            NOT NULL DEFAULT 1,
    CONSTRAINT PK_Pais       PRIMARY KEY (PaisId),
    CONSTRAINT UQ_Pais_Codigo UNIQUE (Codigo)
);
GO

IF OBJECT_ID('Ciudad', 'U') IS NULL
CREATE TABLE Ciudad (
    CiudadId INT           IDENTITY(1,1) NOT NULL,
    PaisId   INT           NOT NULL,
    Nombre   NVARCHAR(150) NOT NULL,
    Estado   BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_Ciudad      PRIMARY KEY (CiudadId),
    CONSTRAINT FK_Ciudad_Pais FOREIGN KEY (PaisId) REFERENCES Pais(PaisId)
);
GO

IF OBJECT_ID('Especialidad', 'U') IS NULL
CREATE TABLE Especialidad (
    EspecialidadId INT           IDENTITY(1,1) NOT NULL,
    Nombre         NVARCHAR(150) NOT NULL,
    Descripcion    NVARCHAR(500) NULL,
    Estado         BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_Especialidad PRIMARY KEY (EspecialidadId)
);
GO

IF OBJECT_ID('Categoria', 'U') IS NULL
CREATE TABLE Categoria (
    CategoriaId INT           IDENTITY(1,1) NOT NULL,
    Nombre      NVARCHAR(150) NOT NULL,
    Descripcion NVARCHAR(500) NULL,
    Estado      BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_Categoria PRIMARY KEY (CategoriaId)
);
GO

IF OBJECT_ID('Idioma', 'U') IS NULL
CREATE TABLE Idioma (
    IdiomaId INT           IDENTITY(1,1) NOT NULL,
    Nombre   NVARCHAR(100) NOT NULL,
    Codigo   NVARCHAR(10)  NOT NULL,
    CONSTRAINT PK_Idioma        PRIMARY KEY (IdiomaId),
    CONSTRAINT UQ_Idioma_Codigo UNIQUE (Codigo)
);
GO

-- ============================================================
-- USUARIOS Y AUTENTICACIÓN
-- ============================================================

IF OBJECT_ID('Usuario', 'U') IS NULL
CREATE TABLE Usuario (
    UsuarioId         INT             IDENTITY(1,1) NOT NULL,
    NombreCompleto    NVARCHAR(200)   NOT NULL,
    Correo            NVARCHAR(254)   NOT NULL,
    NumeroDocumento   NVARCHAR(30)    NOT NULL,
    Alias             NVARCHAR(100)   NOT NULL,
    Celular           NVARCHAR(20)    NULL,
    FechaNacimiento   DATE            NULL,
    CiudadId          INT             NULL,
    FotoPerfil        NVARCHAR(500)   NULL,
    PasswordHash      NVARCHAR(500)   NULL,
    Estado            NVARCHAR(20)    NOT NULL DEFAULT 'PENDIENTE',
    FechaCreacion     DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Usuario           PRIMARY KEY (UsuarioId),
    CONSTRAINT UQ_Usuario_Correo    UNIQUE (Correo),
    CONSTRAINT UQ_Usuario_Documento UNIQUE (NumeroDocumento),
    CONSTRAINT FK_Usuario_Ciudad    FOREIGN KEY (CiudadId) REFERENCES Ciudad(CiudadId),
    CONSTRAINT CK_Usuario_Estado    CHECK (Estado IN ('PENDIENTE', 'ACTIVO', 'BLOQUEADO'))
);
GO

IF OBJECT_ID('Profesional', 'U') IS NULL
CREATE TABLE Profesional (
    ProfesionalId              INT             IDENTITY(1,1) NOT NULL,
    NombreCompleto             NVARCHAR(200)   NOT NULL,
    Correo                     NVARCHAR(254)   NOT NULL,
    NumeroDocumento            NVARCHAR(30)    NOT NULL,
    Alias                      NVARCHAR(100)   NOT NULL,
    Celular                    NVARCHAR(20)    NULL,
    NumerTarjetaProfesional    NVARCHAR(50)    NOT NULL,
    UrlDocumentoIdentidad      NVARCHAR(500)   NULL,
    UrlTarjetaProfesional      NVARCHAR(500)   NULL,
    PasswordHash               NVARCHAR(500)   NULL,
    PaisId                     INT             NULL,
    CiudadId                   INT             NULL,
    Ocupacion                  NVARCHAR(200)   NULL,
    SobreMi                    NVARCHAR(MAX)   NULL,
    AnosExperiencia            TINYINT         NULL,
    FotoPerfil                 NVARCHAR(500)   NULL,
    ValorPorHora               DECIMAL(10,2)   NULL,
    Estado                     NVARCHAR(30)    NOT NULL DEFAULT 'PENDIENTE_VALIDACION',
    MotivoRechazo              NVARCHAR(500)   NULL,
    FechaCreacion              DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion          DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Profesional                     PRIMARY KEY (ProfesionalId),
    CONSTRAINT UQ_Profesional_Correo              UNIQUE (Correo),
    CONSTRAINT UQ_Profesional_Documento           UNIQUE (NumeroDocumento),
    CONSTRAINT UQ_Profesional_Tarjeta             UNIQUE (NumerTarjetaProfesional),
    CONSTRAINT FK_Profesional_Pais                FOREIGN KEY (PaisId)    REFERENCES Pais(PaisId),
    CONSTRAINT FK_Profesional_Ciudad              FOREIGN KEY (CiudadId)  REFERENCES Ciudad(CiudadId),
    CONSTRAINT CK_Profesional_Estado              CHECK (Estado IN ('PENDIENTE_VALIDACION','ACTIVO','RECHAZADO','BLOQUEADO'))
);
GO

IF OBJECT_ID('ProfesionalEspecialidad', 'U') IS NULL
CREATE TABLE ProfesionalEspecialidad (
    ProfesionalId  INT NOT NULL,
    EspecialidadId INT NOT NULL,
    CONSTRAINT PK_ProfesionalEspecialidad    PRIMARY KEY (ProfesionalId, EspecialidadId),
    CONSTRAINT FK_ProfEsp_Profesional        FOREIGN KEY (ProfesionalId)  REFERENCES Profesional(ProfesionalId),
    CONSTRAINT FK_ProfEsp_Especialidad       FOREIGN KEY (EspecialidadId) REFERENCES Especialidad(EspecialidadId)
);
GO

IF OBJECT_ID('ProfesionalIdioma', 'U') IS NULL
CREATE TABLE ProfesionalIdioma (
    ProfesionalId INT NOT NULL,
    IdiomaId      INT NOT NULL,
    CONSTRAINT PK_ProfesionalIdioma  PRIMARY KEY (ProfesionalId, IdiomaId),
    CONSTRAINT FK_ProfIdioma_Prof    FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT FK_ProfIdioma_Idioma  FOREIGN KEY (IdiomaId)      REFERENCES Idioma(IdiomaId)
);
GO

IF OBJECT_ID('ProfesionalEstudio', 'U') IS NULL
CREATE TABLE ProfesionalEstudio (
    EstudioId     INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId INT             NOT NULL,
    Titulo        NVARCHAR(300)   NOT NULL,
    Descripcion   NVARCHAR(500)   NULL,
    Universidad   NVARCHAR(300)   NOT NULL,
    AnoEgreso     SMALLINT        NULL,
    Nivel         NVARCHAR(20)    NOT NULL DEFAULT 'Pregrado',
    FechaCreacion DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_ProfesionalEstudio     PRIMARY KEY (EstudioId),
    CONSTRAINT FK_ProfEstudio_Prof       FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT CK_ProfEstudio_Nivel      CHECK (Nivel IN ('Pregrado','Posgrado'))
);
GO

IF OBJECT_ID('Administrador', 'U') IS NULL
CREATE TABLE Administrador (
    AdministradorId   INT             IDENTITY(1,1) NOT NULL,
    NombreCompleto    NVARCHAR(200)   NOT NULL,
    Correo            NVARCHAR(254)   NOT NULL,
    PasswordHash      NVARCHAR(500)   NOT NULL,
    Estado            BIT             NOT NULL DEFAULT 1,
    FechaCreacion     DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Administrador        PRIMARY KEY (AdministradorId),
    CONSTRAINT UQ_Administrador_Correo UNIQUE (Correo)
);
GO

-- ============================================================
-- TOKENS
-- ============================================================

IF OBJECT_ID('TokenValidacion', 'U') IS NULL
CREATE TABLE TokenValidacion (
    TokenId         INT             IDENTITY(1,1) NOT NULL,
    UsuarioId       INT             NOT NULL,
    Token           NVARCHAR(500)   NOT NULL,
    FechaExpiracion DATETIME2(0)    NOT NULL,
    Usado           BIT             NOT NULL DEFAULT 0,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_TokenValidacion       PRIMARY KEY (TokenId),
    CONSTRAINT UQ_TokenValidacion_Token UNIQUE (Token),
    CONSTRAINT FK_TokenVal_Usuario      FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);
GO

IF OBJECT_ID('TokenActivacion', 'U') IS NULL
CREATE TABLE TokenActivacion (
    TokenId         INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId   INT             NOT NULL,
    Token           NVARCHAR(500)   NOT NULL,
    FechaExpiracion DATETIME2(0)    NOT NULL,
    Usado           BIT             NOT NULL DEFAULT 0,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_TokenActivacion       PRIMARY KEY (TokenId),
    CONSTRAINT UQ_TokenActivacion_Token UNIQUE (Token),
    CONSTRAINT FK_TokenAct_Prof         FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId)
);
GO

IF OBJECT_ID('TokenRecuperacion', 'U') IS NULL
CREATE TABLE TokenRecuperacion (
    TokenId         INT             IDENTITY(1,1) NOT NULL,
    EntidadId       INT             NOT NULL,
    TipoEntidad     NVARCHAR(15)    NOT NULL,
    Token           NVARCHAR(500)   NOT NULL,
    FechaExpiracion DATETIME2(0)    NOT NULL,
    Usado           BIT             NOT NULL DEFAULT 0,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_TokenRecuperacion       PRIMARY KEY (TokenId),
    CONSTRAINT UQ_TokenRecuperacion_Token UNIQUE (Token),
    CONSTRAINT CK_TokenRec_Tipo           CHECK (TipoEntidad IN ('Usuario','Profesional','Admin'))
);
GO

-- ============================================================
-- DISPONIBILIDAD
-- ============================================================

IF OBJECT_ID('HorarioDisponible', 'U') IS NULL
CREATE TABLE HorarioDisponible (
    HorarioId     INT      IDENTITY(1,1) NOT NULL,
    ProfesionalId INT      NOT NULL,
    DiaSemana     TINYINT  NOT NULL,
    HoraInicio    TIME(0)  NOT NULL,
    HoraFin       TIME(0)  NOT NULL,
    Estado        BIT      NOT NULL DEFAULT 1,
    CONSTRAINT PK_HorarioDisponible    PRIMARY KEY (HorarioId),
    CONSTRAINT FK_Horario_Profesional  FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT CK_Horario_Dia          CHECK (DiaSemana BETWEEN 1 AND 7)
);
GO

IF OBJECT_ID('HorarioBloqueado', 'U') IS NULL
CREATE TABLE HorarioBloqueado (
    BloqueoId         INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId     INT             NOT NULL,
    FechaHoraInicio   DATETIME2(0)    NOT NULL,
    FechaHoraFin      DATETIME2(0)    NOT NULL,
    Motivo            NVARCHAR(300)   NULL,
    FechaCreacion     DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_HorarioBloqueado    PRIMARY KEY (BloqueoId),
    CONSTRAINT FK_Bloqueo_Profesional FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId)
);
GO

IF OBJECT_ID('CuentaBancaria', 'U') IS NULL
CREATE TABLE CuentaBancaria (
    CuentaId      INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId INT             NOT NULL,
    Banco         NVARCHAR(200)   NOT NULL,
    TipoCuenta    NVARCHAR(30)    NOT NULL,
    NumeroCuenta  NVARCHAR(50)    NOT NULL,
    Titular       NVARCHAR(200)   NOT NULL,
    Estado        BIT             NOT NULL DEFAULT 1,
    FechaCreacion DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_CuentaBancaria     PRIMARY KEY (CuentaId),
    CONSTRAINT FK_Cuenta_Profesional FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId)
);
GO

-- ============================================================
-- SALAS Y EVENTOS
-- ============================================================

IF OBJECT_ID('Sala', 'U') IS NULL
CREATE TABLE Sala (
    SalaId            INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId     INT             NOT NULL,
    CategoriaId       INT             NULL,
    Nombre            NVARCHAR(300)   NOT NULL,
    Descripcion       NVARCHAR(MAX)   NULL,
    Tipo              NVARCHAR(10)    NOT NULL DEFAULT 'Publica',
    CupoMaximo        INT             NOT NULL,
    Precio            DECIMAL(10,2)   NOT NULL DEFAULT 0,
    ChatHabilitado    BIT             NOT NULL DEFAULT 1,
    Estado            NVARCHAR(10)    NOT NULL DEFAULT 'Abierta',
    FechaCreacion     DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Sala              PRIMARY KEY (SalaId),
    CONSTRAINT FK_Sala_Profesional  FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT FK_Sala_Categoria    FOREIGN KEY (CategoriaId)   REFERENCES Categoria(CategoriaId),
    CONSTRAINT CK_Sala_Tipo         CHECK (Tipo   IN ('Publica','Privada')),
    CONSTRAINT CK_Sala_Estado       CHECK (Estado IN ('Abierta','Cerrada')),
    CONSTRAINT CK_Sala_Cupo         CHECK (CupoMaximo > 0),
    CONSTRAINT CK_Sala_Precio       CHECK (Precio >= 0)
);
GO

IF OBJECT_ID('Evento', 'U') IS NULL
CREATE TABLE Evento (
    EventoId      INT             IDENTITY(1,1) NOT NULL,
    SalaId        INT             NOT NULL,
    Nombre        NVARCHAR(300)   NOT NULL,
    Descripcion   NVARCHAR(MAX)   NULL,
    FechaInicio   DATETIME2(0)    NOT NULL,
    FechaFin      DATETIME2(0)    NOT NULL,
    Estado        NVARCHAR(10)    NOT NULL DEFAULT 'Abierto',
    FechaCreacion DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Evento        PRIMARY KEY (EventoId),
    CONSTRAINT FK_Evento_Sala   FOREIGN KEY (SalaId) REFERENCES Sala(SalaId),
    CONSTRAINT CK_Evento_Estado CHECK (Estado IN ('Abierto','Cerrado','Cancelado')),
    CONSTRAINT CK_Evento_Fechas CHECK (FechaFin > FechaInicio)
);
GO

IF OBJECT_ID('MensajeEvento', 'U') IS NULL
CREATE TABLE MensajeEvento (
    MensajeId         INT             IDENTITY(1,1) NOT NULL,
    EventoId          INT             NOT NULL,
    AutorId           INT             NOT NULL,
    TipoAutor         NVARCHAR(15)    NOT NULL,
    Texto             NVARCHAR(MAX)   NOT NULL,
    Estado            BIT             NOT NULL DEFAULT 1,
    FechaCreacion     DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_MensajeEvento     PRIMARY KEY (MensajeId),
    CONSTRAINT FK_MsgEvt_Evento     FOREIGN KEY (EventoId) REFERENCES Evento(EventoId),
    CONSTRAINT CK_MsgEvt_TipoAutor  CHECK (TipoAutor IN ('Usuario','Profesional'))
);
GO

-- ============================================================
-- CITAS PRIVADAS
-- ============================================================

IF OBJECT_ID('Cita', 'U') IS NULL
CREATE TABLE Cita (
    CitaId            INT             IDENTITY(1,1) NOT NULL,
    UsuarioId         INT             NOT NULL,
    ProfesionalId     INT             NOT NULL,
    FechaHora         DATETIME2(0)    NOT NULL,
    FechaHoraFin      DATETIME2(0)    NOT NULL,
    Tipo              NVARCHAR(15)    NOT NULL DEFAULT 'Asesoria',
    Estado            NVARCHAR(15)    NOT NULL DEFAULT 'Programada',
    MostrarAlias      BIT             NOT NULL DEFAULT 0,
    FechaCreacion     DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Cita              PRIMARY KEY (CitaId),
    CONSTRAINT FK_Cita_Usuario      FOREIGN KEY (UsuarioId)     REFERENCES Usuario(UsuarioId),
    CONSTRAINT FK_Cita_Profesional  FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT CK_Cita_Tipo         CHECK (Tipo   IN ('Seguimiento','Asesoria')),
    CONSTRAINT CK_Cita_Estado       CHECK (Estado IN ('Programada','Cancelada','Movida','Finalizada')),
    CONSTRAINT CK_Cita_Fechas       CHECK (FechaHoraFin > FechaHora)
);
GO

-- ============================================================
-- INSCRIPCIONES Y PAGOS
-- ============================================================

IF OBJECT_ID('Inscripcion', 'U') IS NULL
CREATE TABLE Inscripcion (
    InscripcionId       INT             IDENTITY(1,1) NOT NULL,
    UsuarioId           INT             NOT NULL,
    SalaId              INT             NOT NULL,
    Estado              NVARCHAR(25)    NOT NULL DEFAULT 'PendientePago',
    CodigoInscripcion   NVARCHAR(50)    NULL,
    FechaInscripcion    DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Inscripcion          PRIMARY KEY (InscripcionId),
    CONSTRAINT UQ_Inscripcion_Codigo   UNIQUE (CodigoInscripcion),
    CONSTRAINT UQ_Inscripcion_Relacion UNIQUE (UsuarioId, SalaId),
    CONSTRAINT FK_Inscripcion_Usuario  FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    CONSTRAINT FK_Inscripcion_Sala     FOREIGN KEY (SalaId)    REFERENCES Sala(SalaId),
    CONSTRAINT CK_Inscripcion_Estado   CHECK (Estado IN (
        'PendientePago','PagoAprobado','PagoRechazado','Confirmada','SinCupos','Cancelada'
    ))
);
GO

IF OBJECT_ID('PagoCita', 'U') IS NULL
CREATE TABLE PagoCita (
    PagoCitaId          INT             IDENTITY(1,1) NOT NULL,
    CitaId              INT             NOT NULL,
    UsuarioId           INT             NOT NULL,
    Monto               DECIMAL(10,2)   NOT NULL,
    TarifaPlataforma    DECIMAL(10,2)   NOT NULL DEFAULT 5000,
    MetodoPago          NVARCHAR(25)    NOT NULL,
    Estado              NVARCHAR(15)    NOT NULL DEFAULT 'Pendiente',
    ReferenciaPassarela NVARCHAR(200)   NULL,
    FechaPago           DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_PagoCita             PRIMARY KEY (PagoCitaId),
    CONSTRAINT FK_PagoCita_Cita        FOREIGN KEY (CitaId)    REFERENCES Cita(CitaId),
    CONSTRAINT FK_PagoCita_Usuario     FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    CONSTRAINT CK_PagoCita_MetodoPago  CHECK (MetodoPago IN ('TarjetaCredito','TarjetaDebito','PSE','Efecty','Nequi')),
    CONSTRAINT CK_PagoCita_Estado      CHECK (Estado IN ('Pendiente','Aprobado','Rechazado')),
    CONSTRAINT CK_PagoCita_Monto       CHECK (Monto > 0)
);
GO

IF OBJECT_ID('PagoInscripcion', 'U') IS NULL
CREATE TABLE PagoInscripcion (
    PagoId              INT             IDENTITY(1,1) NOT NULL,
    InscripcionId       INT             NOT NULL,
    Monto               DECIMAL(10,2)   NOT NULL,
    MetodoPago          NVARCHAR(25)    NOT NULL,
    Estado              NVARCHAR(15)    NOT NULL DEFAULT 'Pendiente',
    ReferenciaPassarela NVARCHAR(200)   NULL,
    FechaPago           DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_PagoInscripcion           PRIMARY KEY (PagoId),
    CONSTRAINT FK_PagoInsc_Inscripcion      FOREIGN KEY (InscripcionId) REFERENCES Inscripcion(InscripcionId),
    CONSTRAINT CK_PagoInsc_MetodoPago       CHECK (MetodoPago IN ('TarjetaCredito','TarjetaDebito','PSE','Efecty','Nequi')),
    CONSTRAINT CK_PagoInsc_Estado           CHECK (Estado IN ('Pendiente','Aprobado','Rechazado')),
    CONSTRAINT CK_PagoInsc_Monto            CHECK (Monto > 0)
);
GO

-- ============================================================
-- INTERACCIÓN SOCIAL
-- ============================================================

IF OBJECT_ID('Seguidor', 'U') IS NULL
CREATE TABLE Seguidor (
    SeguidorId    INT          IDENTITY(1,1) NOT NULL,
    UsuarioId     INT          NOT NULL,
    ProfesionalId INT          NOT NULL,
    FechaCreacion DATETIME2(0) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Seguidor              PRIMARY KEY (SeguidorId),
    CONSTRAINT UQ_Seguidor_Relacion     UNIQUE (UsuarioId, ProfesionalId),
    CONSTRAINT FK_Seguidor_Usuario      FOREIGN KEY (UsuarioId)     REFERENCES Usuario(UsuarioId),
    CONSTRAINT FK_Seguidor_Profesional  FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId)
);
GO

IF OBJECT_ID('Conversacion', 'U') IS NULL
CREATE TABLE Conversacion (
    ConversacionId INT          IDENTITY(1,1) NOT NULL,
    UsuarioId      INT          NOT NULL,
    ProfesionalId  INT          NOT NULL,
    FechaCreacion  DATETIME2(0) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Conversacion          PRIMARY KEY (ConversacionId),
    CONSTRAINT UQ_Conversacion_Relacion UNIQUE (UsuarioId, ProfesionalId),
    CONSTRAINT FK_Conv_Usuario          FOREIGN KEY (UsuarioId)     REFERENCES Usuario(UsuarioId),
    CONSTRAINT FK_Conv_Profesional      FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId)
);
GO

IF OBJECT_ID('MensajePrivado', 'U') IS NULL
CREATE TABLE MensajePrivado (
    MensajePrivadoId INT             IDENTITY(1,1) NOT NULL,
    ConversacionId   INT             NOT NULL,
    AutorId          INT             NOT NULL,
    TipoAutor        NVARCHAR(15)    NOT NULL,
    Texto            NVARCHAR(MAX)   NOT NULL,
    Leido            BIT             NOT NULL DEFAULT 0,
    FechaCreacion    DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_MensajePrivado        PRIMARY KEY (MensajePrivadoId),
    CONSTRAINT FK_MsgPriv_Conversacion  FOREIGN KEY (ConversacionId) REFERENCES Conversacion(ConversacionId),
    CONSTRAINT CK_MsgPriv_TipoAutor     CHECK (TipoAutor IN ('Usuario','Profesional'))
);
GO

IF OBJECT_ID('ColaboracionProfesional', 'U') IS NULL
CREATE TABLE ColaboracionProfesional (
    ColaboracionId    INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId1    INT             NOT NULL,
    ProfesionalId2    INT             NOT NULL,
    Estado            NVARCHAR(20)    NOT NULL DEFAULT 'Pendiente',
    FechaCreacion     DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_ColaboracionProfesional     PRIMARY KEY (ColaboracionId),
    CONSTRAINT UQ_Colaboracion_Relacion       UNIQUE (ProfesionalId1, ProfesionalId2),
    CONSTRAINT FK_Colab_Prof1                 FOREIGN KEY (ProfesionalId1) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT FK_Colab_Prof2                 FOREIGN KEY (ProfesionalId2) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT CK_Colab_Estado                CHECK (Estado IN ('Activa','Pendiente','Inactiva')),
    CONSTRAINT CK_Colab_DiferenteProf         CHECK (ProfesionalId1 <> ProfesionalId2)
);
GO

IF OBJECT_ID('ComentarioProfesional', 'U') IS NULL
CREATE TABLE ComentarioProfesional (
    ComentarioId      INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId     INT             NOT NULL,
    UsuarioId         INT             NOT NULL,
    Texto             NVARCHAR(MAX)   NOT NULL,
    Puntuacion        TINYINT         NULL,
    Estado            BIT             NOT NULL DEFAULT 1,
    FechaCreacion     DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_ComentarioProfesional  PRIMARY KEY (ComentarioId),
    CONSTRAINT FK_ComentProf_Prof        FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT FK_ComentProf_Usuario     FOREIGN KEY (UsuarioId)     REFERENCES Usuario(UsuarioId),
    CONSTRAINT CK_ComentProf_Puntuacion  CHECK (Puntuacion IS NULL OR Puntuacion BETWEEN 1 AND 5)
);
GO

IF OBJECT_ID('Notificacion', 'U') IS NULL
CREATE TABLE Notificacion (
    NotificacionId    INT             IDENTITY(1,1) NOT NULL,
    Tipo              NVARCHAR(30)    NOT NULL,
    EntidadId         INT             NULL,
    Titulo            NVARCHAR(300)   NOT NULL,
    Descripcion       NVARCHAR(MAX)   NULL,
    Estado            NVARCHAR(15)    NOT NULL DEFAULT 'Pendiente',
    Leida             BIT             NOT NULL DEFAULT 0,
    FechaCreacion     DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Notificacion  PRIMARY KEY (NotificacionId),
    CONSTRAINT CK_Notif_Tipo    CHECK (Tipo IN ('RegistroProfesional','Sistema')),
    CONSTRAINT CK_Notif_Estado  CHECK (Estado IN ('Pendiente','Aprobada','Rechazada','Leida'))
);
GO

-- ============================================================
-- SESIONES Y CONFIGURACIÓN
-- ============================================================

IF OBJECT_ID('Sesion', 'U') IS NULL
CREATE TABLE Sesion (
    SesionId        INT             IDENTITY(1,1) NOT NULL,
    EntidadId       INT             NOT NULL,
    TipoEntidad     NVARCHAR(15)    NOT NULL,
    Token           NVARCHAR(500)   NOT NULL,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaExpiracion DATETIME2(0)    NOT NULL,
    Estado          NVARCHAR(10)    NOT NULL DEFAULT 'Activa',
    CONSTRAINT PK_Sesion        PRIMARY KEY (SesionId),
    CONSTRAINT UQ_Sesion_Token  UNIQUE (Token),
    CONSTRAINT CK_Sesion_Tipo   CHECK (TipoEntidad IN ('Usuario','Profesional','Admin')),
    CONSTRAINT CK_Sesion_Estado CHECK (Estado IN ('Activa','Expirada','Cerrada'))
);
GO

IF OBJECT_ID('Configuracion', 'U') IS NULL
CREATE TABLE Configuracion (
    ConfigId          INT             IDENTITY(1,1) NOT NULL,
    Clave             NVARCHAR(100)   NOT NULL,
    Valor             NVARCHAR(MAX)   NOT NULL,
    Descripcion       NVARCHAR(500)   NULL,
    FechaModificacion DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Configuracion  PRIMARY KEY (ConfigId),
    CONSTRAINT UQ_Config_Clave   UNIQUE (Clave)
);
GO

-- ============================================================
-- ÍNDICES
-- ============================================================

SET QUOTED_IDENTIFIER ON;
GO

CREATE INDEX IX_Cita_UsuarioId         ON Cita(UsuarioId);
CREATE INDEX IX_Cita_ProfesionalId     ON Cita(ProfesionalId);
CREATE INDEX IX_Cita_FechaHora         ON Cita(FechaHora);
CREATE INDEX IX_MensajePrivado_Conv    ON MensajePrivado(ConversacionId);
CREATE INDEX IX_Notificacion_Leida     ON Notificacion(Leida) WHERE Leida = 0;
CREATE INDEX IX_Sala_ProfesionalId     ON Sala(ProfesionalId);
CREATE INDEX IX_Sala_Estado            ON Sala(Estado);
CREATE INDEX IX_Inscripcion_UsuarioId  ON Inscripcion(UsuarioId);
CREATE INDEX IX_TokenVal_UsuarioId     ON TokenValidacion(UsuarioId, Usado);
CREATE INDEX IX_TokenRec_Token         ON TokenRecuperacion(Token, Usado);
GO

PRINT 'TrebolDB — Tablas creadas correctamente.';
GO

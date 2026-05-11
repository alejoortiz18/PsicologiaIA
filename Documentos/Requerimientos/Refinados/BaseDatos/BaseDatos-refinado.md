# Base de Datos — Proyecto Trébol

> **Versión:** 1.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Motor:** SQL Server | **ORM:** Entity Framework Core | **Tecnología:** .NET Core 10
> **Convenciones:** PascalCase para tablas y columnas | NVARCHAR para texto | DATETIME2 para fechas

---

## Índice

1. [Convenciones](#1-convenciones)
2. [Catálogos](#2-catálogos)
3. [Usuarios y Autenticación](#3-usuarios-y-autenticación)
4. [Profesionales](#4-profesionales)
5. [Salas y Eventos](#5-salas-y-eventos)
6. [Citas Privadas](#6-citas-privadas)
7. [Inscripciones y Pagos](#7-inscripciones-y-pagos)
8. [Interacción Social](#8-interacción-social)
9. [Sesiones y Seguridad](#9-sesiones-y-seguridad)
10. [Configuración del Sistema](#10-configuración-del-sistema)
11. [Índices](#11-índices)
12. [Vistas](#12-vistas)
13. [Stored Procedures](#13-stored-procedures)

---

## 1. Convenciones

| Elemento | Convención |
|---|---|
| Nombres de tablas | PascalCase singular (ej: `Usuario`, `Profesional`) |
| Nombres de columnas | PascalCase (ej: `NombreCompleto`, `FechaCreacion`) |
| Claves primarias | `[Tabla]Id` IDENTITY(1,1) |
| Claves foráneas | `[TablaReferenciada]Id` |
| Fechas | `DATETIME2(0)` — sin fracciones de segundo |
| Texto corto | `NVARCHAR(n)` |
| Texto largo | `NVARCHAR(MAX)` |
| Booleanos | `BIT NOT NULL DEFAULT 0` |
| Estado | `NVARCHAR(30) NOT NULL` con CHECK constraint |
| Auditoría | `FechaCreacion` y `FechaModificacion` en todas las tablas |
| **Contraseñas** | **Campo único `PasswordHash NVARCHAR(500)`. Hash generado con Argon2 (salt embebido). Nunca texto plano. Operación exclusiva de la Capa Helpers (`PasswordHelper`).** |
| Stored Procedures | `sp_[Accion][Entidad]` (ej: `sp_RegistrarUsuario`) |
| Vistas | `vw_[Descripcion]` (ej: `vw_SalasActivas`) |

---

## 2. Catálogos

### 2.1 Pais

```sql
CREATE TABLE Pais (
    PaisId      INT            IDENTITY(1,1) NOT NULL,
    Nombre      NVARCHAR(100)  NOT NULL,
    Codigo      NVARCHAR(5)    NOT NULL,
    Estado      BIT            NOT NULL DEFAULT 1,

    CONSTRAINT PK_Pais PRIMARY KEY (PaisId),
    CONSTRAINT UQ_Pais_Codigo UNIQUE (Codigo)
);
```

### 2.2 Ciudad

```sql
CREATE TABLE Ciudad (
    CiudadId    INT            IDENTITY(1,1) NOT NULL,
    PaisId      INT            NOT NULL,
    Nombre      NVARCHAR(150)  NOT NULL,
    Estado      BIT            NOT NULL DEFAULT 1,

    CONSTRAINT PK_Ciudad      PRIMARY KEY (CiudadId),
    CONSTRAINT FK_Ciudad_Pais FOREIGN KEY (PaisId) REFERENCES Pais(PaisId)
);
```

### 2.3 Especialidad

```sql
CREATE TABLE Especialidad (
    EspecialidadId  INT            IDENTITY(1,1) NOT NULL,
    Nombre          NVARCHAR(150)  NOT NULL,
    Descripcion     NVARCHAR(500)  NULL,
    Estado          BIT            NOT NULL DEFAULT 1,

    CONSTRAINT PK_Especialidad PRIMARY KEY (EspecialidadId)
);
```

### 2.4 Categoria

```sql
CREATE TABLE Categoria (
    CategoriaId INT            IDENTITY(1,1) NOT NULL,
    Nombre      NVARCHAR(150)  NOT NULL,
    Descripcion NVARCHAR(500)  NULL,
    Estado      BIT            NOT NULL DEFAULT 1,

    CONSTRAINT PK_Categoria PRIMARY KEY (CategoriaId)
);
```

### 2.5 Idioma

```sql
CREATE TABLE Idioma (
    IdiomaId    INT            IDENTITY(1,1) NOT NULL,
    Nombre      NVARCHAR(100)  NOT NULL,
    Codigo      NVARCHAR(10)   NOT NULL,

    CONSTRAINT PK_Idioma       PRIMARY KEY (IdiomaId),
    CONSTRAINT UQ_Idioma_Codigo UNIQUE (Codigo)
);
```

---

## 3. Usuarios y Autenticación

### 3.1 Usuario

```sql
CREATE TABLE Usuario (
    UsuarioId           INT             IDENTITY(1,1) NOT NULL,
    NombreCompleto      NVARCHAR(200)   NOT NULL,
    Correo              NVARCHAR(254)   NOT NULL,
    NumeroDocumento     NVARCHAR(30)    NOT NULL,
    Alias               NVARCHAR(100)   NOT NULL,
    Celular             NVARCHAR(20)    NULL,
    FotoPerfil          NVARCHAR(500)   NULL,
    PasswordHash        NVARCHAR(500)   NULL,         -- Hash Argon2 con salt embebido. Generado en Capa Helpers. NULL hasta que activa la cuenta
    Estado              NVARCHAR(20)    NOT NULL DEFAULT 'PENDIENTE',
    FechaCreacion       DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Usuario              PRIMARY KEY (UsuarioId),
    CONSTRAINT UQ_Usuario_Correo       UNIQUE (Correo),
    CONSTRAINT UQ_Usuario_Documento    UNIQUE (NumeroDocumento),
    CONSTRAINT CK_Usuario_Estado       CHECK (Estado IN ('PENDIENTE', 'ACTIVO', 'BLOQUEADO'))
);
```

### 3.2 Profesional

```sql
CREATE TABLE Profesional (
    ProfesionalId               INT             IDENTITY(1,1) NOT NULL,
    NombreCompleto              NVARCHAR(200)   NOT NULL,
    Correo                      NVARCHAR(254)   NOT NULL,
    NumeroDocumento             NVARCHAR(30)    NOT NULL,
    Alias                       NVARCHAR(100)   NOT NULL,
    Celular                     NVARCHAR(20)    NULL,
    NumerTarjetaProfesional     NVARCHAR(50)    NOT NULL,
    UrlDocumentoIdentidad       NVARCHAR(500)   NULL,
    UrlTarjetaProfesional       NVARCHAR(500)   NULL,
    PasswordHash                NVARCHAR(500)   NULL,
    -- Hash Argon2 con salt embebido. Generado en Capa Helpers. NULL hasta activación.
    PaisId                      INT             NULL,
    CiudadId                    INT             NULL,
    Ocupacion                   NVARCHAR(200)   NULL,
    Genero                      NVARCHAR(20)    NULL,
    FechaNacimiento             DATE            NULL,
    SobreMi                     NVARCHAR(MAX)   NULL,
    ComoTrabajo                 NVARCHAR(MAX)   NULL,
    AnosExperiencia             TINYINT         NULL,
    FotoPerfil                  NVARCHAR(500)   NULL,
    ValorPorHora                DECIMAL(10,2)   NULL,
    Estado                      NVARCHAR(30)    NOT NULL DEFAULT 'PENDIENTE_VALIDACION',
    MotivoRechazo               NVARCHAR(500)   NULL,
    FechaCreacion               DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion           DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Profesional                        PRIMARY KEY (ProfesionalId),
    CONSTRAINT UQ_Profesional_Correo                 UNIQUE (Correo),
    CONSTRAINT UQ_Profesional_Documento              UNIQUE (NumeroDocumento),
    CONSTRAINT UQ_Profesional_TarjetaProfesional     UNIQUE (NumerTarjetaProfesional),
    CONSTRAINT FK_Profesional_Pais                   FOREIGN KEY (PaisId)    REFERENCES Pais(PaisId),
    CONSTRAINT FK_Profesional_Ciudad                 FOREIGN KEY (CiudadId)  REFERENCES Ciudad(CiudadId),
    CONSTRAINT CK_Profesional_Estado                 CHECK (Estado IN (
        'PENDIENTE_VALIDACION', 'ACTIVO', 'RECHAZADO', 'BLOQUEADO'
    ))
);
```

### 3.3 ProfesionalEspecialidad

```sql
CREATE TABLE ProfesionalEspecialidad (
    ProfesionalId   INT NOT NULL,
    EspecialidadId  INT NOT NULL,

    CONSTRAINT PK_ProfesionalEspecialidad
        PRIMARY KEY (ProfesionalId, EspecialidadId),
    CONSTRAINT FK_ProfEsp_Profesional
        FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT FK_ProfEsp_Especialidad
        FOREIGN KEY (EspecialidadId) REFERENCES Especialidad(EspecialidadId)
);
```

### 3.4 ProfesionalEstudio

```sql
CREATE TABLE ProfesionalEstudio (
    EstudioId       INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId   INT             NOT NULL,
    Titulo          NVARCHAR(300)   NOT NULL,
    Descripcion     NVARCHAR(500)   NULL,
    Universidad     NVARCHAR(300)   NOT NULL,
    AnoEgreso       SMALLINT        NULL,
    Nivel           NVARCHAR(20)    NOT NULL,       -- 'Pregrado', 'Posgrado'
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_ProfesionalEstudio     PRIMARY KEY (EstudioId),
    CONSTRAINT FK_ProfEstudio_Profesional FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT CK_ProfEstudio_Nivel      CHECK (Nivel IN ('Pregrado', 'Posgrado'))
);
```

### 3.5 ProfesionalIdioma

```sql
CREATE TABLE ProfesionalIdioma (
    ProfesionalId   INT NOT NULL,
    IdiomaId        INT NOT NULL,

    CONSTRAINT PK_ProfesionalIdioma
        PRIMARY KEY (ProfesionalId, IdiomaId),
    CONSTRAINT FK_ProfIdioma_Profesional
        FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT FK_ProfIdioma_Idioma
        FOREIGN KEY (IdiomaId) REFERENCES Idioma(IdiomaId)
);
```

### 3.6 TokenValidacion

> Tokens para activar la cuenta del Usuario (vigencia: 1 hora).

```sql
CREATE TABLE TokenValidacion (
    TokenId         INT             IDENTITY(1,1) NOT NULL,
    UsuarioId       INT             NOT NULL,
    Token           NVARCHAR(500)   NOT NULL,
    FechaExpiracion DATETIME2(0)    NOT NULL,
    Usado           BIT             NOT NULL DEFAULT 0,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_TokenValidacion      PRIMARY KEY (TokenId),
    CONSTRAINT UQ_TokenValidacion_Token UNIQUE (Token),
    CONSTRAINT FK_TokenValidacion_Usuario FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);
```

### 3.7 TokenActivacion

> Tokens para activar la cuenta del Profesional tras aprobación (vigencia: 1 día).

```sql
CREATE TABLE TokenActivacion (
    TokenId         INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId   INT             NOT NULL,
    Token           NVARCHAR(500)   NOT NULL,
    FechaExpiracion DATETIME2(0)    NOT NULL,
    Usado           BIT             NOT NULL DEFAULT 0,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_TokenActivacion       PRIMARY KEY (TokenId),
    CONSTRAINT UQ_TokenActivacion_Token UNIQUE (Token),
    CONSTRAINT FK_TokenActivacion_Prof  FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId)
);
```

### 3.8 TokenRecuperacion

> Tokens de recuperación de contraseña para Usuarios y Profesionales (vigencia: 1 hora).

```sql
CREATE TABLE TokenRecuperacion (
    TokenId         INT             IDENTITY(1,1) NOT NULL,
    EntidadId       INT             NOT NULL,
    TipoEntidad     NVARCHAR(15)    NOT NULL,       -- 'Usuario', 'Profesional'
    Token           NVARCHAR(500)   NOT NULL,
    FechaExpiracion DATETIME2(0)    NOT NULL,
    Usado           BIT             NOT NULL DEFAULT 0,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_TokenRecuperacion       PRIMARY KEY (TokenId),
    CONSTRAINT UQ_TokenRecuperacion_Token UNIQUE (Token),
    CONSTRAINT CK_TokenRecuperacion_Tipo  CHECK (TipoEntidad IN ('Usuario', 'Profesional'))
);
```

---

## 4. Profesionales — Disponibilidad y Cuentas Bancarias

### 4.1 HorarioDisponible

```sql
CREATE TABLE HorarioDisponible (
    HorarioId       INT          IDENTITY(1,1) NOT NULL,
    ProfesionalId   INT          NOT NULL,
    DiaSemana       TINYINT      NOT NULL,       -- 1=Lunes ... 7=Domingo
    HoraInicio      TIME(0)      NOT NULL,
    HoraFin         TIME(0)      NOT NULL,
    Estado          BIT          NOT NULL DEFAULT 1,

    CONSTRAINT PK_HorarioDisponible     PRIMARY KEY (HorarioId),
    CONSTRAINT FK_Horario_Profesional   FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT CK_HorarioDisponible_Dia CHECK (DiaSemana BETWEEN 1 AND 7)
);
```

### 4.2 HorarioBloqueado

```sql
CREATE TABLE HorarioBloqueado (
    BloqueoId           INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId       INT             NOT NULL,
    FechaHoraInicio     DATETIME2(0)    NOT NULL,
    FechaHoraFin        DATETIME2(0)    NOT NULL,
    Motivo              NVARCHAR(300)   NULL,
    FechaCreacion       DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_HorarioBloqueado      PRIMARY KEY (BloqueoId),
    CONSTRAINT FK_Bloqueo_Profesional   FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId)
);
```

### 4.3 CuentaBancaria

```sql
CREATE TABLE CuentaBancaria (
    CuentaId        INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId   INT             NOT NULL,
    Banco           NVARCHAR(200)   NOT NULL,
    TipoCuenta      NVARCHAR(30)    NOT NULL,       -- 'Ahorros', 'Corriente'
    NumeroCuenta    NVARCHAR(50)    NOT NULL,
    Titular         NVARCHAR(200)   NOT NULL,
    Estado          BIT             NOT NULL DEFAULT 1,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_CuentaBancaria      PRIMARY KEY (CuentaId),
    CONSTRAINT FK_Cuenta_Profesional  FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId)
);
```

---

## 5. Salas y Eventos

### 5.1 Sala

```sql
CREATE TABLE Sala (
    SalaId              INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId       INT             NOT NULL,
    CategoriaId         INT             NULL,
    Nombre              NVARCHAR(300)   NOT NULL,
    Descripcion         NVARCHAR(MAX)   NULL,
    Tipo                NVARCHAR(10)    NOT NULL DEFAULT 'Publica',  -- 'Publica', 'Privada'
    CupoMaximo          INT             NOT NULL,
    Precio              DECIMAL(10,2)   NOT NULL DEFAULT 0,
    ChatHabilitado      BIT             NOT NULL DEFAULT 1,
    Estado              NVARCHAR(10)    NOT NULL DEFAULT 'Abierta',  -- 'Abierta', 'Cerrada'
    FechaCreacion       DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Sala              PRIMARY KEY (SalaId),
    CONSTRAINT FK_Sala_Profesional  FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT FK_Sala_Categoria    FOREIGN KEY (CategoriaId)   REFERENCES Categoria(CategoriaId),
    CONSTRAINT CK_Sala_Tipo         CHECK (Tipo   IN ('Publica', 'Privada')),
    CONSTRAINT CK_Sala_Estado       CHECK (Estado IN ('Abierta', 'Cerrada')),
    CONSTRAINT CK_Sala_Cupo         CHECK (CupoMaximo > 0),
    CONSTRAINT CK_Sala_Precio       CHECK (Precio >= 0)
);
```

### 5.2 Evento

```sql
CREATE TABLE Evento (
    EventoId        INT             IDENTITY(1,1) NOT NULL,
    SalaId          INT             NOT NULL,
    Nombre          NVARCHAR(300)   NOT NULL,
    Descripcion     NVARCHAR(MAX)   NULL,
    FechaInicio     DATETIME2(0)    NOT NULL,
    FechaFin        DATETIME2(0)    NOT NULL,
    Estado          NVARCHAR(10)    NOT NULL DEFAULT 'Abierto',  -- 'Abierto', 'Cerrado', 'Cancelado'
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Evento        PRIMARY KEY (EventoId),
    CONSTRAINT FK_Evento_Sala   FOREIGN KEY (SalaId) REFERENCES Sala(SalaId),
    CONSTRAINT CK_Evento_Estado CHECK (Estado IN ('Abierto', 'Cerrado', 'Cancelado')),
    CONSTRAINT CK_Evento_Fechas CHECK (FechaFin > FechaInicio)
);
```

### 5.3 MensajeEvento

```sql
CREATE TABLE MensajeEvento (
    MensajeId       INT             IDENTITY(1,1) NOT NULL,
    EventoId        INT             NOT NULL,
    AutorId         INT             NOT NULL,
    TipoAutor       NVARCHAR(15)    NOT NULL,       -- 'Usuario', 'Profesional'
    Texto           NVARCHAR(MAX)   NOT NULL,
    Estado          BIT             NOT NULL DEFAULT 1,  -- 1=Activo, 0=Eliminado
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2(0)  NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_MensajeEvento      PRIMARY KEY (MensajeId),
    CONSTRAINT FK_Mensaje_Evento     FOREIGN KEY (EventoId) REFERENCES Evento(EventoId),
    CONSTRAINT CK_Mensaje_TipoAutor  CHECK (TipoAutor IN ('Usuario', 'Profesional'))
);
```

---

## 6. Citas Privadas

### 6.1 Cita

```sql
CREATE TABLE Cita (
    CitaId              INT             IDENTITY(1,1) NOT NULL,
    UsuarioId           INT             NOT NULL,
    ProfesionalId       INT             NOT NULL,
    FechaHora           DATETIME2(0)    NOT NULL,
    FechaHoraFin        DATETIME2(0)    NOT NULL,
    Tipo                NVARCHAR(15)    NOT NULL,       -- 'Seguimiento', 'Asesoria'
    Estado              NVARCHAR(15)    NOT NULL DEFAULT 'Programada',
    MostrarAlias        BIT             NOT NULL DEFAULT 0,
    FechaCreacion       DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Cita              PRIMARY KEY (CitaId),
    CONSTRAINT FK_Cita_Usuario      FOREIGN KEY (UsuarioId)     REFERENCES Usuario(UsuarioId),
    CONSTRAINT FK_Cita_Profesional  FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT CK_Cita_Tipo         CHECK (Tipo   IN ('Seguimiento', 'Asesoria')),
    CONSTRAINT CK_Cita_Estado       CHECK (Estado IN ('Programada', 'Cancelada', 'Movida', 'Finalizada')),
    CONSTRAINT CK_Cita_Fechas       CHECK (FechaHoraFin > FechaHora)
);
```

### 6.2 Recomendacion

```sql
CREATE TABLE Recomendacion (
    RecomendacionId     INT             IDENTITY(1,1) NOT NULL,
    CitaId              INT             NOT NULL,
    ProfesionalId       INT             NOT NULL,
    Texto               NVARCHAR(MAX)   NOT NULL,
    FechaCreacion       DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Recomendacion         PRIMARY KEY (RecomendacionId),
    CONSTRAINT FK_Recomendacion_Cita    FOREIGN KEY (CitaId)        REFERENCES Cita(CitaId),
    CONSTRAINT FK_Recomendacion_Prof    FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId)
);
```

### 6.3 ComentarioPrivado

```sql
CREATE TABLE ComentarioPrivado (
    ComentarioPrivadoId INT             IDENTITY(1,1) NOT NULL,
    CitaId              INT             NOT NULL,
    UsuarioId           INT             NOT NULL,
    Texto               NVARCHAR(MAX)   NOT NULL,
    FechaCreacion       DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_ComentarioPrivado         PRIMARY KEY (ComentarioPrivadoId),
    CONSTRAINT FK_ComentPrivado_Cita        FOREIGN KEY (CitaId)    REFERENCES Cita(CitaId),
    CONSTRAINT FK_ComentPrivado_Usuario     FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);
```

### 6.4 HistorialClinico

```sql
CREATE TABLE HistorialClinico (
    HistorialId     INT             IDENTITY(1,1) NOT NULL,
    UsuarioId       INT             NOT NULL,
    ProfesionalId   INT             NOT NULL,
    CitaId          INT             NOT NULL,
    Notas           NVARCHAR(MAX)   NULL,
    Medicamentos    NVARCHAR(MAX)   NULL,
    Seguimiento     NVARCHAR(MAX)   NULL,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_HistorialClinico          PRIMARY KEY (HistorialId),
    CONSTRAINT FK_Historial_Usuario         FOREIGN KEY (UsuarioId)     REFERENCES Usuario(UsuarioId),
    CONSTRAINT FK_Historial_Profesional     FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT FK_Historial_Cita            FOREIGN KEY (CitaId)        REFERENCES Cita(CitaId)
);
```

---

## 7. Inscripciones y Pagos

### 7.1 Inscripcion

```sql
CREATE TABLE Inscripcion (
    InscripcionId       INT             IDENTITY(1,1) NOT NULL,
    UsuarioId           INT             NOT NULL,
    EventoId            INT             NOT NULL,
    Estado              NVARCHAR(25)    NOT NULL DEFAULT 'PendientePago',
    CodigoInscripcion   NVARCHAR(50)    NULL,
    FechaInscripcion    DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Inscripcion               PRIMARY KEY (InscripcionId),
    CONSTRAINT UQ_Inscripcion_Codigo        UNIQUE (CodigoInscripcion),
    CONSTRAINT FK_Inscripcion_Usuario       FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    CONSTRAINT FK_Inscripcion_Evento        FOREIGN KEY (EventoId)  REFERENCES Evento(EventoId),
    CONSTRAINT CK_Inscripcion_Estado        CHECK (Estado IN (
        'PendientePago', 'PagoAprobado', 'PagoRechazado',
        'Confirmada', 'SinCupos', 'ReembolsoPendiente', 'Cancelada'
    ))
);
```

### 7.2 Pago

```sql
CREATE TABLE Pago (
    PagoId              INT             IDENTITY(1,1) NOT NULL,
    InscripcionId       INT             NOT NULL,
    Monto               DECIMAL(10,2)   NOT NULL,
    MetodoPago          NVARCHAR(25)    NOT NULL,
    Estado              NVARCHAR(15)    NOT NULL DEFAULT 'Pendiente',
    ReferenciaPassarela NVARCHAR(200)   NULL,
    FechaPago           DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Pago              PRIMARY KEY (PagoId),
    CONSTRAINT FK_Pago_Inscripcion  FOREIGN KEY (InscripcionId) REFERENCES Inscripcion(InscripcionId),
    CONSTRAINT CK_Pago_MetodoPago   CHECK (MetodoPago IN (
        'TarjetaCredito', 'TarjetaDebito', 'PSE', 'Transferencia'
    )),
    CONSTRAINT CK_Pago_Estado       CHECK (Estado IN ('Pendiente', 'Aprobado', 'Rechazado')),
    CONSTRAINT CK_Pago_Monto        CHECK (Monto > 0)
);
```

### 7.3 LogPago

```sql
CREATE TABLE LogPago (
    LogId       INT             IDENTITY(1,1) NOT NULL,
    PagoId      INT             NOT NULL,
    Evento      NVARCHAR(100)   NOT NULL,
    Detalle     NVARCHAR(MAX)   NULL,
    Timestamp   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_LogPago       PRIMARY KEY (LogId),
    CONSTRAINT FK_LogPago_Pago  FOREIGN KEY (PagoId) REFERENCES Pago(PagoId)
);
```

---

## 8. Interacción Social

### 8.1 Seguidor

```sql
CREATE TABLE Seguidor (
    SeguidorId      INT          IDENTITY(1,1) NOT NULL,
    UsuarioId       INT          NOT NULL,
    ProfesionalId   INT          NOT NULL,
    FechaCreacion   DATETIME2(0) NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Seguidor              PRIMARY KEY (SeguidorId),
    CONSTRAINT UQ_Seguidor_Relacion     UNIQUE (UsuarioId, ProfesionalId),
    CONSTRAINT FK_Seguidor_Usuario      FOREIGN KEY (UsuarioId)     REFERENCES Usuario(UsuarioId),
    CONSTRAINT FK_Seguidor_Profesional  FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId)
);
```

### 8.2 MeGusta

```sql
CREATE TABLE MeGusta (
    MeGustaId       INT          IDENTITY(1,1) NOT NULL,
    UsuarioId       INT          NOT NULL,
    SalaId          INT          NOT NULL,
    FechaCreacion   DATETIME2(0) NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_MeGusta           PRIMARY KEY (MeGustaId),
    CONSTRAINT UQ_MeGusta_Relacion  UNIQUE (UsuarioId, SalaId),
    CONSTRAINT FK_MeGusta_Usuario   FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    CONSTRAINT FK_MeGusta_Sala      FOREIGN KEY (SalaId)    REFERENCES Sala(SalaId)
);
```

### 8.3 ComentarioProfesional

```sql
CREATE TABLE ComentarioProfesional (
    ComentarioId    INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId   INT             NOT NULL,
    UsuarioId       INT             NOT NULL,
    Texto           NVARCHAR(MAX)   NOT NULL,
    Estado          BIT             NOT NULL DEFAULT 1,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_ComentarioProfesional         PRIMARY KEY (ComentarioId),
    CONSTRAINT FK_ComentProf_Profesional        FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT FK_ComentProf_Usuario            FOREIGN KEY (UsuarioId)     REFERENCES Usuario(UsuarioId)
);
```

### 8.4 RespuestaComentario

```sql
CREATE TABLE RespuestaComentario (
    RespuestaId     INT             IDENTITY(1,1) NOT NULL,
    ComentarioId    INT             NOT NULL,
    ProfesionalId   INT             NOT NULL,
    Texto           NVARCHAR(MAX)   NOT NULL,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_RespuestaComentario        PRIMARY KEY (RespuestaId),
    CONSTRAINT FK_Respuesta_Comentario       FOREIGN KEY (ComentarioId)  REFERENCES ComentarioProfesional(ComentarioId),
    CONSTRAINT FK_Respuesta_Profesional      FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId)
);
```

---

## 9. Sesiones y Seguridad

### 9.1 Sesion

```sql
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
    CONSTRAINT CK_Sesion_Tipo   CHECK (TipoEntidad IN ('Usuario', 'Profesional')),
    CONSTRAINT CK_Sesion_Estado CHECK (Estado IN ('Activa', 'Expirada', 'Cerrada'))
);
```

---

## 10. Configuración del Sistema

### 10.1 Configuracion

```sql
CREATE TABLE Configuracion (
    ConfigId            INT             IDENTITY(1,1) NOT NULL,
    Clave               NVARCHAR(100)   NOT NULL,
    Valor               NVARCHAR(MAX)   NOT NULL,
    Descripcion         NVARCHAR(500)   NULL,
    FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Configuracion     PRIMARY KEY (ConfigId),
    CONSTRAINT UQ_Configuracion_Clave UNIQUE (Clave)
);

-- Datos iniciales requeridos
INSERT INTO Configuracion (Clave, Valor, Descripcion) VALUES
    ('ProfesionalDestacadoId',  '0',    'ID del profesional destacado en el Landing Page'),
    ('ComisionPlataforma',      '15',   'Porcentaje de comisión retenido por la plataforma'),
    ('PaginacionDefault',       '10',   'Número de registros por página en listados'),
    ('TokenValidacionHoras',    '1',    'Horas de vigencia del token de validación de usuario'),
    ('TokenActivacionHoras',    '24',   'Horas de vigencia del token de activación de profesional'),
    ('TokenRecuperacionHoras',  '1',    'Horas de vigencia del token de recuperación de contraseña'),
    ('CorreoAdministrador',     '',     'Correo del administrador para recibir solicitudes de profesionales'),
    ('TamanioMaximoPdfMB',      '5',    'Tamaño máximo permitido para archivos PDF en MB');
```

---

## 11. Índices

```sql
-- Usuarios
CREATE INDEX IX_Usuario_Correo         ON Usuario(Correo);
CREATE INDEX IX_Usuario_Estado         ON Usuario(Estado);

-- Profesionales
CREATE INDEX IX_Profesional_Correo     ON Profesional(Correo);
CREATE INDEX IX_Profesional_Estado     ON Profesional(Estado);
CREATE INDEX IX_Profesional_PaisId     ON Profesional(PaisId);
CREATE INDEX IX_Profesional_CiudadId   ON Profesional(CiudadId);

-- Ciudades
CREATE INDEX IX_Ciudad_PaisId          ON Ciudad(PaisId);

-- Tokens
CREATE INDEX IX_TokenValidacion_UsuarioId   ON TokenValidacion(UsuarioId);
CREATE INDEX IX_TokenActivacion_ProfId      ON TokenActivacion(ProfesionalId);
CREATE INDEX IX_TokenRecuperacion_Entidad   ON TokenRecuperacion(EntidadId, TipoEntidad);

-- Salas
CREATE INDEX IX_Sala_ProfesionalId     ON Sala(ProfesionalId);
CREATE INDEX IX_Sala_CategoriaId       ON Sala(CategoriaId);
CREATE INDEX IX_Sala_Estado            ON Sala(Estado);

-- Eventos
CREATE INDEX IX_Evento_SalaId          ON Evento(SalaId);
CREATE INDEX IX_Evento_Estado          ON Evento(Estado);
CREATE INDEX IX_Evento_FechaInicio     ON Evento(FechaInicio);

-- Inscripciones
CREATE INDEX IX_Inscripcion_UsuarioId  ON Inscripcion(UsuarioId);
CREATE INDEX IX_Inscripcion_EventoId   ON Inscripcion(EventoId);
CREATE INDEX IX_Inscripcion_Estado     ON Inscripcion(Estado);

-- Citas
CREATE INDEX IX_Cita_UsuarioId         ON Cita(UsuarioId);
CREATE INDEX IX_Cita_ProfesionalId     ON Cita(ProfesionalId);
CREATE INDEX IX_Cita_FechaHora         ON Cita(FechaHora);
CREATE INDEX IX_Cita_Estado            ON Cita(Estado);

-- Pagos
CREATE INDEX IX_Pago_InscripcionId     ON Pago(InscripcionId);
CREATE INDEX IX_Pago_Estado            ON Pago(Estado);

-- Seguidores
CREATE INDEX IX_Seguidor_ProfesionalId ON Seguidor(ProfesionalId);
CREATE INDEX IX_Seguidor_UsuarioId     ON Seguidor(UsuarioId);

-- Sesiones
CREATE INDEX IX_Sesion_Entidad         ON Sesion(EntidadId, TipoEntidad);
CREATE INDEX IX_Sesion_Estado          ON Sesion(Estado);

-- Mensajes de evento
CREATE INDEX IX_MensajeEvento_EventoId ON MensajeEvento(EventoId);

-- Comentarios profesional
CREATE INDEX IX_ComentProf_ProfesionalId ON ComentarioProfesional(ProfesionalId);
```

---

## 12. Vistas

### 12.1 vw_SalasActivas

> Salas con al menos un evento abierto y vigente. Usada en el Home del usuario y el Landing Page.

```sql
CREATE VIEW vw_SalasActivas AS
SELECT
    s.SalaId,
    s.Nombre                                AS NombreSala,
    s.Descripcion,
    s.Tipo,
    s.CupoMaximo,
    s.Precio,
    s.ChatHabilitado,
    c.Nombre                                AS Categoria,
    p.ProfesionalId,
    ISNULL(p.Alias, p.NombreCompleto)       AS NombreOrador,
    p.FotoPerfil                            AS FotoOrador,
    e.EventoId,
    e.Nombre                                AS NombreEvento,
    e.FechaInicio,
    e.FechaFin,
    (
        SELECT COUNT(*)
        FROM Inscripcion i
        WHERE i.EventoId = e.EventoId
          AND i.Estado = 'Confirmada'
    )                                       AS TotalInscritos,
    (
        SELECT COUNT(*)
        FROM MeGusta mg
        WHERE mg.SalaId = s.SalaId
    )                                       AS TotalMeGusta
FROM Sala s
INNER JOIN Evento e      ON e.SalaId      = s.SalaId
INNER JOIN Profesional p ON p.ProfesionalId = s.ProfesionalId
LEFT  JOIN Categoria c   ON c.CategoriaId  = s.CategoriaId
WHERE s.Estado   = 'Abierta'
  AND e.Estado   = 'Abierto'
  AND e.FechaFin >= GETDATE();
```

### 12.2 vw_TopEventosInscritos

> Los 3 eventos con mayor número de inscritos confirmados. Usada en el Landing Page.

```sql
CREATE VIEW vw_TopEventosInscritos AS
SELECT TOP 3
    s.SalaId,
    s.Nombre                                AS NombreSala,
    s.Precio,
    ISNULL(p.Alias, p.NombreCompleto)       AS NombreOrador,
    e.EventoId,
    e.Nombre                                AS NombreEvento,
    e.FechaInicio,
    e.FechaFin,
    COUNT(i.InscripcionId)                  AS TotalInscritos
FROM Evento e
INNER JOIN Sala s        ON s.SalaId        = e.SalaId
INNER JOIN Profesional p ON p.ProfesionalId = s.ProfesionalId
INNER JOIN Inscripcion i ON i.EventoId      = e.EventoId
    AND i.Estado = 'Confirmada'
WHERE s.Estado = 'Abierta'
  AND e.Estado = 'Abierto'
  AND e.FechaFin >= GETDATE()
GROUP BY
    s.SalaId, s.Nombre, s.Precio,
    p.Alias, p.NombreCompleto,
    e.EventoId, e.Nombre, e.FechaInicio, e.FechaFin
ORDER BY TotalInscritos DESC;
```

### 12.3 vw_ProximasCitasUsuario

> Próximas citas programadas del usuario. Usada en el Dashboard y Perfil del Usuario.

```sql
CREATE VIEW vw_ProximasCitasUsuario AS
SELECT
    c.CitaId,
    c.UsuarioId,
    c.ProfesionalId,
    ISNULL(p.Alias, p.NombreCompleto)   AS NombreProfesional,
    p.FotoPerfil                        AS FotoOrador,
    c.FechaHora,
    c.FechaHoraFin,
    c.Tipo,
    c.Estado,
    c.MostrarAlias
FROM Cita c
INNER JOIN Profesional p ON p.ProfesionalId = c.ProfesionalId
WHERE c.Estado    = 'Programada'
  AND c.FechaHora >= GETDATE();
```

### 12.4 vw_ProximasCitasProfesional

> Próximas citas programadas del profesional. Usada en el Dashboard y Perfil del Profesional.

```sql
CREATE VIEW vw_ProximasCitasProfesional AS
SELECT
    c.CitaId,
    c.ProfesionalId,
    c.UsuarioId,
    CASE
        WHEN c.MostrarAlias = 1 THEN u.Alias
        ELSE u.NombreCompleto
    END                     AS NombreUsuario,
    c.FechaHora,
    c.FechaHoraFin,
    c.Tipo,
    c.Estado
FROM Cita c
INNER JOIN Usuario u ON u.UsuarioId = c.UsuarioId
WHERE c.Estado    = 'Programada'
  AND c.FechaHora >= GETDATE();
```

### 12.5 vw_ResumenProfesional

> Métricas del dashboard del profesional.

```sql
CREATE VIEW vw_ResumenProfesional AS
SELECT
    p.ProfesionalId,
    (
        SELECT COUNT(*) FROM Seguidor s
        WHERE s.ProfesionalId = p.ProfesionalId
    )                               AS TotalSeguidores,
    (
        SELECT COUNT(*) FROM Sala sa
        WHERE sa.ProfesionalId = p.ProfesionalId
    )                               AS TotalSalas,
    (
        SELECT COUNT(*) FROM Evento e
        INNER JOIN Sala sa ON sa.SalaId = e.SalaId
        WHERE sa.ProfesionalId = p.ProfesionalId
    )                               AS TotalEventos,
    (
        SELECT ISNULL(SUM(pg.Monto), 0)
        FROM Pago pg
        INNER JOIN Inscripcion i   ON i.InscripcionId = pg.InscripcionId
        INNER JOIN Evento ev       ON ev.EventoId      = i.EventoId
        INNER JOIN Sala sa         ON sa.SalaId        = ev.SalaId
        WHERE sa.ProfesionalId = p.ProfesionalId
          AND pg.Estado = 'Aprobado'
    )                               AS TotalIngresos,
    (
        SELECT COUNT(*) FROM MeGusta mg
        INNER JOIN Sala sa ON sa.SalaId = mg.SalaId
        WHERE sa.ProfesionalId = p.ProfesionalId
    )                               AS TotalMeGusta
FROM Profesional p
WHERE p.Estado = 'ACTIVO';
```

---

## 13. Stored Procedures

### 13.1 sp_RegistrarUsuario

```sql
CREATE PROCEDURE sp_RegistrarUsuario
    @NombreCompleto     NVARCHAR(200),
    @Correo             NVARCHAR(254),
    @NumeroDocumento    NVARCHAR(30),
    @Alias              NVARCHAR(100),
    @Celular            NVARCHAR(20),
    @UsuarioId          INT OUTPUT,
    @Resultado          NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar unicidad de correo
    IF EXISTS (SELECT 1 FROM Usuario WHERE Correo = @Correo)
    BEGIN
        SET @Resultado = 'CORREO_DUPLICADO';
        RETURN;
    END

    -- Validar unicidad de documento
    IF EXISTS (SELECT 1 FROM Usuario WHERE NumeroDocumento = @NumeroDocumento)
    BEGIN
        SET @Resultado = 'DOCUMENTO_DUPLICADO';
        RETURN;
    END

    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO Usuario (NombreCompleto, Correo, NumeroDocumento, Alias, Celular, Estado)
        VALUES (@NombreCompleto, @Correo, @NumeroDocumento, @Alias, @Celular, 'PENDIENTE');

        SET @UsuarioId = SCOPE_IDENTITY();
        SET @Resultado = 'OK';

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Resultado = 'ERROR';
        THROW;
    END CATCH
END;
```

### 13.2 sp_ActivarUsuario

```sql
CREATE PROCEDURE sp_ActivarUsuario
    @Token          NVARCHAR(500),
    @PasswordHash   NVARCHAR(500),  -- Hash Argon2 generado en Capa Helpers ANTES de llamar este SP
    @Resultado      NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TokenId    INT;
    DECLARE @UsuarioId  INT;
    DECLARE @Expiracion DATETIME2(0);
    DECLARE @Usado      BIT;

    SELECT
        @TokenId    = TokenId,
        @UsuarioId  = UsuarioId,
        @Expiracion = FechaExpiracion,
        @Usado      = Usado
    FROM TokenValidacion
    WHERE Token = @Token;

    IF @TokenId IS NULL
    BEGIN
        SET @Resultado = 'TOKEN_INVALIDO';
        RETURN;
    END

    IF @Usado = 1
    BEGIN
        SET @Resultado = 'TOKEN_USADO';
        RETURN;
    END

    IF @Expiracion < GETDATE()
    BEGIN
        SET @Resultado = 'TOKEN_EXPIRADO';
        RETURN;
    END

    BEGIN TRANSACTION;
    BEGIN TRY
        UPDATE Usuario
        SET PasswordHash      = @PasswordHash,
            Estado            = 'ACTIVO',
            FechaModificacion = GETDATE()
        WHERE UsuarioId = @UsuarioId;

        UPDATE TokenValidacion
        SET Usado = 1
        WHERE TokenId = @TokenId;

        SET @Resultado = 'OK';
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Resultado = 'ERROR';
        THROW;
    END CATCH
END;
```

### 13.3 sp_RegistrarProfesional

```sql
CREATE PROCEDURE sp_RegistrarProfesional
    @NombreCompleto             NVARCHAR(200),
    @Correo                     NVARCHAR(254),
    @NumeroDocumento            NVARCHAR(30),
    @Alias                      NVARCHAR(100),
    @Celular                    NVARCHAR(20),
    @NumerTarjetaProfesional    NVARCHAR(50),
    @UrlDocumentoIdentidad      NVARCHAR(500),
    @UrlTarjetaProfesional      NVARCHAR(500),
    @ProfesionalId              INT OUTPUT,
    @Resultado                  NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Profesional WHERE Correo = @Correo)
    BEGIN SET @Resultado = 'CORREO_DUPLICADO'; RETURN; END

    IF EXISTS (SELECT 1 FROM Profesional WHERE NumeroDocumento = @NumeroDocumento)
    BEGIN SET @Resultado = 'DOCUMENTO_DUPLICADO'; RETURN; END

    IF EXISTS (SELECT 1 FROM Profesional WHERE NumerTarjetaProfesional = @NumerTarjetaProfesional)
    BEGIN SET @Resultado = 'TARJETA_DUPLICADA'; RETURN; END

    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO Profesional (
            NombreCompleto, Correo, NumeroDocumento, Alias, Celular,
            NumerTarjetaProfesional, UrlDocumentoIdentidad, UrlTarjetaProfesional, Estado
        )
        VALUES (
            @NombreCompleto, @Correo, @NumeroDocumento, @Alias, @Celular,
            @NumerTarjetaProfesional, @UrlDocumentoIdentidad, @UrlTarjetaProfesional,
            'PENDIENTE_VALIDACION'
        );

        SET @ProfesionalId = SCOPE_IDENTITY();
        SET @Resultado = 'OK';
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Resultado = 'ERROR';
        THROW;
    END CATCH
END;
```

### 13.4 sp_AprobarProfesional

```sql
CREATE PROCEDURE sp_AprobarProfesional
    @ProfesionalId  INT,
    @Aprobado       BIT,
    @MotivoRechazo  NVARCHAR(500) = NULL,
    @Resultado      NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Profesional WHERE ProfesionalId = @ProfesionalId
                   AND Estado = 'PENDIENTE_VALIDACION')
    BEGIN
        SET @Resultado = 'NO_ENCONTRADO';
        RETURN;
    END

    BEGIN TRANSACTION;
    BEGIN TRY
        IF @Aprobado = 1
        BEGIN
            UPDATE Profesional
            SET Estado            = 'ACTIVO',
                FechaModificacion = GETDATE()
            WHERE ProfesionalId = @ProfesionalId;
        END
        ELSE
        BEGIN
            UPDATE Profesional
            SET Estado            = 'RECHAZADO',
                MotivoRechazo     = @MotivoRechazo,
                FechaModificacion = GETDATE()
            WHERE ProfesionalId = @ProfesionalId;
        END

        SET @Resultado = 'OK';
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Resultado = 'ERROR';
        THROW;
    END CATCH
END;
```

### 13.5 sp_ValidarLogin

```sql
CREATE PROCEDURE sp_ValidarLogin
    @Correo         NVARCHAR(254),
    @PasswordHash   NVARCHAR(500),  -- Hash Argon2 generado en Capa Helpers ANTES de llamar este SP
    @EntidadId      INT OUTPUT,
    @TipoEntidad    NVARCHAR(15) OUTPUT,
    @Resultado      NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Buscar en Usuarios
    SELECT @EntidadId = UsuarioId
    FROM Usuario
    WHERE Correo       = @Correo
      AND PasswordHash = @PasswordHash
      AND Estado       = 'ACTIVO';

    IF @EntidadId IS NOT NULL
    BEGIN
        SET @TipoEntidad = 'Usuario';
        SET @Resultado   = 'OK';
        RETURN;
    END

    -- Buscar en Profesionales
    SELECT @EntidadId = ProfesionalId
    FROM Profesional
    WHERE Correo       = @Correo
      AND PasswordHash = @PasswordHash
      AND Estado       = 'ACTIVO';

    IF @EntidadId IS NOT NULL
    BEGIN
        SET @TipoEntidad = 'Profesional';
        SET @Resultado   = 'OK';
        RETURN;
    END

    SET @Resultado = 'CREDENCIALES_INVALIDAS';
END;
```

### 13.6 sp_GenerarTokenRecuperacion

```sql
CREATE PROCEDURE sp_GenerarTokenRecuperacion
    @Correo     NVARCHAR(254),
    @Token      NVARCHAR(500),
    @Resultado  NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EntidadId   INT;
    DECLARE @TipoEntidad NVARCHAR(15);
    DECLARE @HorasVigencia INT;

    SELECT @HorasVigencia = CAST(Valor AS INT)
    FROM Configuracion
    WHERE Clave = 'TokenRecuperacionHoras';

    -- Buscar en Usuarios
    SELECT @EntidadId = UsuarioId FROM Usuario
    WHERE Correo = @Correo AND Estado = 'ACTIVO';

    IF @EntidadId IS NOT NULL
        SET @TipoEntidad = 'Usuario';
    ELSE
    BEGIN
        -- Buscar en Profesionales
        SELECT @EntidadId = ProfesionalId FROM Profesional
        WHERE Correo = @Correo AND Estado = 'ACTIVO';

        IF @EntidadId IS NOT NULL
            SET @TipoEntidad = 'Profesional';
    END

    -- Siempre responder OK (no revelar si el correo existe)
    SET @Resultado = 'OK';

    IF @EntidadId IS NULL RETURN;

    BEGIN TRANSACTION;
    BEGIN TRY
        -- Invalidar tokens anteriores no usados
        UPDATE TokenRecuperacion
        SET Usado = 1
        WHERE EntidadId   = @EntidadId
          AND TipoEntidad = @TipoEntidad
          AND Usado        = 0;

        INSERT INTO TokenRecuperacion (EntidadId, TipoEntidad, Token, FechaExpiracion)
        VALUES (@EntidadId, @TipoEntidad, @Token,
                DATEADD(HOUR, @HorasVigencia, GETDATE()));

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Resultado = 'ERROR';
        THROW;
    END CATCH
END;
```

### 13.7 sp_RestablecerPassword

```sql
CREATE PROCEDURE sp_RestablecerPassword
    @Token          NVARCHAR(500),
    @PasswordHash   NVARCHAR(500),  -- Hash Argon2 generado en Capa Helpers ANTES de llamar este SP
    @Resultado      NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TokenId     INT;
    DECLARE @EntidadId   INT;
    DECLARE @TipoEntidad NVARCHAR(15);
    DECLARE @Expiracion  DATETIME2(0);
    DECLARE @Usado       BIT;

    SELECT
        @TokenId     = TokenId,
        @EntidadId   = EntidadId,
        @TipoEntidad = TipoEntidad,
        @Expiracion  = FechaExpiracion,
        @Usado       = Usado
    FROM TokenRecuperacion WHERE Token = @Token;

    IF @TokenId IS NULL
    BEGIN SET @Resultado = 'TOKEN_INVALIDO'; RETURN; END

    IF @Usado = 1
    BEGIN SET @Resultado = 'TOKEN_USADO'; RETURN; END

    IF @Expiracion < GETDATE()
    BEGIN SET @Resultado = 'TOKEN_EXPIRADO'; RETURN; END

    BEGIN TRANSACTION;
    BEGIN TRY
        IF @TipoEntidad = 'Usuario'
            UPDATE Usuario
            SET PasswordHash = @PasswordHash, FechaModificacion = GETDATE()
            WHERE UsuarioId = @EntidadId;
        ELSE
            UPDATE Profesional
            SET PasswordHash = @PasswordHash, FechaModificacion = GETDATE()
            WHERE ProfesionalId = @EntidadId;

        UPDATE TokenRecuperacion SET Usado = 1 WHERE TokenId = @TokenId;

        SET @Resultado = 'OK';
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Resultado = 'ERROR';
        THROW;
    END CATCH
END;
```

### 13.8 sp_ObtenerSalasActivas

```sql
CREATE PROCEDURE sp_ObtenerSalasActivas
    @CategoriaId    INT           = NULL,
    @Busqueda       NVARCHAR(200) = NULL,
    @FechaInicio    DATE          = NULL,
    @Pagina         INT           = 1,
    @RegistrosPorPagina INT       = 10
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Pagina - 1) * @RegistrosPorPagina;

    SELECT
        sa.SalaId,
        sa.NombreSala,
        sa.Descripcion,
        sa.Tipo,
        sa.CupoMaximo,
        sa.Precio,
        sa.Categoria,
        sa.ProfesionalId,
        sa.NombreOrador,
        sa.FotoOrador,
        sa.EventoId,
        sa.NombreEvento,
        sa.FechaInicio,
        sa.FechaFin,
        sa.TotalInscritos,
        sa.TotalMeGusta,
        (sa.CupoMaximo - sa.TotalInscritos) AS CuposDisponibles
    FROM vw_SalasActivas sa
    WHERE
        (@CategoriaId IS NULL OR sa.SalaId IN (
            SELECT SalaId FROM Sala WHERE CategoriaId = @CategoriaId
        ))
        AND (@Busqueda IS NULL OR
             sa.NombreSala  LIKE '%' + @Busqueda + '%' OR
             sa.NombreOrador LIKE '%' + @Busqueda + '%')
        AND (@FechaInicio IS NULL OR CAST(sa.FechaInicio AS DATE) = @FechaInicio)
    ORDER BY sa.FechaInicio ASC
    OFFSET @Offset ROWS FETCH NEXT @RegistrosPorPagina ROWS ONLY;
END;
```

### 13.9 sp_InscrbirUsuarioEvento

```sql
CREATE PROCEDURE sp_InscribirUsuarioEvento
    @UsuarioId      INT,
    @EventoId       INT,
    @InscripcionId  INT OUTPUT,
    @Resultado      NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CupoMaximo     INT;
    DECLARE @TotalInscritos INT;
    DECLARE @EsGratuito     BIT;

    -- Verificar que el evento exista y esté abierto
    SELECT @CupoMaximo = s.CupoMaximo,
           @EsGratuito = CASE WHEN s.Precio = 0 THEN 1 ELSE 0 END
    FROM Evento e
    INNER JOIN Sala s ON s.SalaId = e.SalaId
    WHERE e.EventoId = @EventoId
      AND e.Estado   = 'Abierto'
      AND s.Estado   = 'Abierta';

    IF @CupoMaximo IS NULL
    BEGIN SET @Resultado = 'EVENTO_NO_DISPONIBLE'; RETURN; END

    -- Verificar si ya está inscrito
    IF EXISTS (SELECT 1 FROM Inscripcion
               WHERE UsuarioId = @UsuarioId
                 AND EventoId  = @EventoId
                 AND Estado NOT IN ('Cancelada', 'PagoRechazado'))
    BEGIN SET @Resultado = 'YA_INSCRITO'; RETURN; END

    -- Validar cupos disponibles (primera validación)
    SELECT @TotalInscritos = COUNT(*)
    FROM Inscripcion
    WHERE EventoId = @EventoId AND Estado = 'Confirmada';

    IF @TotalInscritos >= @CupoMaximo
    BEGIN SET @Resultado = 'SIN_CUPOS'; RETURN; END

    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @Estado NVARCHAR(25) =
            CASE WHEN @EsGratuito = 1 THEN 'Confirmada' ELSE 'PendientePago' END;

        INSERT INTO Inscripcion (UsuarioId, EventoId, Estado, CodigoInscripcion)
        VALUES (@UsuarioId, @EventoId, @Estado,
                CASE WHEN @EsGratuito = 1
                     THEN UPPER(REPLACE(NEWID(), '-', ''))
                     ELSE NULL END);

        SET @InscripcionId = SCOPE_IDENTITY();
        SET @Resultado     = CASE WHEN @EsGratuito = 1 THEN 'OK_GRATUITO' ELSE 'OK_PAGO_REQUERIDO' END;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Resultado = 'ERROR';
        THROW;
    END CATCH
END;
```

### 13.10 sp_ConfirmarPago

```sql
CREATE PROCEDURE sp_ConfirmarPago
    @InscripcionId      INT,
    @Monto              DECIMAL(10,2),
    @MetodoPago         NVARCHAR(25),
    @ReferenciaPassarela NVARCHAR(200),
    @PagoAprobado       BIT,
    @Resultado          NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EventoId      INT;
    DECLARE @CupoMaximo    INT;
    DECLARE @TotalInscritos INT;

    SELECT @EventoId = i.EventoId
    FROM Inscripcion i
    WHERE i.InscripcionId = @InscripcionId
      AND i.Estado = 'PendientePago';

    IF @EventoId IS NULL
    BEGIN SET @Resultado = 'INSCRIPCION_NO_VALIDA'; RETURN; END

    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @PagoId INT;

        INSERT INTO Pago (InscripcionId, Monto, MetodoPago, Estado, ReferenciaPassarela)
        VALUES (@InscripcionId, @Monto, @MetodoPago,
                CASE WHEN @PagoAprobado = 1 THEN 'Aprobado' ELSE 'Rechazado' END,
                @ReferenciaPassarela);

        SET @PagoId = SCOPE_IDENTITY();

        IF @PagoAprobado = 1
        BEGIN
            -- Segunda validación de cupos (prevención de sobreventa)
            SELECT @CupoMaximo    = s.CupoMaximo
            FROM Evento e INNER JOIN Sala s ON s.SalaId = e.SalaId
            WHERE e.EventoId = @EventoId;

            SELECT @TotalInscritos = COUNT(*)
            FROM Inscripcion
            WHERE EventoId = @EventoId AND Estado = 'Confirmada';

            IF @TotalInscritos >= @CupoMaximo
            BEGIN
                UPDATE Inscripcion
                SET Estado = 'SinCupos', FechaModificacion = GETDATE()
                WHERE InscripcionId = @InscripcionId;

                SET @Resultado = 'SIN_CUPOS_REEMBOLSO';
            END
            ELSE
            BEGIN
                UPDATE Inscripcion
                SET Estado            = 'Confirmada',
                    CodigoInscripcion = UPPER(REPLACE(NEWID(), '-', '')),
                    FechaModificacion = GETDATE()
                WHERE InscripcionId = @InscripcionId;

                SET @Resultado = 'OK_CONFIRMADA';
            END
        END
        ELSE
        BEGIN
            UPDATE Inscripcion
            SET Estado = 'PagoRechazado', FechaModificacion = GETDATE()
            WHERE InscripcionId = @InscripcionId;

            SET @Resultado = 'PAGO_RECHAZADO';
        END

        INSERT INTO LogPago (PagoId, Evento, Detalle)
        VALUES (@PagoId, @Resultado, @ReferenciaPassarela);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Resultado = 'ERROR';
        THROW;
    END CATCH
END;
```

### 13.11 sp_AgendarCita

```sql
CREATE PROCEDURE sp_AgendarCita
    @UsuarioId      INT,
    @ProfesionalId  INT,
    @FechaHora      DATETIME2(0),
    @FechaHoraFin   DATETIME2(0),
    @Tipo           NVARCHAR(15),
    @CitaId         INT OUTPUT,
    @Resultado      NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Verificar que el profesional no tenga otro bloqueo o cita en ese horario
    IF EXISTS (
        SELECT 1 FROM Cita
        WHERE ProfesionalId = @ProfesionalId
          AND Estado = 'Programada'
          AND NOT (@FechaHoraFin <= FechaHora OR @FechaHora >= FechaHoraFin)
    )
    BEGIN SET @Resultado = 'HORARIO_NO_DISPONIBLE'; RETURN; END

    IF EXISTS (
        SELECT 1 FROM HorarioBloqueado
        WHERE ProfesionalId = @ProfesionalId
          AND NOT (@FechaHoraFin <= FechaHoraInicio OR @FechaHora >= FechaHoraFin)
    )
    BEGIN SET @Resultado = 'HORARIO_BLOQUEADO'; RETURN; END

    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO Cita (UsuarioId, ProfesionalId, FechaHora, FechaHoraFin, Tipo, Estado)
        VALUES (@UsuarioId, @ProfesionalId, @FechaHora, @FechaHoraFin, @Tipo, 'Programada');

        SET @CitaId    = SCOPE_IDENTITY();
        SET @Resultado = 'OK';
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Resultado = 'ERROR';
        THROW;
    END CATCH
END;
```

### 13.12 sp_ToggleSeguidor

```sql
CREATE PROCEDURE sp_ToggleSeguidor
    @UsuarioId      INT,
    @ProfesionalId  INT,
    @Accion         NVARCHAR(10) OUTPUT  -- 'SEGUIDO' o 'DEJADO'
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Seguidor
               WHERE UsuarioId = @UsuarioId AND ProfesionalId = @ProfesionalId)
    BEGIN
        DELETE FROM Seguidor
        WHERE UsuarioId = @UsuarioId AND ProfesionalId = @ProfesionalId;
        SET @Accion = 'DEJADO';
    END
    ELSE
    BEGIN
        INSERT INTO Seguidor (UsuarioId, ProfesionalId)
        VALUES (@UsuarioId, @ProfesionalId);
        SET @Accion = 'SEGUIDO';
    END
END;
```

---

## Diagrama de Relaciones (Resumen)

```
Pais ──────────────► Ciudad
                        │
                        ▼
Especialidad ◄── ProfesionalEspecialidad ──► Profesional
Idioma       ◄── ProfesionalIdioma       ──► │
                                             │
                    ProfesionalEstudio ───► │
                    HorarioDisponible ────► │
                    HorarioBloqueado ─────► │
                    CuentaBancaria ───────► │
                    TokenActivacion ──────► │
                                             │
                              ┌─────────────┘
                              │
Categoria ◄─── Sala ◄────────┘
                │
                ▼
             Evento ◄──── Inscripcion ──► Usuario
                │              │
                │           Pago ──► LogPago
                │
             MensajeEvento
             MeGusta ──────────────────► Usuario

Cita ──► Usuario
Cita ──► Profesional
Cita ──► Recomendacion
Cita ──► ComentarioPrivado
Cita ──► HistorialClinico

ComentarioProfesional ──► Profesional
ComentarioProfesional ──► Usuario
RespuestaComentario   ──► ComentarioProfesional

Seguidor ──► Usuario + Profesional
Sesion   ──► (Usuario | Profesional) por TipoEntidad
```

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

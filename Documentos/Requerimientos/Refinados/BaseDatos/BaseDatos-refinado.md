# Base de Datos — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
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
    CONSTRAINT CK_TokenRecuperacion_Tipo  CHECK (TipoEntidad IN ('Usuario', 'Profesional', 'Admin'))
);
```

### 3.9 Administrador

> Cuenta de administrador del sistema. Gestiona la aprobación/rechazo de registros de profesionales desde la **Bandeja de Notificaciones**.

```sql
CREATE TABLE Administrador (
    AdministradorId     INT             IDENTITY(1,1) NOT NULL,
    NombreCompleto      NVARCHAR(200)   NOT NULL,
    Correo              NVARCHAR(254)   NOT NULL,
    PasswordHash        NVARCHAR(500)   NOT NULL,         -- Hash Argon2 con salt embebido. Generado en Capa Helpers.
    Estado              BIT             NOT NULL DEFAULT 1,
    FechaCreacion       DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Administrador        PRIMARY KEY (AdministradorId),
    CONSTRAINT UQ_Administrador_Correo UNIQUE (Correo)
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
        'TarjetaCredito', 'TarjetaDebito', 'PSE', 'Transferencia', 'Efecty'
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

### 7.4 PagoCita

> Pago de cita privada. Se registra cuando el usuario completa el proceso de pago en `pago-cita.html`. Incluye la tarifa fija de la plataforma ($5.000 COP).

```sql
CREATE TABLE PagoCita (
    PagoCitaId          INT             IDENTITY(1,1) NOT NULL,
    CitaId              INT             NOT NULL,
    Monto               DECIMAL(10,2)   NOT NULL,        -- Tarifa base del profesional
    TarifaPlataforma    DECIMAL(10,2)   NOT NULL DEFAULT 5000,  -- Tarifa fija $5.000 COP
    MetodoPago          NVARCHAR(25)    NOT NULL,
    Estado              NVARCHAR(15)    NOT NULL DEFAULT 'Pendiente',
    ReferenciaPassarela NVARCHAR(200)   NULL,
    FechaPago           DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_PagoCita              PRIMARY KEY (PagoCitaId),
    CONSTRAINT FK_PagoCita_Cita         FOREIGN KEY (CitaId) REFERENCES Cita(CitaId),
    CONSTRAINT CK_PagoCita_MetodoPago   CHECK (MetodoPago IN (
        'TarjetaCredito', 'TarjetaDebito', 'PSE', 'Efecty'
    )),
    CONSTRAINT CK_PagoCita_Estado       CHECK (Estado IN ('Pendiente', 'Aprobado', 'Rechazado')),
    CONSTRAINT CK_PagoCita_Monto        CHECK (Monto > 0)
);
```

### 7.5 CuentaBancariaUsuario

> Datos bancarios obligatorios del usuario para desembolsos. Relación 1:1 con `Usuario`.

```sql
CREATE TABLE CuentaBancariaUsuario (
    CuentaBancariaUsuarioId INT             IDENTITY(1,1) NOT NULL,
    UsuarioId               INT             NOT NULL,
    Banco                   NVARCHAR(200)   NOT NULL,
    TipoCuenta              NVARCHAR(30)    NOT NULL,       -- 'Ahorros', 'Corriente'
    NumeroCuenta            NVARCHAR(50)    NOT NULL,
    Titular                 NVARCHAR(200)   NOT NULL,
    DocumentoTitular        NVARCHAR(30)    NULL,
    Estado                  NVARCHAR(20)    NOT NULL DEFAULT 'Activa',
    FechaCreacion           DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion       DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_CuentaBancariaUsuario PRIMARY KEY (CuentaBancariaUsuarioId),
    CONSTRAINT UQ_CuentaBancariaUsuario_Usuario UNIQUE (UsuarioId),
    CONSTRAINT FK_CuentaBancariaUsuario_Usuario FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    CONSTRAINT CK_CuentaBancariaUsuario_Tipo CHECK (TipoCuenta IN ('Ahorros', 'Corriente')),
    CONSTRAINT CK_CuentaBancariaUsuario_Estado CHECK (Estado IN ('Activa', 'Invalida', 'PendienteValidacion'))
);
```

### 7.6 MovimientoSaldoUsuario

> Ledger de saldo a favor y dinero en tránsito. Toda operación financiera del usuario queda trazada aquí.

**Estados (`Estado`):**

| Valor | Descripción |
|---|---|
| `SaldoFavor` | Crédito disponible en plataforma |
| `EnTransito` | Desembolso bancario en proceso (15–30 días hábiles) |
| `Desembolsado` | Transferido a cuenta bancaria |
| `Retractado` | Usuario canceló retiro dentro de 5 días hábiles |
| `Congelado` | Cuenta bancaria inválida; esperando corrección |
| `Retenido` | Retención por plataforma tras 3 meses sin actualizar cuenta |

**Tipos (`TipoMovimiento`):** `CreditoEventoCancelado`, `CreditoCitaProfesionalAusente`, `RecargaVoluntaria`, `DebitoPagoCita`, `DebitoPagoEvento`, `RetiroBancario`, `RetractacionRetiro`, `RetencionPlataforma`.

```sql
CREATE TABLE MovimientoSaldoUsuario (
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
    Estado                   NVARCHAR(20)    NOT NULL DEFAULT 'SaldoFavor',
    CuentaBancariaUsuarioId  INT             NULL,
    FechaLimiteRetractacion  DATETIME2(0)    NULL,
    FechaEstimadaDesembolso  DATETIME2(0)    NULL,
    FechaDesembolso          DATETIME2(0)    NULL,
    Notas                    NVARCHAR(500)   NULL,
    FechaCreacion            DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion        DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_MovimientoSaldoUsuario PRIMARY KEY (MovimientoSaldoUsuarioId),
    CONSTRAINT FK_MovSaldo_Usuario FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    CONSTRAINT FK_MovSaldo_Profesional FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT CK_MovSaldo_Estado CHECK (Estado IN (
        'SaldoFavor', 'EnTransito', 'Desembolsado', 'Retractado', 'Congelado', 'Retenido'
    ))
);
```

### 7.7 SaldoRecarga

> Recarga voluntaria de saldo a favor mediante pasarela de pago.

```sql
CREATE TABLE SaldoRecarga (
    SaldoRecargaId           INT             IDENTITY(1,1) NOT NULL,
    UsuarioId                INT             NOT NULL,
    Monto                    DECIMAL(12,2)   NOT NULL,
    MetodoPago               NVARCHAR(25)    NOT NULL,
    Estado                   NVARCHAR(15)    NOT NULL DEFAULT 'Pendiente',
    ReferenciaPassarela      NVARCHAR(200)   NULL,
    MovimientoSaldoUsuarioId INT             NULL,
    FechaPago                DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion        DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_SaldoRecarga PRIMARY KEY (SaldoRecargaId),
    CONSTRAINT FK_SaldoRecarga_Usuario FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    CONSTRAINT CK_SaldoRecarga_Estado CHECK (Estado IN ('Pendiente', 'Aprobado', 'Rechazado'))
);
```

### 7.8 CitaAsistencia

> Registro de ingreso a sala de videollamada. Detección de inasistencia con **5 minutos de gracia** tras `Cita.FechaHora`.

| Campo | Uso |
|---|---|
| `UsuarioIngresoSala` | Timestamp primer ingreso del usuario a la sala |
| `ProfesionalIngresoSala` | Timestamp primer ingreso del profesional |
| `ProfesionalReportoAusencia` | Reporte anticipado (hasta 5 min antes de la cita) |
| `TipoAusencia` | `Profesional`, `Usuario`, `Ambos`, `Ninguno` |

### 7.9 NovedadUsuario

> Novedades pendientes mostradas en el tab **Novedades** del Perfil Usuario.

**Estados:** `Pendiente`, `Resuelta`, `Expirada`.

**Tipos:** `EventoCancelado`, `EventoReprogramado`, `ProfesionalNoAsistio`, `ProfesionalReportoAusencia`.

### 7.10 AjusteSaldoProfesional

> Descuentos al saldo por pagar del profesional cuando un usuario recibe saldo a favor.

### 7.11 Estados ampliados

**Cita (`Estado`):** se agrega `PendienteDecisionUsuario`.

**Inscripcion (`Estado`):** se agregan `PendienteDecisionUsuario` y `ReembolsoPendiente`.

**PagoCita / PagoInscripcion (`MetodoPago`):** se agrega `SaldoFavor`.

**Configuracion (parámetros financieros):**

| Clave | Default | Descripción |
|---|---|---|
| `Financiero.ComisionRetiroPorcentaje` | 3.5 | Comisión al desembolsar a banco |
| `Financiero.DiasRetractacionRetiro` | 5 | Días hábiles para cancelar retiro |
| `Financiero.DiasDesembolsoMin` | 15 | Días hábiles mínimos en tránsito |
| `Financiero.DiasDesembolsoMax` | 30 | Días hábiles máximos en tránsito |
| `Financiero.MesesRetencionCuentaInvalida` | 3 | Meses antes de retención |
| `Financiero.MinutosGraciaInasistencia` | 5 | Minutos tras hora de cita |

> Script de migración: `Proyecto MVC/Database/48_MisSaldosUsuarioFinanciero.sql`

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
    Puntuacion      TINYINT         NULL,           -- Estrellas 1–5; NULL si el usuario comenta sin valorar
    Estado          BIT             NOT NULL DEFAULT 1,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2(0)  NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_ComentarioProfesional         PRIMARY KEY (ComentarioId),
    CONSTRAINT FK_ComentProf_Profesional        FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT FK_ComentProf_Usuario            FOREIGN KEY (UsuarioId)     REFERENCES Usuario(UsuarioId),
    CONSTRAINT CK_ComentProf_Puntuacion         CHECK (Puntuacion IS NULL OR Puntuacion BETWEEN 1 AND 5)
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

### 8.5 Conversacion

> Canal de mensajería privada entre un Usuario y un Profesional. Cada par tiene exactamente una conversación (split-panel en `mensajes-usuario.html` y `mensajes-profesional.html`).

```sql
CREATE TABLE Conversacion (
    ConversacionId  INT          IDENTITY(1,1) NOT NULL,
    UsuarioId       INT          NOT NULL,
    ProfesionalId   INT          NOT NULL,
    FechaCreacion   DATETIME2(0) NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Conversacion           PRIMARY KEY (ConversacionId),
    CONSTRAINT UQ_Conversacion_Relacion  UNIQUE (UsuarioId, ProfesionalId),
    CONSTRAINT FK_Conv_Usuario           FOREIGN KEY (UsuarioId)     REFERENCES Usuario(UsuarioId),
    CONSTRAINT FK_Conv_Profesional       FOREIGN KEY (ProfesionalId) REFERENCES Profesional(ProfesionalId)
);
```

### 8.6 MensajePrivado

> Mensaje individual dentro de una conversación privada. El profesional siempre ve el alias del usuario; nunca su nombre real.

```sql
CREATE TABLE MensajePrivado (
    MensajePrivadoId    INT             IDENTITY(1,1) NOT NULL,
    ConversacionId      INT             NOT NULL,
    AutorId             INT             NOT NULL,
    TipoAutor           NVARCHAR(15)    NOT NULL,       -- 'Usuario', 'Profesional'
    Texto               NVARCHAR(MAX)   NOT NULL,
    Leido               BIT             NOT NULL DEFAULT 0,
    FechaCreacion       DATETIME2(0)    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_MensajePrivado         PRIMARY KEY (MensajePrivadoId),
    CONSTRAINT FK_MsgPriv_Conversacion   FOREIGN KEY (ConversacionId) REFERENCES Conversacion(ConversacionId),
    CONSTRAINT CK_MsgPriv_TipoAutor      CHECK (TipoAutor IN ('Usuario', 'Profesional'))
);
```

### 8.7 ColaboracionProfesional

> Vinculación entre dos profesionales (sección **Mis Colegas**). Permite visualizar estado de conexión (En línea / En consulta / Desconectado) y gestionar derivaciones.

```sql
CREATE TABLE ColaboracionProfesional (
    ColaboracionId  INT             IDENTITY(1,1) NOT NULL,
    ProfesionalId1  INT             NOT NULL,
    ProfesionalId2  INT             NOT NULL,
    Estado          NVARCHAR(20)    NOT NULL DEFAULT 'Pendiente',  -- 'Activa', 'Pendiente', 'Inactiva'
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2(0)  NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_ColaboracionProfesional    PRIMARY KEY (ColaboracionId),
    CONSTRAINT UQ_Colaboracion_Relacion      UNIQUE (ProfesionalId1, ProfesionalId2),
    CONSTRAINT FK_Colab_Prof1                FOREIGN KEY (ProfesionalId1) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT FK_Colab_Prof2                FOREIGN KEY (ProfesionalId2) REFERENCES Profesional(ProfesionalId),
    CONSTRAINT CK_Colab_Estado               CHECK (Estado IN ('Activa', 'Pendiente', 'Inactiva')),
    CONSTRAINT CK_Colab_DiferenteProfesional CHECK (ProfesionalId1 <> ProfesionalId2)
);
```

### 8.8 Notificacion

> Notificaciones del sistema para el Administrador. Generadas automáticamente al registrarse un nuevo profesional; también soporta alertas de sistema.

```sql
CREATE TABLE Notificacion (
    NotificacionId  INT             IDENTITY(1,1) NOT NULL,
    Tipo            NVARCHAR(30)    NOT NULL,       -- 'RegistroProfesional', 'Sistema'
    EntidadId       INT             NULL,           -- ProfesionalId si Tipo = 'RegistroProfesional'
    Titulo          NVARCHAR(300)   NOT NULL,
    Descripcion     NVARCHAR(MAX)   NULL,
    Estado          NVARCHAR(15)    NOT NULL DEFAULT 'Pendiente',  -- 'Pendiente', 'Aprobada', 'Rechazada', 'Leida'
    Leida           BIT             NOT NULL DEFAULT 0,
    FechaCreacion   DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2(0)  NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Notificacion  PRIMARY KEY (NotificacionId),
    CONSTRAINT CK_Notif_Tipo    CHECK (Tipo IN ('RegistroProfesional', 'Sistema')),
    CONSTRAINT CK_Notif_Estado  CHECK (Estado IN ('Pendiente', 'Aprobada', 'Rechazada', 'Leida'))
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
    CONSTRAINT CK_Sesion_Tipo   CHECK (TipoEntidad IN ('Usuario', 'Profesional', 'Admin')),
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
    ('ProfesionalDestacadoId',  '0',      'ID del profesional destacado en el ticker del Landing Page'),
    ('TarifaFijaCita',          '5000',   'Tarifa fija en COP cobrada por la plataforma en cada pago de cita privada'),
    ('ComisionPlataforma',      '15',     'Porcentaje de comisión retenido por la plataforma sobre pagos de eventos'),
    ('PaginacionDefault',       '10',     'Número de registros por página en listados'),
    ('TokenValidacionHoras',    '1',      'Horas de vigencia del token de validación de usuario'),
    ('TokenActivacionHoras',    '24',     'Horas de vigencia del token de activación de profesional'),
    ('TokenRecuperacionHoras',  '1',      'Horas de vigencia del token de recuperación de contraseña'),
    ('CorreoAdministrador',     '',       'Correo del administrador para recibir solicitudes de profesionales'),
    ('TamanioMaximoPdfMB',      '5',      'Tamaño máximo permitido para archivos PDF en MB');
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

-- Mensajería privada
CREATE INDEX IX_Conversacion_UsuarioId       ON Conversacion(UsuarioId);
CREATE INDEX IX_Conversacion_ProfesionalId   ON Conversacion(ProfesionalId);
CREATE INDEX IX_MensajePrivado_Conversacion  ON MensajePrivado(ConversacionId);
CREATE INDEX IX_MensajePrivado_Leido         ON MensajePrivado(Leido);

-- Colaboración entre profesionales
CREATE INDEX IX_Colaboracion_Prof1   ON ColaboracionProfesional(ProfesionalId1);
CREATE INDEX IX_Colaboracion_Prof2   ON ColaboracionProfesional(ProfesionalId2);
CREATE INDEX IX_Colaboracion_Estado  ON ColaboracionProfesional(Estado);

-- PagoCita
CREATE INDEX IX_PagoCita_CitaId  ON PagoCita(CitaId);
CREATE INDEX IX_PagoCita_Estado  ON PagoCita(Estado);

-- Notificaciones
CREATE INDEX IX_Notificacion_Estado ON Notificacion(Estado);
CREATE INDEX IX_Notificacion_Leida  ON Notificacion(Leida);
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

### 12.6 vw_DirectorioProfesionales

> Directorio completo de profesionales activos con métricas de popularidad y calificación. Usada en **Especialistas**, **Psícologos** y **Mis Mentores**.

```sql
CREATE VIEW vw_DirectorioProfesionales AS
SELECT
    p.ProfesionalId,
    p.NombreCompleto,
    ISNULL(p.Alias, p.NombreCompleto)   AS NombreVisible,
    p.FotoPerfil,
    p.AnosExperiencia,
    p.ValorPorHora,
    p.SobreMi,
    ci.Nombre                           AS Ciudad,
    pa.Nombre                           AS Pais,
    p.Estado,
    (
        SELECT COUNT(*) FROM Seguidor s
        WHERE s.ProfesionalId = p.ProfesionalId
    )                                   AS TotalSeguidores,
    (
        SELECT AVG(CAST(c.Puntuacion AS FLOAT))
        FROM ComentarioProfesional c
        WHERE c.ProfesionalId = p.ProfesionalId
          AND c.Puntuacion IS NOT NULL
          AND c.Estado = 1
    )                                   AS PromedioCalificacion,
    (
        SELECT COUNT(*)
        FROM ComentarioProfesional c
        WHERE c.ProfesionalId = p.ProfesionalId
          AND c.Puntuacion IS NOT NULL
          AND c.Estado = 1
    )                                   AS TotalCalificaciones
FROM Profesional p
LEFT JOIN Ciudad ci ON ci.CiudadId = p.CiudadId
LEFT JOIN Pais   pa ON pa.PaisId   = p.PaisId
WHERE p.Estado = 'ACTIVO';
```

### 12.7 vw_CalificacionResumenProfesional

> Resumen estadístico de calificaciones por profesional. Usada en la pestaña **Comentarios** del perfil orador para mostrar el score y las barras de distribución.

```sql
CREATE VIEW vw_CalificacionResumenProfesional AS
SELECT
    p.ProfesionalId,
    COUNT(c.ComentarioId)                               AS TotalCalificaciones,
    ROUND(AVG(CAST(c.Puntuacion AS FLOAT)), 1)          AS Promedio,
    SUM(CASE WHEN c.Puntuacion = 5 THEN 1 ELSE 0 END)  AS Estrellas5,
    SUM(CASE WHEN c.Puntuacion = 4 THEN 1 ELSE 0 END)  AS Estrellas4,
    SUM(CASE WHEN c.Puntuacion = 3 THEN 1 ELSE 0 END)  AS Estrellas3,
    SUM(CASE WHEN c.Puntuacion = 2 THEN 1 ELSE 0 END)  AS Estrellas2,
    SUM(CASE WHEN c.Puntuacion = 1 THEN 1 ELSE 0 END)  AS Estrellas1
FROM Profesional p
LEFT JOIN ComentarioProfesional c
    ON  c.ProfesionalId = p.ProfesionalId
    AND c.Puntuacion IS NOT NULL
    AND c.Estado = 1
GROUP BY p.ProfesionalId;
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

    -- Buscar en Administradores
    SELECT @EntidadId = AdministradorId
    FROM Administrador
    WHERE Correo       = @Correo
      AND PasswordHash = @PasswordHash
      AND Estado       = 1;

    IF @EntidadId IS NOT NULL
    BEGIN
        SET @TipoEntidad = 'Admin';
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

### 13.13 sp_EnviarMensajePrivado

```sql
CREATE PROCEDURE sp_EnviarMensajePrivado
    @AutorId        INT,
    @TipoAutor      NVARCHAR(15),   -- 'Usuario', 'Profesional'
    @DestinoId      INT,
    @Texto          NVARCHAR(MAX),
    @MensajeId      INT OUTPUT,
    @Resultado      NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ConversacionId INT;
    DECLARE @UsuarioId      INT;
    DECLARE @ProfesionalId  INT;

    IF @TipoAutor = 'Usuario'
    BEGIN
        SET @UsuarioId     = @AutorId;
        SET @ProfesionalId = @DestinoId;
    END
    ELSE
    BEGIN
        SET @UsuarioId     = @DestinoId;
        SET @ProfesionalId = @AutorId;
    END

    -- Obtener o crear la conversación
    SELECT @ConversacionId = ConversacionId
    FROM Conversacion
    WHERE UsuarioId = @UsuarioId AND ProfesionalId = @ProfesionalId;

    BEGIN TRANSACTION;
    BEGIN TRY
        IF @ConversacionId IS NULL
        BEGIN
            INSERT INTO Conversacion (UsuarioId, ProfesionalId)
            VALUES (@UsuarioId, @ProfesionalId);
            SET @ConversacionId = SCOPE_IDENTITY();
        END

        INSERT INTO MensajePrivado (ConversacionId, AutorId, TipoAutor, Texto)
        VALUES (@ConversacionId, @AutorId, @TipoAutor, @Texto);

        SET @MensajeId = SCOPE_IDENTITY();
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

### 13.14 sp_ObtenerDirectorioProfesionales

```sql
CREATE PROCEDURE sp_ObtenerDirectorioProfesionales
    @Busqueda           NVARCHAR(200)   = NULL,
    @CiudadId           INT             = NULL,
    @EspecialidadId     INT             = NULL,
    @OrdenPor           NVARCHAR(20)    = 'Popular',  -- 'Popular', 'AZ', 'Reciente', 'Tarifa'
    @Pagina             INT             = 1,
    @RegistrosPorPagina INT             = 10
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Pagina - 1) * @RegistrosPorPagina;

    SELECT
        d.ProfesionalId,
        d.NombreVisible,
        d.FotoPerfil,
        d.AnosExperiencia,
        d.ValorPorHora,
        d.SobreMi,
        d.Ciudad,
        d.Pais,
        d.TotalSeguidores,
        d.PromedioCalificacion,
        d.TotalCalificaciones,
        STRING_AGG(e.Nombre, ', ')  AS Especialidades
    FROM vw_DirectorioProfesionales d
    LEFT JOIN ProfesionalEspecialidad pe ON pe.ProfesionalId = d.ProfesionalId
    LEFT JOIN Especialidad e             ON e.EspecialidadId  = pe.EspecialidadId
    WHERE
        (@Busqueda IS NULL OR
             d.NombreVisible LIKE '%' + @Busqueda + '%' OR
             d.SobreMi       LIKE '%' + @Busqueda + '%')
        AND (@CiudadId      IS NULL OR d.ProfesionalId IN (
            SELECT ProfesionalId FROM Profesional WHERE CiudadId = @CiudadId))
        AND (@EspecialidadId IS NULL OR d.ProfesionalId IN (
            SELECT ProfesionalId FROM ProfesionalEspecialidad WHERE EspecialidadId = @EspecialidadId))
    GROUP BY
        d.ProfesionalId, d.NombreVisible, d.FotoPerfil,
        d.AnosExperiencia, d.ValorPorHora, d.SobreMi,
        d.Ciudad, d.Pais, d.TotalSeguidores,
        d.PromedioCalificacion, d.TotalCalificaciones
    ORDER BY
        CASE WHEN @OrdenPor = 'Popular'  THEN d.TotalSeguidores    END DESC,
        CASE WHEN @OrdenPor = 'AZ'       THEN d.NombreVisible       END ASC,
        CASE WHEN @OrdenPor = 'Tarifa'   THEN d.ValorPorHora        END ASC,
        CASE WHEN @OrdenPor = 'Reciente' THEN d.ProfesionalId       END DESC
    OFFSET @Offset ROWS FETCH NEXT @RegistrosPorPagina ROWS ONLY;
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

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

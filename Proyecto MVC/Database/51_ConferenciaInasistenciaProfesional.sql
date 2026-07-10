-- Conferencia: ingreso ponente/asistente, gracia 5 min, novedad por inasistencia del profesional
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

IF OBJECT_ID(N'dbo.SalaConferenciaPresencia', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SalaConferenciaPresencia (
        SalaId                      INT             NOT NULL,
        ProfesionalIngresoConferencia DATETIME2(0)  NULL,
        FechaCreacion               DATETIME2(0)    NOT NULL CONSTRAINT DF_SalaConfPres_FechaCreacion DEFAULT GETDATE(),
        FechaModificacion           DATETIME2(0)    NULL,
        CONSTRAINT PK_SalaConferenciaPresencia PRIMARY KEY (SalaId),
        CONSTRAINT FK_SalaConferenciaPresencia_Sala
            FOREIGN KEY (SalaId) REFERENCES dbo.Sala(SalaId)
    );
END
GO

IF OBJECT_ID(N'dbo.InscripcionConferenciaPresencia', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.InscripcionConferenciaPresencia (
        InscripcionId               INT             NOT NULL,
        UsuarioIngresoConferencia   DATETIME2(0)    NULL,
        FechaCreacion               DATETIME2(0)    NOT NULL CONSTRAINT DF_InscConfPres_FechaCreacion DEFAULT GETDATE(),
        FechaModificacion           DATETIME2(0)    NULL,
        CONSTRAINT PK_InscripcionConferenciaPresencia PRIMARY KEY (InscripcionId),
        CONSTRAINT FK_InscripcionConferenciaPresencia_Inscripcion
            FOREIGN KEY (InscripcionId) REFERENCES dbo.Inscripcion(InscripcionId)
    );
END
GO

-- Chat deshabilitado explícito al crear sala pública
CREATE OR ALTER PROCEDURE dbo.sp_CrearSala
    @ProfesionalId     INT,
    @Nombre            NVARCHAR(300),
    @Descripcion       NVARCHAR(MAX) = NULL,
    @Tipo              NVARCHAR(10)  = N'Publica',
    @CategoriaId       INT           = NULL,
    @CupoMaximo        INT,
    @FechaInicio       DATETIME2(0)  = NULL,
    @DuracionMinutos   INT           = NULL,
    @Precio            DECIMAL(10,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @NuevoId INT;
    DECLARE @Inicio  DATETIME2(0) = ISNULL(@FechaInicio, GETDATE());
    DECLARE @Duracion INT = ISNULL(NULLIF(@DuracionMinutos, 0), 120);
    DECLARE @Fin     DATETIME2(0) = DATEADD(MINUTE, @Duracion, @Inicio);
    DECLARE @PrecioSala DECIMAL(10,2) = ISNULL(@Precio, 0);

    IF @Duracion < 15 OR @Duracion > 480
    BEGIN
        SELECT 0 AS Exito, N'La duración debe estar entre 15 y 480 minutos.' AS Mensaje, 0 AS Id;
        RETURN;
    END

    IF @Fin <= @Inicio
    BEGIN
        SELECT 0 AS Exito, N'La fecha de fin debe ser posterior al inicio.' AS Mensaje, 0 AS Id;
        RETURN;
    END

    IF @Tipo NOT IN (N'Publica', N'Privada')
        SET @Tipo = N'Publica';

    INSERT INTO Sala (ProfesionalId, CategoriaId, Nombre, Descripcion, Tipo, CupoMaximo, Precio, ChatHabilitado, FechaCreacion)
    VALUES (@ProfesionalId, @CategoriaId, @Nombre, @Descripcion, @Tipo, @CupoMaximo, @PrecioSala, 0, GETDATE());

    SET @NuevoId = SCOPE_IDENTITY();

    INSERT INTO Evento (SalaId, Nombre, Descripcion, FechaInicio, FechaFin, Estado)
    VALUES (@NuevoId, @Nombre, @Descripcion, @Inicio, @Fin, N'Abierto');

    SELECT 1 AS Exito, N'Sala creada.' AS Mensaje, @NuevoId AS Id;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_ObtenerConferenciaAsistente
    @SalaId                  INT,
    @UsuarioId               INT = NULL,
    @ProfesionalInscriptorId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @UsuarioId IS NULL AND @ProfesionalInscriptorId IS NULL
        RETURN;

    IF NOT EXISTS (
        SELECT 1 FROM Inscripcion i
        WHERE  i.SalaId = @SalaId
          AND  i.Estado NOT IN (N'Cancelada')
          AND  (
                   (@UsuarioId IS NOT NULL AND i.UsuarioId = @UsuarioId)
                OR (@ProfesionalInscriptorId IS NOT NULL AND i.ProfesionalInscriptorId = @ProfesionalInscriptorId)
               ))
        RETURN;

    SELECT s.SalaId,
           s.ProfesionalId,
           s.Nombre AS Titulo,
           s.Descripcion,
           c.Nombre AS Categoria,
           s.Estado,
           s.CupoMaximo AS Capacidad,
           s.ChatHabilitado,
           s.Precio,
           (SELECT COUNT(*)
            FROM   Inscripcion i
            WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')) AS TotalInscritos,
           ev.FechaInicio,
           ev.FechaFin,
           p.NombreCompleto AS NombreProfesional,
           COALESCE(u.Alias, pr.Alias, u.NombreCompleto, pr.NombreCompleto, N'Participante') AS AliasParticipante,
           ins.InscripcionId,
           CASE WHEN scp.ProfesionalIngresoConferencia IS NOT NULL THEN 1 ELSE 0 END AS ProfesionalPresente,
           CASE WHEN EXISTS (
               SELECT 1 FROM PagoInscripcion pi
               WHERE pi.InscripcionId = ins.InscripcionId AND pi.Estado = N'Aprobado'
           ) THEN 1 ELSE 0 END AS TienePagoAprobado
    FROM   Sala s
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    LEFT JOIN SalaConferenciaPresencia scp ON scp.SalaId = s.SalaId
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId
        ORDER  BY e.FechaInicio DESC
    ) ev
    OUTER APPLY (
        SELECT TOP 1 i.InscripcionId, i.UsuarioId, i.ProfesionalInscriptorId
        FROM   Inscripcion i
        WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')
          AND  (
                   (@UsuarioId IS NOT NULL AND i.UsuarioId = @UsuarioId)
                OR (@ProfesionalInscriptorId IS NOT NULL AND i.ProfesionalInscriptorId = @ProfesionalInscriptorId)
               )
    ) ins
    LEFT JOIN Usuario u ON u.UsuarioId = ins.UsuarioId
    LEFT JOIN Profesional pr ON pr.ProfesionalId = ins.ProfesionalInscriptorId
    WHERE  s.SalaId = @SalaId
      AND  s.Tipo = N'Publica'
      AND  s.Estado = N'Abierta';
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_RegistrarIngresoConferencia
    @SalaId            INT,
    @TipoParticipante  NVARCHAR(15),
    @ParticipanteId    INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @TipoParticipante NOT IN (N'Usuario', N'Profesional')
    BEGIN
        SELECT 0 AS Exito, N'Tipo de participante no válido.' AS Mensaje;
        RETURN;
    END

    IF @TipoParticipante = N'Profesional'
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM Sala WHERE SalaId = @SalaId AND ProfesionalId = @ParticipanteId)
        BEGIN SELECT 0 AS Exito, N'No autorizado.' AS Mensaje; RETURN; END

        IF NOT EXISTS (SELECT 1 FROM SalaConferenciaPresencia WHERE SalaId = @SalaId)
            INSERT INTO SalaConferenciaPresencia (SalaId, ProfesionalIngresoConferencia)
            VALUES (@SalaId, GETDATE());
        ELSE
            UPDATE SalaConferenciaPresencia
            SET    ProfesionalIngresoConferencia = COALESCE(ProfesionalIngresoConferencia, GETDATE()),
                   FechaModificacion = GETDATE()
            WHERE  SalaId = @SalaId;

        SELECT 1 AS Exito, N'Ingreso del profesional registrado.' AS Mensaje;
        RETURN;
    END

    DECLARE @InscripcionId INT;
    SELECT TOP 1 @InscripcionId = i.InscripcionId
    FROM   Inscripcion i
    WHERE  i.SalaId = @SalaId AND i.UsuarioId = @ParticipanteId
      AND  i.Estado NOT IN (N'Cancelada');

    IF @InscripcionId IS NULL
    BEGIN SELECT 0 AS Exito, N'Inscripción no encontrada.' AS Mensaje; RETURN; END

    IF NOT EXISTS (SELECT 1 FROM InscripcionConferenciaPresencia WHERE InscripcionId = @InscripcionId)
        INSERT INTO InscripcionConferenciaPresencia (InscripcionId, UsuarioIngresoConferencia)
        VALUES (@InscripcionId, GETDATE());
    ELSE
        UPDATE InscripcionConferenciaPresencia
        SET    UsuarioIngresoConferencia = COALESCE(UsuarioIngresoConferencia, GETDATE()),
               FechaModificacion = GETDATE()
        WHERE  InscripcionId = @InscripcionId;

    SELECT 1 AS Exito, N'Ingreso del asistente registrado.' AS Mensaje;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_ConsultarPresenciaProfesionalConferencia
    @SalaId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CASE WHEN scp.ProfesionalIngresoConferencia IS NOT NULL THEN 1 ELSE 0 END AS ProfesionalPresente,
           scp.ProfesionalIngresoConferencia
    FROM   Sala s
    LEFT JOIN SalaConferenciaPresencia scp ON scp.SalaId = s.SalaId
    WHERE  s.SalaId = @SalaId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_EvaluarInasistenciaConferencia
    @SalaId    INT,
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @InscripcionId INT, @ProfesionalId INT;
    DECLARE @FechaInicio DATETIME2(0);
    DECLARE @ProfesionalIngreso DATETIME2(0), @UsuarioIngreso DATETIME2(0);
    DECLARE @TienePago BIT = 0;

    SELECT TOP 1 @InscripcionId = i.InscripcionId, @ProfesionalId = s.ProfesionalId
    FROM   Inscripcion i
    JOIN   Sala s ON s.SalaId = i.SalaId
    WHERE  i.SalaId = @SalaId AND i.UsuarioId = @UsuarioId
      AND  i.Estado NOT IN (N'Cancelada');

    IF @InscripcionId IS NULL
    BEGIN SELECT 0 AS RequiereModal, NULL AS NovedadUsuarioId, 0 AS ProfesionalPresente; RETURN; END

    SELECT TOP 1 @FechaInicio = e.FechaInicio
    FROM   Evento e WHERE e.SalaId = @SalaId ORDER BY e.FechaInicio DESC;

    SELECT @ProfesionalIngreso = scp.ProfesionalIngresoConferencia
    FROM   SalaConferenciaPresencia scp WHERE scp.SalaId = @SalaId;

    SELECT @UsuarioIngreso = icp.UsuarioIngresoConferencia
    FROM   InscripcionConferenciaPresencia icp WHERE icp.InscripcionId = @InscripcionId;

    IF @ProfesionalIngreso IS NOT NULL
    BEGIN SELECT 0 AS RequiereModal, NULL AS NovedadUsuarioId, 1 AS ProfesionalPresente; RETURN; END

    IF EXISTS (
        SELECT 1 FROM NovedadUsuario n
        WHERE n.UsuarioId = @UsuarioId AND n.EntidadTipo = N'Inscripcion'
          AND n.EntidadId = @InscripcionId AND n.Estado = N'Pendiente'
          AND n.TipoNovedad = N'ProfesionalNoIngresoEvento')
    BEGIN
        SELECT TOP 1 1 AS RequiereModal, n.NovedadUsuarioId, 0 AS ProfesionalPresente
        FROM   NovedadUsuario n
        WHERE  n.UsuarioId = @UsuarioId AND n.EntidadId = @InscripcionId
          AND  n.Estado = N'Pendiente' AND n.TipoNovedad = N'ProfesionalNoIngresoEvento'
        ORDER  BY n.FechaCreacion DESC;
        RETURN;
    END

    DECLARE @MinGracia INT = TRY_CAST((
        SELECT Valor FROM Configuracion WHERE Clave = N'Financiero.MinutosGraciaInasistencia') AS INT);
    IF @MinGracia IS NULL SET @MinGracia = 5;

    IF @FechaInicio IS NULL OR GETDATE() < DATEADD(MINUTE, @MinGracia, @FechaInicio)
    BEGIN SELECT 0 AS RequiereModal, NULL AS NovedadUsuarioId, 0 AS ProfesionalPresente; RETURN; END

    IF @UsuarioIngreso IS NULL
    BEGIN SELECT 0 AS RequiereModal, NULL AS NovedadUsuarioId, 0 AS ProfesionalPresente; RETURN; END

    IF EXISTS (
        SELECT 1 FROM PagoInscripcion pi
        WHERE pi.InscripcionId = @InscripcionId AND pi.Estado = N'Aprobado')
        SET @TienePago = 1;

    UPDATE Inscripcion
    SET    Estado = N'PendienteDecisionUsuario', FechaModificacion = GETDATE()
    WHERE  InscripcionId = @InscripcionId AND @TienePago = 1;

    DECLARE @NovedadId INT;
    INSERT INTO NovedadUsuario (UsuarioId, TipoNovedad, EntidadTipo, EntidadId, Titulo, Mensaje, Estado)
    VALUES (
        @UsuarioId, N'ProfesionalNoIngresoEvento', N'Inscripcion', @InscripcionId,
        N'El ponente no ha ingresado al evento',
        N'Pasaron ' + CAST(@MinGracia AS NVARCHAR(10)) + N' minutos y el profesional no ingresó a la conferencia. Elige cómo deseas continuar.',
        N'Pendiente');
    SET @NovedadId = SCOPE_IDENTITY();

    SELECT 1 AS RequiereModal, @NovedadId AS NovedadUsuarioId, 0 AS ProfesionalPresente;
END
GO

-- Ampliar resolver novedad: opciones en vivo de conferencia
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
                END
                ELSE IF @OpcionElegida = N'RetirarDinero'
                BEGIN
                    DECLARE @MontoEvLive DECIMAL(12,2);
                    DECLARE @PagoInscLive INT;
                    SELECT TOP 1 @MontoEvLive = pi.Monto, @PagoInscLive = pi.PagoId
                    FROM   PagoInscripcion pi
                    WHERE  pi.InscripcionId = @EntidadId AND pi.Estado = N'Aprobado'
                    ORDER  BY pi.FechaPago DESC;

                    IF @MontoEvLive IS NULL BEGIN ROLLBACK; SELECT 0 AS Exito, N'No hay pago aprobado para devolver.' AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId; RETURN; END

                    EXEC dbo.sp_CreditarSaldoFavorUsuario
                        @UsuarioId, @ProfesionalId, @MontoEvLive,
                        N'CreditoEventoProfesionalAusente', N'EventoProfesionalAusente',
                        N'Devolución por inasistencia del profesional al evento en vivo.',
                        NULL, @EntidadId, NULL, @PagoInscLive;

                    UPDATE Inscripcion SET Estado = N'Cancelada', FechaModificacion = GETDATE()
                    WHERE  InscripcionId = @EntidadId;
                    SET @RedirectUrl = N'/PerfilUsuario?tab=saldos';
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
        SELECT 1 AS Exito, N'Novedad resuelta correctamente.' AS Mensaje, @RedirectUrl AS RedirectUrl, @ProfesionalId AS ProfesionalId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje, NULL AS RedirectUrl, NULL AS ProfesionalId;
    END CATCH
END
GO

PRINT N'51_ConferenciaInasistenciaProfesional — aplicado.';
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_NovedadUsuario_Tipo')
    ALTER TABLE dbo.NovedadUsuario DROP CONSTRAINT CK_NovedadUsuario_Tipo;
GO
ALTER TABLE dbo.NovedadUsuario ADD CONSTRAINT CK_NovedadUsuario_Tipo CHECK (TipoNovedad IN (
    N'EventoCancelado',
    N'EventoReprogramado',
    N'ProfesionalNoAsistio',
    N'ProfesionalReportoAusencia',
    N'ProfesionalNoIngresoEvento'
));
GO

PRINT N'CK_NovedadUsuario_Tipo ampliado con ProfesionalNoIngresoEvento.';
GO

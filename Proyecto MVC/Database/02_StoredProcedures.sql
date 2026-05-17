-- ============================================================
-- TrebolDB — Stored Procedures
-- Prefijo: sp_[Accion][Entidad]
-- ============================================================

USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

-- ============================================================
-- AUTH / LOGIN
-- ============================================================

CREATE OR ALTER PROCEDURE sp_ValidarLogin
    @Correo NVARCHAR(254)
AS
BEGIN
    SET NOCOUNT ON;

    -- Busca en Usuario
    IF EXISTS (SELECT 1 FROM Usuario WHERE Correo = @Correo)
    BEGIN
        SELECT UsuarioId AS EntidadId, NombreCompleto, Correo, PasswordHash, Estado,
               FotoPerfil AS FotoUrl, 'Usuario' AS TipoEntidad
        FROM   Usuario WHERE Correo = @Correo;
        RETURN;
    END

    -- Busca en Profesional
    IF EXISTS (SELECT 1 FROM Profesional WHERE Correo = @Correo)
    BEGIN
        SELECT ProfesionalId AS EntidadId, NombreCompleto, Correo, PasswordHash, Estado,
               FotoPerfil AS FotoUrl, 'Profesional' AS TipoEntidad
        FROM   Profesional WHERE Correo = @Correo;
        RETURN;
    END

    -- Busca en Administrador
    IF EXISTS (SELECT 1 FROM Administrador WHERE Correo = @Correo)
    BEGIN
        SELECT AdministradorId AS EntidadId, NombreCompleto, Correo, PasswordHash,
               CASE Estado WHEN 1 THEN 'ACTIVO' ELSE 'BLOQUEADO' END AS Estado,
               NULL AS FotoUrl, 'Admin' AS TipoEntidad
        FROM   Administrador WHERE Correo = @Correo;
        RETURN;
    END
END
GO

CREATE OR ALTER PROCEDURE sp_SolicitarRecuperacion
    @Correo  NVARCHAR(200),
    @Token   NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EntidadId   INT;
    DECLARE @TipoEntidad NVARCHAR(15);
    DECLARE @Expiracion  DATETIME2(0) = DATEADD(HOUR, 2, GETDATE());

    -- Buscar entidad por correo
    IF EXISTS (SELECT 1 FROM Usuario WHERE Correo = @Correo)
    BEGIN
        SELECT @EntidadId = UsuarioId, @TipoEntidad = 'Usuario'
        FROM   Usuario WHERE Correo = @Correo;
    END
    ELSE IF EXISTS (SELECT 1 FROM Profesional WHERE Correo = @Correo)
    BEGIN
        SELECT @EntidadId = ProfesionalId, @TipoEntidad = 'Profesional'
        FROM   Profesional WHERE Correo = @Correo;
    END
    ELSE IF EXISTS (SELECT 1 FROM Administrador WHERE Correo = @Correo)
    BEGIN
        SELECT @EntidadId = AdministradorId, @TipoEntidad = 'Admin'
        FROM   Administrador WHERE Correo = @Correo;
    END

    -- Si no existe, retornar OK igual (prevenir enumeración de usuarios)
    IF @EntidadId IS NULL
    BEGIN
        SELECT 1 AS Exito, 'Si el correo existe, recibirás el enlace.' AS Mensaje;
        RETURN;
    END

    -- Invalida tokens anteriores del mismo usuario
    UPDATE TokenRecuperacion SET Usado = 1
    WHERE  EntidadId = @EntidadId AND TipoEntidad = @TipoEntidad AND Usado = 0;

    INSERT INTO TokenRecuperacion (EntidadId, TipoEntidad, Token, FechaExpiracion)
    VALUES (@EntidadId, @TipoEntidad, @Token, @Expiracion);

    SELECT 1 AS Exito, 'Si el correo existe, recibirás el enlace.' AS Mensaje;
END
GO

CREATE OR ALTER PROCEDURE sp_RestablecerPassword
    @Token        NVARCHAR(500),
    @PasswordHash NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @EntidadId   INT;
    DECLARE @TipoEntidad NVARCHAR(15);

    SELECT @EntidadId = EntidadId, @TipoEntidad = TipoEntidad
    FROM   TokenRecuperacion
    WHERE  Token = @Token AND Usado = 0 AND FechaExpiracion > GETDATE();

    IF @EntidadId IS NULL
    BEGIN
        SELECT 0 AS Exito, 'Token inválido o expirado.' AS Mensaje;
        RETURN;
    END

    IF @TipoEntidad = 'Usuario'
        UPDATE Usuario SET PasswordHash = @PasswordHash, FechaModificacion = GETDATE()
        WHERE  UsuarioId = @EntidadId;
    ELSE IF @TipoEntidad = 'Profesional'
        UPDATE Profesional SET PasswordHash = @PasswordHash, FechaModificacion = GETDATE()
        WHERE  ProfesionalId = @EntidadId;

    UPDATE TokenRecuperacion SET Usado = 1 WHERE Token = @Token;
    SELECT 1 AS Exito, 'Contraseña restablecida.' AS Mensaje;
END
GO

-- ============================================================
-- REGISTRO USUARIO
-- ============================================================

CREATE OR ALTER PROCEDURE sp_RegistrarUsuario
    @NombreCompleto  NVARCHAR(200),
    @Correo          NVARCHAR(254),
    @NumeroDocumento NVARCHAR(30),
    @Alias           NVARCHAR(100),
    @Celular         NVARCHAR(20)    = NULL,
    @FechaNacimiento DATE            = NULL,
    @CiudadId        INT             = NULL,
    @Token           NVARCHAR(500),
    @Expiracion      DATETIME2(0)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Usuario WHERE Correo = @Correo)
    BEGIN SELECT 0 AS Exito, 'El correo ya está registrado.' AS Mensaje, 0 AS Id; RETURN; END

    IF EXISTS (SELECT 1 FROM Usuario WHERE NumeroDocumento = @NumeroDocumento)
    BEGIN SELECT 0 AS Exito, 'El documento ya está registrado.' AS Mensaje, 0 AS Id; RETURN; END

    DECLARE @NuevoId INT;
    INSERT INTO Usuario (NombreCompleto, Correo, NumeroDocumento, Alias, Celular, FechaNacimiento, CiudadId)
    VALUES (@NombreCompleto, @Correo, @NumeroDocumento, @Alias, @Celular, @FechaNacimiento, @CiudadId);
    SET @NuevoId = SCOPE_IDENTITY();

    INSERT INTO TokenValidacion (UsuarioId, Token, FechaExpiracion)
    VALUES (@NuevoId, @Token, @Expiracion);

    SELECT 1 AS Exito, 'Registro exitoso.' AS Mensaje, @NuevoId AS Id;
END
GO

CREATE OR ALTER PROCEDURE sp_ActivarUsuario
    @Token        NVARCHAR(500),
    @PasswordHash NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @UsuarioId INT;

    SELECT @UsuarioId = UsuarioId FROM TokenValidacion
    WHERE  Token = @Token AND Usado = 0 AND FechaExpiracion > GETDATE();

    IF @UsuarioId IS NULL
    BEGIN SELECT 0 AS Exito, 'Token inválido o expirado.'; RETURN; END

    UPDATE Usuario SET PasswordHash = @PasswordHash, Estado = 'ACTIVO', FechaModificacion = GETDATE()
    WHERE  UsuarioId = @UsuarioId;

    UPDATE TokenValidacion SET Usado = 1 WHERE Token = @Token;
    SELECT 1 AS Exito, 'Cuenta activada correctamente.';
END
GO

-- ============================================================
-- REGISTRO PROFESIONAL
-- ============================================================

CREATE OR ALTER PROCEDURE sp_RegistrarProfesional
    @NombreCompleto           NVARCHAR(200),
    @Correo                   NVARCHAR(254),
    @NumeroDocumento          NVARCHAR(30),
    @Alias                    NVARCHAR(100),
    @Celular                  NVARCHAR(20)   = NULL,
    @NumerTarjetaProfesional  NVARCHAR(50),
    @UrlDocumentoIdentidad    NVARCHAR(500)  = NULL,
    @UrlTarjetaProfesional    NVARCHAR(500)  = NULL,
    @CiudadId                 INT            = NULL,
    @Token                    NVARCHAR(500),
    @Expiracion               DATETIME2(0)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Profesional WHERE Correo = @Correo)
    BEGIN SELECT 0 AS Exito, 'El correo ya está registrado.' AS Mensaje, 0 AS Id; RETURN; END

    IF EXISTS (SELECT 1 FROM Profesional WHERE NumeroDocumento = @NumeroDocumento)
    BEGIN SELECT 0 AS Exito, 'El documento ya está registrado.' AS Mensaje, 0 AS Id; RETURN; END

    IF EXISTS (SELECT 1 FROM Profesional WHERE NumerTarjetaProfesional = @NumerTarjetaProfesional)
    BEGIN SELECT 0 AS Exito, 'La tarjeta profesional ya está registrada.' AS Mensaje, 0 AS Id; RETURN; END

    DECLARE @NuevoId INT;
    INSERT INTO Profesional (NombreCompleto, Correo, NumeroDocumento, Alias, Celular, NumerTarjetaProfesional,
                             UrlDocumentoIdentidad, UrlTarjetaProfesional, CiudadId)
    VALUES (@NombreCompleto, @Correo, @NumeroDocumento, @Alias, @Celular, @NumerTarjetaProfesional,
            @UrlDocumentoIdentidad, @UrlTarjetaProfesional, @CiudadId);
    SET @NuevoId = SCOPE_IDENTITY();

    -- Token de confirmación de correo (el profesional hace clic en el enlace para confirmar)
    INSERT INTO TokenActivacion (ProfesionalId, Token, FechaExpiracion, Correo)
    VALUES (@NuevoId, @Token, @Expiracion, @Correo);

    -- Notificación admin (estado = PENDIENTE_VALIDACION; aún no puede aprobar)
    INSERT INTO Notificacion (Tipo, EntidadId, Titulo, Descripcion)
    VALUES ('RegistroProfesional', @NuevoId,
            'Nuevo profesional — pendiente de validación de correo',
            'Profesional: ' + @NombreCompleto + ' | Correo: ' + @Correo);

    SELECT 1 AS Exito, 'Registro exitoso. Revisa tu correo para confirmar tu cuenta.' AS Mensaje, @NuevoId AS Id;
END
GO

CREATE OR ALTER PROCEDURE sp_ConfirmarEmailProfesional
    @Token        NVARCHAR(500),
    @PasswordHash NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ProfesionalId INT;

    SELECT @ProfesionalId = ta.ProfesionalId
    FROM   TokenActivacion ta
    WHERE  ta.Token = @Token AND ta.Usado = 0 AND ta.FechaExpiracion > GETDATE();

    IF @ProfesionalId IS NULL
    BEGIN SELECT 0 AS Exito, 'El enlace de confirmación es inválido o ha expirado.'; RETURN; END

    -- Verifica que el profesional aún esté en PENDIENTE_VALIDACION
    IF NOT EXISTS (SELECT 1 FROM Profesional WHERE ProfesionalId = @ProfesionalId AND Estado = 'PENDIENTE_VALIDACION')
    BEGIN SELECT 0 AS Exito, 'Este enlace ya fue utilizado o la cuenta ya fue procesada.'; RETURN; END

    UPDATE Profesional
    SET    PasswordHash = @PasswordHash,
           Estado       = 'PENDIENTE_APROBACION',
           FechaModificacion = GETDATE()
    WHERE  ProfesionalId = @ProfesionalId;

    UPDATE TokenActivacion SET Usado = 1 WHERE Token = @Token;

    -- Actualizar título de la notificación para indicar que ya puede ser revisada
    UPDATE Notificacion
    SET    Titulo = 'Profesional listo para revisión',
           Descripcion = Descripcion + ' | Email confirmado',
           FechaModificacion = GETDATE()
    WHERE  EntidadId = @ProfesionalId AND Tipo = 'RegistroProfesional' AND Estado = 'Pendiente';

    SELECT 1 AS Exito, 'Correo confirmado. Tu solicitud está en revisión.';
END
GO

CREATE OR ALTER PROCEDURE sp_AprobarProfesional
    @ProfesionalId INT,
    @Aprobado      BIT,
    @MotivoRechazo NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @Aprobado = 1
    BEGIN
        UPDATE Profesional SET Estado = 'ACTIVO', FechaModificacion = GETDATE()
        WHERE  ProfesionalId = @ProfesionalId;

        UPDATE Notificacion SET Estado = 'Aprobada', Leida = 1, FechaModificacion = GETDATE()
        WHERE  EntidadId = @ProfesionalId AND Tipo = 'RegistroProfesional';

        SELECT 1 AS Exito, 'Profesional aprobado.' AS Mensaje;
    END
    ELSE
    BEGIN
        UPDATE Profesional
        SET    Estado = 'RECHAZADO', MotivoRechazo = @MotivoRechazo, FechaModificacion = GETDATE()
        WHERE  ProfesionalId = @ProfesionalId;

        UPDATE Notificacion SET Estado = 'Rechazada', Leida = 1, FechaModificacion = GETDATE()
        WHERE  EntidadId = @ProfesionalId AND Tipo = 'RegistroProfesional';

        SELECT 1 AS Exito, 'Profesional rechazado.' AS Mensaje;
    END
END
GO

CREATE OR ALTER PROCEDURE sp_ReenviarDocumentosProfesional
    @ProfesionalId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @NombreCompleto NVARCHAR(200);
    DECLARE @Correo         NVARCHAR(254);

    SELECT @NombreCompleto = NombreCompleto, @Correo = Correo
    FROM   Profesional
    WHERE  ProfesionalId = @ProfesionalId AND Estado = 'RECHAZADO';

    IF @NombreCompleto IS NULL
    BEGIN SELECT 0 AS Exito, 'Profesional no encontrado o no tiene estado RECHAZADO.'; RETURN; END

    UPDATE Profesional
    SET    Estado = 'PENDIENTE_APROBACION', MotivoRechazo = NULL, FechaModificacion = GETDATE()
    WHERE  ProfesionalId = @ProfesionalId;

    -- Reactivar notificación en la bandeja del admin
    IF EXISTS (SELECT 1 FROM Notificacion WHERE EntidadId = @ProfesionalId AND Tipo = 'RegistroProfesional')
        UPDATE Notificacion
        SET    Estado = 'Pendiente', Leida = 0,
               Titulo = 'Profesional reenviando documentos para nueva revisión',
               FechaModificacion = GETDATE()
        WHERE  EntidadId = @ProfesionalId AND Tipo = 'RegistroProfesional';
    ELSE
        INSERT INTO Notificacion (Tipo, EntidadId, Titulo, Descripcion)
        VALUES ('RegistroProfesional', @ProfesionalId,
                'Profesional reenviando documentos para nueva revisión',
                'Profesional: ' + @NombreCompleto + ' | Correo: ' + @Correo);

    SELECT 1 AS Exito, 'Documentos reenviados. Tu solicitud está nuevamente en revisión.';
END
GO

-- ============================================================
-- PERFIL USUARIO
-- ============================================================

CREATE OR ALTER PROCEDURE sp_ActualizarUsuario
    @UsuarioId       INT,
    @NombreCompleto  NVARCHAR(200),
    @Alias           NVARCHAR(100),
    @Celular         NVARCHAR(20)  = NULL,
    @FechaNacimiento DATE          = NULL,
    @CiudadId        INT           = NULL,
    @FotoUrl         NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Usuario
    SET    NombreCompleto  = @NombreCompleto,
           Alias           = @Alias,
           Celular         = @Celular,
           FechaNacimiento = @FechaNacimiento,
           CiudadId        = @CiudadId,
           FotoPerfil      = ISNULL(@FotoUrl, FotoPerfil),
           FechaModificacion = GETDATE()
    WHERE  UsuarioId = @UsuarioId;
    SELECT 1 AS Exito, 'Perfil actualizado.' AS Mensaje;
END
GO

-- ============================================================
-- PERFIL PROFESIONAL
-- ============================================================

CREATE OR ALTER PROCEDURE sp_ActualizarProfesional
    @ProfesionalId INT,
    @NombreCompleto NVARCHAR(200),
    @Ocupacion      NVARCHAR(200) = NULL,
    @SobreMi        NVARCHAR(MAX) = NULL,
    @Celular        NVARCHAR(20)  = NULL,
    @CiudadId       INT           = NULL,
    @ValorPorHora   DECIMAL(10,2) = NULL,
    @FotoUrl        NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Profesional
    SET    NombreCompleto  = @NombreCompleto,
           Ocupacion       = @Ocupacion,
           SobreMi         = @SobreMi,
           Celular         = @Celular,
           CiudadId        = @CiudadId,
           ValorPorHora    = @ValorPorHora,
           FotoPerfil      = ISNULL(@FotoUrl, FotoPerfil),
           FechaModificacion = GETDATE()
    WHERE  ProfesionalId = @ProfesionalId;
    SELECT 1 AS Exito, 'Perfil actualizado.' AS Mensaje;
END
GO

-- ============================================================
-- CITAS
-- ============================================================

CREATE OR ALTER PROCEDURE sp_AgendarCita
    @UsuarioId       INT,
    @ProfesionalId   INT,
    @FechaHora       DATETIME2(0),
    @FechaHoraFin    DATETIME2(0),
    @Tipo            NVARCHAR(15),
    @Notas           NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- Verificar disponibilidad (sin cruce de horarios)
    IF EXISTS (
        SELECT 1 FROM Cita
        WHERE  ProfesionalId = @ProfesionalId
          AND  Estado NOT IN ('Cancelada')
          AND  @FechaHora < FechaHoraFin
          AND  @FechaHoraFin > FechaHora
    )
    BEGIN SELECT 0 AS Exito, 'El horario no está disponible.' AS Mensaje, 0 AS Id; RETURN; END

    -- Verificar bloqueos
    IF EXISTS (
        SELECT 1 FROM HorarioBloqueado
        WHERE  ProfesionalId = @ProfesionalId
          AND  @FechaHora < FechaHoraFin
          AND  @FechaHoraFin > FechaHoraInicio
    )
    BEGIN SELECT 0 AS Exito, 'El profesional tiene bloqueado ese horario.' AS Mensaje, 0 AS Id; RETURN; END

    DECLARE @NuevaCitaId INT;
    INSERT INTO Cita (UsuarioId, ProfesionalId, FechaHora, FechaHoraFin, Tipo)
    VALUES (@UsuarioId, @ProfesionalId, @FechaHora, @FechaHoraFin, @Tipo);
    SET @NuevaCitaId = SCOPE_IDENTITY();

    SELECT 1 AS Exito, 'Cita agendada exitosamente.' AS Mensaje, @NuevaCitaId AS Id;
END
GO

CREATE OR ALTER PROCEDURE sp_CancelarCita
    @CitaId       INT,
    @SolicitanteId INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (
        SELECT 1 FROM Cita
        WHERE  CitaId = @CitaId
          AND  (UsuarioId = @SolicitanteId OR ProfesionalId = @SolicitanteId)
          AND  Estado IN ('Programada','Movida')
    )
    BEGIN SELECT 0 AS Exito, 'No se puede cancelar esta cita.' AS Mensaje; RETURN; END

    UPDATE Cita SET Estado = 'Cancelada', FechaModificacion = GETDATE()
    WHERE  CitaId = @CitaId;
    SELECT 1 AS Exito, 'Cita cancelada.' AS Mensaje;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerCitasPorUsuario
    @UsuarioId INT,
    @Estado    NVARCHAR(15) = 'Todos',
    @Pagina    INT          = 1,
    @TamanoPagina INT       = 10
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.CitaId,
           p.NombreCompleto  AS NombreProfesional,
           ISNULL(p.FotoPerfil,'') AS FotoProfesional,
           u.Alias            AS AliasUsuario,
           c.FechaHora,
           DATEDIFF(MINUTE, c.FechaHora, c.FechaHoraFin) AS DuracionMinutos,
           c.Tipo,
           c.Estado,
           ISNULL(pc.Monto, ISNULL(p.ValorPorHora, 0)) AS Monto
    FROM   Cita c
    JOIN   Profesional p ON p.ProfesionalId = c.ProfesionalId
    JOIN   Usuario     u ON u.UsuarioId     = c.UsuarioId
    LEFT JOIN PagoCita pc ON pc.CitaId = c.CitaId AND pc.Estado = 'Aprobado'
    WHERE  c.UsuarioId = @UsuarioId
      AND  (@Estado = 'Todos' OR c.Estado = @Estado)
    ORDER  BY c.FechaHora DESC
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH  NEXT @TamanoPagina ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerCitasPorProfesional
    @ProfesionalId INT,
    @Estado        NVARCHAR(15) = 'Todos',
    @Pagina        INT          = 1,
    @TamanoPagina  INT          = 10
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.CitaId,
           p.NombreCompleto  AS NombreProfesional,
           ISNULL(p.FotoPerfil,'') AS FotoProfesional,
           u.Alias            AS AliasUsuario,
           c.FechaHora,
           DATEDIFF(MINUTE, c.FechaHora, c.FechaHoraFin) AS DuracionMinutos,
           c.Tipo,
           c.Estado,
           ISNULL(pc.Monto, ISNULL(p.ValorPorHora, 0)) AS Monto
    FROM   Cita c
    JOIN   Profesional p ON p.ProfesionalId = c.ProfesionalId
    JOIN   Usuario     u ON u.UsuarioId     = c.UsuarioId
    LEFT JOIN PagoCita pc ON pc.CitaId = c.CitaId AND pc.Estado = 'Aprobado'
    WHERE  c.ProfesionalId = @ProfesionalId
      AND  (@Estado = 'Todos' OR c.Estado = @Estado)
    ORDER  BY c.FechaHora DESC
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH  NEXT @TamanoPagina ROWS ONLY;
END
GO

-- ============================================================
-- SALAS
-- ============================================================

CREATE OR ALTER PROCEDURE sp_CrearSala
    @ProfesionalId INT,
    @Nombre        NVARCHAR(300),
    @Descripcion   NVARCHAR(MAX) = NULL,
    @Tipo          NVARCHAR(10)  = 'Publica',
    @CategoriaId   INT           = NULL,
    @CupoMaximo    INT,
    @FechaInicio   DATETIME2(0)  = NULL,
    @Precio        DECIMAL(10,2) = 0
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @NuevoId INT;
    INSERT INTO Sala (ProfesionalId, CategoriaId, Nombre, Descripcion, Tipo, CupoMaximo, Precio, FechaCreacion)
    VALUES (@ProfesionalId, @CategoriaId, @Nombre, @Descripcion, @Tipo, @CupoMaximo, @Precio, ISNULL(@FechaInicio, GETDATE()));
    SET @NuevoId = SCOPE_IDENTITY();
    SELECT 1 AS Exito, 'Sala creada.' AS Mensaje, @NuevoId AS Id;
END
GO

CREATE OR ALTER PROCEDURE sp_CerrarSala
    @SalaId       INT,
    @ProfesionalId INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Sala WHERE SalaId = @SalaId AND ProfesionalId = @ProfesionalId)
    BEGIN SELECT 0 AS Exito, 'No autorizado.' AS Mensaje; RETURN; END

    UPDATE Sala SET Estado = 'Cerrada', FechaModificacion = GETDATE()
    WHERE  SalaId = @SalaId;
    SELECT 1 AS Exito, 'Sala cerrada.' AS Mensaje;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerSalasPorProfesional
    @ProfesionalId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.SalaId, s.ProfesionalId, s.Nombre AS Titulo, s.Descripcion,
           s.Tipo, s.Estado, s.CategoriaId, c.Nombre AS Categoria,
           NULL AS ImagenUrl, s.CupoMaximo AS Capacidad,
           NULL AS FechaInicio,
           (SELECT COUNT(*) FROM Inscripcion i WHERE i.SalaId = s.SalaId AND i.Estado NOT IN ('Cancelada')) AS TotalInscritos
    FROM   Sala s
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    WHERE  s.ProfesionalId = @ProfesionalId
    ORDER  BY s.FechaCreacion DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerSalasPublicas
    @CategoriaId  INT  = NULL,
    @Pagina       INT  = 1,
    @TamanoPagina INT  = 12
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.SalaId, s.ProfesionalId, s.Nombre AS Titulo, s.Descripcion,
           s.Tipo, s.Estado, s.CategoriaId, c.Nombre AS Categoria,
           NULL AS ImagenUrl, s.CupoMaximo AS Capacidad,
           NULL AS FechaInicio,
           (SELECT COUNT(*) FROM Inscripcion i WHERE i.SalaId = s.SalaId AND i.Estado NOT IN ('Cancelada')) AS TotalInscritos
    FROM   Sala s
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    WHERE  s.Estado = 'Abierta' AND s.Tipo = 'Publica'
      AND  (@CategoriaId IS NULL OR s.CategoriaId = @CategoriaId)
    ORDER  BY s.FechaCreacion DESC
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH  NEXT @TamanoPagina ROWS ONLY;
END
GO

-- ============================================================
-- INSCRIPCIONES
-- ============================================================

CREATE OR ALTER PROCEDURE sp_InscribirSala
    @UsuarioId INT,
    @SalaId    INT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Inscripcion WHERE UsuarioId = @UsuarioId AND SalaId = @SalaId AND Estado NOT IN ('Cancelada'))
    BEGIN SELECT 0 AS Exito, 'Ya estás inscrito en esta sala.' AS Mensaje, 0 AS Id; RETURN; END

    DECLARE @CupoMax INT, @TotalInscritos INT;
    SELECT @CupoMax = CupoMaximo FROM Sala WHERE SalaId = @SalaId AND Estado = 'Abierta';
    IF @CupoMax IS NULL BEGIN SELECT 0 AS Exito, 'Sala no disponible.' AS Mensaje, 0 AS Id; RETURN; END

    SELECT @TotalInscritos = COUNT(*) FROM Inscripcion WHERE SalaId = @SalaId AND Estado NOT IN ('Cancelada');
    IF @TotalInscritos >= @CupoMax BEGIN SELECT 0 AS Exito, 'La sala está llena.' AS Mensaje, 0 AS Id; RETURN; END

    DECLARE @NuevoId INT;
    INSERT INTO Inscripcion (UsuarioId, SalaId, CodigoInscripcion)
    VALUES (@UsuarioId, @SalaId, NEWID());
    SET @NuevoId = SCOPE_IDENTITY();
    SELECT 1 AS Exito, 'Inscripción registrada.' AS Mensaje, @NuevoId AS Id;
END
GO

-- ============================================================
-- PAGOS
-- ============================================================

CREATE OR ALTER PROCEDURE sp_PagarCita
    @CitaId     INT,
    @UsuarioId  INT,
    @MetodoPago NVARCHAR(25)
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Cita WHERE CitaId = @CitaId AND UsuarioId = @UsuarioId AND Estado = 'Programada')
    BEGIN SELECT 0 AS Exito, 'Cita no válida para pago.' AS Mensaje; RETURN; END

    DECLARE @Monto DECIMAL(10,2);
    SELECT @Monto = ISNULL(p.ValorPorHora, 50000)
    FROM   Cita c JOIN Profesional p ON p.ProfesionalId = c.ProfesionalId
    WHERE  c.CitaId = @CitaId;

    INSERT INTO PagoCita (CitaId, UsuarioId, Monto, MetodoPago, Estado)
    VALUES (@CitaId, @UsuarioId, @Monto, @MetodoPago, 'Aprobado');
    SELECT 1 AS Exito, 'Pago procesado correctamente.' AS Mensaje;
END
GO

CREATE OR ALTER PROCEDURE sp_PagarInscripcion
    @InscripcionId INT,
    @MetodoPago    NVARCHAR(25)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @SalaId INT;
    SELECT @SalaId = SalaId FROM Inscripcion WHERE InscripcionId = @InscripcionId;

    IF @SalaId IS NULL BEGIN SELECT 0 AS Exito, 'Inscripción no encontrada.' AS Mensaje; RETURN; END

    DECLARE @Precio DECIMAL(10,2);
    SELECT @Precio = Precio FROM Sala WHERE SalaId = @SalaId;

    INSERT INTO PagoInscripcion (InscripcionId, Monto, MetodoPago, Estado)
    VALUES (@InscripcionId, @Precio, @MetodoPago, 'Aprobado');

    UPDATE Inscripcion SET Estado = 'PagoAprobado', FechaModificacion = GETDATE()
    WHERE  InscripcionId = @InscripcionId;
    SELECT 1 AS Exito, 'Pago de inscripción procesado.' AS Mensaje;
END
GO

-- ============================================================
-- MENSAJERÍA
-- ============================================================

CREATE OR ALTER PROCEDURE sp_EnviarMensaje
    @AutorId      INT,
    @TipoAutor    NVARCHAR(15),
    @DestinoId    INT,
    @TipoDestino  NVARCHAR(15),
    @Texto        NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @UsuarioId INT, @ProfesionalId INT, @ConversacionId INT;

    IF @TipoAutor = 'Usuario'
        BEGIN SET @UsuarioId = @AutorId; SET @ProfesionalId = @DestinoId; END
    ELSE
        BEGIN SET @ProfesionalId = @AutorId; SET @UsuarioId = @DestinoId; END

    SELECT @ConversacionId = ConversacionId FROM Conversacion
    WHERE  UsuarioId = @UsuarioId AND ProfesionalId = @ProfesionalId;

    IF @ConversacionId IS NULL
    BEGIN
        INSERT INTO Conversacion (UsuarioId, ProfesionalId) VALUES (@UsuarioId, @ProfesionalId);
        SET @ConversacionId = SCOPE_IDENTITY();
    END

    DECLARE @NuevoId INT;
    INSERT INTO MensajePrivado (ConversacionId, AutorId, TipoAutor, Texto)
    VALUES (@ConversacionId, @AutorId, @TipoAutor, @Texto);
    SET @NuevoId = SCOPE_IDENTITY();

    SELECT 1 AS Exito, 'Mensaje enviado.' AS Mensaje, @NuevoId AS Id;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerConversaciones
    @EntidadId   INT,
    @TipoEntidad NVARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT conv.ConversacionId,
           CASE @TipoEntidad
               WHEN 'Usuario'     THEN p.ProfesionalId
               ELSE                    u.UsuarioId
           END AS OtroId,
           CASE @TipoEntidad
               WHEN 'Usuario'     THEN p.NombreCompleto
               ELSE                    u.Alias
           END AS OtroNombre,
           CASE @TipoEntidad
               WHEN 'Usuario'     THEN p.FotoPerfil
               ELSE                    u.FotoPerfil
           END AS OtroFoto,
           CASE @TipoEntidad
               WHEN 'Usuario'     THEN 'Profesional'
               ELSE                    'Usuario'
           END AS TipoOtro,
           (SELECT TOP 1 Texto FROM MensajePrivado WHERE ConversacionId = conv.ConversacionId ORDER BY FechaCreacion DESC) AS UltimoMensaje,
           (SELECT TOP 1 FechaCreacion FROM MensajePrivado WHERE ConversacionId = conv.ConversacionId ORDER BY FechaCreacion DESC) AS UltimaFecha,
           (SELECT COUNT(*) FROM MensajePrivado WHERE ConversacionId = conv.ConversacionId AND Leido = 0
              AND AutorId <> @EntidadId) AS MensajesNoLeidos
    FROM   Conversacion conv
    JOIN   Usuario      u ON u.UsuarioId     = conv.UsuarioId
    JOIN   Profesional  p ON p.ProfesionalId = conv.ProfesionalId
    WHERE  ((@TipoEntidad = 'Usuario'     AND conv.UsuarioId     = @EntidadId)
         OR (@TipoEntidad = 'Profesional' AND conv.ProfesionalId = @EntidadId))
    ORDER  BY UltimaFecha DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_MarcarMensajesLeidos
    @ConversacionId INT,
    @LectorId       INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE MensajePrivado SET Leido = 1
    WHERE  ConversacionId = @ConversacionId AND AutorId <> @LectorId AND Leido = 0;
END
GO

-- ============================================================
-- DIRECTORIO
-- ============================================================

CREATE OR ALTER PROCEDURE sp_ObtenerDirectorio
    @TipoBusqueda  NVARCHAR(15)  = 'Todos',   -- 'Especialistas', 'Psicologos', 'Todos'
    @Especialidad  NVARCHAR(150) = NULL,
    @Ciudad        NVARCHAR(150) = NULL,
    @CalificacionMin DECIMAL(3,1) = NULL,
    @UsuarioId     INT           = NULL,
    @Pagina        INT           = 1,
    @TamanoPagina  INT           = 12
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.ProfesionalId,
           p.NombreCompleto,
           p.FotoPerfil     AS FotoUrl,
           p.Ocupacion      AS Titulo,
           ci.Nombre        AS Ciudad,
           AVG(CAST(cp.Puntuacion AS FLOAT)) AS Calificacion,
           (SELECT COUNT(*) FROM Seguidor s WHERE s.ProfesionalId = p.ProfesionalId) AS TotalSeguidos,
           CASE WHEN EXISTS (SELECT 1 FROM Seguidor s WHERE s.ProfesionalId = p.ProfesionalId AND s.UsuarioId = @UsuarioId)
                THEN 1 ELSE 0 END AS EsSeguido
    FROM   Profesional p
    LEFT JOIN Ciudad             ci ON ci.CiudadId     = p.CiudadId
    LEFT JOIN ComentarioProfesional cp ON cp.ProfesionalId = p.ProfesionalId AND cp.Estado = 1
    LEFT JOIN ProfesionalEspecialidad pe ON pe.ProfesionalId = p.ProfesionalId
    LEFT JOIN Especialidad          e  ON e.EspecialidadId   = pe.EspecialidadId
    WHERE  p.Estado = 'ACTIVO'
      AND  (@Especialidad IS NULL OR e.Nombre LIKE '%' + @Especialidad + '%')
      AND  (@Ciudad IS NULL OR ci.Nombre LIKE '%' + @Ciudad + '%')
    GROUP BY p.ProfesionalId, p.NombreCompleto, p.FotoPerfil, p.Ocupacion, ci.Nombre
    HAVING (@CalificacionMin IS NULL OR AVG(CAST(cp.Puntuacion AS FLOAT)) >= @CalificacionMin)
    ORDER  BY TotalSeguidos DESC
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH  NEXT @TamanoPagina ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE sp_ToggleSeguir
    @UsuarioId     INT,
    @ProfesionalId INT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Seguidor WHERE UsuarioId = @UsuarioId AND ProfesionalId = @ProfesionalId)
    BEGIN
        DELETE FROM Seguidor WHERE UsuarioId = @UsuarioId AND ProfesionalId = @ProfesionalId;
        SELECT 1 AS Exito, 'Dejaste de seguir al profesional.' AS Mensaje;
    END
    ELSE
    BEGIN
        INSERT INTO Seguidor (UsuarioId, ProfesionalId) VALUES (@UsuarioId, @ProfesionalId);
        SELECT 1 AS Exito, 'Ahora sigues a este profesional.' AS Mensaje;
    END
END
GO

CREATE OR ALTER PROCEDURE sp_ToggleColega
    @SolicitanteId INT,
    @ReceptorId    INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Menor INT = CASE WHEN @SolicitanteId < @ReceptorId THEN @SolicitanteId ELSE @ReceptorId END;
    DECLARE @Mayor INT = CASE WHEN @SolicitanteId > @ReceptorId THEN @SolicitanteId ELSE @ReceptorId END;

    IF EXISTS (SELECT 1 FROM ColaboracionProfesional WHERE ProfesionalId1 = @Menor AND ProfesionalId2 = @Mayor)
    BEGIN
        DELETE FROM ColaboracionProfesional WHERE ProfesionalId1 = @Menor AND ProfesionalId2 = @Mayor;
        SELECT 1 AS Exito, 'Colega eliminado.' AS Mensaje;
    END
    ELSE
    BEGIN
        INSERT INTO ColaboracionProfesional (ProfesionalId1, ProfesionalId2, Estado)
        VALUES (@Menor, @Mayor, 'Activa');
        SELECT 1 AS Exito, 'Colega agregado.' AS Mensaje;
    END
END
GO

-- ============================================================
-- CALENDARIO
-- ============================================================

CREATE OR ALTER PROCEDURE sp_GuardarDisponibilidad
    @ProfesionalId   INT,
    @HorariosJson    NVARCHAR(MAX)   -- JSON: [{"DiaSemana":1,"HoraInicio":"09:00","HoraFin":"17:00"}]
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM HorarioDisponible WHERE ProfesionalId = @ProfesionalId;

    INSERT INTO HorarioDisponible (ProfesionalId, DiaSemana, HoraInicio, HoraFin)
    SELECT @ProfesionalId,
           CAST(j.DiaSemana AS TINYINT),
           CAST(j.HoraInicio AS TIME(0)),
           CAST(j.HoraFin    AS TIME(0))
    FROM OPENJSON(@HorariosJson)
    WITH (DiaSemana INT, HoraInicio NVARCHAR(10), HoraFin NVARCHAR(10)) j;

    SELECT 1 AS Exito, 'Disponibilidad guardada.' AS Mensaje;
END
GO

CREATE OR ALTER PROCEDURE sp_BloquearHorario
    @ProfesionalId INT,
    @Inicio        DATETIME2(0),
    @Fin           DATETIME2(0),
    @Motivo        NVARCHAR(300) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO HorarioBloqueado (ProfesionalId, FechaHoraInicio, FechaHoraFin, Motivo)
    VALUES (@ProfesionalId, @Inicio, @Fin, @Motivo);
    SELECT 1 AS Exito, 'Horario bloqueado.' AS Mensaje;
END
GO

CREATE OR ALTER PROCEDURE sp_DesbloquearHorario
    @BloqueoId     INT,
    @ProfesionalId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM HorarioBloqueado WHERE BloqueoId = @BloqueoId AND ProfesionalId = @ProfesionalId;
    SELECT 1 AS Exito, 'Bloqueo eliminado.' AS Mensaje;
END
GO

-- ============================================================
-- NOTIFICACIONES ADMIN
-- ============================================================

CREATE OR ALTER PROCEDURE sp_ObtenerNotificacionesPendientes
AS
BEGIN
    SET NOCOUNT ON;
    SELECT n.NotificacionId,
           'Admin' AS DestinatarioTipo, 1 AS DestinatarioId,
           n.Tipo, n.Titulo, n.Descripcion AS Mensaje,
           n.Leida, n.FechaCreacion,
           'Profesional' AS EntidadRelacionadaTipo, n.EntidadId AS EntidadRelacionadaId,
           ISNULL(n.EntidadId, 0) AS ProfesionalId,
           p.NombreCompleto AS NombreProfesional,
           p.Correo         AS CorreoProfesional,
           p.UrlDocumentoIdentidad AS RutaPdfCedula,
           p.UrlTarjetaProfesional AS RutaPdfTarjeta,
           p.Estado         AS EstadoProfesional,
           p.MotivoRechazo  AS MotivoRechazo
    FROM   Notificacion n
    LEFT JOIN Profesional p ON p.ProfesionalId = n.EntidadId AND n.Tipo = 'RegistroProfesional'
    WHERE  n.Estado = 'Pendiente'
    ORDER  BY n.FechaCreacion DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_MarcarNotificacionLeida
    @NotificacionId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Notificacion SET Leida = 1, Estado = 'Leida', FechaModificacion = GETDATE()
    WHERE  NotificacionId = @NotificacionId;
END
GO

CREATE OR ALTER PROCEDURE sp_MarcarTodasNotificacionesLeidas
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Notificacion SET Leida = 1, Estado = 'Leida', FechaModificacion = GETDATE()
    WHERE  Leida = 0;
END
GO

-- ============================================================
-- DASHBOARD
-- ============================================================

CREATE OR ALTER PROCEDURE sp_DashboardUsuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        (SELECT COUNT(*) FROM Cita WHERE UsuarioId = @UsuarioId AND Estado IN ('Programada','Movida') AND FechaHora >= GETDATE()) AS CitasProximas,
        (SELECT COUNT(*) FROM Inscripcion WHERE UsuarioId = @UsuarioId AND Estado NOT IN ('Cancelada')) AS EventosInscritos,
        (SELECT COUNT(*) FROM Seguidor WHERE UsuarioId = @UsuarioId) AS ProfesionalesSeguidos,
        (SELECT COUNT(*) FROM MensajePrivado mp
         JOIN   Conversacion c ON c.ConversacionId = mp.ConversacionId
         WHERE  c.UsuarioId = @UsuarioId AND mp.Leido = 0 AND mp.AutorId <> @UsuarioId) AS MensajesNoLeidos;
END
GO

CREATE OR ALTER PROCEDURE sp_DashboardProfesional
    @ProfesionalId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        (SELECT COUNT(*) FROM Cita WHERE ProfesionalId = @ProfesionalId AND Estado IN ('Programada','Movida')
          AND CAST(FechaHora AS DATE) = CAST(GETDATE() AS DATE)) AS CitasHoy,
        (SELECT COUNT(DISTINCT UsuarioId) FROM Cita WHERE ProfesionalId = @ProfesionalId) AS TotalPacientes,
        (SELECT COUNT(*) FROM Sala WHERE ProfesionalId = @ProfesionalId AND Estado = 'Abierta') AS SalasActivas,
        (SELECT ISNULL(SUM(Monto),0) FROM PagoCita pc
         JOIN   Cita c ON c.CitaId = pc.CitaId
         WHERE  c.ProfesionalId = @ProfesionalId AND pc.Estado = 'Aprobado'
           AND  YEAR(pc.FechaPago) = YEAR(GETDATE()) AND MONTH(pc.FechaPago) = MONTH(GETDATE())) AS IngresosMes;
END
GO

-- ============================================================
-- DATOS SEMILLA
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM Pais)
BEGIN
    INSERT INTO Pais (Nombre, Codigo) VALUES
        ('Colombia', 'CO'), ('Venezuela', 'VE'), ('Ecuador', 'EC'), ('Perú', 'PE');

    INSERT INTO Ciudad (PaisId, Nombre) VALUES
        (1, 'Bogotá'), (1, 'Medellín'), (1, 'Cali'), (1, 'Barranquilla'),
        (1, 'Bucaramanga'), (1, 'Manizales'), (1, 'Pereira'), (1, 'Cartagena');

    INSERT INTO Especialidad (Nombre) VALUES
        ('Psicología Clínica'), ('Psicología Infantil'), ('Neuropsicología'),
        ('Psicología Organizacional'), ('Terapia Cognitivo-Conductual'),
        ('Salud Mental'), ('Psicoanálisis'), ('Terapia de Pareja');

    INSERT INTO Categoria (Nombre) VALUES
        ('Bienestar mental'), ('Ansiedad'), ('Depresión'), ('Familia'),
        ('Trabajo y estrés'), ('Relaciones'), ('Crianza'), ('Mindfulness');

    INSERT INTO Idioma (Nombre, Codigo) VALUES
        ('Español','es'), ('Inglés','en'), ('Francés','fr'), ('Portugués','pt');

    INSERT INTO Configuracion (Clave, Valor, Descripcion) VALUES
        ('TarifaPlataformaCita',   '5000',    'Tarifa fija por cita ($COP)'),
        ('MaxIntentosSesion',      '5',       'Máximo de intentos de login antes de bloqueo'),
        ('HorasTokenValidacion',   '1',       'Vigencia token activación usuario (horas)'),
        ('DiasTokenActivacion',    '1',       'Vigencia token activación profesional (días)'),
        ('HorasTokenRecuperacion', '1',       'Vigencia token recuperación contraseña (horas)');
END
GO

PRINT 'TrebolDB — Stored Procedures y datos semilla creados correctamente.';
GO

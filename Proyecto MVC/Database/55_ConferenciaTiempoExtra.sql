-- Conferencia: extensión de tiempo, compra de minutos y cierre por tiempo agotado
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

IF COL_LENGTH(N'dbo.Evento', N'MinutosExtra') IS NULL
    ALTER TABLE dbo.Evento ADD MinutosExtra INT NOT NULL CONSTRAINT DF_Evento_MinutosExtra DEFAULT 0;
GO

IF COL_LENGTH(N'dbo.SalaConferenciaPresencia', N'TiempoAgotadoEn') IS NULL
    ALTER TABLE dbo.SalaConferenciaPresencia ADD TiempoAgotadoEn DATETIME2(0) NULL;
GO

IF OBJECT_ID(N'dbo.PagoExtensionConferencia', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PagoExtensionConferencia (
        PagoExtensionConferenciaId INT             IDENTITY(1,1) NOT NULL,
        SalaId                     INT             NOT NULL,
        ProfesionalId              INT             NOT NULL,
        MinutosComprados           INT             NOT NULL,
        Monto                      DECIMAL(12,2)   NOT NULL,
        MetodoPago                 NVARCHAR(25)    NOT NULL,
        FechaPago                  DATETIME2(0)    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_PagoExtensionConferencia PRIMARY KEY (PagoExtensionConferenciaId),
        CONSTRAINT FK_PagoExtConf_Sala FOREIGN KEY (SalaId) REFERENCES dbo.Sala(SalaId),
        CONSTRAINT FK_PagoExtConf_Prof FOREIGN KEY (ProfesionalId) REFERENCES dbo.Profesional(ProfesionalId),
        CONSTRAINT CK_PagoExtConf_Minutos CHECK (MinutosComprados >= 3),
        CONSTRAINT CK_PagoExtConf_Monto CHECK (Monto > 0)
    );
END
GO

MERGE dbo.Configuracion AS tgt
USING (VALUES
    (N'Conferencia.ValorMinutoExtension', N'2500', N'Valor COP por minuto extra en conferencia en vivo'),
    (N'Conferencia.GraciaChatSegundos', N'60', N'Segundos de chat tras agotar tiempo antes de cerrar sala')
) AS src (Clave, Valor, Descripcion)
ON tgt.Clave = src.Clave
WHEN MATCHED THEN UPDATE SET Valor = src.Valor, Descripcion = src.Descripcion
WHEN NOT MATCHED THEN INSERT (Clave, Valor, Descripcion) VALUES (src.Clave, src.Valor, src.Descripcion);
GO

CREATE OR ALTER FUNCTION dbo.fn_FinEfectivoConferencia(
    @FechaInicio DATETIME2(0),
    @FechaFin    DATETIME2(0),
    @MinutosExtra INT
)
RETURNS DATETIME2(0)
AS
BEGIN
    DECLARE @FinBase DATETIME2(0);
    IF @FechaInicio IS NULL RETURN NULL;

    IF @FechaFin IS NULL
        SET @FinBase = DATEADD(MINUTE, 120, @FechaInicio);
    ELSE
    BEGIN
        DECLARE @Dur INT = DATEDIFF(MINUTE, @FechaInicio, @FechaFin);
        IF @Dur BETWEEN 15 AND 480 SET @FinBase = @FechaFin;
        ELSE SET @FinBase = DATEADD(MINUTE, 120, @FechaInicio);
    END

    RETURN DATEADD(MINUTE, ISNULL(@MinutosExtra, 0), @FinBase);
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_ObtenerEstadoTiempoConferencia
    @SalaId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FechaInicio DATETIME2(0), @FechaFin DATETIME2(0), @MinutosExtra INT = 0;
    DECLARE @SalaEstado NVARCHAR(15), @ProfesionalId INT, @NombreProf NVARCHAR(200);
    DECLARE @ValorMinuto DECIMAL(12,2);
    DECLARE @GraciaSeg INT;

    SELECT TOP 1
        @FechaInicio = e.FechaInicio,
        @FechaFin = e.FechaFin,
        @MinutosExtra = ISNULL(e.MinutosExtra, 0)
    FROM Evento e
    WHERE e.SalaId = @SalaId
    ORDER BY e.FechaInicio DESC;

    SELECT @SalaEstado = s.Estado, @ProfesionalId = s.ProfesionalId, @NombreProf = p.NombreCompleto
    FROM   Sala s
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId
    WHERE  s.SalaId = @SalaId;

    IF @SalaEstado IS NULL
    BEGIN
        SELECT N'Cerrada' AS Fase, NULL AS FinEfectivo, 0 AS MinutosExtra, 0 AS ValorMinuto,
               0 AS SegundosRestantesGracia, NULL AS ProfesionalId, N'' AS NombreProfesional;
        RETURN;
    END

    SELECT @ValorMinuto = TRY_CAST(REPLACE(ISNULL((
        SELECT Valor FROM Configuracion WHERE Clave = N'Conferencia.ValorMinutoExtension'), N'0'), N',', N'.') AS DECIMAL(12,2));
    IF @ValorMinuto IS NULL OR @ValorMinuto <= 0 SET @ValorMinuto = 2500;

    SELECT @GraciaSeg = TRY_CAST((
        SELECT Valor FROM Configuracion WHERE Clave = N'Conferencia.GraciaChatSegundos') AS INT);
    IF @GraciaSeg IS NULL OR @GraciaSeg < 1 SET @GraciaSeg = 60;

    DECLARE @FinEfectivo DATETIME2(0) = dbo.fn_FinEfectivoConferencia(@FechaInicio, @FechaFin, @MinutosExtra);
    DECLARE @Ahora DATETIME2(0) = GETDATE();
    DECLARE @Fase NVARCHAR(20) = N'Activa';
    DECLARE @SegGracia INT = 0;
    DECLARE @TiempoAgotado DATETIME2(0);

    SELECT @TiempoAgotado = TiempoAgotadoEn FROM SalaConferenciaPresencia WHERE SalaId = @SalaId;

    IF @SalaEstado = N'Cerrada'
        SET @Fase = N'Cerrada';
    ELSE IF @FinEfectivo IS NOT NULL AND @Ahora >= @FinEfectivo
    BEGIN
        IF @TiempoAgotado IS NULL
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM SalaConferenciaPresencia WHERE SalaId = @SalaId)
                INSERT INTO SalaConferenciaPresencia (SalaId, TiempoAgotadoEn) VALUES (@SalaId, @Ahora);
            ELSE
                UPDATE SalaConferenciaPresencia SET TiempoAgotadoEn = @Ahora, FechaModificacion = @Ahora WHERE SalaId = @SalaId;
            SET @TiempoAgotado = @Ahora;
        END

        SET @SegGracia = @GraciaSeg - DATEDIFF(SECOND, @TiempoAgotado, @Ahora);
        IF @SegGracia <= 0
        BEGIN
            UPDATE Sala SET Estado = N'Cerrada', FechaModificacion = @Ahora WHERE SalaId = @SalaId AND ProfesionalId = @ProfesionalId;
            UPDATE Evento SET Estado = N'Cerrado' WHERE SalaId = @SalaId;
            SET @Fase = N'Cerrada';
            SET @SegGracia = 0;
        END
        ELSE
            SET @Fase = N'GraciaChat';
    END
    ELSE IF @TiempoAgotado IS NOT NULL
    BEGIN
        UPDATE SalaConferenciaPresencia SET TiempoAgotadoEn = NULL, FechaModificacion = @Ahora WHERE SalaId = @SalaId;
    END

    SELECT @Fase AS Fase,
           @FinEfectivo AS FinEfectivo,
           @MinutosExtra AS MinutosExtra,
           @ValorMinuto AS ValorMinuto,
           CASE WHEN @Fase = N'GraciaChat' THEN @SegGracia ELSE 0 END AS SegundosRestantesGracia,
           @ProfesionalId AS ProfesionalId,
           @NombreProf AS NombreProfesional;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_ComprarMinutosExtensionConferencia
    @SalaId        INT,
    @ProfesionalId INT,
    @Minutos       INT,
    @MetodoPago    NVARCHAR(25)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        IF @Minutos < 3
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, N'Debes comprar al menos 3 minutos.' AS Mensaje, NULL AS FinEfectivo, 0 AS MinutosExtra;
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM Sala WHERE SalaId = @SalaId AND ProfesionalId = @ProfesionalId AND Estado = N'Abierta')
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, N'La sala no está disponible para extender.' AS Mensaje, NULL AS FinEfectivo, 0 AS MinutosExtra;
            RETURN;
        END

        DECLARE @ValorMinuto DECIMAL(12,2) = TRY_CAST(REPLACE(ISNULL((
            SELECT Valor FROM Configuracion WHERE Clave = N'Conferencia.ValorMinutoExtension'), N'0'), N',', N'.') AS DECIMAL(12,2));
        IF @ValorMinuto IS NULL OR @ValorMinuto <= 0 SET @ValorMinuto = 2500;

        DECLARE @Monto DECIMAL(12,2) = @Minutos * @ValorMinuto;

        DECLARE @EventoId INT;
        SELECT TOP 1 @EventoId = EventoId FROM Evento WHERE SalaId = @SalaId ORDER BY FechaInicio DESC;
        IF @EventoId IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exito, N'No se encontró el evento de la sala.' AS Mensaje, NULL AS FinEfectivo, 0 AS MinutosExtra;
            RETURN;
        END

        UPDATE Evento SET MinutosExtra = ISNULL(MinutosExtra, 0) + @Minutos
        WHERE EventoId = @EventoId;

        INSERT INTO PagoExtensionConferencia (SalaId, ProfesionalId, MinutosComprados, Monto, MetodoPago)
        VALUES (@SalaId, @ProfesionalId, @Minutos, @Monto, @MetodoPago);

        UPDATE SalaConferenciaPresencia SET TiempoAgotadoEn = NULL, FechaModificacion = GETDATE()
        WHERE SalaId = @SalaId;

        DECLARE @FechaInicio DATETIME2(0), @FechaFin DATETIME2(0), @MinutosExtra INT;
        SELECT @FechaInicio = FechaInicio, @FechaFin = FechaFin, @MinutosExtra = MinutosExtra
        FROM Evento WHERE EventoId = @EventoId;

        DECLARE @FinEfectivo DATETIME2(0) = dbo.fn_FinEfectivoConferencia(@FechaInicio, @FechaFin, @MinutosExtra);

        COMMIT TRANSACTION;
        SELECT 1 AS Exito,
               N'Se agregaron ' + CAST(@Minutos AS NVARCHAR(10)) + N' minutos a la conferencia.' AS Mensaje,
               @FinEfectivo AS FinEfectivo,
               @MinutosExtra AS MinutosExtra;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Exito, ERROR_MESSAGE() AS Mensaje, NULL AS FinEfectivo, 0 AS MinutosExtra;
    END CATCH
END
GO

-- Incluir MinutosExtra en consultas de conferencia
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
           ISNULL(ev.MinutosExtra, 0) AS MinutosExtra,
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
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.MinutosExtra
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

PRINT N'55_ConferenciaTiempoExtra — aplicado.';
GO

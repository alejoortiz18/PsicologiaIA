-- Conferencia asistente: inscripción, chat deshabilitado por defecto hasta que el profesional lo habilite.
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

-- Nuevas salas: chat grupal deshabilitado al crear (no modifica filas existentes).
IF EXISTS (
    SELECT 1 FROM sys.default_constraints dc
    JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
    WHERE dc.parent_object_id = OBJECT_ID(N'dbo.Sala') AND c.name = N'ChatHabilitado')
BEGIN
    DECLARE @sqlDrop NVARCHAR(400);
    SELECT @sqlDrop = N'ALTER TABLE dbo.Sala DROP CONSTRAINT ' + QUOTENAME(dc.name)
    FROM sys.default_constraints dc
    JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
    WHERE dc.parent_object_id = OBJECT_ID(N'dbo.Sala') AND c.name = N'ChatHabilitado';
    EXEC sp_executesql @sqlDrop;
END
IF NOT EXISTS (
    SELECT 1 FROM sys.default_constraints dc
    JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
    WHERE dc.parent_object_id = OBJECT_ID(N'dbo.Sala') AND dc.name = N'DF_Sala_ChatHabilitado')
    ALTER TABLE dbo.Sala ADD CONSTRAINT DF_Sala_ChatHabilitado DEFAULT 0 FOR ChatHabilitado;
GO

CREATE OR ALTER PROCEDURE sp_ObtenerConferenciaAsistente
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
           (SELECT COUNT(*)
            FROM   Inscripcion i
            WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')) AS TotalInscritos,
           ev.FechaInicio,
           ev.FechaFin,
           p.NombreCompleto AS NombreProfesional,
           COALESCE(u.Alias, pr.Alias, u.NombreCompleto, pr.NombreCompleto, N'Participante') AS AliasParticipante
    FROM   Sala s
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId
        ORDER  BY e.FechaInicio DESC
    ) ev
    OUTER APPLY (
        SELECT TOP 1 i.UsuarioId, i.ProfesionalInscriptorId
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

CREATE OR ALTER PROCEDURE sp_ToggleChatSala
    @SalaId        INT,
    @ProfesionalId INT,
    @Habilitado    BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Sala WHERE SalaId = @SalaId AND ProfesionalId = @ProfesionalId)
    BEGIN
        SELECT 0 AS Exito, N'No tienes permiso para modificar esta sala.' AS Mensaje;
        RETURN;
    END
    UPDATE Sala
    SET    ChatHabilitado = @Habilitado,
           FechaModificacion = GETDATE()
    WHERE  SalaId = @SalaId AND ProfesionalId = @ProfesionalId;
    SELECT 1 AS Exito, CASE WHEN @Habilitado = 1 THEN N'Chat habilitado.' ELSE N'Chat deshabilitado.' END AS Mensaje;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerEventosInscritosProfesional
    @ProfesionalInscriptorId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.SalaId,
           s.ProfesionalId,
           COALESCE(ev.Nombre, s.Nombre) AS Titulo,
           p.NombreCompleto AS NombreProfesional,
           c.Nombre AS Categoria,
           s.Estado,
           s.CupoMaximo AS Capacidad,
           s.Precio,
           insc.TotalInscritos,
           ev.FechaInicio,
           ev.FechaFin,
           1 AS EsInscrito,
           0 AS EsSeguido,
           (SELECT COUNT(*) FROM Seguidor sg WHERE sg.ProfesionalId = s.ProfesionalId) AS TotalSeguidos
    FROM   Inscripcion i
    JOIN   Sala s ON s.SalaId = i.SalaId
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT COUNT(*) AS TotalInscritos
        FROM   Inscripcion ix
        WHERE  ix.SalaId = s.SalaId AND ix.Estado NOT IN (N'Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto'
        ORDER  BY e.FechaInicio ASC
    ) ev
    WHERE  i.ProfesionalInscriptorId = @ProfesionalInscriptorId
      AND  i.Estado NOT IN (N'Cancelada')
      AND  s.Tipo = N'Publica'
      AND  (ev.FechaFin IS NULL OR ev.FechaFin >= GETDATE())
    ORDER  BY ev.FechaInicio ASC;
END
GO

PRINT N'Conferencia asistente y chat de sala aplicados.';
GO

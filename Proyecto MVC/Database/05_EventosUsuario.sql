-- TrebolDB — Eventos vigentes para usuario (Home + página Eventos)
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

/* Solo salas públicas abiertas con al menos un evento abierto no finalizado */
CREATE OR ALTER PROCEDURE sp_ObtenerSalasHoyPublicas
    @Limite    INT = 4,
    @UsuarioId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@Limite)
           s.SalaId,
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
           CASE WHEN @UsuarioId IS NOT NULL AND EXISTS (
                SELECT 1 FROM Inscripcion i
                WHERE i.SalaId = s.SalaId AND i.UsuarioId = @UsuarioId AND i.Estado NOT IN (N'Cancelada'))
                THEN 1 ELSE 0 END AS EsInscrito,
           CASE WHEN @UsuarioId IS NOT NULL AND EXISTS (
                SELECT 1 FROM Seguidor sg
                WHERE sg.ProfesionalId = s.ProfesionalId AND sg.UsuarioId = @UsuarioId)
                THEN 1 ELSE 0 END AS EsSeguido,
           (SELECT COUNT(*) FROM Seguidor sg WHERE sg.ProfesionalId = s.ProfesionalId) AS TotalSeguidos
    FROM   Sala s
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId AND p.Estado = N'ACTIVO'
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT COUNT(*) AS TotalInscritos
        FROM   Inscripcion i
        WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto'
          AND  CAST(e.FechaInicio AS DATE) = CAST(GETDATE() AS DATE)
        ORDER  BY e.FechaInicio ASC
    ) ev
    WHERE  s.Estado = N'Abierta' AND s.Tipo = N'Publica'
      AND  ev.FechaInicio IS NOT NULL
    ORDER  BY CASE WHEN ev.FechaFin < GETDATE() OR ev.FechaInicio < GETDATE() THEN 1 ELSE 0 END,
             ev.FechaInicio ASC;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerSalasPublicasPaginadas
    @CategoriaId  INT = NULL,
    @Pagina       INT = 1,
    @TamanoPagina INT = 10,
    @UsuarioId    INT = NULL
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
           CASE WHEN @UsuarioId IS NOT NULL AND EXISTS (
                SELECT 1 FROM Inscripcion i
                WHERE i.SalaId = s.SalaId AND i.UsuarioId = @UsuarioId AND i.Estado NOT IN (N'Cancelada'))
                THEN 1 ELSE 0 END AS EsInscrito,
           CASE WHEN @UsuarioId IS NOT NULL AND EXISTS (
                SELECT 1 FROM Seguidor sg
                WHERE sg.ProfesionalId = s.ProfesionalId AND sg.UsuarioId = @UsuarioId)
                THEN 1 ELSE 0 END AS EsSeguido,
           (SELECT COUNT(*) FROM Seguidor sg WHERE sg.ProfesionalId = s.ProfesionalId) AS TotalSeguidos
    FROM   Sala s
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId AND p.Estado = N'ACTIVO'
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT COUNT(*) AS TotalInscritos
        FROM   Inscripcion i
        WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto' AND e.FechaFin >= GETDATE()
        ORDER  BY e.FechaInicio ASC
    ) ev
    WHERE  s.Estado = N'Abierta' AND s.Tipo = N'Publica'
      AND  ev.FechaInicio IS NOT NULL
      AND  (@CategoriaId IS NULL OR s.CategoriaId = @CategoriaId)
    ORDER  BY insc.TotalInscritos DESC, ev.FechaInicio ASC
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH  NEXT @TamanoPagina ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE sp_ContarSalasPublicas
    @CategoriaId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*) AS Total
    FROM   Sala s
    OUTER APPLY (
        SELECT TOP 1 e.EventoId
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto' AND e.FechaFin >= GETDATE()
    ) ev
    WHERE  s.Estado = N'Abierta' AND s.Tipo = N'Publica'
      AND  ev.EventoId IS NOT NULL
      AND  (@CategoriaId IS NULL OR s.CategoriaId = @CategoriaId);
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerEventosInscritosUsuario
    @UsuarioId INT
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
           CASE WHEN EXISTS (
                SELECT 1 FROM Seguidor sg
                WHERE sg.ProfesionalId = s.ProfesionalId AND sg.UsuarioId = @UsuarioId)
                THEN 1 ELSE 0 END AS EsSeguido,
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
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre, e.Estado AS EstadoEvento
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId
        ORDER  BY e.FechaInicio DESC
    ) ev
    WHERE  i.UsuarioId = @UsuarioId AND i.Estado NOT IN (N'Cancelada')
      AND  s.Tipo = N'Publica'
      AND  s.Estado = N'Abierta'
      AND  ev.EstadoEvento <> N'Cerrado'
      AND  ev.EstadoEvento <> N'Cancelado'
      AND  (
            CASE
                WHEN ev.FechaInicio IS NULL THEN ev.FechaFin
                WHEN ev.FechaFin IS NULL THEN DATEADD(MINUTE, 120, ev.FechaInicio)
                WHEN DATEDIFF(MINUTE, ev.FechaInicio, ev.FechaFin) BETWEEN 15 AND 480
                    THEN ev.FechaFin
                ELSE DATEADD(MINUTE, 120, ev.FechaInicio)
            END IS NULL
            OR CASE
                WHEN ev.FechaInicio IS NULL THEN ev.FechaFin
                WHEN ev.FechaFin IS NULL THEN DATEADD(MINUTE, 120, ev.FechaInicio)
                WHEN DATEDIFF(MINUTE, ev.FechaInicio, ev.FechaFin) BETWEEN 15 AND 480
                    THEN ev.FechaFin
                ELSE DATEADD(MINUTE, 120, ev.FechaInicio)
            END >= GETDATE()
          )
    ORDER  BY ev.FechaInicio ASC;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerEventosSemanaUsuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET DATEFIRST 1; /* Lunes = inicio de semana */
    DECLARE @InicioSemana DATE = DATEADD(DAY, 1 - DATEPART(WEEKDAY, GETDATE()), CAST(GETDATE() AS DATE));
    DECLARE @FinSemana    DATE = DATEADD(DAY, 6, @InicioSemana);

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
           CASE WHEN EXISTS (
                SELECT 1 FROM Inscripcion i
                WHERE i.SalaId = s.SalaId AND i.UsuarioId = @UsuarioId AND i.Estado NOT IN (N'Cancelada'))
                THEN 1 ELSE 0 END AS EsInscrito,
           CASE WHEN EXISTS (
                SELECT 1 FROM Seguidor sg
                WHERE sg.ProfesionalId = s.ProfesionalId AND sg.UsuarioId = @UsuarioId)
                THEN 1 ELSE 0 END AS EsSeguido,
           (SELECT COUNT(*) FROM Seguidor sg WHERE sg.ProfesionalId = s.ProfesionalId) AS TotalSeguidos
    FROM   Sala s
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId AND p.Estado = N'ACTIVO'
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT COUNT(*) AS TotalInscritos
        FROM   Inscripcion i
        WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto' AND e.FechaFin >= GETDATE()
        ORDER  BY e.FechaInicio ASC
    ) ev
    WHERE  s.Estado = N'Abierta' AND s.Tipo = N'Publica'
      AND  ev.FechaInicio IS NOT NULL
      AND  CAST(ev.FechaInicio AS DATE) BETWEEN @InicioSemana AND @FinSemana
    ORDER  BY ev.FechaInicio ASC;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerTodosEventosVigentes
    @UsuarioId INT
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
           CASE WHEN EXISTS (
                SELECT 1 FROM Inscripcion i
                WHERE i.SalaId = s.SalaId AND i.UsuarioId = @UsuarioId AND i.Estado NOT IN (N'Cancelada'))
                THEN 1 ELSE 0 END AS EsInscrito,
           CASE WHEN EXISTS (
                SELECT 1 FROM Seguidor sg
                WHERE sg.ProfesionalId = s.ProfesionalId AND sg.UsuarioId = @UsuarioId)
                THEN 1 ELSE 0 END AS EsSeguido,
           (SELECT COUNT(*) FROM Seguidor sg WHERE sg.ProfesionalId = s.ProfesionalId) AS TotalSeguidos
    FROM   Sala s
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId AND p.Estado = N'ACTIVO'
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT COUNT(*) AS TotalInscritos
        FROM   Inscripcion i
        WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto' AND e.FechaFin >= GETDATE()
        ORDER  BY e.FechaInicio ASC
    ) ev
    WHERE  s.Estado = N'Abierta' AND s.Tipo = N'Publica'
      AND  ev.FechaInicio IS NOT NULL
    ORDER  BY ev.FechaInicio ASC;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerSalaDetalleUsuario
    @SalaId    INT,
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.SalaId,
           s.ProfesionalId,
           COALESCE(ev.Nombre, s.Nombre) AS Titulo,
           ISNULL(ev.Descripcion, s.Descripcion) AS Descripcion,
           p.NombreCompleto AS NombreProfesional,
           p.Ocupacion AS OcupacionOrador,
           p.FotoPerfil AS FotoOrador,
           c.Nombre AS Categoria,
           s.Estado,
           s.CupoMaximo AS Capacidad,
           s.Precio,
           insc.TotalInscritos,
           ev.FechaInicio,
           ev.FechaFin,
           CASE WHEN EXISTS (
                SELECT 1 FROM Inscripcion i
                WHERE i.SalaId = s.SalaId AND i.UsuarioId = @UsuarioId AND i.Estado NOT IN (N'Cancelada'))
                THEN 1 ELSE 0 END AS EsInscrito,
           CASE WHEN EXISTS (
                SELECT 1 FROM Seguidor sg
                WHERE sg.ProfesionalId = s.ProfesionalId AND sg.UsuarioId = @UsuarioId)
                THEN 1 ELSE 0 END AS EsSeguido,
           (SELECT COUNT(*) FROM Seguidor sg WHERE sg.ProfesionalId = s.ProfesionalId) AS TotalSeguidos,
           STUFF((
               SELECT N', ' + e2.Nombre
               FROM   ProfesionalEspecialidad pe
               JOIN   Especialidad e2 ON e2.EspecialidadId = pe.EspecialidadId
               WHERE  pe.ProfesionalId = p.ProfesionalId
               FOR XML PATH(''), TYPE
           ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS EspecialidadesTexto
    FROM   Sala s
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT COUNT(*) AS TotalInscritos
        FROM   Inscripcion i
        WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre, e.Descripcion
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto' AND e.FechaFin >= GETDATE()
        ORDER  BY e.FechaInicio ASC
    ) ev
    WHERE  s.SalaId = @SalaId AND s.Tipo = N'Publica';
END
GO

PRINT N'TrebolDB — Procedimientos de eventos usuario aplicados.';
GO

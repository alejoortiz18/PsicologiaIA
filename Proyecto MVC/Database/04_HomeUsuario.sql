-- TrebolDB — Consultas Home Usuario (datos reales, UTF-8)
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE sp_DashboardUsuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EventosProximos INT = (
        SELECT COUNT(*)
        FROM   Inscripcion i
        JOIN   Sala s ON s.SalaId = i.SalaId
        OUTER APPLY (
            SELECT TOP 1 e.FechaInicio
            FROM   Evento e
            WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto'
            ORDER  BY e.FechaInicio ASC
        ) ev
        WHERE  i.UsuarioId = @UsuarioId
          AND  i.Estado NOT IN (N'Cancelada')
          AND  (ev.FechaInicio IS NULL OR ev.FechaInicio >= GETDATE())
    );

    SELECT
        (SELECT COUNT(*) FROM Cita
         WHERE  UsuarioId = @UsuarioId AND Estado IN (N'Programada', N'Movida') AND FechaHora >= GETDATE()) AS CitasProximas,
        (SELECT COUNT(*) FROM Inscripcion WHERE UsuarioId = @UsuarioId AND Estado NOT IN (N'Cancelada')) AS EventosInscritos,
        @EventosProximos AS EventosProximos,
        (SELECT COUNT(*) FROM Seguidor WHERE UsuarioId = @UsuarioId) AS ProfesionalesSeguidos,
        (SELECT COUNT(*) FROM MensajePrivado mp
         JOIN   Conversacion c ON c.ConversacionId = mp.ConversacionId
         WHERE  c.UsuarioId = @UsuarioId AND mp.Leido = 0 AND mp.AutorId <> @UsuarioId) AS MensajesNoLeidos,
        (SELECT TOP 1 COALESCE(ev.Nombre, s.Nombre)
         FROM   Inscripcion i
         JOIN   Sala s ON s.SalaId = i.SalaId
         OUTER APPLY (
             SELECT TOP 1 e.FechaInicio, e.Nombre
             FROM   Evento e
             WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto' AND e.FechaInicio >= GETDATE()
             ORDER  BY e.FechaInicio ASC
         ) ev
         WHERE  i.UsuarioId = @UsuarioId AND i.Estado NOT IN (N'Cancelada') AND ev.FechaInicio IS NOT NULL
         ORDER  BY ev.FechaInicio ASC) AS ProximaSalaTitulo,
        (SELECT TOP 1 ev.FechaInicio
         FROM   Inscripcion i
         JOIN   Sala s ON s.SalaId = i.SalaId
         OUTER APPLY (
             SELECT TOP 1 e.FechaInicio
             FROM   Evento e
             WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto' AND e.FechaInicio >= GETDATE()
             ORDER  BY e.FechaInicio ASC
         ) ev
         WHERE  i.UsuarioId = @UsuarioId AND i.Estado NOT IN (N'Cancelada') AND ev.FechaInicio IS NOT NULL
         ORDER  BY ev.FechaInicio ASC) AS ProximaSalaFecha,
        (SELECT TOP 1 CONCAT(ISNULL(c.Nombre, N'Evento'), N' · ', FORMAT(ev.FechaInicio, N'h:mm tt', N'es-CO'))
         FROM   Inscripcion i
         JOIN   Sala s ON s.SalaId = i.SalaId
         LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
         OUTER APPLY (
             SELECT TOP 1 e.FechaInicio
             FROM   Evento e
             WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto' AND e.FechaInicio >= GETDATE()
             ORDER  BY e.FechaInicio ASC
         ) ev
         WHERE  i.UsuarioId = @UsuarioId AND i.Estado NOT IN (N'Cancelada') AND ev.FechaInicio IS NOT NULL
         ORDER  BY ev.FechaInicio ASC) AS ProximaSalaSubtitulo;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerCitasProximasUsuario
    @UsuarioId INT,
    @Limite    INT = 5
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@Limite)
           c.CitaId,
           p.NombreCompleto AS NombreProfesional,
           ISNULL(p.FotoPerfil, N'') AS FotoProfesional,
           u.Alias AS AliasUsuario,
           c.FechaHora,
           DATEDIFF(MINUTE, c.FechaHora, c.FechaHoraFin) AS DuracionMinutos,
           c.Tipo,
           c.Estado,
           ISNULL(pc.Monto, ISNULL(p.ValorPorHora, 0)) AS Monto
    FROM   Cita c
    JOIN   Profesional p ON p.ProfesionalId = c.ProfesionalId
    JOIN   Usuario u ON u.UsuarioId = c.UsuarioId
    LEFT JOIN PagoCita pc ON pc.CitaId = c.CitaId AND pc.Estado = N'Aprobado'
    WHERE  c.UsuarioId = @UsuarioId
      AND  c.Estado IN (N'Programada', N'Movida')
      AND  c.FechaHora >= GETDATE()
    ORDER  BY c.FechaHora ASC;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerInscripcionesUsuarioHome
    @UsuarioId INT,
    @Limite    INT = 4
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@Limite)
           s.SalaId,
           i.InscripcionId,
           COALESCE(ev.Nombre, s.Nombre) AS Titulo,
           p.NombreCompleto AS NombreProfesional,
           ev.FechaInicio,
           ev.FechaFin,
           s.Estado AS EstadoSala,
           i.Estado AS EstadoInscripcion,
           CASE WHEN ev.FechaInicio IS NOT NULL AND ev.FechaInicio <= GETDATE() AND ev.FechaFin >= GETDATE() THEN 1 ELSE 0 END AS EnVivo,
           CASE WHEN ev.FechaFin IS NOT NULL AND ev.FechaFin < GETDATE() THEN 1 ELSE 0 END AS Finalizado
    FROM   Inscripcion i
    JOIN   Sala s ON s.SalaId = i.SalaId
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId
        ORDER  BY e.FechaInicio DESC
    ) ev
    WHERE  i.UsuarioId = @UsuarioId AND i.Estado NOT IN (N'Cancelada')
    ORDER  BY
        CASE WHEN ev.FechaInicio IS NOT NULL AND ev.FechaInicio <= GETDATE() AND ev.FechaFin >= GETDATE() THEN 0 ELSE 1 END,
        ev.FechaInicio ASC;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerSalasHoyPublicas
    @Limite INT = 4
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
           ev.FechaInicio
    FROM   Sala s
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId AND p.Estado = N'ACTIVO'
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT COUNT(*) AS TotalInscritos
        FROM   Inscripcion i
        WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.Nombre
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto'
        ORDER  BY e.FechaInicio ASC
    ) ev
    WHERE  s.Estado = N'Abierta' AND s.Tipo = N'Publica'
      AND  ev.FechaInicio IS NOT NULL
      AND  CAST(ev.FechaInicio AS DATE) = CAST(GETDATE() AS DATE)
    ORDER  BY ev.FechaInicio ASC;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerSalasPublicasPaginadas
    @CategoriaId  INT = NULL,
    @Pagina       INT = 1,
    @TamanoPagina INT = 10
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
           ev.FechaInicio
    FROM   Sala s
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId AND p.Estado = N'ACTIVO'
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT COUNT(*) AS TotalInscritos
        FROM   Inscripcion i
        WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN (N'Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.Nombre
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId
        ORDER  BY e.FechaInicio ASC
    ) ev
    WHERE  s.Estado = N'Abierta' AND s.Tipo = N'Publica'
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
    WHERE  s.Estado = N'Abierta' AND s.Tipo = N'Publica'
      AND  (@CategoriaId IS NULL OR s.CategoriaId = @CategoriaId);
END
GO

-- TrebolDB — Consultas públicas y dashboards (sin datos mock en la UI)
USE TrebolDB;
GO

CREATE OR ALTER PROCEDURE sp_ObtenerEstadisticasLanding
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        (SELECT COUNT(*) FROM Profesional WHERE Estado = 'Activo') AS ProfesionalesActivos,
        (SELECT COUNT(*) FROM Evento WHERE Estado = 'Cerrado') AS EventosRealizados,
        (SELECT COUNT(*) FROM Usuario WHERE Estado = 'Activo') AS UsuariosRegistrados;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerEspecialidadesConConteo
AS
BEGIN
    SET NOCOUNT ON;
    SELECT e.EspecialidadId,
           e.Nombre,
           (SELECT COUNT(DISTINCT pe.ProfesionalId)
            FROM   ProfesionalEspecialidad pe
            JOIN   Profesional pr ON pr.ProfesionalId = pe.ProfesionalId AND pr.Estado = 'Activo'
            WHERE  pe.EspecialidadId = e.EspecialidadId) AS TotalProfesionales
    FROM   Especialidad e
    ORDER  BY TotalProfesionales DESC, e.Nombre;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerEventosDestacados
    @Limite INT = 3
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
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId AND p.Estado = 'Activo'
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT COUNT(*) AS TotalInscritos
        FROM   Inscripcion i
        WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN ('Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.Nombre
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId
        ORDER  BY e.FechaInicio DESC
    ) ev
    WHERE  s.Estado = 'Abierta' AND s.Tipo = 'Publica'
    ORDER  BY insc.TotalInscritos DESC, ev.FechaInicio ASC;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerEventosColegas
    @ProfesionalId INT,
    @Limite        INT = 30
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
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId AND p.Estado = 'Activo'
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    OUTER APPLY (
        SELECT COUNT(*) AS TotalInscritos
        FROM   Inscripcion i
        WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN ('Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.Nombre
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId
        ORDER  BY e.FechaInicio ASC
    ) ev
    WHERE  s.Estado = 'Abierta'
      AND  s.Tipo = 'Publica'
      AND  s.ProfesionalId <> @ProfesionalId
    ORDER  BY
        CASE WHEN ev.FechaInicio IS NOT NULL AND CAST(ev.FechaInicio AS DATE) = CAST(GETDATE() AS DATE) THEN 0 ELSE 1 END,
        ev.FechaInicio ASC,
        insc.TotalInscritos DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerProfesionalesTicker
    @Limite INT = 6
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@Limite)
           p.NombreCompleto,
           (SELECT TOP 1 e.Nombre
            FROM   ProfesionalEspecialidad pe
            JOIN   Especialidad e ON e.EspecialidadId = pe.EspecialidadId
            WHERE  pe.ProfesionalId = p.ProfesionalId
            ORDER  BY e.Nombre) AS Especialidad,
           p.AnosExperiencia
    FROM   Profesional p
    WHERE  p.Estado = 'Activo'
    ORDER  BY p.FechaCreacion DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerCitasHoyProfesional
    @ProfesionalId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.CitaId,
           u.Alias AS AliasUsuario,
           c.FechaHora,
           c.Tipo,
           c.Estado
    FROM   Cita c
    JOIN   Usuario u ON u.UsuarioId = c.UsuarioId
    WHERE  c.ProfesionalId = @ProfesionalId
      AND  CAST(c.FechaHora AS DATE) = CAST(GETDATE() AS DATE)
      AND  c.Estado IN ('Programada', 'Movida')
    ORDER  BY c.FechaHora;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerSalasActivasHoyProfesional
    @ProfesionalId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.SalaId,
           COALESCE(ev.Nombre, s.Nombre) AS Titulo,
           insc.Total AS Asistentes,
           s.Estado
    FROM   Sala s
    OUTER APPLY (
        SELECT COUNT(*) AS Total
        FROM   Inscripcion i
        WHERE  i.SalaId = s.SalaId AND i.Estado NOT IN ('Cancelada')
    ) insc
    OUTER APPLY (
        SELECT TOP 1 e.Nombre
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId
          AND  CAST(e.FechaInicio AS DATE) = CAST(GETDATE() AS DATE)
        ORDER  BY e.FechaInicio ASC
    ) ev
    WHERE  s.ProfesionalId = @ProfesionalId
      AND  s.Estado = 'Abierta'
      AND  (
            EXISTS (SELECT 1 FROM Evento e
                    WHERE e.SalaId = s.SalaId
                      AND CAST(e.FechaInicio AS DATE) = CAST(GETDATE() AS DATE))
            OR NOT EXISTS (SELECT 1 FROM Evento e WHERE e.SalaId = s.SalaId)
          )
    ORDER  BY s.FechaCreacion DESC;
END
GO

PRINT 'TrebolDB — Procedimientos de datos públicos aplicados.';
GO

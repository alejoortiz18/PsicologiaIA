USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

CREATE OR ALTER PROCEDURE sp_ObtenerInscripcionConfirmacion
    @InscripcionId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT i.InscripcionId,
           i.CodigoInscripcion,
           i.Estado AS EstadoInscripcion,
           i.FechaInscripcion,
           COALESCE(ev.Nombre, s.Nombre) AS TituloEvento,
           ISNULL(ev.Descripcion, s.Descripcion) AS DescripcionEvento,
           p.NombreCompleto AS NombreOrador,
           c.Nombre AS Categoria,
           ev.FechaInicio AS FechaEvento,
           ev.FechaFin AS FechaFinEvento,
           COALESCE(u.NombreCompleto, pr.NombreCompleto) AS NombreParticipante,
           COALESCE(u.Correo, pr.Correo) AS Correo,
           COALESCE(u.NumeroDocumento, pr.NumeroDocumento) AS Documento,
           ISNULL(s.Precio, 0) AS PrecioEntrada,
           pay.MetodoPago
    FROM   Inscripcion i
    JOIN   Sala s ON s.SalaId = i.SalaId
    JOIN   Profesional p ON p.ProfesionalId = s.ProfesionalId
    LEFT JOIN Categoria c ON c.CategoriaId = s.CategoriaId
    LEFT JOIN Usuario u ON u.UsuarioId = i.UsuarioId
    LEFT JOIN Profesional pr ON pr.ProfesionalId = i.ProfesionalInscriptorId
    OUTER APPLY (
        SELECT TOP 1 e.FechaInicio, e.FechaFin, e.Nombre, e.Descripcion
        FROM   Evento e
        WHERE  e.SalaId = s.SalaId AND e.Estado = N'Abierto'
        ORDER  BY e.FechaInicio ASC
    ) ev
    OUTER APPLY (
        SELECT TOP 1 pi.MetodoPago
        FROM   PagoInscripcion pi
        WHERE  pi.InscripcionId = i.InscripcionId AND pi.Estado = N'Aprobado'
        ORDER  BY pi.FechaPago DESC
    ) pay
    WHERE  i.InscripcionId = @InscripcionId;
END
GO

CREATE OR ALTER PROCEDURE sp_ActualizarSala
    @SalaId        INT,
    @ProfesionalId INT,
    @Nombre        NVARCHAR(300),
    @Descripcion   NVARCHAR(MAX) = NULL,
    @Tipo          NVARCHAR(10)  = N'Publica',
    @CupoMaximo    INT,
    @FechaInicio   DATETIME2(0)  = NULL,
    @Precio        DECIMAL(10,2) = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM Sala
        WHERE SalaId = @SalaId AND ProfesionalId = @ProfesionalId AND Estado = N'Abierta')
    BEGIN
        SELECT 0 AS Exito, N'No puedes editar esta sala (no existe, no es tuya o ya está cerrada).' AS Mensaje;
        RETURN;
    END

    DECLARE @Inscritos INT = (
        SELECT COUNT(*) FROM Inscripcion
        WHERE SalaId = @SalaId AND Estado NOT IN (N'Cancelada', N'SinCupos'));

    IF @CupoMaximo < @Inscritos
    BEGIN
        SELECT 0 AS Exito, N'La capacidad no puede ser menor que el número de inscritos actuales.' AS Mensaje;
        RETURN;
    END

    IF @Tipo NOT IN (N'Publica', N'Privada')
        SET @Tipo = N'Publica';

    UPDATE Sala
    SET    Nombre = @Nombre,
           Descripcion = @Descripcion,
           Tipo = @Tipo,
           CupoMaximo = @CupoMaximo,
           Precio = ISNULL(@Precio, 0),
           FechaModificacion = GETDATE()
    WHERE  SalaId = @SalaId AND ProfesionalId = @ProfesionalId;

    IF @FechaInicio IS NOT NULL
    BEGIN
        UPDATE Evento
        SET    Nombre = @Nombre,
               Descripcion = @Descripcion,
               FechaInicio = @FechaInicio,
               FechaFin = DATEADD(DAY, 30, @FechaInicio)
        WHERE  SalaId = @SalaId AND Estado = N'Abierto'
          AND  EventoId = (
                SELECT TOP 1 EventoId FROM Evento
                WHERE SalaId = @SalaId AND Estado = N'Abierto'
                ORDER BY FechaInicio ASC);
    END
    ELSE
    BEGIN
        UPDATE Evento
        SET    Nombre = @Nombre,
               Descripcion = @Descripcion
        WHERE  SalaId = @SalaId AND Estado = N'Abierto'
          AND  EventoId = (
                SELECT TOP 1 EventoId FROM Evento
                WHERE SalaId = @SalaId AND Estado = N'Abierto'
                ORDER BY FechaInicio ASC);
    END

    SELECT 1 AS Exito, N'Sala actualizada correctamente.' AS Mensaje;
END
GO

PRINT N'Confirmación inscripción y actualizar sala aplicados.';
GO

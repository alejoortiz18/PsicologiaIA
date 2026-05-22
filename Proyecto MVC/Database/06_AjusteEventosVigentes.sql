-- Ajuste: eventos abiertos con fechas en el pasado no aparecen en Home/Eventos (FechaFin >= GETDATE()).
-- Este script mueve al futuro los eventos Abierto cuya fecha de fin ya pasó.
USE TrebolDB;
GO

UPDATE e
SET    FechaInicio = DATEADD(HOUR, 2, CAST(DATEADD(DAY, 1, CAST(GETDATE() AS DATE)) AS DATETIME2(0))),
       FechaFin    = DATEADD(HOUR, 4, CAST(DATEADD(DAY, 1, CAST(GETDATE() AS DATE)) AS DATETIME2(0)))
FROM   Evento e
WHERE  e.Estado = N'Abierto'
  AND  e.FechaFin < GETDATE();

PRINT N'Eventos actualizados: ' + CAST(@@ROWCOUNT AS NVARCHAR(10));
GO

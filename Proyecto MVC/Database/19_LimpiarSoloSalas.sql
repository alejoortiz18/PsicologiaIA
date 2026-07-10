-- Elimina todas las salas y datos relacionados. Conserva Usuario, Profesional, catálogos y citas.
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;
GO

DELETE FROM MensajeEvento;
DELETE FROM PagoInscripcion;
DELETE FROM Inscripcion;
DELETE FROM Evento;
DELETE FROM Sala;

PRINT N'Salas y relaciones eliminadas. Usuarios y profesionales conservados.';
GO

-- Limpia datos operativos; conserva Administrador y catálogos (Pais, Ciudad, etc.).
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;
GO

DELETE FROM MensajeEvento;
DELETE FROM PagoInscripcion;
DELETE FROM Inscripcion;
DELETE FROM PagoCita;
DELETE FROM Cita;
DELETE FROM Evento;
DELETE FROM MensajePrivado;
DELETE FROM Conversacion;
DELETE FROM Seguidor;
DELETE FROM ColaboracionProfesional;
DELETE FROM ComentarioProfesional;
DELETE FROM Notificacion;
DELETE FROM Sesion;
DELETE FROM Sala;
DELETE FROM HorarioBloqueado;
DELETE FROM HorarioDisponible;
DELETE FROM CuentaBancaria;
DELETE FROM TokenValidacion;
DELETE FROM TokenActivacion;
DELETE FROM TokenRecuperacion;
DELETE FROM ProfesionalEstudio;
DELETE FROM ProfesionalIdioma;
DELETE FROM ProfesionalEspecialidad;
DELETE FROM Profesional;
DELETE FROM Usuario;

PRINT N'Limpieza completada. Administrador y catálogos conservados.';
GO

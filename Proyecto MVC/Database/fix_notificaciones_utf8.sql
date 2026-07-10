-- TrebolDB — Corrige títulos de notificaciones con mojibake (es-CO, UTF-8 / NVARCHAR)
-- Ejecutar: sqlcmd -S "(localdb)\MSSQLLocalDB" -d TrebolDB -f 65001 -i fix_notificaciones_utf8.sql
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

UPDATE Notificacion
SET Titulo = N'Nuevo profesional — pendiente de validación de correo'
WHERE Tipo = 'RegistroProfesional'
  AND Titulo LIKE N'Nuevo profesional%validaci%correo%';

UPDATE Notificacion
SET Titulo = N'Profesional listo para revisión'
WHERE Titulo LIKE N'Profesional listo para revisi%';

UPDATE Notificacion
SET Titulo = N'Profesional reenviando documentos para nueva revisión'
WHERE Titulo LIKE N'Profesional reenviando documentos%';

UPDATE Notificacion
SET Descripcion = REPLACE(Descripcion, N' | Email confirmado', N' | Correo confirmado')
WHERE Descripcion LIKE N'% | Email confirmado%';

UPDATE Administrador
SET NombreCompleto = N'Administrador Trébol'
WHERE Correo = N'psicologiatrevol@gmail.com'
  AND NombreCompleto <> N'Administrador Trébol';
GO

-- Corrige mojibake en Especialidad (Médico / Psicólogo) usando Unicode explícito (UTF-16)
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

UPDATE Especialidad
SET    Nombre = N'M' + NCHAR(0x00E9) + N'dico'
WHERE  EspecialidadId = 9;

UPDATE Especialidad
SET    Nombre = N'Psic' + NCHAR(0x00F3) + N'logo'
WHERE  EspecialidadId = 10;

-- Otras especialidades con tildes (por si el seed original falló)
UPDATE Especialidad SET Nombre = N'Psicolog' + NCHAR(0x00ED) + N'a Cl' + NCHAR(0x00ED) + N'nica' WHERE EspecialidadId = 1;
UPDATE Especialidad SET Nombre = N'Psicolog' + NCHAR(0x00ED) + N'a Infantil' WHERE EspecialidadId = 2;
UPDATE Especialidad SET Nombre = N'Neuropsicolog' + NCHAR(0x00ED) + N'a' WHERE EspecialidadId = 3;
UPDATE Especialidad SET Nombre = N'Psicolog' + NCHAR(0x00ED) + N'a Organizacional' WHERE EspecialidadId = 4;
UPDATE Especialidad SET Nombre = N'Terapia Cognitivo-Conductual' WHERE EspecialidadId = 5;
UPDATE Especialidad SET Nombre = N'Salud Mental' WHERE EspecialidadId = 6;
UPDATE Especialidad SET Nombre = N'Psicoan' + NCHAR(0x00E1) + N'lisis' WHERE EspecialidadId = 7;
UPDATE Especialidad SET Nombre = N'Terapia de Pareja' WHERE EspecialidadId = 8;

PRINT N'Especialidad: nombres corregidos (UTF-16).';
GO

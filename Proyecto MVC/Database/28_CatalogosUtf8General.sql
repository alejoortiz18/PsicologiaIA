-- Catálogos TrebolDB: corrige mojibake y tildes (reglas UI §14.2) en tablas de referencia.
-- Ejecutar: sqlcmd -S "SERVIDOR\INSTANCIA" -d TrebolDB -E -i 28_CatalogosUtf8General.sql -f 65001
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

/* ── País ── */
UPDATE Pais SET Nombre = N'Colombia'  WHERE Codigo = N'CO';
UPDATE Pais SET Nombre = N'Venezuela' WHERE Codigo = N'VE';
UPDATE Pais SET Nombre = N'Ecuador'   WHERE Codigo = N'EC';
UPDATE Pais SET Nombre = N'Per' + NCHAR(0x00FA) WHERE Codigo = N'PE';
GO

/* ── Ciudad (Colombia) ── */
UPDATE Ciudad SET Nombre = N'Bogot' + NCHAR(0x00E1) WHERE Nombre LIKE N'Bogot%';
UPDATE Ciudad SET Nombre = N'Medell' + NCHAR(0x00ED) + N'n' WHERE Nombre LIKE N'Medell%';
UPDATE Ciudad SET Nombre = N'Cali'           WHERE Nombre LIKE N'Cali%';
UPDATE Ciudad SET Nombre = N'Barranquilla'   WHERE Nombre LIKE N'Barranquilla%';
UPDATE Ciudad SET Nombre = N'Bucaramanga'    WHERE Nombre LIKE N'Bucaramanga%';
UPDATE Ciudad SET Nombre = N'Manizales'     WHERE Nombre LIKE N'Manizales%';
UPDATE Ciudad SET Nombre = N'Pereira'       WHERE Nombre LIKE N'Pereira%';
UPDATE Ciudad SET Nombre = N'Cartagena'     WHERE Nombre LIKE N'Cartagena%';
GO

/* ── Especialidad ── */
UPDATE Especialidad SET Nombre = N'Psicolog' + NCHAR(0x00ED) + N'a Cl' + NCHAR(0x00ED) + N'nica' WHERE EspecialidadId = 1;
UPDATE Especialidad SET Nombre = N'Psicolog' + NCHAR(0x00ED) + N'a Infantil' WHERE EspecialidadId = 2;
UPDATE Especialidad SET Nombre = N'Neuropsicolog' + NCHAR(0x00ED) + N'a' WHERE EspecialidadId = 3;
UPDATE Especialidad SET Nombre = N'Psicolog' + NCHAR(0x00ED) + N'a Organizacional' WHERE EspecialidadId = 4;
UPDATE Especialidad SET Nombre = N'Terapia Cognitivo-Conductual' WHERE EspecialidadId = 5;
UPDATE Especialidad SET Nombre = N'Salud Mental' WHERE EspecialidadId = 6;
UPDATE Especialidad SET Nombre = N'Psicoan' + NCHAR(0x00E1) + N'lisis' WHERE EspecialidadId = 7;
UPDATE Especialidad SET Nombre = N'Terapia de Pareja' WHERE EspecialidadId = 8;
UPDATE Especialidad SET Nombre = N'M' + NCHAR(0x00E9) + N'dico' WHERE EspecialidadId = 9;
UPDATE Especialidad SET Nombre = N'Psic' + NCHAR(0x00F3) + N'logo' WHERE EspecialidadId = 10;
GO

/* ── Categoría (salas / eventos) ── */
UPDATE Categoria SET Nombre = N'Bienestar mental' WHERE CategoriaId = 1;
UPDATE Categoria SET Nombre = N'Ansiedad' WHERE CategoriaId = 2;
UPDATE Categoria SET Nombre = N'Depresi' + NCHAR(0x00F3) + N'n' WHERE CategoriaId = 3;
UPDATE Categoria SET Nombre = N'Familia' WHERE CategoriaId = 4;
UPDATE Categoria SET Nombre = N'Trabajo y estr' + NCHAR(0x00E9) + N's' WHERE CategoriaId = 5;
UPDATE Categoria SET Nombre = N'Relaciones' WHERE CategoriaId = 6;
UPDATE Categoria SET Nombre = N'Crianza' WHERE CategoriaId = 7;
UPDATE Categoria SET Nombre = N'Mindfulness' WHERE CategoriaId = 8;
GO

/* ── Idioma (reafirmar catálogo UTF-16) ── */
MERGE Idioma AS dest
USING (VALUES
    (N'Espa' + NCHAR(0x00F1) + N'ol',   N'es'),
    (N'Ingl' + NCHAR(0x00E9) + N's',    N'en'),
    (N'Franc' + NCHAR(0x00E9) + N's',   N'fr'),
    (N'Portugu' + NCHAR(0x00E9) + N's', N'pt'),
    (N'Alem' + NCHAR(0x00E1) + N'n',    N'de'),
    (N'Italiano',                       N'it'),
    (N'Mandar' + NCHAR(0x00ED) + N'n',  N'zh'),
    (N'Japon' + NCHAR(0x00E9) + N's',   N'ja'),
    (N'Coreano',                        N'ko'),
    (NCHAR(0x00C1) + N'rabe',           N'ar'),
    (N'Ruso',                           N'ru'),
    (N'Hindi',                          N'hi'),
    (N'Holand' + NCHAR(0x00E9) + N's',  N'nl'),
    (N'Rumano',                         N'ro'),
    (N'Catal' + NCHAR(0x00E1) + N'n',   N'ca'),
    (N'Polaco',                         N'pl'),
    (N'Turco',                          N'tr'),
    (N'Hebreo',                         N'he'),
    (N'Ucraniano',                      N'uk')
) AS src (Nombre, Codigo)
ON dest.Codigo = src.Codigo
WHEN MATCHED THEN UPDATE SET Nombre = src.Nombre
WHEN NOT MATCHED BY TARGET THEN INSERT (Nombre, Codigo) VALUES (src.Nombre, src.Codigo);
GO

/* ── Configuración (descripciones admin) ── */
UPDATE Configuracion SET Descripcion = N'Tarifa fija por cita ($COP)'
WHERE Clave = N'TarifaPlataformaCita';

UPDATE Configuracion SET Descripcion = N'M' + NCHAR(0x00E1) + N'ximo de intentos de login antes de bloqueo'
WHERE Clave = N'MaxIntentosSesion';

UPDATE Configuracion SET Descripcion = N'Vigencia token activaci' + NCHAR(0x00F3) + N'n usuario (horas)'
WHERE Clave = N'HorasTokenValidacion';

UPDATE Configuracion SET Descripcion = N'Vigencia token activaci' + NCHAR(0x00F3) + N'n profesional (d' + NCHAR(0x00ED) + N'as)'
WHERE Clave = N'DiasTokenActivacion';

UPDATE Configuracion SET Descripcion = N'Vigencia token recuperaci' + NCHAR(0x00F3) + N'n contrase' + NCHAR(0x00F1) + N'a (horas)'
WHERE Clave = N'HorasTokenRecuperacion';

UPDATE Configuracion SET Descripcion = N'Porcentaje de IVA aplicado al valor de cita privada'
WHERE Clave = N'PorcentajeIvaCita';
GO

/* ── Notificaciones (plantillas con mojibake) ── */
UPDATE Notificacion
SET Titulo = N'Nuevo profesional — pendiente de validaci' + NCHAR(0x00F3) + N'n de correo'
WHERE Tipo = N'RegistroProfesional'
  AND Titulo LIKE N'%validaci%correo%';

UPDATE Notificacion
SET Titulo = N'Profesional listo para revisi' + NCHAR(0x00F3) + N'n'
WHERE Titulo LIKE N'Profesional listo para revisi%';

UPDATE Notificacion
SET Titulo = N'Profesional reenviando documentos para nueva revisi' + NCHAR(0x00F3) + N'n'
WHERE Titulo LIKE N'Profesional reenviando documentos%';

UPDATE Notificacion
SET Descripcion = REPLACE(Descripcion, N' | Email confirmado', N' | Correo confirmado')
WHERE Descripcion LIKE N'% | Email confirmado%';

UPDATE Notificacion
SET Descripcion = REPLACE(Descripcion, N'validaciÃ³n', N'validaci' + NCHAR(0x00F3) + N'n')
WHERE Descripcion LIKE N'%validaci%';

UPDATE Notificacion
SET Descripcion = REPLACE(Descripcion, N'revisiÃ³n', N'revisi' + NCHAR(0x00F3) + N'n')
WHERE Descripcion LIKE N'%revisi%';
GO

/* ── Administrador ── */
UPDATE Administrador
SET NombreCompleto = N'Administrador Tr' + NCHAR(0x00E9) + N'bol'
WHERE Correo = N'psicologiatrevol@gmail.com';
GO

PRINT N'Catálogos UTF-8 corregidos: Pais, Ciudad, Especialidad, Categoria, Idioma, Configuracion, Notificacion, Administrador.';
GO

-- Catálogo Idioma: corregir mojibake (reglas UI §14.2) y ampliar idiomas comunes (UTF-8 / NVARCHAR).
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

/* Corregir nombres existentes sin tildes o mal codificados */
UPDATE Idioma SET Nombre = N'Español'   WHERE Codigo = N'es';
UPDATE Idioma SET Nombre = N'Inglés'    WHERE Codigo = N'en';
UPDATE Idioma SET Nombre = N'Francés'   WHERE Codigo = N'fr';
UPDATE Idioma SET Nombre = N'Portugués'  WHERE Codigo = N'pt';
GO

/* Insertar idiomas adicionales (idempotente por Codigo) */
MERGE Idioma AS dest
USING (VALUES
    (N'Alemán',     N'de'),
    (N'Italiano',   N'it'),
    (N'Mandarín',   N'zh'),
    (N'Japonés',    N'ja'),
    (N'Coreano',    N'ko'),
    (N'Árabe',      N'ar'),
    (N'Ruso',       N'ru'),
    (N'Hindi',      N'hi'),
    (N'Holandés',   N'nl'),
    (N'Rumano',     N'ro'),
    (N'Catalán',    N'ca'),
    (N'Polaco',     N'pl'),
    (N'Turco',      N'tr'),
    (N'Hebreo',     N'he'),
    (N'Ucraniano',  N'uk')
) AS src (Nombre, Codigo)
ON dest.Codigo = src.Codigo
WHEN MATCHED AND dest.Nombre <> src.Nombre THEN
    UPDATE SET Nombre = src.Nombre
WHEN NOT MATCHED BY TARGET THEN
    INSERT (Nombre, Codigo) VALUES (src.Nombre, src.Codigo);
GO

PRINT N'Catálogo Idioma actualizado (UTF-8, sin mojibake).';
GO

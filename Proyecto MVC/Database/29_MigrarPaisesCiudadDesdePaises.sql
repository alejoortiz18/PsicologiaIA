-- Migra catálogos Pais y Ciudad desde base Paises → TrebolDB.
-- Origen:  Paises.dbo.Pais   (235 filas, PaisId 727–968)
--          Paises.dbo.Ciudad (162962 filas, CiudadId 1744–164705)
-- Destino: TrebolDB (Codigo ← Iso2, Estado=1). Moneda se asigna en script 30.
--
-- Ejecutar: sqlcmd -S "SERVIDOR\INSTANCIA" -d TrebolDB -E -i 29_MigrarPaisesCiudadDesdePaises.sql -f 65001

USE TrebolDB;
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
GO

IF DB_ID(N'Paises') IS NULL
BEGIN
    RAISERROR(N'La base de datos Paises no existe en este servidor.', 16, 1);
    RETURN;
END
GO

/* ── 1. Esquema Trebol ── */
IF COL_LENGTH('Pais', 'Moneda') IS NULL
    ALTER TABLE Pais ADD Moneda NVARCHAR(3) NULL;
GO

/* ── 2. Guardar referencias actuales de profesionales/usuarios ── */
IF OBJECT_ID('tempdb..#RefUbicacion') IS NOT NULL DROP TABLE #RefUbicacion;

SELECT
    N'Profesional' AS Entidad,
    p.ProfesionalId AS EntidadId,
    pa.Codigo AS PaisCodigo,
    ci.Nombre AS CiudadNombre
INTO #RefUbicacion
FROM Profesional p
LEFT JOIN Pais pa ON pa.PaisId = p.PaisId
LEFT JOIN Ciudad ci ON ci.CiudadId = p.CiudadId
WHERE p.PaisId IS NOT NULL OR p.CiudadId IS NOT NULL

UNION ALL

SELECT
    N'Usuario',
    u.UsuarioId,
    NULL,
    ci.Nombre
FROM Usuario u
LEFT JOIN Ciudad ci ON ci.CiudadId = u.CiudadId
WHERE u.CiudadId IS NOT NULL;
GO

/* ── 3. Desvincular FKs antes de reemplazar catálogo ── */
UPDATE Profesional SET PaisId = NULL, CiudadId = NULL
WHERE PaisId IS NOT NULL OR CiudadId IS NOT NULL;

UPDATE Usuario SET CiudadId = NULL
WHERE CiudadId IS NOT NULL;
GO

DELETE FROM Ciudad;
DELETE FROM Pais;
GO

/* ── 4. Copiar países (conservando PaisId del origen) ── */
SET IDENTITY_INSERT Pais ON;

INSERT INTO Pais (PaisId, Nombre, Codigo, Estado, Moneda)
SELECT
    src.PaisId,
    src.Nombre,
    RTRIM(src.Iso2),
    1,
    NULL
FROM Paises.dbo.Pais AS src;

SET IDENTITY_INSERT Pais OFF;
GO

/* ── 5. Copiar ciudades (conservando CiudadId del origen) ── */
SET IDENTITY_INSERT Ciudad ON;

INSERT INTO Ciudad (CiudadId, PaisId, Nombre, Estado)
SELECT
    src.CiudadId,
    src.PaisId,
    src.Nombre,
    1
FROM Paises.dbo.Ciudad AS src;

SET IDENTITY_INSERT Ciudad OFF;
GO

/* ── 6. Ajustar semillas IDENTITY ── */
DECLARE @MaxPais   INT = (SELECT MAX(PaisId)   FROM Pais);
DECLARE @MaxCiudad INT = (SELECT MAX(CiudadId) FROM Ciudad);
DBCC CHECKIDENT ('Pais',   RESEED, @MaxPais);
DBCC CHECKIDENT ('Ciudad', RESEED, @MaxCiudad);
GO

/* ── 7. Restaurar referencias por código ISO + nombre de ciudad ── */
UPDATE p
SET
    PaisId   = np.PaisId,
    CiudadId = nc.CiudadId
FROM Profesional p
JOIN #RefUbicacion r ON r.Entidad = N'Profesional' AND r.EntidadId = p.ProfesionalId
LEFT JOIN Pais np ON np.Codigo = r.PaisCodigo
LEFT JOIN Ciudad nc ON nc.PaisId = np.PaisId AND nc.Nombre = r.CiudadNombre;
GO

UPDATE u
SET CiudadId = nc.CiudadId
FROM Usuario u
JOIN #RefUbicacion r ON r.Entidad = N'Usuario' AND r.EntidadId = u.UsuarioId
JOIN Ciudad oc ON oc.Nombre = r.CiudadNombre
JOIN Ciudad nc ON nc.Nombre = oc.Nombre AND nc.CiudadId = (
    SELECT TOP 1 c2.CiudadId
    FROM Ciudad c2
    WHERE c2.Nombre = r.CiudadNombre
    ORDER BY c2.CiudadId
);
GO

/* ── 8. Resumen ── */
SELECT
    (SELECT COUNT(*) FROM Pais)   AS TotalPaises,
    (SELECT COUNT(*) FROM Ciudad) AS TotalCiudades,
    (SELECT COUNT(*) FROM Ciudad c JOIN Pais p ON p.PaisId = c.PaisId WHERE p.Codigo = N'CO') AS CiudadesColombia;

SELECT p.ProfesionalId, p.NombreCompleto, p.PaisId, pa.Nombre AS Pais, p.CiudadId, ci.Nombre AS Ciudad
FROM Profesional p
LEFT JOIN Pais pa ON pa.PaisId = p.PaisId
LEFT JOIN Ciudad ci ON ci.CiudadId = p.CiudadId
WHERE p.ProfesionalId IN (65, 66);

PRINT N'Migración Paises → TrebolDB completada.';
GO

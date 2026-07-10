-- Perfil profesional: niveles de estudio ampliados + nivel de idioma
USE TrebolDB;
GO

SET QUOTED_IDENTIFIER ON;
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_ProfEstudio_Nivel')
    ALTER TABLE ProfesionalEstudio DROP CONSTRAINT CK_ProfEstudio_Nivel;
GO

ALTER TABLE ProfesionalEstudio WITH CHECK ADD CONSTRAINT CK_ProfEstudio_Nivel
    CHECK (Nivel IN (N'Pregrado', N'Posgrado', N'Maestria', N'Doctorado', N'Especializacion'));
GO

IF COL_LENGTH('ProfesionalIdioma', 'Nivel') IS NULL
BEGIN
    ALTER TABLE ProfesionalIdioma ADD Nivel NVARCHAR(20) NOT NULL
        CONSTRAINT DF_ProfesionalIdioma_Nivel DEFAULT N'Intermedio';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_ProfIdioma_Nivel')
BEGIN
    ALTER TABLE ProfesionalIdioma WITH CHECK ADD CONSTRAINT CK_ProfIdioma_Nivel
        CHECK (Nivel IN (N'Basico', N'Intermedio', N'Avanzado', N'Nativo'));
END
GO

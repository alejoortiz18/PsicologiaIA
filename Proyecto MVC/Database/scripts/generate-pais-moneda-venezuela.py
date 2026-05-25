# Genera fragmentos SQL: moneda por país + ciudades de Venezuela
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
VEN_FILE = pathlib.Path(r"C:\Users\Alejandro\.cursor\projects\e-Proyecto-Psicologia-Proyecto-con-IA-PsicologiaIA\agent-tools\5d43175a-5d21-41b1-8e34-4a55dfcdb8e2.txt")
PAIS_FILE = pathlib.Path(r"C:\Users\Alejandro\.cursor\projects\e-Proyecto-Psicologia-Proyecto-con-IA-PsicologiaIA\agent-tools\paises-trebol.txt")

# ISO 3166-1 alpha-2 -> ISO 4217 (principal moneda legal)
MONEDA = {
    "AD": "EUR", "AE": "AED", "AF": "AFN", "AG": "XCD", "AI": "XCD", "AL": "ALL", "AM": "AMD",
    "AO": "AOA", "AR": "ARS", "AS": "USD", "AT": "EUR", "AU": "AUD", "AW": "AWG", "AZ": "AZN",
    "BA": "BAM", "BB": "BBD", "BD": "BDT", "BE": "EUR", "BF": "XOF", "BG": "BGN", "BH": "BHD",
    "BI": "BIF", "BJ": "XOF", "BM": "BMD", "BN": "BND", "BO": "BOB", "BR": "BRL", "BS": "BSD",
    "BT": "BTN", "BW": "BWP", "BY": "BYN", "BZ": "BZD", "CA": "CAD", "CC": "AUD", "CD": "CDF",
    "CF": "XAF", "CG": "XAF", "CH": "CHF", "CI": "XOF", "CK": "NZD", "CL": "CLP", "CM": "XAF",
    "CN": "CNY", "CO": "COP", "CR": "CRC", "CU": "CUP", "CV": "CVE", "CX": "AUD", "CY": "EUR",
    "CZ": "CZK", "DE": "EUR", "DJ": "DJF", "DK": "DKK", "DM": "XCD", "DO": "DOP", "DZ": "DZD",
    "EC": "USD", "EE": "EUR", "EG": "EGP", "ER": "ERN", "ES": "EUR", "ET": "ETB", "FI": "EUR",
    "FJ": "FJD", "FK": "FKP", "FM": "USD", "FO": "DKK", "FR": "EUR", "GA": "XAF", "GB": "GBP",
    "GD": "XCD", "GE": "GEL", "GF": "EUR", "GG": "GBP", "GH": "GHS", "GI": "GIP", "GL": "DKK",
    "GM": "GMD", "GN": "GNF", "GP": "EUR", "GQ": "XAF", "GR": "EUR", "GS": "GBP", "GT": "GTQ",
    "GU": "USD", "GW": "XOF", "GY": "GYD", "HK": "HKD", "HN": "HNL", "HR": "EUR", "HT": "HTG",
    "HU": "HUF", "ID": "IDR", "IE": "EUR", "IL": "ILS", "IM": "GBP", "IN": "INR", "IO": "USD",
    "IQ": "IQD", "IR": "IRR", "IS": "ISK", "IT": "EUR", "JE": "GBP", "JM": "JMD", "JO": "JOD",
    "JP": "JPY", "KE": "KES", "KG": "KGS", "KH": "KHR", "KI": "AUD", "KM": "KMF", "KN": "XCD",
    "KP": "KPW", "KR": "KRW", "KW": "KWD", "KY": "KYD", "KZ": "KZT", "LA": "LAK", "LB": "LBP",
    "LC": "XCD", "LI": "CHF", "LK": "LKR", "LR": "LRD", "LS": "LSL", "LT": "EUR", "LU": "EUR",
    "LV": "EUR", "LY": "LYD", "MA": "MAD", "MC": "EUR", "MD": "MDL", "ME": "EUR", "MG": "MGA",
    "MH": "USD", "MK": "MKD", "ML": "XOF", "MM": "MMK", "MN": "MNT", "MO": "MOP", "MP": "USD",
    "MQ": "EUR", "MR": "MRU", "MS": "XCD", "MT": "EUR", "MU": "MUR", "MV": "MVR", "MW": "MWK",
    "MX": "MXN", "MY": "MYR", "MZ": "MZN", "NA": "NAD", "NC": "XPF", "NE": "XOF", "NF": "AUD",
    "NG": "NGN", "NI": "NIO", "NL": "EUR", "NO": "NOK", "NP": "NPR", "NR": "AUD", "NU": "NZD",
    "NZ": "NZD", "OM": "OMR", "PA": "PAB", "PE": "PEN", "PF": "XPF", "PG": "PGK", "PH": "PHP",
    "PK": "PKR", "PL": "PLN", "PM": "EUR", "PN": "NZD", "PR": "USD", "PS": "ILS", "PT": "EUR",
    "PW": "USD", "PY": "PYG", "QA": "QAR", "RE": "EUR", "RO": "RON", "RS": "RSD", "RU": "RUB",
    "RW": "RWF", "SA": "SAR", "SB": "SBD", "SC": "SCR", "SD": "SDG", "SE": "SEK", "SG": "SGD",
    "SH": "SHP", "SI": "EUR", "SK": "EUR", "SL": "SLE", "SM": "EUR", "SN": "XOF", "SO": "SOS",
    "SR": "SRD", "SS": "SSP", "ST": "STN", "SV": "USD", "SY": "SYP", "SZ": "SZL", "TC": "USD",
    "TD": "XAF", "TG": "XOF", "TH": "THB", "TJ": "TJS", "TK": "NZD", "TL": "USD", "TM": "TMT",
    "TN": "TND", "TO": "TOP", "TR": "TRY", "TT": "TTD", "TV": "AUD", "TW": "TWD", "TZ": "TZS",
    "UA": "UAH", "UG": "UGX", "US": "USD", "UY": "UYU", "UZ": "UZS", "VA": "EUR", "VC": "XCD",
    "VE": "VES", "VG": "USD", "VI": "USD", "VN": "VND", "VU": "VUV", "WF": "XPF", "WS": "WST",
    "YE": "YER", "YT": "EUR", "ZA": "ZAR", "ZM": "ZMW", "ZW": "ZWL",
    # códigos especiales en catálogo
    "EL": "EUR", "UK": "GBP",
}

NOMBRE_ES = {
    "CO": "Colombia", "VE": "Venezuela", "PE": "Perú", "EC": "Ecuador", "MX": "México",
    "AR": "Argentina", "BO": "Bolivia", "BR": "Brasil", "CL": "Chile", "CR": "Costa Rica",
    "CU": "Cuba", "DO": "República Dominicana", "SV": "El Salvador", "GT": "Guatemala",
    "HN": "Honduras", "NI": "Nicaragua", "PA": "Panamá", "PY": "Paraguay", "UY": "Uruguay",
    "US": "Estados Unidos", "ES": "España", "FR": "Francia", "DE": "Alemania", "IT": "Italia",
    "PT": "Portugal", "GB": "Reino Unido", "UK": "Reino Unido", "JP": "Japón", "CN": "China",
    "CI": "Costa de Marfil", "BO": "Bolivia", "EG": "Egipto", "MA": "Marruecos", "CH": "Suiza",
    "NL": "Países Bajos", "BE": "Bélgica", "SE": "Suecia", "NO": "Noruega", "DK": "Dinamarca",
    "FI": "Finlandia", "PL": "Polonia", "GR": "Grecia", "AT": "Austria", "IE": "Irlanda",
    "RU": "Rusia", "TR": "Turquía", "IN": "India", "AU": "Australia", "NZ": "Nueva Zelanda",
    "CA": "Canadá", "ZA": "Sudáfrica", "KR": "Corea del Sur", "KP": "Corea del Norte",
    "AE": "Emiratos Árabes Unidos", "SA": "Arabia Saudita", "IL": "Israel", "PH": "Filipinas",
    "TH": "Tailandia", "VN": "Vietnam", "MY": "Malasia", "SG": "Singapur", "ID": "Indonesia",
}

CIUDAD_FIX = {
    "Bogota": "Bogotá",
    "San Cristobal": "San Cristóbal",
    "La Concepcion de Trujllo": "La Concepción de Trujillo",
    "Santa Cruz De Bucaral": "Santa Cruz de Bucaral",
    "Santa Bárbara Del Zulia": "Santa Bárbara del Zulia",
}


def sql_str(s: str) -> str:
    return "N'" + s.replace("'", "''") + "'"


def parse_names(content: str, table: str) -> list[str]:
    m = re.search(rf"INSERT INTO `{table}` VALUES (.+?);", content, re.S)
    if not m:
        return []
    return [x.replace("''", "'") for x in re.findall(r"\(\d+,\d+,'((?:''|[^'])*)'", m.group(1))]


def main():
    ven = VEN_FILE.read_text(encoding="utf-8")
    ciudades = parse_names(ven, "ciudades")
    municipios = parse_names(ven, "municipios")
    venezuela = sorted({CIUDAD_FIX.get(n, n) for n in ciudades + municipios})

    paises = []
    for line in PAIS_FILE.read_text(encoding="utf-8-sig").splitlines():
        if "|" not in line:
            continue
        codigo, nombre = line.split("|", 1)
        paises.append((codigo.strip(), nombre.strip()))

    out = ROOT / "30_AjustePaisesCiudadMonedaUtf8.sql"
    lines = [
        "-- Ajuste catálogos: Moneda, nombres UTF-8, ciudades Venezuela",
        "-- Ejecutar: sqlcmd -S SERVIDOR -d TrebolDB -E -i 30_AjustePaisesCiudadMonedaUtf8.sql -f 65001",
        "USE TrebolDB;",
        "GO",
        "SET NOCOUNT ON;",
        "SET QUOTED_IDENTIFIER ON;",
        "GO",
        "",
        "/* Quitar coordenadas; agregar Moneda */",
        "IF COL_LENGTH('Pais', 'Moneda') IS NULL",
        "    ALTER TABLE Pais ADD Moneda NVARCHAR(3) NULL;",
        "GO",
    ]

    # drop longitud/latitud
    lines += [
        "IF COL_LENGTH('Pais', 'Longitud') IS NOT NULL",
        "BEGIN",
        "    DECLARE @sqlDrop NVARCHAR(MAX) = N'';",
        "    SELECT @sqlDrop = @sqlDrop + N'ALTER TABLE Pais DROP CONSTRAINT ' + QUOTENAME(dc.name) + N';'",
        "    FROM sys.default_constraints dc",
        "    JOIN sys.columns c ON c.default_object_id = dc.object_id",
        "    WHERE dc.parent_object_id = OBJECT_ID(N'Pais') AND c.name IN (N'Longitud', N'Latitud');",
        "    IF LEN(@sqlDrop) > 0 EXEC sp_executesql @sqlDrop;",
        "    ALTER TABLE Pais DROP COLUMN Longitud;",
        "    ALTER TABLE Pais DROP COLUMN Latitud;",
        "END",
        "GO",
        "",
        "/* Moneda por código ISO */",
        "UPDATE p SET Moneda = m.Moneda",
        "FROM Pais p",
        "JOIN (VALUES",
    ]

    moneda_rows = []
    for codigo, _ in paises:
        mon = MONEDA.get(codigo, "USD")
        moneda_rows.append(f"    ({sql_str(codigo)}, {sql_str(mon)})")
    lines.append(",\n".join(moneda_rows))
    lines += [
        ") AS m(Codigo, Moneda) ON m.Codigo = p.Codigo;",
        "GO",
        "",
        "ALTER TABLE Pais ALTER COLUMN Moneda NVARCHAR(3) NOT NULL;",
        "GO",
        "",
        "/* Nombres de países en español (donde aplica) */",
        "UPDATE p SET Nombre = n.Nombre",
        "FROM Pais p",
        "JOIN (VALUES",
    ]
    nombre_rows = [f"    ({sql_str(c)}, {sql_str(n)})" for c, n in sorted(NOMBRE_ES.items())]
    lines.append(",\n".join(nombre_rows))
    lines += [
        ") AS n(Codigo, Nombre) ON n.Codigo = p.Codigo;",
        "GO",
        "",
        "/* Ciudades Colombia: tildes faltantes */",
        "UPDATE Ciudad SET Nombre = N'Bogotá'",
        "WHERE PaisId = (SELECT PaisId FROM Pais WHERE Codigo = N'CO') AND Nombre = N'Bogota';",
        "GO",
        "",
        "/* Colombia: conservar variante con tilde cuando hay duplicado CI_AI */",
        "DECLARE @PaisCo INT = (SELECT PaisId FROM Pais WHERE Codigo = N'CO');",
        "IF OBJECT_ID('tempdb..#CiudadCanon') IS NOT NULL DROP TABLE #CiudadCanon;",
        "SELECT CiudadId, CanonId",
        "INTO #CiudadCanon",
        "FROM (",
        "    SELECT c.CiudadId,",
        "           FIRST_VALUE(c.CiudadId) OVER (",
        "               PARTITION BY c.PaisId, c.Nombre COLLATE Latin1_General_CI_AI",
        "               ORDER BY LEN(c.Nombre) DESC, c.CiudadId",
        "           ) AS CanonId",
        "    FROM Ciudad c",
        "    WHERE c.PaisId = @PaisCo",
        ") x",
        "WHERE CiudadId <> CanonId;",
        "GO",
        "",
        "UPDATE p SET CiudadId = m.CanonId",
        "FROM Profesional p",
        "JOIN #CiudadCanon m ON m.CiudadId = p.CiudadId;",
        "UPDATE u SET CiudadId = m.CanonId",
        "FROM Usuario u",
        "JOIN #CiudadCanon m ON m.CiudadId = u.CiudadId;",
        "DELETE c FROM Ciudad c JOIN #CiudadCanon m ON m.CiudadId = c.CiudadId;",
        "GO",
        "",
        "/* Colombia: unificar duplicados sin tilde cuando existe versión acentuada */",
        "DECLARE @PaisCo INT = (SELECT PaisId FROM Pais WHERE Codigo = N'CO');",
        "UPDATE p SET CiudadId = ca.CiudadId",
        "FROM Profesional p",
        "JOIN Ciudad c ON c.CiudadId = p.CiudadId",
        "JOIN Ciudad ca ON ca.PaisId = c.PaisId",
        "    AND ca.CiudadId <> c.CiudadId",
        "    AND ca.Nombre COLLATE Latin1_General_CI_AI = c.Nombre COLLATE Latin1_General_CI_AI",
        "    AND ca.Nombre LIKE N'%[áéíóúñÁÉÍÓÚÑ]%'",
        "WHERE c.PaisId = @PaisCo",
        "  AND c.Nombre NOT LIKE N'%[áéíóúñÁÉÍÓÚÑ]%';",
        "",
        "UPDATE u SET CiudadId = ca.CiudadId",
        "FROM Usuario u",
        "JOIN Ciudad c ON c.CiudadId = u.CiudadId",
        "JOIN Ciudad ca ON ca.PaisId = c.PaisId",
        "    AND ca.CiudadId <> c.CiudadId",
        "    AND ca.Nombre COLLATE Latin1_General_CI_AI = c.Nombre COLLATE Latin1_General_CI_AI",
        "    AND ca.Nombre LIKE N'%[áéíóúñÁÉÍÓÚÑ]%'",
        "WHERE c.PaisId = @PaisCo",
        "  AND c.Nombre NOT LIKE N'%[áéíóúñÁÉÍÓÚÑ]%';",
        "",
        "DELETE c",
        "FROM Ciudad c",
        "WHERE c.PaisId = @PaisCo",
        "  AND c.Nombre NOT LIKE N'%[áéíóúñÁÉÍÓÚÑ]%'",
        "  AND EXISTS (",
        "      SELECT 1 FROM Ciudad ca",
        "      WHERE ca.PaisId = c.PaisId",
        "        AND ca.CiudadId <> c.CiudadId",
        "        AND ca.Nombre COLLATE Latin1_General_CI_AI = c.Nombre COLLATE Latin1_General_CI_AI",
        "        AND ca.Nombre LIKE N'%[áéíóúñÁÉÍÓÚÑ]%'",
        "  );",
        "GO",
        "",
        "/* Ciudades Venezuela */",
        "DECLARE @PaisVe INT = (SELECT PaisId FROM Pais WHERE Codigo = N'VE');",
        "IF @PaisVe IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Ciudad WHERE PaisId = @PaisVe)",
        "BEGIN",
        "    INSERT INTO Ciudad (PaisId, Nombre, Estado) VALUES",
    ]

    ve_rows = [f"        (@PaisVe, {sql_str(n)}, 1)" for n in venezuela]
    lines.append(",\n".join(ve_rows))
    lines += [
        ";",
        "END",
        "GO",
        "",
        "SELECT (SELECT COUNT(*) FROM Pais) TotalPaises, (SELECT COUNT(*) FROM Ciudad WHERE PaisId=(SELECT PaisId FROM Pais WHERE Codigo=N'VE')) CiudadesVE;",
        "SELECT TOP 5 Codigo, Nombre, Moneda FROM Pais WHERE Codigo IN (N'CO',N'VE',N'PE',N'EC',N'MX');",
        "PRINT N'30_AjustePaisesCiudadMonedaUtf8 aplicado.';",
        "GO",
    ]

    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Generated {out} with {len(venezuela)} ciudades VE, {len(paises)} países")


if __name__ == "__main__":
    main()

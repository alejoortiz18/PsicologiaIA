/**
 * Aprueba profesionales en estado PENDIENTE_APROBACION (dev / pruebas E2E).
 *
 * Uso:
 *   node Test/auto-aprobar-profesionales.js              # listar y aprobar todos
 *   node Test/auto-aprobar-profesionales.js --list       # solo listar
 *   node Test/auto-aprobar-profesionales.js --dry-run    # listar sin aprobar
 *   node Test/auto-aprobar-profesionales.js --id=45
 *   node Test/auto-aprobar-profesionales.js --correo=trebol.pro.test@yopmail.com
 *
 * Nota: solo aplica a PENDIENTE_APROBACION (correo ya confirmado).
 *       PENDIENTE_VALIDACION requiere ConfirmarEmail antes.
 */

const { execSync } = require('child_process');

const SQL_SERVER = process.env.TREBOL_SQL_SERVER || 'DESKALEJO\\SQLEXPRESS';
const SQL_DB = process.env.TREBOL_SQL_DB || 'TrebolDB';

const args = process.argv.slice(2);
const onlyList = args.includes('--list');
const dryRun = args.includes('--dry-run');
const idArg = args.find((a) => a.startsWith('--id='));
const correoArg = args.find((a) => a.startsWith('--correo='));
const filterId = idArg ? parseInt(idArg.split('=')[1], 10) : null;
const filterCorreo = correoArg ? decodeURIComponent(correoArg.split('=').slice(1).join('=')) : null;

function sql(query) {
  const q = query.replace(/"/g, '\\"');
  const cmd = `sqlcmd -S "${SQL_SERVER}" -d ${SQL_DB} -E -Q "${q}" -W -s "|"`;
  return execSync(cmd, { encoding: 'utf8', timeout: 30000 });
}

function parseRows(output) {
  const lines = output
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('-') && !l.startsWith('Changed database'));

  const headerIdx = lines.findIndex((l) => l.includes('ProfesionalId'));
  if (headerIdx === -1) return [];

  return lines.slice(headerIdx + 1).map((line) => {
    const [profesionalId, correo, estado] = line.split('|').map((c) => c.trim());
    if (!profesionalId || Number.isNaN(Number(profesionalId))) return null;
    return { profesionalId: Number(profesionalId), correo, estado };
  }).filter(Boolean);
}

function listPendientes() {
  let where = "Estado = 'PENDIENTE_APROBACION'";
  if (filterId) where += ` AND ProfesionalId = ${filterId}`;
  if (filterCorreo) where += ` AND Correo = '${filterCorreo.replace(/'/g, "''")}'`;

  const out = sql(`SET NOCOUNT ON; SELECT ProfesionalId, Correo, Estado FROM Profesional WHERE ${where} ORDER BY ProfesionalId`);
  return parseRows(out);
}

function aprobar(id) {
  const out = sql(`EXEC sp_AprobarProfesional @ProfesionalId = ${id}, @Aprobado = 1`);
  const ok = out.includes('Profesional aprobado');
  return { ok, out: out.trim() };
}

function main() {
  console.log('\n=== Auto-aprobar profesionales (PENDIENTE_APROBACION) ===\n');

  const pendientes = listPendientes();
  if (pendientes.length === 0) {
    console.log('No hay profesionales pendientes de aprobación.');
    if (filterId || filterCorreo) {
      console.log('(Verifica id/correo o que el estado sea PENDIENTE_APROBACION)');
    }
    return;
  }

  for (const p of pendientes) {
    console.log(`  • [${p.profesionalId}] ${p.correo} (${p.estado})`);
  }

  if (onlyList || dryRun) {
    console.log(dryRun ? '\n(dry-run: no se ejecutó sp_AprobarProfesional)' : '');
    return;
  }

  console.log('');
  let okCount = 0;
  for (const p of pendientes) {
    const result = aprobar(p.profesionalId);
    if (result.ok) {
      okCount++;
      console.log(`  OK   Aprobado id ${p.profesionalId}: ${p.correo}`);
    } else {
      console.error(`  FAIL id ${p.profesionalId}: ${result.out}`);
      process.exitCode = 1;
    }
  }

  console.log(`\nResumen: ${okCount}/${pendientes.length} aprobados.\n`);
}

main();

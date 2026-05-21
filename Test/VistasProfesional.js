/**
 * Recorre TODAS las vistas MVC accesibles al rol Profesional y captura screenshots.
 * Compara con HTML equivalente en Prototipo/ cuando existe.
 *
 * Cuenta: CORREO_PRO + PASSWORD_PRO (env) o último profesional ACTIVO en BD.
 * Sin Gmail.
 *
 * node Test/VistasProfesional.js
 */
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'https://localhost:7072';
const PASSWORD_PRO = process.env.PASSWORD_PRO || 'Password123!';
const PROTO_DIR = path.resolve(__dirname, '../Prototipo');
const SS = path.resolve(__dirname, 'screenshots/vistas-profesional');
const SS_PROTO = path.join(SS, 'prototipo');

const VISTAS_MENU = [
  { etapa: 1, nombre: 'Inicio', ruta: '/HomeProfesional', proto: 'home-profesional.html' },
  { etapa: 1, nombre: 'Mis eventos', ruta: '/MisEventos', proto: 'mis-eventos.html' },
  { etapa: 1, nombre: 'Especialistas', ruta: '/Directorio/Especialistas', proto: 'especialistas.html', submenu: true },
  { etapa: 1, nombre: 'Psicólogos', ruta: '/Directorio/Psicologos', proto: 'psicologos.html', submenu: true },
  { etapa: 1, nombre: 'Mis colegas', ruta: '/Directorio/MisColegas', proto: 'mis-colegas.html', submenu: true },
  { etapa: 2, nombre: 'Mi perfil', ruta: '/PerfilProfesional', proto: 'perfil-profesional.html' },
  { etapa: 2, nombre: 'Citas', ruta: '/PerfilProfesional/Citas', proto: 'perfil-pro-citas.html' },
  { etapa: 2, nombre: 'Mensajes', ruta: '/Mensajeria', proto: 'mensajes-profesional.html' },
];

const VISTAS_EXTRA = [
  { etapa: 2, nombre: 'Perfil — Salas', ruta: '/PerfilProfesional/Salas', proto: 'perfil-pro-salas.html' },
  { etapa: 2, nombre: 'Perfil — Calendario', ruta: '/PerfilProfesional/Calendario', proto: 'perfil-pro-calendario.html' },
  { etapa: 2, nombre: 'Perfil — Indicadores', ruta: '/PerfilProfesional/Indicadores', proto: 'perfil-pro-kpi.html' },
  { etapa: 3, nombre: 'Salas (listado)', ruta: '/Salas', proto: 'perfil-pro-salas.html' },
  { etapa: 3, nombre: 'Nueva sala', ruta: '/Salas/Nueva', proto: null },
  { etapa: 3, nombre: 'Calendario', ruta: '/Calendario', proto: 'perfil-pro-calendario.html' },
  { etapa: 3, nombre: 'Perfil orador — mis salas', ruta: '/PerfilOrador/MisSalas', proto: 'orador-salas.html' },
  { etapa: 3, nombre: 'Sala cita privada', ruta: '/Salas/SalaPrivadaProfesional?citaId={citaId}', proto: 'sala-profesional.html', needsCita: true },
  { etapa: 3, nombre: 'Sala conferencia', ruta: '/Salas/SalaConferenciaProfesional/{salaId}', proto: 'sala-conferencia-profesional.html', needsSala: true },
];

/** Prototipo sin ruta MVC implementada aún (solo referencia visual). */
const PROTO_SIN_MVC = [
  { nombre: 'Perfil orador público', proto: 'perfil-orador.html' },
  { nombre: 'Orador calendario', proto: 'orador-calendario.html' },
  { nombre: 'Orador comentarios', proto: 'orador-comentarios.html' },
  { nombre: 'Citas (alt. prototipo)', proto: 'citas-profesional.html' },
];

if (!fs.existsSync(SS)) fs.mkdirSync(SS, { recursive: true });
if (!fs.existsSync(SS_PROTO)) fs.mkdirSync(SS_PROTO, { recursive: true });

function log(msg) { console.log(`\n[PASO] ${msg}`); }
function ok(msg) { console.log(`       OK   ${msg}`); }
function warn(msg) { console.log(`       WARN ${msg}`); }
function fail(msg) { console.error(`\n[FALLO] ${msg}`); throw new Error(msg); }

function slug(n) {
  return n.normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function obtenerProfesionalActivo() {
  const cmd = `sqlcmd -S "DESKALEJO\\SQLEXPRESS" -d TrebolDB -E -Q "SET NOCOUNT ON; SELECT TOP 1 Correo, ProfesionalId FROM Profesional WHERE Estado IN ('ACTIVO','Aprobado') ORDER BY ProfesionalId DESC" -h -1 -W`;
  const out = execSync(cmd, { encoding: 'utf8', timeout: 15000 });
  const line = out.split('\n').map((l) => l.trim()).find((l) => l.includes('@'));
  if (!line) return null;
  const parts = line.split(/\s+/);
  return { correo: parts[0], id: parts[1] ? parseInt(parts[1], 10) : null };
}

function obtenerCitaProfesional(profesionalId) {
  const cmd = `sqlcmd -S "DESKALEJO\\SQLEXPRESS" -d TrebolDB -E -Q "SET NOCOUNT ON; SELECT TOP 1 CitaId FROM Cita WHERE ProfesionalId = ${profesionalId} AND Estado IN ('Programada','Movida') ORDER BY FechaHora DESC" -h -1 -W`;
  const out = execSync(cmd, { encoding: 'utf8', timeout: 10000 });
  const idLine = out.split('\n').map((l) => l.trim()).find((l) => /^\d+$/.test(l));
  return idLine ? parseInt(idLine, 10) : null;
}

function obtenerSalaAbierta(profesionalId) {
  const cmd = `sqlcmd -S "DESKALEJO\\SQLEXPRESS" -d TrebolDB -E -Q "SET NOCOUNT ON; SELECT TOP 1 SalaId FROM Sala WHERE ProfesionalId = ${profesionalId} AND Estado = 'Abierta' ORDER BY SalaId DESC" -h -1 -W`;
  const out = execSync(cmd, { encoding: 'utf8', timeout: 10000 });
  const idLine = out.split('\n').map((l) => l.trim()).find((l) => /^\d+$/.test(l));
  return idLine ? parseInt(idLine, 10) : null;
}

async function abrirSubmenuProfesionales(page) {
  const toggle = page.locator('#submenu-colegas').locator('xpath=..').locator('[data-submenu="submenu-colegas"]').first();
  const btn = page.locator('[data-submenu="submenu-colegas"]').first();
  if (await btn.count()) {
    const visible = await page.locator('#submenu-colegas').isVisible().catch(() => false);
    if (!visible) await btn.click({ timeout: 3000 }).catch(() => {});
  }
}

async function capturarPrototipo(page, protoFile, ssName) {
  if (!protoFile) return false;
  const full = path.join(PROTO_DIR, protoFile);
  if (!fs.existsSync(full)) {
    warn(`Prototipo no encontrado: ${protoFile}`);
    return false;
  }
  const url = 'file:///' + full.replace(/\\/g, '/');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SS_PROTO, ssName), fullPage: false });
  ok(`Prototipo capturado: ${protoFile}`);
  return true;
}

async function visitarVista(page, vista, idx, profesionalId, ids = {}) {
  let ruta = vista.ruta;
  if (ruta.includes('{id}')) {
    if (!profesionalId) {
      warn(`${vista.nombre}: sin ProfesionalId — omitida`);
      return { nombre: vista.nombre, estado: 'omitida' };
    }
    ruta = ruta.replace('{id}', String(profesionalId));
  }
  if (ruta.includes('{citaId}')) {
    if (!ids.citaId) {
      warn(`${vista.nombre}: sin CitaId en BD — omitida`);
      return { nombre: vista.nombre, estado: 'omitida' };
    }
    ruta = ruta.replace('{citaId}', String(ids.citaId));
  }
  if (ruta.includes('{salaId}')) {
    if (!ids.salaId) {
      warn(`${vista.nombre}: sin SalaId abierta — omitida`);
      return { nombre: vista.nombre, estado: 'omitida' };
    }
    ruta = ruta.replace('{salaId}', String(ids.salaId));
  }

  log(`Vista ${idx}: ${vista.nombre} → ${ruta}`);
  let status = 0;
  let urlFinal = page.url();
  try {
    const res = await page.goto(`${BASE_URL}${ruta}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    status = res?.status() ?? 0;
    urlFinal = page.url();
  } catch (e) {
    warn(`${vista.nombre}: navegación falló — ${e.message.split('\n')[0]}`);
    return { nombre: vista.nombre, estado: 'error', url: urlFinal, detalle: e.message.split('\n')[0] };
  }
  await page.waitForTimeout(1200);
  const ssName = `${String(idx).padStart(2, '0')}-mvc-${slug(vista.nombre)}.png`;
  await page.screenshot({ path: path.join(SS, ssName), fullPage: false });

  const esError = status >= 400 || urlFinal.includes('/Login') || urlFinal.includes('/Account/AccessDenied');
  const tieneLayout = await page.locator('.sidebar, .app-layout, .cita-layout, .conf-layout, main').first().count() > 0;
  const titulo = await page.title();

  if (esError) {
    warn(`${vista.nombre}: HTTP ${status} | URL ${urlFinal}`);
    return { nombre: vista.nombre, estado: 'error', status, url: urlFinal };
  }
  if (!tieneLayout) warn(`${vista.nombre}: layout interno no detectado`);
  ok(`${vista.nombre} — ${titulo || 'sin título'} (${status})`);

  return { nombre: vista.nombre, estado: 'ok', status, url: urlFinal, ss: ssName, proto: vista.proto };
}

async function loginProfesional(page, correo) {
  await page.goto(`${BASE_URL}/Login`, { waitUntil: 'domcontentloaded' });
  await page.fill('#Correo, input[name="Correo"]', correo);
  await page.fill('#Password, input[name="Password"]', PASSWORD_PRO);
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL(/HomeProfesional/i, { timeout: 12000 });
  } catch {
    const err = await page.locator('.text-danger, .alert-danger, .form-error').allTextContents().catch(() => []);
    fail(`Login falló para ${correo}. URL: ${page.url()} | ${JSON.stringify(err)}`);
  }
  ok(`Login profesional: ${correo}`);
}

(async () => {
  const correoEnv = process.env.CORREO_PRO;
  let correo = correoEnv;
  let profesionalId = process.env.PROFESIONAL_ID ? parseInt(process.env.PROFESIONAL_ID, 10) : null;

  if (!correo) {
    const bd = obtenerProfesionalActivo();
    if (!bd) fail('No hay profesional ACTIVO en BD. Ejecuta CrearCuentaProfesional.js o define CORREO_PRO.');
    correo = bd.correo;
    profesionalId = bd.id ?? profesionalId;
    ok(`Profesional desde BD: ${correo} (id=${profesionalId ?? '?'})`);
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
    channel: 'chrome',
    args: ['--ignore-certificate-errors', '--start-maximized'],
  });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  const protoPage = await context.newPage();
  const resultados = [];

  try {
    log('=== Etapa 0: Login ===');
    await loginProfesional(page, correo);

    if (!profesionalId) {
      const m = page.url().match(/HomeProfesional/i);
      if (m) {
        try {
          const cmd = `sqlcmd -S "DESKALEJO\\SQLEXPRESS" -d TrebolDB -E -Q "SET NOCOUNT ON; SELECT ProfesionalId FROM Profesional WHERE Correo = '${correo.replace(/'/g, "''")}'" -h -1 -W`;
          const out = execSync(cmd, { encoding: 'utf8', timeout: 10000 });
          const idLine = out.split('\n').map((l) => l.trim()).find((l) => /^\d+$/.test(l));
          if (idLine) profesionalId = parseInt(idLine, 10);
        } catch { /* opcional */ }
      }
    }

    let idx = 1;
    const idsSalas = profesionalId
      ? { citaId: obtenerCitaProfesional(profesionalId), salaId: obtenerSalaAbierta(profesionalId) }
      : {};

    log('=== Etapas 1–2: menú lateral (según prototipo home-profesional) ===');
    for (const vista of VISTAS_MENU) {
      if (vista.submenu) await abrirSubmenuProfesionales(page);
      resultados.push(await visitarVista(page, vista, idx++, profesionalId, idsSalas));
    }

    log('=== Etapa 3: rutas MVC adicionales (no en menú pero existen) ===');
    for (const vista of VISTAS_EXTRA) {
      resultados.push(await visitarVista(page, vista, idx++, profesionalId, idsSalas));
    }

    if (profesionalId) {
      resultados.push(await visitarVista(page, {
        etapa: 3,
        nombre: 'Perfil orador público',
        ruta: `/PerfilOrador/Index/${profesionalId}`,
        proto: 'perfil-orador.html',
      }, idx++, profesionalId, idsSalas));
    }

    // Detalle sala si hay enlace
    const linkSala = page.locator('a[href*="/Salas/Detalle"]').first();
    if (await linkSala.count()) {
      const href = await linkSala.getAttribute('href');
      resultados.push(await visitarVista(page, {
        etapa: 3, nombre: 'Detalle sala', ruta: href.replace(BASE_URL, ''), proto: 'sala-conferencia-profesional.html',
      }, idx++, profesionalId, idsSalas));
    } else {
      warn('Sin salas para probar /Salas/Detalle');
    }

    // Conversación si hay
    await page.goto(`${BASE_URL}/Mensajeria`, { waitUntil: 'domcontentloaded' });
    const linkConv = page.locator('a[href*="Conversacion"]').first();
    if (await linkConv.count()) {
      const href = await linkConv.getAttribute('href');
      resultados.push(await visitarVista(page, {
        etapa: 2, nombre: 'Conversación', ruta: href.replace(BASE_URL, ''), proto: 'mensajes-profesional.html',
      }, idx++, profesionalId, idsSalas));
    } else {
      warn('Sin conversaciones para /Mensajeria/Conversacion');
    }

    log('=== Prototipo: pantallas sin MVC o referencia visual ===');
    for (const p of PROTO_SIN_MVC) {
      await capturarPrototipo(protoPage, p.proto, `ref-${slug(p.nombre)}.png`);
    }

    log('=== Prototipo: comparación lado a lado (MVC ya capturado) ===');
    for (const r of resultados.filter((x) => x.estado === 'ok' && x.proto)) {
      await capturarPrototipo(protoPage, r.proto, `cmp-${slug(r.nombre)}.png`);
    }

    const okCount = resultados.filter((r) => r.estado === 'ok').length;
    const errCount = resultados.filter((r) => r.estado === 'error').length;
    const omitCount = resultados.filter((r) => r.estado === 'omitida').length;

    console.log('\n========== RESUMEN VISTAS PROFESIONAL ==========');
    console.log(`Cuenta: ${correo}`);
    console.log(`OK: ${okCount} | Error: ${errCount} | Omitidas: ${omitCount}`);
    console.log(`Screenshots MVC: ${SS}`);
    console.log(`Screenshots prototipo: ${SS_PROTO}`);
    resultados.forEach((r) => {
      const icon = r.estado === 'ok' ? '✓' : r.estado === 'error' ? '✗' : '–';
      console.log(`  ${icon} ${r.nombre}${r.url ? ` → ${r.url}` : ''}`);
    });

    if (errCount > 0) fail(`${errCount} vista(s) con error`);
    ok('Todas las vistas MVC del profesional cargaron correctamente');

  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    await page.waitForTimeout(2000).catch(() => {});
    await browser.close().catch(() => {});
  }
})();

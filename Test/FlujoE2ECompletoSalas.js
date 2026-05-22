/**
 * E2E completo: BD limpia → profesional + usuario → 4 salas → me gusta + inscripción.
 * node Test/FlujoE2ECompletoSalas.js
 */
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'https://localhost:7072';
const SQL_SERVER = process.env.TREBOL_SQL_SERVER || 'DESKALEJO\\SQLEXPRESS';
const SQL_DB = process.env.TREBOL_SQL_DB || 'TrebolDB';
const PASS = 'Password123!';
const ADMIN = { correo: 'psicologiatrevol@gmail.com', pass: 'Gm41l.C0m' };
const ARCHIVOS = path.resolve(__dirname, '../Documentos/ArchivosPrueba');
const CEDULA = path.join(ARCHIVOS, 'CedulaPrueba.pdf');
const TARJETA = path.join(ARCHIVOS, 'TarjetaProfesionalPrueba.pdf');

const ts = Date.now();
const CORREO_PRO = `trebol.e2e.pro.${ts}@yopmail.com`;
const CORREO_USU = `trebol.e2e.usu.${ts}@yopmail.com`;
const SALA_LIBRE = `E2E Hoy Libre ${ts}`;
const SALA_COBRO = `E2E Hoy Cobro ${ts}`;
const SALA_2D = `E2E +2 dias ${ts}`;
const SALA_15D = `E2E +15 dias ${ts}`;

const SS = path.join(__dirname, 'screenshots', `e2e-salas-${ts}`);
fs.mkdirSync(SS, { recursive: true });

function log(m) { console.log(`\n[PASO] ${m}`); }
function ok(m) { console.log(`       OK   ${m}`); }
function fail(m) { console.error(`\n[FALLO] ${m}`); throw new Error(m); }

function sql(query) {
  const q = query.replace(/"/g, '\\"');
  execSync(`sqlcmd -S "${SQL_SERVER}" -d ${SQL_DB} -E -Q "${q}"`, { encoding: 'utf8', timeout: 120000 });
}

function sqlScalar(query) {
  const q = query.replace(/"/g, '\\"');
  const out = execSync(`sqlcmd -S "${SQL_SERVER}" -d ${SQL_DB} -E -Q "SET NOCOUNT ON; ${q}" -h -1 -W`, { encoding: 'utf8', timeout: 30000 });
  return out.split(/\r?\n/).map((l) => l.trim()).find(
    (l) => l && !l.startsWith('---') && !l.startsWith('Changed') && l !== '(0 rows affected)'
  );
}

function toDatetimeLocal(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fechasSalas() {
  const iso = (days, hour) => {
    const raw = sqlScalar(
      `SELECT CONVERT(varchar(16), DATEADD(hour, ${hour}, CAST(DATEADD(day, ${days}, CAST(GETDATE() AS date)) AS datetime2)), 126)`
    );
    if (!raw) fail('No se pudo leer GETDATE() del servidor SQL');
    const [datePart, timePart] = raw.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm] = (timePart || '18:00').split(':').map(Number);
    return toDatetimeLocal(new Date(y, m - 1, d, hh, mm));
  };
  return { hoy: iso(0, 18), d2: iso(2, 10), d15: iso(15, 10) };
}

async function login(page, correo, password) {
  await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('input[name="Correo"]', { timeout: 20000 });
  await page.fill('input[name="Correo"]', correo);
  await page.fill('input[name="Password"]', password);
  await page.locator('form[action*="Login"] button[type="submit"]').click();
  await page.waitForTimeout(3500);
}

async function adjuntarPdfs(page) {
  const inputCedula = page.locator('input[name="FotocopiaCedula"], #file-cedula-r').first();
  const inputTarjeta = page.locator('input[name="FotocopiaTarjeta"], #file-tarjeta-r').first();
  await inputCedula.waitFor({ state: 'attached', timeout: 10000 });
  await inputTarjeta.waitFor({ state: 'attached', timeout: 10000 });
  await inputCedula.setInputFiles(CEDULA);
  await inputTarjeta.setInputFiles(TARJETA);
}

async function registrarProfesional(page) {
  log(`Registro profesional: ${CORREO_PRO}`);
  await page.goto(`${BASE}/Registro/SeleccionPerfil`);
  await page.click('#card-pro');
  await page.waitForSelector('#terms-section', { state: 'visible' });
  await page.check('#terms-check');
  await page.click('#continue-btn');
  await page.waitForURL('**/Registro/RegistroProfesional');
  await page.fill('input[name="NombreCompleto"]', 'Dra. E2E Profesional');
  await page.fill('input[name="Correo"]', CORREO_PRO);
  await page.fill('input[name="NumeroDocumento"]', String(ts).slice(-9));
  await page.selectOption('select[name="EspecialidadId"]', '10');
  await page.fill('input[name="NumeroRegistro"]', `PSI-E2E-${ts}`);
  await adjuntarPdfs(page);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const token = sqlScalar(`SELECT TOP 1 Token FROM TokenActivacion WHERE Correo = N'${CORREO_PRO}' ORDER BY FechaExpiracion DESC`);
  if (!token) fail('Sin token de activación profesional');
  await page.goto(`${BASE}/Registro/ConfirmarEmail?token=${encodeURIComponent(token)}`);
  await page.fill('input[name="Password"]', PASS);
  await page.fill('input[name="ConfirmarPassword"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  ok('Profesional confirmó correo y contraseña');

  execSync(`node "${path.join(__dirname, 'auto-aprobar-profesionales.js')}" --correo=${CORREO_PRO}`, {
    encoding: 'utf8',
    cwd: path.resolve(__dirname, '..'),
    timeout: 30000,
  });
  ok('Profesional aprobado (auto-aprobar)');
}

async function registrarUsuario(page) {
  log(`Registro usuario: ${CORREO_USU}`);
  await page.goto(`${BASE}/Registro/SeleccionPerfil`);
  await page.click('#card-user');
  await page.waitForSelector('#terms-section', { state: 'visible' });
  await page.check('#terms-check');
  await page.click('#continue-btn');
  await page.waitForURL('**/Registro/RegistroUsuario');
  await page.fill('input[name="NombreCompleto"]', 'Juan E2E Usuario');
  await page.fill('input[name="Correo"]', CORREO_USU);
  await page.fill('input[name="NumeroDocumento"]', String(ts).slice(-10));
  await page.fill('input[name="Celular"]', '3009876543');
  await page.fill('input[name="Alias"]', `E2EUser${ts}`);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const token = sqlScalar(
    `SELECT TOP 1 tv.Token FROM TokenValidacion tv INNER JOIN Usuario u ON u.UsuarioId = tv.UsuarioId WHERE u.Correo = N'${CORREO_USU}' AND tv.Usado = 0 ORDER BY tv.FechaExpiracion DESC`
  );
  if (!token) fail('Sin token de validación usuario');
  await page.goto(`${BASE}/Registro/ConfirmarEmailUsuario?token=${encodeURIComponent(token)}`);
  await page.fill('input[name="Password"]', PASS);
  await page.fill('input[name="ConfirmarPassword"]', PASS);
  await page.locator('form[action*="ConfirmarEmailUsuario"] button[type="submit"]').click();
  await page.waitForURL('**/Login**', { timeout: 20000 });
  ok('Usuario confirmó correo y contraseña');
}

async function crearSala(page, { titulo, precio, fechaLocal }) {
  await page.goto(`${BASE}/Salas/Nueva`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="Titulo"]', titulo);
  await page.fill('textarea[name="Descripcion"]', `Sala de prueba E2E — ${titulo}`);
  await page.selectOption('select[name="Tipo"]', '1');
  await page.fill('input[name="Capacidad"]', '40');
  if (fechaLocal) await page.fill('input[name="FechaInicio"]', fechaLocal);
  await page.fill('input[name="Precio"]', String(precio || 0));
  const submit = page.locator('.card form button[type="submit"]').first();
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/Salas/Nueva') && r.request().method() === 'POST', { timeout: 20000 }),
    submit.click(),
  ]);
  await page.waitForURL(/\/Salas\/Index|\/Salas$/i, { timeout: 15000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  ok(`Sala creada: ${titulo}`);
}

(async () => {
  if (!fs.existsSync(CEDULA) || !fs.existsSync(TARJETA)) {
    fail(`Faltan PDFs en ${ARCHIVOS}`);
  }

  log('Limpieza BD + SP crear sala con evento');
  const dbDir = path.resolve(__dirname, '../Proyecto MVC/Database');
  execSync(`sqlcmd -S "${SQL_SERVER}" -d ${SQL_DB} -E -i "${path.join(dbDir, '07_LimpiarDatosPrueba.sql')}"`, { encoding: 'utf8' });
  execSync(`sqlcmd -S "${SQL_SERVER}" -d ${SQL_DB} -E -i "${path.join(dbDir, '08_CrearSalaConEvento.sql')}"`, { encoding: 'utf8' });
  execSync(`sqlcmd -S "${SQL_SERVER}" -d ${SQL_DB} -E -i "${path.join(dbDir, '05_EventosUsuario.sql')}"`, { encoding: 'utf8' });
  ok('BD lista');

  const fechas = fechasSalas();
  const browser = await chromium.launch({
    headless: false,
    slowMo: 80,
    channel: 'chrome',
    args: ['--ignore-certificate-errors', '--start-maximized'],
  });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: null });
  const page = await context.newPage();

  try {
    await registrarProfesional(page);
    await login(page, CORREO_PRO, PASS);
    if (!page.url().includes('HomeProfesional')) fail(`Login pro falló: ${page.url()}`);

    await crearSala(page, { titulo: SALA_LIBRE, precio: 0, fechaLocal: fechas.hoy });
    await crearSala(page, { titulo: SALA_COBRO, precio: 35000, fechaLocal: fechas.hoy });
    await crearSala(page, { titulo: SALA_2D, precio: 0, fechaLocal: fechas.d2 });
    await crearSala(page, { titulo: SALA_15D, precio: 0, fechaLocal: fechas.d15 });
    await page.screenshot({ path: path.join(SS, '01-pro-salas.png'), fullPage: true });

    await page.goto(`${BASE}/Salas`);
    await page.waitForTimeout(1500);
    const cardsPro = await page.locator('.card').filter({ hasText: /E2E/ }).count();
    if (cardsPro < 4) fail(`Profesional: se esperaban 4 salas en /Salas, hay ${cardsPro}`);
    ok('Profesional: 4 salas listadas');

    await page.goto(`${BASE}/PerfilProfesional/Salas`);
    await page.waitForTimeout(1500);
    const tablaPro = await page.locator('table tbody tr').count();
    if (tablaPro < 4) fail(`Perfil salas: se esperaban 4 filas, hay ${tablaPro}`);
    ok('Profesional: 4 salas en perfil');

    await context.clearCookies();
    const pageUsu = await context.newPage();
    await registrarUsuario(pageUsu);
    await login(pageUsu, CORREO_USU, PASS);
    if (!pageUsu.url().includes('HomeUsuario')) fail(`Login usuario falló: ${pageUsu.url()}`);

    await pageUsu.goto(`${BASE}/Eventos`);
    await page.waitForTimeout(2000);
    const cards = pageUsu.locator('.room-card');
    const nCards = await cards.count();
    if (nCards < 1) fail('Usuario: no hay tarjetas en /Eventos');
    ok(`Usuario: ${nCards} sala(s) visibles en Eventos`);

    const cardLibre = pageUsu.locator('.room-card', { hasText: SALA_LIBRE }).first();
    if (!(await cardLibre.count())) fail(`No se encontró tarjeta "${SALA_LIBRE}"`);

    const likeBtn = cardLibre.locator('.btn-like-sala');
    await likeBtn.click();
    await page.waitForTimeout(1200);
    const liked = await likeBtn.getAttribute('data-liked');
    if (liked !== 'true') fail('Me gusta no quedó activo (data-liked)');
    ok('Usuario: me gusta (seguir) aplicado');

    const regBtn = cardLibre.locator('.btn-reg-sala');
    await regBtn.click();
    await page.waitForTimeout(2000);
    const inscrito = await regBtn.textContent();
    if (!inscrito?.includes('Inscrito')) fail('Inscripción no confirmada en tarjeta');
    ok('Usuario: inscrito en sala libre');

    await pageUsu.goto(`${BASE}/MisEventos`);
    await pageUsu.waitForTimeout(1500);
    const bodyMis = await pageUsu.locator('body').innerText();
    if (!bodyMis.includes(SALA_LIBRE)) fail(`Mis Eventos no lista "${SALA_LIBRE}"`);
    ok('Usuario: sala inscrita en Mis Eventos');
    await pageUsu.screenshot({ path: path.join(SS, '02-usuario-mis-eventos.png'), fullPage: true });

    await pageUsu.goto(`${BASE}/Eventos`);
    const secInscritos = pageUsu.locator('section', { has: pageUsu.getByRole('heading', { name: /inscritos/i }) });
    if (await secInscritos.count()) {
      const txt = await secInscritos.first().innerText();
      if (!txt.includes(SALA_LIBRE)) fail('Sección inscritos en Eventos sin la sala');
      ok('Usuario: sección inscritos en /Eventos');
    }

    const pagePro2 = await context.newPage();
    await login(pagePro2, CORREO_PRO, PASS);
    if (!pagePro2.url().includes('HomeProfesional')) fail(`Re-login pro falló: ${pagePro2.url()}`);
    await pagePro2.goto(`${BASE}/PerfilProfesional/Salas`);
    await pagePro2.waitForTimeout(1500);
    const filaLibre = pagePro2.locator('tr', { hasText: SALA_LIBRE });
    const asistentes = await filaLibre.locator('td').nth(3).innerText();
    if (!asistentes.startsWith('1 /')) fail(`Asistentes esperados 1/N, obtuvo: ${asistentes}`);
    ok(`Profesional: inscritos en sala = ${asistentes.trim()}`);

    await pagePro2.goto(`${BASE}/PerfilProfesional`);
    await pagePro2.waitForTimeout(1000);
    const shell2 = await pagePro2.locator('section').first().innerText();
    if (!/Seguidores[\s\S]*?\b1\b/.test(shell2)) fail('Profesional: seguidores no muestra 1');
    ok('Profesional: al menos 1 seguidor (me gusta)');

    await pagePro2.screenshot({ path: path.join(SS, '03-pro-perfil.png'), fullPage: true });

    console.log('\n========== RESUMEN E2E ==========');
    console.log(`Profesional: ${CORREO_PRO} / ${PASS}`);
    console.log(`Usuario:     ${CORREO_USU} / ${PASS}`);
    console.log(`Screenshots: ${SS}`);
    console.log('=================================\n');
  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: path.join(SS, '99-error.png'), fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

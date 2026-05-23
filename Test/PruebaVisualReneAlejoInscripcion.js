/**
 * Limpia salas en BD → Rene crea sala paga/libre → Alejandro inscribe y paga (tarjeta prueba).
 * HEADLESS=0 node Test/PruebaVisualReneAlejoInscripcion.js
 */
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const SQL_SERVER = process.env.TREBOL_SQL_SERVER || 'DESKALEJO\\SQLEXPRESS';
const SQL_DB = process.env.TREBOL_SQL_DB || 'TrebolDB';
const CORREO_RENE = 'rene@yopmail.com';
// Inscripción solo rol Usuario: en BD actual alejortiz es Profesional; usamos test.visual.
const CORREO_ALE = process.env.CORREO_USUARIO_INSCRIPCION || 'test.visual@yopmail.com';
const PASS = process.env.PASS_LOGIN || 'Yopmail2026.';
const SALA_PAGA = 'Sala paga visual Rene';
const SALA_LIBRE = 'Sala libre visual Rene';
const PRECIO_PAGA = 10000;
const SS = path.join(__dirname, 'screenshots', `rene-alejo-pago-${Date.now()}`);

const TARJETA = {
  numero: '4242 4242 4242 4242',
  venc: '12/30',
  cvv: '123',
  nombre: 'MARIA GARCIA TEST'
};

function limpiarSalas() {
  const sqlFile = path.resolve(__dirname, '../Proyecto MVC/Database/19_LimpiarSoloSalas.sql');
  execSync(`sqlcmd -S "${SQL_SERVER}" -d ${SQL_DB} -E -i "${sqlFile}"`, { encoding: 'utf8', timeout: 60_000 });
  console.log('  ✓ BD: salas y relaciones eliminadas');
}

function fechaInicioLocal(dias = 3, hora = 15) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, 0, 0, 0);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

async function shot(page, name) {
  const p = path.join(SS, name);
  await page.screenshot({ path: p, fullPage: true });
  console.log('  📷', name);
}

async function login(page, correo) {
  await page.goto(`${BASE}/Login`, { waitUntil: 'networkidle', timeout: 45_000 });
  await page.fill('input[name="Correo"], input[type="email"]', correo);
  await page.fill('input[name="Password"], input[type="password"]', PASS);
  await page.click('form[action*="Login"] button[type="submit"], button[type="submit"]');
  await page.waitForTimeout(2500);
  if (page.url().includes('/Login')) {
    throw new Error(`Login falló para ${correo}. Revisa contraseña (${PASS}).`);
  }
}

async function crearSala(page, { titulo, precio }) {
  await page.goto(`${BASE}/Salas/Nueva`, { waitUntil: 'networkidle' });
  await page.fill('input[name="Titulo"]', titulo);
  await page.fill('textarea[name="Descripcion"]', `Prueba visual — ${titulo}`);
  await page.selectOption('select[name="Tipo"]', '1');
  await page.fill('input[name="Capacidad"]', '30');
  await page.fill('input[name="FechaInicio"]', fechaInicioLocal(4, 16));
  if (precio > 0) await page.fill('input[name="Precio"]', String(precio));
  else await page.fill('input[name="Precio"]', '0');
  await Promise.all([
    page.waitForResponse(r => r.url().includes('/Salas/Nueva') && r.request().method() === 'POST', { timeout: 25_000 }),
    page.locator('.card form button[type="submit"]').click()
  ]);
  await page.waitForURL(/\/Salas/i, { timeout: 20_000 });
  console.log(`  ✓ Sala creada: ${titulo} (${precio > 0 ? '$' + precio : 'gratis'})`);
}

async function inscribirYPagar(page, tituloSala) {
  await page.goto(`${BASE}/HomeUsuario`, { waitUntil: 'networkidle' });
  await shot(page, '03-home-alejandro.png');

  const card = page.locator('.room-card').filter({ hasText: tituloSala }).first();
  if (!(await card.count())) {
    await page.goto(`${BASE}/Eventos`, { waitUntil: 'networkidle' });
  }
  const card2 = page.locator('.room-card').filter({ hasText: tituloSala }).first();
  if (!(await card2.count())) throw new Error(`No se encuentra "${tituloSala}" para inscribirse`);

  await card2.locator('.btn-ver-sala').click();
  await page.waitForSelector('#detail-modal-backdrop.open', { timeout: 12_000 });
  await shot(page, '04-modal-detalle.png');

  const regBtn = page.locator('#detail-modal-reg-btn');
  const txt = await regBtn.innerText();
  if (!/inscribir|pagar|registr/i.test(txt)) {
    throw new Error(`Botón modal inesperado: "${txt}"`);
  }
  await regBtn.click();
  await page.waitForURL(/Inscripcion\/Confirmar/, { timeout: 15_000 });
  await shot(page, '05-confirmacion.png');

  await page.getByRole('button', { name: /Confirmar y pagar/i }).click();
  await page.waitForURL(/Inscripcion\/Pago/, { timeout: 20_000 });
  await page.waitForSelector('#checkout-panel-tarjeta', { timeout: 15_000 });
  await shot(page, '06-paso-pago-metodos.png');

  await page.locator('input[name="metodo-pago-ui"][value="TarjetaCredito"]').check();
  await page.fill('#tarjeta-numero', TARJETA.numero);
  await page.fill('#tarjeta-venc', TARJETA.venc);
  await page.fill('#tarjeta-cvv', TARJETA.cvv);
  await page.fill('#tarjeta-nombre', TARJETA.nombre);
  await shot(page, '07-tarjeta-llena.png');

  await page.locator('#form-pago button[type="submit"]').click();
  await page.waitForURL(/Resultado/, { timeout: 25_000 });
  await shot(page, '08-resultado-exito.png');

  const body = await page.locator('body').innerText();
  if (!/exitosa|confirmada|pagad/i.test(body)) {
    throw new Error('Pantalla de resultado sin mensaje de éxito');
  }
  console.log('  ✓ Inscripción y pago completados');
}

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  console.log('\n═══ Limpieza BD (solo salas) ═══');
  limpiarSalas();

  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    slowMo: 120,
    args: ['--start-maximized']
  });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: null });
  let page = await context.newPage();

  try {
    const health = await page.request.get(`${BASE}/Login`);
    if (health.status() >= 500) throw new Error('Servidor no disponible en ' + BASE);

    console.log('\n═══ 1) Rene — crear salas ═══');
    await login(page, CORREO_RENE);
    if (!page.url().includes('HomeProfesional')) {
      throw new Error(`Rene no entró como profesional: ${page.url()}`);
    }
    await shot(page, '01-rene-home.png');
    await crearSala(page, { titulo: SALA_PAGA, precio: PRECIO_PAGA });
    await crearSala(page, { titulo: SALA_LIBRE, precio: 0 });
    await shot(page, '02-rene-salas-lista.png');

    console.log('\n═══ 2) Alejandro — inscribirse y pagar ═══');
    await context.clearCookies();
    const pageAle = await context.newPage();
    await login(pageAle, CORREO_ALE);
    page = pageAle;
    if (page.url().includes('HomeProfesional')) {
      throw new Error(
        `${CORREO_ALE} es profesional, no usuario. Para inscribirse use test.visual@yopmail.com o cree un Usuario.`
      );
    }
    if (!page.url().includes('HomeUsuario')) {
      throw new Error(`No entró como usuario: ${page.url()}`);
    }
    await inscribirYPagar(page, SALA_PAGA);

    console.log('\n✅ Prueba visual OK');
    console.log('📁 Capturas:', SS);
    console.log('\nRevisa el navegador — se cierra en 8 s…');
    await page.waitForTimeout(8000);
  } catch (e) {
    console.error('\n❌ FALLO:', e.message);
    await shot(page, '99-error.png').catch(() => {});
    console.log('Navegador abierto 15 s para revisar error…');
    await page.waitForTimeout(15_000);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

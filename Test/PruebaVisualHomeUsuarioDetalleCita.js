/**
 * Prueba visual: inicio usuario → Mis próximas citas → Ver (modal detalle).
 * set HEADLESS=0 && node Test/PruebaVisualHomeUsuarioDetalleCita.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = process.env.CORREO || 'juan@yopmail.com';
const PASS = process.env.PASS || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `home-cita-modal-${Date.now()}`);

const fallos = [];
const ok = (m) => console.log('  OK', m);
const fail = (m) => { fallos.push(m); console.error('  FALLO', m); };
const info = (m) => console.log('  →', m);

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  info(`Screenshots: ${SS}`);
  info('Navegador: Chrome externo (channel: chrome)');

  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    slowMo: 280
  });
  const page = await (await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1400, height: 900 }
  })).newPage();

  try {
    await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.locator('form[action*="Login"] button[type="submit"]').click();
    await page.waitForURL(u => !u.pathname.includes('/Login'), { timeout: 30000 });
    await page.screenshot({ path: path.join(SS, '01-login.png'), fullPage: true });
    ok(`Login: ${page.url()}`);

    await page.waitForURL(/HomeUsuario/, { timeout: 15000 });
    await page.waitForSelector('#citas-heading', { timeout: 10000 });
    await page.screenshot({ path: path.join(SS, '02-home.png'), fullPage: true });
    ok('Inicio usuario cargado');

    const btnVer = page.locator('[data-cita-detalle]').first();
    if (!(await btnVer.count())) {
      fail('No hay citas próximas con botón Ver');
      throw new Error('Sin citas');
    }

    await btnVer.scrollIntoViewIfNeeded();
    await btnVer.click();

    const backdrop = page.locator('#cita-detalle-backdrop');
    await backdrop.waitFor({ state: 'visible', timeout: 10000 });
    await expectClass(backdrop, 'open');
    ok('Modal de detalle visible (clase open)');

    await page.waitForSelector('.cita-detalle-modal', { timeout: 10000 });
    await page.screenshot({ path: path.join(SS, '03-modal-detalle.png'), fullPage: true });

    const modalText = await page.locator('#cita-detalle-body').innerText();
    if (!/Profesional/i.test(modalText)) fail('Modal sin sección Profesional');
    else ok('Muestra profesional');

    if (!/Fecha|Hora|Tipo|Valor|Confirmada|Reprogramada|Programada|Finalizada/i.test(modalText)) {
      fail('Modal sin datos esperados de la cita');
    } else ok('Datalle de cita completo en modal');

    const urlAntes = page.url();
    await page.waitForTimeout(500);
    if (!urlAntes.includes('HomeUsuario') || !page.url().includes('HomeUsuario')) {
      fail(`Navegó fuera del inicio: ${page.url()}`);
    } else {
      ok('Permanece en HomeUsuario (no abrió ventana/página nueva)');
    }

    await page.locator('[data-close-modal="cita-detalle"]').first().click();
    await backdrop.waitFor({ state: 'hidden', timeout: 5000 }).catch(async () => {
      const visible = await backdrop.evaluate(el => el.classList.contains('open'));
      if (visible) fail('Modal no se cerró');
    });
    ok('Modal se cierra correctamente');
    await page.screenshot({ path: path.join(SS, '04-modal-cerrado.png'), fullPage: true });

    info('Pausa 3s para revisión visual…');
    await page.waitForTimeout(3000);

    console.log('\n--- Resumen ---');
    if (fallos.length) {
      fallos.forEach(f => console.error(' -', f));
      process.exitCode = 1;
    } else {
      console.log('Prueba visual modal detalle cita: OK');
    }
  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: path.join(SS, 'error.png'), fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

async function expectClass(locator, className) {
  const has = await locator.evaluate((el, c) => el.classList.contains(c), className);
  if (!has) throw new Error(`Falta clase .${className}`);
}

/**
 * Home/Eventos: botones Detalle + inscripción y modal.
 * node Test/VerificarTarjetasInscripcionHome.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || process.env.TREBOL_URL || 'http://localhost:5271';
const CORREO = process.env.CORREO_USU || 'test.visual@yopmail.com';
const PASS = process.env.PASS_USU || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `inscripcion-home-${Date.now()}`);

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage();
  const fails = [];

  try {
    await page.goto(`${BASE}/Login`, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.fill('input[name="Correo"], input[type="email"]', CORREO);
    await page.fill('input[name="Password"], input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL(/HomeUsuario/i, { timeout: 20_000 });

    const card = page.locator('.rooms-grid .room-card').first();
    const n = await card.count();
    if (n < 1) throw new Error('No hay tarjetas de evento en el home');

    const detalle = card.locator('.btn-ver-sala');
    const reg = card.locator('.btn-reg-sala');
    if (!(await detalle.count())) fails.push('Falta botón Detalle en tarjeta');
    if (!(await reg.count())) fails.push('Falta botón inscripción en tarjeta');

    const detalleTxt = (await detalle.first().innerText()).trim();
    if (!/detalle/i.test(detalleTxt)) fails.push(`Texto Detalle inesperado: "${detalleTxt}"`);

    await detalle.first().click();
    await page.waitForSelector('#detail-modal-backdrop.open', { timeout: 10_000 });
    const modalReg = page.locator('#detail-modal-reg-btn');
    if (!(await modalReg.count())) fails.push('Falta botón inscripción en modal');
    await page.screenshot({ path: path.join(SS, '01-modal-detalle.png'), fullPage: true });

    await page.goto(`${BASE}/Eventos`, { waitUntil: 'networkidle' });
    const cardEvt = page.locator('.rooms-grid .room-card').first();
    if (!(await cardEvt.count())) fails.push('No hay tarjetas en /Eventos');
    else {
      await cardEvt.locator('.btn-ver-sala').click();
      await page.waitForSelector('#detail-modal-backdrop.open', { timeout: 10_000 });
      await page.screenshot({ path: path.join(SS, '02-eventos-modal.png'), fullPage: true });
    }

    if (fails.length) throw new Error(fails.join('; '));
    console.log('OK tarjetas Detalle + modal + inscripción. Screenshots:', SS);
  } catch (e) {
    console.error('FALLO:', e.message);
    await page.screenshot({ path: path.join(SS, '99-error.png'), fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

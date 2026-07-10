/**
 * Prueba visible: Home usuario + página Eventos (olivia)
 * node Test/EventosUsuarioOlivia.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'https://localhost:7072';
const CORREO = 'olivia@yopmail.com';
const PASS = 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `eventos-usuario-${Date.now()}`);

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage();
  try {
    await page.goto(`${BASE}/Login`);
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL(/HomeUsuario/i, { timeout: 15000 });

    await page.screenshot({ path: path.join(SS, '01-home.png'), fullPage: true });
    const verTodas = page.locator('a[href*="/Eventos"]').first();
    await verTodas.click();
    await page.waitForURL(/Eventos/i, { timeout: 10000 });
    await page.screenshot({ path: path.join(SS, '02-eventos.png'), fullPage: true });

    const card = page.locator('.room-card').first();
    if (await card.count()) {
      await card.locator('.btn-ver-sala').click();
      await page.waitForSelector('#detail-modal-backdrop.open', { timeout: 8000 });
      await page.screenshot({ path: path.join(SS, '03-modal-detalle.png'), fullPage: true });
      console.log('OK modal detalle');
    }

    console.log('OK flujo Eventos. Screenshots:', SS);
  } catch (e) {
    console.error('FALLO:', e.message);
    await page.screenshot({ path: path.join(SS, '99-error.png'), fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

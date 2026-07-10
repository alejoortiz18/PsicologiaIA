/**
 * Verifica que los eventos vigentes de BD se muestran en Home y /Eventos (visible).
 * node Test/VerificarEventosVisibles.js
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'https://localhost:7072';
const CORREO = process.env.CORREO_USU || 'olivia@yopmail.com';
const PASS = process.env.PASS_USU || 'Yopmail2026.';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage();
  try {
    await page.goto(`${BASE}/Login`);
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL(/HomeUsuario/i, { timeout: 15000 });

    const cardsHome = await page.locator('.rooms-grid .room-card').count();
    if (cardsHome < 1) throw new Error(`Home: se esperaban tarjetas de evento, hay ${cardsHome}`);

    await page.goto(`${BASE}/Eventos`);
    const cardsEvt = await page.locator('.rooms-grid .room-card').count();
    if (cardsEvt < 1) throw new Error(`Eventos: se esperaban tarjetas, hay ${cardsEvt}`);

    console.log(`OK Home=${cardsHome} tarjetas, Eventos=${cardsEvt} tarjetas`);
  } catch (e) {
    console.error('FALLO:', e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

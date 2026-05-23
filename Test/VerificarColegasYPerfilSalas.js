/**
 * Eventos colegas (3 botones) + perfil orador salas (Detalle modal + Inscribirme).
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = process.env.CORREO_USU || 'test.visual@yopmail.com';
const PASS = process.env.PASS_USU || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `colegas-perfil-${Date.now()}`);

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage();

  try {
    await page.goto(`${BASE}/Login`);
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL(/HomeUsuario/i, { timeout: 20_000 });

    const colegas = page.locator('.event-list-item').first();
    if (await colegas.count()) {
      await page.locator('.event-list-item .btn-ver-sala').first().click();
      await page.waitForSelector('#detail-modal-backdrop.open');
      if (!(await page.locator('#detail-modal-reg-btn').count()))
        throw new Error('Modal sin botón inscripción');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    await page.goto(`${BASE}/PerfilOrador/Salas/65`);
    await page.waitForSelector('#salas-grid .room-card', { timeout: 15_000 });
    const detalle = page.locator('#salas-grid .btn-ver-sala').first();
    const inscribir = page.locator('#salas-grid .btn-reg-sala').first();
    if (!(await detalle.count())) throw new Error('Perfil salas: falta Detalle');
    if (!(await inscribir.count())) throw new Error('Perfil salas: falta Inscribirme');
    await detalle.click();
    await page.waitForSelector('#detail-modal-backdrop.open');
    await page.screenshot({ path: path.join(SS, 'perfil-salas-modal.png'), fullPage: true });
    console.log('OK colegas + perfil salas');
  } catch (e) {
    console.error('FALLO:', e.message);
    await page.screenshot({ path: path.join(SS, 'error.png'), fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

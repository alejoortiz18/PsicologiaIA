/**
 * Prueba visual: espera ponente en conferencia asistente
 * node Test/ConferenciaEsperaPonente.js [salaId]
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'https://localhost:7072';
const SALA_ID = process.argv[2] || process.env.SALA_ID || '65';
const CORREO = process.env.TREBOL_USER || 'test.visual@yopmail.com';
const PASSWORD = process.env.TREBOL_PASS || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `conf-espera-${Date.now()}`);

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  const browser = await chromium.launch({ headless: false, slowMo: 40 });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });

  try {
    await page.goto(`${BASE_URL}/Login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    await page.goto(`${BASE_URL}/Conferencia/Asistente/${SALA_ID}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const overlay = page.locator('#conf-espera-overlay');
    const countdown = page.locator('#conf-espera-countdown');
    const chatDisabled = page.locator('#conf-chat-disabled');

    await page.screenshot({ path: path.join(SS, '01-conferencia-asistente.png'), fullPage: true });

    if (await overlay.isVisible()) {
      const txt = await countdown.textContent();
      console.log('Overlay visible, countdown:', txt?.trim());
    } else {
      console.log('Overlay oculto (ponente ya presente o evento no aplica)');
    }

    if (!(await chatDisabled.count())) throw new Error('No se encontró estado de chat deshabilitado');
    if (!(await chatDisabled.isVisible())) {
      console.log('Nota: chat grupal está habilitado en esta sala');
    }

    const presencia = await page.request.get(`${BASE_URL}/Conferencia/PresenciaProfesional?salaId=${SALA_ID}`);
    if (!presencia.ok()) throw new Error(`PresenciaProfesional HTTP ${presencia.status()}`);
    console.log('Presencia:', await presencia.json());

    console.log('OK — Conferencia asistente verificada');
    console.log('Capturas:', SS);
  } catch (err) {
    await page.screenshot({ path: path.join(SS, 'error.png'), fullPage: true });
    console.error('FALLO:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

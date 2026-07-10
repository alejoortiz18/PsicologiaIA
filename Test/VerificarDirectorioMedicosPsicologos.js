/**
 * Verifica listado Médicos / Psicólogos con profesionales activos.
 * node Test/VerificarDirectorioMedicosPsicologos.js
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'https://localhost:7072';
const CORREO = process.env.CORREO_LOGIN || 'rene@yopmail.com';
const PASS = process.env.PASS_LOGIN || 'Yopmail2026.';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50, channel: 'chrome' });
  const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage();
  try {
    await page.goto(`${BASE}/Login`);
    await page.waitForSelector('input[name="Correo"]', { timeout: 15000 });
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.locator('form[action*="Login"] button[type="submit"]').click();
    await page.waitForURL(url => !url.pathname.includes('/Login'), { timeout: 20000 });

    const checks = [
      { ruta: '/Directorio/Medicos', debeVer: 'Dr. Rene' },
      { ruta: '/Directorio/Psicologos', debeVer: 'profesional alejandro' },
    ];
    for (const { ruta, debeVer } of checks) {
      await page.goto(`${BASE}${ruta}`);
      await page.waitForSelector('#results-info', { timeout: 15000 });
      const cards = await page.locator('.prof-card').count();
      const body = await page.locator('body').innerText();
      const info = await page.locator('#results-info').innerText();
      console.log(`${ruta}: tarjetas=${cards}, info="${info}"`);
      if (!info.includes('registros')) {
        throw new Error(`En ${ruta} falta texto de paginación estándar. info="${info}"`);
      }
      if (!body.includes(debeVer)) {
        throw new Error(`En ${ruta} no aparece "${debeVer}". Tarjetas=${cards}. URL=${page.url()}`);
      }
    }
    console.log('OK directorio Médicos y Psicólogos');
  } catch (e) {
    console.error('FALLO:', e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

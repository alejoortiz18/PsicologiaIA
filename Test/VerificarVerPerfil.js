/**
 * Verifica enlace Ver perfil desde directorio.
 * node Test/VerificarVerPerfil.js
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'https://localhost:7072';
const CORREO = process.env.CORREO_LOGIN || 'rene@yopmail.com';
const PASS = process.env.PASS_LOGIN || 'Yopmail2026.';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage();
  try {
    await page.goto(`${BASE}/Login`);
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.locator('form[action*="Login"] button[type="submit"]').click();
    await page.waitForURL(u => !u.pathname.includes('/Login'), { timeout: 20000 });

    await page.goto(`${BASE}/Directorio/Psicologos`);
    await page.waitForSelector('.prof-card', { timeout: 15000 });
    const href = await page.locator('.prof-card a:has-text("Ver perfil")').first().getAttribute('href');
    console.log('href Ver perfil:', href);

    const [resp] = await Promise.all([
      page.waitForNavigation({ timeout: 20000 }).catch(() => null),
      page.locator('.prof-card a:has-text("Ver perfil")').first().click(),
    ]);
    console.log('URL final:', page.url());
    const body = await page.locator('body').innerText();
    if (page.url().includes('/Login')) throw new Error('Redirigió a login');
    if (body.includes('404') || body.includes('no se encuentra')) throw new Error('Página no encontrada');
    if (!body.includes('Sobre mí') && !body.includes('Cómo trabajo')) {
      throw new Error('Perfil no cargó contenido esperado. Fragmento: ' + body.slice(0, 300));
    }
    console.log('OK Ver perfil');
  } catch (e) {
    console.error('FALLO:', e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

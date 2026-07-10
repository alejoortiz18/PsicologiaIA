/**
 * Profesional: «Ver perfil público» abre vista PerfilOrador (no redirige a edición).
 * node Test/PruebaVisualVerPerfilPublico.js
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = 'rene@yopmail.com';
const PASS = process.env.PASS || 'Yopmail2026.';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await (await browser.newContext()).newPage();
  try {
    await page.goto(`${BASE}/Login`);
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL(u => !u.pathname.includes('/Login'), { timeout: 30000 });

    await page.goto(`${BASE}/PerfilProfesional`, { waitUntil: 'networkidle' });
    await page.locator('a:has-text("Ver perfil público")').click();
    await page.waitForURL(/PerfilOrador\/Index/, { timeout: 15000 });

    const url = page.url();
    if (!url.includes('vistaPublica=true')) throw new Error('Falta vistaPublica=true en URL: ' + url);
    if (url.includes('/PerfilProfesional')) throw new Error('Redirigió a panel de edición');

    const banner = await page.locator('.perfil-orador-publico .alert-info').count();
    if (!banner) throw new Error('No se muestra vista pública');

    for (const tab of ['Salas creadas', 'Comentarios', 'Calendario']) {
      await page.locator(`.prof-tabs-bar a:has-text("${tab}")`).click();
      await page.waitForLoadState('networkidle');
      if (!page.url().includes('vistaPublica=true')) {
        throw new Error(`Tab ${tab} perdió vistaPublica: ${page.url()}`);
      }
    }

    console.log('OK Ver perfil público (todas las tabs):', url);
  } catch (e) {
    console.error('FALLO', e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

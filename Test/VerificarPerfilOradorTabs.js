/**
 * Verifica pestañas del perfil público del orador.
 * node Test/VerificarPerfilOradorTabs.js
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'https://localhost:7072';
const CORREO = process.env.CORREO_LOGIN || 'rene@yopmail.com';
const PASS = process.env.PASS_LOGIN || 'Yopmail2026.';

const TABS = [
  { name: 'Cuenta', pathPart: '/PerfilOrador/Index/', text: 'Sobre mí' },
  { name: 'Salas', pathPart: '/PerfilOrador/Salas/', text: 'Salas totales' },
  { name: 'Comentarios', pathPart: '/PerfilOrador/Comentarios/', text: 'Comentarios' },
  { name: 'Calendario', pathPart: '/PerfilOrador/Calendario/', text: 'Agenda una cita' },
];

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
    await page.waitForSelector('.prof-card a:has-text("Ver perfil")', { timeout: 15000 });
    await page.locator('.prof-card a:has-text("Ver perfil")').first().click();
    await page.waitForLoadState('networkidle');

    const baseUrl = page.url();
    const idMatch = baseUrl.match(/\/PerfilOrador\/\w+\/(\d+)/);
    if (!idMatch) throw new Error('No se obtuvo id de profesional: ' + baseUrl);
    const id = idMatch[1];

    for (const tab of TABS) {
      const url = `${BASE}${tab.pathPart}${id}`;
      const resp = await page.goto(url);
      if (!resp || resp.status() >= 400) throw new Error(`${tab.name}: HTTP ${resp?.status()}`);
      const body = await page.locator('body').innerText();
      if (body.includes('404') || body.includes('no se encuentra')) {
        throw new Error(`${tab.name}: página no encontrada`);
      }
      if (!body.includes(tab.text)) {
        throw new Error(`${tab.name}: falta texto "${tab.text}". Fragmento: ${body.slice(0, 200)}`);
      }
      const active = await page.locator('.prof-tab-link.active').innerText();
      if (!active.includes(tab.name.split(' ')[0]) && tab.name !== 'Salas creadas') {
        // Salas tab shows "Salas creadas"
        if (tab.name === 'Salas' && !active.includes('Salas')) {
          throw new Error(`${tab.name}: pestaña activa incorrecta: ${active}`);
        }
        if (tab.name !== 'Salas' && !active.includes(tab.name)) {
          throw new Error(`${tab.name}: pestaña activa incorrecta: ${active}`);
        }
      }
      console.log('OK', tab.name, url);
    }

    console.log('OK todas las pestañas del perfil orador');
  } catch (e) {
    console.error('FALLO:', e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

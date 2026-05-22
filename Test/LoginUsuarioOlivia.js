/**
 * Prueba visible: login usuario olivia@yopmail.com
 * node Test/LoginUsuarioOlivia.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'https://localhost:7072';
const CORREO = 'olivia@yopmail.com';
const PASSWORD = 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `login-olivia-${Date.now()}`);

function log(msg) { console.log(msg); }
function ok(msg) { console.log(`       OK   ${msg}`); }
function fail(msg) { throw new Error(`FALLO: ${msg}`); }

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    log('\n[PASO] Ir a Login');
    await page.goto(`${BASE_URL}/Login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.screenshot({ path: path.join(SS, '01-login.png'), fullPage: true });

    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASSWORD);
    await page.screenshot({ path: path.join(SS, '02-credenciales.png'), fullPage: true });

    log('[PASO] Enviar formulario');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const url = page.url();
    const errors = await page.locator('.validation-summary-errors, .form-error, .text-danger, .alert-danger').allTextContents();
    await page.screenshot({ path: path.join(SS, '03-despues-submit.png'), fullPage: true });

    log(`       URL final: ${url}`);
    if (errors.length) log(`       Mensajes UI: ${JSON.stringify(errors)}`);

    if (url.includes('/Login')) {
      fail(`Sigue en Login. Errores: ${errors.join(' | ') || 'sin mensaje visible'}`);
    }

    if (url.includes('/HomeUsuario')) {
      const status = await page.evaluate(() => document.title);
      const bodyText = await page.locator('body').innerText().catch(() => '');
      if (/SqlException|Developer Exception Page|An unhandled exception occurred/i.test(bodyText)) {
        fail(`HomeUsuario con error del servidor: ${bodyText.slice(0, 500)}`);
      }
      if (!/Eventos inscritos|Próximas citas/i.test(bodyText)) {
        fail(`HomeUsuario no muestra el dashboard esperado. URL: ${url}`);
      }
      ok(`Login exitoso → HomeUsuario (${status})`);
      await page.screenshot({ path: path.join(SS, '04-home-usuario.png'), fullPage: true });
    } else if (url.includes('/Account/AccessDenied')) {
      fail('Access Denied — rol no reconocido');
    } else {
      fail(`Redirigió a URL inesperada: ${url}`);
    }

    log(`\nScreenshots: ${SS}`);
  } catch (e) {
    await page.screenshot({ path: path.join(SS, '99-error.png'), fullPage: true }).catch(() => {});
    console.error(e.message || e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

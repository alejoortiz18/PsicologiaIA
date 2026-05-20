/**
 * Prueba E2E: registro de usuario (mismo flujo que profesional)
 *  1. Registro sin contraseña → EsperaConfirmacion
 *  2. Yopmail → enlace ConfirmarEmailUsuario
 *  3. Crear contraseña → Login → HomeUsuario
 */

const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const BASE_URL         = 'https://localhost:7072';
const PASSWORD_USUARIO = 'Password123!';
const ESPERA_CORREO_MS = 10_000;
const YOPMAIL_POLL_MS  = 2_000;
const YOPMAIL_IFRAME_MS = 3_000;
const INBOX_SEL        = '.lm, .m, .mail, div[onclick*="lire"], .msg, [id^="msg"], .inbox-item, div.mail-item';

const timestamp    = Date.now();
const YOPMAIL_USER = `trebol.usuario.test${timestamp}`;
const CORREO_USU   = `${YOPMAIL_USER}@yopmail.com`;
const NUM_DOC      = String(timestamp).slice(-10);

const SS = path.resolve(__dirname, 'screenshots', `usuario-${timestamp}`);
if (!fs.existsSync(SS)) fs.mkdirSync(SS, { recursive: true });

function log(msg)  { console.log(`\n[PASO] ${msg}`); }
function ok(msg)   { console.log(`       OK   ${msg}`); }
function warn(msg) { console.log(`       WARN ${msg}`); }
function fail(msg) {
  console.error(`\n[FALLO] ${msg}`);
  throw new Error(msg);
}

function msRestantes(inicio) {
  return Math.max(0, ESPERA_CORREO_MS - (Date.now() - inicio));
}

function obtenerTokenUsuarioDesdeBd(correo) {
  const q = `SET NOCOUNT ON; SELECT TOP 1 tv.Token FROM TokenValidacion tv INNER JOIN Usuario u ON u.UsuarioId = tv.UsuarioId WHERE u.Correo = '${correo}' AND tv.Usado = 0 ORDER BY tv.FechaExpiracion DESC`;
  const cmd = `sqlcmd -S "DESKALEJO\\SQLEXPRESS" -d TrebolDB -E -Q "${q}" -h -1 -W`;
  const result = execSync(cmd, { encoding: 'utf8', timeout: 10000 });
  return result.split('\n').map((l) => l.trim()).find(
    (l) => l.length >= 4 && l.length <= 64 && l !== 'Token' && !l.startsWith('Changed') && !l.startsWith('--')
  ) || null;
}

async function abrirYopmail(context) {
  const yp = await context.newPage();
  await yp.goto('https://yopmail.com/es/', { waitUntil: 'domcontentloaded' });
  await yp.fill('input#login', YOPMAIL_USER);
  await yp.press('input#login', 'Enter');
  await yp.waitForTimeout(2000);
  return yp;
}

async function refrescarYopmail(yp) {
  for (const sel of ['button#refresh', '.refreshb', '[title*="Refres"]', '#refreshb']) {
    try {
      const btn = yp.locator(sel);
      if (await btn.count() > 0) {
        await btn.first().click({ timeout: 1500 });
        await yp.waitForTimeout(800);
        return;
      }
    } catch { /* siguiente */ }
  }
  await yp.reload({ waitUntil: 'domcontentloaded' });
  await yp.waitForTimeout(800);
}

async function abrirPrimerCorreoYopmail(yp) {
  try {
    const inboxFrame = yp.frameLocator('#ifinbox');
    const el = inboxFrame.locator(INBOX_SEL).first();
    await el.waitFor({ state: 'visible', timeout: YOPMAIL_IFRAME_MS });
    await el.click({ timeout: YOPMAIL_IFRAME_MS });
    return true;
  } catch {
    const el = yp.locator(INBOX_SEL).first();
    if (await el.count() > 0) {
      await el.click({ timeout: YOPMAIL_IFRAME_MS });
      return true;
    }
  }
  return false;
}

async function leerHtmlCorreoYopmail(yp) {
  try {
    const mailFrame = yp.frameLocator('#ifmail');
    return await mailFrame.locator('html').innerHTML({ timeout: YOPMAIL_IFRAME_MS })
      .catch(async () => await mailFrame.locator('body').innerHTML({ timeout: YOPMAIL_IFRAME_MS }).catch(() => ''));
  } catch {
    return await yp.content().catch(() => '');
  }
}

async function buscarEnlaceEnYopmail(yp, pattern, ssPrefix) {
  const inicio = Date.now();
  let intento = 0;
  while (msRestantes(inicio) > 0) {
    intento++;
    log(`Yopmail: buscando enlace (intento ${intento}, restan ${msRestantes(inicio)}ms)...`);
    try {
      if (intento > 1) await refrescarYopmail(yp);
      if (await abrirPrimerCorreoYopmail(yp)) {
        await yp.waitForTimeout(500);
        const html = await leerHtmlCorreoYopmail(yp);
        await yp.screenshot({ path: `${SS}/${ssPrefix}-correo-${intento}.png` });
        const m = html.match(pattern);
        if (m) {
          ok(`Enlace encontrado en ${Date.now() - inicio}ms`);
          return m[0].startsWith('http') ? m[0] : m[1];
        }
      } else {
        warn('Bandeja vacía o sin mensajes aún');
      }
    } catch (e) {
      warn(`Yopmail intento ${intento}: ${e.message.split('\n')[0]}`);
    }
    const espera = Math.min(YOPMAIL_POLL_MS, msRestantes(inicio));
    if (espera > 0) await yp.waitForTimeout(espera);
  }
  return null;
}

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 250,
    channel: 'chrome',
    args: ['--ignore-certificate-errors', '--start-maximized'],
  });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: null });
  const page = await context.newPage();

  try {
    log(`PASO 1 - Registro usuario: ${CORREO_USU}`);
    await page.goto(`${BASE_URL}/Registro/SeleccionPerfil`, { waitUntil: 'domcontentloaded' });
    await page.click('#card-user');
    await page.waitForSelector('#terms-section', { state: 'visible' });
    await page.check('#terms-check');
    await page.click('#continue-btn');
    await page.waitForURL('**/Registro/RegistroUsuario');

    await page.fill('input[name="NombreCompleto"]', 'Juan Test Usuario');
    await page.fill('input[name="Correo"]', CORREO_USU);
    await page.fill('input[name="NumeroDocumento"]', NUM_DOC);
    await page.screenshot({ path: `${SS}/01-formulario.png`, fullPage: true });
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL('**/EsperaConfirmacion', { timeout: ESPERA_CORREO_MS });
    } catch {
      await page.waitForTimeout(2000);
    }

    log('PASO 2 - Verificar EsperaConfirmacion');
    if (!page.url().includes('EsperaConfirmacion')) {
      const errores = await page.locator('.text-danger, .form-error, .validation-summary-errors').allTextContents();
      fail(`No redirigió a EsperaConfirmacion. URL: ${page.url()} | ${JSON.stringify(errores)}`);
    }
    ok('Redirigido a EsperaConfirmacion');

    log('PASO 3 - Yopmail: correo de confirmación');
    const yp = await abrirYopmail(context);
    const patternLink = /https?:\/\/[^\s"'<>]*Registro\/ConfirmarEmailUsuario\?token=[^"'<>\s]+/i;
    const patternPath = /Registro\/ConfirmarEmailUsuario\?token=([^&"'\s<>]+)/i;
    let urlConfirmar = await buscarEnlaceEnYopmail(yp, patternLink, '03-yopmail');
    if (!urlConfirmar) {
      const token = await buscarEnlaceEnYopmail(yp, patternPath, '03b-token');
      if (token) urlConfirmar = `${BASE_URL}/Registro/ConfirmarEmailUsuario?token=${encodeURIComponent(token)}`;
    }
    if (!urlConfirmar) {
      const tokenBd = obtenerTokenUsuarioDesdeBd(CORREO_USU);
      if (tokenBd) urlConfirmar = `${BASE_URL}/Registro/ConfirmarEmailUsuario?token=${encodeURIComponent(tokenBd)}`;
    }
    if (!urlConfirmar) fail('No se obtuvo enlace de confirmación (correo ni BD).');

    log('PASO 4 - ConfirmarEmailUsuario: crear contraseña');
    await page.goto(urlConfirmar.startsWith('http') ? urlConfirmar : `${BASE_URL}/${urlConfirmar}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name="Password"]', { timeout: 10000 });
    await page.fill('input[name="Password"]', PASSWORD_USUARIO);
    await page.fill('input[name="ConfirmarPassword"]', PASSWORD_USUARIO);
    await page.screenshot({ path: `${SS}/04-confirmar-email.png`, fullPage: true });
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    if (!page.url().includes('/Login')) {
      const err = await page.locator('.text-danger, .validation-summary-errors').allTextContents();
      fail(`Confirmación falló. URL: ${page.url()} | ${JSON.stringify(err)}`);
    }
    ok('Contraseña creada → Login');

    log('PASO 5 - Login usuario');
    await page.fill('input[name="Correo"]', CORREO_USU);
    await page.fill('input[name="Password"]', PASSWORD_USUARIO);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    const urlLogin = page.url();
    await page.screenshot({ path: `${SS}/05-login.png`, fullPage: true });

    if (urlLogin.toLowerCase().includes('homeusuario')) {
      ok('LOGIN EXITOSO - HomeUsuario');
    } else {
      const msgs = await page.locator('.text-danger, .alert').allTextContents();
      fail(`Login falló. URL: ${urlLogin} | ${JSON.stringify(msgs)}`);
    }

    log('\n==== PRUEBA USUARIO COMPLETADA ====');
    log(`Correo: ${CORREO_USU}`);
    log(`Screenshots: ${SS}`);
  } catch (e) {
    fail(e.message?.includes('FALLO') ? e.message.replace(/^Error: /, '') : `Error inesperado: ${e.message}`);
  } finally {
    await browser.close();
  }
})();

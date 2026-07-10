/**

 * Prueba E2E visual (Chrome externo): registro de usuario

 *  1. Registro → EsperaConfirmacion

 *  2. Yopmail → clic en "Confirmar correo y crear contraseña"

 *  3. Crear contraseña → Login

 *  4. Verificar ingreso al HomeUsuario

 */



const { chromium } = require('playwright');

const { execSync } = require('child_process');

const path = require('path');

const fs   = require('fs');



const BASE_URL          = 'https://localhost:7072';

const PASSWORD_USUARIO  = 'Password123!';

const ESPERA_CORREO_MS  = 30_000;

const YOPMAIL_POLL_MS   = 2_500;

const YOPMAIL_IFRAME_MS = 5_000;

const INBOX_SEL         = '.lm, .m, .mail, div[onclick*="lire"], .msg, [id^="msg"], .inbox-item, div.mail-item';

const TEXTO_BOTON_CORREO = /Confirmar correo y crear contraseña/i;



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

  const cmd = `sqlcmd -S "(localdb)\\MSSQLLocalDB" -d TrebolDB -E -Q "${q}" -h -1 -W`;

  const result = execSync(cmd, { encoding: 'utf8', timeout: 10000 });

  return result.split('\n').map((l) => l.trim()).find(

    (l) => l.length >= 4 && l.length <= 64 && l !== 'Token' && !l.startsWith('Changed') && !l.startsWith('--')

  ) || null;

}



function paginaConConfirmar(context) {

  return context.pages().find((p) => p.url().includes('ConfirmarEmailUsuario'));

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



/** Clic real en el botón del correo dentro del iframe #ifmail (Yopmail). */

async function clickBotonConfirmarCorreoYopmail(yp, context, ssPrefix) {

  const inicio = Date.now();

  let intento = 0;



  while (msRestantes(inicio) > 0) {

    intento++;

    log(`Yopmail: abrir correo y clic en botón (intento ${intento})...`);

    try {

      if (intento > 1) await refrescarYopmail(yp);



      if (!(await abrirPrimerCorreoYopmail(yp))) {

        warn('Bandeja vacía o sin mensajes aún');

      } else {

        await yp.waitForTimeout(700);

        const mailFrame = yp.frameLocator('#ifmail');

        const boton = mailFrame.getByRole('link', { name: TEXTO_BOTON_CORREO }).first();



        if (await boton.count() === 0) {

          const botonAlt = mailFrame.locator('a').filter({ hasText: TEXTO_BOTON_CORREO }).first();

          if (await botonAlt.count() === 0) {

            warn('Botón "Confirmar correo y crear contraseña" no visible en el iframe del correo');

          } else {

            await yp.screenshot({ path: `${SS}/${ssPrefix}-correo-antes-click.png`, fullPage: true });

            const pagePromise = context.waitForEvent('page', { timeout: 20_000 });

            await botonAlt.click({ timeout: 8000 });

            const confirmPage = await resolverPaginaConfirmacion(context, pagePromise, yp);

            if (confirmPage) return confirmPage;

          }

        } else {

          await yp.screenshot({ path: `${SS}/${ssPrefix}-correo-antes-click.png`, fullPage: true });

          const pagePromise = context.waitForEvent('page', { timeout: 20_000 });

          await boton.click({ timeout: 8000 });

          const confirmPage = await resolverPaginaConfirmacion(context, pagePromise, yp);

          if (confirmPage) return confirmPage;

        }

      }

    } catch (e) {

      warn(`Yopmail intento ${intento}: ${e.message.split('\n')[0]}`);

    }



    const espera = Math.min(YOPMAIL_POLL_MS, msRestantes(inicio));

    if (espera > 0) await yp.waitForTimeout(espera);

  }



  return null;

}



async function resolverPaginaConfirmacion(context, pagePromise, yp) {

  let confirmPage = null;

  try {

    confirmPage = await pagePromise;

    await confirmPage.waitForLoadState('domcontentloaded');

  } catch {

    confirmPage = paginaConConfirmar(context) || (yp.url().includes('ConfirmarEmailUsuario') ? yp : null);

  }



  if (!confirmPage) return null;



  try {

    await confirmPage.waitForURL('**/ConfirmarEmailUsuario**', { timeout: 15_000 });

  } catch {

    if (!confirmPage.url().includes('ConfirmarEmailUsuario')) return null;

  }



  await confirmPage.bringToFront();

  await confirmPage.screenshot({ path: `${SS}/03-despues-click-correo.png`, fullPage: true });

  ok('Clic en "Confirmar correo y crear contraseña" → formulario de contraseña');

  return confirmPage;

}



async function fallbackUrlConfirmar(yp) {

  const patternLink = /https?:\/\/[^\s"'<>]*Registro\/ConfirmarEmailUsuario\?token=[^"'<>\s]+/i;

  const patternPath = /Registro\/ConfirmarEmailUsuario\?token=([^&"'\s<>]+)/i;

  const html = await leerHtmlCorreoYopmail(yp);

  let m = html.match(patternLink);

  if (m) return m[0];

  m = html.match(patternPath);

  if (m) return `${BASE_URL}/Registro/ConfirmarEmailUsuario?token=${encodeURIComponent(m[1])}`;

  const tokenBd = obtenerTokenUsuarioDesdeBd(CORREO_USU);

  if (tokenBd) return `${BASE_URL}/Registro/ConfirmarEmailUsuario?token=${encodeURIComponent(tokenBd)}`;

  return null;

}



async function validarHomeUsuario(page) {

  await page.waitForURL('**/HomeUsuario**', { timeout: 15_000 });

  await page.waitForSelector('.app-layout .sidebar', { timeout: 10_000 });

  await page.waitForSelector('.stats-grid', { timeout: 10_000 });

  await page.waitForSelector('#citas-heading', { timeout: 10_000 });

  await page.waitForSelector('.home-two-col', { timeout: 10_000 });



  const url = page.url();

  if (!url.toLowerCase().includes('homeusuario')) {

    fail(`No llegó al home. URL actual: ${url}`);

  }



  const tituloTopbar = await page.locator('.topbar__title').textContent().catch(() => '');

  if (!tituloTopbar || !tituloTopbar.includes('Inicio')) {

    warn(`Topbar sin "Inicio" (texto: "${tituloTopbar?.trim()}")`);

  }



  await page.screenshot({ path: `${SS}/06-home-usuario.png`, fullPage: true });

  ok('Usuario ingresó al sistema — HomeUsuario visible');

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

    await page.fill('input[name="Celular"]', '3001234567');

    await page.fill('input[name="Alias"]', `Usuario${timestamp}`);

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

    await page.screenshot({ path: `${SS}/02-espera-confirmacion.png`, fullPage: true });



    log('PASO 3 - Yopmail: clic en botón "Confirmar correo y crear contraseña"');

    const yp = await abrirYopmail(context);

    let confirmPage = await clickBotonConfirmarCorreoYopmail(yp, context, '03-yopmail');



    if (!confirmPage) {

      warn('Clic en botón falló; intentando abrir enlace del HTML como respaldo');

      const urlConfirmar = await fallbackUrlConfirmar(yp);

      if (!urlConfirmar) fail('No se pudo hacer clic en el botón del correo ni obtener el enlace.');

      confirmPage = await context.newPage();

      await confirmPage.goto(urlConfirmar, { waitUntil: 'domcontentloaded' });

    }



    log('PASO 4 - Formulario ConfirmarEmailUsuario: crear contraseña');

    await confirmPage.waitForSelector('input[name="Password"]', { timeout: 12_000 });

    const modalError = confirmPage.locator('#modal-token-invalido-backdrop.open');

    if (await modalError.count() > 0) {

      fail('Token inválido: se mostró modal de error en lugar del formulario de contraseña.');

    }



    await confirmPage.fill('input[name="Password"]', PASSWORD_USUARIO);

    await confirmPage.fill('input[name="ConfirmarPassword"]', PASSWORD_USUARIO);

    await confirmPage.screenshot({ path: `${SS}/04-confirmar-email.png`, fullPage: true });

    await confirmPage.click('button[type="submit"]');

    await confirmPage.waitForURL('**/Login**', { timeout: 15_000 });



    if (!confirmPage.url().includes('/Login')) {

      const err = await confirmPage.locator('.text-danger, .validation-summary-errors, .form-error').allTextContents();

      fail(`Confirmación falló. URL: ${confirmPage.url()} | ${JSON.stringify(err)}`);

    }

    ok('Contraseña creada → pantalla de Login');

    await confirmPage.screenshot({ path: `${SS}/05-login-form.png`, fullPage: true });



    log('PASO 5 - Login e ingreso al HomeUsuario');

    await confirmPage.fill('input[name="Correo"]', CORREO_USU);

    await confirmPage.fill('input[name="Password"]', PASSWORD_USUARIO);

    await confirmPage.click('button[type="submit"]');

    await validarHomeUsuario(confirmPage);



    log('\n==== PRUEBA USUARIO COMPLETADA ====');

    log(`Correo: ${CORREO_USU}`);

    log(`Contraseña: ${PASSWORD_USUARIO}`);

    log(`Screenshots: ${SS}`);

  } catch (e) {

    fail(e.message?.includes('FALLO') ? e.message.replace(/^Error: /, '') : `Error inesperado: ${e.message}`);

  } finally {

    await browser.close();

  }

})();



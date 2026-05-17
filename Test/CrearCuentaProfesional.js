/**
 * Prueba completa: Crear Cuenta Profesional
 *
 * Pasos:
 *  1.  Registrar profesional (sin contrasena en el formulario)
 *  2.  Verificar redirect a EsperaConfirmacion
 *  3.  Gmail admin → verificar que llego el correo con PDF adjunto (registro)
 *  4.  Admin ve notificacion "Sin validar" — botones deshabilitados
 *  5.  Yopmail → correo de confirmacion → clic en enlace
 *  6.  ConfirmarEmail → crear contrasena → EsperaAprobacion
 *  7.  Admin refresca bandeja → botones habilitados (PENDIENTE_APROBACION)
 *  8.  Admin RECHAZA con motivo
 *  9.  Yopmail → correo de rechazo → verificar motivo y enlace
 *  10. Profesional reenvía documentos corregidos
 *  11. Gmail admin → verificar que llego el correo con PDF adjunto (reenvio)
 *  12. Admin refresca bandeja → PENDIENTE_APROBACION de nuevo → APRUEBA
 *  13. Yopmail → correo de bienvenida
 *  14. Profesional hace login → HomeProfesional
 */

const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

// ─── Configuracion ────────────────────────────────────────────────────────────
const BASE_URL        = 'https://localhost:7072';
const ADMIN_CORREO    = 'psicologiatrevol@gmail.com';
const ADMIN_PASSWORD  = 'Gm41l.C0m';          // Contrasena Gmail (web)
const PASSWORD_PRO    = 'Password123!';
const MOTIVO_RECHAZO  = 'El documento presentado esta vencido. Por favor renueva tu tarjeta profesional.';
const CEDULA_PDF      = path.resolve(__dirname, '../Documentos/ArchivosPrueba/CedulaPrueba.pdf');
const TARJETA_PDF     = path.resolve(__dirname, '../Documentos/ArchivosPrueba/TarjetaProfesionalPrueba.pdf');

const timestamp    = Date.now();
const YOPMAIL_USER = `trebol.pro.test${timestamp}`;
const CORREO_PRO   = `${YOPMAIL_USER}@yopmail.com`;

const SS = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(SS)) fs.mkdirSync(SS);

function log(msg)  { console.log(`\n[PASO] ${msg}`); }
function ok(msg)   { console.log(`       OK   ${msg}`); }
function warn(msg) { console.log(`       WARN ${msg}`); }
function fail(msg) { console.error(`\n[FALLO] ${msg}`); }

// ─── Helpers Yopmail ──────────────────────────────────────────────────────────

async function abrirYopmail(context) {
  const yp = await context.newPage();
  await yp.goto('https://yopmail.com/es/', { waitUntil: 'domcontentloaded' });
  await yp.waitForTimeout(2000);
  await yp.fill('input#login', YOPMAIL_USER);
  await yp.press('input#login', 'Enter');
  await yp.waitForTimeout(5000);
  return yp;
}

async function refrescarYopmail(yp) {
  const sels = [
    'button#refresh', '.refreshb', '[title*="Refres"]', '[title*="Actual"]', '#refreshb',
    'button[onclick*="refresh"]', 'a[onclick*="refresh"]', '.btn-refresh',
    'button:has-text("Actualizar")', 'button:has-text("Refresh")',
  ];
  for (const sel of sels) {
    try {
      const btn = yp.locator(sel);
      if (await btn.count() > 0) { await btn.first().click(); await yp.waitForTimeout(2500); return; }
    } catch { }
  }
  await yp.reload({ waitUntil: 'domcontentloaded' });
  await yp.waitForTimeout(3000);
}

/** Busca un patron href en el correo mas reciente de Yopmail. Reintenta hasta maxTries. */
async function buscarEnlaceEnYopmail(yp, pattern, ssPrefix, maxTries) {
  maxTries = maxTries || 10;
  // Selectores de bandeja Yopmail (varian segun version)
  const INBOX_SEL = '.lm, .m, .mail, div[onclick*="lire"], .msg, [id^="msg"], .inbox-item, div.mail-item';
  for (let i = 1; i <= maxTries; i++) {
    log(`Yopmail buscando enlace (intento ${i}/${maxTries})...`);
    try {
      if (i > 1) await refrescarYopmail(yp);
      await yp.screenshot({ path: `${SS}/${ssPrefix}-bandeja-${i}.png` });
      // intentar iframe primero, luego pagina directa
      let clicked = false;
      try {
        const inboxFrame = yp.frameLocator('#ifinbox');
        const el = inboxFrame.locator(INBOX_SEL).first();
        await el.waitFor({ timeout: 8000 });
        await el.click();
        clicked = true;
      } catch {
        // fallback: buscar en la pagina completa
        const el = yp.locator(INBOX_SEL).first();
        if (await el.count() > 0) { await el.click(); clicked = true; }
      }
      if (!clicked) { warn(`Intento ${i}: bandeja vacia o sin selector`); await yp.waitForTimeout(10000); continue; }
      await yp.waitForTimeout(3000);
      // leer HTML del correo
      let html = '';
      try {
        const mailFrame = yp.frameLocator('#ifmail');
        html = await mailFrame.locator('html').innerHTML({ timeout: 8000 })
          .catch(async () => await mailFrame.locator('body').innerHTML({ timeout: 5000 }).catch(() => ''));
      } catch {
        html = await yp.content().catch(() => '');
      }
      await yp.screenshot({ path: `${SS}/${ssPrefix}-correo-${i}.png` });
      const m = html.match(pattern);
      if (m) { ok(`Enlace encontrado: ${m[1]}`); return m[1]; }
      warn('Enlace no encontrado aun. Siguiente intento en 10s...');
    } catch (e) { warn(`Intento ${i} fallo: ${e.message.split('\n')[0]}`); }
    await yp.waitForTimeout(10000);
  }
  return null;
}

/** Lee el texto del correo mas reciente en Yopmail */
async function leerTextoCorreo(yp, ssPrefix) {
  const INBOX_SEL = '.lm, .m, .mail, div[onclick*="lire"], .msg, [id^="msg"], .inbox-item, div.mail-item';
  try {
    await refrescarYopmail(yp);
    try {
      const inboxFrame = yp.frameLocator('#ifinbox');
      await inboxFrame.locator(INBOX_SEL).first().click();
    } catch {
      const el = yp.locator(INBOX_SEL).first();
      if (await el.count() > 0) await el.click();
    }
    await yp.waitForTimeout(3000);
    const mailFrame = yp.frameLocator('#ifmail');
    const text = await mailFrame.locator('body').textContent({ timeout: 8000 }).catch(() => '');
    await yp.screenshot({ path: `${SS}/${ssPrefix}.png` });
    return text;
  } catch { return ''; }
}

// ─── Helper Gmail ─────────────────────────────────────────────────────────────

/**
 * Abre Gmail, inicia sesion si es necesario, busca correos que contengan
 * `searchQuery` y verifica que el primero tenga adjunto.
 * Devuelve { encontrado, tieneAdjunto }.
 */
async function verificarGmailAdjunto(context, gmailUser, gmailPass, searchQuery, ssPrefix, maxTries) {
  maxTries = maxTries || 8;
  const gPage = await context.newPage();

  try {
    // 1. Ir a Gmail
    await gPage.goto('https://mail.google.com/', { waitUntil: 'networkidle', timeout: 30000 });
    await gPage.waitForTimeout(2000);
    await gPage.screenshot({ path: `${SS}/${ssPrefix}-01-gmail-inicio.png` });

    // 2. Si no esta logueado, hacer login
    if (!gPage.url().includes('/mail/')) {
      log('Gmail: iniciando sesion...');

      // Pantalla de email
      const emailInput = gPage.locator('input[type="email"]');
      if (await emailInput.count() > 0) {
        await emailInput.fill(gmailUser);
        await gPage.screenshot({ path: `${SS}/${ssPrefix}-02-gmail-email.png` });

        // Buscar boton Siguiente / Next / Continue
        const nextBtn = gPage.locator('button:has-text("Siguiente"), button:has-text("Next"), #identifierNext');
        if (await nextBtn.count() > 0) await nextBtn.first().click();
        else await gPage.keyboard.press('Enter');
        await gPage.waitForTimeout(3000);
        await gPage.screenshot({ path: `${SS}/${ssPrefix}-03-gmail-post-email.png` });
      }

      // Pantalla de contrasena
      const passInput = gPage.locator('input[type="password"]');
      if (await passInput.count() > 0) {
        await passInput.fill(gmailPass);
        await gPage.screenshot({ path: `${SS}/${ssPrefix}-04-gmail-pass.png` });

        const passBtn = gPage.locator('button:has-text("Siguiente"), button:has-text("Next"), #passwordNext');
        if (await passBtn.count() > 0) await passBtn.first().click();
        else await gPage.keyboard.press('Enter');
        await gPage.waitForTimeout(5000);
        await gPage.screenshot({ path: `${SS}/${ssPrefix}-05-gmail-post-pass.png` });
      }

      // Manejar posibles pantallas intermedias de Google
      // "Esta aplicacion no es segura" / "Continuar" / "Confirmar identidad"
      for (let guard = 0; guard < 5; guard++) {
        const url = gPage.url();
        if (url.includes('/mail/')) break;

        // Buscar boton generico de continuar / confirmar
        const continuarBtn = gPage.locator(
          'button:has-text("Continuar"), button:has-text("Continue"), ' +
          'button:has-text("Confirmar"), button:has-text("Confirm"), ' +
          '[data-action*="proceed"], a:has-text("Usar Gmail")'
        );
        if (await continuarBtn.count() > 0) {
          ok(`Gmail: pagina intermedia detectada -> clic en "${await continuarBtn.first().textContent()}"`);
          await continuarBtn.first().click();
          await gPage.waitForTimeout(3000);
        } else {
          await gPage.waitForTimeout(3000);
        }
        await gPage.screenshot({ path: `${SS}/${ssPrefix}-06-gmail-guard-${guard}.png` });
      }

      if (!gPage.url().includes('/mail/')) {
        warn(`Gmail: No se pudo iniciar sesion. URL: ${gPage.url()}`);
        await gPage.screenshot({ path: `${SS}/${ssPrefix}-error-login.png` });
        await gPage.close();
        return { encontrado: false, tieneAdjunto: false, error: 'login_failed' };
      }
      ok('Gmail: sesion iniciada');
    }

    await gPage.waitForTimeout(3000);

    // 3. Buscar el correo
    for (let i = 1; i <= maxTries; i++) {
      log(`Gmail buscando "${searchQuery}" (intento ${i}/${maxTries})...`);
      try {
        // Usar el buscador de Gmail
        const searchBox = gPage.locator('input[aria-label*="Buscar"], input[placeholder*="Search"], input[name="q"], input[aria-label*="Buscar en el correo"]');
        await searchBox.first().click({ timeout: 5000 });
        await searchBox.first().fill('');
        await searchBox.first().fill(searchQuery);
        await gPage.keyboard.press('Enter');
        await gPage.waitForTimeout(4000);
        await gPage.screenshot({ path: `${SS}/${ssPrefix}-busqueda-${i}.png` });

        // Filas de correo en Gmail (clase tr.zA o div[role="row"])
        const emailRows = gPage.locator('tr.zA');
        const cnt = await emailRows.count();
        if (cnt === 0) {
          warn(`Gmail: Sin resultados (intento ${i}/${maxTries}). Esperando 15s...`);
          // Volver al inbox y refrescar
          await gPage.goto('https://mail.google.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
          await gPage.waitForTimeout(5000);
          continue;
        }

        // El primer resultado es el mas reciente
        const firstRow = emailRows.first();

        // Verificar icono de adjunto (.aZF = clip icon en lista Gmail)
        const adjIconList = await firstRow.locator('.aZF').count();
        ok(`Gmail: ${cnt} correo(s) encontrado(s). Icono adjunto en lista: ${adjIconList > 0 ? 'SI' : 'no detectado'}`);

        // Abrir el correo
        await firstRow.click();
        await gPage.waitForTimeout(3000);
        await gPage.screenshot({ path: `${SS}/${ssPrefix}-correo-abierto-${i}.png` });

        // Dentro del correo abierto:
        // .aQH = seccion de adjuntos, .aZI = chip de adjunto, [data-attachment-id]
        const adjSelectors = [
          '.aQH .aZI',        // chip adjunto en correo abierto
          '[data-attachment-id]',
          '.brc',             // miniatura adjunto
          'div[aria-label*="adjunto"]',
          'div[aria-label*="attachment"]',
          'span[download]',
          'a[href*="attachment"]'
        ];
        let tieneAdjunto = false;
        for (const sel of adjSelectors) {
          const cnt2 = await gPage.locator(sel).count();
          if (cnt2 > 0) { tieneAdjunto = true; ok(`Adjunto encontrado via selector: ${sel} (${cnt2})`); break; }
        }

        if (!tieneAdjunto) {
          // Leer texto de la pagina para detectar nombre de archivo
          const texto = await gPage.locator('body').textContent({ timeout: 5000 }).catch(() => '');
          if (texto.includes('.pdf') || texto.includes('documento_')) {
            tieneAdjunto = true; ok('Adjunto detectado por texto ".pdf" en el cuerpo del correo');
          }
        }

        await gPage.screenshot({ path: `${SS}/${ssPrefix}-resultado.png` });
        await gPage.close();
        return { encontrado: true, tieneAdjunto };

      } catch (e) {
        warn(`Gmail intento ${i} error: ${e.message.split('\n')[0]}`);
        await gPage.screenshot({ path: `${SS}/${ssPrefix}-error-${i}.png` }).catch(() => {});
        await gPage.waitForTimeout(10000);
      }
    }

    warn('Gmail: no se pudo verificar el correo luego de varios intentos.');
    await gPage.screenshot({ path: `${SS}/${ssPrefix}-timeout.png` }).catch(() => {});
    await gPage.close();
    return { encontrado: false, tieneAdjunto: false };

  } catch (fatal) {
    warn(`Gmail verificacion fallida: ${fatal.message.split('\n')[0]}`);
    await gPage.screenshot({ path: `${SS}/${ssPrefix}-fatal.png` }).catch(() => {});
    try { await gPage.close(); } catch { }
    return { encontrado: false, tieneAdjunto: false, error: fatal.message };
  }
}

// ─── Test principal ───────────────────────────────────────────────────────────

(async () => {
  const browser = await chromium.launch({
    headless: false, slowMo: 250,
    channel: 'chrome',
    args: ['--ignore-certificate-errors', '--start-maximized']
  });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: null });
  const page    = await context.newPage();

  try {

    // ─── PASO 1: Registrar profesional (sin contrasena) ───────────────────────
    log(`PASO 1 - Registrando profesional: ${CORREO_PRO}`);
    await page.goto(`${BASE_URL}/Registro/SeleccionPerfil`, { waitUntil: 'domcontentloaded' });
    await page.click('#card-pro');
    await page.waitForSelector('#terms-section', { state: 'visible' });
    await page.check('#terms-check');
    await page.click('#continue-btn');
    await page.waitForURL('**/Registro/RegistroProfesional');

    await page.fill('input[name="NombreCompleto"]',  'Dra. Ana Test Profesional');
    await page.fill('input[name="Correo"]',           CORREO_PRO);
    await page.fill('input[name="NumeroDocumento"]', String(timestamp).slice(-9));
    await page.fill('input[name="EspecialidadId"]', '1');
    await page.fill('input[name="NumeroRegistro"]',  `PSI-${timestamp}`);
    await page.locator('input[name="FotocopiaCedula"]').setInputFiles(CEDULA_PDF);
    await page.locator('input[name="FotocopiaTarjeta"]').setInputFiles(TARJETA_PDF);
    await page.screenshot({ path: `${SS}/01-formulario-lleno.png` });
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    // ─── PASO 2: Verificar EsperaConfirmacion ─────────────────────────────────
    log('PASO 2 - Verificar EsperaConfirmacion');
    const urlReg = page.url();
    await page.screenshot({ path: `${SS}/02-espera-confirmacion.png` });
    if (urlReg.includes('EsperaConfirmacion')) {
      ok('Redirigido a EsperaConfirmacion');
    } else {
      const errores = await page.locator('.text-danger, .form-error').allTextContents();
      fail(`No redirigio. URL: ${urlReg} | Errores: ${JSON.stringify(errores)}`);
      await browser.close(); return;
    }

    // ─── PASO 3: Gmail admin — correo con PDF adjunto (registro) ──────────────
    log('PASO 3 - Gmail admin: verificar correo con PDF adjunto (registro)');
    // Dar margen de 15s para que el correo llegue al servidor Gmail
    log('  Esperando 15s para que llegue el correo al servidor Gmail...');
    await page.waitForTimeout(15000);

    const searchQueryRegistro = `[Trebol] Nueva solicitud`;
    const gmailResultRegistro = await verificarGmailAdjunto(
      context, ADMIN_CORREO, ADMIN_PASSWORD,
      searchQueryRegistro, '03-gmail-registro', 8
    );
    if (gmailResultRegistro.error === 'login_failed') {
      warn('Gmail login fallo — continuando sin verificacion de adjunto');
    } else if (gmailResultRegistro.encontrado && gmailResultRegistro.tieneAdjunto) {
      ok('CORREO CON ADJUNTO CONFIRMADO en Gmail admin (registro)');
    } else if (gmailResultRegistro.encontrado && !gmailResultRegistro.tieneAdjunto) {
      warn('Correo encontrado en Gmail pero adjunto NO detectado');
    } else {
      warn('Correo de registro NO encontrado en Gmail (puede ser retraso SMTP)');
    }

    // ─── PASO 4: Admin — bandeja con badge "Sin validar" ──────────────────────
    log('PASO 4 - Admin: verificar badge Sin validar y botones deshabilitados');
    const adminPage = await context.newPage();
    await adminPage.goto(`${BASE_URL}/Login`, { waitUntil: 'domcontentloaded' });
    await adminPage.fill('input[name="Correo"]',   ADMIN_CORREO);
    await adminPage.fill('input[name="Password"]', ADMIN_PASSWORD);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForTimeout(3000);

    if (!adminPage.url().includes('Bandeja')) {
      await adminPage.goto(`${BASE_URL}/Admin/BandejaNotificaciones`, { waitUntil: 'domcontentloaded' });
      await adminPage.waitForTimeout(2000);
    }
    await adminPage.screenshot({ path: `${SS}/04-bandeja-sin-validar.png` });

    const primerAprobar = adminPage.locator('.btn-aprobar').first();
    const disabled4 = await primerAprobar.isDisabled().catch(() => null);
    if (disabled4) {
      ok('Boton Aprobar deshabilitado (PENDIENTE_VALIDACION)');
    } else {
      warn('Boton no deshabilitado — verificar badge en pantalla');
    }

    // ─── PASO 5: Yopmail — enlace de confirmacion ─────────────────────────────
    log('PASO 5 - Yopmail: buscar enlace de confirmacion');
    const ypPage = await abrirYopmail(context);
    const patternConf = /href=["'](https?:\/\/[^"']+\/Registro\/ConfirmarEmail\?token=[^"']+)["']/;
    const enlaceConf  = await buscarEnlaceEnYopmail(ypPage, patternConf, '05-yopmail-confirmacion', 10);

    let urlConf = enlaceConf;
    if (!urlConf) {
      warn('Enlace no encontrado en email. Intentando BD...');
      try {
        const cmd = `sqlcmd -S "DESKALEJO\\SQLEXPRESS" -d TrebolDB -E -Q "SET NOCOUNT ON; SELECT TOP 1 Token FROM TokenActivacion WHERE Correo = '${CORREO_PRO}' ORDER BY FechaExpiracion DESC" -h -1 -W`;
        const result = execSync(cmd, { encoding: 'utf8', timeout: 10000 });
        const dbToken = result.split('\n').map(l => l.trim()).find(l => l.length >= 4 && l.length < 500 && !l.startsWith('Changed') && !l.startsWith('--'));
        if (dbToken) {
          urlConf = `${BASE_URL}/Registro/ConfirmarEmail?token=${encodeURIComponent(dbToken.trim())}`;
          ok(`Token obtenido de BD`);
        }
      } catch (e) { warn(`BD fallback fallo: ${e.message.split('\n')[0]}`); }
    }
    if (!urlConf) { fail('Sin enlace ni token. Abortando.'); await browser.close(); return; }

    // ─── PASO 6: ConfirmarEmail — crear contrasena ────────────────────────────
    log('PASO 6 - ConfirmarEmail: crear contrasena');
    await page.bringToFront();
    await page.goto(urlConf, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/06-confirmar-email.png` });
    await page.fill('input[name="Password"]',          PASSWORD_PRO);
    await page.fill('input[name="ConfirmarPassword"]', PASSWORD_PRO);
    await page.screenshot({ path: `${SS}/06b-contrasena-ingresada.png` });
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    const urlPost6 = page.url();
    await page.screenshot({ path: `${SS}/06c-post-confirmar.png` });
    if (urlPost6.includes('EsperaAprobacion')) {
      ok('Contrasena creada - EsperaAprobacion');
    } else {
      const err = await page.locator('.text-danger, .form-error').allTextContents();
      fail(`No redirigio a EsperaAprobacion. URL: ${urlPost6} | ${JSON.stringify(err)}`);
      await browser.close(); return;
    }

    // ─── PASO 7: Admin — bandeja PENDIENTE_APROBACION, botones habilitados ─────
    log('PASO 7 - Admin: PENDIENTE_APROBACION y botones habilitados');
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(2000);
    await adminPage.screenshot({ path: `${SS}/07-bandeja-listo-revision.png` });

    const primerAprobar2 = adminPage.locator('.btn-aprobar').first();
    const disabled7 = await primerAprobar2.isDisabled().catch(() => true);
    if (!disabled7) {
      ok('Boton Aprobar habilitado (PENDIENTE_APROBACION)');
    } else {
      warn('Boton aun deshabilitado — verificar que estado cambio en BD');
    }

    // ─── PASO 8: Admin RECHAZA con motivo ─────────────────────────────────────
    log('PASO 8 - Admin: rechazar con motivo');
    const primerRechazar = adminPage.locator('.btn-rechazar').first();
    if (await primerRechazar.isDisabled().catch(() => true)) {
      fail('Boton rechazar deshabilitado. Abortando.'); await browser.close(); return;
    }
    adminPage.once('dialog', async dialog => {
      ok(`Prompt aparecido: "${dialog.message()}" - aceptando con motivo`);
      await dialog.accept(MOTIVO_RECHAZO);
    });
    await primerRechazar.click();
    await adminPage.waitForTimeout(5000);
    await adminPage.screenshot({ path: `${SS}/08-rechazado.png` });
    ok('Rechazo enviado');

    // ─── PASO 9: Yopmail — correo de rechazo ──────────────────────────────────
    log('PASO 9 - Yopmail: verificar correo de rechazo');
    let enlaceReenvio = null;
    for (let i = 1; i <= 8; i++) {
      const texto = await leerTextoCorreo(ypPage, `09-yopmail-rechazo-${i}`);
      if (texto.includes('vencido') || texto.toLowerCase().includes('rechaz')) {
        ok('Correo de rechazo recibido con motivo');
        const mailFrame = ypPage.frameLocator('#ifmail');
        const html = await mailFrame.locator('html').innerHTML({ timeout: 5000 }).catch(() => '');
        const m = html.match(/href=["'](https?:\/\/[^"']*\/Registro\/ReenviarDocumentos[^"']*)["']/);
        if (m) { enlaceReenvio = m[1]; ok(`Enlace reenvio: ${enlaceReenvio}`); }
        break;
      }
      warn(`Correo rechazo no llego (${i}/8). Esperando 10s...`);
      await ypPage.waitForTimeout(10000);
    }

    // ─── PASO 10: Reenviar documentos corregidos ──────────────────────────────
    log('PASO 10 - Reenviar documentos corregidos');
    await page.bringToFront();
    const urlReenvio = enlaceReenvio
      || `${BASE_URL}/Registro/ReenviarDocumentos?correo=${encodeURIComponent(CORREO_PRO)}`;
    await page.goto(urlReenvio, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SS}/10-reenviar-docs.png` });
    await page.fill('input[name="Correo"]', CORREO_PRO);
    await page.locator('input[name="FotocopiaCedula"]').setInputFiles(CEDULA_PDF);
    await page.locator('input[name="FotocopiaTarjeta"]').setInputFiles(TARJETA_PDF);
    await page.screenshot({ path: `${SS}/10b-docs-listos.png` });
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    const urlPost10 = page.url();
    await page.screenshot({ path: `${SS}/10c-post-reenvio.png` });
    if (urlPost10.includes('EsperaAprobacion')) {
      ok('Docs reenviados - EsperaAprobacion');
    } else {
      const err = await page.locator('.text-danger, .form-error').allTextContents();
      warn(`URL post-reenvio: ${urlPost10} | ${JSON.stringify(err)}`);
    }

    // ─── PASO 11: Gmail admin — correo con PDF adjunto (reenvio) ──────────────
    log('PASO 11 - Gmail admin: verificar correo con PDF adjunto (reenvio documentos)');
    log('  Esperando 15s para que llegue el correo al servidor Gmail...');
    await page.waitForTimeout(15000);

    const searchQueryReenvio = `Re-envio de documentos`;
    const gmailResultReenvio = await verificarGmailAdjunto(
      context, ADMIN_CORREO, ADMIN_PASSWORD,
      searchQueryReenvio, '11-gmail-reenvio', 8
    );
    if (gmailResultReenvio.encontrado && gmailResultReenvio.tieneAdjunto) {
      ok('CORREO CON ADJUNTO CONFIRMADO en Gmail admin (reenvio)');
    } else if (gmailResultReenvio.encontrado && !gmailResultReenvio.tieneAdjunto) {
      warn('Correo de reenvio encontrado pero adjunto NO detectado');
    } else {
      warn('Correo de reenvio NO encontrado en Gmail');
    }

    // ─── PASO 12: Admin refresca → APRUEBA ────────────────────────────────────
    log('PASO 12 - Admin: nueva PENDIENTE_APROBACION → APRUEBA');
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(2000);
    await adminPage.screenshot({ path: `${SS}/12-bandeja-resubmit.png` });

    const aprobarPost12 = adminPage.locator('.btn-aprobar').first();
    const disabled12 = await aprobarPost12.isDisabled().catch(() => true);
    if (!disabled12) {
      ok('Boton Aprobar habilitado de nuevo');
    } else {
      warn('Boton deshabilitado — puede que sea notificacion diferente');
    }

    await aprobarPost12.click();
    await adminPage.waitForTimeout(6000);
    await adminPage.screenshot({ path: `${SS}/12b-aprobado.png` });
    ok('Aprobacion enviada');

    // ─── PASO 13: Yopmail — correo de bienvenida ──────────────────────────────
    log('PASO 13 - Yopmail: verificar correo de bienvenida');
    let bienvenidaOk = false;
    for (let i = 1; i <= 8; i++) {
      const texto = await leerTextoCorreo(ypPage, `13-yopmail-bienvenida-${i}`);
      if (texto.toLowerCase().includes('bienvenido') || texto.toLowerCase().includes('aprobad')) {
        ok('Correo de bienvenida recibido'); bienvenidaOk = true; break;
      }
      warn(`Correo bienvenida no llego (${i}/8)...`);
      await ypPage.waitForTimeout(10000);
    }
    if (!bienvenidaOk) warn('Correo bienvenida no detectado, continuando con login...');

    // ─── PASO 14: Login profesional → HomeProfesional ─────────────────────────
    log('PASO 14 - Login del profesional');
    const proContext = await browser.newContext({ ignoreHTTPSErrors: true });
    const proPage = await proContext.newPage();
    await proPage.goto(`${BASE_URL}/Login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await proPage.waitForTimeout(2000);
    await proPage.screenshot({ path: `${SS}/14-login-pro.png` });
    log(`PASO 14 - URL tras goto: ${proPage.url()}`);
    await proPage.waitForSelector('#Correo, input[name="Correo"]', { timeout: 15000 });
    await proPage.fill('#Correo',   CORREO_PRO);
    await proPage.fill('#Password', PASSWORD_PRO);
    await proPage.screenshot({ path: `${SS}/14b-credenciales.png` });
    await proPage.click('button[type="submit"]');
    await proPage.waitForTimeout(4000);

    const urlLogin = proPage.url();
    await proPage.screenshot({ path: `${SS}/14c-resultado-login.png` });

    if (urlLogin.toLowerCase().includes('homeprofesional')) {
      ok('LOGIN EXITOSO - HomeProfesional');
    } else {
      const msgs = await proPage.locator('.text-danger, .alert-danger').allTextContents();
      warn(`URL: ${urlLogin} | Mensajes: ${JSON.stringify(msgs)}`);
    }

    log('\n==== PRUEBA COMPLETADA ====');
    log(`Screenshots en: ${SS}`);
    log('Navegador abierto para inspeccion. Cierralo cuando termines.');

  } catch (err) {
    fail(`Error inesperado: ${err.message}`);
    console.error(err.stack);
    await page.screenshot({ path: `${SS}/error-inesperado.png` }).catch(() => {});
  }
})();

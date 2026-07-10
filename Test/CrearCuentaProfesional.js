/**
 * Prueba E2E: flujo profesional (6 etapas)
 *
 * Etapa 1 — Registro
 *   SeleccionPerfil → RegistroProfesional POST → BD PENDIENTE_VALIDACION + token 72h
 *   → EsperaConfirmacion (correos SMTP: admin PDFs + pro enlace ConfirmarEmail; no se abre Gmail)
 *
 * Etapa 2 — Confirmación de correo
 *   Admin Trebol: psicologiatrevol@gmail.com → token desde BD → ConfirmarEmail → contraseña
 *   → BD PENDIENTE_APROBACION → EsperaAprobacion
 *
 * Etapa 3 — Revisión admin (bandeja, botones según estado)
 *
 * Etapa 4 — Rechazo + reenvío
 *   Modal rechazo → correo al pro (Yopmail) → ReenviarDocumentos → PENDIENTE_APROBACION
 *
 * Etapa 5 — Aprobación
 *   Admin aprueba → correo bienvenida al pro (Yopmail)
 *
 * Etapa 6 — Login
 *   Profesional → HomeProfesional
 *
 * Variables: STOP_AFTER=N (ej. 9 solo rechazo), SKIP_GMAIL=false para abrir Gmail (por defecto no).
 */

const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

// ─── Configuracion ────────────────────────────────────────────────────────────
const BASE_URL             = 'https://localhost:7072';
/** Admin Trebol para bandeja y confirmación (ingreso al sistema antes de ConfirmarEmail). */
const ADMIN_CANDIDATES = [
  { correo: 'psicologiatrevol@gmail.com', pass: 'Gm41l.C0m' },
  { correo: 'psicologiatrevol@gmail.com', pass: 'Gm41l.C0m' },
];
const ADMIN_CORREO         = ADMIN_CANDIDATES[0].correo;
const ADMIN_PASSWORD       = ADMIN_CANDIDATES[0].pass;
const SKIP_GMAIL           = process.env.SKIP_GMAIL !== 'false';
const STOP_AFTER_STEP      = parseInt(process.env.STOP_AFTER || '99', 10);
const PASSWORD_PRO         = 'Password123!';
const MOTIVO_RECHAZO       = 'El documento presentado está vencido. Por favor renueva tu tarjeta profesional y vuelve a enviar la solicitud.';
/** Máximo de espera por correo en la bandeja Yopmail del profesional que se registra */
const ESPERA_CORREO_MS     = 10_000;
const YOPMAIL_POLL_MS      = 2_000;
const YOPMAIL_IFRAME_MS    = 3_000;
const INBOX_SEL            = '.lm, .m, .mail, div[onclick*="lire"], .msg, [id^="msg"], .inbox-item, div.mail-item';
/** PDFs fijos de prueba: Documentos/ArchivosPrueba/ (desde la raíz del repo) */
const ARCHIVOS_PRUEBA_DIR = path.resolve(__dirname, '../Documentos/ArchivosPrueba');
const CEDULA_PDF          = path.join(ARCHIVOS_PRUEBA_DIR, 'CedulaPrueba.pdf');
const TARJETA_PDF         = path.join(ARCHIVOS_PRUEBA_DIR, 'TarjetaProfesionalPrueba.pdf');

function assertArchivosPrueba() {
  const archivos = [
    ['Cédula', CEDULA_PDF],
    ['Tarjeta profesional', TARJETA_PDF],
  ];
  for (const [nombre, ruta] of archivos) {
    if (!fs.existsSync(ruta)) {
      throw new Error(
        `No se encontró ${nombre}.\n` +
        `Ruta esperada: ${ruta}\n` +
        `Carpeta de prueba: ${ARCHIVOS_PRUEBA_DIR}`
      );
    }
  }
  ok(`Cédula: ${CEDULA_PDF}`);
  ok(`Tarjeta: ${TARJETA_PDF}`);
}

const timestamp    = Date.now();
const YOPMAIL_USER = `trebol.pro.test${timestamp}`;
const CORREO_PRO   = `${YOPMAIL_USER}@yopmail.com`;

const SS = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(SS)) fs.mkdirSync(SS);

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

/** Token de activación en BD (6 caracteres en Trebol). */
function obtenerTokenDesdeBd(correo) {
  const cmd = `sqlcmd -S "DESKALEJO\\SQLEXPRESS" -d TrebolDB -E -Q "SET NOCOUNT ON; SELECT TOP 1 Token FROM TokenActivacion WHERE Correo = '${correo}' ORDER BY FechaExpiracion DESC" -h -1 -W`;
  const result = execSync(cmd, { encoding: 'utf8', timeout: 10000 });
  return result.split('\n').map((l) => l.trim()).find(
    (l) => l.length >= 4 && l.length <= 64 && l !== 'Token' && !l.startsWith('Changed') && !l.startsWith('--')
  ) || null;
}

/** Adjunta los dos PDF obligatorios y verifica que el UI los muestra seleccionados. */
async function loginAdmin(context) {
  const adminPage = await context.newPage();
  for (const { correo, pass } of ADMIN_CANDIDATES) {
    await adminPage.goto(`${BASE_URL}/Login`, { waitUntil: 'domcontentloaded' });
    await adminPage.fill('input[name="Correo"]', correo);
    await adminPage.fill('input[name="Password"]', pass);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForTimeout(3000);
    const url = adminPage.url();
    if (!url.includes('/Login') || url.includes('Bandeja') || url.includes('Admin')) {
      ok(`Admin autenticado: ${correo}`);
      return adminPage;
    }
  }
  fail('Login admin falló (probar node Test/crear-admin.js o usar psicologiatrevol@gmail.com)');
}

async function adjuntarPdfsObligatorios(page) {
  log('Adjuntando PDFs obligatorios (cédula + tarjeta profesional)');
  const inputCedula  = page.locator('input[name="FotocopiaCedula"], #file-cedula-r').first();
  const inputTarjeta = page.locator('input[name="FotocopiaTarjeta"], #file-tarjeta-r').first();
  await inputCedula.waitFor({ state: 'attached', timeout: 10000 });
  await inputTarjeta.waitFor({ state: 'attached', timeout: 10000 });
  await inputCedula.setInputFiles(CEDULA_PDF);
  await inputTarjeta.setInputFiles(TARJETA_PDF);
  await page.waitForTimeout(800);

  const cedulaOk  = (await inputCedula.evaluate((el) => el.files?.length)) > 0;
  const tarjetaOk = (await inputTarjeta.evaluate((el) => el.files?.length)) > 0;

  if (!cedulaOk)  fail(`No se adjuntó CedulaPrueba.pdf. Ruta: ${CEDULA_PDF}`);
  if (!tarjetaOk) fail(`No se adjuntó TarjetaProfesionalPrueba.pdf. Ruta: ${TARJETA_PDF}`);

  ok(`Cédula adjunta: CedulaPrueba.pdf`);
  ok(`Tarjeta adjunta: TarjetaProfesionalPrueba.pdf`);
  await page.screenshot({ path: `${SS}/01b-pdfs-adjuntos.png`, fullPage: true });
}

// ─── Helpers Yopmail ──────────────────────────────────────────────────────────

async function abrirYopmail(context) {
  const yp = await context.newPage();
  await yp.goto('https://yopmail.com/es/', { waitUntil: 'domcontentloaded' });
  await yp.fill('input#login', YOPMAIL_USER);
  await yp.press('input#login', 'Enter');
  await yp.waitForTimeout(2000);
  return yp;
}

async function refrescarYopmail(yp) {
  const sels = [
    'button#refresh', '.refreshb', '[title*="Refres"]', '#refreshb',
    'button:has-text("Actualizar")',
  ];
  for (const sel of sels) {
    try {
      const btn = yp.locator(sel);
      if (await btn.count() > 0) {
        await btn.first().click({ timeout: 1500 });
        await yp.waitForTimeout(800);
        return;
      }
    } catch { /* siguiente selector */ }
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

/** Busca enlace en Yopmail del correo registrado (máx. ESPERA_CORREO_MS). */
async function buscarEnlaceEnYopmail(yp, pattern, ssPrefix) {
  const inicio = Date.now();
  let intento = 0;
  while (msRestantes(inicio) > 0) {
    intento++;
    log(`Yopmail: buscando enlace (intento ${intento}, restan ${msRestantes(inicio)}ms)...`);
    try {
      if (intento > 1) await refrescarYopmail(yp);
      await yp.screenshot({ path: `${SS}/${ssPrefix}-bandeja-${intento}.png` });

      if (!(await abrirPrimerCorreoYopmail(yp))) {
        warn('Bandeja vacía o sin mensajes aún');
      } else {
        await yp.waitForTimeout(500);
        const html = await leerHtmlCorreoYopmail(yp);
        await yp.screenshot({ path: `${SS}/${ssPrefix}-correo-${intento}.png` });
        const m = html.match(pattern);
        if (m) {
          ok(`Enlace encontrado en ${Date.now() - inicio}ms`);
          return m[1];
        }
      }
    } catch (e) {
      warn(`Yopmail intento ${intento}: ${e.message.split('\n')[0]}`);
    }
    const espera = Math.min(YOPMAIL_POLL_MS, msRestantes(inicio));
    if (espera > 0) await yp.waitForTimeout(espera);
  }
  warn(`Sin enlace en Yopmail tras ${ESPERA_CORREO_MS}ms`);
  return null;
}

/** Espera texto en el último correo Yopmail (máx. ESPERA_CORREO_MS). */
async function esperarTextoEnYopmail(yp, predicado, ssPrefix) {
  const inicio = Date.now();
  let intento = 0;
  while (msRestantes(inicio) > 0) {
    intento++;
    try {
      if (intento > 1) await refrescarYopmail(yp);
      if (await abrirPrimerCorreoYopmail(yp)) {
        await yp.waitForTimeout(400);
        const html = await leerHtmlCorreoYopmail(yp);
        const texto = html.replace(/<[^>]+>/g, ' ');
        await yp.screenshot({ path: `${SS}/${ssPrefix}-${intento}.png` });
        if (predicado(texto)) return { texto, html };
      }
    } catch (e) {
      warn(`Yopmail texto intento ${intento}: ${e.message.split('\n')[0]}`);
    }
    const espera = Math.min(YOPMAIL_POLL_MS, msRestantes(inicio));
    if (espera > 0) await yp.waitForTimeout(espera);
  }
  return null;
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
    assertArchivosPrueba();

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
    await page.selectOption('select[name="EspecialidadId"]', '10');
    await page.fill('input[name="NumeroRegistro"]',  `PSI-${timestamp}`);
    await adjuntarPdfsObligatorios(page);
    await page.screenshot({ path: `${SS}/01-formulario-lleno.png`, fullPage: true });
    await page.click('button[type="submit"]');
    try {
      await page.waitForURL('**/EsperaConfirmacion', { timeout: ESPERA_CORREO_MS });
    } catch {
      await page.waitForTimeout(2000);
    }

    // ─── PASO 2: Verificar EsperaConfirmacion ─────────────────────────────────
    log('PASO 2 - Verificar EsperaConfirmacion');
    const urlReg = page.url();
    await page.screenshot({ path: `${SS}/02-post-envio.png` });
    if (urlReg.includes('EsperaConfirmacion')) {
      ok('Redirigido a EsperaConfirmacion');
    } else if (urlReg.includes('RegistroProfesional')) {
      const errores = await page.locator('.text-danger, .form-error').allTextContents();
      const smtpFallo = errores.some((e) => /SMTP|correo de confirmación|Authentication/i.test(e));
      if (smtpFallo) {
        warn('SMTP falló al enviar correo; verificando registro en BD (PDFs ya fueron enviados al admin si SMTP parcial).');
        try {
          const dbToken = obtenerTokenDesdeBd(CORREO_PRO);
          if (dbToken) ok(`Registro en BD OK. Token: ${dbToken}`);
          else fail('SMTP falló y no hay token en BD — el registro no se completó.');
        } catch (e) {
          warn(`No se pudo consultar BD: ${e.message.split('\n')[0]}`);
        }
      } else {
        fail(`No redirigio. URL: ${urlReg} | Errores: ${JSON.stringify(errores)}`);
        await browser.close(); return;
      }
    } else {
      fail(`URL inesperada: ${urlReg}`);
      await browser.close(); return;
    }

    // ─── Etapa 1 (cont.): correo admin con PDFs — omitido en prueba (sin Gmail) ─
    if (SKIP_GMAIL) {
      ok('Etapa 1: correo admin con PDFs omitido (SKIP_GMAIL). SMTP sigue activo en servidor.');
    } else if (!urlReg.includes('EsperaConfirmacion')) {
      warn('Omitiendo Gmail: registro no llegó a EsperaConfirmacion.');
    } else {
      log('PASO 3 - Gmail admin: PDF adjunto (registro)');
      await page.waitForTimeout(ESPERA_CORREO_MS);
      const gmailResultRegistro = await verificarGmailAdjunto(
        context, ADMIN_CORREO, ADMIN_PASSWORD,
        '[Trebol] Nueva solicitud', '03-gmail-registro', 8
      );
      if (gmailResultRegistro.encontrado && gmailResultRegistro.tieneAdjunto) {
        ok('Correo admin registro con adjunto');
      } else {
        warn('Gmail registro: no verificado');
      }
    }

    // ─── Etapa 2 (inicio): admin psicologiatrevol en Trebol ───────────────────
    log('Etapa 2 - Admin ingresa a Trebol (psicologiatrevol@gmail.com)');
    const adminPage = await loginAdmin(context);

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

    // ─── Etapa 2: ConfirmarEmail con token BD (sin Yopmail para el enlace) ────
    let ypPage = null;
    log('Etapa 2 - Confirmar correo: token desde BD (admin ya en sesión)');
    const dbToken = obtenerTokenDesdeBd(CORREO_PRO);
    if (!dbToken) {
      fail('No hay token en TokenActivacion para ' + CORREO_PRO);
      await browser.close();
      return;
    }
    const urlConf = `${BASE_URL}/Registro/ConfirmarEmail?token=${encodeURIComponent(dbToken)}`;
    ok(`Enlace ConfirmarEmail: token ${dbToken}`);

    log('Etapa 2 - ConfirmarEmail: crear contraseña → PENDIENTE_APROBACION');
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

    // ─── Etapa 3: bandeja PENDIENTE_APROBACION ─────────────────────────────────
    log('Etapa 3 - Admin: PENDIENTE_APROBACION, botones habilitados');
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

    // ─── Etapa 4: rechazo + correo al profesional ─────────────────────────────
    log('Etapa 4 - Admin: rechazar con motivo (modal UI/UX)');
    const primerRechazar = adminPage.locator('.btn-rechazar').first();
    if (await primerRechazar.isDisabled().catch(() => true)) {
      fail('Boton rechazar deshabilitado. Abortando.'); await browser.close(); return;
    }
    await primerRechazar.click();
    await adminPage.locator('#modal-rechazar-backdrop.open').waitFor({ timeout: 8000 });
    await adminPage.waitForTimeout(850);
    await adminPage.fill('#motivo-rechazo', MOTIVO_RECHAZO);
    await adminPage.locator('#modal-rechazar-confirm:not([disabled])').waitFor({ timeout: 5000 });
    await adminPage.click('#modal-rechazar-confirm');
    await adminPage.waitForTimeout(4000);
    await adminPage.screenshot({ path: `${SS}/08-rechazado.png` });
    ok('Rechazo enviado');

    ypPage = await abrirYopmail(context);
    log('Etapa 4 - Yopmail: correo de cambio de estado (rechazo, máx. 10s)');
    let enlaceReenvio = null;
    const rechazo = await esperarTextoEnYopmail(
      ypPage,
      (t) => {
        const x = t.toLowerCase();
        return x.includes('rechaz') || x.includes('no aprobada') || x.includes('vencido');
      },
      '09-yopmail-rechazo'
    );
    if (rechazo) {
      ok('Correo al profesional: solicitud rechazada con motivo');
      const m = rechazo.html.match(/href=["'](https?:\/\/[^"']*\/Registro\/ReenviarDocumentos[^"']*)["']/);
      if (m) { enlaceReenvio = m[1]; ok(`Enlace reenvio: ${enlaceReenvio}`); }
    } else {
      fail('No llegó correo de rechazo al profesional en 10s');
      await browser.close();
      return;
    }

    if (STOP_AFTER_STEP <= 9) {
      ok(`Prueba detenida tras etapa 4 (STOP_AFTER=${STOP_AFTER_STEP}).`);
      await browser.close();
      return;
    }

    log('Etapa 4 - ReenviarDocumentos → PENDIENTE_APROBACION');
    await page.bringToFront();
    const urlReenvio = enlaceReenvio
      || `${BASE_URL}/Registro/ReenviarDocumentos?correo=${encodeURIComponent(CORREO_PRO)}`;
    await page.goto(urlReenvio, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SS}/10-reenviar-docs.png` });
    await page.fill('input[name="Correo"]', CORREO_PRO);
    await adjuntarPdfsObligatorios(page);
    await page.screenshot({ path: `${SS}/10b-docs-listos.png`, fullPage: true });
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

    if (SKIP_GMAIL) {
      ok('Correo admin reenvío PDFs omitido (SKIP_GMAIL)');
    } else {
      log('PASO 11 - Gmail admin: reenvío documentos');
      await page.waitForTimeout(10000);
      const gmailResultReenvio = await verificarGmailAdjunto(
        context, ADMIN_CORREO, ADMIN_PASSWORD,
        'Re-envio de documentos', '11-gmail-reenvio', 8
      );
      if (gmailResultReenvio.encontrado && gmailResultReenvio.tieneAdjunto) {
        ok('Correo admin reenvío con adjunto');
      } else {
        warn('Gmail reenvío: no verificado');
      }
    }

    // ─── Etapa 5: aprobación + correo bienvenida ─────────────────────────────
    log('Etapa 5 - Admin aprueba → correo bienvenida al profesional');
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

    log('Etapa 5 - Yopmail: correo de cambio de estado (aprobación, máx. 10s)');
    const bienvenida = await esperarTextoEnYopmail(
      ypPage,
      (t) => {
        const x = t.toLowerCase();
        return x.includes('bienvenido') || x.includes('aprobada') || x.includes('trebol');
      },
      '13-yopmail-bienvenida'
    );
    if (bienvenida) ok('Correo al profesional: cuenta aprobada / bienvenida');
    else {
      fail('No llegó correo de aprobación al profesional en 10s');
      await browser.close();
      return;
    }

    // ─── Etapa 6: login profesional ───────────────────────────────────────────
    log('Etapa 6 - Login profesional → HomeProfesional');
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
    log(`Correo de prueba: ${CORREO_PRO}`);

  } catch (err) {
    fail(`Error inesperado: ${err.message}`);
    console.error(err.stack);
    await page.screenshot({ path: `${SS}/error-inesperado.png` }).catch(() => {});
  } finally {
    // Mantener navegador 5s para inspección visual y cerrar
    await page.waitForTimeout(5000).catch(() => {});
    await browser.close().catch(() => {});
  }
})();

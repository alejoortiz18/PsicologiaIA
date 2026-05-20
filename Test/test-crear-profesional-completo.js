const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5271';
const YOPMAIL_URL = 'https://yopmail.com/es/';
const TEST_EMAIL = `trebol.pro.test${Date.now()}@yopmail.com`;
const TEST_DATA = {
  nombreCompleto: 'Dra. Ana Test Profesional',
  correo: TEST_EMAIL,
  numeroDocumento: '9876543210',
  numeroRegistro: 'PSI-001-2026',
  contraseña: 'Password123!',
  cedulaPdf: path.join(__dirname, '../Documentos/ArchivosPrueba/CedulaPrueba.pdf'),
  tarjetaPdf: path.join(__dirname, '../Documentos/ArchivosPrueba/TarjetaProfesionalPrueba.pdf'),
};

const archivosRequeridos = [TEST_DATA.cedulaPdf, TEST_DATA.tarjetaPdf];
for (const archivo of archivosRequeridos) {
  if (!fs.existsSync(archivo)) {
    console.error(`Falta archivo de prueba: ${archivo}`);
    console.error('Usa los PDF en Documentos/ArchivosPrueba/');
    process.exit(1);
  }
}

const screenshotsDir = path.join(__dirname, 'screenshots', `test-${Date.now()}`);
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
const screenshot = async (page, name) => {
  await page.screenshot({ path: path.join(screenshotsDir, `${name}.png`), fullPage: true });
  log(`📸 Screenshot guardado: ${name}`);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const validateEmailFormat = async (page, expectedType) => {
  log(`🔍 Validando formato de correo (tipo: ${expectedType})`);
  const htmlContent = await page.content();

  if (expectedType === 'confirmacion') {
    const checks = [
      { text: 'Confirma tu correo', found: htmlContent.includes('Confirma tu correo') },
      { text: '72 horas', found: htmlContent.includes('72 horas') },
      { text: 'Confirmar correo', found: htmlContent.includes('Confirmar correo') },
      { text: 'Emoji 🍀', found: htmlContent.includes('🍀') },
      { text: 'Gradiente verde', found: htmlContent.includes('#1A3C34') || htmlContent.includes('1A3C34') },
    ];
    checks.forEach((check) => log(`  ${check.found ? '✅' : '❌'} ${check.text}`));
    return checks.every((check) => check.found);
  }

  if (expectedType === 'bienvenida') {
    const checks = [
      { text: 'Bienvenido', found: htmlContent.includes('Bienvenido') },
      { text: 'Tu solicitud fue', found: htmlContent.includes('Tu solicitud fue') },
      { text: 'Tu cuenta está activa', found: htmlContent.includes('Tu cuenta está activa') },
      { text: 'Ir al inicio de sesión', found: htmlContent.includes('Ir al inicio de sesión') },
      { text: 'Emoji 🍀', found: htmlContent.includes('🍀') },
      { text: 'Checkmark emoji', found: htmlContent.includes('✅') },
    ];
    checks.forEach((check) => log(`  ${check.found ? '✅' : '❌'} ${check.text}`));
    return checks.every((check) => check.found);
  }

  return true;
};

const extractTokenFromEmail = async (htmlContent) => {
  const tokenMatch = htmlContent.match(/token=([^"\s&]+)/);
  if (tokenMatch) {
    log(`✅ Token extraído: ${tokenMatch[1].substring(0, 20)}...`);
    return tokenMatch[1];
  }
  return null;
};

const openProfessionalRegistration = async (page) => {
  await page.goto(`${BASE_URL}/Registro/SeleccionPerfil`, { waitUntil: 'networkidle' });
  await screenshot(page, '01-seleccion-perfil');

  const btnProfesional = await page.locator('button:has-text("Soy Profesional"), a:has-text("Profesional"), [class*="profesional" i]').first();
  if (btnProfesional && await btnProfesional.isVisible()) {
    await btnProfesional.click();
    await page.waitForLoadState('networkidle');
  } else {
    log('⚠️  Botón profesional no encontrado, navegando directo');
    await page.goto(`${BASE_URL}/Registro/RegistroProfesional`, { waitUntil: 'networkidle' });
  }
  await screenshot(page, '02-formulario-registro');
};

const fillProfessionalForm = async (page) => {
  log('📝 Llenando formulario de profesional');

  const fieldNombre = await page.locator('input[placeholder*="nombre" i], input[name*="nombre" i]').first();
  if (fieldNombre) await fieldNombre.fill(TEST_DATA.nombreCompleto);

  const fieldEmail = await page.locator('input[type="email"]').first();
  if (fieldEmail) await fieldEmail.fill(TEST_DATA.correo);

  const fieldDocumento = await page.locator('input[placeholder*="documento" i], input[name*="documento" i]').first();
  if (fieldDocumento) await fieldDocumento.fill(TEST_DATA.numeroDocumento);

  const fieldRegistro = await page.locator('input[placeholder*="registro" i], input[name*="registro" i]').first();
  if (fieldRegistro) await fieldRegistro.fill(TEST_DATA.numeroRegistro);

  const selectEspecialidad = await page.locator('select').first();
  if (selectEspecialidad) {
    const options = await page.locator('select option').all();
    if (options.length > 1) {
      await selectEspecialidad.selectOption({ index: 1 });
    }
  }

  const passwordFields = await page.locator('input[type="password"]').all();
  if (passwordFields.length > 0) await passwordFields[0].fill(TEST_DATA.contraseña);
  if (passwordFields.length > 1) await passwordFields[1].fill(TEST_DATA.contraseña);

  const fileInputs = await page.locator('input[type="file"]').all();
  if (fileInputs.length >= 1) await fileInputs[0].setInputFiles(TEST_DATA.cedulaPdf);
  if (fileInputs.length >= 2) await fileInputs[1].setInputFiles(TEST_DATA.tarjetaPdf);

  await screenshot(page, '03-formulario-completo');
};

const submitProfessionalForm = async (page) => {
  log('📤 Enviando formulario');
  const btnRegistrar = await page.locator('button:has-text("Registrar"), button:has-text("Crear"), button:has-text("Enviar"), button:has-text("Enviar solicitud")').first();
  if (!btnRegistrar) throw new Error('Botón de registro no encontrado');
  await btnRegistrar.click();
  await page.waitForLoadState('networkidle');
  await sleep(2000);
  await screenshot(page, '04-confirmacion-envio');
};

const openYopmailInbox = async (browser) => {
  const page = await browser.newPage();
  await page.goto(YOPMAIL_URL, { waitUntil: 'networkidle' });
  await sleep(2000);

  const emailPrefix = TEST_EMAIL.split('@')[0];
  const inputLogin = await page.locator('input[name="login"] , input[placeholder*="correo" i], input[type="text"]').first();
  if (!inputLogin) throw new Error('Campo de Yopmail no encontrado');

  await inputLogin.fill(emailPrefix);
  await inputLogin.press('Enter');
  await sleep(3000);
  await screenshot(page, '05-yopmail-bandeja');
  return page;
};

const openLatestEmail = async (page, searchText) => {
  const mailItems = await page.locator('a, div, td').filter({ hasText: new RegExp(searchText, 'i') }).all();
  if (mailItems.length > 0) {
    await mailItems[0].click();
    await sleep(2000);
    return true;
  }

  const allItems = await page.locator('a, div, td').all();
  if (allItems.length > 0) {
    await allItems[0].click();
    await sleep(2000);
    return true;
  }

  return false;
};

const attemptLogin = async (page, email, password, screenshotName) => {
  await page.goto(`${BASE_URL}/Login`, { waitUntil: 'networkidle' });
  await screenshot(page, screenshotName);

  const emailField = await page.locator('input[type="email"]').first();
  const passwordField = await page.locator('input[type="password"]').first();
  if (!emailField || !passwordField) throw new Error('Campos de login no encontrados');

  await emailField.fill(email);
  await passwordField.fill(password);

  const btnLogin = await page.locator('button:has-text("Ingresar"), button:has-text("Entrar"), button:has-text("Login")').first();
  if (!btnLogin) throw new Error('Botón de login no encontrado');

  await btnLogin.click();
  await page.waitForLoadState('networkidle');
  await sleep(2000);
  await screenshot(page, `${screenshotName}-resultado`);

  const currentUrl = page.url();
  const errorText = await page.locator('[role="alert"], .error, .alert-danger, .text-danger').first().textContent().catch(() => '');
  return { currentUrl, errorText };
};

(async () => {
  const browser = await chromium.launch({ headless: false });
  let yopmailPage = null;

  try {
    const page = await browser.newPage();
    await openProfessionalRegistration(page);
    await fillProfessionalForm(page);
    await submitProfessionalForm(page);

    const loginAttempt1 = await attemptLogin(page, TEST_DATA.correo, TEST_DATA.contraseña, '09-login-bloqueado-pre-aprobacion');
    if (loginAttempt1.errorText.toLowerCase().includes('pendiente') || loginAttempt1.errorText.toLowerCase().includes('bloqueado') || loginAttempt1.errorText.toLowerCase().includes('no autorizado')) {
      log('✅ Login bloqueado correctamente (cuenta pendiente)');
    } else {
      log('⚠️  No se detectó el mensaje de cuenta pendiente; revisar comportamiento de la app');
    }

    yopmailPage = await openYopmailInbox(browser);
    const confirmationFound = await openLatestEmail(yopmailPage, 'confirm');
    if (!confirmationFound) throw new Error('Correo de confirmación no encontrado en Yopmail');
    await screenshot(yopmailPage, '06-correo-confirmacion');
    await validateEmailFormat(yopmailPage, 'confirmacion');

    const emailContent = await yopmailPage.content();
    const token = await extractTokenFromEmail(emailContent);
    if (!token) throw new Error('No se extrajo token del correo de confirmación');

    await page.goto(`${BASE_URL}/Registro/ActivarCuentaProfesional`, { waitUntil: 'networkidle' });
    const tokenInput = await page.locator('input[name*="token" i], input[placeholder*="token" i]').first();
    if (!tokenInput) throw new Error('Campo token no encontrado');
    await tokenInput.fill(token);
    await screenshot(page, '07-ingresar-token');

    const btnActivar = await page.locator('button:has-text("Activar"), button:has-text("Confirmar"), button:has-text("Enviar")').first();
    if (!btnActivar) throw new Error('Botón activar no encontrado');
    await btnActivar.click();
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await screenshot(page, '08-cuenta-activada');

    log('\n⏸️  PASO 9: Aprobar la cuenta desde el admin');
    log(`Abre el panel admin y aprueba la cuenta: ${TEST_DATA.correo}`);
    log('Presiona ENTER cuando la cuenta haya sido aprobada.');

    await new Promise((resolve) => process.stdin.once('data', resolve));

    await yopmailPage.reload({ waitUntil: 'networkidle' });
    await sleep(3000);
    await screenshot(yopmailPage, '11-yopmail-bandeja-actualizada');

    const welcomeFound = await openLatestEmail(yopmailPage, 'bienvenido|activada|aprobada');
    if (!welcomeFound) throw new Error('Correo de bienvenida no encontrado en Yopmail');
    await screenshot(yopmailPage, '12-correo-bienvenida');
    await validateEmailFormat(yopmailPage, 'bienvenida');

    const loginAttempt2 = await attemptLogin(page, TEST_DATA.correo, TEST_DATA.contraseña, '14-login-final');
    if (loginAttempt2.currentUrl.includes('HomeProfesional') || loginAttempt2.currentUrl.includes('Home') || !loginAttempt2.currentUrl.includes('/Login')) {
      log('✅ Login exitoso del profesional aprobado');
    } else {
      log('⚠️  El profesional no redirigió a panel de Home profesional');
    }

    log('\n' + '='.repeat(60));
    log('✅ PRUEBA COMPLETA TERMINADA');
    log(`📁 Screenshots guardados en: ${screenshotsDir}`);
    log(`📧 Email usado: ${TEST_DATA.correo}`);

  } catch (error) {
    log(`❌ ERROR: ${error.message}`);
  } finally {
    if (yopmailPage) await yopmailPage.close();
    await browser.close();
    process.exit(0);
  }
})();

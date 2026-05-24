/**
 * Prueba visual E2E: login → directorio → perfil orador → calendario → agendar cita.
 * node Test/PruebaVisualAgendarCitaCalendario.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = process.env.CORREO || 'alejortiz@yopmail.com';
const PASS = process.env.PASS || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `agendar-cita-${Date.now()}`);

const fallos = [];
const ok = (m) => console.log('  OK', m);
const fail = (m) => { fallos.push(m); console.error('  FALLO', m); };
const info = (m) => console.log('  →', m);

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  info(`Screenshots: ${SS}`);

  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    slowMo: 300
  });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  try {
  // 1. Login
  info('Paso 1: Login');
  await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="Correo"]', CORREO);
  await page.fill('input[name="Password"]', PASS);
  await page.locator('form[action*="Login"] button[type="submit"]').click();
  await page.waitForURL(u => !u.pathname.includes('/Login'), { timeout: 30000 });
  info(`URL tras login: ${page.url()}`);
  await page.screenshot({ path: path.join(SS, '01-login.png'), fullPage: true });
  ok('Login exitoso');

  // 2. Buscar otro profesional (directorio o colegas en inicio)
  info('Paso 2: Buscar profesional');
  let perfilAbierto = false;

  for (const ruta of [`${BASE}/Directorio/Medicos`, `${BASE}/Directorio/Psicologos`]) {
    await page.goto(ruta, { waitUntil: 'networkidle' });
    const verPerfil = page.locator('.prof-card a:has-text("Ver perfil")').first();
    if (await verPerfil.count()) {
      await page.screenshot({ path: path.join(SS, '02-directorio.png'), fullPage: true });
      await verPerfil.click();
      perfilAbierto = true;
      ok(`Perfil desde ${ruta}`);
      break;
    }
  }

  if (!perfilAbierto) {
    info('Directorio vacío; probando "Ver perfil" en eventos de colegas (inicio)');
    await page.goto(`${BASE}/HomeProfesional`, { waitUntil: 'networkidle' });
    const verColega = page.locator('a:has-text("Ver perfil"), .btn:has-text("Ver perfil")').first();
    if (await verColega.count()) {
      await page.screenshot({ path: path.join(SS, '02-home-colegas.png'), fullPage: true });
      await verColega.click();
      perfilAbierto = true;
      ok('Perfil desde eventos de colegas');
    }
  }

  if (!perfilAbierto) {
    const fallbackId = process.env.PROFESIONAL_ID || '66';
    info(`Fallback: PerfilOrador directo id=${fallbackId}`);
    await page.goto(`${BASE}/PerfilOrador/Index/${fallbackId}`, { waitUntil: 'networkidle' });
    perfilAbierto = true;
  }

  await page.waitForURL(/\/PerfilOrador\//, { timeout: 15000 });
  const idMatch = page.url().match(/\/PerfilOrador\/\w+\/(\d+)/);
  if (!idMatch) fail(`No se obtuvo ID de profesional desde ${page.url()}`);
  else ok(`Perfil profesional id ${idMatch[1]}`);
  await page.screenshot({ path: path.join(SS, '03-perfil.png'), fullPage: true });

  // 3. Tab Calendario
  info('Paso 3: Tab Calendario');
  await page.locator('a.prof-tab-link:has-text("Calendario"), .prof-tab-link[href*="Calendario"]').click();
  await page.waitForURL(/\/Calendario\//, { timeout: 15000 });
  await page.waitForSelector('#tcal-content', { timeout: 10000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SS, '04-calendario-semana.png'), fullPage: true });
  ok('Tab Calendario cargado');

  // 4. Clic en horario libre futuro
  info('Paso 4: Seleccionar horario libre');
  let checkoutOk = false;
  for (let sem = 0; sem < 6 && !checkoutOk; sem++) {
    if (sem > 0) {
      await page.locator('#tcal-next').click();
      await page.waitForTimeout(600);
    }
    const slots = page.locator('.tcw-free-slot');
    const n = await slots.count();
    for (let i = 0; i < n && !checkoutOk; i++) {
      await slots.nth(i).scrollIntoViewIfNeeded();
      await slots.nth(i).click();
      try {
        await page.waitForURL(/\/PagoCita\/Confirmar/, { timeout: 8000 });
        const fh = new URL(page.url()).searchParams.get('fechaHora');
        if (fh && new Date(fh) > new Date()) {
          checkoutOk = true;
          ok(`Slot futuro seleccionado: ${fh}`);
        } else {
          await page.goBack({ waitUntil: 'networkidle' });
          await page.waitForSelector('.tcw-free-slot', { timeout: 8000 });
        }
      } catch {
        await page.goBack({ waitUntil: 'networkidle' }).catch(() => {});
      }
    }
  }

  if (!checkoutOk) {
    await page.locator('.tcal-vpill[data-view="diario"]').click();
    await page.waitForTimeout(400);
    for (let d = 0; d < 10 && !checkoutOk; d++) {
      const freeDay = page.locator('.tcal-drow-book').first();
      if (await freeDay.count()) {
        await freeDay.click();
        try {
          await page.waitForURL(/\/PagoCita\/Confirmar/, { timeout: 8000 });
          const fh = new URL(page.url()).searchParams.get('fechaHora');
          if (fh && new Date(fh) > new Date()) checkoutOk = true;
          else await page.goBack({ waitUntil: 'networkidle' });
        } catch {}
      }
      if (!checkoutOk) {
        await page.locator('.tcal-daily-next').click();
        await page.waitForTimeout(400);
      }
    }
  }

  if (!checkoutOk) {
    fail('No se encontró horario libre futuro');
    throw new Error('Sin horario futuro');
  }

  // 5. Checkout confirmación
  info('Paso 5: Checkout confirmación');
  const checkoutUrl = page.url();
  if (checkoutUrl.includes('Confirmar')) ok(`Checkout: ${checkoutUrl}`);
  else fail(`URL inesperada: ${checkoutUrl}`);

  const bodyText = await page.locator('body').innerText();
  if (/solo los usuarios pueden agendar/i.test(bodyText)) {
    fail('Aparece restricción incorrecta "solo los usuarios pueden agendar"');
  } else ok('Sin restricción incorrecta de solo usuarios');

  if (/IVA/i.test(bodyText)) ok('Checkout muestra IVA');
  else fail('Checkout no muestra IVA');

  if (/Gratis|Entrada libre/i.test(bodyText) && !/80\.000|80000|\$\s*95/i.test(bodyText)) {
    info('Nota: cita aparece gratis — verificar tarifa del profesional');
  } else ok('Checkout muestra monto de cita');

  await page.screenshot({ path: path.join(SS, '05-checkout-confirmar.png'), fullPage: true });

  // 6. Confirmar cita
  info('Paso 6: Confirmar cita');
  const btnConfirmar = page.locator('form[action*="PagoCita/Confirmar"] button[type="submit"], button:has-text("Confirmar y pagar"), button:has-text("Confirmar cita")').first();
  await btnConfirmar.click();
  await page.waitForTimeout(2000);

  const afterConfirm = page.url();
  if (afterConfirm.includes('/PagoCita/Pago') || afterConfirm.includes('/PagoCita/Resultado')) {
    ok(`Tras confirmar: ${afterConfirm}`);
  } else if (afterConfirm.includes('/Confirmar')) {
    const err = await page.locator('.alert-error, [role="alert"]').first().innerText().catch(() => '');
    fail(`Sigue en confirmar. Error: ${err || 'desconocido'}`);
  } else {
    info(`URL tras confirmar: ${afterConfirm}`);
  }
  await page.screenshot({ path: path.join(SS, '06-despues-confirmar.png'), fullPage: true });

  // 7. Pago (si aplica)
  if (page.url().includes('/PagoCita/Pago')) {
    info('Paso 7: Completar pago simulado');
    await page.waitForSelector('#form-pago, form[action*="ProcesarPago"]', { timeout: 8000 });
    const tarjeta = page.locator('input[name="Numero"], #numero-tarjeta').first();
    if (await tarjeta.count()) {
      await tarjeta.fill('4242 4242 4242 4242');
      const venc = page.locator('input[name="Vencimiento"]').first();
      if (await venc.count()) await venc.fill('12/30');
      const cvv = page.locator('input[name="Cvv"]').first();
      if (await cvv.count()) await cvv.fill('123');
      const nombre = page.locator('input[name="Nombre"]').first();
      if (await nombre.count()) await nombre.fill('Alejandro Test');
    }
    await page.screenshot({ path: path.join(SS, '07-pago.png'), fullPage: true });
    await page.locator('#checkout-pay-btn, form[action*="ProcesarPago"] button[type="submit"]').first().click();
    await page.waitForURL(/\/PagoCita\/Resultado/, { timeout: 20000 });
    await page.screenshot({ path: path.join(SS, '08-resultado.png'), fullPage: true });
    const resultado = await page.locator('body').innerText();
    if (/confirmada|exitosa|exitoso/i.test(resultado)) ok('Pago completado con éxito');
    else fail('Resultado de pago no indica éxito');
  } else if (page.url().includes('/Resultado')) {
    ok('Cita confirmada (entrada libre o gratis)');
    await page.screenshot({ path: path.join(SS, '08-resultado.png'), fullPage: true });
  }

  info('Pausa 5s para revisión visual en navegador...');
  await page.waitForTimeout(5000);

  console.log('\n--- Resumen ---');
  if (fallos.length) {
    console.error(`${fallos.length} fallo(s):`);
    fallos.forEach(f => console.error(' -', f));
    process.exitCode = 1;
  } else {
    console.log('Prueba visual de agendar cita: OK');
  }
  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: path.join(SS, 'error.png'), fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

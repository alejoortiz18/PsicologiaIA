/**
 * Prueba visual: Juan → perfil Dr. Rene → calendario → agendar cita privada → ver "Mi cita" en calendario.
 * node Test/PruebaVisualJuanCalendarioRene.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = 'juan@yopmail.com';
const PASS = 'Yopmail2026.';
const PROFESIONAL_ID = process.env.PROFESIONAL_ID || '66';
const SS = path.join(__dirname, 'screenshots', `juan-rene-cal-${Date.now()}`);

// Secuencias típicas de UTF-8 leído como Latin-1 (no la letra ú/í bien formada en UTF-8)
const MOJIBAKE = /Ã³|Ã±|Ã©|Ã­|Ãº|Ã¡|Â¿|Â¡|â€|ï¿½/;
const fallos = [];
const ok = (m) => console.log('  OK', m);
const fail = (m) => { fallos.push(m); console.error('  FALLO', m); };
const info = (m) => console.log('  →', m);

function assertNoMojibake(text, contexto) {
  if (MOJIBAKE.test(text)) {
    fail(`Mojibake en ${contexto}: ${text.match(MOJIBAKE)[0]}`);
    return false;
  }
  return true;
}

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  info(`Screenshots: ${SS}`);

  const browser = await chromium.launch({
    headless: process.env.HEADLESS !== '0',
    channel: 'chrome',
    slowMo: process.env.HEADLESS === '0' ? 250 : 0
  });
  const page = await (await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1400, height: 900 }
  })).newPage();

  try {
    info('Login Juan');
    await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.locator('form[action*="Login"] button[type="submit"]').click();
    await page.waitForURL(u => !u.pathname.includes('/Login'), { timeout: 30000 });
    await page.screenshot({ path: path.join(SS, '01-login.png'), fullPage: true });
    ok(`Login: ${page.url()}`);

    info('Perfil Dr. Rene');
    await page.goto(`${BASE}/PerfilOrador/Index/${PROFESIONAL_ID}`, { waitUntil: 'networkidle' });
    const perfilText = await page.locator('body').innerText();
    if (!/Rene/i.test(perfilText)) fail('No se reconoce el perfil de Rene');
    else ok('Perfil de Rene cargado');
    await page.screenshot({ path: path.join(SS, '02-perfil-rene.png'), fullPage: true });

    info('Tab Calendario');
    await page.locator('a.prof-tab-link:has-text("Calendario")').click();
    await page.waitForURL(/\/Calendario\//, { timeout: 15000 });
    await page.waitForSelector('#tcal-content', { timeout: 10000 });
    await page.waitForTimeout(600);

    const legend = await page.locator('.tcal-legend').innerText();
    assertNoMojibake(legend, 'leyenda');
    for (const parte of ['Disponible', 'Ocupado', 'Mi cita', 'Charla', 'evento público']) {
      if (!legend.toLowerCase().includes(parte.toLowerCase().split(' ')[0])) {
        if (parte === 'Charla' && !/charla|evento/i.test(legend)) fail(`Leyenda sin referencia a eventos públicos`);
      }
    }
    if (/Charla|evento público/i.test(legend)) ok('Leyenda incluye eventos públicos');
    ok('Leyenda calendario');

    await page.screenshot({ path: path.join(SS, '03-calendario-inicial.png'), fullPage: true });

    const calInicial = await page.locator('#tcal-content').innerText();
    assertNoMojibake(calInicial, 'calendario inicial');
    if (calInicial.includes('Ocupado')) ok('Hay bloques Ocupado (privacidad terceros)');
    if (await page.locator('.tcw-public-block, .public-event-cell').count()) {
      ok('Hay eventos públicos visibles');
    }

    info('Agendar cita privada (o validar cita existente)');
    let citaCreada = false;
    let fechaAgendada = null;

    async function intentarConfirmarCheckout() {
      const btnConfirmar = page.locator(
        'form[action*="PagoCita/Confirmar"] button[type="submit"], button:has-text("Confirmar y pagar"), button:has-text("Confirmar cita")'
      ).first();
      if (!(await btnConfirmar.count())) return false;
      await btnConfirmar.click();
      await page.waitForTimeout(2500);
      const err = await page.locator('.alert-error, [role="alert"], .text-danger').first().innerText().catch(() => '');
      if (/ocupado|no disponible|ya existe|horario/i.test(err)) {
        info(`Confirmación rechazada: ${err.trim()}`);
        return false;
      }
      return page.url().includes('/PagoCita/Pago') || page.url().includes('/PagoCita/Resultado');
    }

    for (let sem = 0; sem < 10 && !citaCreada; sem++) {
      if (sem > 0) {
        await page.locator('#tcal-next').click();
        await page.waitForTimeout(500);
      }
      const slots = page.locator('.tcw-free-slot');
      const n = await slots.count();
      for (let i = 0; i < n && !citaCreada; i++) {
        await slots.nth(i).click();
        try {
          await page.waitForURL(/\/PagoCita\/Confirmar/, { timeout: 8000 });
          const fh = new URL(page.url()).searchParams.get('fechaHora');
          if (!fh || new Date(fh) <= new Date()) {
            await page.goBack({ waitUntil: 'networkidle' });
            continue;
          }
          fechaAgendada = fh;
          await page.screenshot({ path: path.join(SS, '04-checkout-confirmar.png'), fullPage: true });
          if (await intentarConfirmarCheckout()) {
            citaCreada = true;
            ok(`Cita agendada en horario: ${fh}`);
            break;
          }
          await page.goBack({ waitUntil: 'networkidle' });
          await page.waitForSelector('.tcw-free-slot', { timeout: 8000 });
        } catch {
          await page.goBack({ waitUntil: 'networkidle' }).catch(() => {});
        }
      }
    }

    if (!citaCreada) {
      await page.goto(`${BASE}/PerfilOrador/Calendario/${PROFESIONAL_ID}`, { waitUntil: 'networkidle' });
      await page.locator('.tcal-vpill[data-view="diario"]').click();
      await page.waitForTimeout(400);
      for (let d = 0; d < 20 && !citaCreada; d++) {
        const libres = page.locator('.tcal-drow-book');
        const n = await libres.count();
        for (let i = 0; i < n && !citaCreada; i++) {
          await libres.nth(i).click();
          try {
            await page.waitForURL(/\/PagoCita\/Confirmar/, { timeout: 8000 });
            fechaAgendada = new URL(page.url()).searchParams.get('fechaHora');
            if (await intentarConfirmarCheckout()) {
              citaCreada = true;
              ok(`Cita agendada (vista día): ${fechaAgendada}`);
            } else {
              await page.goBack({ waitUntil: 'networkidle' });
            }
          } catch { /* siguiente */ }
        }
        if (!citaCreada) await page.locator('.tcal-daily-next').click();
        await page.waitForTimeout(350);
      }
    }

    if (!citaCreada) {
      await page.goto(`${BASE}/PerfilOrador/Calendario/${PROFESIONAL_ID}`, { waitUntil: 'networkidle' });
      if (await page.locator('.tcw-my-block, .my-reserved-cell').count()) {
        ok('Ya existe una cita de Juan visible en el calendario (no hubo slot nuevo disponible)');
        citaCreada = true;
      }
    }

    if (!citaCreada) {
      fail('No se pudo agendar ni encontrar cita propia en calendario');
      throw new Error('Agendar fallido');
    }

    if (page.url().includes('/PagoCita/Pago')) {
      info('Completar pago simulado');
      const tarjeta = page.locator('input[name="Numero"], #numero-tarjeta').first();
      if (await tarjeta.count()) {
        await tarjeta.fill('4242 4242 4242 4242');
        const venc = page.locator('input[name="Vencimiento"]').first();
        if (await venc.count()) await venc.fill('12/30');
        const cvv = page.locator('input[name="Cvv"]').first();
        if (await cvv.count()) await cvv.fill('123');
        const nombre = page.locator('input[name="Nombre"]').first();
        if (await nombre.count()) await nombre.fill('Juan Prueba');
      }
      await page.locator('#checkout-pay-btn, form[action*="ProcesarPago"] button[type="submit"]').first().click();
      await page.waitForURL(/\/PagoCita\/Resultado/, { timeout: 25000 });
      await page.screenshot({ path: path.join(SS, '05-resultado-pago.png'), fullPage: true });
      const resultado = await page.locator('body').innerText();
      if (!/confirmada|exitosa|exitoso/i.test(resultado)) fail('Pago no indica éxito');
      else ok('Cita confirmada tras pago');
    } else if (page.url().includes('/Resultado')) {
      ok('Cita confirmada (sin paso de pago)');
      await page.screenshot({ path: path.join(SS, '05-resultado.png'), fullPage: true });
    }

    info('Volver al calendario y verificar Mi cita');
    await page.goto(`${BASE}/PerfilOrador/Calendario/${PROFESIONAL_ID}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#tcal-content', { timeout: 10000 });

    const fhDate = new Date(fechaAgendada);
    const semanas = Math.ceil((fhDate - new Date()) / (7 * 86400000)) + 1;
    for (let s = 0; s < Math.min(semanas + 2, 10); s++) {
      const hayMiCita = await page.locator('.tcw-my-block, .my-reserved-cell').count();
      if (hayMiCita > 0) break;
      await page.locator('#tcal-next').click();
      await page.waitForTimeout(500);
    }

    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SS, '06-calendario-mi-cita.png'), fullPage: true });

    const miBloque = page.locator('.tcw-my-block').first();
    if (!(await miBloque.count())) {
      await page.locator('.tcal-vpill[data-view="diario"]').click();
      await page.waitForTimeout(400);
      for (let d = 0; d < 14; d++) {
        if (await page.locator('.my-reserved-cell').count()) break;
        const titulo = await page.locator('#tcal-nav-title').innerText();
        if (titulo.includes(String(fhDate.getDate()))) break;
        await page.locator('.tcal-daily-next').click();
        await page.waitForTimeout(350);
      }
      await page.screenshot({ path: path.join(SS, '06b-calendario-dia-mi-cita.png'), fullPage: true });
    }

    const calFinal = await page.locator('#tcal-content').innerText();
    const bloqueTexto = await page.locator('.tcw-my-block, .my-reserved-cell').first().innerText().catch(() => calFinal);
    assertNoMojibake(calFinal, 'calendario tras agendar');
    assertNoMojibake(bloqueTexto, 'bloque Mi cita');

    if (!/Mi cita/i.test(calFinal)) {
      fail('No aparece "Mi cita" en el calendario tras agendar');
    } else {
      ok('Bloque "Mi cita" visible para Juan');
    }

    if (!/Mi cita\s*-\s*Asesor/i.test(bloqueTexto) && !/Mi cita\s*-\s*Acompañamiento/i.test(bloqueTexto)) {
      fail('No aparece etiqueta "Mi cita - Asesoría/Acompañamiento"');
    } else {
      ok('Etiqueta de cita con tipo visible');
    }

    if (!/\d{1,2}(:\d{2})?(AM|PM)/i.test(bloqueTexto)) {
      fail('El horario no usa formato 12h AM/PM (reglas UI)');
    } else {
      ok('Horario en formato 12h AM/PM');
    }
    info(`Texto Mi cita: ${bloqueTexto.replace(/\s+/g, ' ').trim()}`);

    if (process.env.HEADLESS === '0') {
      info('Pausa 4s para revisión visual...');
      await page.waitForTimeout(4000);
    }

    console.log('\n--- Resumen ---');
    if (fallos.length) {
      console.error(`${fallos.length} fallo(s):`);
      fallos.forEach(f => console.error(' -', f));
      process.exitCode = 1;
    } else {
      console.log('Prueba visual Juan → Rene calendario: OK');
    }
  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: path.join(SS, 'error.png'), fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

/**
 * Prueba visual: formación académica e idiomas en Mi perfil.
 * node Test/PruebaVisualPerfilFormacionIdiomas.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = process.env.CORREO || 'alejortiz@yopmail.com';
const PASS = process.env.PASS || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `perfil-formacion-${Date.now()}`);

const fallos = [];
const ok = (m) => console.log('  OK', m);
const fail = (m) => { fallos.push(m); console.error('  FALLO', m); };

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  console.log(`Screenshots: ${SS}`);

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const token = () => page.evaluate(() =>
    document.querySelector('[name=__RequestVerificationToken]')?.value ?? '');

  try {
    await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.locator('form[action*="Login"] button[type="submit"]').click();
    await page.waitForURL((u) => !u.pathname.includes('/Login'), { timeout: 30000 });

    await page.goto(`${BASE}/PerfilProfesional`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#prof-estudio-agregar', { state: 'visible', timeout: 30000 });
    await page.waitForSelector('#prof-idioma-agregar', { state: 'visible', timeout: 10000 });

    const antes = await page.evaluate(() => ({
      estudios: document.querySelectorAll('#prof-estudios-list .prof-estudio-entry').length,
      idiomas: document.querySelectorAll('#prof-idiomas-list .prof-idioma-item').length,
      tieneAgregarEstudio: !!document.getElementById('prof-estudio-agregar'),
      tieneAgregarIdioma: !!document.getElementById('prof-idioma-agregar')
    }));
    console.log('  Estado inicial:', antes);

    if (!antes.tieneAgregarEstudio) fail('Falta botón + Agregar en formación académica');
    else ok('Sección formación académica visible');

    if (!antes.tieneAgregarIdioma) fail('Falta control para agregar idiomas');
    else ok('Sección idiomas visible');

    await page.click('#prof-estudio-agregar');
    const nuevaFila = page.locator('#prof-estudios-list .prof-estudio-entry').last();
    await nuevaFila.locator('[data-field="titulo"]').fill('Prueba E2E Formación');
    await nuevaFila.locator('[data-field="universidad"]').fill('Universidad Test');
    await nuevaFila.locator('[data-field="ano"]').fill('2020');
    await nuevaFila.locator('[data-action="guardar-estudio"]').click();
    await page.waitForTimeout(1500);

    const despuesEstudio = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#prof-estudios-list .prof-estudio-entry'))
        .some(e => (e.querySelector('[data-field="titulo"]')?.value || '').includes('Prueba E2E')));
    if (!despuesEstudio) fail('No se guardó la formación académica de prueba');
    else ok('Formación académica agregada y visible');

    const selIdioma = page.locator('#prof-idioma-select option:not([value=""])').first();
    if (!(await selIdioma.count())) {
      ok('Todos los idiomas del catálogo ya están asignados (omitir alta idioma)');
    } else {
      const valor = await selIdioma.getAttribute('value');
      await page.selectOption('#prof-idioma-select', valor);
      await page.selectOption('#prof-idioma-nivel', 'Avanzado');
      await page.click('#prof-idioma-agregar');
      await page.waitForTimeout(1500);
      const idiomas = await page.evaluate(() =>
        document.querySelectorAll('#prof-idiomas-list .prof-idioma-item').length);
      if (idiomas <= antes.idiomas) fail('No aumentó la lista de idiomas');
      else ok(`Idioma agregado (total: ${idiomas})`);
    }

    await page.locator('section, .main-content, body').first().screenshot({
      path: path.join(SS, '01-secciones-formacion-idiomas.png'),
      fullPage: true
    }).catch(() => page.screenshot({ path: path.join(SS, '01-full.png'), fullPage: true }));

    await page.screenshot({ path: path.join(SS, '02-pagina-completa.png'), fullPage: true });
    ok(`Capturas en ${SS}`);
  } catch (e) {
    fail(e.message);
    await page.screenshot({ path: path.join(SS, 'error.png'), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }

  if (fallos.length) {
    console.error('\n=== PRUEBA VISUAL FALLIDA ===');
    fallos.forEach((f) => console.error(' -', f));
    process.exit(1);
  }
  console.log('\n=== PRUEBA VISUAL OK — Formación e idiomas ===');
})();

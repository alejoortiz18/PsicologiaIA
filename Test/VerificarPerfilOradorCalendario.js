/**
 * Prueba visual del tab Calendario del perfil orador (vs orador-calendario.html).
 * node Test/VerificarPerfilOradorCalendario.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = process.env.CORREO_USUARIO || 'test.visual@yopmail.com';
const PASS = process.env.PASS_LOGIN || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `perfil-calendario-${Date.now()}`);

const fallos = [];
const ok = (m) => console.log('  OK', m);
const fail = (m) => { fallos.push(m); console.error('  FALLO', m); };

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage();

  try {
    await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.locator('form[action*="Login"] button[type="submit"]').click();
    await page.waitForURL(u => !u.pathname.includes('/Login'), { timeout: 25000 });

    await page.goto(`${BASE}/Directorio/Psicologos`, { waitUntil: 'networkidle' });
    await page.locator('.prof-card a:has-text("Ver perfil")').first().click();
    await page.waitForURL(/\/PerfilOrador\/Index\//, { timeout: 15000 });

    const idMatch = page.url().match(/\/PerfilOrador\/Index\/(\d+)/);
    if (!idMatch) throw new Error('No se obtuvo id de profesional');
    const id = idMatch[1];

    await page.goto(`${BASE}/PerfilOrador/Calendario/${id}`, { waitUntil: 'networkidle' });
    if (!page.url().includes('/Calendario/')) fail('No está en ruta Calendario');
    else ok('Ruta /PerfilOrador/Calendario/' + id);

    const tabActive = await page.locator('.prof-tab-link.active').innerText();
    if (!tabActive.includes('Calendario')) fail('Pestaña Calendario no activa: ' + tabActive);
    else ok('Pestaña Calendario activa');

    const banner = page.locator('#info-banner');
    if (!(await banner.isVisible())) fail('Falta banner informativo');
    else {
      const t = await banner.innerText();
      if (!/Agenda una cita/i.test(t)) fail('Banner sin texto de agendar');
      else ok('Banner informativo');
    }

    if (!(await page.locator('.perfil-orador-calendar-wrap').isVisible())) fail('Falta panel calendario');
    else ok('Panel .perfil-orador-calendar-wrap');

    for (const sel of ['.tcal-toolbar', '.tcal-legend', '#tcal-content', '#tcal-hoy', '#tcal-nav-title']) {
      if (!(await page.locator(sel).first().isVisible())) fail(`No visible: ${sel}`);
      else ok(sel);
    }

    const pills = await page.locator('.tcal-vpill').count();
    if (pills !== 3) fail(`Deben ser 3 vistas (Mes/Semana/Día), hay ${pills}`);
    else ok('Pills Mes / Semana / Día');

    const legend = await page.locator('.tcal-legend').innerText();
    if (!legend.includes('Disponible')) fail('Leyenda incompleta');
    if (!legend.includes('Ocupado')) fail('Leyenda sin Ocupado');
    if (!legend.includes('Mi cita')) fail('Leyenda sin Mi cita');
    else ok('Leyenda completa');

    await page.waitForSelector('.tcw-header-row, .tcal-empty, .tcal-month-grid', { timeout: 8000 });
    const semanal = await page.locator('.tcw-header-row').count();
    const vacio = await page.locator('.tcal-empty').count();
    if (semanal > 0) {
      ok('Vista semanal (tcw-header-row)');
      if (!(await page.locator('.tcw-body-scroll').count())) fail('Falta .tcw-body-scroll');
      else ok('Grid semanal scrollable');
    } else if (vacio > 0) {
      ok('Estado vacío (sin horario configurado)');
    } else {
      fail('No hay vista semanal ni estado vacío');
    }

    await page.screenshot({ path: path.join(SS, '01-semana.png'), fullPage: true });

    await page.locator('.tcal-vpill[data-view="mensual"]').click();
    await page.waitForTimeout(400);
    if (!(await page.locator('.tcal-month-grid').count())) fail('Vista Mes sin .tcal-month-grid');
    else ok('Vista Mes');
    await page.screenshot({ path: path.join(SS, '02-mes.png'), fullPage: true });

    await page.locator('.tcal-vpill[data-view="diario"]').click();
    await page.waitForTimeout(400);
    const diario = await page.locator('.tcal-daily, .tcal-empty').count();
    if (!diario) fail('Vista Día sin contenido');
    else ok('Vista Día');
    await page.screenshot({ path: path.join(SS, '03-dia.png'), fullPage: true });

    const activePill = await page.locator('.tcal-vpill.active').innerText();
    if (!activePill.includes('Día')) fail('Pill Día no quedó activa');
    else ok('Pill activa correcta');

    console.log('\nScreenshots:', SS);
    if (fallos.length) {
      console.error(`\n${fallos.length} fallo(s):`);
      fallos.forEach(f => console.error(' -', f));
      process.exitCode = 1;
    } else {
      console.log('\nPrueba visual del tab Calendario: OK');
    }
  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: path.join(SS, 'error.png'), fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

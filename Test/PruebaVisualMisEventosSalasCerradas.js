/**
 * Prueba visual: Rene → Mis eventos → salas pasadas deben mostrar Cerrada.
 * node Test/PruebaVisualMisEventosSalasCerradas.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = 'rene@yopmail.com';
const PASS = process.env.PASS || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `mis-eventos-cerradas-${Date.now()}`);

const fallos = [];
const ok = (m) => console.log('  OK', m);
const fail = (m) => { fallos.push(m); console.error('  FALLO', m); };
const info = (m) => console.log('  →', m);

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  info(`Screenshots: ${SS}`);

  const browser = await chromium.launch({ headless: false, channel: 'chrome', slowMo: 250 });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();

  try {
    await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.locator('form[action*="Login"] button[type="submit"]').click();
    await page.waitForURL(u => !u.pathname.includes('/Login'), { timeout: 30000 });
    ok('Login Rene');

    await page.goto(`${BASE}/MisEventos`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.me-fila', { timeout: 15000 });
    await page.screenshot({ path: path.join(SS, '01-mis-eventos.png'), fullPage: true });

    const filas = page.locator('.me-fila');
    const n = await filas.count();
    if (n === 0) {
      fail('No hay filas de eventos en la tabla');
      throw new Error('Sin filas');
    }
    ok(`${n} sala(s) en la tabla`);

    let abiertasPasadas = 0;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 0; i < n; i++) {
      const fila = filas.nth(i);
      const nombre = await fila.locator('td').first().innerText();
      const estado = await fila.locator('.badge').first().innerText();
      const fechaTxt = await fila.locator('td').nth(5).innerText();
      info(`  ${nombre.trim().split('\n')[0]} | ${estado} | ${fechaTxt.trim()}`);

      const esPasada = /may\.?\s*2026/i.test(fechaTxt) && (
        fechaTxt.includes('24 ') || fechaTxt.includes('27 ')
      );
      if (esPasada && /Abierta/i.test(estado)) {
        abiertasPasadas++;
        fail(`Sala pasada sigue Abierta: ${nombre.trim().split('\n')[0]}`);
      }
    }

    const btnCerrar = page.locator('.btn-me-cerrar');
    const cerrarCount = await btnCerrar.count();
    if (cerrarCount > 0) {
      const visiblesPasadas = await page.locator('.me-fila:has-text("may. 2026") .btn-me-cerrar').count();
      if (visiblesPasadas > 0) fail('Botón "Cerrar sala" visible en eventos ya pasados');
    }
    ok('Sin botón Cerrar sala en eventos vencidos (o ninguno abierto)');

    if (abiertasPasadas === 0) ok('Eventos de mayo 2026 muestran estado Cerrada');

    const cerradas = await page.locator('.me-fila .badge:has-text("Cerrada")').count();
    if (cerradas < 1) fail('No se encontró ninguna sala con badge Cerrada');
    else ok(`${cerradas} sala(s) con badge Cerrada`);

    await page.waitForTimeout(3000);
    console.log('\n--- Resumen ---');
    if (fallos.length) {
      fallos.forEach(f => console.error(' -', f));
      process.exitCode = 1;
    } else {
      console.log('Prueba visual Mis eventos salas cerradas: OK');
    }
  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: path.join(SS, 'error.png'), fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

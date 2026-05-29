/**
 * Rene ve calendario de otro profesional: hoy no debe ofrecer horas ya pasadas.
 * node Test/PruebaVisualCalendarioHorarioPasado.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = 'rene@yopmail.com';
const PASS = process.env.PASS || 'Yopmail2026.';
const PROF_ALEJO = process.env.PROFESIONAL_ALEJO_ID || '65';
const SS = path.join(__dirname, 'screenshots', `cal-pasado-${Date.now()}`);

const fallos = [];
const ok = (m) => console.log('  OK', m);
const fail = (m) => { fallos.push(m); console.error('  FALLO', m); };

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();

  try {
    await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.locator('form[action*="Login"] button[type="submit"]').click();
    await page.waitForURL(u => !u.pathname.includes('/Login'), { timeout: 30000 });
    ok('Login Rene');

    await page.goto(`${BASE}/PerfilOrador/Calendario/${PROF_ALEJO}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#tcal-content', { timeout: 15000 });

    const now = new Date();
    const hoy = now.getHours();
    const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const libresHoyPasados = await page.locator('.tcw-free-slot').evaluateAll((els, ctx) => {
      return els
        .filter(el => `${el.dataset.y}-${el.dataset.m}-${el.dataset.d}` === ctx.todayKey)
        .map(el => parseInt(el.dataset.h, 10))
        .filter(h => h < ctx.horaActual);
    }, { todayKey, horaActual: hoy });

    if (libresHoyPasados.length > 0) {
      fail(`Semana (hoy): slots libres en horas pasadas: ${libresHoyPasados.join(', ')}`);
    } else {
      ok(`Semana (hoy): sin slots libres antes de las ${hoy}:00`);
    }

    await page.locator('.tcal-vpill[data-view="diario"]').click();
    await page.waitForTimeout(500);
    const agendarPasado = await page.locator('.tcal-drow-book').evaluateAll((els, horaActual) => {
      return els.map(el => parseInt(el.dataset.h, 10)).filter(h => h < horaActual);
    }, hoy);

    if (agendarPasado.length > 0) {
      fail(`Día: botones agendar en horas pasadas: ${agendarPasado.join(', ')}`);
    } else {
      ok('Vista día: sin agendar en horas pasadas');
    }

    await page.screenshot({ path: path.join(SS, 'calendario-hoy.png'), fullPage: true });

    const urlPasada = `${BASE}/PagoCita/Confirmar?profesionalId=${PROF_ALEJO}&fechaHora=${encodeURIComponent(
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).toISOString()
    )}&duracionMinutos=60`;
    await page.goto(urlPasada, { waitUntil: 'networkidle' });
    if (!page.url().includes('/PerfilOrador/Calendario')) {
      fail('Backend no redirigió al calendario con fecha pasada');
    } else {
      ok('Backend rechaza confirmación con horario pasado');
    }

    if (fallos.length) process.exitCode = 1;
    else console.log('\nPrueba calendario horario pasado: OK');
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

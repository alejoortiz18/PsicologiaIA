/**
 * Prueba visual: botón Ingresar visible para Juan en eventos inscritos.
 * node Test/PruebaVisualIngresarEventoJuan.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = process.env.CORREO_USUARIO || 'juan@yopmail.com';
const PASS = process.env.PASS_LOGIN || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `ingresar-evento-juan-${Date.now()}`);

const fallos = [];
const ok = (m) => console.log('  OK', m);
const fail = (m) => { fallos.push(m); console.error('  FALLO', m); };

async function login(page) {
  await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.fill('input[name="Correo"]', CORREO);
  await page.fill('input[name="Password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(/HomeUsuario/i, { timeout: 30000 });
}

async function capturar(page, nombre) {
  await page.screenshot({ path: path.join(SS, `${nombre}.png`), fullPage: true });
}

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  console.log(`Screenshots: ${SS}`);

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  try {
    await login(page);
    ok(`Login como ${CORREO}`);

    await page.goto(`${BASE}/Eventos`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.locator('#evt-inscritos-heading').waitFor({ state: 'visible', timeout: 15000 });
    await capturar(page, '01-eventos-pagina-completa');

    const seccionInscritos = page.locator('section[aria-labelledby="evt-inscritos-heading"]');
    const cardsInscritos = seccionInscritos.locator('.room-card');
    const nInscritos = await cardsInscritos.count();
    if (nInscritos === 0) {
      fail('Sección "Eventos inscritos" vacía — Juan debe tener al menos un evento vigente inscrito');
    } else {
      ok(`${nInscritos} tarjeta(s) en Eventos inscritos`);
    }

    const btnIngresarInscritos = seccionInscritos.locator('.btn-ingresar-evento');
    const nIngresar = await btnIngresarInscritos.count();
    if (nIngresar === 0) {
      fail('No hay botón ▶ Ingresar en la sección Eventos inscritos');
      const estados = await cardsInscritos.evaluateAll((cards) =>
        cards.map((c) => ({
          titulo: c.querySelector('.room-card__banner-text')?.textContent?.trim(),
          inscrito: c.dataset.inscrito,
          estado: c.dataset.estado,
          badge: c.querySelector('.room-card__badge .badge')?.textContent?.trim()
        }))
      );
      console.log('  Tarjetas inscritos:', JSON.stringify(estados, null, 2));
    } else {
      ok(`${nIngresar} botón(es) ▶ Ingresar en Eventos inscritos`);
      await btnIngresarInscritos.first().scrollIntoViewIfNeeded();
      await capturar(page, '02-boton-ingresar-inscritos');
    }

    const seccionTodos = page.locator('section[aria-labelledby="evt-todos-heading"]');
    const cardSala3 = seccionTodos.locator('.room-card', { hasText: 'sala 3 free' });
    if (await cardSala3.count()) {
      const inscrito = await cardSala3.getAttribute('data-inscrito');
      const tieneIngresar = await cardSala3.locator('.btn-ingresar-evento').count();
      if (inscrito !== '1') {
        fail(`"sala 3 free" en Todos los eventos debería tener data-inscrito=1 (tiene ${inscrito})`);
      } else {
        ok('"sala 3 free" marcada como inscrita en Todos los eventos');
      }
      if (tieneIngresar === 0) {
        fail('Botón Ingresar no visible en "sala 3 free" (Todos los eventos) pese a estar inscrito');
      } else {
        ok('Botón Ingresar visible en "sala 3 free" dentro de Todos los eventos');
        await cardSala3.locator('.btn-ingresar-evento').scrollIntoViewIfNeeded();
        await capturar(page, '03-ingresar-en-todos-eventos');
      }
      const footerBtn = await cardSala3.locator('.btn-reg-sala').textContent();
      if (!footerBtn?.includes('Inscrito')) {
        fail(`Footer de sala 3 free debería decir "Inscrito" (dice "${footerBtn?.trim()}")`);
      } else {
        ok('Footer muestra "Inscrito" en sala inscrita');
      }
    } else {
      fail('No se encontró tarjeta "sala 3 free" en Todos los eventos');
    }

    const cardNoInscrita = seccionTodos.locator('.room-card', { hasText: 'sala 2 alejo' });
    if (await cardNoInscrita.count()) {
      const ingresarNo = await cardNoInscrita.locator('.btn-ingresar-evento').count();
      if (ingresarNo > 0) {
        fail('Botón Ingresar no debería aparecer en evento donde Juan NO está inscrito');
      } else {
        ok('Sin botón Ingresar en evento no inscrito (sala 2 alejo) — correcto');
      }
    }

    if (nIngresar > 0) {
      const btnSala3 = seccionTodos.locator('.room-card', { hasText: 'sala 3 free' }).locator('.btn-ingresar-evento');
      await btnSala3.click();
      const modalTemprano = page.locator('#ingreso-temprano-backdrop');
      const modalCountdown = page.locator('#ingreso-countdown-backdrop');
      await page.waitForTimeout(300);
      const tempranoVisible = await modalTemprano.evaluate((el) => el?.classList.contains('open'));
      const countdownVisible = await modalCountdown.evaluate((el) => el?.classList.contains('open'));
      if (tempranoVisible) {
        ok('Clic Ingresar abre modal "aún no comienza" (evento >3 min)');
        await capturar(page, '04-modal-muy-temprano');
      } else if (countdownVisible) {
        ok('Clic Ingresar abre cuenta regresiva (evento ≤3 min)');
        await capturar(page, '04-modal-countdown');
      } else {
        fail('Clic en Ingresar no abrió modal esperado');
      }
    }

    console.log('\n--- Resumen ---');
    if (fallos.length) {
      console.error(`FALLÓ: ${fallos.length} problema(s)`);
      fallos.forEach((f) => console.error(' -', f));
      process.exitCode = 1;
    } else {
      console.log('TODAS LAS VERIFICACIONES OK');
    }
  } catch (err) {
    console.error('Error:', err.message);
    await page.screenshot({ path: path.join(SS, 'error.png'), fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

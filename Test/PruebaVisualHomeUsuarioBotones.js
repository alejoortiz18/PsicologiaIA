/**
 * Prueba visual: botones de tarjetas de evento en inicio usuario (sin texto recortado).
 * node Test/PruebaVisualHomeUsuarioBotones.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = process.env.CORREO_USUARIO || 'test.visual@yopmail.com';
const PASS = process.env.PASS_LOGIN || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `home-usuario-botones-${Date.now()}`);

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

async function botonesSinRecorte(page) {
  const problemas = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.room-card__footer-primary .btn').forEach((btn, i) => {
      const texto = (btn.textContent || '').trim();
      if (!texto) return;
      const recorte = btn.scrollWidth > btn.clientWidth + 2;
      const estilos = getComputedStyle(btn);
      const visible = estilos.overflow !== 'hidden' && estilos.textOverflow !== 'ellipsis';
      if (recorte) {
        out.push({ i, texto, scrollWidth: btn.scrollWidth, clientWidth: btn.clientWidth });
      }
    });
    return out;
  });
  return problemas;
}

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  console.log(`Screenshots: ${SS}`);

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  try {
    await login(page);
    ok('Login usuario');

    await page.goto(`${BASE}/HomeUsuario`, { waitUntil: 'networkidle', timeout: 60000 });

    const seccionHoy = page.locator('text=Comienzan hoy').first();
    await seccionHoy.waitFor({ state: 'visible', timeout: 15000 });

    const grid = page.locator('.rooms-grid').first();
    await grid.waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('.room-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const cards = page.locator('.room-card');
    const n = await cards.count();
    if (n === 0) {
      fail('No hay tarjetas .room-card en inicio (revisar datos de prueba)');
    } else {
      ok(`${n} tarjeta(s) de evento en inicio`);
    }

    const problemas = await botonesSinRecorte(page);
    if (problemas.length) {
      problemas.forEach((p) => fail(`Texto recortado en botón "${p.texto}" (${p.scrollWidth}px > ${p.clientWidth}px)`));
    } else {
      ok('Botones principales sin recorte de texto');
    }

    const textos = await page.locator('.room-card__footer-primary .btn-reg-sala').allTextContents();
    const tieneInscribirseCorto = textos.some((t) => /Inscribirse/i.test(t) && !/Inscribirse y pagar/i.test(t.trim()));
    const tieneRegistrarse = textos.some((t) => /Registrarse/i.test(t));
    if (textos.length && !tieneInscribirseCorto && !tieneRegistrarse && !textos.some((t) => /Inscrito|Ya pasó|Sin cupos/i.test(t))) {
      fail(`Etiquetas inesperadas en botones: ${textos.join(' | ')}`);
    } else if (textos.length) {
      ok(`Etiquetas legibles: ${textos.map((t) => t.trim()).filter(Boolean).join(', ')}`);
    }

    await grid.screenshot({ path: path.join(SS, '01-grid-comienzan-hoy.png') });

    const primeraCard = page.locator('.room-card').first();
    if (await primeraCard.count()) {
      await primeraCard.locator('.room-card__footer').screenshot({
        path: path.join(SS, '02-footer-botones.png')
      });
      ok('Captura footer de tarjeta');
    }

    await page.screenshot({ path: path.join(SS, '03-inicio-completo.png'), fullPage: true });
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
  console.log('\n=== PRUEBA VISUAL OK — Botones inicio usuario ===');
})();

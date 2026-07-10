/**
 * Prueba visual: sección "Eventos de hoy" en Mis eventos (profesional).
 * node Test/PruebaVisualMisEventosHoy.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = process.env.CORREO || 'alejortiz@yopmail.com';
const PASS = process.env.PASS || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `mis-eventos-hoy-${Date.now()}`);

const MIN_PADDING_PX = 24;
const MIN_SECTION_GAP_PX = 28;

const fallos = [];
const ok = (m) => console.log('  OK', m);
const fail = (m) => { fallos.push(m); console.error('  FALLO', m); };

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  console.log(`Screenshots: ${SS}`);

  const browser = await chromium.launch({
    headless: process.env.HEADLESS !== '0',
    channel: 'chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, ignoreHTTPSErrors: true });

  try {
    await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.locator('form[action*="Login"] button[type="submit"]').click();
    await page.waitForURL((u) => !u.pathname.includes('/Login'), { timeout: 30000 });

    await page.goto(`${BASE}/MisEventos`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.me-hero__inner', { state: 'visible', timeout: 30000 });

    const hero = page.locator('.me-hero').first();
    const inner = page.locator('.me-hero__inner').first();
    const table = page.locator('#mis-eventos-table-wrap');

    if (!(await hero.count())) {
      fail('No se encontró .me-hero');
    } else {
      const metrics = await inner.evaluate((el) => {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const title = el.querySelector('.me-hero__title');
        const actions = el.querySelector('.me-hero__actions');
        const titleRect = title?.getBoundingClientRect();
        const actionsRect = actions?.getBoundingClientRect();
        return {
          paddingTop: parseFloat(cs.paddingTop),
          paddingLeft: parseFloat(cs.paddingLeft),
          paddingRight: parseFloat(cs.paddingRight),
          paddingBottom: parseFloat(cs.paddingBottom),
          titleInsetLeft: titleRect ? titleRect.left - rect.left : null,
          actionsInsetRight: actionsRect ? rect.right - actionsRect.right : null,
          hasIcon: !!el.querySelector('.me-hero__icon')
        };
      });

      console.log('  Métricas padding:', metrics);

      if (metrics.hasIcon) fail('El icono 🎪 no debería mostrarse');
      else ok('Icono eliminado');

      if (metrics.paddingLeft < MIN_PADDING_PX || metrics.paddingRight < MIN_PADDING_PX) {
        fail(`Padding horizontal insuficiente (${metrics.paddingLeft}px / ${metrics.paddingRight}px, mín ${MIN_PADDING_PX}px)`);
      } else ok(`Padding horizontal OK (${metrics.paddingLeft}px)`);

      if (metrics.paddingTop < MIN_PADDING_PX || metrics.paddingBottom < MIN_PADDING_PX) {
        fail(`Padding vertical insuficiente (${metrics.paddingTop}px / ${metrics.paddingBottom}px)`);
      } else ok(`Padding vertical OK (${metrics.paddingTop}px)`);

      if (metrics.titleInsetLeft != null && metrics.titleInsetLeft < MIN_PADDING_PX - 2) {
        fail(`Título muy pegado al borde (${metrics.titleInsetLeft}px)`);
      }

      if (metrics.actionsInsetRight != null && metrics.actionsInsetRight < MIN_PADDING_PX - 2) {
        fail(`Botones muy pegados al borde derecho (${metrics.actionsInsetRight}px)`);
      } else if (metrics.actionsInsetRight != null) {
        ok(`Botones con margen derecho ${metrics.actionsInsetRight.toFixed(0)}px`);
      }
    }

    if (await hero.count() && (await table.count())) {
      const gap = await page.evaluate(() => {
        const h = document.querySelector('.me-hero');
        const t = document.querySelector('#mis-eventos-table-wrap');
        if (!h || !t) return null;
        return t.getBoundingClientRect().top - h.getBoundingClientRect().bottom;
      });
      console.log('  Separación hero ↔ tabla:', gap, 'px');
      if (gap != null && gap < MIN_SECTION_GAP_PX) {
        fail(`Poca separación con la tabla (${gap.toFixed(0)}px, mín ${MIN_SECTION_GAP_PX}px)`);
      } else if (gap != null) {
        ok(`Separación con tabla OK (${gap.toFixed(0)}px)`);
      }
    }

    await page.locator('.me-hoy-section').screenshot({ path: path.join(SS, '01-eventos-de-hoy.png') });
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
  console.log('\n=== PRUEBA VISUAL OK ===');
})();

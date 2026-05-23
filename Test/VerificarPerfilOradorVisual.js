/**
 * Prueba visual del perfil público vs prototipo (cabecera + tab Cuenta).
 * node Test/VerificarPerfilOradorVisual.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO_USUARIO = process.env.CORREO_USUARIO || 'test.visual@yopmail.com';
const PASS = process.env.PASS_LOGIN || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `perfil-orador-visual-${Date.now()}`);

const fallos = [];

function ok(msg) { console.log('  OK', msg); }
function fail(msg) { fallos.push(msg); console.error('  FALLO', msg); }

async function assertVisible(page, selector, label) {
  const el = page.locator(selector).first();
  const visible = await el.isVisible().catch(() => false);
  if (!visible) fail(`${label}: no visible (${selector})`);
  else ok(label);
  return visible;
}

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  let browser;
  browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage();

  try {
    await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="Correo"]', CORREO_USUARIO);
    await page.fill('input[name="Password"]', PASS);
    await page.locator('form[action*="Login"] button[type="submit"]').click();
    await page.waitForURL(u => !u.pathname.includes('/Login'), { timeout: 25000 });

    const afterLogin = page.url();
    if (!afterLogin.includes('HomeUsuario')) {
      fail(`Login usuario esperaba HomeUsuario, obtuvo: ${afterLogin}`);
    } else {
      ok(`Login como usuario: ${CORREO_USUARIO}`);
    }

    await page.goto(`${BASE}/Directorio/Psicologos`, { waitUntil: 'networkidle' });
    const verPerfil = page.locator('.prof-card a:has-text("Ver perfil")').first();
    if (!(await verPerfil.count())) {
      fail('No hay tarjetas con "Ver perfil" en Directorio/Psicologos');
    } else {
      await verPerfil.click();
      await page.waitForURL(/\/PerfilOrador\//, { timeout: 15000 });
      ok('Navegación Ver perfil → PerfilOrador');
    }

    await page.screenshot({ path: path.join(SS, '01-perfil-completo.png'), fullPage: true });

    // --- Cabecera (prototipo) ---
    await assertVisible(page, '.profile-header', 'Sección profile-header');
    await assertVisible(page, '.profile-header .badge-success', 'Badge verificación');
    const badgeText = await page.locator('.profile-header .badge-success').innerText().catch(() => '');
    if (!/verificad/i.test(badgeText)) fail(`Badge debería decir Verificada, dice: "${badgeText}"`);
    else ok('Badge texto Verificada');

    await assertVisible(page, '#follow-btn, .profile-header .btn-seguir', 'Botón Seguir');
    const followText = await page.locator('#follow-btn, .profile-header .btn-seguir').first().innerText();
    if (!/seguir|siguiendo/i.test(followText)) fail(`Texto botón seguir inesperado: "${followText}"`);

    await assertVisible(page, '.profile-header .btn-secondary:has-text("Mensaje")', 'Botón Mensaje');

    const subtitulo = await page.locator('.profile-header__subtitle').innerText();
    if (/Especialista en Psicólogo$/i.test(subtitulo.trim())) {
      fail(`Subtítulo redundante: "${subtitulo.trim()}"`);
    } else ok(`Subtítulo: ${subtitulo.trim()}`);

    const statsText = await page.locator('.profile-header__stats').innerText();
    if (!statsText.includes('Seguidores')) fail('Falta stat Seguidores');
    else ok('Stat Seguidores');
    if (!statsText.includes('Salas creadas')) fail('Falta stat Salas creadas');
    else ok('Stat Salas creadas');
    if (!statsText.includes('Años de experiencia')) fail('Falta stat Años de experiencia');
    else ok('Stat Años de experiencia');

    const statVals = await page.locator('.profile-header__stat-val').count();
    if (statVals !== 3) fail(`Deben ser 3 valores de stat, hay ${statVals}`);
    else ok('3 valores numéricos en cabecera');

    await page.screenshot({ path: path.join(SS, '02-cabecera.png') });

    // --- Tab Cuenta ---
    const cuentaHeadings = ['Sobre mí', 'Cómo trabajo', 'Idiomas', 'Experiencia', 'Formación académica'];
    for (const h of cuentaHeadings) {
      const h3 = page.locator('#tab-cuenta h3', { hasText: h });
      if (!(await h3.count())) fail(`Tab Cuenta: falta sección "${h}"`);
      else ok(`Sección "${h}"`);
    }

    const grid = page.locator('.perfil-orador-cuenta-grid');
    if (!(await grid.count())) {
      fail('Falta contenedor .perfil-orador-cuenta-grid (grid 2 columnas prototipo)');
    } else {
      const cols = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
      ok(`Grid columnas: ${cols}`);
      if (!cols.includes(' ')) fail(`Grid debería ser 2 columnas, obtuvo: ${cols}`);
    }

    const expItems = await page.locator('#tab-cuenta .perfil-orador-exp-list li').count();
    if (expItems < 1) fail('Lista Experiencia vacía');
    else ok(`Lista Experiencia: ${expItems} ítem(s)`);

    const comoTrabajo = await page.locator('#tab-cuenta h3:has-text("Cómo trabajo") + p').innerText();
    if (/se centra en psicólogo/i.test(comoTrabajo)) {
      fail(`Texto "Cómo trabajo" incoherente: ${comoTrabajo.slice(0, 80)}...`);
    } else ok('Texto Cómo trabajo coherente');

    await page.screenshot({ path: path.join(SS, '03-tab-cuenta.png') });

    // CSS botones tamaño normal (no btn-sm en cabecera)
    const followBtn = page.locator('#follow-btn, .profile-header .btn-seguir').first();
    if (await followBtn.count()) {
      const hasSm = await followBtn.evaluate(el => el.classList.contains('btn-sm'));
      if (hasSm) fail('Botón Seguir no debe tener btn-sm (prototipo tamaño normal)');
      else ok('Botón Seguir sin btn-sm');
    }

    // Probar toggle seguir (solo si no está siguiendo)
    if (/\+?\s*Seguir/i.test(followText) && await followBtn.count()) {
      const antes = await page.locator('#seguidores-count').innerText();
      await followBtn.click();
      await page.waitForTimeout(800);
      const despues = await page.locator('#seguidores-count').innerText();
      const btnDespues = await followBtn.innerText();
      if (antes === despues && antes !== '0' && antes !== '0 ') {
        fail(`Contador seguidores no cambió tras seguir (${antes} → ${despues})`);
      } else {
        ok(`Seguir: contador ${antes.trim()} → ${despues.trim()}, botón: ${btnDespues.trim()}`);
      }
      await page.screenshot({ path: path.join(SS, '04-despues-seguir.png') });
    }

    console.log('\nScreenshots:', SS);

    if (fallos.length) {
      console.error(`\n${fallos.length} fallo(s):`);
      fallos.forEach(f => console.error(' -', f));
      process.exitCode = 1;
    } else {
      console.log('\nTodas las comprobaciones visuales pasaron.');
    }
  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: path.join(SS, 'error.png'), fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
})();

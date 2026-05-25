/**
 * Prueba visual: Registro usuario y profesional — país → ciudad (combobox con buscador en panel).
 * node Test/PruebaVisualRegistroPaisCiudad.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const SS = path.join(__dirname, 'screenshots', `registro-pais-ciudad-${Date.now()}`);

const fallos = [];
const ok = (m) => console.log('  OK', m);
const fail = (m) => { fallos.push(m); console.error('  FALLO', m); };

async function abrirCombobox(page, role) {
  const root = page.locator(`[data-role="${role}-combobox"]`);
  await root.locator('.cat-combobox__trigger').click();
  await root.waitFor({ state: 'attached' });
  await page.waitForSelector(`[data-role="${role}-combobox"].is-open`, { timeout: 5000 });
}

async function buscarEnPanel(page, role, texto) {
  await page.locator(`[data-role="${role}-combobox"] [data-role="search"]`).fill(texto);
  await page.waitForTimeout(250);
}

async function seleccionarOpcion(page, role, textoRegex) {
  await page
    .locator(`[data-role="${role}-combobox"] .cat-combobox__option`)
    .filter({ hasText: textoRegex })
    .first()
    .click();
  await page.waitForSelector(`[data-role="${role}-combobox"].is-open`, { state: 'detached', timeout: 3000 }).catch(() => {});
}

async function labelCombobox(page, role) {
  return (await page.locator(`[data-role="${role}-combobox"] [data-role="label"]`).textContent())?.trim() ?? '';
}

async function esperarCiudadesApi(page, minOpciones = 5) {
  await page.waitForResponse(
    (r) => r.url().includes('/Catalogo/Ciudades') && r.ok(),
    { timeout: 45000 }
  );
  await abrirCombobox(page, 'ciudad');
  await page.waitForFunction(
    (min) => {
      const n = document.querySelectorAll('[data-role="ciudad-combobox"] .cat-combobox__option').length;
      return n >= min;
    },
    minOpciones,
    { timeout: 15000 }
  );
  await page.keyboard.press('Escape');
}

async function contarOpcionesCiudad(page) {
  await abrirCombobox(page, 'ciudad');
  const n = await page.locator('[data-role="ciudad-combobox"] .cat-combobox__option').count();
  await page.keyboard.press('Escape');
  return n;
}

async function opcionesVisiblesPais(page) {
  return page.locator('[data-role="pais-combobox"] .cat-combobox__option').count();
}

async function probarPagina(page, ruta, etiqueta) {
  console.log(`\n--- ${etiqueta} (${ruta}) ---`);
  await page.goto(`${BASE}${ruta}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('[data-role="pais-combobox"]', { state: 'visible', timeout: 30000 });
  await page.waitForSelector('[data-role="ciudad-combobox"]', { state: 'visible' });

  const paisInicial = await labelCombobox(page, 'pais');
  if (!paisInicial.includes('Colombia')) fail(`${etiqueta}: país por defecto no es Colombia (${paisInicial})`);
  else ok(`${etiqueta}: país por defecto Colombia`);

  try {
    await esperarCiudadesApi(page, 100);
  } catch {
    fail(`${etiqueta}: no cargaron ciudades de Colombia`);
    return;
  }
  const nCo = await contarOpcionesCiudad(page);
  if (nCo < 100) fail(`${etiqueta}: pocas ciudades Colombia (${nCo})`);
  else ok(`${etiqueta}: ${nCo} ciudades Colombia`);

  await abrirCombobox(page, 'pais');
  const searchEnPanel = await page.locator('[data-role="pais-combobox"] [data-role="search"]').isVisible();
  if (!searchEnPanel) fail(`${etiqueta}: buscador no visible dentro del panel de país`);
  else ok(`${etiqueta}: buscador dentro del panel al abrir país`);

  await buscarEnPanel(page, 'pais', 'venez');
  const nFiltrado = await opcionesVisiblesPais(page);
  const tieneVenezuela = await page.locator('[data-role="pais-combobox"] .cat-combobox__option', { hasText: /venezuela/i }).count();
  if (nFiltrado > 5 || !tieneVenezuela) fail(`${etiqueta}: filtro búsqueda país "venez" (${nFiltrado} opciones)`);
  else ok(`${etiqueta}: búsqueda país "venez" filtra dentro del panel`);

  await seleccionarOpcion(page, 'pais', /Venezuela/i);
  const paisVe = await labelCombobox(page, 'pais');
  if (!/venezuela/i.test(paisVe)) fail(`${etiqueta}: no quedó seleccionado Venezuela`);
  else ok(`${etiqueta}: Venezuela seleccionada`);

  await page.locator('.js-catalogo-ubicacion').first()
    .screenshot({ path: path.join(SS, `${etiqueta}-01-colombia.png`) });

  try {
    await esperarCiudadesApi(page, 50);
  } catch {
    fail(`${etiqueta}: no cargaron ciudades de Venezuela`);
    return;
  }

  await abrirCombobox(page, 'ciudad');
  const searchCiudad = await page.locator('[data-role="ciudad-combobox"] [data-role="search"]').isVisible();
  if (!searchCiudad) fail(`${etiqueta}: buscador no visible en panel de ciudad`);
  else ok(`${etiqueta}: buscador dentro del panel de ciudad`);

  const tieneCaracas = await page.locator('[data-role="ciudad-combobox"] .cat-combobox__option', { hasText: 'Caracas' }).count();
  await page.keyboard.press('Escape');
  if (!tieneCaracas) fail(`${etiqueta}: Venezuela sin Caracas en el listado`);
  else ok(`${etiqueta}: Venezuela incluye Caracas`);

  const nVe = await contarOpcionesCiudad(page);
  ok(`${etiqueta}: ${nVe} ciudades Venezuela`);

  await page.locator('.js-catalogo-ubicacion').first()
    .screenshot({ path: path.join(SS, `${etiqueta}-02-venezuela.png`) });

  await abrirCombobox(page, 'pais');
  await buscarEnPanel(page, 'pais', 'estados unidos');
  await seleccionarOpcion(page, 'pais', /Estados Unidos/i);

  try {
    await esperarCiudadesApi(page, 1000);
  } catch {
    fail(`${etiqueta}: no cargaron ciudades de Estados Unidos`);
    return;
  }

  await abrirCombobox(page, 'ciudad');
  await buscarEnPanel(page, 'ciudad', 'Miami');
  const tieneMiami = await page.locator('[data-role="ciudad-combobox"] .cat-combobox__option', { hasText: /miami/i }).count();
  await page.keyboard.press('Escape');
  if (!tieneMiami) fail(`${etiqueta}: filtro búsqueda no muestra Miami en panel`);
  else ok(`${etiqueta}: búsqueda "Miami" dentro del panel de ciudad`);

  await page.locator('.js-catalogo-ubicacion').first()
    .screenshot({ path: path.join(SS, `${etiqueta}-03-estados-unidos-miami.png`) });

  await page.screenshot({ path: path.join(SS, `${etiqueta}-04-pagina.png`), fullPage: true });
}

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  console.log(`Screenshots: ${SS}`);

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  try {
    await probarPagina(page, '/Registro/RegistroUsuario', 'usuario');
    await probarPagina(page, '/Registro/RegistroProfesional', 'profesional');
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
  console.log('\n=== PRUEBA VISUAL OK — Registro país / ciudad (combobox) ===');
})();

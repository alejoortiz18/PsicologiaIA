/**
 * Compara visualmente el menú y home del profesional:
 *   - Prototipo: home-profesional.html  (archivo local)
 *   - Proyecto:  http://localhost:5271  (login con profesional aprobado)
 *
 * Guarda screenshots en Test/screenshots/
 */

const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

const BASE_URL    = 'https://localhost:7072';
const PROTO_URL   = 'file:///' + path.resolve(__dirname, '../Prototipo/home-profesional.html').replace(/\\/g, '/');
const CORREO_PRO  = 'trebol.pro.test1778958332624@yopmail.com';
const PASSWORD    = 'Password123!';
const SS_DIR      = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

function log(msg) { console.log(`\n[INFO] ${msg}`); }
function ok(msg)  { console.log(`       ✅ ${msg}`); }
function err(msg) { console.log(`       ❌ ${msg}`); }

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 200,
    args: ['--ignore-certificate-errors', '--start-maximized']
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1400, height: 900 }
  });

  const page = await context.newPage();

  // ══════════════════════════════════════════════
  // 1. PROTOTIPO — capturar sidebar + contenido
  // ══════════════════════════════════════════════
  log('Abriendo prototipo...');
  await page.goto(PROTO_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const ssProto = path.join(SS_DIR, '1_prototipo_home_profesional.png');
  await page.screenshot({ path: ssProto, fullPage: false });
  ok(`Screenshot prototipo: ${ssProto}`);

  // Zoom en sidebar del prototipo
  const ssProtoSidebar = path.join(SS_DIR, '2_prototipo_sidebar.png');
  await page.screenshot({
    path: ssProtoSidebar,
    clip: { x: 0, y: 0, width: 260, height: 900 }
  });
  ok(`Screenshot sidebar prototipo: ${ssProtoSidebar}`);

  // ══════════════════════════════════════════════
  // 2. PROYECTO — login como profesional
  // ══════════════════════════════════════════════
  log('Abriendo proyecto y haciendo login...');
  await page.goto(`${BASE_URL}/Login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  await page.fill('[name="Correo"], #Correo, input[type="email"]', CORREO_PRO);
  await page.fill('[name="Password"], #Password, input[type="password"]', PASSWORD);
  await page.click('button[type="submit"], input[type="submit"]');
  await page.waitForURL('**/HomeProfesional**', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1000);

  const currentUrl = page.url();
  if (currentUrl.includes('HomeProfesional')) {
    ok(`Login exitoso → ${currentUrl}`);
  } else {
    err(`URL inesperada: ${currentUrl}`);
  }

  // Screenshot completo del home profesional del proyecto
  const ssProyecto = path.join(SS_DIR, '3_proyecto_home_profesional.png');
  await page.screenshot({ path: ssProyecto, fullPage: false });
  ok(`Screenshot proyecto: ${ssProyecto}`);

  // Zoom en sidebar del proyecto
  const ssProyectoSidebar = path.join(SS_DIR, '4_proyecto_sidebar.png');
  await page.screenshot({
    path: ssProyectoSidebar,
    clip: { x: 0, y: 0, width: 260, height: 900 }
  });
  ok(`Screenshot sidebar proyecto: ${ssProyectoSidebar}`);

  // ══════════════════════════════════════════════
  // 3. VALIDACIÓN — leer estructura del menú
  // ══════════════════════════════════════════════
  log('Validando estructura del menú lateral en el proyecto...');

  const navItems = await page.$$eval('.nav-item', els =>
    els.map(el => el.textContent?.trim().replace(/\s+/g, ' ') || '')
  );
  const navSections = await page.$$eval('.nav-section__label', els =>
    els.map(el => el.textContent?.trim() || '')
  );
  const hasSubmenu = await page.$('#submenu-colegas') !== null;

  console.log('\n  Secciones encontradas:', navSections);
  console.log('  Items de navegación:', navItems.filter(t => t.length > 0));
  console.log('  Submenú Profesionales presente:', hasSubmenu);

  // Verificar items esperados
  const esperados = ['Inicio', 'Mis eventos', 'Profesionales', 'Mi perfil', 'Citas', 'Mensajes'];
  const seccionesEsperadas = ['Principal', 'Mi espacio'];
  let todoBien = true;

  for (const item of esperados) {
    const found = navItems.some(t => t.includes(item));
    if (found) ok(`Menú contiene: "${item}"`);
    else { err(`FALTA en el menú: "${item}"`); todoBien = false; }
  }
  for (const sec of seccionesEsperadas) {
    const found = navSections.includes(sec);
    if (found) ok(`Sección encontrada: "${sec}"`);
    else { err(`FALTA sección: "${sec}"`); todoBien = false; }
  }
  if (hasSubmenu) ok('Submenú "Profesionales" (submenu-colegas) presente');
  else { err('Submenú "Profesionales" NO encontrado'); todoBien = false; }

  console.log('\n' + (todoBien
    ? '  ✅ Menú lateral COINCIDE con el prototipo'
    : '  ❌ Hay diferencias — revisar screenshots'));

  console.log(`\n[SCREENSHOTS]\n  ${ssProto}\n  ${ssProtoSidebar}\n  ${ssProyecto}\n  ${ssProyectoSidebar}`);

  await browser.close();
})();

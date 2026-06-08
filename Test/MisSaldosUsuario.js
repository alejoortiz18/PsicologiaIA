/**
 * Prueba visual: tab Mis Saldos y datos bancarios en Perfil Usuario
 * node Test/MisSaldosUsuario.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'https://localhost:7072';
const CORREO = process.env.TREBOL_USER || 'test.visual@yopmail.com';
const PASSWORD = process.env.TREBOL_PASS || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `mis-saldos-${Date.now()}`);

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });

  try {
    await page.goto(`${BASE_URL}/Login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);

    if (page.url().includes('/Login')) {
      throw new Error('Login falló — revisa credenciales de test.visual@yopmail.com');
    }

    await page.goto(`${BASE_URL}/PerfilUsuario?tab=saldos`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SS, '01-mis-saldos.png'), fullPage: true });

    const kpi = page.locator('.mis-saldos-kpi');
    if (!(await kpi.count())) throw new Error('No se encontró el panel KPI de Mis Saldos');

    await page.click('#tab-btn-novedades');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SS, '02-novedades.png'), fullPage: true });

    const novedadesPanel = page.locator('#tab-novedades');
    if (!(await novedadesPanel.count())) throw new Error('No se encontró tab Novedades');
    const resolverBtn = page.locator('.btn-resolver-novedad-tab');
    const emptyNovedades = page.locator('.mis-saldos-empty-state');
    if ((await resolverBtn.count()) === 0 && (await emptyNovedades.count()) === 0) {
      throw new Error('Tab Novedades sin estado vacío ni botón Resolver');
    }

    const pendienteRes = await page.request.get(`${BASE_URL}/NovedadUsuario/PendienteModal`);
    if (!pendienteRes.ok()) throw new Error(`PendienteModal respondió ${pendienteRes.status()}`);
    const pendienteJson = await pendienteRes.json();
    if (typeof pendienteJson.hayNovedad !== 'boolean') {
      throw new Error('PendienteModal no devolvió hayNovedad');
    }

    await page.click('#tab-btn-cuenta');
    await page.waitForTimeout(800);
    const bankForm = page.locator('#bank-form');
    if (!(await bankForm.count())) throw new Error('No se encontró formulario de datos bancarios');
    await page.screenshot({ path: path.join(SS, '03-datos-bancarios.png'), fullPage: true });

    console.log('OK — Mis Saldos perfil usuario verificado');
    console.log('Capturas:', SS);
  } catch (err) {
    await page.screenshot({ path: path.join(SS, 'error.png'), fullPage: true });
    console.error('FALLO:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

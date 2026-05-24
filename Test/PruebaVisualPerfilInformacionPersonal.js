/**
 * Prueba visual: Mi perfil → Información personal (ocupación y tarifa).
 * node Test/PruebaVisualPerfilInformacionPersonal.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = process.env.CORREO || 'alejortiz@yopmail.com';
const PASS = process.env.PASS || 'Yopmail2026.';
const SS = path.join(__dirname, 'screenshots', `perfil-info-personal-${Date.now()}`);

const fallos = [];
const ok = (m) => console.log('  OK', m);
const fail = (m) => { fallos.push(m); console.error('  FALLO', m); };

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  console.log(`Screenshots: ${SS}`);

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  try {
    await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.locator('form[action*="Login"] button[type="submit"]').click();
    await page.waitForURL((u) => !u.pathname.includes('/Login'), { timeout: 30000 });

    await page.goto(`${BASE}/PerfilProfesional`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#pro-info-form', { state: 'visible', timeout: 30000 });

    const datos = await page.evaluate(() => {
      const val = (name) => document.querySelector(`#pro-info-form [name="${name}"]`)?.value?.trim() ?? '';
      const selText = (name) => {
        const el = document.querySelector(`#pro-info-form [name="${name}"]`);
        if (!el || el.tagName !== 'SELECT') return '';
        return el.options[el.selectedIndex]?.text?.trim() ?? '';
      };
      return {
        pais: selText('PaisId'),
        ciudad: selText('CiudadId'),
        ocupacion: val('Titulo'),
        celular: val('Celular'),
        anosExperiencia: val('AnosExperiencia'),
        tarifa: val('TarifaCita'),
        sobreMi: document.querySelector('#pro-info-form [name="Descripcion"]')?.value?.trim() ?? '',
        nombreCompleto: document.querySelector('#pro-info-form input[disabled][value]')?.value
          ?? Array.from(document.querySelectorAll('#pro-info-form input[disabled]'))
            .find((i) => (i.closest('.form-group')?.querySelector('label')?.textContent ?? '').includes('Nombre'))
            ?.value ?? ''
      };
    });

    console.log('  Datos en formulario:', datos);

    if (!datos.pais) fail('País vacío');
    else ok(`País: ${datos.pais}`);

    if (!datos.ciudad) fail('Ciudad vacía');
    else ok(`Ciudad: ${datos.ciudad}`);

    if (!datos.ocupacion) fail('Ocupación vacía');
    else ok(`Ocupación: ${datos.ocupacion}`);

    if (!datos.celular) fail('Celular vacío');
    else ok(`Celular: ${datos.celular}`);

    if (!datos.anosExperiencia) fail('Años de experiencia vacío');
    else ok(`Años experiencia: ${datos.anosExperiencia}`);

    if (!datos.tarifa) fail('Tarifa por hora vacía');
    else ok(`Tarifa: ${datos.tarifa}`);

    const tarifaNum = parseFloat(datos.tarifa);
    if (Number.isNaN(tarifaNum) || tarifaNum <= 0) fail(`Tarifa inválida: "${datos.tarifa}"`);
    else ok(`Tarifa numérica válida: ${tarifaNum}`);

    await page.locator('#pro-info-form').screenshot({ path: path.join(SS, '01-informacion-personal.png') });
    await page.screenshot({ path: path.join(SS, '02-pagina-completa.png'), fullPage: true });
    ok(`Capturas guardadas en ${SS}`);
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
  console.log('\n=== PRUEBA VISUAL OK — Información personal ===');
})();

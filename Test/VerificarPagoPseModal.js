/**
 * Modal detalle → checkout → pago PSE simulado.
 * node Test/VerificarPagoPseModal.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5271';
const CORREO = process.env.CORREO_USU || 'test.visual@yopmail.com';
const PASS = process.env.PASS_USU || 'Yopmail2026.';
const SALA_ID = process.env.SALA_ID || '43';
const SS = path.join(__dirname, 'screenshots', `pse-modal-${Date.now()}`);

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage();
  try {
    await page.goto(`${BASE}/Login`, { waitUntil: 'networkidle' });
    await page.fill('input[name="Correo"]', CORREO);
    await page.fill('input[name="Password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL(/HomeUsuario/i);

    await page.goto(`${BASE}/Eventos`, { waitUntil: 'networkidle' });
    let card = page.locator(`[data-sala-id="${SALA_ID}"]`).first();
    if (!(await card.count())) {
      card = page.locator('.btn-reg-sala:not(.is-inscrito)').first().locator('xpath=ancestor::*[@data-sala-id][1]');
      if (!(await card.count())) {
        await page.goto(`${BASE}/Inscripcion/Confirmar/${SALA_ID}`, { waitUntil: 'networkidle' });
        if (page.url().includes('Confirmar')) {
          await page.locator('form button[type="submit"].btn-primary').click();
          await page.waitForURL(/Pago|Resultado/);
          if (page.url().includes('/Pago')) {
            await page.locator('input[value="PSE"]').check();
            await page.fill('#pse-doc', '4242424242');
            await page.locator('#form-pago button[type="submit"]').click();
            await page.waitForURL(/Resultado/);
            console.log('OK PSE (ruta directa)');
            return;
          }
        }
        throw new Error(`Sala ${SALA_ID} no disponible`);
      }
    }

    await card.locator('.btn-ver-sala').first().click();
    await page.waitForSelector('#detail-modal-backdrop.open');
    await page.screenshot({ path: path.join(SS, '01-modal-detalle.png'), fullPage: true });

    await page.locator('#detail-modal-reg-btn').click();
    await page.waitForURL(/Inscripcion\/Confirmar/, { timeout: 15_000 });
    await page.screenshot({ path: path.join(SS, '02-confirmacion.png'), fullPage: true });

    const yaInscrito = await page.locator('text=Ya estás inscrito').count();
    if (yaInscrito) {
      console.log('Usuario ya inscrito en sala', SALA_ID, '— probando URL directa a nuevo evento');
      await page.goto(`${BASE}/Eventos`, { waitUntil: 'networkidle' });
      const libre = page.locator('.btn-reg-sala:not(.is-inscrito):not([disabled])').first();
      if (!(await libre.count())) throw new Error('No hay sala libre para probar');
      await libre.click();
      await page.waitForURL(/Inscripcion\/Confirmar/);
    }

    await page.locator('form button[type="submit"].btn-primary').click();
    await page.waitForURL(/Inscripcion\/Pago/, { timeout: 20_000 });
    await page.waitForSelector('input[name="metodo-pago-ui"][value="PSE"]');
    await page.screenshot({ path: path.join(SS, '03-paso-pago.png'), fullPage: true });

    await page.locator('input[name="metodo-pago-ui"][value="PSE"]').check();
    await page.waitForSelector('#checkout-panel-pse:not([hidden])');
    await page.selectOption('#pse-banco', 'bancolombia');
    await page.selectOption('#pse-tipo-doc', 'CC');
    await page.fill('#pse-doc', '4242424242');
    await page.screenshot({ path: path.join(SS, '04-pse-lleno.png'), fullPage: true });

    await page.locator('#form-pago button[type="submit"]').click();
    await page.waitForURL(/Resultado/, { timeout: 20_000 });
    await page.screenshot({ path: path.join(SS, '05-resultado-pse.png'), fullPage: true });

    const body = await page.locator('body').innerText();
    if (!/exitosa|confirmada/i.test(body)) throw new Error('Sin mensaje de éxito');
    console.log('OK PSE desde modal → checkout → resultado');
    console.log('Capturas:', SS);
  } catch (e) {
    await page.screenshot({ path: path.join(SS, '99-error.png'), fullPage: true }).catch(() => {});
    console.error('FALLO:', e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

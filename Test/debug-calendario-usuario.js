const { chromium } = require('playwright');
const BASE = 'http://localhost:5271';
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();
  await page.goto(`${BASE}/Login`);
  await page.fill('input[name="Correo"]', 'juan@yopmail.com');
  await page.fill('input[name="Password"]', 'Yopmail2026.');
  await page.click('button[type="submit"]');
  await page.waitForURL(/HomeUsuario|PerfilUsuario/i, { timeout: 30000 });
  await page.goto(`${BASE}/PerfilOrador/Calendario?id=65`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const citas = await page.evaluate(() => window.perfilOradorCal.citas);
  console.log('slots JSON:', citas.map(c => ({
    tipo: c.tipoSlot, etiqueta: c.etiqueta, esDet: c.esDetalleVisible, citaId: c.citaId, salaId: c.salaId
  })));

  // navigate to week with activity
  for (let i = 0; i < 4; i++) {
    await page.click('#tcal-prev');
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(400);

  const occ = await page.locator('.tcw-occ-block .tcw-b-title').allTextContents();
  const mine = await page.locator('.tcw-my-block .tcw-b-title').allTextContents();
  const pub = await page.locator('.tcw-public-block .tcw-b-title').allTextContents();
  console.log('ocupado:', occ);
  console.log('mis citas:', mine);
  console.log('eventos:', pub);

  // click own cita if exists
  const myBlock = page.locator('.tcw-my-block.tcw-block--clickable').first();
  if (await myBlock.count()) {
    await myBlock.click();
    await page.waitForTimeout(600);
    const modal = await page.locator('#cita-detalle-backdrop.open').count();
    console.log('cita modal open:', modal > 0);
  }

  await browser.close();
})();

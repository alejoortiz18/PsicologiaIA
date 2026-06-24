const { chromium } = require('playwright');
const BASE = 'http://localhost:5271';
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();
  await page.goto(`${BASE}/Login`);
  await page.fill('input[name="Correo"]', 'alejortiz@yopmail.com');
  await page.fill('input[name="Password"]', 'Yopmail2026.');
  await page.click('button[type="submit"]');
  await page.waitForURL(/HomeProfesional|PerfilProfesional/i, { timeout: 30000 });
  await page.goto(`${BASE}/PerfilProfesional/Calendario`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const initial = await page.locator('#tcal-nav-title').textContent();
  console.log('initial week:', initial);

  const citas = await page.evaluate(() => window.perfilOradorCal?.citas || []);
  const privadas = citas.filter(c => c.tipoSlot === 'CitaPrivada');
  console.log('total citas JSON:', citas.length, 'privadas:', privadas.length);
  console.log('privadas sample:', privadas.slice(0, 5).map(c => ({
    fecha: c.fechaHora, etiqueta: c.etiqueta, subtitulo: c.subtitulo, tipo: c.tipoCita
  })));

  // Month view → jump to May 25
  await page.click('[data-view="mensual"]');
  await page.waitForTimeout(400);
  const monthTitle = await page.locator('#tcal-nav-title').textContent();
  console.log('month:', monthTitle);

  // click day 25 if visible
  const day25 = page.locator('.tcal-mday-jump').filter({ hasText: /^25$/ });
  const count25 = await day25.count();
  console.log('day25 jump cells:', count25);
  if (count25 > 0) {
    await day25.first().click();
    await page.waitForTimeout(500);
    const weekTitle = await page.locator('#tcal-nav-title').textContent();
    console.log('jumped week:', weekTitle);
    const owner = await page.locator('.tcw-owner-block').count();
    const pub = await page.locator('.tcw-public-block').count();
    console.log('owner blocks:', owner, 'public blocks:', pub);
    console.log('titles:', await page.locator('.tcw-b-title').allTextContents());
    console.log('subs:', await page.locator('.tcw-b-time').allTextContents());
  }

  // Also test vista previa publica
  const profId = await page.evaluate(() => window.perfilOradorCal?.profesionalId);
  await page.goto(`${BASE}/PerfilOrador/Calendario?id=${profId}&vistaPublica=true`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const esProp = await page.evaluate(() => window.perfilOradorCal?.esVistaPropietario);
  const citasPub = await page.evaluate(() => window.perfilOradorCal?.citas || []);
  console.log('\nVista previa esVistaPropietario:', esProp);
  console.log('Vista previa citas:', citasPub.length);
  console.log('Vista previa privadas:', citasPub.filter(c => c.tipoSlot === 'CitaPrivada').slice(0,3));

  await browser.close();
})();

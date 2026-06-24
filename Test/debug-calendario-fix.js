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

  const title = await page.locator('#tcal-nav-title').textContent();
  console.log('auto week:', title);
  const owner = await page.locator('.tcw-owner-block').count();
  const pub = await page.locator('.tcw-public-block').count();
  console.log('owner:', owner, 'public:', pub);
  console.log('titles:', await page.locator('.tcw-b-title').allTextContents());
  console.log('subs:', await page.locator('.tcw-b-time').allTextContents());

  const profId = await page.evaluate(() => window.perfilOradorCal.profesionalId);
  await page.goto(`${BASE}/PerfilOrador/Calendario?id=${profId}&vistaPublica=true`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  console.log('\nvista previa esProp:', await page.evaluate(() => window.perfilOradorCal.esVistaPropietario));
  console.log('vista previa owner:', await page.locator('.tcw-owner-block').count());
  console.log('vista previa titles:', await page.locator('.tcw-b-title').allTextContents().catch(() => []));

  await browser.close();
})();

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
  const cal = await page.evaluate(() => window.perfilOradorCal);
  console.log('esVistaPropietario:', cal?.esVistaPropietario);
  console.log('citas count:', cal?.citas?.length);
  console.log('citas sample:', JSON.stringify(cal?.citas?.slice(0, 5), null, 2));
  await page.waitForSelector('#tcal-content .tcw-body-grid, #tcal-content .tcal-empty', { timeout: 15000 });
  await page.waitForTimeout(500);
  let blocks = await page.locator('.tcw-owner-block, .tcw-public-block').count();
  console.log('blocks current week:', blocks);
  // Ir a semana 25 May 2026
  for (let i = 0; i < 8; i++) {
    await page.click('#tcal-prev');
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(400);
  blocks = await page.locator('.tcw-owner-block, .tcw-public-block').count();
  console.log('blocks week May ~25:', blocks);
  const owner = await page.locator('.tcw-owner-block').count();
  const pub = await page.locator('.tcw-public-block').count();
  console.log('owner blocks:', owner, 'public blocks:', pub);
  const titles = await page.locator('.tcw-b-title').allTextContents();
  console.log('titles:', titles);
  await browser.close();
})();

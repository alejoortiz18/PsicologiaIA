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

  // Go back to week of June 1 (has citas on Jun 2 and 4)
  for (let i = 0; i < 3; i++) {
    await page.click('#tcal-prev');
    await page.waitForTimeout(200);
  }
  const title = await page.locator('#tcal-nav-title').textContent();
  console.log('week:', title);
  const owner = await page.locator('.tcw-owner-block').count();
  const pub = await page.locator('.tcw-public-block').count();
  console.log('owner:', owner, 'public:', pub);
  console.log('titles:', await page.locator('.tcw-b-title').allTextContents());
  console.log('subs:', await page.locator('.tcw-b-time').allTextContents());

  // Debug slot statuses for June 4
  const debug = await page.evaluate(() => {
    const keys = Object.keys(window.slotMeta || {});
    return keys.filter(k => k.startsWith('2026-5-4') || k.startsWith('2026-6-4'));
  });
  console.log('slotMeta keys jun4:', debug);

  await browser.close();
})();

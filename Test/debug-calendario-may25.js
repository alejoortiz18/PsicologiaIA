const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();
  await page.goto('http://localhost:5271/Login');
  await page.fill('input[name="Correo"]', 'alejortiz@yopmail.com');
  await page.fill('input[name="Password"]', 'Yopmail2026.');
  await page.click('button[type="submit"]');
  await page.waitForURL(/HomeProfesional|PerfilProfesional/i);
  await page.goto('http://localhost:5271/PerfilProfesional/Calendario', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // May 25 week - go back from June 22 ~4 weeks
  for (let i = 0; i < 4; i++) {
    await page.click('#tcal-prev');
    await page.waitForTimeout(150);
  }
  console.log('week', await page.locator('#tcal-nav-title').textContent());
  console.log('owner', await page.locator('.tcw-owner-block').count(), 'public', await page.locator('.tcw-public-block').count());
  console.log('titles', await page.locator('.tcw-b-title').allTextContents());
  console.log('subs', await page.locator('.tcw-b-time').allTextContents());

  await browser.close();
})();

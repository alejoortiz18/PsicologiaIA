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
  const t = await page.locator('#tcal-nav-title').textContent();
  console.log('current week', t);
  const citas = await page.evaluate(() => {
    const all = window.perfilOradorCal.citas;
    const s = new Date(2026, 5, 22);
    const e = new Date(2026, 5, 29);
    return all.filter(c => {
      const d = new Date(c.fechaHora);
      return d >= s && d < e;
    });
  });
  console.log('citas this week JSON:', citas);
  console.log('blocks owner', await page.locator('.tcw-owner-block').count(), 'public', await page.locator('.tcw-public-block').count());
  console.log('titles', await page.locator('.tcw-b-title').allTextContents());
  await browser.close();
})();

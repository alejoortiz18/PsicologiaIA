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
  await page.goto(`${BASE}/PerfilOrador/Calendario?id=66`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const info = await page.evaluate(() => ({
    week: document.getElementById('tcal-nav-title')?.textContent,
    usuarioId: window.perfilOradorCal?.usuarioId,
    esProp: window.perfilOradorCal?.esVistaPropietario,
    citasCount: window.perfilOradorCal?.citas?.length,
    citas: window.perfilOradorCal?.citas,
    blocks: {
      occ: document.querySelectorAll('.tcw-occ-block').length,
      mine: document.querySelectorAll('.tcw-my-block').length,
      pub: document.querySelectorAll('.tcw-public-block').length,
      total: document.querySelectorAll('.tcw-occ-block,.tcw-my-block,.tcw-public-block').length
    },
    empty: !!document.querySelector('.tcal-empty'),
    sinHorario: document.getElementById('tcal-nav-title')?.textContent
  }));
  console.log(JSON.stringify(info, null, 2));

  // May 26 week
  for (let i = 0; i < 5; i++) {
    await page.click('#tcal-prev');
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(400);
  const may = await page.evaluate(() => ({
    week: document.getElementById('tcal-nav-title')?.textContent,
    occ: document.querySelectorAll('.tcw-occ-block').length,
    mine: document.querySelectorAll('.tcw-my-block').length,
    pub: document.querySelectorAll('.tcw-public-block').length,
    titles: [...document.querySelectorAll('.tcw-b-title')].map(e => e.textContent)
  }));
  console.log('May week:', JSON.stringify(may, null, 2));

  await browser.close();
})();

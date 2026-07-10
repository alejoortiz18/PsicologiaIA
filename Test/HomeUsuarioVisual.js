/**
 * Verificación visual rápida del Home Usuario (requiere app en https://localhost:7072).
 * Uso: node Test/HomeUsuarioVisual.js [correo] [contraseña]
 */
const { chromium } = require('playwright');
const path = require('path');

const BASE = process.env.TREBOL_URL || 'https://localhost:7072';
const SS = path.join(__dirname, 'screenshots');
const CORREO = process.argv[2] || process.env.TREBOL_USU_CORREO;
const PASS = process.argv[3] || process.env.TREBOL_USU_PASS;

if (!CORREO || !PASS) {
  console.error('Indica correo y contraseña: node Test/HomeUsuarioVisual.js correo@yopmail.com Password123!');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  await page.goto(`${BASE}/Login`);
  await page.fill('input[name="Correo"], input[type="email"]', CORREO);
  await page.fill('input[name="Password"], input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/HomeUsuario**', { timeout: 15_000 });

  await page.waitForSelector('#citas-heading');
  await page.waitForSelector('.home-two-col');
  await page.waitForSelector('.rooms-grid');

  const html = await page.content();
  const checks = [
    ['Eventos inscritos', html.includes('Eventos inscritos')],
    ['Sala más próxima', html.includes('Sala más próxima')],
    ['Mis próximas citas', html.includes('Mis próximas citas')],
    ['Salas destacadas', html.includes('Salas destacadas')],
    ['Comienzan hoy', html.includes('Comienzan hoy')],
  ];
  checks.forEach(([label, ok]) => console.log(ok ? `OK  ${label}` : `FALLO ${label}`));

  await page.screenshot({ path: path.join(SS, 'home-usuario-paridad.png'), fullPage: true });
  console.log(`Captura: ${path.join(SS, 'home-usuario-paridad.png')}`);

  await browser.close();
  if (checks.some(([, ok]) => !ok)) process.exit(1);
})();

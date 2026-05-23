/**
 * 1) Profesional no ve su propia tarjeta en directorio del mismo tipo.
 * 2) Envío y recepción de mensajes entre dos profesionales.
 * node Test/VerificarDirectorioYMensajes.js
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'https://localhost:7072';
const PASS = 'Yopmail2026.';

async function login(page, correo) {
  await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="Correo"]', correo);
  await page.fill('input[name="Password"]', PASS);
  await page.locator('form[action*="Login"] button[type="submit"]').click();
  await page.waitForURL(u => !u.pathname.includes('/Login'), { timeout: 25000 });
}

async function logout(page) {
  await page.context().clearCookies();
  await page.goto(`${BASE}/Login`, { waitUntil: 'domcontentloaded' });
}

async function nombreEnCards(page) {
  return page.locator('.prof-card .prof-card__name, .prof-card h3, .prof-card [class*="name"]').allTextContents()
    .catch(() => page.locator('.prof-card').evaluateAll(cards =>
      cards.map(c => c.innerText.split('\n')[0].trim())));
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  try {
  // --- Rene (médico): no debe verse en Médicos ---
  await login(page, 'rene@yopmail.com');
  await page.goto(`${BASE}/Directorio/Medicos`);
  await page.waitForSelector('.prof-card, [class*="empty"]', { timeout: 15000 });
  const cardsRene = await page.locator('.prof-card').count();
  const bodyMed = await page.locator('body').innerText();
  if (/rene/i.test(bodyMed) && cardsRene > 0) {
    const texts = await page.locator('.prof-card').allInnerTexts();
    const selfVisible = texts.some(t => /rene/i.test(t));
    if (selfVisible) throw new Error('Rene aparece en su propio listado de Médicos');
  }
  console.log('OK Rene no aparece en Médicos');

  // --- Alejandro (psicólogo): no debe verse en Psicólogos ---
  await logout(page);
  await login(page, 'alejortiz@yopmail.com');
  await page.goto(`${BASE}/Directorio/Psicologos`);
  await page.waitForSelector('.prof-card, [class*="empty"]', { timeout: 15000 });
  const textsAle = await page.locator('.prof-card').allInnerTexts().catch(() => []);
  if (textsAle.some(t => /alejortiz|alejandro/i.test(t))) {
    throw new Error('Alejandro aparece en su propio listado de Psicólogos');
  }
  console.log('OK Alejandro no aparece en Psicólogos');

  // --- Mensaje: Rene -> Alejandro vía GlobalPM ---
  await logout(page);
  await login(page, 'rene@yopmail.com');
  await page.goto(`${BASE}/Directorio/Psicologos`);
  await page.waitForSelector('.prof-card', { timeout: 15000 });

  const msgBtn = page.locator('.prof-card').filter({ hasText: /alejortiz|alejandro/i }).first()
    .locator('button:has-text("mensaje"), button[data-pm-name]');
  if (await msgBtn.count() === 0) {
    await page.locator('.prof-card button[data-pm-name]').first().click();
  } else {
    await msgBtn.first().click();
  }

  await page.waitForSelector('#global-pm-modal-body', { timeout: 8000 });
  const testMsg = `Prueba mensaje ${Date.now()}`;
  await page.fill('#global-pm-modal-body', testMsg);
  await page.click('#global-pm-modal-backdrop .gpm-btn-s');
  await page.waitForTimeout(2000);

  await page.goto(`${BASE}/Mensajeria`);
  await page.waitForTimeout(1500);
  const listaRene = await page.locator('body').innerText();
  if (!listaRene.includes(testMsg.slice(0, 20))) {
    console.warn('Aviso: último mensaje no visible en lista de Rene (puede estar en otra conversación)');
  }

  // --- Alejandro recibe y responde ---
  await logout(page);
  await login(page, 'alejortiz@yopmail.com');
  await page.goto(`${BASE}/Mensajeria`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const linkConv = page.locator('a.msg-conv-item, a[href*="conversacionId"]').first();
  if (await linkConv.count() === 0) throw new Error('Alejandro no tiene conversaciones');
  if (!page.url().includes('conversacionId')) await linkConv.click();
  await page.waitForURL(/conversacionId=/, { timeout: 15000 });
  const chatAle = await page.locator('#chat-body').innerText();
  if (!chatAle.includes('Prueba mensaje')) throw new Error('Alejandro no recibió el mensaje de Rene');

  const reply = `Respuesta ${Date.now()}`;
  await page.fill('#msg-input', reply);
  await page.click('#msg-send-btn');
  await page.waitForTimeout(2500);
  const chatAfter = await page.locator('#chat-body').innerText();
  if (!chatAfter.includes('Respuesta')) throw new Error('No se pudo enviar respuesta desde conversación');

  console.log('OK mensajería entre profesionales');
  console.log('Todas las verificaciones pasaron');
  } catch (e) {
    console.error('FALLO:', e.message);
    process.exitCode = 1;
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
})();

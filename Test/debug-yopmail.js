/**
 * Diagnóstico Yopmail - descubre los selectores reales de la bandeja
 */
const { chromium } = require('playwright');
const fs = require('fs');

const CORREO_USER = 'trebol.pro.test'; // sin @yopmail.com

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
    args: ['--start-maximized']
  });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  console.log('Abriendo Yopmail...');
  await page.goto('https://yopmail.com/es/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Captura inicial
  await page.screenshot({ path: 'screenshots/yop-01-inicio.png' });

  // Intentar diferentes selectores para el input
  const inputSelectors = ['input#login', 'input#yp', 'input[name="login"]', 'input[type="text"]'];
  let inputFound = null;
  for (const sel of inputSelectors) {
    const count = await page.locator(sel).count();
    console.log(`Selector '${sel}': ${count} elementos`);
    if (count > 0 && !inputFound) inputFound = sel;
  }
  
  if (inputFound) {
    console.log(`Usando input: ${inputFound}`);
    await page.fill(inputFound, CORREO_USER);
    await page.screenshot({ path: 'screenshots/yop-02-correo-ingresado.png' });
    await page.press(inputFound, 'Enter');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'screenshots/yop-03-post-enter.png' });
  }

  // Analizar iframes en la página
  const frames = page.frames();
  console.log(`\nFrames en la página: ${frames.length}`);
  for (const frame of frames) {
    console.log(`  Frame: name='${frame.name()}' url='${frame.url()}'`);
  }

  // Intentar acceder al iframe de bandeja
  const iframeSelectors = ['#ifinbox', '#ifmail', 'iframe[name="ifinbox"]'];
  for (const iframeSel of iframeSelectors) {
    const count = await page.locator(iframeSel).count();
    console.log(`\nIframe '${iframeSel}': ${count} elementos`);
    if (count > 0) {
      try {
        const frameContent = page.frameLocator(iframeSel);
        // Obtener HTML del iframe
        const html = await frameContent.locator('body').innerHTML({ timeout: 5000 });
        const file = `screenshots/yop-iframe-${iframeSel.replace('#','')}.html`;
        fs.writeFileSync(file, html);
        console.log(`  HTML guardado en ${file} (${html.length} chars)`);
        
        // Buscar posibles selectores de emails
        const posiblesSels = ['.m', '.lm', '.ml', '.mail', 'a', 'div[onclick]', 'tr', 'li'];
        for (const s of posiblesSels) {
          const n = await frameContent.locator(s).count();
          if (n > 0) console.log(`    Selector '${s}': ${n} elementos`);
        }
      } catch (e) {
        console.log(`  Error al acceder: ${e.message}`);
      }
    }
  }

  // Guardar HTML completo de la página
  const fullHtml = await page.content();
  fs.writeFileSync('screenshots/yop-full-page.html', fullHtml);
  console.log('\nHTML completo guardado en screenshots/yop-full-page.html');

  await page.screenshot({ path: 'screenshots/yop-04-final.png' });
  console.log('\nNavegador abierto. Ciérralo manualmente.');
  await new Promise(() => {}); // keep open
})();

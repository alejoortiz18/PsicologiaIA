const { chromium } = require('playwright');
const path = require('path');

// Correo único por timestamp para evitar duplicados
const timestamp = Date.now();
const CORREO = `trebol.pro.debug${timestamp}@yopmail.com`;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--ignore-certificate-errors']
  });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  // Interceptar respuestas del servidor para ver status codes
  page.on('response', r => {
    if (r.url().includes('RegistroProfesional') && r.request().method() === 'POST') {
      console.log(`POST response status: ${r.status()} url: ${r.url()}`);
    }
  });

  await page.goto('https://localhost:7072/Registro/RegistroProfesional', { waitUntil: 'domcontentloaded' });
  console.log('Usando correo:', CORREO);

  await page.fill('input[name="NombreCompleto"]',   'Dra. Debug Test');
  await page.fill('input[name="Correo"]',            CORREO);
  await page.fill('input[name="NumeroDocumento"]',   String(timestamp).slice(-9));
  await page.fill('input[name="Password"]',          'Password123!');
  await page.fill('input[name="ConfirmarPassword"]', 'Password123!');
  await page.fill('input[name="EspecialidadId"]',    '1');
  await page.fill('input[name="NumeroRegistro"]',    `PSI-DBG-${timestamp}`);

  const pdfPath = path.resolve(__dirname, '../Documentos/ArchivosPrueba/CedulaPrueba.pdf');
  await page.locator('input[name="CurriculumPdf"]').setInputFiles(pdfPath);

  await page.screenshot({ path: 'screenshots/debug-antes-envio.png' });
  await page.click('button[type="submit"]');

  // Esperar navegación o timeout
  await page.waitForTimeout(4000);

  const urlFinal = page.url();
  await page.screenshot({ path: 'screenshots/debug-despues-envio.png' });

  // Leer cualquier texto de error en la página
  const todosTextos = await page.locator('body').textContent();
  const errores = await page.locator('.text-danger').allTextContents();
  const alerts  = await page.locator('.alert, [class*="error"], [class*="danger"]').allTextContents();

  console.log('URL final:', urlFinal);
  console.log('Textos .text-danger:', JSON.stringify(errores));
  console.log('Textos alertas:', JSON.stringify(alerts));

  // Buscar en el HTML completo si hay mensaje de error del servidor
  if (todosTextos.includes('error') || todosTextos.includes('Error') || todosTextos.includes('excepción')) {
    const lineas = todosTextos.split('\n').filter(l => l.trim() && (l.includes('rror') || l.includes('xcep')));
    console.log('Líneas con error en body:', lineas.slice(0, 10));
  }

  await browser.close();
})();

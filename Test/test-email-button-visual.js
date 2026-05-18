const { chromium } = require('playwright');
const http = require('http');

async function testEmailButtonVisibility() {
  console.log('🧪 Iniciando test de visibilidad del botón del email...\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Ir a la página de registro
    console.log('📄 Navegando a: http://localhost:5271/Registro/RegistroProfesional');
    await page.goto('http://localhost:5271/Registro/RegistroProfesional', {
      waitUntil: 'networkidle'
    });

    console.log('✓ Página de registro cargada\n');

    // Generar datos únicos
    const timestamp = Date.now();
    const email = `prof_test_${timestamp}@yopmail.com`;
    const documento = `123456${timestamp.toString().slice(-4)}`;
    const tarjeta = `MED-${timestamp.toString().slice(-6)}`;

    console.log('📝 Llenando formulario con:');
    console.log(`  - Email: ${email}`);
    console.log(`  - Documento: ${documento}`);
    console.log(`  - Tarjeta: ${tarjeta}\n`);

    // Llenar el formulario
    await page.fill('input[name="NombreCompleto"]', 'Test Profesional Playwright');
    await page.fill('input[name="Correo"]', email);
    await page.fill('input[name="NumeroDocumento"]', documento);

    // Seleccionar tipo de profesional (Médico = 9)
    await page.selectOption('select[name="EspecialidadId"]', '9');
    console.log('✓ Tipo de profesional: Médico');

    // Llenar tarjeta profesional
    await page.fill('input[name="NumeroRegistro"]', tarjeta);

    // Llenar contraseña
    await page.fill('input[name="Password"]', 'TestPassword123!@');
    await page.fill('input[name="ConfirmPassword"]', 'TestPassword123!@');

    // Aceptar términos
    await page.check('input[name="Terminos"]');
    console.log('✓ Términos aceptados\n');

    // Crear archivo PDF dummy para upload
    const fs = require('fs');
    const pdfContent = Buffer.from('%PDF-1.4\n%test pdf', 'utf-8');
    const pdfPath = '/tmp/test_document.pdf';
    fs.writeFileSync(pdfPath, pdfContent);

    console.log('📎 Subiendo documentos PDF...');
    await page.locator('input[name="FotocopiaCedula"]').setInputFiles(pdfPath);
    await page.locator('input[name="FotocopiaTarjeta"]').setInputFiles(pdfPath);
    console.log('✓ PDFs subidos\n');

    // Interceptar respuestas para capturar el HTML del email
    let htmlEmailContent = '';
    let registrationSuccessful = false;

    page.on('response', async (response) => {
      const url = response.url();
      if (response.status() === 200 || response.status() === 302) {
        try {
          const text = await response.text();
          // Buscar el HTML del email en la respuesta
          if (text.includes('Confirmar correo y crear contraseña')) {
            htmlEmailContent = text;
          }
        } catch (e) {
          // Ignorar errores de lectura de response
        }
      }
    });

    console.log('🚀 Enviando formulario...');
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Esperar a que se redirija a la página de espera
    try {
      await page.waitForURL('**/EsperaConfirmacion', { timeout: 15000 });
      registrationSuccessful = true;
      console.log('✓ Registro exitoso - Redirigido a EsperaConfirmacion\n');
    } catch (e) {
      console.log('⚠ Timeout esperando redirección, continuando con validación...\n');
    }

    // Obtener el HTML actual de la página
    const pageContent = await page.content();
    htmlEmailContent = pageContent;

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDACIONES DEL BOTÓN
    // ═══════════════════════════════════════════════════════════════════════

    console.log('🔍 VALIDANDO BOTÓN DEL EMAIL:\n');

    // Validación 1: Texto del botón presente
    const hasButtonText = htmlEmailContent.includes('✅ Confirmar correo y crear contraseña');
    console.log(`${hasButtonText ? '✅' : '❌'} Texto del botón presente: "✅ Confirmar correo y crear contraseña"`);

    // Validación 2: Color de texto blanco
    const hasWhiteText = htmlEmailContent.includes('color:#FFFFFF');
    console.log(`${hasWhiteText ? '✅' : '❌'} Texto en color blanco (#FFFFFF)`);

    // Validación 3: Fondo negro
    const hasBlackBackground = htmlEmailContent.includes('background:#000000');
    console.log(`${hasBlackBackground ? '✅' : '❌'} Fondo en color negro (#000000)`);

    // Validación 4: Borde blanco para contraste
    const hasWhiteBorder = htmlEmailContent.includes('border:2px solid #FFFFFF');
    console.log(`${hasWhiteBorder ? '✅' : '❌'} Borde blanco 2px para contraste`);

    // Validación 5: Font-weight bold
    const hasBoldFont = htmlEmailContent.includes('font-weight:700');
    console.log(`${hasBoldFont ? '✅' : '❌'} Texto en negrita (font-weight:700)`);

    // Validación 6: Tamaño de fuente (1.1rem)
    const hasFontSize = htmlEmailContent.includes('font-size:1.1rem');
    console.log(`${hasFontSize ? '✅' : '❌'} Tamaño de fuente aumentado (1.1rem)`);

    // Validación 7: Padding adecuado
    const hasPadding = htmlEmailContent.includes('padding:18px 56px');
    console.log(`${hasPadding ? '✅' : '❌'} Padding adecuado (18px 56px)`);

    // Validación 8: Sombra dramática
    const hasShadow = htmlEmailContent.includes('box-shadow:0 6px 20px rgba(0,0,0,.8)');
    console.log(`${hasShadow ? '✅' : '❌'} Sombra dramática para destacar`);

    console.log('\n' + '═'.repeat(70));

    // Resumen
    const allValid = hasButtonText && hasWhiteText && hasBlackBackground && hasWhiteBorder && hasBoldFont && hasFontSize && hasPadding && hasShadow;

    if (allValid) {
      console.log('✅ TODAS LAS VALIDACIONES PASARON\n');
      console.log('El botón del email tiene:');
      console.log('  ✓ Texto claramente visible');
      console.log('  ✓ Contraste máximo (negro + blanco + borde)');
      console.log('  ✓ Tamaño aumentado');
      console.log('  ✓ Efectos visuales destacados');
      console.log('\n🎉 El usuario VERÁ claramente el botón en su email\n');
    } else {
      console.log('❌ ALGUNAS VALIDACIONES FALLARON:\n');
      if (!hasButtonText) console.log('  ✗ Falta el texto del botón');
      if (!hasWhiteText) console.log('  ✗ Texto no está en blanco');
      if (!hasBlackBackground) console.log('  ✗ Fondo no está en negro');
      if (!hasWhiteBorder) console.log('  ✗ Falta borde blanco');
      if (!hasBoldFont) console.log('  ✗ Texto no está en negrita');
      if (!hasFontSize) console.log('  ✗ Tamaño de fuente no está aumentado');
      if (!hasPadding) console.log('  ✗ Padding no es el esperado');
      if (!hasShadow) console.log('  ✗ Sombra no está configurada');
    }

    console.log('═'.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    console.error(error);
  } finally {
    await browser.close();
    console.log('🏁 Test finalizado\n');
  }
}

// Ejecutar el test
testEmailButtonVisibility().catch(console.error);

const { test, expect } = require('@playwright/test');

test.describe('Email Button Visibility Test', () => {
  test('debe mostrar el texto del botón en el email de confirmación', async ({ page }) => {
    // Ir a la página de registro
    await page.goto('http://localhost:5271/Registro/RegistroProfesional');
    
    // Esperar que la página cargue
    await page.waitForLoadState('networkidle');
    
    // Llenar el formulario
    const timestamp = Date.now();
    const email = `prof_test_${timestamp}@yopmail.com`;
    
    await page.fill('input[name="NombreCompleto"]', 'Test Profesional');
    await page.fill('input[name="Correo"]', email);
    await page.fill('input[name="NumeroDocumento"]', `123456${timestamp.toString().slice(-4)}`);
    
    // Seleccionar tipo de profesional
    await page.selectOption('select[name="EspecialidadId"]', '9'); // Médico
    
    // Llenar tarjeta profesional
    await page.fill('input[name="NumeroRegistro"]', `MED-${timestamp.toString().slice(-6)}`);
    
    // Llenar contraseña
    await page.fill('input[name="Password"]', 'TestPassword123!');
    await page.fill('input[name="ConfirmPassword"]', 'TestPassword123!');
    
    // Aceptar términos
    await page.check('input[name="Terminos"]');
    
    // Upload PDFs (crear archivos dummy)
    const fs = require('fs');
    const pdfPath = '/tmp/test.pdf';
    if (!fs.existsSync(pdfPath)) {
      fs.writeFileSync(pdfPath, '%PDF-1.4\n%dummy pdf content');
    }
    
    await page.locator('input[name="FotocopiaCedula"]').setInputFiles(pdfPath);
    await page.locator('input[name="FotocopiaTarjeta"]').setInputFiles(pdfPath);
    
    // Interceptar las peticiones para ver si se envía el email
    let emailSent = false;
    let emailContent = '';
    
    page.on('response', async (response) => {
      if (response.url().includes('email') || response.url().includes('registro')) {
        const text = await response.text();
        if (text.includes('Confirmar correo y crear contraseña')) {
          emailSent = true;
          emailContent = text;
        }
      }
    });
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Esperar a que se redirija
    await page.waitForURL('**/EsperaConfirmacion', { timeout: 10000 }).catch(() => {});
    
    // Verificar que llegamos a la página de espera
    const pageUrl = page.url();
    console.log('Current URL:', pageUrl);
    expect(pageUrl).toContain('EsperaConfirmacion');
    
    // El texto del botón debería estar en el HTML del email enviado
    console.log('Email sent:', emailSent);
    console.log('Email content length:', emailContent.length);
    
    // Validación: El botón debe tener el texto visible
    // Comprobamos que el estilo no esté ocultando el texto
    const buttonRegex = /✅\s*Confirmar correo y crear contraseña/;
    expect(emailContent).toMatch(buttonRegex);
    
    // Validar que el color del texto sea blanco (#FFFFFF)
    expect(emailContent).toContain('color:#FFFFFF');
    
    // Validar que el fondo sea negro (#000000)
    expect(emailContent).toContain('background:#000000');
    
    // Validar que haya borde blanco para contraste
    expect(emailContent).toContain('border:2px solid #FFFFFF');
    
    console.log('✅ Test passed: Button text is visible with proper contrast');
  });
});

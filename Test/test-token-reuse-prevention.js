/**
 * Test: Token Reuse Prevention
 * 
 * Este test valida que:
 * 1. Primera vez que el usuario hace clic en el enlace de confirmación:
 *    - Token es válido y no usado
 *    - Sistema muestra el formulario de crear contraseña
 * 
 * 2. Segunda vez que el usuario hace clic en el mismo enlace:
 *    - Token ya fue usado
 *    - Sistema muestra modal de error genérico
 *    - Modal NO revela que el token fue usado
 *    - Modal tiene botón "Iniciar sesión" que va al login
 */

import { test, expect } from '@playwright/test';

test.describe('Token Reuse Prevention', () => {
  const baseUrl = 'http://localhost:5271';

  // Test 1: Primera vez - Token válido y no usado
  test('Should show password form on first token use', async ({ page }) => {
    // Simular un token válido (esto requeriría datos en DB primero)
    // Por ahora, asumimos que tenemos un token válido
    const validToken = 'test-token-valid'; // Este valor viene del flujo real

    // Navegar al formulario de confirmación con token válido
    await page.goto(`${baseUrl}/Registro/ConfirmarEmail?token=${validToken}`);

    // El modal de error NO debe ser visible
    const errorModal = page.locator('#errorModal');
    await expect(errorModal).toHaveStyle('display: none');

    // El panel del formulario DEBE ser visible
    const formPanel = page.locator('#formPanel');
    await expect(formPanel).toBeVisible();

    // El formulario de contraseña debe estar visible
    const passwordForm = page.locator('form');
    await expect(passwordForm).toBeVisible();

    // Los campos de contraseña deben estar presentes
    const passwordInput = page.locator('input[asp-for="Password"]');
    const confirmPasswordInput = page.locator('input[asp-for="ConfirmarPassword"]');
    
    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();
  });

  // Test 2: Segunda vez - Token ya usado
  test('Should show error modal on token reuse', async ({ page }) => {
    // Simular intento de reutilizar el mismo token
    const usedToken = 'test-token-used'; // Este token ya fue usado

    // Navegar con el token que ya fue usado
    await page.goto(`${baseUrl}/Registro/ConfirmarEmail?token=${usedToken}`, { 
      waitUntil: 'networkidle' 
    });

    // Intentar enviar el formulario (o esperar que el servidor rechace)
    // Para este test, asumimos que el error modal aparece automáticamente
    
    // El modal de error DEBE ser visible
    const errorModal = page.locator('#errorModal');
    const errorStyle = await errorModal.evaluate(el => window.getComputedStyle(el).display);
    
    // Validar que el modal se muestra
    expect(errorStyle).toBe('flex');

    // El panel del formulario DEBE estar oculto
    const formPanel = page.locator('#formPanel');
    const formPanelStyle = await formPanel.evaluate(el => window.getComputedStyle(el).display);
    
    expect(formPanelStyle).toBe('none');
  });

  // Test 3: Validar contenido del modal de error
  test('Should show generic error message in modal', async ({ page }) => {
    // Asumiendo que hay un modal con error visible
    const errorTitle = page.locator('.modal__title');
    const errorMessage = page.locator('.modal__message');
    const loginButton = page.locator('a[href*="/Login"]').filter({ hasText: 'Iniciar sesión' });

    // El título debe ser visible (con icono de advertencia)
    await expect(errorTitle).toContainText('Error en la solicitud');

    // El mensaje debe ser genérico y NO debe revelar causa específica
    await expect(errorMessage).toContainText('Ocurrió un error al procesar tu solicitud');
    
    // El mensaje NO debe contener palabras que revelen que el token fue usado:
    const messageText = await errorMessage.textContent();
    expect(messageText).not.toMatch(/ya fue utilizado|token|expiró exactamente/i);

    // Debe existir botón "Iniciar sesión"
    await expect(loginButton).toBeVisible();
  });

  // Test 4: Modal close button
  test('Should close modal when clicking X button', async ({ page }) => {
    // Asumir que hay un modal visible
    const errorModal = page.locator('#errorModal');
    const closeButton = page.locator('.modal__close');

    // El botón de cerrar debe existir
    await expect(closeButton).toBeVisible();

    // Hacer clic en el botón de cerrar
    await closeButton.click();

    // El modal debe ocultarse
    const style = await errorModal.evaluate(el => window.getComputedStyle(el).display);
    expect(style).toBe('none');
  });

  // Test 5: Modal close button on overlay click
  test('Should close modal when clicking overlay', async ({ page }) => {
    // Asumir que hay un modal visible
    const errorModal = page.locator('#errorModal');
    const overlay = page.locator('.modal__overlay');

    // El overlay debe existir
    await expect(overlay).toBeVisible();

    // Hacer clic en el overlay
    await overlay.click();

    // El modal debe ocultarse
    const style = await errorModal.evaluate(el => window.getComputedStyle(el).display);
    expect(style).toBe('none');
  });

  // Test 6: "Iniciar sesión" button navigates to login
  test('Should navigate to login when clicking login button', async ({ page }) => {
    // Asumir que hay un modal visible
    const loginButton = page.locator('a[href*="/Login"]').filter({ hasText: 'Iniciar sesión' });

    // El botón debe estar visible
    await expect(loginButton).toBeVisible();

    // Obtener el href del botón
    const href = await loginButton.getAttribute('href');
    
    // Debe contener /Login
    expect(href).toContain('/Login');

    // Hacer clic en el botón y validar la navegación
    await loginButton.click();
    
    // Esperar a que se navegue a la página de login
    await page.waitForURL('**/Login**');
  });
});

// Test de integración: Flujo completo de token reuse
test.describe('Full token reuse flow', () => {
  const baseUrl = 'http://localhost:5271';

  test('Complete reuse prevention flow', async ({ page }) => {
    // 1. Registrar un profesional con email confirmable
    // 2. Obtener el token de confirmación
    // 3. Hacer clic en el enlace (primera vez) - debe mostrar formulario
    // 4. Hacer clic en el enlace nuevamente (segunda vez) - debe mostrar error modal
    
    // NOTA: Este test requeriría setup de DB y generación de tokens reales
    // Por ahora, es un esquema de lo que se valdría
    
    console.log('Full integration test requires real token generation');
    console.log('Este test se ejecutaría con datos reales del sistema');
  });
});

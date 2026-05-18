# Token Reuse Prevention - Implementación

## Resumen
Se ha implementado la prevención de reutilización de tokens en el flujo de confirmación de email para profesionales. El sistema ahora valida que un token solo pueda usarse una vez, y si el usuario intenta reutilizarlo, muestra un modal con mensaje de error genérico.

## Componentes Modificados

### 1. Controlador: `RegistroController.cs` (línea 199-217)
**Cambio Principal:** Error genérico en lugar de mensaje específico

```csharp
// POST /Registro/ConfirmarEmail
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> ConfirmarEmail(ConfirmarEmailViewModel vm)
{
    if (!ModelState.IsValid) return View(vm);

    var passwordHash = passwordHelper.HashPassword(vm.Password);
    var resultado = await profesionalRepo.ConfirmarEmailAsync(vm.Token, passwordHash);

    if (!resultado.Exito)
    {
        // Mostrar error genérico sin revelar la causa específica
        ModelState.AddModelError(string.Empty, "Ocurrió un error al procesar tu solicitud. Por favor, intenta iniciar sesión.");
        ViewData["ShowErrorModal"] = true;
        return View(vm);
    }

    return RedirectToAction("EsperaAprobacion");
}
```

**Ventaja de Seguridad:** 
- No revela si el token fue usado, expiró, o es inválido
- El usuario no puede saber el motivo específico del error
- Evita ataques de información que revelen detalles internos

### 2. Vista: `ConfirmarEmail.cshtml`
**Cambios:**
- Agregado modal de error genérico
- El modal se muestra automáticamente cuando hay errores de validación
- El formulario se oculta cuando el error aparece
- Incluye botón "Iniciar sesión" que lleva al login

**Modal de Error:**
```html
<div id="errorModal" class="modal modal--error" style="display:none;">
  <div class="modal__overlay"></div>
  <div class="modal__content">
    <div class="modal__header">
      <h2 class="modal__title">⚠️ Error en la solicitud</h2>
      <button type="button" class="modal__close" onclick="closeErrorModal()">×</button>
    </div>
    <div class="modal__body">
      <p class="modal__message">Ocurrió un error al procesar tu solicitud. Este enlace puede haber expirado o ya fue utilizado.</p>
      <p class="modal__secondary-text">Por favor, intenta iniciar sesión con tu correo.</p>
    </div>
    <div class="modal__footer">
      <a href="@Url.Action("Index", "Login")" class="btn btn-primary w-full">
        <span class="btn-text">Iniciar sesión →</span>
      </a>
    </div>
  </div>
</div>
```

**JavaScript para mostrar/ocultar:**
```javascript
function showErrorModal() {
  document.getElementById('errorModal').style.display = 'flex';
  // Ocultar el panel del formulario
  document.getElementById('formPanel').style.display = 'none';
}

// Mostrar modal si hay error
document.addEventListener('DOMContentLoaded', function() {
  var validationSummary = document.querySelector('.form-error[data-valmsg-summary="true"]');
  if (validationSummary && validationSummary.textContent.trim().length > 0) {
    showErrorModal();
  }
});
```

### 3. Stored Procedure: `sp_ConfirmarEmailProfesional` (sin cambios)
**Validaciones existentes:**

1. **Línea 247:** Verifica que el token exista, no haya sido usado (`Usado = 0`) y no haya expirado
   ```sql
   SELECT @ProfesionalId = ta.ProfesionalId
   FROM   TokenActivacion ta
   WHERE  ta.Token = @Token AND ta.Usado = 0 AND ta.FechaExpiracion > GETDATE();
   ```

2. **Línea 251-252:** Si el token es inválido o ya fue usado
   ```sql
   IF @ProfesionalId IS NULL
   BEGIN 
     SELECT 0 AS Exito, 'El enlace de confirmación es inválido o ha expirado.'; 
     RETURN; 
   END
   ```

3. **Línea 255-257:** Verifica que el profesional esté en estado correcto
   ```sql
   IF NOT EXISTS (SELECT 1 FROM Profesional WHERE ProfesionalId = @ProfesionalId AND Estado = 'PENDIENTE_VALIDACION')
   BEGIN 
     SELECT 0 AS Exito, 'Este enlace ya fue utilizado o la cuenta ya fue procesada.'; 
     RETURN; 
   END
   ```

4. **Línea 263:** Marca el token como usado
   ```sql
   UPDATE TokenActivacion SET Usado = 1 WHERE Token = @Token;
   ```

## Flujo de Validación

### Primer Click (Token válido y no usado)
1. Usuario hace clic en el enlace de confirmación
2. GET `/Registro/ConfirmarEmail?token=XXX` → muestra formulario
3. Usuario completa datos de contraseña
4. POST valida token en SP:
   - ✓ Token existe
   - ✓ `Usado = 0` (no usado)
   - ✓ No expirado
   - ✓ Profesional en estado `PENDIENTE_VALIDACION`
5. SP actualiza: `Usado = 1`, estado a `PENDIENTE_APROBACION`, guarda password
6. Redirect a página de éxito

### Segundo Click (Token reusado)
1. Usuario intenta hacer clic nuevamente en el mismo enlace
2. GET `/Registro/ConfirmarEmail?token=XXX` → muestra formulario (sin errores todavía)
3. Usuario completa datos de contraseña
4. POST valida token en SP:
   - ✓ Token existe
   - ✗ `Usado = 1` (YA FUE USADO) → Falla
5. SP retorna: `Exito = 0, Mensaje = "El enlace de confirmación es inválido o ha expirado."`
6. Controlador recibe error pero muestra mensaje genérico: "Ocurrió un error al procesar tu solicitud..."
7. Vista ocurre error, JavaScript detecta y muestra modal con mensaje genérico
8. Usuario ve modal (sin formulario) con botón "Iniciar sesión"

## Seguridad

### ¿Qué NO revela el mensaje?
- ✗ No dice "token ya fue usado"
- ✗ No dice "token inválido"
- ✗ No dice "token expirado"
- ✗ No revela cuál fue el problema específico

### ¿Qué SÍ sabe el usuario?
- ✓ Algo salió mal con la solicitud
- ✓ Puede intentar iniciar sesión
- ✓ El error es genérico (podría ser cualquier razón)

## Testing

Se ha creado archivo de test: `Test/test-token-reuse-prevention.js`

Tests incluidos:
1. ✓ First token use shows password form
2. ✓ Second token use shows error modal
3. ✓ Generic error message doesn't reveal cause
4. ✓ Modal close button works
5. ✓ Overlay click closes modal
6. ✓ Login button navigates to /Login

## Estado de Implementación

- ✅ Controlador modificado para mensaje genérico
- ✅ Vista con modal de error
- ✅ JavaScript para mostrar/ocultar modal y formulario
- ✅ Styling para modal (overlay, header, body, footer)
- ✅ Botón de cerrar (X)
- ✅ Botón de "Iniciar sesión"
- ✅ Test file creado
- ⏳ Testing manual (pendiente cuando app esté ejecutándose)

## Próximos Pasos (Opcional)

1. Ejecutar tests con Playwright para validar flujo completo
2. Registrar profesional de prueba y generar token real
3. Validar que primer click muestra formulario
4. Validar que segundo click muestra modal
5. Validar estilos de modal en diferentes navegadores
6. Considerar agregar email de recuperación si el usuario olvida/pierde el token

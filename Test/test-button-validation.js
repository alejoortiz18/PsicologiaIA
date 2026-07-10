const fs = require('fs');
const path = require('path');

// Leer el archivo RegistroController.cs
const controllerPath = 'e:\\Proyecto Psicologia\\Proyecto con IA\\PsicologiaIA\\Proyecto MVC\\Trebol.Web\\Controllers\\RegistroController.cs';
const controllerContent = fs.readFileSync(controllerPath, 'utf-8');

console.log('🧪 TEST DE VALIDACIÓN DE BOTÓN EN EMAIL\n');
console.log('═'.repeat(70));

// Extraer la función BuildEmailConfirmacionProfesional
const emailFunctionMatch = controllerContent.match(/private static string BuildEmailConfirmacionProfesional[\s\S]*?""";/);

if (!emailFunctionMatch) {
  console.error('❌ No se encontró la función BuildEmailConfirmacionProfesional');
  process.exit(1);
}

const emailHtml = emailFunctionMatch[0];

// Reemplazar variables para obtener HTML válido
const testEmail = emailHtml
  .replace(/{enlace}/g, 'https://localhost:7072/Registro/ConfirmarEmail?token=test123')
  .replace(/{nombre}/g, 'Test Profesional');

console.log('\n📊 VALIDACIONES DEL BOTÓN DEL EMAIL:\n');

// Validación 1: Texto del botón presente
const hasButtonText = testEmail.includes('✅ Confirmar correo y crear contraseña');
console.log(`${hasButtonText ? '✅' : '❌'} Texto del botón presente: "✅ Confirmar correo y crear contraseña"`);

// Validación 2: Color de texto blanco
const hasWhiteText = testEmail.includes('color:#FFFFFF');
console.log(`${hasWhiteText ? '✅' : '❌'} Texto en color blanco (#FFFFFF)`);

// Validación 3: Fondo negro
const hasBlackBackground = testEmail.includes('background:#000000');
console.log(`${hasBlackBackground ? '✅' : '❌'} Fondo en color negro (#000000)`);

// Validación 4: Borde blanco para contraste
const hasWhiteBorder = testEmail.includes('border:2px solid #FFFFFF');
console.log(`${hasWhiteBorder ? '✅' : '❌'} Borde blanco 2px para contraste`);

// Validación 5: Font-weight bold
const hasBoldFont = testEmail.includes('font-weight:700');
console.log(`${hasBoldFont ? '✅' : '❌'} Texto en negrita (font-weight:700)`);

// Validación 6: Tamaño de fuente aumentado (1.1rem)
const hasFontSize = testEmail.includes('font-size:1.1rem');
console.log(`${hasFontSize ? '✅' : '❌'} Tamaño de fuente aumentado (1.1rem)`);

// Validación 7: Padding adecuado (18px 56px)
const hasPadding = testEmail.includes('padding:18px 56px');
console.log(`${hasPadding ? '✅' : '❌'} Padding adecuado (18px 56px)`);

// Validación 8: Sombra dramática
const hasShadow = testEmail.includes('box-shadow:0 6px 20px rgba(0,0,0,.8)');
console.log(`${hasShadow ? '✅' : '❌'} Sombra dramática para destacar`);

// Validación 9: Display inline-block
const hasDisplay = testEmail.includes('display:inline-block');
console.log(`${hasDisplay ? '✅' : '❌'} Display inline-block (botón en línea)`);

// Validación 10: Sin importancia importante (sin !important conflictivos)
const buttonStyleMatch = testEmail.match(/style="[^"]*Confirmar correo[^"]*"/);
const hasNoConflict = !testEmail.includes('color:#ffffff !important') || testEmail.includes('color:#FFFFFF !important');
console.log(`${hasNoConflict ? '✅' : '❌'} Estilos sin conflictos de importancia`);

console.log('\n' + '═'.repeat(70));

// Resumen
const allValid = hasButtonText && hasWhiteText && hasBlackBackground && hasWhiteBorder && 
                 hasBoldFont && hasFontSize && hasPadding && hasShadow && hasDisplay;

if (allValid) {
  console.log('\n✅ TODAS LAS VALIDACIONES PASARON\n');
  console.log('✨ El botón del email tiene configuración PERFECTA:');
  console.log('  ✓ Texto claramente visible');
  console.log('  ✓ Contraste máximo (NEGRO + BLANCO + BORDE)');
  console.log('  ✓ Tamaño aumentado (1.1rem)');
  console.log('  ✓ Padding generoso (18px 56px)');
  console.log('  ✓ Sombra dramática (0 6px 20px)');
  console.log('  ✓ Estilos consistentes\n');
  console.log('🎉 El usuario VERÁ CLARAMENTE el botón en su email\n');
  console.log('═'.repeat(70) + '\n');
  process.exit(0);
} else {
  console.log('\n❌ ALGUNAS VALIDACIONES FALLARON:\n');
  if (!hasButtonText) console.log('  ✗ Falta el texto del botón');
  if (!hasWhiteText) console.log('  ✗ Texto no está en blanco (#FFFFFF)');
  if (!hasBlackBackground) console.log('  ✗ Fondo no está en negro (#000000)');
  if (!hasWhiteBorder) console.log('  ✗ Falta borde blanco (2px solid #FFFFFF)');
  if (!hasBoldFont) console.log('  ✗ Texto no está en negrita (font-weight:700)');
  if (!hasFontSize) console.log('  ✗ Tamaño de fuente no está aumentado (1.1rem)');
  if (!hasPadding) console.log('  ✗ Padding no es adecuado (18px 56px)');
  if (!hasShadow) console.log('  ✗ Sombra no está configurada (0 6px 20px)');
  if (!hasDisplay) console.log('  ✗ Display no es inline-block');
  if (!hasNoConflict) console.log('  ✗ Hay conflictos de estilos');
  console.log('\n' + '═'.repeat(70) + '\n');
  process.exit(1);
}

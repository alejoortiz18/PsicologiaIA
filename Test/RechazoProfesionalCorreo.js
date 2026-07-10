/**
 * Prueba E2E etapas 1–4: registro → admin psicologiatrevol → ConfirmarEmail (token BD, sin Gmail)
 * → rechazo modal → correo de rechazo en Yopmail del profesional.
 *
 * Ejecutar: node Test/RechazoProfesionalCorreo.js
 */
const { execSync } = require('child_process');
const path = require('path');

process.env.STOP_AFTER = '9';
execSync(`node "${path.join(__dirname, 'CrearCuentaProfesional.js')}"`, {
  stdio: 'inherit',
  env: { ...process.env, STOP_AFTER: '9' },
});

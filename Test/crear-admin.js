/**
 * Crea el admin en TrebolDB con hash Argon2id exactamente igual que PasswordHelper.cs
 * Formato C#: Base64( salt[32] + hash[32] ) con params: iterations=3, memory=65536, parallelism=4
 */
const argon2  = require('argon2');
const crypto  = require('crypto');
const { execSync } = require('child_process');

async function main() {
  const password = 'Gm41l.C0m';
  const correo   = 'psicologiatrevol@gmail.com';
  const nombre   = 'Administrador Trébol';
  const connStr  = 'Server=DESKALEJO\\SQLEXPRESS;Database=TrebolDB;Trusted_Connection=True;TrustServerCertificate=True;';

  // Replicar exactamente PasswordHelper.cs
  const salt = crypto.randomBytes(32);
  const hashBuf = await argon2.hash(password, {
    type:        argon2.argon2id,
    salt,
    memoryCost:  65536,   // 64 MB
    timeCost:    3,
    parallelism: 4,
    hashLength:  32,
    raw:         true     // ← solo los bytes del hash, sin PHC wrapper
  });

  const combined = Buffer.concat([salt, hashBuf]);  // 64 bytes
  const hashB64  = combined.toString('base64');

  console.log('Hash generado (64 bytes en Base64):');
  console.log(hashB64);

  // Insertar con sqlcmd
  const sql = `
    IF EXISTS (SELECT 1 FROM Administrador WHERE Correo = '${correo}')
      DELETE FROM Administrador WHERE Correo = '${correo}';
    INSERT INTO Administrador (NombreCompleto, Correo, PasswordHash, Estado)
    VALUES ('${nombre}', '${correo}', '${hashB64}', 1);
    SELECT AdministradorId, NombreCompleto, Correo FROM Administrador WHERE Correo = '${correo}';
  `;

  const tmpFile = require('path').join(__dirname, '_admin_seed.sql');
  require('fs').writeFileSync(tmpFile, sql, 'utf8');

  try {
    const out = execSync(`sqlcmd -S "DESKALEJO\\SQLEXPRESS" -d TrebolDB -E -i "${tmpFile}"`, { encoding: 'utf8' });
    console.log('\nResultado SQL:');
    console.log(out.trim());
    console.log('\n✅ Admin creado exitosamente.');
    console.log(`   Correo:    ${correo}`);
    console.log(`   Password:  ${password}`);
  } finally {
    require('fs').unlinkSync(tmpFile);
  }
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});


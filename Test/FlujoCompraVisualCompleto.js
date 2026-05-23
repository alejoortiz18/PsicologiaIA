/**
 * Prueba visual E2E: inscripción evento (inicio + perfil) y cita privada (calendario) con pago simulado.
 *
 * node Test/FlujoCompraVisualCompleto.js
 * HEADLESS=0 node Test/FlujoCompraVisualCompleto.js
 * BASE_URL=http://localhost:5271  SKIP_SETUP=1
 */
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || process.env.TREBOL_URL || 'http://localhost:5271';
const CORREO = process.env.CORREO_USU || 'test.visual@yopmail.com';
const PASS = process.env.PASS_USU || 'Yopmail2026.';
const PROF_ID = process.env.PROFESIONAL_ID || '65';
const SQL_SERVER = process.env.TREBOL_SQL_SERVER || 'DESKALEJO\\SQLEXPRESS';
const SQL_DB = process.env.TREBOL_SQL_DB || 'TrebolDB';
const SS = path.join(__dirname, 'screenshots', `flujo-compra-${Date.now()}`);

const TARJETA = {
  numero: '4242 4242 4242 4242',
  venc: '12/30',
  cvv: '123',
  nombre: 'MARIA GARCIA TEST'
};

async function shot(page, name) {
  const p = path.join(SS, name);
  await page.screenshot({ path: p, fullPage: true });
  console.log('  📷', name);
  return p;
}

function crearSalaPruebaSql(etiqueta) {
  if (process.env.SKIP_SETUP === '1') return null;
  const titulo = `VisualCompra ${etiqueta} ${Date.now()}`;
  const nombre = titulo.replace(/'/g, "''");
  const q = `EXEC sp_CrearSala @ProfesionalId=${PROF_ID}, @Nombre=N'${nombre}', @Descripcion=N'Evento prueba visual compra', @CupoMaximo=50, @Precio=15000`;
  try {
    const out = execSync(`sqlcmd -S "${SQL_SERVER}" -d ${SQL_DB} -E -Q "${q.replace(/"/g, '\\"')}"`, {
      encoding: 'utf8',
      timeout: 30_000
    });
    const m = out.match(/\s+(\d+)\s*$/m);
    const id = m ? m[1] : null;
    console.log('  🆕 Sala de prueba:', titulo, id ? `(Id ${id})` : '');
    return id;
  } catch (e) {
    console.warn('  ⚠ No se pudo crear sala SQL:', e.message.split('\n')[0]);
    return null;
  }
}

async function login(page) {
  await page.goto(`${BASE}/Login`, { waitUntil: 'networkidle', timeout: 45_000 });
  await page.fill('input[name="Correo"], input[type="email"]', CORREO);
  await page.fill('input[name="Password"], input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(/HomeUsuario/i, { timeout: 25_000 });
}

async function detalleSala(page, id) {
  const r = await page.request.get(`${BASE}/Eventos/Detalle/${id}`);
  if (!r.ok()) return null;
  return { id: String(id), j: await r.json() };
}

async function buscarSalaEnDom(page, preferirPago = true) {
  const ids = await page.locator('[data-sala-id]').evaluateAll(els =>
    [...new Set(els.map(e => e.dataset.salaId).filter(Boolean))]
  );
  let gratis = null;
  for (const id of ids) {
    const s = await detalleSala(page, id);
    if (!s || s.j.esInscrito) continue;
    const cupos = (s.j.capacidad || 0) - (s.j.totalInscritos || 0);
    if (s.j.capacidad > 0 && cupos <= 0) continue;
    if (preferirPago && s.j.precio > 0) return s;
    if (!gratis && s.j.precio <= 0) gratis = s;
  }
  return gratis;
}

async function buscarSalaGlobal(page, preferirPago = true, salaIdPreferida = null) {
  if (salaIdPreferida) {
    const s = await detalleSala(page, salaIdPreferida);
    if (s && !s.j.esInscrito) return { sala: s, origen: 'api' };
  }
  await page.goto(`${BASE}/HomeUsuario`, { waitUntil: 'networkidle' });
  let sala = await buscarSalaEnDom(page, preferirPago);
  if (sala) return { sala, origen: 'home' };
  await page.goto(`${BASE}/Eventos`, { waitUntil: 'networkidle' });
  sala = await buscarSalaEnDom(page, preferirPago);
  if (sala) return { sala, origen: 'eventos' };
  if (preferirPago) {
    sala = await buscarSalaEnDom(page, false);
    if (sala) return { sala, origen: 'eventos' };
  }
  const extra = (process.env.SALA_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  const min = parseInt(process.env.SALA_ID_MIN || '1', 10);
  const max = parseInt(process.env.SALA_ID_MAX || '80', 10);
  const ids = extra.length ? extra : [];
  for (let i = min; i <= max; i++) ids.push(String(i));
  let gratis = null;
  for (const id of [...new Set(ids)]) {
    const s = await detalleSala(page, id);
    if (!s || s.j.esInscrito) continue;
    const cupos = (s.j.capacidad || 0) - (s.j.totalInscritos || 0);
    if (s.j.capacidad > 0 && cupos <= 0) continue;
    if (preferirPago && s.j.precio > 0) return { sala: s, origen: 'api' };
    if (!gratis && s.j.precio <= 0) gratis = s;
  }
  if (gratis) return { sala: gratis, origen: 'api' };
  return null;
}

function esCheckoutPagoOResultado(url) {
  return /\/Inscripcion\/Pago\/\d+/.test(url)
    || /\/PagoCita\/Pago\/\d+/.test(url)
    || /\/Inscripcion\/Resultado\//.test(url)
    || /\/PagoCita\/Resultado\//.test(url);
}

async function pasoConfirmar(page) {
  const st = await page.request.get(page.url());
  if (st.status() === 404) throw new Error('Checkout devolvió 404');
  await page.waitForSelector('.wizard-steps, .checkout-grid', { timeout: 15_000 });
  const btn = page.locator('form button[type="submit"].btn-primary').first();
  await btn.waitFor({ state: 'visible' });
  console.log('    Confirmar:', (await btn.innerText()).trim());
  try {
    await Promise.all([
      page.waitForURL(u => esCheckoutPagoOResultado(u), { timeout: 30_000 }),
      btn.click()
    ]);
  } catch (e) {
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText();
    if (/no est[aá] disponible|horario.*disponible/i.test(body)) {
      throw new Error('Confirmación rechazada: horario no disponible');
    }
    throw e;
  }
  await page.waitForLoadState('networkidle');
}

async function pasoPagoSiAplica(page, prefix) {
  if (!/\/Inscripcion\/Pago\/|\/PagoCita\/Pago\//.test(page.url())) {
    const gratis = page.url().includes('Resultado')
      || (await page.locator('text=¡Inscripción exitosa').count()) > 0
      || (await page.locator('text=¡Cita confirmada').count()) > 0;
    if (gratis) {
      console.log('    Entrada libre — sin paso de pago');
      await shot(page, `${prefix}-03-resultado-gratis.png`);
      return 'gratis';
    }
    throw new Error(`Se esperaba /Pago o resultado, URL: ${page.url()}`);
  }
  await page.waitForSelector('#tarjeta-numero', { timeout: 20_000 });
  await shot(page, `${prefix}-03-pago-tarjeta.png`);
  await page.fill('#tarjeta-numero', TARJETA.numero);
  await page.fill('#tarjeta-venc', TARJETA.venc);
  await page.fill('#tarjeta-cvv', TARJETA.cvv);
  await page.fill('#tarjeta-nombre', TARJETA.nombre);
  await shot(page, `${prefix}-04-pago-lleno.png`);
  await page.locator('#form-pago button[type="submit"]').click();
  await page.waitForURL(/Resultado/, { timeout: 20_000 });
  await shot(page, `${prefix}-05-resultado-pago.png`);
  const body = await page.locator('body').innerText();
  if (!/exitosa|confirmada|pagad/i.test(body)) {
    throw new Error('Pantalla de resultado sin mensaje de éxito');
  }
  return 'pagado';
}

function locatorSala(page, salaId) {
  return page.locator(`[data-sala-id="${salaId}"]`).first();
}

async function irAInscripcionDesdeCard(page, salaId, origen) {
  if (origen === 'api') {
    await page.goto(`${BASE}/HomeUsuario`, { waitUntil: 'networkidle' });
    const card = locatorSala(page, salaId);
    if (await card.count()) {
      const regBtn = card.locator('.btn-reg-sala').first();
      if (await regBtn.count() && !(await regBtn.evaluate(el => el.classList.contains('is-inscrito')))) {
        await regBtn.click();
        await page.waitForURL(/Inscripcion\/Confirmar/, { timeout: 15_000 });
        return;
      }
    }
    await page.goto(`${BASE}/Eventos`, { waitUntil: 'networkidle' });
    const card2 = locatorSala(page, salaId);
    if (await card2.count()) {
      await card2.locator('.btn-reg-sala').first().click();
      await page.waitForURL(/Inscripcion\/Confirmar/, { timeout: 15_000 });
      return;
    }
    await page.goto(`${BASE}/Inscripcion/Confirmar/${salaId}`, { waitUntil: 'networkidle' });
    return;
  }
  const card = locatorSala(page, salaId);
  await card.locator('.btn-reg-sala').first().click();
  await page.waitForURL(/Inscripcion\/Confirmar/, { timeout: 15_000 });
}

async function flujoInscripcionDesdeHome(page, salaHomeId) {
  console.log('\n═══ 1) Inicio → compra evento ═══');
  const found = await buscarSalaGlobal(page, true, salaHomeId);
  if (!found) throw new Error('No hay evento inscribible (crear sala o revisar BD)');
  const { sala, origen } = found;
  await page.goto(`${BASE}/HomeUsuario`, { waitUntil: 'networkidle' });
  await shot(page, '01-home-inicio.png');
  const detalleBtn = page.locator('.btn-ver-sala').first();
  if (await detalleBtn.count()) {
    await detalleBtn.click();
    await page.waitForSelector('#detail-modal-backdrop.open', { timeout: 10_000 });
    await shot(page, '01a-modal-detalle-home.png');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }
  console.log('    SalaId:', sala.id, '| Precio:', sala.j.precio, '| Origen:', origen);
  await irAInscripcionDesdeCard(page, sala.id, origen);
  await shot(page, '01b-confirmacion-evento.png');
  await pasoConfirmar(page);
  const modo = await pasoPagoSiAplica(page, '01');
  console.log('    ✓ Flujo inicio:', modo);
}

async function flujoInscripcionDesdePerfil(page, profId, salaPerfilId) {
  console.log('\n═══ 2) Perfil profesional → Salas → compra ═══');
  await page.goto(`${BASE}/PerfilOrador/Salas/${profId}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#salas-grid', { timeout: 15_000 });
  await shot(page, '02-perfil-salas-tab.png');
  const detalle = page.locator('#salas-grid .btn-ver-sala').first();
  if (await detalle.count()) {
    await detalle.click();
    await page.waitForSelector('#detail-modal-backdrop.open', { timeout: 10_000 });
    await shot(page, '02b-modal-detalle-sala.png');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }
  let found = null;
  if (salaPerfilId) {
    const s = await detalleSala(page, salaPerfilId);
    if (s && !s.j.esInscrito) found = { sala: s, origen: 'perfil' };
  }
  if (!found) found = await buscarSalaGlobal(page, true);
  if (!found || found.sala.j.esInscrito) {
    console.log('    ⚠ Sin sala nueva en perfil — omitiendo segunda compra');
    await shot(page, '02c-ya-inscrito.png');
    return;
  }
  const card = locatorSala(page, found.sala.id);
  if (await card.count()) {
    await card.locator('.btn-reg-sala, .btn-primary').filter({ hasText: /Inscribir/i }).first().click();
    await page.waitForURL(/Inscripcion\/Confirmar/, { timeout: 15_000 });
  } else {
    await page.goto(`${BASE}/Inscripcion/Confirmar/${found.sala.id}`, { waitUntil: 'networkidle' });
  }
  await shot(page, '02d-confirmacion.png');
  await pasoConfirmar(page);
  const modo = await pasoPagoSiAplica(page, '02');
  console.log('    ✓ Flujo perfil salas:', modo);
}

function fechaCitaLibre(diasAdelante, hora) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diasAdelante);
  fecha.setHours(hora, 0, 0, 0);
  return fecha;
}

async function irConfirmarCita(page, profId, fecha) {
  await page.goto(
    `${BASE}/PagoCita/Confirmar?profesionalId=${profId}&fechaHora=${encodeURIComponent(fecha.toISOString())}&duracionMinutos=60`,
    { waitUntil: 'networkidle' }
  );
}

async function confirmarCitaEnHorarioLibre(page, profId) {
  const intentos = [
    [10, 14], [12, 15], [14, 16], [18, 11], [22, 10], [30, 9]
  ];
  for (const [dias, hora] of intentos) {
    await irConfirmarCita(page, profId, fechaCitaLibre(dias, hora));
    try {
      await pasoConfirmar(page);
      return { dias, hora };
    } catch (e) {
      if (!/Confirmación rechazada|horario no disponible/i.test(e.message)) throw e;
      console.log(`    ↻ Ocupado +${dias}d ${hora}:00, probando otra fecha…`);
    }
  }
  throw new Error('No se encontró horario libre para agendar la cita');
}

async function flujoCitaCalendario(page, profId) {
  console.log('\n═══ 3) Calendario → cita privada → pago ═══');
  await page.goto(`${BASE}/PerfilOrador/Calendario/${profId}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#tcal-content', { timeout: 15_000 });
  await shot(page, '03-calendario-vista.png');
  await page.locator('.tcal-vpill[data-view="semanal"]').click().catch(() => {});
  await page.waitForTimeout(600);

  let desdeCalendario = false;
  const slot = page.locator('.tcw-free-slot').first();
  if (await slot.count()) {
    await slot.click();
    await page.waitForURL(/PagoCita\/Confirmar/, { timeout: 15_000 }).catch(() => {});
    if (page.url().includes('PagoCita/Confirmar')) {
      await shot(page, '03a-confirmacion-desde-calendario.png');
      desdeCalendario = true;
      try {
        await pasoConfirmar(page);
        const modo = await pasoPagoSiAplica(page, '03');
        console.log('    ✓ Flujo calendario cita:', modo, '(clic en calendario)');
        return;
      } catch (e) {
        if (!/Confirmación rechazada|horario no disponible/i.test(e.message)) throw e;
        console.log('    ↻ Clic en calendario ocupado al confirmar — buscando fecha libre…');
      }
    }
  }

  await shot(page, '03b-confirmacion-cita.png');
  const { dias, hora } = await confirmarCitaEnHorarioLibre(page, profId);
  const modo = await pasoPagoSiAplica(page, '03');
  console.log('    ✓ Flujo calendario cita:', modo, desdeCalendario ? '(calendario + fecha libre)' : `(fecha +${dias}d ${hora}h)`);
}

(async () => {
  fs.mkdirSync(SS, { recursive: true });
  const salaHomeId = crearSalaPruebaSql('Home');
  const salaPerfilId = crearSalaPruebaSql('Perfil');
  const headless = process.env.HEADLESS !== '0';
  const browser = await chromium.launch({ headless, slowMo: headless ? 0 : 70 });
  const page = await (await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } })).newPage();
  try {
    const health = await page.request.get(`${BASE}/Login`);
    if (health.status() >= 500) throw new Error(`Servidor no disponible (${health.status()})`);
    await login(page);
    await shot(page, '00-login-ok-home.png');
    await flujoInscripcionDesdeHome(page, salaHomeId);
    await flujoInscripcionDesdePerfil(page, PROF_ID, salaPerfilId);
    await flujoCitaCalendario(page, PROF_ID);
    console.log('\n✅ Prueba visual completa OK');
    console.log('📁 Capturas:', SS);
  } catch (e) {
    console.error('\n❌ FALLO:', e.message);
    await shot(page, '99-error.png').catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

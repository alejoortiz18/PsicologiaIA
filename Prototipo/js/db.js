/* ==========================================================================
   TRÉBOL — DB Lite (localStorage)
   Simula una base de datos persistente en el navegador para pruebas
   de funcionamiento del prototipo.

   Cuentas de prueba (login):
     Usuario    → maria@trebol.com       / trebol2026
     Profesional→ profesional@trebol.com / trebol2026
     Admin/Email → alejo@yopmail.com     / trebol2026
   ========================================================================== */

'use strict';

const DB_PREFIX = 'trebol_';

// ==========================================================================
// CORE — Leer y escribir colecciones
// ==========================================================================
const DB = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(DB_PREFIX + key) || 'null');
    } catch { return null; }
  },

  set(key, value) {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
  },

  getList(key) {
    return this.get(key) || [];
  },

  setList(key, list) {
    this.set(key, list);
  },

  addToList(key, item) {
    const list = this.getList(key);
    list.push(item);
    this.setList(key, list);
    return item;
  },

  updateInList(key, id, updates) {
    const list = this.getList(key);
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.setList(key, list);
      return list[idx];
    }
    return null;
  },

  findInList(key, predicate) {
    return this.getList(key).find(predicate) || null;
  },

  filterList(key, predicate) {
    return this.getList(key).filter(predicate);
  },

  newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
};

// ==========================================================================
// SEMILLA — Datos iniciales de demostración
// ==========================================================================
const SEED_VERSION = '1.2';

function seedDatabase() {
  if (DB.get('seed_version') === SEED_VERSION) return; // ya sembrada

  /* ---- CUENTAS CONOCIDAS ---- */
  DB.set('cuentas', [
    {
      id: 'u001', tipo: 'usuario', nombre: 'María García', email: 'maria@trebol.com',
      password: 'trebol2026', estado: 'activo', alias: 'Luna Verde',
      documento: '1023456789', celular: '3001234567', avatar: 'MG'
    },
    {
      id: 'p001', tipo: 'profesional', nombre: 'Dr. Jorge Morales', email: 'profesional@trebol.com',
      password: 'trebol2026', estado: 'activo', tarjeta: 'PSI-0001234',
      documento: '9988776655', celular: '3109876543', avatar: 'JM',
      especialidad: 'Psicología clínica', seguidores: 312, ciudad: 'Bogotá'
    },
    {
      id: 'a001', tipo: 'admin', nombre: 'Alejo (Admin)', email: 'alejo@yopmail.com',
      password: 'trebol2026', estado: 'activo', avatar: 'A'
    }
  ]);

  /* ---- PROFESIONALES DE DEMO ---- */
  DB.setList('profesionales', [
    {
      id: 'p001', nombre: 'Dr. Jorge Morales', email: 'profesional@trebol.com',
      tipo: 'psicologo', especialidad: 'Psicología clínica', estado: 'activo',
      ciudad: 'Bogotá', pais: 'Colombia', seguidores: 312, likes: 89,
      calificacion: 4.9, tarifaHora: 90000, tarjeta: 'PSI-0001234',
      bio: 'Psicólogo clínico con más de 12 años de experiencia en terapia cognitivo-conductual.',
      avatar: 'JM', idiomas: ['Español', 'Inglés'], verificado: true,
      fechaRegistro: '2024-01-15'
    },
    {
      id: 'p002', nombre: 'Dra. Valentina Ríos', email: 'v.rios@correo.com',
      tipo: 'psicologo', especialidad: 'Psicología infantil', estado: 'activo',
      ciudad: 'Medellín', pais: 'Colombia', seguidores: 540, likes: 203,
      calificacion: 4.8, tarifaHora: 85000, tarjeta: 'PSI-0002341',
      bio: 'Especialista en desarrollo infantil y adolescente. 8 años en práctica privada.',
      avatar: 'VR', idiomas: ['Español'], verificado: true,
      fechaRegistro: '2024-03-02'
    },
    {
      id: 'p003', nombre: 'Dr. Andrés Ospina', email: 'a.ospina@correo.com',
      tipo: 'psicologo', especialidad: 'Neuropsicología', estado: 'activo',
      ciudad: 'Cali', pais: 'Colombia', seguidores: 198, likes: 67,
      calificacion: 4.7, tarifaHora: 100000, tarjeta: 'PSI-0003892',
      bio: 'Neuropsicólogo con enfoque en rehabilitación cognitiva y TDAH en adultos.',
      avatar: 'AO', idiomas: ['Español', 'Portugués'], verificado: true,
      fechaRegistro: '2024-05-20'
    },
    {
      id: 'p004', nombre: 'Dra. Camila Suárez', email: 'c.suarez@correo.com',
      tipo: 'especialista', especialidad: 'Psiquiatría', estado: 'activo',
      ciudad: 'Bogotá', pais: 'Colombia', seguidores: 421, likes: 155,
      calificacion: 4.9, tarifaHora: 150000, tarjeta: 'MED-0094512',
      bio: 'Psiquiatra con énfasis en trastornos del ánimo, ansiedad y terapia farmacológica.',
      avatar: 'CS', idiomas: ['Español', 'Inglés', 'Francés'], verificado: true,
      fechaRegistro: '2023-11-08'
    },
    {
      id: 'p005', nombre: 'Dr. Felipe Herrera', email: 'f.herrera@correo.com',
      tipo: 'especialista', especialidad: 'Medicina del sueño', estado: 'activo',
      ciudad: 'Barranquilla', pais: 'Colombia', seguidores: 87, likes: 34,
      calificacion: 4.6, tarifaHora: 120000, tarjeta: 'MED-0041289',
      bio: 'Médico especialista en trastornos del sueño e higiene del sueño en adultos mayores.',
      avatar: 'FH', idiomas: ['Español'], verificado: false,
      fechaRegistro: '2025-01-10'
    },
    {
      id: 'p006', nombre: 'Dra. Lucía Pérez', email: 'l.perez@correo.com',
      tipo: 'psicologo', especialidad: 'Terapia de pareja', estado: 'activo',
      ciudad: 'Bogotá', pais: 'Colombia', seguidores: 267, likes: 98,
      calificacion: 4.8, tarifaHora: 95000, tarjeta: 'PSI-0007123',
      bio: 'Psicóloga con formación en terapia sistémica y trabajo con parejas en crisis.',
      avatar: 'LP', idiomas: ['Español', 'Inglés'], verificado: true,
      fechaRegistro: '2024-07-14'
    },
    {
      id: 'p007', nombre: 'Dr. Sebastián Gómez', email: 's.gomez@correo.com',
      tipo: 'psicologo', especialidad: 'Psicología positiva', estado: 'activo',
      ciudad: 'Pereira', pais: 'Colombia', seguidores: 156, likes: 72,
      calificacion: 4.7, tarifaHora: 75000, tarjeta: 'PSI-0005567',
      bio: 'Psicólogo orientado al bienestar, resiliencia y mindfulness organizacional.',
      avatar: 'SG', idiomas: ['Español'], verificado: true,
      fechaRegistro: '2024-09-03'
    },
    {
      id: 'p008', nombre: 'Dra. Isabel Moreno', email: 'i.moreno@correo.com',
      tipo: 'especialista', especialidad: 'Coaching clínico', estado: 'activo',
      ciudad: 'Bogotá', pais: 'Colombia', seguidores: 389, likes: 211,
      calificacion: 5.0, tarifaHora: 110000, tarjeta: 'PSI-0009001',
      bio: 'Coach clínico certificada con posgrado en neurociencias aplicadas al comportamiento.',
      avatar: 'IM', idiomas: ['Español', 'Inglés'], verificado: true,
      fechaRegistro: '2023-09-22'
    }
  ]);

  /* ---- MENTORES (profesionales seguidos por María / u001) ---- */
  DB.setList('mentores', [
    { usuarioId: 'u001', profesionalId: 'p001', fechaSeguimiento: '2025-03-10' },
    { usuarioId: 'u001', profesionalId: 'p006', fechaSeguimiento: '2025-08-22' },
    { usuarioId: 'u001', profesionalId: 'p008', fechaSeguimiento: '2026-01-05' }
  ]);

  /* ---- NOTIFICACIONES vacías (se llenan cuando se registran profesionales) ---- */
  if (!DB.get('notificaciones')) {
    DB.setList('notificaciones', []);
  }

  DB.set('seed_version', SEED_VERSION);
  console.info('[DB Lite] Base de datos de demostración inicializada ✅');
}

// ==========================================================================
// API — Sesión
// ==========================================================================
const Session = {
  set(cuenta) {
    DB.set('sesion', {
      id: cuenta.id, tipo: cuenta.tipo, nombre: cuenta.nombre,
      email: cuenta.email, avatar: cuenta.avatar || cuenta.nombre.slice(0,2).toUpperCase()
    });
  },
  get() {
    return DB.get('sesion');
  },
  clear() {
    localStorage.removeItem(DB_PREFIX + 'sesion');
  }
};

// ==========================================================================
// API — Autenticación
// ==========================================================================
const Auth = {
  /**
   * Verifica credenciales. Devuelve la cuenta o null.
   */
  login(email, password) {
    const cuentas = DB.getList('cuentas');
    return cuentas.find(c => c.email === email && c.password === password) || null;
  }
};

// ==========================================================================
// API — Usuarios
// ==========================================================================
const Usuarios = {
  getAll()       { return DB.getList('cuentas').filter(c => c.tipo === 'usuario'); },
  findByEmail(e) { return DB.findInList('cuentas', c => c.email === e && c.tipo === 'usuario'); },

  crear({ nombre, email, documento, celular, alias }) {
    const existing = DB.findInList('cuentas', c => c.email === email || c.documento === documento);
    if (existing) return { ok: false, campo: existing.email === email ? 'email' : 'documento' };

    const cuenta = {
      id: DB.newId(), tipo: 'usuario', nombre, email, documento, celular, alias,
      estado: 'pendiente', avatar: nombre.slice(0,2).toUpperCase(),
      fechaRegistro: new Date().toISOString(), password: null
    };
    DB.addToList('cuentas', cuenta);
    return { ok: true, cuenta };
  }
};

// ==========================================================================
// API — Profesionales
// ==========================================================================
const Profesionales = {
  getAll()         { return DB.getList('profesionales'); },
  getPsicologos()  { return DB.filterList('profesionales', p => p.tipo === 'psicologo'); },
  getEspecialistas(){ return DB.filterList('profesionales', p => p.tipo === 'especialista'); },
  findById(id)     { return DB.findInList('profesionales', p => p.id === id); },

  registrar({ nombre, email, documento, celular, tarjeta, tipoProfesional }) {
    const cuentas = DB.getList('cuentas');
    if (cuentas.find(c => c.email === email)) return { ok: false, campo: 'email' };
    if (cuentas.find(c => c.documento === documento)) return { ok: false, campo: 'documento' };

    const profsLista = DB.getList('profesionales');
    if (profsLista.find(p => p.tarjeta === tarjeta)) return { ok: false, campo: 'tarjeta' };

    const id = DB.newId();
    const tipo = tipoProfesional === 'medico' ? 'especialista' : 'psicologo';

    // Crear cuenta
    const cuenta = {
      id, tipo: 'profesional', nombre, email, documento, celular, tarjeta,
      estado: 'pendiente_validacion', avatar: nombre.slice(0,2).toUpperCase(),
      fechaRegistro: new Date().toISOString(), password: null
    };
    DB.addToList('cuentas', cuenta);

    // Crear perfil profesional
    const perfil = {
      id, nombre, email, tipo, especialidad: '',
      estado: 'pendiente_validacion', ciudad: '', pais: 'Colombia',
      seguidores: 0, likes: 0, calificacion: 0, tarifaHora: 0,
      tarjeta, bio: '', avatar: cuenta.avatar, idiomas: ['Español'],
      verificado: false, fechaRegistro: new Date().toISOString()
    };
    DB.addToList('profesionales', perfil);

    // Enviar notificación (email simulado a alejo@yopmail.com)
    Notificaciones.crear({
      tipo: 'registro_profesional',
      asunto: `Nuevo registro profesional — ${nombre}`,
      de: email,
      para: 'alejo@yopmail.com',
      datos: { id, nombre, email, documento, celular, tarjeta, tipoProfesional },
      cuerpo: `
        <p>Se ha recibido una nueva solicitud de registro de profesional:</p>
        <ul>
          <li><strong>Nombre:</strong> ${nombre}</li>
          <li><strong>Correo:</strong> ${email}</li>
          <li><strong>Cédula:</strong> ${documento}</li>
          <li><strong>Celular:</strong> ${celular}</li>
          <li><strong>Tarjeta profesional:</strong> ${tarjeta}</li>
          <li><strong>Tipo:</strong> ${tipoProfesional === 'medico' ? 'Médico / Especialista' : 'Psicólogo / Terapeuta'}</li>
          <li><strong>Documentos adjuntos:</strong> Cédula PDF ✓ · Tarjeta PDF ✓</li>
        </ul>
        <p>La validación ante ${tipoProfesional === 'medico' ? 'ReTHUS' : 'COLPSIC'} está pendiente.</p>
      `
    });

    return { ok: true, cuenta, perfil };
  }
};

// ==========================================================================
// API — Mentores (seguimiento)
// ==========================================================================
const Mentores = {
  /**
   * Devuelve los perfiles completos de los mentores del usuario.
   */
  getMentoresDeUsuario(usuarioId) {
    const relaciones = DB.filterList('mentores', m => m.usuarioId === usuarioId);
    return relaciones.map(r => Profesionales.findById(r.profesionalId)).filter(Boolean);
  },

  seguir(usuarioId, profesionalId) {
    const ya = DB.findInList('mentores', m => m.usuarioId === usuarioId && m.profesionalId === profesionalId);
    if (ya) return false;
    DB.addToList('mentores', { usuarioId, profesionalId, fechaSeguimiento: new Date().toISOString() });
    const prof = Profesionales.findById(profesionalId);
    if (prof) DB.updateInList('profesionales', profesionalId, { seguidores: (prof.seguidores || 0) + 1 });
    return true;
  },

  dejarDeSeguir(usuarioId, profesionalId) {
    const lista = DB.getList('mentores');
    DB.setList('mentores', lista.filter(m => !(m.usuarioId === usuarioId && m.profesionalId === profesionalId)));
    const prof = Profesionales.findById(profesionalId);
    if (prof) DB.updateInList('profesionales', profesionalId, { seguidores: Math.max(0, (prof.seguidores || 1) - 1) });
  },

  esMentor(usuarioId, profesionalId) {
    return !!DB.findInList('mentores', m => m.usuarioId === usuarioId && m.profesionalId === profesionalId);
  }
};

// ==========================================================================
// API — Notificaciones (bandeja alejo@yopmail.com)
// ==========================================================================
const Notificaciones = {
  getAll()       { return DB.getList('notificaciones').sort((a, b) => b.fecha.localeCompare(a.fecha)); },
  getNoLeidas()  { return DB.filterList('notificaciones', n => !n.leido); },
  countNoLeidas(){ return this.getNoLeidas().length; },

  crear({ tipo, asunto, de, para, cuerpo, datos = {} }) {
    const notif = {
      id: DB.newId(), tipo, asunto, de, para, cuerpo, datos,
      fecha: new Date().toISOString(), leido: false
    };
    return DB.addToList('notificaciones', notif);
  },

  marcarLeida(id) {
    DB.updateInList('notificaciones', id, { leido: true });
  },

  marcarTodasLeidas() {
    const lista = DB.getList('notificaciones').map(n => ({ ...n, leido: true }));
    DB.setList('notificaciones', lista);
  },

  aprobar(notifId) {
    const notif = DB.findInList('notificaciones', n => n.id === notifId);
    if (!notif || notif.tipo !== 'registro_profesional') return;
    DB.updateInList('profesionales', notif.datos.id, { estado: 'activo', verificado: true });
    DB.updateInList('cuentas', notif.datos.id, { estado: 'activo' });
    DB.updateInList('notificaciones', notifId, { leido: true, aprobado: true });
  }
};

// ==========================================================================
// Helpers de UI reutilizables
// ==========================================================================

/**
 * Renderiza una tarjeta de profesional estándar.
 */
function renderProfCard(prof, usuarioId = 'u001') {
  const esMentor = Mentores.esMentor(usuarioId, prof.id);
  const stars = '★'.repeat(Math.round(prof.calificacion)) + '☆'.repeat(5 - Math.round(prof.calificacion));
  const badgeTipo = prof.tipo === 'psicologo'
    ? '<span class="badge badge-accent">Psicólogo</span>'
    : '<span class="badge badge-warning">Especialista</span>';
  const verificadoBadge = prof.verificado ? '<span class="badge badge-success" title="Verificado por Trébol">✓ Verificado</span>' : '';

  return `
    <div class="prof-card" data-prof-id="${prof.id}">
      <div class="prof-card__avatar">${prof.avatar}</div>
      <div class="prof-card__body">
        <div class="prof-card__header">
          <div>
            <div class="prof-card__name">${prof.nombre}</div>
            <div class="prof-card__specialty">${prof.especialidad || 'Psicología general'}</div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
            ${badgeTipo}${verificadoBadge}
          </div>
        </div>
        <div class="prof-card__meta">
          <span>📍 ${prof.ciudad || 'Colombia'}</span>
          <span>${stars} ${prof.calificacion.toFixed(1)}</span>
          <span>👥 ${prof.seguidores} seguidores</span>
          ${prof.tarifaHora ? `<span>💰 $${prof.tarifaHora.toLocaleString('es-CO')} / hora</span>` : ''}
        </div>
        ${prof.bio ? `<p class="prof-card__bio">${prof.bio.slice(0, 100)}…</p>` : ''}
        <div class="prof-card__actions">
          <a href="perfil-orador.html" class="btn btn-secondary btn-sm">Ver perfil</a>
          <button class="btn btn-sm ${esMentor ? 'btn-mentor-active' : 'btn-primary'}"
            onclick="toggleMentor('${prof.id}', this)"
            aria-pressed="${esMentor}">
            ${esMentor ? '✓ Siguiendo' : '+ Seguir'}
          </button>
          <button class="btn btn-ghost btn-sm"
            data-pm-name="${prof.nombre}"
            data-pm-avatar="${prof.avatar.slice(0, 2).toUpperCase()}"
            data-pm-bg="var(--color-primary)"
            aria-label="Enviar mensaje a ${prof.nombre}">
            💬 Msg
          </button>
        </div>
      </div>
    </div>`;
}

/**
 * Alterna seguimiento (mentor) desde cualquier página.
 */
function toggleMentor(profesionalId, btn) {
  const sesion = Session.get();
  const usuarioId = sesion?.id || 'u001';
  const esMentor = Mentores.esMentor(usuarioId, profesionalId);

  if (esMentor) {
    Mentores.dejarDeSeguir(usuarioId, profesionalId);
    btn.textContent = '+ Seguir';
    btn.classList.replace('btn-mentor-active', 'btn-primary');
    btn.setAttribute('aria-pressed', 'false');
    if (typeof showToast !== 'undefined') showToast({ title: 'Dejaste de seguir a este profesional', type: 'info' });
  } else {
    Mentores.seguir(usuarioId, profesionalId);
    btn.textContent = '✓ Siguiendo';
    btn.classList.replace('btn-primary', 'btn-mentor-active');
    btn.setAttribute('aria-pressed', 'true');
    if (typeof showToast !== 'undefined') showToast({ title: 'Ahora sigues a este profesional', type: 'success' });
  }
}

// ==========================================================================
// INIT — sembrar datos al cargar
// ==========================================================================
seedDatabase();

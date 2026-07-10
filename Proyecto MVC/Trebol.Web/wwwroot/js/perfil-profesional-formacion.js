(function () {
  'use strict';

  const token = document.querySelector('[name=__RequestVerificationToken]')?.value ?? '';
  const estudiosList = document.getElementById('prof-estudios-list');
  const idiomasList = document.getElementById('prof-idiomas-list');
  if (!estudiosList && !idiomasList) return;

  const nivelEstudioLabels = {
    Pregrado: 'Pregrado',
    Posgrado: 'Posgrado',
    Maestria: 'Maestría',
    Doctorado: 'Doctorado',
    Especializacion: 'Especialización'
  };

  const nivelIdiomaLabels = {
    Basico: 'Básico',
    Intermedio: 'Intermedio',
    Avanzado: 'Avanzado',
    Nativo: 'Nativo'
  };

  function toast(title, type) {
    if (typeof showToast === 'function') showToast({ title, type });
    else alert(title);
  }

  async function postJson(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RequestVerificationToken': token
      },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  function readEstudioEntry(entry) {
    return {
      estudioId: parseInt(entry.dataset.estudioId || '0', 10) || null,
      nivel: entry.querySelector('[data-field="nivel"]')?.value ?? '',
      titulo: entry.querySelector('[data-field="titulo"]')?.value?.trim() ?? '',
      universidad: entry.querySelector('[data-field="universidad"]')?.value?.trim() ?? '',
      anoEgreso: entry.querySelector('[data-field="ano"]')?.value
        ? parseInt(entry.querySelector('[data-field="ano"]').value, 10)
        : null
    };
  }

  function nivelEstudioOptions(selected) {
    return Object.entries(nivelEstudioLabels).map(([value, label]) =>
      `<option value="${value}"${value === selected ? ' selected' : ''}>${label}</option>`
    ).join('');
  }

  function createEstudioEntry(data) {
    const entry = document.createElement('div');
    entry.className = 'prof-estudio-entry';
    if (data?.estudioId) entry.dataset.estudioId = String(data.estudioId);

    entry.innerHTML = `
      <div class="form-group">
        <label class="form-label">Tipo</label>
        <select class="form-control" data-field="nivel">${nivelEstudioOptions(data?.nivel || 'Pregrado')}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Título</label>
        <input type="text" class="form-control" data-field="titulo" maxlength="300"
               value="${escapeAttr(data?.titulo || '')}" placeholder="Ej: Psicólogo" />
      </div>
      <div class="form-group">
        <label class="form-label">Institución</label>
        <input type="text" class="form-control" data-field="universidad" maxlength="300"
               value="${escapeAttr(data?.universidad || '')}" placeholder="Ej: U. Nacional" />
      </div>
      <div class="form-group">
        <label class="form-label">Año</label>
        <input type="number" class="form-control" data-field="ano" min="1950" max="2100"
               value="${data?.anoEgreso ?? ''}" placeholder="2020" />
      </div>
      <div class="prof-estudio-entry__actions">
        <button type="button" class="btn btn-secondary btn-sm" data-action="guardar-estudio">Guardar</button>
        <button type="button" class="btn btn-ghost btn-sm" data-action="eliminar-estudio"
                style="color:var(--color-danger);" aria-label="Eliminar">🗑</button>
      </div>`;

    entry.querySelector('[data-action="guardar-estudio"]')?.addEventListener('click', () => guardarEstudio(entry));
    entry.querySelector('[data-action="eliminar-estudio"]')?.addEventListener('click', () => eliminarEstudio(entry));
    return entry;
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  async function guardarEstudio(entry) {
    const d = readEstudioEntry(entry);
    if (!d.titulo || !d.universidad || !d.nivel) {
      toast('Completa tipo, título e institución.', 'error');
      return;
    }

    const payload = {
      estudioId: d.estudioId,
      titulo: d.titulo,
      universidad: d.universidad,
      anoEgreso: d.anoEgreso,
      nivel: d.nivel
    };

    const esNuevo = !d.estudioId;
    const data = esNuevo
      ? await postJson('/PerfilProfesional/CrearEstudio', payload)
      : await postJson('/PerfilProfesional/ActualizarEstudio', payload);

    toast(data.mensaje || (data.exito ? 'Guardado' : 'Error'), data.exito ? 'success' : 'error');
    if (data.exito && esNuevo && data.estudioId) {
      entry.dataset.estudioId = String(data.estudioId);
    }
  }

  async function eliminarEstudio(entry) {
    const id = parseInt(entry.dataset.estudioId || '0', 10);
    if (!id) {
      entry.remove();
      return;
    }
    if (!confirm('¿Eliminar esta formación académica?')) return;

    const body = new URLSearchParams();
    body.set('estudioId', String(id));
    if (token) body.set('__RequestVerificationToken', token);

    const res = await fetch('/PerfilProfesional/EliminarEstudio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'RequestVerificationToken': token
      },
      body: body.toString()
    });
    const data = await res.json();
    toast(data.mensaje || '', data.exito ? 'success' : 'error');
    if (data.exito) entry.remove();
  }

  document.getElementById('prof-estudio-agregar')?.addEventListener('click', () => {
    estudiosList?.appendChild(createEstudioEntry(null));
    estudiosList?.lastElementChild?.querySelector('[data-field="titulo"]')?.focus();
  });

  estudiosList?.querySelectorAll('.prof-estudio-entry').forEach(entry => {
    entry.querySelector('[data-action="guardar-estudio"]')
      ?.addEventListener('click', () => guardarEstudio(entry));
    entry.querySelector('[data-action="eliminar-estudio"]')
      ?.addEventListener('click', () => eliminarEstudio(entry));
  });

  function renderIdiomaItem(idiomaId, nombre, nivel) {
    const item = document.createElement('div');
    item.className = 'prof-idioma-item';
    item.dataset.idiomaId = String(idiomaId);
    const nivelTxt = nivelIdiomaLabels[nivel] || nivel;
    item.innerHTML = `
      <span class="prof-idioma-item__text"><strong>${escapeAttr(nombre)}</strong> · ${escapeAttr(nivelTxt)}</span>
      <button type="button" class="btn btn-ghost btn-sm" data-action="eliminar-idioma"
              style="color:var(--color-danger);" aria-label="Eliminar idioma">🗑</button>`;
    item.querySelector('[data-action="eliminar-idioma"]')
      ?.addEventListener('click', () => eliminarIdioma(item));
    return item;
  }

  async function agregarIdioma() {
    const selIdioma = document.getElementById('prof-idioma-select');
    const selNivel = document.getElementById('prof-idioma-nivel');
    const idiomaId = parseInt(selIdioma?.value || '0', 10);
    const nivel = selNivel?.value ?? '';
    if (!idiomaId) {
      toast('Selecciona un idioma.', 'error');
      return;
    }
    if (idiomasList?.querySelector(`[data-idioma-id="${idiomaId}"]`)) {
      toast('Ese idioma ya está en tu perfil. Puedes eliminarlo y volver a agregarlo con otro nivel.', 'error');
      return;
    }

    const data = await postJson('/PerfilProfesional/GuardarIdioma', { idiomaId, nivel });
    toast(data.mensaje || '', data.exito ? 'success' : 'error');
    if (!data.exito) return;

    const nombre = selIdioma.options[selIdioma.selectedIndex].text;
    idiomasList?.appendChild(renderIdiomaItem(idiomaId, nombre, nivel));
    document.getElementById('prof-idiomas-vacio')?.remove();
    selIdioma.value = '';
    const opt = selIdioma.querySelector(`option[value="${idiomaId}"]`);
    opt?.remove();
  }

  async function eliminarIdioma(item) {
    const idiomaId = parseInt(item.dataset.idiomaId || '0', 10);
    if (!idiomaId) return;
    if (!confirm('¿Eliminar este idioma de tu perfil?')) return;

    const body = new URLSearchParams();
    body.set('idiomaId', String(idiomaId));
    if (token) body.set('__RequestVerificationToken', token);

    const res = await fetch('/PerfilProfesional/EliminarIdioma', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'RequestVerificationToken': token
      },
      body: body.toString()
    });
    const data = await res.json();
    toast(data.mensaje || '', data.exito ? 'success' : 'error');
    if (data.exito) item.remove();
  }

  document.getElementById('prof-idioma-agregar')?.addEventListener('click', agregarIdioma);
  idiomasList?.querySelectorAll('.prof-idioma-item').forEach(item => {
    item.querySelector('[data-action="eliminar-idioma"]')
      ?.addEventListener('click', () => eliminarIdioma(item));
  });
})();

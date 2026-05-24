(function () {
  'use strict';

  const backdrop = document.getElementById('nueva-sala-backdrop');
  const form = document.getElementById('nueva-sala-form');
  if (!backdrop || !form) return;

  const erroresEl = document.getElementById('nueva-sala-errores');
  const submitBtn = document.getElementById('nueva-sala-submit');
  const token = document.querySelector('[name=__RequestVerificationToken]')?.value ?? '';

  function resetForm() {
    form.reset();
    const cap = document.getElementById('nueva-sala-capacidad');
    if (cap) cap.value = '100';
    const dur = document.getElementById('nueva-sala-duracion');
    if (dur) dur.value = '120';
    const precio = document.getElementById('nueva-sala-precio');
    if (precio) precio.value = '0';
    if (erroresEl) {
      erroresEl.style.display = 'none';
      erroresEl.textContent = '';
    }
  }

  function setDefaultFechaHora() {
    const fecha = document.getElementById('nueva-sala-fecha');
    const hora = document.getElementById('nueva-sala-hora');
    const now = new Date();
    now.setMinutes(now.getMinutes() + 60 - (now.getMinutes() % 15));
    if (fecha) {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      fecha.value = `${y}-${m}-${d}`;
    }
    if (hora) {
      const h = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      hora.value = `${h}:${min}`;
    }
  }

  function abrirModal() {
    resetForm();
    setDefaultFechaHora();
    if (typeof openModal === 'function') openModal('nueva-sala');
  }

  document.querySelectorAll('[data-open-nueva-sala]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      abrirModal();
    });
  });

  backdrop.querySelectorAll('[data-close-modal="nueva-sala"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof closeModal === 'function') closeModal('nueva-sala');
    });
  });

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop && typeof closeModal === 'function') closeModal('nueva-sala');
  });

  function buildFechaInicio() {
    const fecha = document.getElementById('nueva-sala-fecha')?.value;
    const hora = document.getElementById('nueva-sala-hora')?.value;
    if (!fecha || !hora) return null;
    return `${fecha}T${hora}:00`;
  }

  submitBtn?.addEventListener('click', async () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const fechaInicio = buildFechaInicio();
    if (!fechaInicio) {
      if (erroresEl) {
        erroresEl.textContent = 'Indica fecha y hora de inicio.';
        erroresEl.style.display = 'block';
      }
      return;
    }

    const body = new URLSearchParams();
    body.set('Titulo', document.getElementById('nueva-sala-titulo')?.value?.trim() ?? '');
    body.set('Descripcion', document.getElementById('nueva-sala-descripcion')?.value?.trim() ?? '');
    body.set('Tipo', document.getElementById('nueva-sala-tipo')?.value ?? '1');
    body.set('Capacidad', document.getElementById('nueva-sala-capacidad')?.value ?? '100');
    body.set('FechaInicio', fechaInicio);
    body.set('DuracionMinutos', document.getElementById('nueva-sala-duracion')?.value ?? '120');
    body.set('Precio', document.getElementById('nueva-sala-precio')?.value ?? '0');
    if (token) body.set('__RequestVerificationToken', token);

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      const res = await fetch('/Salas/CrearAjax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'RequestVerificationToken': token
        },
        body: body.toString()
      });
      const data = await res.json();

      if (data.exito) {
        if (typeof closeModal === 'function') closeModal('nueva-sala');
        if (typeof showToast === 'function') {
          showToast({ title: data.mensaje || 'Sala creada', type: 'success' });
        }
        setTimeout(() => { window.location.reload(); }, 400);
      } else {
        const msg = data.mensaje || (data.errores && data.errores[0]) || 'No se pudo crear la sala.';
        if (erroresEl) {
          erroresEl.textContent = msg;
          erroresEl.style.display = 'block';
        }
        if (typeof showToast === 'function') {
          showToast({ title: msg, type: 'error' });
        }
      }
    } catch {
      const msg = 'Error de conexión al crear la sala.';
      if (erroresEl) {
        erroresEl.textContent = msg;
        erroresEl.style.display = 'block';
      }
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
})();

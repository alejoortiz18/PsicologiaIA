/**
 * Mi perfil usuario: tabs, guardado con confirmación, búsqueda eventos.
 */
(function () {
  'use strict';

  const form = document.getElementById('profile-form');
  const saveBtn = document.getElementById('save-btn');
  const confirmBtn = document.getElementById('confirm-save-btn');
  const aliasInput = document.getElementById('edit-alias');
  const celularInput = document.getElementById('edit-celular');
  const buscarEvento = document.getElementById('buscar-evento-perfil');

  function hayCambios() {
    const aliasChanged = aliasInput && aliasInput.value.trim() !== (aliasInput.dataset.original || '').trim();
    const celularChanged = celularInput && celularInput.value.trim() !== (celularInput.dataset.original || '').trim();
    return aliasChanged || celularChanged;
  }

  function actualizarBotonGuardar() {
    if (!saveBtn) return;
    const dirty = hayCambios();
    saveBtn.disabled = !dirty;
    saveBtn.setAttribute('aria-disabled', dirty ? 'false' : 'true');
  }

  [aliasInput, celularInput].forEach(el => {
    el?.addEventListener('input', actualizarBotonGuardar);
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!hayCambios()) return;
    if (typeof openModal === 'function') openModal('save-confirm');
  });

  confirmBtn?.addEventListener('click', () => {
    if (typeof closeModal === 'function') closeModal('save-confirm');
    if (!form) return;
    saveBtn?.classList.add('loading');
    if (saveBtn) saveBtn.disabled = true;
    form.submit();
  });

  document.querySelectorAll('[data-close-modal="save-confirm"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof closeModal === 'function') closeModal('save-confirm');
      actualizarBotonGuardar();
    });
  });

  buscarEvento?.addEventListener('input', () => {
    const q = buscarEvento.value.trim().toLowerCase();
    document.querySelectorAll('#tabla-eventos-perfil tbody tr[data-search]').forEach(row => {
      const match = !q || (row.dataset.search || '').includes(q);
      row.style.display = match ? '' : 'none';
    });
  });

  actualizarBotonGuardar();

  const btnRetirar = document.getElementById('btn-retirar-saldo');
  const confirmRetiroBtn = document.getElementById('confirm-retiro-btn');
  const cfg = window.perfilUsuarioFinanciero || {};

  function formatCop(value) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);
  }

  btnRetirar?.addEventListener('click', () => {
    const saldo = parseFloat(btnRetirar.dataset.saldo || '0');
    const comisionPct = parseFloat(btnRetirar.dataset.comision || '0');
    const cuentaCompleta = btnRetirar.dataset.cuentaCompleta === 'true';

    if (saldo <= 0) return;

    if (!cuentaCompleta) {
      if (typeof showToast === 'function') {
        showToast({
          title: 'Datos bancarios',
          message: 'Completa tus datos bancarios en Información personal antes de retirar.',
          type: 'warning'
        });
      }
      return;
    }

    const comision = Math.round(saldo * comisionPct / 100);
    const neto = saldo - comision;
    const brutoEl = document.getElementById('retiro-monto-bruto');
    const comisionEl = document.getElementById('retiro-comision');
    const netoEl = document.getElementById('retiro-monto-neto');
    if (brutoEl) brutoEl.textContent = formatCop(saldo);
    if (comisionEl) comisionEl.textContent = `${formatCop(comision)} (${comisionPct} %)`;
    if (netoEl) netoEl.textContent = formatCop(neto);

    if (typeof openModal === 'function') openModal('retiro-confirm');
  });

  confirmRetiroBtn?.addEventListener('click', async () => {
    if (!cfg.solicitarRetiroUrl) return;
    confirmRetiroBtn.disabled = true;
    confirmRetiroBtn.classList.add('loading');
    try {
      const body = new URLSearchParams();
      body.append('__RequestVerificationToken', cfg.token || '');
      const res = await fetch(cfg.solicitarRetiroUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
        body: body.toString()
      });
      const data = await res.json();
      if (typeof closeModal === 'function') closeModal('retiro-confirm');
      if (typeof showToast === 'function') {
        showToast({
          title: data.exito ? 'Retiro solicitado' : 'No se pudo retirar',
          message: data.mensaje || '',
          type: data.exito ? 'success' : 'error'
        });
      }
      if (data.exito) window.location.href = window.location.pathname + '?tab=saldos';
    } catch {
      if (typeof showToast === 'function') {
        showToast({ title: 'Error', message: 'No se pudo procesar el retiro.', type: 'error' });
      }
    } finally {
      confirmRetiroBtn.disabled = false;
      confirmRetiroBtn.classList.remove('loading');
    }
  });

  document.querySelectorAll('.btn-retractar-retiro').forEach(btn => {
    btn.addEventListener('click', async () => {
      const movimientoId = btn.dataset.movimientoId;
      if (!movimientoId || !cfg.retractarRetiroUrl) return;
      btn.disabled = true;
      try {
        const body = new URLSearchParams();
        body.append('__RequestVerificationToken', cfg.token || '');
        body.append('movimientoId', movimientoId);
        const res = await fetch(cfg.retractarRetiroUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
          body: body.toString()
        });
        const data = await res.json();
        if (typeof showToast === 'function') {
          showToast({
            title: data.exito ? 'Retiro cancelado' : 'Atención',
            message: data.mensaje || '',
            type: data.exito ? 'success' : 'error'
          });
        }
        if (data.exito) window.location.reload();
      } finally {
        btn.disabled = false;
      }
    });
  });
})();

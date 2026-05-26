(function () {
  'use strict';

  const MODAL_ID = 'cita-detalle';
  const bodyEl = document.getElementById('cita-detalle-body');
  const subtitleEl = document.getElementById('cita-detalle-subtitle');

  if (!bodyEl) return;

  async function abrirDetalleCita(citaId) {
    bodyEl.innerHTML = '<p class="text-meta" style="margin:0;">Cargando…</p>';
    if (subtitleEl) subtitleEl.textContent = '';
    if (typeof openModal === 'function') openModal(MODAL_ID);

    try {
      const res = await fetch(`/Citas/DetalleModal/${citaId}`, {
        headers: { Accept: 'text/html' }
      });
      if (!res.ok) throw new Error('No encontrada');
      bodyEl.innerHTML = await res.text();
      const prof = bodyEl.querySelector('.cita-detalle-profesional');
      if (subtitleEl && prof) subtitleEl.textContent = prof.textContent.trim();
    } catch {
      bodyEl.innerHTML = '<p role="alert" style="margin:0;color:var(--color-danger);">No se pudo cargar el detalle de la cita.</p>';
    }
  }

  document.querySelectorAll('[data-cita-detalle]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.getAttribute('data-cita-id');
      if (id) abrirDetalleCita(id);
    });
  });
})();

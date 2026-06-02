(function () {
  'use strict';

  const MODAL_ID = 'cita-detalle';

  function getBackdrop() {
    return document.getElementById(MODAL_ID + '-backdrop');
  }

  function getBodyEl() {
    return document.getElementById('cita-detalle-body');
  }

  function getSubtitleEl() {
    return document.getElementById('cita-detalle-subtitle');
  }

  function showModal() {
    if (typeof openModal === 'function') {
      openModal(MODAL_ID);
      return;
    }
    const backdrop = getBackdrop();
    if (backdrop) {
      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  async function abrirDetalleCita(citaId) {
    const bodyEl = getBodyEl();
    const subtitleEl = getSubtitleEl();
    if (!bodyEl) {
      console.error('[cita-detalle] No se encontró #cita-detalle-body en la página.');
      return;
    }

    bodyEl.innerHTML = '<p class="text-meta" style="margin:0;">Cargando…</p>';
    if (subtitleEl) subtitleEl.textContent = '';
    showModal();

    try {
      const res = await fetch(`/Citas/DetalleModal/${encodeURIComponent(citaId)}`, {
        headers: { Accept: 'text/html' },
        credentials: 'same-origin'
      });
      if (!res.ok) throw new Error('No encontrada');
      bodyEl.innerHTML = await res.text();
      const prof = bodyEl.querySelector('.cita-detalle-profesional');
      if (subtitleEl && prof) subtitleEl.textContent = prof.textContent.trim();
    } catch {
      bodyEl.innerHTML = '<p role="alert" style="margin:0;color:var(--color-danger);">No se pudo cargar el detalle de la cita.</p>';
    }
  }

  function onDocumentClick(e) {
    const btn = e.target.closest('[data-cita-detalle]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.getAttribute('data-cita-id');
    if (id) abrirDetalleCita(id);
  }

  function init() {
    document.addEventListener('click', onDocumentClick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.abrirDetalleCita = abrirDetalleCita;
})();

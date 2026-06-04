(function () {
  'use strict';

  const MODAL_ID = 'cita-detalle';

  function getBackdrop() {
    return document.getElementById(MODAL_ID + '-backdrop');
  }

  function getBodyEl() {
    return document.getElementById('cita-detalle-body');
  }

  function getTitleEl() {
    return document.getElementById('cita-detalle-title');
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

  function escHtml(s) {
    const el = document.createElement('div');
    el.textContent = s || '';
    return el.innerHTML;
  }

  function formatearFecha(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return '—';
    }
  }

  function etiquetaEstado(estado) {
    const e = (estado || '').toUpperCase();
    if (e === 'PROGRAMADA') return 'Programada';
    if (e === 'MOVIDA') return 'Reprogramada';
    if (e === 'FINALIZADA') return 'Finalizada';
    if (e === 'CANCELADA') return 'Cancelada';
    if (e === 'ABIERTO') return 'Abierto';
    if (e === 'CERRADO') return 'Cerrado';
    return estado || '—';
  }

  async function abrirDetalleCita(citaId) {
    const bodyEl = getBodyEl();
    const subtitleEl = getSubtitleEl();
    const titleEl = getTitleEl();
    if (!bodyEl) {
      console.error('[cita-detalle] No se encontró #cita-detalle-body en la página.');
      return;
    }

    if (titleEl) titleEl.textContent = 'Detalle de cita';
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
      const cliente = bodyEl.querySelector('.cita-detalle-cliente');
      if (subtitleEl) {
        subtitleEl.textContent = (cliente || prof)?.textContent?.trim() || '';
      }
    } catch {
      bodyEl.innerHTML = '<p role="alert" style="margin:0;color:var(--color-danger);">No se pudo cargar el detalle de la cita.</p>';
    }
  }

  function abrirDetalleEventoCalendario(meta) {
    const bodyEl = getBodyEl();
    const subtitleEl = getSubtitleEl();
    const titleEl = getTitleEl();
    if (!bodyEl || !meta) return;

    if (titleEl) titleEl.textContent = 'Detalle del evento';
    if (subtitleEl) subtitleEl.textContent = meta.etiqueta || '';

    const dur = meta.duracionMinutos || 60;
    const tipoEv = meta.subtitulo ? meta.subtitulo.split('·')[0].trim() : 'Evento público';

    bodyEl.innerHTML = `
      <div class="cita-detalle-modal">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-3);margin-bottom:var(--sp-4);">
          <span class="badge badge-success">${escHtml(etiquetaEstado(meta.estadoCita))}</span>
          <span class="text-meta">Evento #${escHtml(String(meta.refId || ''))}</span>
        </div>
        <div style="display:grid;grid-template-columns:minmax(120px,38%) 1fr;gap:var(--sp-3) var(--sp-4);font-size:.9rem;">
          <div style="font-weight:600;color:var(--color-text-muted);">Nombre</div>
          <div style="font-weight:600;color:var(--color-text-primary);">${escHtml(meta.etiqueta)}</div>
          <div style="font-weight:600;color:var(--color-text-muted);">Tipo</div>
          <div>${escHtml(tipoEv)}</div>
          <div style="font-weight:600;color:var(--color-text-muted);">Inicio</div>
          <div>${escHtml(formatearFecha(meta.fechaHora))}</div>
          <div style="font-weight:600;color:var(--color-text-muted);">Duración</div>
          <div>${dur} min</div>
          <div style="font-weight:600;color:var(--color-text-muted);">Estado</div>
          <div>${escHtml(etiquetaEstado(meta.estadoCita))}</div>
        </div>
      </div>`;
    showModal();
  }

  function onDocumentClick(e) {
    const btn = e.target.closest('[data-cita-detalle]');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-cita-id');
      if (id) abrirDetalleCita(id);
      return;
    }

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
  window.abrirDetalleEventoCalendario = abrirDetalleEventoCalendario;
})();

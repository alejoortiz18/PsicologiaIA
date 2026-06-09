/**
 * Conferencia: cuenta regresiva hasta el fin efectivo del evento en el header.
 */
(function () {
  'use strict';

  const cfg = window.confEventoHorario;
  const el = document.getElementById('conf-horario-countdown');
  if (!cfg || !el) return;

  const finMs = cfg.fechaFinEfectiva ? new Date(cfg.fechaFinEfectiva).getTime() : NaN;

  function formatearRestante(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function actualizar() {
    if (!Number.isFinite(finMs)) {
      el.textContent = '—';
      return;
    }
    const restante = finMs - Date.now();
    if (restante <= 0) {
      el.textContent = '00:00:00';
      el.setAttribute('aria-label', 'Evento finalizado');
      return;
    }
    el.textContent = formatearRestante(restante);
    el.setAttribute('aria-label', `Termina en ${el.textContent}`);
  }

  actualizar();
  setInterval(actualizar, 1000);
})();

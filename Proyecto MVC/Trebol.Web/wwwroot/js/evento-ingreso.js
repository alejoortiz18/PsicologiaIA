/**
 * Ingreso a eventos inscritos: validación 3 min antes + cuenta regresiva.
 */
(function () {
  'use strict';

  const MINUTOS_ANTES = 3;
  const MS_ANTES = MINUTOS_ANTES * 60 * 1000;
  let countdownTimer = null;

  function parseDate(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function eventoFinalizado(inicio, fin) {
    const ahora = Date.now();
    if (fin && fin.getTime() < ahora) return true;
    return false;
  }

  function msHastaInicio(inicio) {
    if (!inicio) return 0;
    return inicio.getTime() - Date.now();
  }

  function fmtCountdown(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function textoMinutosRestantes(ms) {
    const min = Math.max(1, Math.ceil(ms / 60000));
    return min === 1
      ? 'Este evento comenzará en 1 minuto'
      : `Este evento comenzará en ${min} minutos`;
  }

  function abrirModal(id) {
    if (typeof openModal === 'function') openModal(id);
  }

  function cerrarModal(id) {
    if (typeof closeModal === 'function') closeModal(id);
  }

  function limpiarCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function iniciarCountdown(inicio, url) {
    limpiarCountdown();
    const clock = document.getElementById('ingreso-countdown-clock');
    const msg = document.getElementById('ingreso-countdown-msg');
    if (!clock || !msg) {
      window.location.href = url;
      return;
    }

    const tick = () => {
      const ms = msHastaInicio(inicio);
      clock.textContent = fmtCountdown(ms);
      msg.textContent = ms > 0 ? textoMinutosRestantes(ms) : 'Ingresando al evento…';
      if (ms <= 0) {
        limpiarCountdown();
        cerrarModal('ingreso-countdown');
        window.location.href = url;
      }
    };

    tick();
    abrirModal('ingreso-countdown');
    countdownTimer = setInterval(tick, 1000);
  }

  function manejarIngreso(btn) {
    const url = btn.dataset.url;
    const inicio = parseDate(btn.dataset.fechaInicio);
    const fin = parseDate(btn.dataset.fechaFin);

    if (!url) return;

    if (eventoFinalizado(inicio, fin)) {
      if (typeof showToast === 'function') {
        showToast({ title: 'Evento finalizado', message: 'Este evento ya terminó.', type: 'info' });
      }
      return;
    }

    const ms = msHastaInicio(inicio);

    if (ms > MS_ANTES) {
      abrirModal('ingreso-temprano');
      return;
    }

    if (ms > 0) {
      iniciarCountdown(inicio, url);
      return;
    }

    window.location.href = url;
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-ingresar-evento');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    manejarIngreso(btn);
  });
})();

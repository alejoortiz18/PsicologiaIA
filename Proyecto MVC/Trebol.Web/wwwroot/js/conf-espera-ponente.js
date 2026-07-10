/**
 * Conferencia asistente: cuenta regresiva 5 min hasta ingreso del ponente + modal de novedad.
 */
(function () {
  'use strict';

  const cfg = window.confEsperaPonente;
  if (!cfg || !cfg.salaId) return;

  const salaId = parseInt(cfg.salaId, 10);
  const overlay = document.getElementById('conf-espera-overlay');
  const countdownEl = document.getElementById('conf-espera-countdown');
  const graciaMin = parseInt(cfg.minutosGracia || '5', 10);
  let finGraciaMs = null;
  let tickTimer = null;
  let pollPresencia = null;
  let modalMostrado = false;

  function ocultarEspera() {
    if (overlay) overlay.hidden = true;
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
    if (pollPresencia) { clearInterval(pollPresencia); pollPresencia = null; }
  }

  function formatearCountdown(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function actualizarCountdown() {
    if (!countdownEl || finGraciaMs === null) return;
    const restante = finGraciaMs - Date.now();
    countdownEl.textContent = formatearCountdown(restante);
    if (restante <= 0) {
      if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
      evaluarInasistencia();
    }
  }

  async function consultarPresencia() {
    try {
      const res = await fetch(`/Conferencia/PresenciaProfesional?salaId=${salaId}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const data = await res.json();
      if (data.profesionalPresente) {
        ocultarEspera();
        if (typeof showToast === 'function') {
          showToast({ title: 'Ponente conectado', message: 'La conferencia ha comenzado.', type: 'success' });
        }
        return true;
      }
    } catch { /* silencioso */ }
    return false;
  }

  async function evaluarInasistencia() {
    if (modalMostrado) return;
    try {
      const res = await fetch(`/Conferencia/EvaluarInasistencia?salaId=${salaId}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const data = await res.json();
      if (data.profesionalPresente) {
        ocultarEspera();
        return;
      }
      if (data.requiereModal && data.novedad && typeof window.showNovedadModal === 'function') {
        modalMostrado = true;
        ocultarEspera();
        window.showNovedadModal(data.novedad);
      }
    } catch { /* silencioso */ }
  }

  function iniciarEspera(extraMinutos, desdeAhora) {
    modalMostrado = false;
    const minutos = typeof extraMinutos === 'number' ? extraMinutos : graciaMin;

    if (desdeAhora) {
      finGraciaMs = Date.now() + minutos * 60 * 1000;
    } else {
      const inicio = cfg.fechaInicio ? new Date(cfg.fechaInicio) : new Date();
      finGraciaMs = inicio.getTime() + minutos * 60 * 1000;
      if (Date.now() >= finGraciaMs) {
        evaluarInasistencia();
        return;
      }
    }

    if (overlay) overlay.hidden = false;
    actualizarCountdown();
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(actualizarCountdown, 1000);

    if (pollPresencia) clearInterval(pollPresencia);
    pollPresencia = setInterval(consultarPresencia, 5000);
  }

  window.iniciarEsperaPonenteConferencia = function (minutosExtra) {
    iniciarEspera(typeof minutosExtra === 'number' ? minutosExtra : graciaMin, true);
  };

  document.addEventListener('DOMContentLoaded', async () => {
    if (cfg.profesionalPresente === true || cfg.profesionalPresente === 'true') return;

    const yaPresente = await consultarPresencia();
    if (!yaPresente) iniciarEspera(graciaMin, false);
  });

  window.onPonenteConectadoConferencia = function () {
    ocultarEspera();
    if (typeof showToast === 'function') {
      showToast({ title: 'Ponente conectado', message: 'La conferencia ha comenzado.', type: 'success' });
    }
  };
})();

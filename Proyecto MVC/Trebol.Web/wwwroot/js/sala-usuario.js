/** Sala de cita — usuario: alias, nota privada, recomendaciones locales, evaluación inasistencia */

function initSalaUsuario(opts) {
  const { citaId, notaKey, recomendKey, tieneRecomendBd, fechaHoraCita } = opts;
  const token = () => document.querySelector('[name="__RequestVerificationToken"]')?.value ?? '';
  let pollInasistencia = null;

  const anonToggle = document.getElementById('anon-toggle');
  anonToggle?.addEventListener('change', async () => {
    const res = await fetch('/Citas/ActualizarAliasCita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `citaId=${citaId}&mostrarAlias=${anonToggle.checked}&__RequestVerificationToken=${encodeURIComponent(token())}`
    });
    const d = await res.json();
    if (typeof showToast === 'function') {
      showToast({
        title: d.exito ? 'Privacidad actualizada' : 'Error',
        message: d.mensaje || '',
        type: d.exito ? 'success' : 'error'
      });
    }
  });

  const notaTxt = document.getElementById('nota-privada-txt');
  loadRecomendLocal(notaKey, 'nota-privada-txt');

  document.getElementById('save-nota-btn')?.addEventListener('click', () => {
    if (!notaTxt) return;
    localStorage.setItem(notaKey, notaTxt.value);
    if (typeof showToast === 'function') {
      showToast({ title: 'Nota guardada', type: 'success', duration: 3000 });
    }
  });

  if (!tieneRecomendBd) {
    const recTxt = document.getElementById('recomendaciones-pro');
    const saved = localStorage.getItem(recomendKey);
    if (recTxt && saved) {
      recTxt.value = saved;
      const meta = document.getElementById('recomend-pro-meta');
      if (meta) meta.textContent = 'Recomendaciones de la sesión (dispositivo local)';
    }
  }

  async function evaluarInasistencia() {
    try {
      const res = await fetch(`/Citas/EvaluarInasistencia?citaId=${citaId}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const data = await res.json();
      if (data.requiereModal && data.novedad && typeof window.showNovedadModal === 'function') {
        if (pollInasistencia) {
          clearInterval(pollInasistencia);
          pollInasistencia = null;
        }
        window.showNovedadModal(data.novedad);
        return true;
      }
    } catch { /* silencioso */ }
    return false;
  }

  function programarPollInasistencia() {
    if (pollInasistencia) return;
    const inicio = fechaHoraCita ? new Date(fechaHoraCita) : null;
    const graciaMs = 5 * 60 * 1000;
    const ahora = Date.now();
    const inicioPoll = inicio ? Math.max(0, inicio.getTime() + graciaMs - ahora) : graciaMs;

    setTimeout(async () => {
      const mostro = await evaluarInasistencia();
      if (!mostro) {
        pollInasistencia = setInterval(evaluarInasistencia, 30000);
      }
    }, inicioPoll);
  }

  window.iniciarPollInasistenciaCita = programarPollInasistencia;
  programarPollInasistencia();
}

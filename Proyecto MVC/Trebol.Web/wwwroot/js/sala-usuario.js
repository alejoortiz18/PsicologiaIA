/** Sala de cita — usuario: alias, nota privada en BD, evaluación inasistencia */

function initSalaUsuario(opts) {
  const { citaId, fechaHoraCita } = opts;
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

  document.getElementById('save-nota-btn')?.addEventListener('click', async () => {
    const notaTxt = document.getElementById('nota-privada-txt');
    if (!notaTxt) return;

    const body = new URLSearchParams();
    body.append('citaId', String(citaId));
    body.append('contenido', notaTxt.value);
    body.append('__RequestVerificationToken', token());

    const res = await fetch('/Citas/GuardarNotaPrivada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    const d = await res.json();

    if (d.exito) {
      const meta = document.getElementById('nota-privada-meta');
      const now = new Date();
      if (meta) {
        meta.textContent = 'Guardada el ' + now.toLocaleDateString('es-CO') + ' · ' +
          now.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
      }
    }

    if (typeof showToast === 'function') {
      showToast({
        title: d.exito ? 'Nota guardada' : 'Error',
        message: d.mensaje || '',
        type: d.exito ? 'success' : 'error',
        duration: 3000
      });
    }
  });

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

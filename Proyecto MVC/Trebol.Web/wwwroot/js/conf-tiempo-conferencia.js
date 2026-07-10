/**
 * Conferencia: cuenta regresiva, alertas de tiempo, gracia, compra de minutos y cierre.
 */
(function () {
  'use strict';

  const cfg = window.confTiempoConferencia;
  if (!cfg || !cfg.salaId) return;

  const countdownEl = document.getElementById('conf-horario-countdown');
  const esProfesional = cfg.rol === 'profesional';
  let finMs = cfg.fechaFinEfectiva ? new Date(cfg.fechaFinEfectiva).getTime() : NaN;
  let faseActual = 'Activa';
  let alerta5 = false;
  let alerta3 = false;
  let modalCierreMostrado = false;
  let controlesBloqueados = false;

  function formatearRestante(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function toast(title, message, type) {
    if (typeof showToast === 'function') showToast({ title, message, type });
  }

  function actualizarCountdownVisual() {
    if (!countdownEl) return;
    if (!Number.isFinite(finMs)) {
      countdownEl.textContent = '—';
      return;
    }
    const restante = finMs - Date.now();
    if (restante <= 0) {
      countdownEl.textContent = '00:00:00';
      return;
    }
    countdownEl.textContent = formatearRestante(restante);
    if (restante <= 2 * 60 * 1000) {
      countdownEl.classList.add('conf-header__horario-countdown--urgente');
    } else {
      countdownEl.classList.remove('conf-header__horario-countdown--urgente');
    }
    if (!alerta5 && restante <= 5 * 60 * 1000 && restante > 5 * 60 * 1000 - 1500) {
      alerta5 = true;
      if (esProfesional) toast('Tiempo por terminar', 'Quedan 5 minutos para el fin de la charla.', 'warning');
    }
    if (!alerta3 && restante <= 3 * 60 * 1000 && restante > 3 * 60 * 1000 - 1500) {
      alerta3 = true;
      if (esProfesional) toast('Tiempo por terminar', 'Quedan 3 minutos para el fin de la charla.', 'warning');
    }
  }

  function bloquearControlesProfesional() {
    if (!esProfesional || controlesBloqueados) return;
    controlesBloqueados = true;
    ['btn-cam', 'btn-mic', 'btn-screen'].forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.disabled = true;
      btn.classList.add('ctrl-btn--off');
      btn.classList.remove('ctrl-btn--normal', 'ctrl-btn--active-green');
    });
    const terminar = document.querySelector('[data-open-modal="end-conf-modal"]');
    if (terminar) terminar.disabled = true;
  }

  function restaurarControlesProfesional() {
    if (!esProfesional || !controlesBloqueados) return;
    controlesBloqueados = false;
    ['btn-cam', 'btn-mic', 'btn-screen'].forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.disabled = false;
      btn.classList.remove('ctrl-btn--off');
      btn.classList.add('ctrl-btn--normal');
    });
    const terminar = document.querySelector('[data-open-modal="end-conf-modal"]');
    if (terminar) terminar.disabled = false;
  }

  function mostrarModalCierreParticipante(data) {
    if (modalCierreMostrado) return;
    modalCierreMostrado = true;
    const backdrop = document.getElementById('conf-cierre-backdrop');
    if (!backdrop) return;
    const nombre = data?.nombreProfesional || cfg.nombreProfesional || 'el profesional';
    const profId = data?.profesionalId || cfg.profesionalId;
    const msg = document.getElementById('conf-cierre-mensaje');
    if (msg) {
      msg.textContent = `Gracias por asistir a la charla. Te invitamos a agendar una cita privada con ${nombre} para continuar tu proceso.`;
    }
    const agendar = document.getElementById('conf-btn-agendar-cita');
    const perfil = document.getElementById('conf-btn-ver-perfil');
    if (profId) {
      if (agendar) agendar.href = `/PerfilOrador/Calendario?id=${profId}`;
      if (perfil) perfil.href = `/PerfilOrador/Index?id=${profId}`;
    }
    if (typeof openModal === 'function') openModal('conf-cierre');
  }

  function aplicarFase(fase, segundosGracia) {
    if (fase === faseActual && fase !== 'GraciaChat') return;
    faseActual = fase;

    if (fase === 'GraciaChat') {
      bloquearControlesProfesional();
      if (esProfesional) {
        toast('Tiempo agotado', 'Tienes 1 minuto de chat para comprar más tiempo.', 'warning');
      }
      if (typeof window.confForzarChatHabilitado === 'function') {
        window.confForzarChatHabilitado(true);
      }
    } else if (fase === 'Activa') {
      restaurarControlesProfesional();
    } else if (fase === 'Cerrada') {
      bloquearControlesProfesional();
      if (typeof window.confForzarChatHabilitado === 'function') {
        window.confForzarChatHabilitado(false);
      }
      if (esProfesional) {
        toast('Conferencia finalizada', 'La sala se cerró por tiempo agotado.', 'info');
        window.setTimeout(() => { window.location.href = cfg.redirectProfesional || '/MisEventos'; }, 2500);
      } else {
        mostrarModalCierreParticipante({});
      }
    }
  }

  function extenderTiempo(finIso) {
    if (!finIso) return;
    finMs = new Date(finIso).getTime();
    window.confEventoHorario = window.confEventoHorario || {};
    window.confEventoHorario.fechaFinEfectiva = finIso;
    alerta5 = false;
    alerta3 = false;
    faseActual = 'Activa';
    restaurarControlesProfesional();
    actualizarCountdownVisual();
    toast('Tiempo extendido', 'Se agregaron minutos a la conferencia.', 'success');
  }

  async function sincronizarEstadoServidor() {
    if (!cfg.estadoTiempoUrl) return;
    try {
      const res = await fetch(`${cfg.estadoTiempoUrl}?salaId=${cfg.salaId}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const data = await res.json();
      if (data.finEfectivo) finMs = new Date(data.finEfectivo).getTime();
      if (data.valorMinuto) {
        cfg.valorMinuto = data.valorMinuto;
        if (esProfesional) {
          const lbl = document.getElementById('conf-valor-minuto');
          const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
          if (lbl) lbl.textContent = fmt.format(data.valorMinuto);
          const precioHdr = document.getElementById('conf-comprar-precio-label');
          if (precioHdr) precioHdr.textContent = `${fmt.format(data.valorMinuto)} / min`;
        }
      }
      aplicarFase(data.fase || 'Activa', data.segundosRestantesGracia || 0);
    } catch { /* silencioso */ }
  }

  window.confTiempoExtender = extenderTiempo;

  document.addEventListener('DOMContentLoaded', () => {
    actualizarCountdownVisual();
    setInterval(actualizarCountdownVisual, 1000);
    sincronizarEstadoServidor();
    setInterval(sincronizarEstadoServidor, 5000);

    document.getElementById('conf-btn-comprar-minutos')?.addEventListener('click', () => {
      if (typeof openModal === 'function') openModal('comprar-minutos-conf');
    });

    document.getElementById('conf-btn-salir-cierre')?.addEventListener('click', () => {
      window.location.href = cfg.homeUrl || '/HomeUsuario';
    });

    const formCompra = document.getElementById('form-comprar-minutos-conf');
    formCompra?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('conf-btn-confirmar-compra');
      const minutos = parseInt(document.getElementById('conf-minutos-compra')?.value || '0', 10);
      if (minutos < 3) {
        toast('Minutos inválidos', 'Debes comprar al menos 3 minutos.', 'error');
        return;
      }
      const token = document.querySelector('[name="__RequestVerificationToken"]')?.value || '';
      const body = new URLSearchParams();
      body.append('__RequestVerificationToken', token);
      body.append('salaId', String(cfg.salaId));
      body.append('minutos', String(minutos));
      body.append('tarjeta.Numero', document.getElementById('conf-tarjeta-numero')?.value || '');
      body.append('tarjeta.Vencimiento', document.getElementById('conf-tarjeta-venc')?.value || '');
      body.append('tarjeta.Cvv', document.getElementById('conf-tarjeta-cvv')?.value || '');
      body.append('tarjeta.Nombre', document.getElementById('conf-tarjeta-nombre')?.value || '');
      body.append('tarjeta.MetodoPago', 'TarjetaCredito');
      btn.disabled = true;
      try {
        const res = await fetch(cfg.comprarMinutosUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
          body: body.toString()
        });
        const data = await res.json();
        if (data.exito) {
          if (typeof closeModal === 'function') closeModal('comprar-minutos-conf');
          extenderTiempo(data.finEfectivo);
        } else {
          toast('No se pudo comprar', data.mensaje || '', 'error');
        }
      } catch {
        toast('Error', 'No se pudo procesar el pago.', 'error');
      } finally {
        btn.disabled = false;
      }
    });

    document.getElementById('conf-minutos-compra')?.addEventListener('input', (e) => {
      const minutos = parseInt(e.target.value || '0', 10);
      const totalEl = document.getElementById('conf-compra-total');
      if (!totalEl || !cfg.valorMinuto) return;
      const total = Math.max(0, minutos) * cfg.valorMinuto;
      totalEl.textContent = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(total);
    });
  });

  if (window.confSalaConnectionReady) {
    window.confSalaConnectionReady.then(conn => {
      if (!conn) return;
      conn.on('TiempoConferenciaExtendido', payload => extenderTiempo(payload?.finEfectivo));
      conn.on('FaseConferenciaCambio', payload => aplicarFase(payload?.fase || 'GraciaChat', payload?.segundosRestantesGracia));
      conn.on('SalaCerradaPorTiempo', payload => {
        aplicarFase('Cerrada', 0);
        if (!esProfesional) mostrarModalCierreParticipante(payload || {});
      });
    });
  }
})();

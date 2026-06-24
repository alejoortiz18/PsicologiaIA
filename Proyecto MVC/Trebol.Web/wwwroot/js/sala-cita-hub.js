/** SignalR — chat y recomendaciones en salas de cita privada */

(function () {
  'use strict';

  const cfg = window.citaSalaHub;
  if (!cfg || !cfg.citaId) return;

  const citaId = parseInt(cfg.citaId, 10);
  const rol = cfg.rol === 'profesional' ? 'profesional' : 'usuario';
  let connection = null;

  function token() {
    return document.querySelector('[name="__RequestVerificationToken"]')?.value ?? '';
  }

  function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  function formatearHora(iso) {
    try {
      return new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  function inicialesAlias(alias) {
    const parts = String(alias || '?').trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0] || '?').substring(0, 2).toUpperCase();
  }

  function feedEl() {
    return document.getElementById('cita-chat-feed');
  }

  function quitarBienvenida(feed) {
    if (!feed) return;
    feed.querySelectorAll('.cita-chat-welcome').forEach(function (el) { el.remove(); });
  }

  function esMensajePropio(msg) {
    const tipo = String(msg.remitenteTipo || '');
    return (rol === 'profesional' && tipo === 'Profesional') ||
           (rol === 'usuario' && tipo === 'Usuario');
  }

  function appendMensaje(msg) {
    const feed = feedEl();
    if (!feed || !msg || !msg.contenido) return;

    quitarBienvenida(feed);

    const propio = esMensajePropio(msg);
    const item = document.createElement('div');
    item.className = 'cita-msg-item ' + (propio ? 'cita-msg-item--mine' : 'cita-msg-item--theirs');

    const alias = String(msg.alias || 'Participante');
    const hora = formatearHora(msg.enviadoEn);

    item.innerHTML =
      '<div class="cita-msg-author">' +
        '<div class="cita-msg-author__avatar" aria-hidden="true">' + inicialesAlias(alias) + '</div>' +
        '<div class="cita-msg-author__name">' + escapeHtml(alias) + '</div>' +
      '</div>' +
      '<div class="cita-msg-text">' + escapeHtml(msg.contenido) + '</div>' +
      (hora ? '<div class="cita-msg-time">' + hora + '</div>' : '');

    feed.appendChild(item);
    feed.scrollTop = feed.scrollHeight;
  }

  function aplicarRecomendacion(data) {
    if (!data || typeof data.contenido !== 'string') return;

    const txt = document.getElementById('recomendaciones-pro') || document.getElementById('recomendaciones-txt');
    if (txt) txt.value = data.contenido;

    const meta = document.getElementById('recomend-pro-meta') || document.getElementById('recomend-timestamp');
    if (meta && data.fecha) {
      const f = new Date(data.fecha);
      meta.textContent = 'Actualizado el ' + f.toLocaleDateString('es-CO') + ' · ' +
        f.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
    }

    if (rol === 'usuario' && typeof showToast === 'function') {
      showToast({ title: 'Nueva recomendación', message: 'El profesional actualizó tus recomendaciones.', type: 'info' });
    }
  }

  function enviarMensaje() {
    const input = document.getElementById('cita-chat-input');
    if (!input || !connection) return;

    const texto = input.value.trim();
    if (!texto) return;

    const btn = document.getElementById('cita-chat-send');
    if (btn) btn.disabled = true;

    connection.invoke('EnviarMensaje', citaId, texto)
      .then(function () { input.value = ''; })
      .catch(function (err) {
        const msg = err && err.message ? err.message : 'No se pudo enviar el mensaje.';
        if (typeof showToast === 'function') showToast({ title: 'Error', message: msg, type: 'error' });
      })
      .finally(function () { if (btn) btn.disabled = false; });
  }

  function wireEnvio() {
    const input = document.getElementById('cita-chat-input');
    const btn = document.getElementById('cita-chat-send');
    if (!input || !btn) return;

    btn.addEventListener('click', enviarMensaje);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarMensaje();
      }
    });
  }

  function cargarHistorial() {
    return fetch('/Citas/MensajesSala?citaId=' + citaId, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (msgs) {
        (msgs || []).forEach(appendMensaje);
      })
      .catch(function () {});
  }

  function iniciarHub() {
    if (typeof signalR === 'undefined') {
      console.warn('[sala-cita-hub] SignalR no cargado.');
      return;
    }

    connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/cita-sala')
      .withAutomaticReconnect()
      .build();

    connection.on('MensajeCita', appendMensaje);
    connection.on('RecomendacionActualizada', aplicarRecomendacion);

    connection.onreconnected(function () {
      return connection.invoke('UnirseCita', citaId);
    });

    connection.start()
      .then(function () { return connection.invoke('UnirseCita', citaId); })
      .catch(function (err) { console.error('[sala-cita-hub]', err); });
  }

  window.activarTabCita = function (panelId) {
    const tab = document.querySelector('.cita-panel-tab[data-panel-tab="' + panelId + '"]');
    if (tab) tab.click();
  };

  window.guardarRecomendacionCita = async function (citaIdParam, textareaId, timestampId) {
    const txt = document.getElementById(textareaId);
    if (!txt) return;

    const body = new URLSearchParams();
    body.append('citaId', String(citaIdParam));
    body.append('contenido', txt.value);
    body.append('__RequestVerificationToken', token());

    const res = await fetch('/Citas/GuardarRecomendacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    const d = await res.json();

    if (d.exito) {
      const now = new Date();
      const stamp = document.getElementById(timestampId);
      if (stamp) {
        stamp.textContent = 'Guardado el ' + now.toLocaleDateString('es-CO') + ' · ' +
          now.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
      }
    }

    if (typeof showToast === 'function') {
      showToast({
        title: d.exito ? 'Recomendaciones guardadas' : 'Error',
        message: d.mensaje || '',
        type: d.exito ? 'success' : 'error'
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    wireEnvio();
    cargarHistorial().then(iniciarHub);

    document.querySelectorAll('[data-activar-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activarTabCita(btn.getAttribute('data-activar-tab'));
      });
    });
  });
})();

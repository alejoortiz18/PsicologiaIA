/**

 * SignalR — chat grupal en salas de conferencia (asistente y profesional).

 */

(function () {

  'use strict';



  const cfg = window.confSalaHub;

  if (!cfg || !cfg.salaId) return;



  const salaId = parseInt(cfg.salaId, 10);

  const rol = cfg.rol === 'profesional' ? 'profesional' : 'asistente';

  let chatHabilitado = cfg.chatHabilitado === true;

  let lastChatState = null;

  let connection = null;

  let bienvenidaQuitada = false;



  function bloquesUi() {

    if (rol === 'profesional') {

      return {

        disabled: document.getElementById('conf-chat-pro-disabled'),

        active: document.getElementById('conf-chat-pro-active'),

        feed: document.getElementById('conf-msg-list'),

        input: null,

        sendBtn: null

      };

    }

    return {

      disabled: document.getElementById('conf-chat-disabled'),

      active: document.getElementById('conf-chat-active'),

      feed: document.getElementById('chat-feed-asistente'),

      input: document.getElementById('chat-input-asistente'),

      sendBtn: document.getElementById('chat-send-asistente')

    };

  }



  function setControlesEnvio(habilitado) {

    const ui = bloquesUi();

    if (ui.input) {

      ui.input.disabled = !habilitado;

      if (!habilitado) ui.input.value = '';

    }

    if (ui.sendBtn) ui.sendBtn.disabled = !habilitado;

  }



  function aplicarEstadoChat(habilitado, mostrarToast) {

    const nuevo = !!habilitado;

    const cambio = lastChatState !== null && lastChatState !== nuevo;

    lastChatState = nuevo;

    chatHabilitado = nuevo;

    const ui = bloquesUi();

    if (!ui.disabled || !ui.active) return;



    ui.disabled.hidden = chatHabilitado;

    ui.active.hidden = !chatHabilitado;

    setControlesEnvio(chatHabilitado);



    if (mostrarToast && cambio && typeof showToast === 'function') {

      if (chatHabilitado) {

        showToast({

          title: 'Chat habilitado',

          message: rol === 'profesional'

            ? 'Los asistentes ya pueden escribir en el chat grupal.'

            : 'Ya puedes escribir en el chat grupal del evento.',

          type: 'success'

        });

      } else {

        showToast({

          title: 'Chat deshabilitado',

          message: rol === 'profesional'

            ? 'Los asistentes ya no pueden enviar mensajes.'

            : 'El profesional pausó el chat grupal.',

          type: 'info'

        });

      }

    }

  }



  window.confSalaAplicarChat = aplicarEstadoChat;



  function quitarBienvenida(feed) {

    if (!feed || bienvenidaQuitada) return;

    feed.querySelectorAll('.conf-chat-welcome, .notif-empty').forEach(function (el) {

      el.remove();

    });

    bienvenidaQuitada = true;

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



  function appendMensaje(msg) {

    const ui = bloquesUi();

    if (!ui.feed || !msg || !msg.contenido) return;



    quitarBienvenida(ui.feed);



    const item = document.createElement('div');

    item.className = 'conf-msg-item';



    const alias = String(msg.alias || 'Participante');

    const hora = formatearHora(msg.enviadoEn);



    item.innerHTML =

      '<div class="conf-msg-author-pro">' +

        '<div class="conf-msg-author-pro__avatar" aria-hidden="true">' + inicialesAlias(alias) + '</div>' +

        '<div class="conf-msg-author-pro__name">' + escapeHtml(alias) + '</div>' +

      '</div>' +

      '<div class="conf-msg-text">' + escapeHtml(msg.contenido) + '</div>' +

      (hora ? '<div class="conf-msg-time">' + hora + '</div>' : '');



    ui.feed.appendChild(item);

    ui.feed.scrollTop = ui.feed.scrollHeight;



    if (rol === 'profesional') {

      const badge = document.getElementById('conf-tab-msg-count');

      if (badge) {

        const n = ui.feed.querySelectorAll('.conf-msg-item').length;

        badge.textContent = String(n);

        badge.hidden = n === 0;

      }

    }

  }



  function escapeHtml(text) {

    const d = document.createElement('div');

    d.textContent = text;

    return d.innerHTML;

  }



  function enviarMensaje() {

    if (!chatHabilitado) {

      if (typeof showToast === 'function') {

        showToast({ title: 'Chat no disponible', message: 'El profesional aún no habilitó el chat.', type: 'warning' });

      }

      return;

    }



    const ui = bloquesUi();

    if (!ui.input || !connection) return;



    const texto = ui.input.value.trim();

    if (!texto) return;



    ui.sendBtn && (ui.sendBtn.disabled = true);

    connection.invoke('EnviarMensaje', salaId, texto)

      .then(function () { ui.input.value = ''; })

      .catch(function (err) {

        const msg = err && err.message ? err.message : 'No se pudo enviar el mensaje.';

        if (typeof showToast === 'function') showToast({ title: 'Envío bloqueado', message: msg, type: 'error' });

      })

      .finally(function () {

        if (ui.sendBtn) ui.sendBtn.disabled = !chatHabilitado;

      });

  }



  function wireEnvio() {

    const ui = bloquesUi();

    if (!ui.input || !ui.sendBtn) return;



    ui.sendBtn.addEventListener('click', enviarMensaje);

    ui.input.addEventListener('keydown', function (e) {

      if (e.key === 'Enter' && !e.shiftKey) {

        e.preventDefault();

        enviarMensaje();

      }

    });

  }



  function iniciarHub() {

    if (typeof signalR === 'undefined') {

      console.warn('[conf-sala-hub] SignalR no cargado.');

      return;

    }



    connection = new signalR.HubConnectionBuilder()

      .withUrl('/hubs/conferencia')

      .withAutomaticReconnect()

      .build();



    connection.on('ChatEstadoActualizado', function (habilitado) {

      aplicarEstadoChat(habilitado, true);

    });



    connection.on('MensajeConferencia', appendMensaje);

    connection.on('PonenteConectado', function () {
      if (typeof window.onPonenteConectadoConferencia === 'function') {
        window.onPonenteConectadoConferencia();
      }
    });



    connection.onreconnected(function () {

      return connection.invoke('UnirseSala', salaId);

    });



    connection.start()

      .then(function () { return connection.invoke('UnirseSala', salaId); })

      .catch(function (err) { console.error('[conf-sala-hub]', err); });



    window.confSalaHubConnection = connection;

  }



  document.addEventListener('DOMContentLoaded', function () {

    aplicarEstadoChat(chatHabilitado, false);

    wireEnvio();

    iniciarHub();

  });

})();



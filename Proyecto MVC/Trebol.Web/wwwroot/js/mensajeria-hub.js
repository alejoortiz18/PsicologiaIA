/**
 * SignalR global: chat en tiempo real y notificaciones (campana o lista).
 */
(function () {
  'use strict';

  function mismoId(a, b) {
    if (a == null || b == null) return false;
    return parseInt(a, 10) === parseInt(b, 10);
  }

  function esPaginaMensajeria() {
    return /\/mensajeria/i.test(window.location.pathname) ||
      !!document.querySelector('[data-page="mensajeria"]');
  }

  function conversacionActivaId() {
    const cfg = window.mensajeriaChat;
    if (cfg && cfg.conversacionId) return cfg.conversacionId;
    const p = new URLSearchParams(window.location.search);
    const id = parseInt(p.get('conversacionId') || '0', 10);
    return id > 0 ? id : null;
  }

  function esMensajePropio(msg) {
    const cfg = window.mensajeriaChat;
    if (!cfg || !msg) return false;
    return mismoId(msg.emisorId, cfg.miId) &&
      String(msg.emisorTipo).toLowerCase() === String(cfg.miTipo).toLowerCase();
  }

  function formatearHoraLista(iso) {
    if (!iso) return 'ahora';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return 'ahora';
    }
  }

  function entregarAlChat(msg) {
    if (!msg || !window.mensajeriaChatHandlers ||
        typeof window.mensajeriaChatHandlers.onRecibirMensaje !== 'function') {
      return false;
    }
    const activa = conversacionActivaId();
    if (!activa || !mismoId(activa, msg.conversacionId)) return false;
    window.mensajeriaChatHandlers.onRecibirMensaje(msg);
    return true;
  }

  function ensureBadge(item) {
    const meta = item.querySelector('.msg-conv-meta');
    if (!meta) return;
    let badge = item.querySelector('.msg-conv-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'msg-conv-badge';
      meta.appendChild(badge);
    }
    const n = parseInt(badge.textContent || '0', 10) || 0;
    badge.textContent = String(n + 1);
    badge.style.display = '';
  }

  function quitarResaltado(item) {
    item.classList.remove('has-new-activity');
    const badge = item.querySelector('.msg-conv-badge');
    if (badge) badge.remove();
  }

  window.MensajeriaInbox = {
    onNotificacion: function (payload) {
      const convId = payload.conversacionId;
      const msg = payload.mensaje || {};
      const item = document.querySelector('.msg-conv-item[data-conversacion-id="' + convId + '"]');
      if (!item) return;

      const preview = item.querySelector('.msg-conv-preview');
      const timeEl = item.querySelector('.msg-conv-time');
      const texto = msg.contenido || '';
      if (preview) preview.textContent = texto;
      if (timeEl) timeEl.textContent = formatearHoraLista(msg.fechaEnvio);

      const activa = conversacionActivaId();
      if (mismoId(activa, convId)) {
        quitarResaltado(item);
        return;
      }

      item.classList.add('has-new-activity');
      ensureBadge(item);
    }
  };

  function manejarRecibirMensaje(msg) {
    if (esMensajePropio(msg)) return;
    if (esPaginaMensajeria()) {
      entregarAlChat(msg);
    }
  }

  function manejarNotificacion(payload) {
    const msg = payload.mensaje || {};
    if (esMensajePropio(msg)) return;

    if (esPaginaMensajeria()) {
      entregarAlChat(msg);
      window.MensajeriaInbox.onNotificacion(payload);
      return;
    }

    const item = {
      conversacionId: payload.conversacionId,
      emisorNombre: payload.emisorNombre || 'Mensaje nuevo',
      contenido: msg.contenido || '',
      time: formatearHoraLista(msg.fechaEnvio)
    };
    if (window.TopbarNotifs && typeof window.TopbarNotifs.pushMensaje === 'function') {
      window.TopbarNotifs.pushMensaje(item);
    } else {
      window._colaNotifsCampana = window._colaNotifsCampana || [];
      window._colaNotifsCampana.push(item);
    }
  }

  function iniciarHub() {
    if (!document.getElementById('notif-wrapper') || typeof signalR === 'undefined') return;

    const readyQueue = [];
    let listo = false;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/chat')
      .withAutomaticReconnect()
      .build();

    connection.on('RecibirMensaje', manejarRecibirMensaje);
    connection.on('NotificacionMensaje', manejarNotificacion);

    function marcarListo() {
      listo = true;
      readyQueue.splice(0).forEach(function (fn) { fn(); });
      document.dispatchEvent(new CustomEvent('trebol-mensajeria-hub-ready'));
    }

    window.trebolMensajeriaHub = {
      connection: connection,
      whenReady: function (fn) {
        if (listo) fn();
        else readyQueue.push(fn);
      },
      joinConv: function (id) {
        return connection.invoke('UnirseConversacion', id);
      },
      leaveConv: function (id) {
        return connection.invoke('AbandonarConversacion', id);
      }
    };

    connection.start()
      .then(marcarListo)
      .catch(function (err) { console.error('Hub mensajería:', err); });

    connection.onreconnected(function () {
      document.dispatchEvent(new CustomEvent('trebol-mensajeria-hub-ready'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarHub);
  } else {
    iniciarHub();
  }
})();

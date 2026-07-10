/**

 * Mensajería — lista, búsqueda y chat en tiempo real (hub compartido)

 */

(function () {

  'use strict';



  const cfg = window.mensajeriaChat || {};

  const chatBody = document.getElementById('chat-body');

  const txtInput = document.getElementById('msg-input');

  const sendBtn = document.getElementById('msg-send-btn');

  const searchInput = document.getElementById('msg-search');

  const mensajesVistos = new Set(cfg.mensajesIniciales || []);

  let convUnida = null;



  function mismoId(a, b) {

    if (a == null || b == null) return false;

    return parseInt(a, 10) === parseInt(b, 10);

  }



  function scrollAbajo() {

    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;

  }



  function formatearHora(iso) {

    try {

      const d = new Date(iso);

      return d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });

    } catch {

      return '';

    }

  }



  function formatearHoraLista() {

    const d = new Date();

    return d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });

  }



  function esMio(msg) {

    return mismoId(msg.emisorId, cfg.miId) &&

      String(msg.emisorTipo).toLowerCase() === String(cfg.miTipo).toLowerCase();

  }



  function escapeHtml(text) {

    const div = document.createElement('div');

    div.textContent = text;

    return div.innerHTML;

  }



  function actualizarPreviewConv(convId, texto) {

    const item = document.querySelector('.msg-conv-item[data-conversacion-id="' + convId + '"]');

    if (!item) return;

    const preview = item.querySelector('.msg-conv-preview');

    const timeEl = item.querySelector('.msg-conv-time');

    if (preview) preview.textContent = texto;

    if (timeEl) timeEl.textContent = formatearHoraLista();

    if (mismoId(convId, cfg.conversacionId)) {

      item.classList.remove('has-new-activity');

      const badge = item.querySelector('.msg-conv-badge');

      if (badge) badge.remove();

    }

  }



  function appendMensaje(msg) {

    if (!chatBody || mensajesVistos.has(msg.mensajeId)) return;

    mensajesVistos.add(msg.mensajeId);



    const mio = esMio(msg);

    const row = document.createElement('div');

    row.className = mio ? 'msg-bubble-row msg-bubble-row--own' : 'msg-bubble-row';

    row.dataset.mensajeId = String(msg.mensajeId);



    const hora = formatearHora(msg.fechaEnvio) + (mio ? ' ✓' : '');



    if (mio) {

      row.innerHTML =

        '<div class="msg-bubble msg-bubble--own">' +

        escapeHtml(msg.contenido) +

        '<div class="msg-bubble__time">' + hora + '</div></div>' +

        '<div class="msg-bubble-avatar msg-bubble-avatar--own">' + escapeHtml(cfg.miIniciales || '') + '</div>';

    } else {

      row.innerHTML =

        '<div class="msg-bubble-avatar" style="background:' + (cfg.otroGradient || 'var(--color-primary)') + ';">' +

        escapeHtml(cfg.otroIniciales || '') + '</div>' +

        '<div class="msg-bubble">' +

        escapeHtml(msg.contenido) +

        '<div class="msg-bubble__time">' + hora + '</div></div>';

    }



    chatBody.appendChild(row);

    scrollAbajo();

  }



  function enviarMensaje() {

    if (!cfg.conversacionId || !txtInput) return;

    const texto = (txtInput.value || '').trim();

    if (!texto) return;



    const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value ?? '';

    const body = new URLSearchParams({

      destinoId: String(cfg.destinoId),

      tipoDestino: cfg.tipoDestino,

      texto: texto,

      conversacionId: String(cfg.conversacionId),

      __RequestVerificationToken: token

    });



    if (sendBtn) sendBtn.disabled = true;



    fetch('/Mensajeria/Enviar', {

      method: 'POST',

      headers: {

        'Content-Type': 'application/x-www-form-urlencoded',

        'RequestVerificationToken': token

      },

      body: body.toString()

    })

      .then(function (r) { return r.json(); })

      .then(function (d) {

        if (sendBtn) sendBtn.disabled = false;

        if (d.exito) {

          txtInput.value = '';

          txtInput.style.height = 'auto';

          if (d.mensajeChat) {

            appendMensaje(d.mensajeChat);

            actualizarPreviewConv(cfg.conversacionId, d.mensajeChat.contenido);

          }

          if (d.conversacionId && !mismoId(d.conversacionId, cfg.conversacionId)) {

            cfg.conversacionId = d.conversacionId;

          }

        } else if (typeof showToast === 'function') {

          showToast({ title: d.mensaje || 'No se pudo enviar', type: 'error' });

        } else {

          alert(d.mensaje || 'No se pudo enviar');

        }

      })

      .catch(function () {

        if (sendBtn) sendBtn.disabled = false;

        if (typeof showToast === 'function') showToast({ title: 'Error de conexión', type: 'error' });

      });

  }



  function iniciarBusqueda() {

    if (!searchInput) return;

    searchInput.addEventListener('input', function () {

      const q = (searchInput.value || '').trim().toLowerCase();

      document.querySelectorAll('.msg-conv-item').forEach(function (el) {

        const hay = !q || (el.getAttribute('data-search') || '').includes(q);

        el.style.display = hay ? '' : 'none';

      });

    });

  }



  function iniciarInput() {

    if (!txtInput) return;

    txtInput.addEventListener('keydown', function (e) {

      if (e.key === 'Enter' && !e.shiftKey) {

        e.preventDefault();

        enviarMensaje();

      }

    });

    txtInput.addEventListener('input', function () {

      txtInput.style.height = 'auto';

      txtInput.style.height = Math.min(txtInput.scrollHeight, 100) + 'px';

    });

    if (sendBtn) sendBtn.addEventListener('click', enviarMensaje);

  }



  function setLive(on) {

    const liveBadge = document.getElementById('chat-live-indicator');

    if (!liveBadge) return;

    liveBadge.textContent = on ? '● En vivo' : '○ Sin conexión';

    liveBadge.classList.toggle('is-offline', !on);

  }



  function unirseConversacionActiva() {

    const hub = window.trebolMensajeriaHub;

    if (!hub || !cfg.conversacionId) return;

    hub.whenReady(function () {

      if (convUnida && !mismoId(convUnida, cfg.conversacionId)) {

        hub.leaveConv(convUnida).catch(function () {});

      }

      convUnida = cfg.conversacionId;

      hub.joinConv(convUnida).catch(function () {});

      setLive(hub.connection.state === signalR.HubConnectionState.Connected);

    });

  }



  window.mensajeriaChatHandlers = {

    onRecibirMensaje: function (msg) {

      if (msg.conversacionId && !mismoId(msg.conversacionId, cfg.conversacionId)) return;

      if (esMio(msg)) return;

      appendMensaje(msg);

      actualizarPreviewConv(cfg.conversacionId, msg.contenido);

    }

  };



  function iniciarHubChat() {

    if (!cfg.conversacionId) return;



    function conectar() {

      const hub = window.trebolMensajeriaHub;

      if (!hub) return false;

      const conn = hub.connection;

      conn.onreconnecting(function () { setLive(false); });

      conn.onreconnected(function () {

        unirseConversacionActiva();

        setLive(true);

      });

      conn.onclose(function () { setLive(false); });

      hub.whenReady(function () {

        unirseConversacionActiva();

        setLive(conn.state === signalR.HubConnectionState.Connected);

      });

      window.addEventListener('beforeunload', function () {

        if (convUnida) hub.leaveConv(convUnida).catch(function () {});

      });

      return true;

    }



    if (!conectar()) {

      document.addEventListener('trebol-mensajeria-hub-ready', conectar, { once: true });

      var intentos = 0;

      var timer = setInterval(function () {

        if (conectar() || ++intentos > 40) clearInterval(timer);

      }, 150);

    }

  }



  iniciarBusqueda();

  iniciarInput();

  scrollAbajo();

  iniciarHubChat();

})();



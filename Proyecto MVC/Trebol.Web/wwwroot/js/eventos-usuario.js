/**
 * Eventos: detalle modal, inscripción → checkout de pago, me gusta, mensaje al orador.
 */
(function () {
  const MODAL_ID = 'detail-modal';

  function token() {
    return document.querySelector('input[name="__RequestVerificationToken"]')?.value ?? '';
  }

  function urlInscripcion(salaId) {
    return `/Inscripcion/Confirmar/${encodeURIComponent(salaId)}`;
  }

  function eventoYaPaso(d) {
    const ahora = Date.now();
    const fin = d.fechaFin ? new Date(d.fechaFin).getTime() : null;
    const inicio = d.fechaInicio ? new Date(d.fechaInicio).getTime() : null;
    if ((d.estado || '').toLowerCase() === 'cerrada') return true;
    if (fin !== null && fin < ahora) return true;
    if (inicio !== null && inicio < ahora) return true;
    return false;
  }

  function textoRegistro(d, cupos) {
    if (d.esInscrito) return 'Inscrito';
    if (eventoYaPaso(d)) return 'Ya pasó';
    if (cupos === 0) return 'Sin cupos';
    return d.precio > 0 ? 'Inscribirse' : 'Registrarse';
  }

  function claseRegistro(d, cupos) {
    if (d.esInscrito) return 'btn btn-secondary btn-reg-sala is-inscrito';
    if (eventoYaPaso(d) || cupos === 0) return 'btn btn-secondary btn-reg-sala';
    if (cupos > 0 && cupos <= 10) return 'btn btn-danger btn-reg-sala';
    return 'btn btn-primary btn-reg-sala';
  }

  function markInscrito(btn) {
    if (!btn) return;
    btn.textContent = 'Inscrito';
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    btn.classList.remove('btn-primary', 'btn-danger');
    btn.classList.add('btn-secondary', 'is-inscrito');
    if (!btn.classList.contains('btn-reg-sala')) btn.classList.add('btn-reg-sala');
  }

  function irAInscripcion(salaId) {
    if (!salaId) {
      if (typeof showToast === 'function') {
        showToast({ title: 'No se pudo iniciar la inscripción', message: 'Falta el identificador del evento.', type: 'error' });
      }
      return;
    }
    if (typeof closeModal === 'function') closeModal(MODAL_ID);
    window.location.href = urlInscripcion(salaId);
  }

  function inscribirSala(btn, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
    if (btn.disabled) return;
    if (btn.classList.contains('is-inscrito')) return;
    if ((btn.textContent || '').trim().toLowerCase() === 'ya pasó') return;

    const salaId = btn.dataset?.salaId || btn.getAttribute('data-sala-id');
    irAInscripcion(salaId);
  }

  function toggleSeguir(btn) {
    const profId = btn.dataset.profesionalId;
    if (!profId) return;

    fetch('/Directorio/ToggleSeguir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'RequestVerificationToken': token()
      },
      body: `profesionalId=${encodeURIComponent(profId)}&__RequestVerificationToken=${encodeURIComponent(token())}`
    })
      .then(r => r.json())
      .then(d => {
        if (!d.exito) {
          if (typeof showToast === 'function') showToast({ title: d.mensaje || 'Error', type: 'error' });
          return;
        }
        const liked = btn.dataset.liked !== 'true';
        btn.dataset.liked = liked ? 'true' : 'false';
        btn.classList.toggle('is-liked', liked);
        btn.innerHTML = (liked ? '💚' : '🤍') + ' <span class="like-count">' + (btn.querySelector('.like-count')?.textContent || '0') + '</span>';
        const countEl = btn.querySelector('.like-count');
        if (countEl) {
          let c = parseInt(countEl.textContent, 10) || 0;
          countEl.textContent = String(c + (liked ? 1 : -1));
        }
        if (typeof showToast === 'function') {
          showToast({
            title: liked ? '¡Te gusta este orador!' : 'Dejaste de seguir',
            type: liked ? 'success' : 'info'
          });
        }
      });
  }

  function fmtFecha(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function fmtHora(d) {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
  }

  function fillDetalleModal(d) {
    const salaId = String(d.salaId ?? d.SalaId ?? '');
    const iniciales = (d.nombreProfesional || '??').split(' ').filter(Boolean)
      .slice(0, 2).map(w => w[0].toUpperCase()).join('');

    document.getElementById('detail-modal-title').textContent = d.titulo || '—';
    document.getElementById('detail-modal-subtitle').textContent =
      [d.categoria, 'Conferencia pública'].filter(Boolean).join(' · ');
    document.getElementById('detail-modal-desc').textContent =
      d.descripcion || 'Sin descripción adicional para este evento.';

    const info = document.getElementById('detail-modal-info');
    const precio = d.precio <= 0 ? 'Entrada libre' : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(d.precio);
    const cupos = Math.max(0, (d.capacidad || 0) - (d.totalInscritos || 0));
    const horario = d.fechaInicio
      ? `${fmtHora(d.fechaInicio)}${d.fechaFin ? ' – ' + fmtHora(d.fechaFin) : ''}`
      : '—';

    info.innerHTML = `
      <div class="session-info-row"><span class="session-info-label">📅 Fecha</span><span class="session-info-value">${fmtFecha(d.fechaInicio)}</span></div>
      <div class="session-info-row"><span class="session-info-label">🕕 Horario</span><span class="session-info-value">${horario}</span></div>
      <div class="session-info-row"><span class="session-info-label">💰 Precio</span><span class="session-info-value" style="color:var(--color-success);font-weight:700;">${precio}</span></div>
      <div class="session-info-row"><span class="session-info-label">🏷 Categoría</span><span class="session-info-value">${d.categoria || '—'}</span></div>
      <div class="session-info-row"><span class="session-info-label">👥 Cupos</span><span class="session-info-value">${d.totalInscritos} de ${d.capacidad} inscritos (${cupos} disponibles)</span></div>`;

    const av = document.getElementById('detail-modal-avatar');
    av.textContent = iniciales;
    document.getElementById('detail-modal-orador').textContent = d.nombreProfesional || '—';
    document.getElementById('detail-modal-orador-role').textContent = d.ocupacionOrador || 'Profesional';

    const tags = document.getElementById('detail-modal-tags');
    tags.innerHTML = '';
    (d.especialidadesTexto || '').split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
      const span = document.createElement('span');
      span.className = 'badge badge-primary';
      span.textContent = t;
      tags.appendChild(span);
    });

    const msgBtn = document.getElementById('detail-modal-msg-orador');
    msgBtn.dataset.pmName = d.nombreProfesional || '';
    msgBtn.dataset.pmAvatar = iniciales;
    msgBtn.dataset.pmProfesionalId = String(d.profesionalId ?? d.ProfesionalId ?? '');
    msgBtn.dataset.pmBg = 'var(--color-primary)';

    const perfilLink = document.getElementById('detail-modal-perfil-link');
    perfilLink.href = `/PerfilOrador/Index/${d.profesionalId ?? d.ProfesionalId}`;

    const regBtn = document.getElementById('detail-modal-reg-btn');
    const ingBtn = document.getElementById('detail-modal-ingresar-btn');
    regBtn.dataset.salaId = salaId;
    regBtn.dataset.salaTitulo = d.titulo || '';
    regBtn.classList.add('btn-reg-sala');
    ingBtn.style.display = 'none';
    regBtn.style.display = '';

    if (d.esInscrito) {
      markInscrito(regBtn);
      const pasado = eventoYaPaso(d);
      if (!pasado) {
        const fin = d.fechaFin ? new Date(d.fechaFin) : null;
        ingBtn.dataset.salaId = salaId;
        ingBtn.dataset.fechaInicio = d.fechaInicio || '';
        ingBtn.dataset.fechaFin = fin ? fin.toISOString() : '';
        ingBtn.dataset.url = `/Conferencia/Asistente/${encodeURIComponent(salaId)}`;
        ingBtn.style.display = '';
      }
      return;
    }

    const pasado = eventoYaPaso(d);
    regBtn.textContent = textoRegistro(d, cupos);
    regBtn.className = claseRegistro(d, cupos) + ' btn-sm';
    const bloqueado = cupos === 0 || pasado;
    regBtn.disabled = bloqueado;
    if (bloqueado) regBtn.setAttribute('aria-disabled', 'true');
    else regBtn.removeAttribute('aria-disabled');
  }

  function openDetalle(salaId) {
    fetch(`/Eventos/Detalle/${salaId}`)
      .then(r => {
        if (!r.ok) throw new Error('No encontrado');
        return r.json();
      })
      .then(d => {
        fillDetalleModal(d);
        if (typeof openModal === 'function') openModal(MODAL_ID);
      })
      .catch(() => {
        if (typeof showToast === 'function') {
          showToast({ title: 'Evento no disponible', message: 'No se pudo cargar el detalle.', type: 'error' });
        }
      });
  }

  document.addEventListener('click', e => {
    const verBtn = e.target.closest('.btn-ver-sala');
    if (verBtn) {
      e.preventDefault();
      openDetalle(verBtn.dataset.salaId);
      return;
    }

    const regBtn = e.target.closest('#detail-modal-reg-btn, .btn-reg-sala');
    if (regBtn && !e.target.closest('.btn-ingresar-evento')) {
      inscribirSala(regBtn, e);
      return;
    }

    const likeBtn = e.target.closest('.btn-like-sala');
    if (likeBtn) {
      e.preventDefault();
      toggleSeguir(likeBtn);
      return;
    }

    const closeBtn = e.target.closest('[data-close-modal]');
    if (closeBtn && typeof closeModal === 'function') {
      closeModal(closeBtn.dataset.closeModal);
    }
  });

  if (typeof GlobalPM !== 'undefined' && GlobalPM.init) GlobalPM.init();
  window.abrirDetalleEventoSala = openDetalle;
})();

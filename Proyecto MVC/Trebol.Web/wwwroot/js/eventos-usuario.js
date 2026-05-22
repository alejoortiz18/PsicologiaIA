/**
 * Eventos de usuario: detalle modal, inscripción, me gusta (seguir), mensaje al orador.
 */
(function () {
  const MODAL_ID = 'detail-modal';
  const cultura = { locale: 'es-CO' };

  function token() {
    return document.querySelector('input[name="__RequestVerificationToken"]')?.value ?? '';
  }

  function markInscrito(btn) {
    if (!btn) return;
    btn.textContent = '✓ Inscrito';
    btn.disabled = true;
    btn.classList.remove('btn-primary', 'btn-danger');
    btn.classList.add('btn-secondary', 'is-inscrito');
  }

  function syncCardInscrito(salaId) {
    document.querySelectorAll(`.room-card[data-sala-id="${salaId}"]`).forEach(card => {
      card.dataset.inscrito = '1';
      const reg = card.querySelector('.btn-reg-sala');
      markInscrito(reg);
    });
  }

  function inscribirSala(btn) {
    const salaId = btn.dataset.salaId;
    const titulo = btn.dataset.salaTitulo || 'esta sala';
    if (!salaId || btn.disabled) return;

    btn.disabled = true;
    fetch('/Inscripcion/Inscribir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'RequestVerificationToken': token()
      },
      body: `salaId=${encodeURIComponent(salaId)}&__RequestVerificationToken=${encodeURIComponent(token())}`
    })
      .then(r => r.json())
      .then(d => {
        if (d.exito) {
          markInscrito(btn);
          syncCardInscrito(salaId);
          const modalBtn = document.getElementById('detail-modal-reg-btn');
          markInscrito(modalBtn);
          if (typeof closeModal === 'function') closeModal(MODAL_ID);
          if (typeof showToast === 'function') {
            showToast({
              title: '¡Inscripción confirmada!',
              message: `Ya estás inscrito en “${titulo}”.`,
              type: 'success'
            });
          }
        } else {
          btn.disabled = false;
          if (typeof showToast === 'function') {
            showToast({ title: 'No se pudo inscribir', message: d.mensaje || 'Intenta de nuevo.', type: 'error' });
          }
        }
      })
      .catch(() => {
        btn.disabled = false;
        if (typeof showToast === 'function') {
          showToast({ title: 'Error de conexión', message: 'No pudimos completar la inscripción.', type: 'error' });
        }
      });
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
        btn.innerHTML = (liked ? '💚' : '🤍') + ' <span class="like-count">' + btn.querySelector('.like-count')?.textContent + '</span>';
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
    const iniciales = (d.nombreProfesional || '??').split(' ').filter(Boolean)
      .slice(0, 2).map(w => w[0].toUpperCase()).join('');

    document.getElementById('detail-modal-title').textContent = d.titulo || '—';
    document.getElementById('detail-modal-subtitle').textContent =
      [d.categoria, 'Conferencia pública'].filter(Boolean).join(' · ');
    document.getElementById('detail-modal-desc').textContent =
      d.descripcion || 'Sin descripción adicional para este evento.';

    const info = document.getElementById('detail-modal-info');
    const precio = d.precio <= 0 ? 'Entrada libre' : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(d.precio);
    const cupos = Math.max(0, d.capacidad - d.totalInscritos);
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
    msgBtn.dataset.pmProfesionalId = String(d.profesionalId);
    msgBtn.dataset.pmBg = 'var(--color-primary)';

    const perfilLink = document.getElementById('detail-modal-perfil-link');
    perfilLink.href = `/PerfilOrador/Index/${d.profesionalId}`;

    const regBtn = document.getElementById('detail-modal-reg-btn');
    regBtn.dataset.salaId = d.salaId;
    regBtn.dataset.salaTitulo = d.titulo;
    if (d.esInscrito) {
      markInscrito(regBtn);
    } else {
      regBtn.textContent = d.precio <= 0 ? 'Registrarse' : 'Registrarse';
      regBtn.disabled = false;
      regBtn.className = cupos > 0 && cupos <= 10 ? 'btn btn-danger btn-sm btn-reg-sala' : 'btn btn-primary btn-reg-sala';
      if (cupos === 0) {
        regBtn.textContent = 'Sin cupos';
        regBtn.disabled = true;
        regBtn.className = 'btn btn-secondary btn-reg-sala';
      }
    }
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

    const regBtn = e.target.closest('.btn-reg-sala');
    if (regBtn && !regBtn.disabled) {
      e.preventDefault();
      inscribirSala(regBtn);
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

  document.getElementById('detail-modal-reg-btn')?.addEventListener('click', function () {
    if (!this.disabled) inscribirSala(this);
  });

  if (typeof GlobalPM !== 'undefined' && GlobalPM.init) GlobalPM.init();
})();

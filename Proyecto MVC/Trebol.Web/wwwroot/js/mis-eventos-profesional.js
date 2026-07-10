(function () {
  'use strict';

  const table = document.getElementById('mis-eventos-table');
  if (!table) return;

  const tbody = table.querySelector('tbody');
  const allRows = Array.from(tbody.querySelectorAll('tr.me-fila'));
  const buscar = document.getElementById('me-buscar');
  const filtroEstado = document.getElementById('me-filtro-estado');
  const pageSizeSel = document.getElementById('me-page-size');
  const paginacion = document.getElementById('me-paginacion');
  const paginacionInfo = document.getElementById('me-paginacion-info');
  const token = document.querySelector('[name=__RequestVerificationToken]')?.value ?? '';

  let page = 1;
  let pageSize = 10;

  function filasVisibles() {
    const q = (buscar?.value ?? '').trim().toLowerCase();
    const est = filtroEstado?.value ?? '';
    return allRows.filter(tr => {
      const titulo = tr.dataset.titulo ?? '';
      const estado = tr.dataset.estado ?? '';
      if (q && !titulo.includes(q)) return false;
      if (est && estado !== est) return false;
      return true;
    });
  }

  function renderTabla() {
    const visibles = filasVisibles();
    const total = visibles.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (page > pages) page = pages;

    allRows.forEach(tr => { tr.style.display = 'none'; });
    const start = (page - 1) * pageSize;
    visibles.slice(start, start + pageSize).forEach(tr => { tr.style.display = ''; });

    if (paginacionInfo) {
      if (total === 0) {
        paginacionInfo.textContent = 'Sin resultados';
      } else {
        paginacionInfo.textContent = `Mostrando ${start + 1}–${Math.min(start + pageSize, total)} de ${total} salas`;
      }
    }

    if (!paginacion) return;
    paginacion.innerHTML = '';
    const mkBtn = (label, p, opts = {}) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pagination__btn' + (opts.active ? ' active' : '');
      btn.textContent = label;
      btn.disabled = !!opts.disabled;
      if (opts.aria) btn.setAttribute('aria-label', opts.aria);
      if (!opts.disabled && !opts.ellipsis) btn.addEventListener('click', () => { page = p; renderTabla(); });
      paginacion.appendChild(btn);
    };

    mkBtn('‹', page - 1, { disabled: page <= 1, aria: 'Anterior' });
    for (let i = 1; i <= pages; i++) {
      if (pages > 6 && i > 2 && i < pages - 1 && Math.abs(i - page) > 1) {
        if (i === 3 || i === pages - 2) {
          const span = document.createElement('span');
          span.className = 'pagination__btn';
          span.style.border = 'none';
          span.style.cursor = 'default';
          span.textContent = '…';
          paginacion.appendChild(span);
        }
        continue;
      }
      mkBtn(String(i), i, { active: i === page, aria: i === page ? 'Página actual' : undefined });
    }
    mkBtn('›', page + 1, { disabled: page >= pages, aria: 'Siguiente' });
  }

  buscar?.addEventListener('input', () => { page = 1; renderTabla(); });
  filtroEstado?.addEventListener('change', () => { page = 1; renderTabla(); });
  pageSizeSel?.addEventListener('change', () => {
    pageSize = parseInt(pageSizeSel.value, 10) || 10;
    page = 1;
    renderTabla();
  });

  const backdrop = document.getElementById('me-detalle-backdrop');
  const abrirDetalle = (btn) => {
    if (!backdrop) return;
    const titulo = btn.dataset.titulo ?? 'Sala';
    document.getElementById('me-detalle-title').textContent = titulo;
    document.getElementById('me-detalle-subtitle').textContent =
      `${btn.dataset.estado ?? ''} · ${btn.dataset.inscritos ?? 0} de ${btn.dataset.capacidad ?? 0} inscritos`;
    document.getElementById('me-det-horario').textContent = btn.dataset.horario ?? '—';
    document.getElementById('me-det-precio').textContent = btn.dataset.precio ?? '—';
    document.getElementById('me-det-inscritos').textContent =
      `${btn.dataset.inscritos ?? 0}/${btn.dataset.capacidad ?? 0}`;
    document.getElementById('me-det-estado').textContent = btn.dataset.estado ?? '—';
    document.getElementById('me-det-descripcion').textContent =
      btn.dataset.descripcion?.trim() || 'Sin descripción.';
    const link = document.getElementById('me-det-ver-completo');
    if (link && btn.dataset.salaId) link.href = `/Salas/Detalle/${btn.dataset.salaId}`;
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
  };

  const cerrarDetalle = () => {
    if (!backdrop) return;
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
  };

  document.querySelectorAll('.btn-me-detalle').forEach(btn => {
    btn.addEventListener('click', () => abrirDetalle(btn));
  });
  document.getElementById('me-detalle-cerrar')?.addEventListener('click', cerrarDetalle);
  document.getElementById('me-detalle-cerrar-footer')?.addEventListener('click', cerrarDetalle);
  backdrop?.addEventListener('click', e => { if (e.target === backdrop) cerrarDetalle(); });

  document.querySelectorAll('.btn-me-cerrar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const salaId = btn.dataset.salaId;
      const titulo = btn.dataset.titulo ?? 'esta sala';
      if (!salaId || !confirm(`¿Cerrar la sala "${titulo}"?`)) return;
      const res = await fetch('/Salas/Cerrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'RequestVerificationToken': token
        },
        body: `salaId=${encodeURIComponent(salaId)}`
      });
      const data = await res.json();
      if (typeof showToast === 'function') {
        showToast({ title: data.mensaje, type: data.exito ? 'success' : 'error' });
      } else {
        alert(data.mensaje);
      }
      if (data.exito) location.reload();
    });
  });

  renderTabla();
})();

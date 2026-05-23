(function () {
  'use strict';
  const cfg = window.perfilOradorCal;
  if (!cfg) return;

  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const work = {};
  (cfg.disponibilidad || []).forEach(h => {
    const from = parseInt((h.inicio || '08:00').split(':')[0], 10);
    const to = parseInt((h.fin || '18:00').split(':')[0], 10);
    work[h.dia] = { from, to };
  });

  const booked = {};
  (cfg.citas || []).forEach(c => {
    const d = new Date(c.fechaHora);
    const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
    if (!booked[key]) booked[key] = [];
    const h = d.getHours();
    const dur = c.duracionMinutos || 60;
    for (let i = 0; i < dur / 60; i++) booked[key].push(h + i);
  });

  function dateKey(y, m, d) { return `${y}-${m}-${d}`; }
  function isBlocked(y, m, d) {
    const day = new Date(y, m, d);
    for (const b of cfg.bloqueos || []) {
      const ini = new Date(b.inicio), fin = new Date(b.fin);
      if (day >= ini && day <= fin) return true;
    }
    return false;
  }

  function slotStatus(y, m, d, hour) {
    const dow = new Date(y, m, d).getDay();
    const w = work[dow];
    if (!w || hour < w.from || hour >= w.to) return 'off';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const cur = new Date(y, m, d);
    if (cur < today) return 'past';
    if (isBlocked(y, m, d)) return 'off';
    const key = dateKey(y, m, d);
    const hrs = booked[key] || [];
    if (hrs.includes(hour)) {
      const mine = (cfg.citas || []).some(c => {
        const dt = new Date(c.fechaHora);
        return cfg.usuarioId && c.usuarioId === cfg.usuarioId
          && dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d
          && dt.getHours() === hour;
      });
      return mine ? 'mine' : 'busy';
    }
    return 'free';
  }

  let view = 'semanal';
  let viewYear, viewMonth, weekStart;

  function initDates() {
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
    const dow = now.getDay();
    weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
    weekStart.setHours(0, 0, 0, 0);
  }

  function render() {
    const title = document.getElementById('tcal-nav-title');
    const content = document.getElementById('tcal-content');
    if (!title || !content) return;

    if (view === 'mensual') {
      title.textContent = `${MESES[viewMonth]} ${viewYear}`;
      renderMonth(content);
    } else {
      const end = new Date(weekStart); end.setDate(end.getDate() + 6);
      title.textContent = `${weekStart.getDate()} – ${end.getDate()} ${MESES[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
      renderWeek(content);
    }
  }

  function renderMonth(el) {
    let html = '<div class="tcal-month-grid">';
    ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].forEach(h => { html += `<div class="tcal-month-head">${h}</div>`; });
    const first = new Date(viewYear, viewMonth, 1).getDay();
    const offset = first === 0 ? 6 : first - 1;
    const days = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = new Date();
    for (let i = 0; i < offset; i++) html += '<div></div>';
    for (let d = 1; d <= days; d++) {
      const dow = new Date(viewYear, viewMonth, d).getDay();
      const w = work[dow];
      let free = 0;
      if (w) {
        for (let h = w.from; h < w.to; h++) if (slotStatus(viewYear, viewMonth, d, h) === 'free') free++;
      }
      const past = new Date(viewYear, viewMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const busy = free === 0 && w && !past;
      html += `<div class="tcal-day-cell ${past ? 'is-past' : ''} ${busy ? 'is-busy' : ''} ${!w ? 'is-off' : ''}">
        <div class="tcal-day-num">${d}</div>
        ${free > 0 ? `<div class="tcal-day-slots">${free} hueco${free > 1 ? 's' : ''}</div>` : ''}
      </div>`;
    }
    html += '</div>';
    el.innerHTML = html;
  }

  function renderWeek(el) {
    let html = '<div class="tcal-week-grid"><div class="tcal-week-row"><div></div>';
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart); d.setDate(d.getDate() + i);
      html += `<div style="text-align:center;font-weight:700;font-size:.75rem;padding:4px;">${DIAS[d.getDay()]} ${d.getDate()}</div>`;
    }
    html += '</div>';
    const hours = [];
    for (let h = 7; h <= 19; h++) hours.push(h);
    hours.forEach(hour => {
      html += '<div class="tcal-week-row"><div class="tcal-week-hour">' + String(hour).padStart(2, '0') + ':00</div>';
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart); d.setDate(d.getDate() + i);
        const st = slotStatus(d.getFullYear(), d.getMonth(), d.getDate(), hour);
        const cls = st === 'free' ? 'is-free' : st === 'busy' ? 'is-busy' : st === 'mine' ? 'is-mine' : 'is-off';
        const label = st === 'busy' ? 'Ocupado' : st === 'mine' ? 'Mi cita' : st === 'free' ? '+' : '';
        html += `<div class="tcal-week-slot ${cls}" data-y="${d.getFullYear()}" data-m="${d.getMonth()}" data-d="${d.getDate()}" data-h="${hour}" data-st="${st}">${label}</div>`;
      }
      html += '</div>';
    });
    html += '</div>';
    el.innerHTML = html;
    el.querySelectorAll('.tcal-week-slot.is-free').forEach(cell => {
      cell.addEventListener('click', () => {
        if (!cfg.puedeAgendar) return;
        const y = +cell.dataset.y, m = +cell.dataset.m, d = +cell.dataset.d, h = +cell.dataset.h;
        const dt = new Date(y, m, d, h, 0, 0);
        const iso = dt.toISOString().slice(0, 16);
        window.location.href = cfg.nuevaCitaUrl + (cfg.nuevaCitaUrl.includes('?') ? '&' : '?') + 'fechaHora=' + encodeURIComponent(iso);
      });
    });
  }

  document.querySelectorAll('.tcal-vpill').forEach(btn => {
    btn.addEventListener('click', () => {
      view = btn.dataset.view;
      document.querySelectorAll('.tcal-vpill').forEach(b => {
        b.classList.toggle('active', b.dataset.view === view);
        b.setAttribute('aria-pressed', b.dataset.view === view ? 'true' : 'false');
      });
      render();
    });
  });

  document.getElementById('tcal-prev')?.addEventListener('click', () => {
    if (view === 'mensual') {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    } else {
      weekStart.setDate(weekStart.getDate() - 7);
    }
    render();
  });

  document.getElementById('tcal-next')?.addEventListener('click', () => {
    if (view === 'mensual') {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    } else {
      weekStart.setDate(weekStart.getDate() + 7);
    }
    render();
  });

  document.getElementById('tcal-hoy')?.addEventListener('click', () => {
    initDates();
    render();
  });

  initDates();
  render();
})();

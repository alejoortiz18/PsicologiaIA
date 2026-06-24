(function () {
  'use strict';

  const cfg = window.perfilOradorCal;
  if (!cfg) return;

  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const DAYS_SH = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const DAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const HOUR_H = 64;
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  const work = {};
  (cfg.disponibilidad || []).forEach(h => {
    const from = parseInt((h.inicio || '08:00').split(':')[0], 10);
    const to = parseInt((h.fin || '18:00').split(':')[0], 10);
    work[h.dia] = { from, to };
  });

  let H_START = 8;
  let H_END = 18;
  Object.values(work).forEach(w => {
    H_START = Math.min(H_START, w.from);
    H_END = Math.max(H_END, w.to);
  });
  if (!Object.keys(work).length) {
    H_START = 8;
    H_END = 18;
  }

  const ES_PROPIETARIO = !!cfg.esVistaPropietario;
  const ES_USUARIO = !!cfg.esVistaUsuario;

  function esVisitanteAgenda() {
    return !!cfg.usuarioId && !ES_PROPIETARIO && !ES_USUARIO;
  }
  const slotMeta = {};
  const SLOT_RANK = { owner: 4, mine: 3, public: 2, busy: 1 };

  /** Amplía el eje horario para incluir todas las citas/eventos (no solo el horario semanal). */
  function expandirHorarioPorAgenda() {
    let hStart = H_START;
    let hEnd = H_END;
    (cfg.citas || []).forEach(c => {
      const d = parseSlotDate(c.fechaHora);
      if (Number.isNaN(d.getTime())) return;
      const h = d.getHours();
      const endH = h + Math.max(1, Math.ceil((c.duracionMinutos || 60) / 60));
      hStart = Math.min(hStart, h);
      hEnd = Math.max(hEnd, endH);
    });
    H_START = Math.max(0, hStart - 1);
    H_END = Math.min(24, Math.max(hEnd + 1, H_START + 1));
  }

  function initUsuarioWorkHours() {
    expandirHorarioPorAgenda();
    for (let d = 0; d <= 6; d++) {
      work[d] = { from: H_START, to: H_END };
    }
  }

  function dayHasEvents(y, m, d) {
    const key = dateKey(y, m, d);
    return Object.keys(slotMeta).some(k => k.startsWith(`${key}|`));
  }

  function countDayEvents(y, m, d) {
    const key = dateKey(y, m, d);
    return Object.keys(slotMeta).filter(k => k.startsWith(`${key}|`)).length;
  }

  function escHtml(s) {
    const el = document.createElement('div');
    el.textContent = s || '';
    return el.innerHTML;
  }

  function slotKind(c) {
    if (ES_USUARIO) {
      if (c.tipoSlot === 'EventoPublico') return 'public';
      if (c.esDetalleVisible) return 'mine';
      return 'busy';
    }
    if (ES_PROPIETARIO) {
      if (c.tipoSlot === 'EventoPublico') return 'public';
      return 'owner';
    }
    if (c.tipoSlot === 'EventoPublico') return 'public';
    if (c.esDetalleVisible) return 'mine';
    return 'busy';
  }

  function setSlotMeta(key, meta) {
    const existing = slotMeta[key];
    if (!existing || SLOT_RANK[meta.kind] > SLOT_RANK[existing.kind]) {
      slotMeta[key] = meta;
    }
  }

  function parseSlotDate(iso) {
    if (!iso) return new Date(NaN);
    const s = String(iso);
    const m = s.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], 0);
    return new Date(iso);
  }

  (cfg.citas || []).forEach(c => {
    const d = parseSlotDate(c.fechaHora);
    if (Number.isNaN(d.getTime())) return;
    const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
    const h0 = d.getHours();
    const startMin = h0 * 60 + d.getMinutes();
    const durRaw = c.duracionMinutos || 60;
    const dur = (c.tipoSlot === 'EventoPublico' && durRaw > 480) ? 60 : Math.min(durRaw, 480);
    const kind = slotKind(c);
    const meta = {
      kind,
      etiqueta: c.etiqueta || (kind === 'busy' ? 'Ocupado' : 'Mi cita'),
      subtitulo: c.subtitulo || '',
      tipoSlot: c.tipoSlot || '',
      refId: c.citaId || null,
      fechaHora: c.fechaHora,
      duracionMinutos: c.duracionMinutos || 60,
      estadoCita: c.estadoCita || '',
      nombreCliente: c.nombreCliente || '',
      tipoCita: c.tipoCita || '',
      salaId: c.salaId || null
    };
    for (let m = startMin; m < startMin + dur; m += 60) {
      setSlotMeta(`${key}|${Math.floor(m / 60)}`, meta);
    }
  });

  if (ES_USUARIO) initUsuarioWorkHours();
  else if (ES_PROPIETARIO || esVisitanteAgenda()) expandirHorarioPorAgenda();

  const blockedDays = new Set();
  (cfg.bloqueos || []).forEach(b => {
    const ini = startOfDay(new Date(b.inicio));
    const fin = startOfDay(new Date(b.fin));
    for (let d = new Date(ini); d <= fin; d.setDate(d.getDate() + 1)) {
      blockedDays.add(dateKey(d.getFullYear(), d.getMonth(), d.getDate()));
    }
  });

  let currentView = 'semanal';
  let viewYear = TODAY.getFullYear();
  let viewMonth = TODAY.getMonth();
  let viewWeekStart = mondayOf(TODAY);
  let viewDay = new Date(TODAY);

  function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function mondayOf(date) {
    const d = new Date(date);
    const dow = d.getDay();
    d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function dateKey(y, m, d) {
    return `${y}-${m}-${d}`;
  }

  function fmt2(n) {
    return String(n).padStart(2, '0');
  }

  function fmtLocalDateTimeParam(y, m, d, h, min) {
    return `${y}-${fmt2(m + 1)}-${fmt2(d)}T${fmt2(h)}:${fmt2(min || 0)}`;
  }

  function fmtTime(h) {
    return `${fmt2(h)}:00`;
  }

  function slotDateTime(y, m, d, h) {
    return new Date(y, m, d, h, 0, 0, 0);
  }

  function isSlotPast(y, m, d, h) {
    return slotDateTime(y, m, d, h) < new Date();
  }

  function freeSlots(y, m, d) {
    const dow = new Date(y, m, d).getDay();
    const w = work[dow];
    const from = w ? w.from : H_START;
    const to = w ? w.to : H_END;
    let n = 0;
    for (let h = from; h < to; h++) {
      if (getSlotStatus(y, m, d, h) === 'free') n++;
    }
    return n;
  }

  function getDayStatus(y, m, d) {
    if (ES_USUARIO) {
      const date = new Date(y, m, d);
      if (date < TODAY && !dayHasEvents(y, m, d)) return 'past';
      return dayHasEvents(y, m, d) ? 'available' : 'off';
    }
    if (ES_PROPIETARIO) {
      if (dayHasEvents(y, m, d)) {
        const free = freeSlots(y, m, d);
        return free > 0 ? 'available' : 'occupied';
      }
      const date = new Date(y, m, d);
      const dow = date.getDay();
      if (!work[dow]) return 'off';
      if (date < TODAY) return 'past';
      if (blockedDays.has(dateKey(y, m, d))) return 'off';
      return 'available';
    }
    const date = new Date(y, m, d);
    const dow = date.getDay();
    if (!work[dow]) return 'off';
    if (date < TODAY) return 'past';
    if (blockedDays.has(dateKey(y, m, d))) return 'off';
    const free = freeSlots(y, m, d);
    if (free === 0) return 'occupied';
    return 'available';
  }

  function getSlotStatus(y, m, d, h) {
    if (ES_USUARIO) {
      const meta = slotMeta[`${dateKey(y, m, d)}|${h}`];
      if (meta) {
        if (meta.kind === 'public') return 'public-event';
        if (meta.kind === 'mine') return 'my-booking';
        return 'booked';
      }
      if (isSlotPast(y, m, d, h)) return 'past';
      return 'off';
    }
    if (ES_PROPIETARIO) {
      const meta = slotMeta[`${dateKey(y, m, d)}|${h}`];
      if (meta) {
        if (meta.kind === 'public') return 'public-event';
        if (meta.kind === 'owner') return 'owner-booking';
        return 'booked';
      }
      const dow = new Date(y, m, d).getDay();
      const w = work[dow];
      if (!w || h < w.from || h >= w.to) return 'off';
      if (blockedDays.has(dateKey(y, m, d))) return 'off';
      if (isSlotPast(y, m, d, h)) return 'past';
      return 'free';
    }
    const dow = new Date(y, m, d).getDay();
    const w = work[dow];
    const meta = slotMeta[`${dateKey(y, m, d)}|${h}`];
    if (meta) {
      if (meta.kind === 'owner') return 'owner-booking';
      if (meta.kind === 'mine') return 'my-booking';
      if (meta.kind === 'public') return 'public-event';
      return 'booked';
    }
    if (!w || h < w.from || h >= w.to) return 'off';
    const date = new Date(y, m, d);
    if (date < TODAY) return 'past';
    if (isSlotPast(y, m, d, h)) return 'past';
    if (blockedDays.has(dateKey(y, m, d))) return 'off';
    return 'free';
  }

  function hourIsOccupied(y, m, d, h) {
    const st = getSlotStatus(y, m, d, h);
    return st === 'owner-booking' || st === 'my-booking' || st === 'public-event'
      || st === 'booked' || st === 'busy';
  }

  function getDayBlockMetas(y, m, d) {
    const keyPrefix = `${dateKey(y, m, d)}|`;
    const seen = new Set();
    const blocks = [];
    Object.keys(slotMeta).forEach(k => {
      if (!k.startsWith(keyPrefix)) return;
      const meta = slotMeta[k];
      const refKey = `${meta.refId}|${meta.tipoSlot}|${meta.fechaHora}`;
      if (seen.has(refKey)) return;
      seen.add(refKey);
      const start = parseSlotDate(meta.fechaHora);
      if (Number.isNaN(start.getTime())) return;
      blocks.push({
        meta,
        startH: start.getHours(),
        startM: start.getMinutes(),
        durMin: meta.duracionMinutos || 60
      });
    });
    blocks.sort((a, b) => (a.startH * 60 + a.startM) - (b.startH * 60 + b.startM));
    return blocks;
  }

  function semanaTieneActividad(weekStart) {
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      if (dayHasEvents(d.getFullYear(), d.getMonth(), d.getDate())) return true;
    }
    return false;
  }

  function irASemanaConActividad() {
    if (currentView !== 'semanal' || semanaTieneActividad(viewWeekStart)) return;
    const citas = cfg.citas || [];
    if (!citas.length) return;
    const pickNearest = (list) => {
      let nearest = null;
      let minDist = Infinity;
      list.forEach(c => {
        const d = parseSlotDate(c.fechaHora);
        if (Number.isNaN(d.getTime())) return;
        const day = startOfDay(d);
        const dist = Math.abs(day.getTime() - TODAY.getTime());
        if (dist < minDist) {
          minDist = dist;
          nearest = day;
        }
      });
      return nearest;
    };
    const privadas = citas.filter(c => c.tipoSlot === 'CitaPrivada');
    const pool = ES_PROPIETARIO && privadas.length ? privadas : citas;
    const nearest = pickNearest(pool);
    if (nearest) {
      viewWeekStart = mondayOf(nearest);
      viewDay = new Date(nearest);
    }
  }

  function esVisitanteUsuarioLogueado() {
    return !!cfg.usuarioId && !ES_PROPIETARIO;
  }

  function slotEsClicable(meta) {
    if (!meta || !meta.refId) return false;
    if (ES_PROPIETARIO) return meta.kind === 'owner' || meta.kind === 'public';
    if (esVisitanteUsuarioLogueado()) return meta.kind === 'mine' || meta.kind === 'public';
    return false;
  }

  function abrirDetalleCalendario(tipo, refId, meta) {
    if (tipo === 'cita' && typeof window.abrirDetalleCita === 'function') {
      window.abrirDetalleCita(refId);
      return;
    }
    if (tipo === 'evento') {
      const salaId = meta?.salaId;
      if (salaId && typeof window.abrirDetalleEventoSala === 'function') {
        window.abrirDetalleEventoSala(salaId);
      } else if (typeof window.abrirDetalleEventoCalendario === 'function' && meta) {
        window.abrirDetalleEventoCalendario(meta);
      }
    }
  }

  function renderOccupiedBlock(meta, top, height, extraCls) {
    const cls = extraCls || (meta.kind === 'owner' ? 'tcw-owner-block'
      : meta.kind === 'mine' ? 'tcw-my-block'
      : meta.kind === 'public' ? 'tcw-public-block' : 'tcw-occ-block');
    const icon = meta.kind === 'owner' ? '👤' : meta.kind === 'mine' ? '✓' : meta.kind === 'public' ? '📢' : '🔒';
    const sub = meta.subtitulo
      ? `<div class="tcw-b-time">${escHtml(meta.subtitulo)}</div>`
      : '';
    const disabled = meta.kind === 'busy' ? ' aria-disabled="true"' : '';
    const clickable = slotEsClicable(meta);
    const clickCls = clickable ? ' tcw-block--clickable' : '';
    const clickAttrs = clickable
      ? ` tabindex="0" role="button" data-cal-slot="1" data-tipo-slot="${meta.tipoSlot === 'EventoPublico' ? 'evento' : 'cita'}" data-ref-id="${meta.refId}" data-sala-id="${meta.salaId || ''}" aria-label="Ver detalle"`
      : '';
    return `<div class="${cls}${clickCls}" style="top:${top + 2}px;height:${height - 4}px;"${disabled}${clickAttrs}>
      <span class="tcw-b-icon">${icon}</span>
      <div><div class="tcw-b-title">${escHtml(meta.etiqueta)}</div>${sub}</div></div>`;
  }

  function bindCalendarioDetalle(root) {
    const activo = ES_PROPIETARIO || esVisitanteUsuarioLogueado();
    if (!activo || !root) return;
    root.querySelectorAll('[data-cal-slot]').forEach(el => {
      const open = () => {
        const tipo = el.getAttribute('data-tipo-slot');
        const refId = parseInt(el.getAttribute('data-ref-id') || '0', 10);
        if (!refId) return;
        const salaIdAttr = el.getAttribute('data-sala-id');
        const key = Object.keys(slotMeta).find(k => {
          const m = slotMeta[k];
          return m && m.refId === refId;
        });
        const meta = key ? { ...slotMeta[key] } : null;
        if (meta && salaIdAttr) meta.salaId = parseInt(salaIdAttr, 10) || meta.salaId;
        abrirDetalleCalendario(tipo, refId, meta);
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
  }

  function goToBooking(y, m, d, h) {
    if (isSlotPast(y, m, d, h)) {
      if (typeof showToast === 'function') {
        showToast({ title: 'Ese horario ya pasó. Elige una fecha y hora futura.', type: 'info' });
      }
      return;
    }
    if (!cfg.puedeAgendar) {
      if (typeof showToast === 'function') {
        showToast({ title: 'Debes iniciar sesión para agendar citas', type: 'info' });
      }
      return;
    }
    if (ES_PROPIETARIO || (cfg.miProfesionalId && cfg.miProfesionalId === cfg.profesionalId)) {
      if (typeof showToast === 'function') {
        showToast({
          title: ES_PROPIETARIO ? 'Gestiona tu agenda desde Horario semanal o Bloqueos' : 'No puedes agendar una cita contigo mismo',
          type: 'info'
        });
      }
      return;
    }
    const iso = fmtLocalDateTimeParam(y, m, d, h, 0);
    const sep = cfg.nuevaCitaUrl.includes('?') ? '&' : '?';
    window.location.href = `${cfg.nuevaCitaUrl}${sep}fechaHora=${encodeURIComponent(iso)}`;
  }

  function bindFreeSlot(el, y, m, d, h) {
    const handler = () => goToBooking(y, m, d, h);
    el.addEventListener('click', handler);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  }

  function setView(v) {
    currentView = v;
    document.querySelectorAll('.tcal-vpill').forEach(btn => {
      const on = btn.dataset.view === v;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    render();
  }

  function navigate(dir) {
    if (currentView === 'mensual') {
      viewMonth += dir;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    } else if (currentView === 'semanal') {
      viewWeekStart.setDate(viewWeekStart.getDate() + dir * 7);
    } else {
      viewDay.setDate(viewDay.getDate() + dir);
    }
    render();
  }

  function goToday() {
    viewYear = TODAY.getFullYear();
    viewMonth = TODAY.getMonth();
    viewWeekStart = mondayOf(TODAY);
    viewDay = new Date(TODAY);
    render();
  }

  function jumpToWeek(y, m, d) {
    viewDay = new Date(y, m, d);
    viewWeekStart = mondayOf(viewDay);
    setView('semanal');
  }

  function footerHint(text) {
    return `<div class="tcal-footer-hint">${text}</div>`;
  }

  function render() {
    const title = document.getElementById('tcal-nav-title');
    const content = document.getElementById('tcal-content');
    if (!title || !content) return;

    if (ES_USUARIO && !(cfg.citas || []).length) {
      title.textContent = 'Tu agenda';
      content.innerHTML = '<div class="tcal-empty"><div class="tcal-empty__icon">📅</div><div class="tcal-empty__msg">No tienes citas ni eventos en este periodo.<br><a href="/Directorio/Medicos">Agendar cita</a></div></div>';
      return;
    }

    if (!Object.keys(work).length && !ES_USUARIO) {
      title.textContent = 'Sin horario configurado';
      content.innerHTML = `<div class="tcal-empty"><div class="tcal-empty__icon">📅</div><div class="tcal-empty__msg">Este profesional aún no ha configurado su disponibilidad.</div></div>`;
      return;
    }

    if (currentView === 'semanal') renderWeekly(title, content);
    else if (currentView === 'diario') renderDaily(title, content);
    else renderMonthly(title, content);
  }

  function renderWeekly(title, content) {
    const TOTAL_H = H_END - H_START;
    const PX_MIN = HOUR_H / 60;
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(viewWeekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    const y0 = days[0];
    const y6 = days[6];
    title.textContent = y0.getMonth() === y6.getMonth()
      ? `${y0.getDate()} – ${y6.getDate()} de ${MESES[y0.getMonth()]} ${y0.getFullYear()}`
      : `${y0.getDate()} ${MESES[y0.getMonth()]} – ${y6.getDate()} ${MESES[y6.getMonth()]} ${y6.getFullYear()}`;

    let html = '<div class="tcw-header-row"><div class="tcw-header-spacer"></div>';
    days.forEach((d, i) => {
      const isToday = d.getTime() === TODAY.getTime();
      const y = d.getFullYear();
      const m = d.getMonth();
      const dd = d.getDate();
      const dayStatus = getDayStatus(y, m, dd);
      const isPast = d < TODAY;
      const dow = d.getDay();
      const w = work[dow];
      const free = (!isPast && dayStatus === 'available' && !ES_USUARIO) ? freeSlots(y, m, dd) : 0;
      const sub = ES_USUARIO
        ? (dayHasEvents(y, m, dd) ? 'Con actividad' : (isPast ? 'Pasado' : 'Sin citas'))
        : (isPast ? 'Pasado' : (!w || dayStatus === 'off') ? 'No disponible'
          : dayHasEvents(y, m, dd) && free === 0 ? 'Con citas'
          : free > 0 ? `${free} libre${free > 1 ? 's' : ''}` : 'Sin espacios');
      const subColor = ES_USUARIO
        ? (dayHasEvents(y, m, dd) ? '#2D6A4F' : 'inherit')
        : ((free > 0 && !isToday) ? '#2D6A4F' : 'inherit');
      let cls = 'tcw-day-header';
      if (!ES_USUARIO && (!w || dayStatus === 'off')) cls += ' is-off';
      if (ES_USUARIO && !dayHasEvents(y, m, dd) && !isPast) cls += ' is-off';
      html += `<div class="${cls}">
        <div class="tcw-day-name">${DAYS_SH[i]}</div>
        <div class="tcw-day-num">${isToday ? `<span class="tcw-today-badge">${dd}</span>` : dd}</div>
        <div class="tcw-day-sub" style="color:${subColor}">${sub}</div>
      </div>`;
    });
    html += '</div>';

    const colH = (TOTAL_H + 1) * HOUR_H;
    html += '<div class="tcw-body-scroll"><div class="tcw-body-grid">';

    html += '<div class="tcw-time-col">';
    for (let h = H_START; h <= H_END; h++) {
      html += `<div class="tcw-time-slot"><span class="tcw-time-label">${fmtTime(h)}</span></div>`;
    }
    html += '</div>';

    days.forEach(d => {
      const y = d.getFullYear();
      const m = d.getMonth();
      const dd = d.getDate();
      const isToday = d.getTime() === TODAY.getTime();
      const dow = d.getDay();
      const w = work[dow];
      const dayStatus = getDayStatus(y, m, dd);
      const isPast = d < TODAY;

      html += `<div class="tcw-day-col${isToday ? ' is-today-col' : ''}" style="height:${colH}px;">`;
      html += `<div class="tcw-hour-bg" style="height:${TOTAL_H * HOUR_H}px;"></div>`;

      if (!w) {
        html += `<div class="tcw-off-region" style="top:0;height:${TOTAL_H * HOUR_H}px;"></div>`;
      } else {
        if (w.from > H_START) {
          html += `<div class="tcw-off-region" style="top:0;height:${(w.from - H_START) * HOUR_H}px;"></div>`;
        }
        if (w.to < H_END) {
          html += `<div class="tcw-off-region" style="top:${(w.to - H_START) * HOUR_H}px;height:${(H_END - w.to) * HOUR_H}px;"></div>`;
        }
      }

      if (ES_USUARIO) {
        getDayBlockMetas(y, m, dd).forEach(({ meta, startH, startM, durMin }) => {
          const top = (startH - H_START) * HOUR_H + startM * PX_MIN;
          html += renderOccupiedBlock(meta, top, durMin * PX_MIN);
        });
      } else if (ES_PROPIETARIO) {
        getDayBlockMetas(y, m, dd).forEach(({ meta, startH, startM, durMin }) => {
          const top = (startH - H_START) * HOUR_H + startM * PX_MIN;
          html += renderOccupiedBlock(meta, top, durMin * PX_MIN);
        });
        for (let h = H_START; h < H_END; h++) {
          const st = getSlotStatus(y, m, dd, h);
          if (hourIsOccupied(y, m, dd, h)) continue;
          const top = (h - H_START) * HOUR_H;
          if (st === 'free') {
            html += `<div class="tcw-free-slot" style="top:${top}px;height:${HOUR_H}px;" tabindex="0" role="button" data-y="${y}" data-m="${m}" data-d="${dd}" data-h="${h}" aria-label="Disponible ${fmtTime(h)}">
              <div class="tcw-free-hint"><div class="tcw-free-hint-pill">＋ ${fmtTime(h)}</div></div></div>`;
          } else if (st === 'past') {
            html += `<div class="tcw-past-hour" style="top:${top}px;height:${HOUR_H}px;" aria-hidden="true"></div>`;
          }
        }
      } else if (isPast) {
        getDayBlockMetas(y, m, dd).forEach(({ meta, startH, startM, durMin }) => {
          const top = (startH - H_START) * HOUR_H + startM * PX_MIN;
          html += renderOccupiedBlock(meta, top, durMin * PX_MIN);
        });
        html += `<div class="tcw-past-overlay" style="height:${TOTAL_H * HOUR_H}px;"></div>`;
      } else {
        getDayBlockMetas(y, m, dd).forEach(({ meta, startH, startM, durMin }) => {
          const top = (startH - H_START) * HOUR_H + startM * PX_MIN;
          html += renderOccupiedBlock(meta, top, durMin * PX_MIN);
        });
        if (w && dayStatus !== 'off') {
          for (let h = H_START; h < H_END; h++) {
            if (hourIsOccupied(y, m, dd, h)) continue;
            const st = getSlotStatus(y, m, dd, h);
            const top = (h - H_START) * HOUR_H;
            if (st === 'free') {
              html += `<div class="tcw-free-slot" style="top:${top}px;height:${HOUR_H}px;" tabindex="0" role="button" data-y="${y}" data-m="${m}" data-d="${dd}" data-h="${h}" aria-label="Disponible ${fmtTime(h)}">
                <div class="tcw-free-hint"><div class="tcw-free-hint-pill">＋ ${fmtTime(h)}</div></div></div>`;
            } else if (st === 'past') {
              html += `<div class="tcw-past-hour" style="top:${top}px;height:${HOUR_H}px;" aria-hidden="true"></div>`;
            }
          }
        }
      }

      if (isToday) {
        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        const startMin = H_START * 60;
        const endMin = H_END * 60;
        if (nowMin >= startMin && nowMin <= endMin) {
          html += `<div class="tcw-now-line" style="top:${(nowMin - startMin) * PX_MIN}px;"><div class="tcw-now-dot"></div></div>`;
        }
      }
      html += '</div>';
    });

    html += '</div></div>';
    html += footerHint(ES_USUARIO
      ? 'Tus citas y eventos inscritos · Usa ‹ › para navegar entre semanas'
      : ES_PROPIETARIO
        ? 'Citas privadas y eventos públicos · Clic en un bloque para ver detalle · Espacio libre = disponible para agendar'
        : 'Haz clic en un espacio libre para agendar · Usa ‹ › para navegar entre semanas');
    content.innerHTML = html;

    if (!ES_USUARIO) {
      content.querySelectorAll('.tcw-free-slot').forEach(el => {
        bindFreeSlot(el, +el.dataset.y, +el.dataset.m, +el.dataset.d, +el.dataset.h);
      });
    }
    bindCalendarioDetalle(content);

    const bodyScroll = content.querySelector('.tcw-body-scroll');
    if (bodyScroll) {
      const now = new Date();
      const targetTop = Math.max(0, (now.getHours() - H_START - 1) * HOUR_H);
      bodyScroll.scrollTop = targetTop;
    }
  }

  function renderMonthly(title, content) {
    title.textContent = `${MESES[viewMonth]} ${viewYear}`;
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const offset = firstDow === 0 ? 6 : firstDow - 1;

    let html = '<div class="tcal-month-wrap"><div class="tcal-month-grid">';
    DAYS_SH.forEach(d => { html += `<div class="tcal-mhdr">${d}</div>`; });
    for (let i = 0; i < offset; i++) html += '<div class="tcal-mday off"></div>';

    for (let d = 1; d <= daysInMonth; d++) {
      const status = getDayStatus(viewYear, viewMonth, d);
      const isToday = viewYear === TODAY.getFullYear() && viewMonth === TODAY.getMonth() && d === TODAY.getDate();
      let cls = 'tcal-mday';
      let sub = '';
      let extra = '';
      if (ES_USUARIO || ES_PROPIETARIO) {
        if (dayHasEvents(viewYear, viewMonth, d)) {
          cls += ' avail';
          const n = countDayEvents(viewYear, viewMonth, d);
          sub = `<span class="tcal-mday__sub">${n} en agenda</span>`;
          extra = `data-y="${viewYear}" data-m="${viewMonth}" data-d="${d}" role="button" tabindex="0" class="tcal-mday-jump"`;
        } else if (new Date(viewYear, viewMonth, d) < TODAY) {
          cls += ' off past';
        } else {
          cls += ES_PROPIETARIO ? ' off' : ' off';
        }
      } else if (status === 'available') {
        const free = freeSlots(viewYear, viewMonth, d);
        cls += ' avail';
        sub = `<span class="tcal-mday__sub">${free} libre${free !== 1 ? 's' : ''}</span>`;
        extra = `data-y="${viewYear}" data-m="${viewMonth}" data-d="${d}" role="button" tabindex="0" class="tcal-mday-jump"`;
      } else if (status === 'occupied') {
        cls += ' occupied';
        sub = '<span class="tcal-mday__sub" style="color:#9E9E9E;">Sin espacios</span>';
      } else if (status === 'past') {
        cls += ' off past';
      } else {
        cls += ' off';
      }
      if (isToday) cls += ' today-cell';
      html += `<div class="${cls}" ${extra}><span>${d}</span>${sub}</div>`;
    }
    html += '</div><p style="font-size:.78rem;color:var(--color-text-muted);text-align:center;">'
      + (ES_USUARIO ? 'Haz clic en un día con actividad para abrir esa semana' : 'Haz clic en un día verde para abrir esa semana')
      + '</p></div>';
    content.innerHTML = html;

    content.querySelectorAll('.tcal-mday-jump').forEach(el => {
      const handler = () => jumpToWeek(+el.dataset.y, +el.dataset.m, +el.dataset.d);
      el.addEventListener('click', handler);
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
      });
    });
  }

  function renderDaily(title, content) {
    const y = viewDay.getFullYear();
    const m = viewDay.getMonth();
    const d = viewDay.getDate();
    const dow = viewDay.getDay();
    const w = work[dow];
    const dayStatus = getDayStatus(y, m, d);
    title.textContent = `${DAYS_FULL[dow]}, ${d} de ${MESES[m]} ${y}`;

    const nav = `<div class="tcal-daily-nav">
      <button type="button" class="btn btn-ghost btn-sm tcal-daily-prev">← Anterior</button>
      <button type="button" class="btn btn-ghost btn-sm tcal-daily-next">Siguiente →</button>
    </div>`;

    if (!ES_USUARIO && !ES_PROPIETARIO && (!w || dayStatus === 'off')) {
      content.innerHTML = nav + `<div class="tcal-empty"><div class="tcal-empty__icon">🚫</div><div class="tcal-empty__msg">${!w ? `La profesional no atiende los ${DAYS_FULL[dow]}s` : 'Este día no está disponible'}</div></div>`;
      bindDailyNav(content);
      return;
    }
    if (!ES_USUARIO && !ES_PROPIETARIO && dayStatus === 'occupied' && !dayHasEvents(y, m, d)) {
      content.innerHTML = nav + `<div class="tcal-empty"><div class="tcal-empty__icon">⏰</div><div class="tcal-empty__msg">Todos los horarios están ocupados</div></div>`;
      bindDailyNav(content);
      return;
    }

    if (ES_USUARIO && !dayHasEvents(y, m, d)) {
      content.innerHTML = nav + '<div class="tcal-empty"><div class="tcal-empty__icon">📅</div><div class="tcal-empty__msg">No tienes citas ni eventos este día</div></div>';
      bindDailyNav(content);
      return;
    }

    const hourFrom = (ES_USUARIO || ES_PROPIETARIO) ? H_START : w.from;
    const hourTo = (ES_USUARIO || ES_PROPIETARIO) ? H_END : w.to;

    let html = nav + '<div class="tcal-daily">';
    for (let h = hourFrom; h < hourTo; h++) {
      const status = getSlotStatus(y, m, d, h);
      let cellCls = 'tcal-drow__cell';
      let inner = '';
      let attrs = '';

      if (status === 'free') {
        cellCls += ' free';
        inner = `<div class="tcal-drow-evt free-lbl">
          <span style="color:var(--color-primary);font-weight:600;">${fmtTime(h)} – ${fmtTime(h + 1)} <span style="font-weight:400;color:var(--color-text-muted);">· Disponible</span></span>
          <span class="tcal-drow-cta">＋ Agendar</span></div>`;
        attrs = `data-y="${y}" data-m="${m}" data-d="${d}" data-h="${h}" tabindex="0" role="button" class="tcal-drow-book"`;
      } else if (status === 'owner-booking' || status === 'my-booking' || status === 'public-event' || status === 'booked') {
        const meta = slotMeta[`${dateKey(y, m, d)}|${h}`] || { kind: 'busy', etiqueta: 'Ocupado', subtitulo: '' };
        const clickDaily = slotEsClicable(meta);
        if (clickDaily) {
          attrs = ` tabindex="0" role="button" data-cal-slot="1" data-tipo-slot="${meta.tipoSlot === 'EventoPublico' ? 'evento' : 'cita'}" data-ref-id="${meta.refId}" data-sala-id="${meta.salaId || ''}" class="tcal-drow-cal-slot"`;
        }
        if (status === 'owner-booking') {
          cellCls += ' owner-booking-cell';
          inner = `<div class="tcal-drow-evt owner-lbl"><span>👤 ${escHtml(meta.etiqueta)}</span>${meta.subtitulo ? `<span class="tcal-drow-sub">${escHtml(meta.subtitulo)}</span>` : ''}</div>`;
        } else if (status === 'my-booking') {
          cellCls += ' my-reserved-cell';
          inner = `<div class="tcal-drow-evt my-lbl"><span>✓ ${escHtml(meta.etiqueta)}</span>${meta.subtitulo ? `<span class="tcal-drow-sub">${escHtml(meta.subtitulo)}</span>` : ''}</div>`;
        } else if (status === 'public-event') {
          cellCls += ' public-event-cell';
          inner = `<div class="tcal-drow-evt public-lbl"><span>📢 ${escHtml(meta.etiqueta)}</span>${meta.subtitulo ? `<span class="tcal-drow-sub">${escHtml(meta.subtitulo)}</span>` : ''}</div>`;
        } else {
          cellCls += ' booked-cell';
          inner = `<div class="tcal-drow-evt occ-lbl"><span>🔒 ${escHtml(meta.etiqueta)} · ${fmtTime(h)} – ${fmtTime(h + 1)}</span></div>`;
        }
      } else if (status === 'past') {
        cellCls += ' past';
      } else {
        cellCls += ' off';
      }
      html += `<div class="tcal-drow"><div class="tcal-drow__lbl">${fmtTime(h)}</div><div class="${cellCls}" ${attrs}>${inner}</div></div>`;
    }
    html += '</div>' + footerHint(ES_USUARIO ? 'Tus citas y eventos inscritos' : 'Haz clic en un horario disponible para agendar');
    content.innerHTML = html;

    if (!ES_USUARIO) {
      content.querySelectorAll('.tcal-drow-book').forEach(el => {
        bindFreeSlot(el, +el.dataset.y, +el.dataset.m, +el.dataset.d, +el.dataset.h);
      });
    }
    bindCalendarioDetalle(content);
    bindDailyNav(content);
  }

  function bindDailyNav(root) {
    root.querySelector('.tcal-daily-prev')?.addEventListener('click', () => navigate(-1));
    root.querySelector('.tcal-daily-next')?.addEventListener('click', () => navigate(1));
  }

  document.querySelectorAll('.tcal-vpill').forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });

  document.getElementById('tcal-prev')?.addEventListener('click', () => navigate(-1));
  document.getElementById('tcal-next')?.addEventListener('click', () => navigate(1));
  document.getElementById('tcal-hoy')?.addEventListener('click', goToday);

  irASemanaConActividad();
  render();
})();

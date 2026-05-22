/* ==========================================================================
   TRÉBOL — App JavaScript
   Versión 1.0 | Mayo 2026
   ========================================================================== */

'use strict';

// ==========================================================================
// DATE & TIME FORMATTING
// ==========================================================================
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  let h = d.getHours();
  const m = d.getMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return m === 0 ? `${h}${period}` : `${h}:${String(m).padStart(2,'0')}${period}`;
}

function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// Apply formatting to all date/time display elements
function applyDateFormats() {
  document.querySelectorAll('[data-date]').forEach(el => {
    try { el.textContent = formatDate(el.dataset.date); } catch(e) {}
  });
  document.querySelectorAll('[data-time]').forEach(el => {
    try { el.textContent = formatTime(el.dataset.time); } catch(e) {}
  });
  document.querySelectorAll('[data-datetime]').forEach(el => {
    try { el.textContent = formatDateTime(el.dataset.datetime); } catch(e) {}
  });
}

// ==========================================================================
// MODAL SYSTEM
// ==========================================================================
let activeModal = null;
let activeBackdrop = null;
let focusTrapElements = null;
let previousFocus = null;

function openModal(modalId) {
  const backdrop = document.getElementById(modalId + '-backdrop') || 
                   document.querySelector(`[data-modal="${modalId}"]`);
  if (!backdrop) return;

  // Close any existing modal first
  if (activeModal) closeModal();

  previousFocus = document.activeElement;
  activeBackdrop = backdrop;
  activeModal = backdrop.querySelector('.modal');

  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus trap
  const focusable = activeModal.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  focusTrapElements = Array.from(focusable);

  if (focusTrapElements.length > 0) {
    setTimeout(() => focusTrapElements[0].focus(), 100);
  }

  // Trap focus inside modal
  activeModal.addEventListener('keydown', trapFocus);
}

function closeModal(modalId) {
  const backdrop = modalId
    ? (document.getElementById(modalId + '-backdrop') || document.querySelector(`[data-modal="${modalId}"]`))
    : activeBackdrop;
  
  if (!backdrop) return;

  backdrop.classList.remove('open');
  document.body.style.overflow = '';

  if (activeModal) {
    activeModal.removeEventListener('keydown', trapFocus);
  }

  if (previousFocus) {
    previousFocus.focus();
    previousFocus = null;
  }

  activeModal = null;
  activeBackdrop = null;
  focusTrapElements = null;
}

function trapFocus(e) {
  if (e.key !== 'Tab' || !focusTrapElements || focusTrapElements.length === 0) return;

  const first = focusTrapElements[0];
  const last  = focusTrapElements[focusTrapElements.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

// Programmatic modal creation
function createModal({ title, message, type = 'info', confirmText = 'Aceptar', cancelText = 'Cancelar', onConfirm, onCancel, destructive = false, delay = 0 }) {
  const id = 'dynamic-modal-' + Date.now();
  const iconMap = { danger: '⚠️', success: '✅', warning: '⚠️', info: 'ℹ️', confirm: '❓' };
  const icon = iconMap[type] || 'ℹ️';

  const html = `
    <div id="${id}-backdrop" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-icon ${type}">${icon}</div>
          <div>
            <div class="modal-title" id="${id}-title">${title}</div>
          </div>
          <button class="modal-close" onclick="closeModal('${id}')" aria-label="Cerrar modal">✕</button>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          ${cancelText ? `<button class="btn btn-secondary" id="${id}-cancel">${cancelText}</button>` : ''}
          <button class="btn ${destructive ? 'btn-danger' : 'btn-primary'}" id="${id}-confirm" ${delay > 0 ? 'disabled' : ''}>${confirmText}</button>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  const backdrop = document.getElementById(id + '-backdrop');
  const confirmBtn = document.getElementById(id + '-confirm');
  const cancelBtn = document.getElementById(id + '-cancel');

  // Backdrop click closes only info modals
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop && !onConfirm) {
      closeAndDestroy();
    }
  });

  if (delay > 0) {
    setTimeout(() => {
      if (confirmBtn) {
        confirmBtn.disabled = false;
      }
    }, delay);
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      closeAndDestroy();
      if (typeof onConfirm === 'function') onConfirm();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      closeAndDestroy();
      if (typeof onCancel === 'function') onCancel();
    });
  }

  function closeAndDestroy() {
    closeModal(id);
    setTimeout(() => backdrop.remove(), 300);
  }

  // Esc key
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      closeAndDestroy();
      document.removeEventListener('keydown', escHandler);
    }
  });

  openModal(id);
  return id;
}

// Convenience wrappers
function showSuccess(title, message) {
  return createModal({ title, message, type: 'success', cancelText: null, confirmText: 'Aceptar' });
}

function showError(title, message) {
  return createModal({ title, message, type: 'danger', cancelText: null, confirmText: 'Entendido' });
}

function showInfo(title, message) {
  return createModal({ title, message, type: 'info', cancelText: null, confirmText: 'Aceptar' });
}

function showConfirm({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel, destructive = false }) {
  return createModal({ title, message, type: destructive ? 'danger' : 'confirm', confirmText, cancelText, onConfirm, onCancel, destructive });
}

function showDeleteConfirm(name, onConfirm) {
  return createModal({
    title: `Eliminar ${name}`,
    message: `Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar <strong>${name}</strong>?`,
    type: 'danger',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    destructive: true,
    delay: 800,
    onConfirm
  });
}

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast({ title, message, type = 'info', duration = 4000 }) {
  const container = getToastContainer();
  const visibleToasts = container.querySelectorAll('.toast.show');
  
  // Max 2 toasts visible
  if (visibleToasts.length >= 2) {
    const oldest = visibleToasts[0];
    oldest.classList.remove('show');
    setTimeout(() => oldest.remove(), 350);
  }

  const iconMap = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast__icon">${iconMap[type] || 'ℹ️'}</span>
    <div class="toast__content">
      <div class="toast__title">${title}</div>
      ${message ? `<div class="toast__text">${message}</div>` : ''}
    </div>
    <button class="toast__close" aria-label="Cerrar notificación">✕</button>`;

  container.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  const closeBtn = toast.querySelector('.toast__close');
  let timeout;

  function dismiss() {
    clearTimeout(timeout);
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }

  closeBtn.addEventListener('click', dismiss);
  timeout = setTimeout(dismiss, duration);
}

// ==========================================================================
// TABS
// ==========================================================================
function initTabs(container) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  const tabItems = el.querySelectorAll('.tab-item');
  const tabContents = el.querySelectorAll('.tab-content');

  tabItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      tabItems.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tabContents.forEach(c => c.classList.remove('active'));
      item.classList.add('active');
      item.setAttribute('aria-selected', 'true');
      if (tabContents[i]) tabContents[i].classList.add('active');
    });
  });
}

// ==========================================================================
// SIDEBAR
// ==========================================================================
function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // Mobile toggle
  const toggleBtn = document.getElementById('sidebar-toggle');
  let overlay = document.querySelector('.sidebar-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.insertBefore(overlay, document.body.firstChild);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
    });
  }

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  });

  // Submenu toggle
  document.querySelectorAll('.nav-item[data-submenu]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const submenuId = item.dataset.submenu;
      const submenu = document.getElementById(submenuId);
      if (!submenu) return;

      const isOpen = item.classList.toggle('open');
      submenu.classList.toggle('is-open', isOpen);
      item.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
}

// ==========================================================================
// FORM VALIDATION
// ==========================================================================
function validateField(input) {
  const value = input.value.trim();
  const rules = input.dataset;
  let error = '';

  if (rules.required !== undefined && !value) {
    error = `Este campo es obligatorio`;
  } else if (value && rules.email !== undefined) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(value)) error = 'Ingresa un email con formato válido (ej: usuario@dominio.com)';
  } else if (value && rules.minlength && value.length < parseInt(rules.minlength)) {
    error = `Mínimo ${rules.minlength} caracteres`;
  } else if (value && rules.maxlength && value.length > parseInt(rules.maxlength)) {
    error = `Máximo ${data.maxlength} caracteres`;
  } else if (value && rules.match) {
    const target = document.querySelector(rules.match);
    if (target && target.value !== value) error = 'Las contraseñas no coinciden';
  }

  setFieldError(input, error);
  return !error;
}

function setFieldError(input, message) {
  input.classList.toggle('is-invalid', !!message);
  let errorEl = input.parentElement.querySelector('.form-error');
  if (message && !errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'form-error';
    errorEl.setAttribute('role', 'alert');
    input.parentElement.appendChild(errorEl);
  }
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = message ? 'flex' : 'none';
  }
}

function initFormValidation(formEl) {
  if (!formEl) return;

  const inputs = formEl.querySelectorAll('input[data-required], input[data-email], textarea[data-required], select[data-required]');

  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) validateField(input);
    });
  });

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    inputs.forEach(input => { if (!validateField(input)) valid = false; });
    if (valid) {
      const submitBtn = formEl.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        // Simulate async submit
        setTimeout(() => {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          // Override this in page-specific code
          if (typeof window.onFormSubmit === 'function') window.onFormSubmit(formEl);
        }, 1500);
      }
    }
  });

  // Double-submit protection
  let submitted = false;
  formEl.addEventListener('submit', () => {
    if (submitted) return false;
    submitted = true;
    setTimeout(() => { submitted = false; }, 3000);
  });
}

// ==========================================================================
// PAGINATION
// ==========================================================================
class Paginator {
  constructor(options) {
    this.items = options.items || [];
    this.pageSize = options.pageSize || 10;
    this.currentPage = 1;
    this.container = options.container;
    this.renderFn = options.renderFn;
    this.pageSizes = options.pageSizes || [10, 25, 50];
  }

  get totalPages() { return Math.ceil(this.items.length / this.pageSize); }
  get currentItems() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.items.slice(start, start + this.pageSize);
  }

  goTo(page) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    this.render();
  }

  render() {
    if (!this.container) return;

    const start = (this.currentPage - 1) * this.pageSize;
    const end   = Math.min(start + this.pageSize, this.items.length);

    // Render items
    if (typeof this.renderFn === 'function') {
      this.renderFn(this.currentItems, this.container);
    }

    // Update pagination controls
    const info = this.container.parentElement?.querySelector('.pagination-info');
    if (info) {
      info.textContent = this.items.length === 0
        ? 'Sin registros'
        : `Mostrando ${start + 1}–${end} de ${this.items.length} registros`;
    }

    // Render page buttons
    const pag = this.container.parentElement?.querySelector('.pagination');
    if (pag) this.renderPagination(pag);
  }

  renderPagination(pag) {
    const t = this.totalPages;
    const c = this.currentPage;
    let html = '';

    html += `<button class="pagination__btn" onclick="paginator_${this.id}?.goTo(${c-1})" ${c===1?'disabled':''} aria-label="Página anterior">‹</button>`;

    const pages = getPageNumbers(c, t);
    pages.forEach(p => {
      if (p === '...') {
        html += `<span class="pagination__btn" style="cursor:default;border:none">…</span>`;
      } else {
        html += `<button class="pagination__btn ${p===c?'active':''}" onclick="paginator_${this.id}?.goTo(${p})">${p}</button>`;
      }
    });

    html += `<button class="pagination__btn" onclick="paginator_${this.id}?.goTo(${c+1})" ${c===t?'disabled':''} aria-label="Página siguiente">›</button>`;
    pag.innerHTML = html;
  }
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
  const pages = [];
  if (current <= 4) {
    pages.push(1,2,3,4,5,'...',total);
  } else if (current >= total - 3) {
    pages.push(1,'...',total-4,total-3,total-2,total-1,total);
  } else {
    pages.push(1,'...',current-1,current,current+1,'...',total);
  }
  return pages;
}

// ==========================================================================
// FILE INPUT ENHANCEMENT
// ==========================================================================
function initFileInputs() {
  document.querySelectorAll('.file-input-wrapper').forEach(wrapper => {
    const input = wrapper.querySelector('input[type="file"]');
    const nameEl = wrapper.querySelector('.file-name');
    if (!input || !nameEl) return;

    wrapper.addEventListener('click', () => input.click());
    wrapper.addEventListener('dragover', (e) => { e.preventDefault(); wrapper.style.borderColor = 'var(--color-accent)'; });
    wrapper.addEventListener('dragleave', () => { wrapper.style.borderColor = ''; });
    wrapper.addEventListener('drop', (e) => {
      e.preventDefault();
      wrapper.style.borderColor = '';
      if (e.dataTransfer.files[0]) {
        input.files = e.dataTransfer.files;
        nameEl.textContent = e.dataTransfer.files[0].name;
      }
    });

    input.addEventListener('change', () => {
      nameEl.textContent = input.files[0]?.name || '';
    });
  });
}

// ==========================================================================
// PASSWORD VISIBILITY TOGGLE
// ==========================================================================
function initPasswordToggles() {
  document.querySelectorAll('[data-toggle-password]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.togglePassword;
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.textContent = isPassword ? '🙈' : '👁';
    });
  });
}

// ==========================================================================
// SESSION TIMER (Citas view)
// ==========================================================================
function startSessionTimer(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let seconds = 0;
  const interval = setInterval(() => {
    seconds++;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    el.textContent = h > 0
      ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }, 1000);

  return () => clearInterval(interval);
}

// ==========================================================================
// FOLLOW BUTTON TOGGLE
// ==========================================================================
function initFollowButtons() {
  document.querySelectorAll('[data-follow]').forEach(btn => {
    btn.addEventListener('click', () => {
      const isFollowing = btn.dataset.follow === 'true';
      const counterEl = document.querySelector('[data-followers]');

      btn.dataset.follow = isFollowing ? 'false' : 'true';
      btn.textContent = isFollowing ? 'Seguir' : 'Siguiendo ✓';
      btn.classList.toggle('btn-outline-accent', isFollowing);
      btn.classList.toggle('btn-accent', !isFollowing);

      if (counterEl) {
        let count = parseInt(counterEl.textContent.replace(/\D/g,'')) || 0;
        count += isFollowing ? -1 : 1;
        counterEl.textContent = count.toLocaleString('es');
      }

      showToast({
        title: isFollowing ? 'Dejaste de seguir' : '¡Ahora sigues a este profesional!',
        type: isFollowing ? 'info' : 'success',
      });
    });
  });
}

// ==========================================================================
// LIKE BUTTON TOGGLE
// ==========================================================================
function toggleLike(btn) {
  const isLiked = btn.dataset.liked === 'true';
  btn.dataset.liked = isLiked ? 'false' : 'true';
  const countEl = btn.querySelector('.like-count');
  if (countEl) {
    let c = parseInt(countEl.textContent) || 0;
    c += isLiked ? -1 : 1;
    countEl.textContent = c;
  }
  btn.classList.toggle('btn-accent', !isLiked);
  btn.classList.toggle('btn-ghost', isLiked);
}

// ==========================================================================
// STATUS TOGGLE (Mis Eventos)
// ==========================================================================
function toggleRoomStatus(btn, roomName) {
  const isActive = btn.dataset.status === 'active';
  const action = isActive ? 'deshabilitar' : 'habilitar';

  showConfirm({
    title: `${isActive ? 'Deshabilitar' : 'Habilitar'} sala`,
    message: `¿Confirmas que deseas ${action} la sala <strong>${roomName}</strong>?<br>${isActive ? 'Los usuarios no podrán verla en el home.' : 'La sala será visible para todos los usuarios.'}`,
    confirmText: isActive ? 'Deshabilitar' : 'Habilitar',
    cancelText: 'Cancelar',
    destructive: isActive,
    onConfirm: () => {
      btn.dataset.status = isActive ? 'inactive' : 'active';
      btn.textContent = isActive ? 'Habilitar' : 'Deshabilitar';
      btn.classList.toggle('btn-outline-accent', isActive);
      btn.classList.toggle('btn-outline-danger', !isActive);
      
      const row = btn.closest('tr');
      if (row) {
        const badge = row.querySelector('.badge');
        if (badge) {
          badge.className = `badge ${isActive ? 'badge-muted' : 'badge-success'}`;
          badge.textContent = isActive ? 'Cerrada' : 'Abierta';
        }
      }

      showToast({
        title: isActive ? 'Sala deshabilitada' : 'Sala habilitada',
        message: `La sala "${roomName}" fue ${action}da correctamente.`,
        type: 'success'
      });
    }
  });
}

// ==========================================================================
// GLOBAL PRIVATE MESSAGE (PM) — inject once, usable from any page
// ==========================================================================
// Declared with var so onclick="GlobalPM.xxx()" in injected HTML can resolve it
var GlobalPM = (function () {
  var ID = 'global-pm-modal';
  var _name = '', _avatar = '', _bg = '', _profesionalId = 0;

  function _init() {
    if (document.getElementById(ID + '-backdrop')) return;

    // ── Scoped styles injected once ──────────────────────────────────────
    var s = document.createElement('style');
    s.textContent = [
      '#global-pm-modal-backdrop {',
      '  background: rgba(10,22,15,.72);',
      '  backdrop-filter: blur(4px);',
      '}',
      '#global-pm-modal-backdrop .modal {',
      '  max-width: 460px;',
      '  border-radius: 20px;',
      '  overflow: hidden;',
      '  box-shadow: 0 24px 64px rgba(26,60,52,.28), 0 8px 24px rgba(26,60,52,.12);',
      '}',
      /* top accent stripe */
      '.gpm-stripe {',
      '  height: 4px;',
      '  background: linear-gradient(90deg, #1A3C34 0%, #52B788 55%, #B7E4C7 100%);',
      '}',
      /* header */
      '.gpm-hdr {',
      '  padding: 20px 22px 18px;',
      '  display: flex; align-items: center; gap: 14px;',
      '  background: linear-gradient(135deg, rgba(26,60,52,.04) 0%, rgba(82,183,136,.07) 100%);',
      '  border-bottom: 1px solid #E2F0E4;',
      '}',
      /* recipient avatar circle */
      '.gpm-av {',
      '  width: 50px; height: 50px; border-radius: 50%; flex-shrink: 0;',
      '  display: flex; align-items: center; justify-content: center;',
      '  font-family: "Plus Jakarta Sans", sans-serif;',
      '  font-size: .9375rem; font-weight: 700; letter-spacing: .04em; color: #fff;',
      '  box-shadow: 0 4px 14px rgba(26,60,52,.3);',
      '}',
      '.gpm-av-info { flex: 1; min-width: 0; }',
      '.gpm-eyebrow {',
      '  font-size: .6875rem; font-weight: 700;',
      '  text-transform: uppercase; letter-spacing: .09em;',
      '  color: #7A9E8A; margin-bottom: 3px;',
      '}',
      '.gpm-rec-name {',
      '  font-family: "DM Serif Display", Georgia, serif;',
      '  font-size: 1.125rem; color: #1A3C34; line-height: 1.3;',
      '  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
      '}',
      /* close button */
      '.gpm-x {',
      '  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;',
      '  background: #EBF5EE; border: none; cursor: pointer;',
      '  color: #4A6652; font-size: 1rem; line-height: 1;',
      '  display: flex; align-items: center; justify-content: center;',
      '  transition: background 140ms, color 140ms, transform 220ms;',
      '}',
      '.gpm-x:hover { background: #C5DFC9; color: #1A3C34; transform: rotate(90deg); }',
      /* body */
      '.gpm-body { padding: 22px 22px 6px; }',
      '.gpm-lbl {',
      '  display: block; font-size: .71rem; font-weight: 700;',
      '  text-transform: uppercase; letter-spacing: .08em;',
      '  color: #7A9E8A; margin-bottom: 8px;',
      '}',
      /* textarea */
      '.gpm-ta {',
      '  width: 100%; min-height: 118px; padding: 13px 15px;',
      '  background: #F3FAF5; border: 1.5px solid #C5DFC9; border-radius: 12px;',
      '  font-family: "Plus Jakarta Sans", sans-serif; font-size: .9375rem;',
      '  color: #1A2E1F; line-height: 1.65; resize: vertical; outline: none; display: block;',
      '  transition: border-color .18s, box-shadow .18s, background .18s;',
      '}',
      '.gpm-ta::placeholder { color: #95B8A1; }',
      '.gpm-ta:focus {',
      '  border-color: #52B788; background: #fff;',
      '  box-shadow: 0 0 0 3px rgba(82,183,136,.18);',
      '}',
      /* counter */
      '.gpm-cnt {',
      '  text-align: right; font-size: .71rem; color: #95B8A1; margin-top: 5px;',
      '  transition: color .18s;',
      '}',
      '.gpm-cnt.warn  { color: #D4813A; }',
      '.gpm-cnt.limit { color: #C81E4A; font-weight: 700; }',
      /* privacy notice */
      '.gpm-priv {',
      '  display: flex; align-items: flex-start; gap: 9px;',
      '  margin: 14px 0 0;',
      '  padding: 10px 14px;',
      '  background: rgba(82,183,136,.07); border: 1px solid rgba(82,183,136,.22);',
      '  border-radius: 10px; font-size: .78rem; color: #4A6652; line-height: 1.55;',
      '}',
      '.gpm-priv-ic { font-size: .875rem; flex-shrink: 0; margin-top: 1px; }',
      /* footer */
      '.gpm-foot {',
      '  padding: 18px 22px 22px;',
      '  display: flex; gap: 10px; justify-content: flex-end;',
      '}',
      '.gpm-btn-c {',
      '  padding: 9px 20px; border-radius: 10px; cursor: pointer;',
      '  font-family: "Plus Jakarta Sans", sans-serif; font-size: .875rem; font-weight: 600;',
      '  background: #EBF5EE; color: #4A6652; border: 1.5px solid #C5DFC9;',
      '  transition: background 140ms, color 140ms, border-color 140ms;',
      '}',
      '.gpm-btn-c:hover { background: #D3ECD9; color: #1A3C34; border-color: #9EC6A8; }',
      '.gpm-btn-s {',
      '  padding: 9px 22px; border-radius: 10px; cursor: pointer; border: none;',
      '  font-family: "Plus Jakarta Sans", sans-serif; font-size: .875rem; font-weight: 700;',
      '  background: linear-gradient(135deg, #1A3C34 0%, #2D6A4F 100%); color: #fff;',
      '  display: flex; align-items: center; gap: 8px;',
      '  box-shadow: 0 4px 14px rgba(26,60,52,.28);',
      '  transition: opacity .14s, transform .14s, box-shadow .14s;',
      '}',
      '.gpm-btn-s:hover  { opacity: .87; transform: translateY(-1px); box-shadow: 0 7px 20px rgba(26,60,52,.35); }',
      '.gpm-btn-s:active { transform: translateY(0); }',
      '.gpm-arr { font-style: normal; display: inline-block; transition: transform .2s; }',
      '.gpm-btn-s:hover .gpm-arr { transform: translateX(3px); }',
    ].join('\n');
    document.head.appendChild(s);

    // ── Modal HTML ────────────────────────────────────────────────────────
    document.body.insertAdjacentHTML('beforeend',
      '<div id="global-pm-modal-backdrop" class="modal-backdrop" role="dialog" aria-modal="true"' +
      '     aria-labelledby="global-pm-modal-title">' +
      '<div class="modal">' +
      '  <div class="gpm-stripe"></div>' +
      '  <div class="gpm-hdr">' +
      '    <div class="gpm-av" id="global-pm-modal-av"></div>' +
      '    <div class="gpm-av-info">' +
      '      <div class="gpm-eyebrow">Mensaje privado</div>' +
      '      <div class="gpm-rec-name" id="global-pm-modal-title"></div>' +
      '    </div>' +
      '    <button class="gpm-x" onclick="GlobalPM.close()" aria-label="Cerrar">\u00d7</button>' +
      '  </div>' +
      '  <div class="gpm-body">' +
      '    <label class="gpm-lbl" for="global-pm-modal-body">Mensaje</label>' +
      '    <textarea id="global-pm-modal-body" class="gpm-ta" rows="5"' +
      '      placeholder="Escribe tu mensaje\u2026" maxlength="500"' +
      '      oninput="GlobalPM.updateCount()"></textarea>' +
      '    <div class="gpm-cnt" id="global-pm-modal-cnt"><span id="global-pm-modal-cnt-n">0</span>/500</div>' +
      '    <div class="gpm-priv">' +
      '      <span class="gpm-priv-ic">\uD83D\uDD12</span>' +
      '      <span>Este mensaje es <strong>privado y confidencial</strong>. Solo t\u00fa y el destinatario pueden verlo.</span>' +
      '    </div>' +
      '  </div>' +
      '  <div class="gpm-foot">' +
      '    <button class="gpm-btn-c" onclick="GlobalPM.close()">Cancelar</button>' +
      '    <button class="gpm-btn-s" onclick="GlobalPM.send()">Enviar <em class="gpm-arr">\u2192</em></button>' +
      '  </div>' +
      '</div>' +
      '</div>'
    );

    // Event delegation — any element with [data-pm-name] opens the modal
    document.body.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-pm-name]');
      if (!trigger) return;
      e.preventDefault();
      e.stopPropagation();
      var initials = trigger.dataset.pmAvatar ||
        trigger.dataset.pmName.split(' ').map(function (w) { return w[0] || ''; }).join('').slice(0, 2).toUpperCase();
      _profesionalId = parseInt(trigger.dataset.pmProfesionalId || '0', 10) || 0;
      GlobalPM.open(trigger.dataset.pmName, initials, trigger.dataset.pmBg || 'var(--color-primary)');
    });
  }

  function open(name, avatar, bg, profesionalId) {
    _name   = name;
    _avatar = avatar || name.split(' ').map(function (w) { return w[0] || ''; }).join('').slice(0, 2).toUpperCase();
    _bg     = bg || 'var(--color-primary)';
    if (profesionalId) _profesionalId = profesionalId;

    var titleEl = document.getElementById(ID + '-title');
    var avEl    = document.getElementById(ID + '-av');
    var bodyEl  = document.getElementById(ID + '-body');
    var cntEl   = document.getElementById(ID + '-cnt-n');
    var cntWrap = document.getElementById(ID + '-cnt');

    if (titleEl) titleEl.textContent = name;
    if (avEl)    { avEl.textContent = _avatar; avEl.style.background = _bg; }
    if (bodyEl)  bodyEl.value = '';
    if (cntEl)   cntEl.textContent = '0';
    if (cntWrap) cntWrap.className = 'gpm-cnt';

    openModal(ID);
  }

  function close() {
    closeModal(ID);
  }

  function updateCount() {
    var bodyEl  = document.getElementById(ID + '-body');
    var cntEl   = document.getElementById(ID + '-cnt-n');
    var cntWrap = document.getElementById(ID + '-cnt');
    if (!bodyEl || !cntEl) return;
    var len = bodyEl.value.length;
    cntEl.textContent = len;
    if (cntWrap) cntWrap.className = 'gpm-cnt' + (len >= 500 ? ' limit' : len >= 400 ? ' warn' : '');
  }

  function send() {
    var bodyEl = document.getElementById(ID + '-body');
    var text   = bodyEl ? bodyEl.value.trim() : '';
    if (!text) {
      if (typeof showToast !== 'undefined') showToast({ title: 'Escribe un mensaje', type: 'warning' });
      return;
    }
    if (!_profesionalId) {
      if (typeof showToast !== 'undefined') showToast({ title: 'Destinatario no válido', type: 'error' });
      return;
    }

    var token = document.querySelector('input[name="__RequestVerificationToken"]')?.value ?? '';
    var sendBtn = document.querySelector('#' + ID + '-backdrop .gpm-btn-s');
    if (sendBtn) sendBtn.disabled = true;

    fetch('/Mensajeria/Enviar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'RequestVerificationToken': token
      },
      body: 'destinoId=' + encodeURIComponent(_profesionalId) +
        '&tipoDestino=Profesional&texto=' + encodeURIComponent(text) +
        '&__RequestVerificationToken=' + encodeURIComponent(token)
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (sendBtn) sendBtn.disabled = false;
        if (d.exito) {
          close();
          if (typeof showToast !== 'undefined') {
            showToast({ title: 'Mensaje enviado', message: 'Tu mensaje fue enviado a ' + _name, type: 'success' });
          }
        } else if (typeof showToast !== 'undefined') {
          showToast({ title: d.mensaje || 'No se pudo enviar', type: 'error' });
        }
      })
      .catch(function () {
        if (sendBtn) sendBtn.disabled = false;
        if (typeof showToast !== 'undefined') showToast({ title: 'Error de conexión', type: 'error' });
      });
  }

  return { init: _init, open: open, close: close, updateCount: updateCount, send: send };
}());

/** Global shortcut usable from onclick attributes in HTML */
function openGlobalPM(name, avatar, bg) {
  GlobalPM.open(name, avatar || '', bg || '');
}

// ==========================================================================
// TOPBAR NOTIFICATIONS (prototipo home-profesional / home-usuario)
// ==========================================================================
function initTopbarNotificaciones(notifs) {
  const wrapper = document.getElementById('notif-wrapper');
  if (!wrapper || !notifs) return;

  const btn = document.getElementById('notif-btn');
  const panel = document.getElementById('notif-panel');
  const badge = document.getElementById('notif-badge');
  const list = document.getElementById('notif-list');
  const markAll = panel.querySelector('.notif-mark-all');
  const tabs = panel.querySelectorAll('.notif-tab');
  let activeTab = 'msg';

  function countUnread(tab) {
    return notifs[tab].filter(n => n.unread).length;
  }

  function totalUnread() {
    return countUnread('msg') + countUnread('sys');
  }

  function updateCounts() {
    const t = totalUnread();
    badge.textContent = t > 9 ? '9+' : String(t);
    badge.classList.toggle('zero', t === 0);
    panel.querySelectorAll('.ntc').forEach(el => {
      const c = countUnread(el.dataset.ntc);
      el.textContent = String(c);
      el.classList.toggle('zero', c === 0);
    });
  }

  function renderList() {
    const items = notifs[activeTab];
    if (!items.length) {
      list.innerHTML = '<div class="notif-empty">Sin notificaciones</div>';
      return;
    }
    list.innerHTML = items.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : 'read'}" data-id="${n.id}" data-tab="${activeTab}" role="listitem" tabindex="0">
        <div class="notif-item__ico" style="background:${n.bg};color:${n.col};">${n.ico}</div>
        <div class="notif-item__body">
          <div class="notif-item__title">${n.title}</div>
          <div class="notif-item__sub">${n.sub}</div>
          <div class="notif-item__time">${n.time}</div>
        </div>
        <div class="notif-item__dot"></div>
      </div>`).join('');
    list.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', () => {
        const notif = notifs[el.dataset.tab].find(n => n.id === +el.dataset.id);
        if (notif) {
          notif.unread = false;
          if (el.dataset.tab === 'msg') {
            fetch(`/api/notificaciones/marcar-leida/${notif.id}`, { method: 'POST' }).catch(() => {});
          }
          renderList();
          updateCounts();
        }
      });
    });
  }

  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => {
      x.classList.remove('active');
      x.setAttribute('aria-selected', 'false');
    });
    t.classList.add('active');
    t.setAttribute('aria-selected', 'true');
    activeTab = t.dataset.tab;
    renderList();
  }));

  markAll.addEventListener('click', () => {
    notifs[activeTab].forEach(n => { n.unread = false; });
    if (activeTab === 'msg') {
      fetch('/api/notificaciones/marcar-todas-leidas', { method: 'POST' }).catch(() => {});
    }
    renderList();
    updateCounts();
  });

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    if (open) renderList();
  });

  document.addEventListener('click', e => {
    if (!wrapper.contains(e.target)) {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });

  updateCounts();
}

// ==========================================================================
// INIT — Run on DOMContentLoaded
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Apply date/time formatting
  applyDateFormats();

  // Init sidebar
  initSidebar();

  if (document.getElementById('notif-wrapper')) {
    fetch('/api/notificaciones/resumen')
      .then(r => r.ok ? r.json() : { msg: [], sys: [] })
      .then(data => initTopbarNotificaciones(data))
      .catch(() => initTopbarNotificaciones({ msg: [], sys: [] }));
  }

  // Init global private messaging
  GlobalPM.init();

  // Init all tabs on page
  document.querySelectorAll('[data-tabs]').forEach(el => initTabs(el));

  // Init file inputs
  initFileInputs();

  // Init password toggles
  initPasswordToggles();

  // Init follow buttons
  initFollowButtons();

  // Init form validation on all forms with data-validate
  document.querySelectorAll('form[data-validate]').forEach(form => initFormValidation(form));

  // Global modal close: backdrop click closes info modals
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        const hasForm = backdrop.querySelector('form, .modal-body input');
        if (!hasForm) closeModal();
      }
    });
  });

  // Global Esc closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeBackdrop) closeModal();
  });

  // Anchor modal opens
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.dataset.openModal);
    });
  });

  // Anchor modal closes
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });
});

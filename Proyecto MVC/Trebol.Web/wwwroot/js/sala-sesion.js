/** Controles compartidos — salas cita y conferencia */

function toggleSalaControl(btn, type) {
  const off = btn.classList.toggle('ctrl-btn--off');
  btn.classList.toggle('ctrl-btn--normal', !off);
  btn.setAttribute('aria-pressed', String(!off));
  const labels = {
    cam: ['Cámara activada', 'Cámara desactivada'],
    mic: ['Micrófono activo', 'Micrófono silenciado'],
    screen: ['Pantalla compartida', 'Pantalla detenida']
  };
  if (typeof showToast === 'function' && labels[type]) {
    showToast({ title: labels[type][off ? 1 : 0], type: off ? 'info' : 'success' });
  }
}

function initPanelTabs(tabSelector, contentAttr) {
  document.querySelectorAll(tabSelector).forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll(tabSelector).forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('[data-panel-content]').forEach((c) => c.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const target = document.getElementById(tab.dataset[contentAttr]);
      if (target) target.classList.add('active');
    });
  });
}

function initConfTabs() {
  document.querySelectorAll('.conf-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.conf-tab').forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.conf-panel-section').forEach((s) => s.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(tab.dataset.ctab);
      if (panel) panel.classList.add('active');
    });
  });
}

function saveRecomendLocal(storageKey, textareaId, timestampId) {
  const txt = document.getElementById(textareaId);
  if (!txt) return;
  localStorage.setItem(storageKey, txt.value);
  const now = new Date();
  const stamp = document.getElementById(timestampId);
  if (stamp) {
    stamp.textContent = 'Guardado el ' + now.toLocaleDateString('es-CO') + ' · ' + now.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
  }
  if (typeof showToast === 'function') {
    showToast({ title: 'Recomendaciones guardadas', type: 'success' });
  }
}

function loadRecomendLocal(storageKey, textareaId) {
  const txt = document.getElementById(textareaId);
  const saved = localStorage.getItem(storageKey);
  if (txt && saved) txt.value = saved;
}

function setupAutoSave(storageKey, textareaId, intervalMs = 30000) {
  const txt = document.getElementById(textareaId);
  if (!txt) return;
  setInterval(() => {
    if (txt.value.trim()) localStorage.setItem(storageKey, txt.value);
  }, intervalMs);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('session-timer') && typeof startSessionTimer === 'function') {
    startSessionTimer('session-timer');
  }
  if (document.getElementById('conf-timer') && typeof startSessionTimer === 'function') {
    startSessionTimer('conf-timer');
  }
});

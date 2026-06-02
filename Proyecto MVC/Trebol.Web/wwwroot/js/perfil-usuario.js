/**
 * Mi perfil usuario: tabs, guardado con confirmación, búsqueda eventos.
 */
(function () {
  'use strict';

  const form = document.getElementById('profile-form');
  const saveBtn = document.getElementById('save-btn');
  const confirmBtn = document.getElementById('confirm-save-btn');
  const aliasInput = document.getElementById('edit-alias');
  const celularInput = document.getElementById('edit-celular');
  const buscarEvento = document.getElementById('buscar-evento-perfil');

  function hayCambios() {
    const aliasChanged = aliasInput && aliasInput.value.trim() !== (aliasInput.dataset.original || '').trim();
    const celularChanged = celularInput && celularInput.value.trim() !== (celularInput.dataset.original || '').trim();
    return aliasChanged || celularChanged;
  }

  function actualizarBotonGuardar() {
    if (!saveBtn) return;
    const dirty = hayCambios();
    saveBtn.disabled = !dirty;
    saveBtn.setAttribute('aria-disabled', dirty ? 'false' : 'true');
  }

  [aliasInput, celularInput].forEach(el => {
    el?.addEventListener('input', actualizarBotonGuardar);
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!hayCambios()) return;
    if (typeof openModal === 'function') openModal('save-confirm');
  });

  confirmBtn?.addEventListener('click', () => {
    if (typeof closeModal === 'function') closeModal('save-confirm');
    if (!form) return;
    saveBtn?.classList.add('loading');
    if (saveBtn) saveBtn.disabled = true;
    form.submit();
  });

  document.querySelectorAll('[data-close-modal="save-confirm"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof closeModal === 'function') closeModal('save-confirm');
      actualizarBotonGuardar();
    });
  });

  buscarEvento?.addEventListener('input', () => {
    const q = buscarEvento.value.trim().toLowerCase();
    document.querySelectorAll('#tabla-eventos-perfil tbody tr[data-search]').forEach(row => {
      const match = !q || (row.dataset.search || '').includes(q);
      row.style.display = match ? '' : 'none';
    });
  });

  actualizarBotonGuardar();
})();

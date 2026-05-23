(function () {
  'use strict';

  function filterSalas() {
    const q = (document.getElementById('search-salas')?.value || '').toLowerCase().trim();
    const estado = document.getElementById('filter-estado')?.value || '';
    const cards = document.querySelectorAll('#salas-grid .perf-orador-sala, #salas-grid .room-card[data-sala-id]');
    let visible = 0;
    cards.forEach(card => {
      const nombre = (card.dataset.nombre || '').toLowerCase();
      const est = card.dataset.estado || '';
      const ok = (!q || nombre.includes(q)) && (!estado || est === estado);
      card.style.display = ok ? '' : 'none';
      if (ok) visible++;
    });
    const empty = document.getElementById('salas-empty');
    const grid = document.getElementById('salas-grid');
    if (empty && grid) {
      empty.style.display = visible === 0 && cards.length > 0 ? 'block' : 'none';
      grid.style.display = visible === 0 && cards.length > 0 ? 'none' : '';
    }
  }

  document.getElementById('search-salas')?.addEventListener('input', filterSalas);
  document.getElementById('filter-estado')?.addEventListener('change', filterSalas);

  const rating = document.getElementById('star-rating');
  const input = document.getElementById('puntuacion-input');
  if (rating && input) {
    let val = parseInt(input.value, 10) || 5;
    const stars = rating.querySelectorAll('.star');
    function paint() {
      stars.forEach(s => {
        const n = parseInt(s.dataset.val, 10);
        s.classList.toggle('is-on', n <= val);
        s.style.color = n <= val ? '#F4C430' : '#ccc';
      });
    }
    paint();
    stars.forEach(s => {
      s.addEventListener('click', () => {
        val = parseInt(s.dataset.val, 10);
        input.value = String(val);
        paint();
      });
      s.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          s.click();
        }
      });
    });
  }
})();

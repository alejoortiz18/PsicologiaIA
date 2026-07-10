(function () {
  'use strict';

  function normalizar(texto) {
    return (texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '');
  }

  function parseItems(el) {
    try {
      const script = el.querySelector('[data-role="items-json"]');
      const raw = script?.textContent?.trim() || el.dataset.items || '[]';
      return JSON.parse(raw).map((x) => ({
        id: String(x.id ?? x.Id ?? x.paisId ?? x.ciudadId),
        nombre: String(x.nombre ?? x.Nombre ?? '')
      }));
    } catch {
      return [];
    }
  }

  function crearCombobox(root, opts) {
    const hidden = root.querySelector('[data-role="value"]');
    const trigger = root.querySelector('.cat-combobox__trigger');
    const labelEl = root.querySelector('[data-role="label"]');
    const panel = root.querySelector('[data-role="panel"]');
    const search = root.querySelector('[data-role="search"]');
    const list = root.querySelector('[data-role="list"]');

    let items = parseItems(root);
    let selectedId = root.dataset.selectedId || hidden?.value || '';
    let placeholder = root.dataset.placeholder || 'Seleccionar...';
    let abierto = false;
    let focusIndex = -1;

    function setLabel(texto, esPlaceholder) {
      labelEl.textContent = texto;
      labelEl.classList.toggle('is-placeholder', !!esPlaceholder);
    }

    function setValue(id, nombre, fireChange) {
      selectedId = id ? String(id) : '';
      if (hidden) hidden.value = selectedId;
      if (selectedId && nombre) {
        setLabel(nombre, false);
      } else {
        setLabel(placeholder, true);
      }
      if (fireChange !== false) opts.onChange?.(selectedId);
    }

    function cerrar() {
      abierto = false;
      root.classList.remove('is-open');
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      focusIndex = -1;
    }

    function abrir() {
      if (trigger.disabled) return;
      abierto = true;
      root.classList.add('is-open');
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      if (search) {
        search.value = '';
        search.disabled = false;
        renderLista('');
        setTimeout(() => search.focus(), 0);
      } else {
        renderLista('');
      }
    }

    function toggle() {
      if (abierto) cerrar();
      else abrir();
    }

    function renderLista(filtro) {
      const q = normalizar(filtro);
      const filtrados = items.filter(
        (it) => !q || normalizar(it.nombre).includes(q)
      );

      list.innerHTML = '';
      focusIndex = -1;

      if (opts.loading) {
        list.innerHTML = '<li class="cat-combobox__loading">Cargando...</li>';
        return;
      }

      if (!filtrados.length) {
        list.innerHTML = '<li class="cat-combobox__empty">Sin resultados</li>';
        return;
      }

      filtrados.forEach((it, idx) => {
        const li = document.createElement('li');
        li.className = 'cat-combobox__option';
        li.setAttribute('role', 'option');
        li.dataset.id = it.id;
        li.dataset.nombre = it.nombre;
        li.textContent = it.nombre;
        if (String(it.id) === String(selectedId)) {
          li.classList.add('is-selected');
          li.setAttribute('aria-selected', 'true');
        }
        li.addEventListener('click', () => {
          setValue(it.id, it.nombre);
          cerrar();
        });
        list.appendChild(li);
      });
    }

    function moverFoco(delta) {
      const opciones = list.querySelectorAll('.cat-combobox__option');
      if (!opciones.length) return;
      focusIndex = Math.max(0, Math.min(opciones.length - 1, focusIndex + delta));
      opciones.forEach((o, i) => o.classList.toggle('is-focused', i === focusIndex));
      opciones[focusIndex].scrollIntoView({ block: 'nearest' });
    }

    function seleccionarFoco() {
      const op = list.querySelectorAll('.cat-combobox__option')[focusIndex];
      if (op) {
        setValue(op.dataset.id, op.dataset.nombre);
        cerrar();
      }
    }

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      toggle();
    });

    search?.addEventListener('input', () => renderLista(search.value));
    search?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); moverFoco(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moverFoco(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); seleccionarFoco(); }
      else if (e.key === 'Escape') { e.preventDefault(); cerrar(); trigger.focus(); }
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'ArrowDown' && !abierto) {
        e.preventDefault();
        abrir();
      }
    });

    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) cerrar();
    });

    if (selectedId) {
      const lbl =
        root.dataset.selectedLabel ||
        items.find((i) => String(i.id) === String(selectedId))?.nombre;
      if (lbl) setValue(selectedId, lbl, false);
    } else {
      setLabel(placeholder, true);
    }

    return {
      setItems(nuevos, selected) {
        items = nuevos || [];
        opts.loading = false;
        const sel = selected != null && selected !== '' ? String(selected) : '';
        const nombre = sel ? items.find((i) => String(i.id) === sel)?.nombre : '';
        setValue(sel, nombre || '', false);
        if (abierto) renderLista(search?.value || '');
      },
      setLoading(msg) {
        opts.loading = true;
        list.innerHTML = `<li class="cat-combobox__loading">${msg || 'Cargando...'}</li>`;
      },
      setDisabled(disabled, ph) {
        trigger.disabled = !!disabled;
        if (ph) placeholder = ph;
        if (disabled) {
          cerrar();
          setValue('', '');
          if (search) search.disabled = true;
        }
      },
      getValue: () => selectedId,
      cerrar
    };
  }

  function initBloque(root) {
    const ciudadesUrl = root.dataset.ciudadesUrl || '/Catalogo/Ciudades';
    const paisRoot = root.querySelector('[data-role="pais-combobox"]');
    const ciudadRoot = root.querySelector('[data-role="ciudad-combobox"]');
    if (!paisRoot || !ciudadRoot) return;

    const ciudadCb = crearCombobox(ciudadRoot, {});

    function cargarCiudadesPorPais(paisId, ciudadSeleccionada) {
      if (!paisId) {
        ciudadCb.setDisabled(true, 'Selecciona un país primero');
        ciudadCb.setItems([], null);
        return;
      }
      ciudadCb.setDisabled(false, 'Seleccionar...');
      const locales = parseItems(ciudadRoot);
      if (locales.length && !ciudadSeleccionada) {
        ciudadCb.setItems(locales, null);
        return;
      }
      ciudadCb.setLoading('Cargando ciudades...');
      fetch(ciudadesUrl + '?paisId=' + encodeURIComponent(paisId))
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => {
          const items = (data || []).map((c) => ({
            id: String(c.ciudadId),
            nombre: c.nombre
          }));
          ciudadCb.setItems(items, ciudadSeleccionada || null);
        })
        .catch(() => {
          ciudadCb.setItems([], null);
          ciudadCb.setDisabled(true, 'No se pudieron cargar las ciudades');
        });
    }

    const paisCb = crearCombobox(paisRoot, {
      onChange(paisId) {
        cargarCiudadesPorPais(paisId, null);
      }
    });

    const paisInicial = paisCb.getValue();
    const ciudadInicial = ciudadRoot.dataset.selectedId || '';
    if (paisInicial) {
      cargarCiudadesPorPais(paisInicial, ciudadInicial);
    } else {
      ciudadCb.setDisabled(true, 'Selecciona un país primero');
    }
  }

  document.querySelectorAll('.js-catalogo-ubicacion').forEach(initBloque);
})();

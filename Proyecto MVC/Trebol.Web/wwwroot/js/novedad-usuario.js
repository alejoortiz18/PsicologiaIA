/**
 * Novedades financieras del usuario: modal global y resolución de opciones.
 */
(function () {
  'use strict';

  const token = () => document.querySelector('[name="__RequestVerificationToken"]')?.value ?? '';

  const opcionesEventoEnVivo = [
    { id: 'EsperarEnEvento', label: 'Esperar 5 minutos más', btn: 'btn-secondary' },
    { id: 'SalirConferencia', label: 'Retirarse sin retirar dinero', btn: 'btn-ghost' },
    { id: 'RetirarSaldoFavor', label: 'Retirarme del evento y generar saldo a favor', btn: 'btn-secondary' },
    { id: 'RetirarDinero', label: 'Retirar dinero', btn: 'btn-primary' }
  ];

  const opcionesEvento = [
    { id: 'AceptarNuevaFecha', label: 'Aceptar nueva fecha', btn: 'btn-primary' },
    { id: 'RetirarDinero', label: 'Retirar dinero a saldo a favor', btn: 'btn-secondary' },
    { id: 'ExplorarAlternativas', label: 'Explorar otras opciones', btn: 'btn-ghost' }
  ];

  const opcionesCita = [
    { id: 'EsperarCincoMinutos', label: 'Esperar 5 minutos más', btn: 'btn-secondary' },
    { id: 'Reagendar', label: 'Reagendar cita', btn: 'btn-primary' },
    { id: 'RetirarDinero', label: 'Retirar dinero a saldo a favor', btn: 'btn-ghost' }
  ];

  function tienePagoAprobado(novedad) {
    if (novedad?.tienePagoAprobado === true || novedad?.tienePagoAprobado === 'true') return true;
    const cfg = window.confEsperaPonente;
    return cfg?.tienePagoAprobado === true || cfg?.tienePagoAprobado === 'true';
  }

  function opcionesParaNovedad(novedad) {
    if (!novedad) return [];
    const tipo = novedad.tipoNovedad || '';
    if (tipo === 'ProfesionalNoIngresoEvento') return opcionesEventoEnVivo;
    if (novedad.esCita || novedad.entidadTipo === 'Cita') return opcionesCita;
    if (novedad.esEvento || novedad.entidadTipo === 'Inscripcion') return opcionesEvento;
    if (tipo.includes('Profesional') || tipo.includes('Cita')) return opcionesCita;
    return opcionesEvento;
  }

  function renderOpciones(novedad) {
    const cont = document.getElementById('novedad-usuario-opciones');
    if (!cont) return;
    cont.innerHTML = '';
    let ops = opcionesParaNovedad(novedad);
    if (novedad.tipoNovedad === 'ProfesionalNoIngresoEvento' && !tienePagoAprobado(novedad)) {
      ops = ops.filter(o => o.id !== 'RetirarDinero' && o.id !== 'RetirarSaldoFavor');
    }
    ops.forEach(op => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn ${op.btn} btn-sm w-full btn-resolver-novedad`;
      btn.dataset.opcion = op.id;
      btn.textContent = op.label;
      btn.addEventListener('click', () => resolverNovedad(novedad.novedadUsuarioId, op.id));
      cont.appendChild(btn);
    });
  }

  window.showNovedadModal = function (novedad) {
    if (!novedad) return;
    const titulo = document.getElementById('novedad-usuario-title');
    const subtitulo = document.getElementById('novedad-usuario-subtitle');
    const mensaje = document.getElementById('novedad-usuario-mensaje');
    const aviso = document.getElementById('novedad-usuario-aviso');
    if (titulo) titulo.textContent = novedad.titulo || 'Novedad pendiente';
    if (subtitulo) subtitulo.textContent = novedad.tipoNovedad?.replace(/([A-Z])/g, ' $1').trim() || 'Requiere tu decisión';
    if (mensaje) mensaje.textContent = novedad.mensaje || '';
    if (aviso) {
      const mostrarAviso = novedad.tipoNovedad === 'ProfesionalNoIngresoEvento' && tienePagoAprobado(novedad);
      aviso.hidden = !mostrarAviso;
    }
    renderOpciones(novedad);
    if (typeof openModal === 'function') openModal('novedad-usuario');
  };

  async function resolverNovedad(novedadId, opcion) {
    const btns = document.querySelectorAll('.btn-resolver-novedad');
    btns.forEach(b => { b.disabled = true; b.classList.add('loading'); });
    try {
      const body = new URLSearchParams();
      body.append('__RequestVerificationToken', token());
      body.append('novedadId', String(novedadId));
      body.append('opcion', opcion);
      const res = await fetch('/NovedadUsuario/Resolver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
        body: body.toString()
      });
      const data = await res.json();
      if (typeof closeModal === 'function') closeModal('novedad-usuario');
      if (typeof showToast === 'function') {
        showToast({
          title: data.exito ? 'Novedad resuelta' : 'No se pudo resolver',
          message: data.mensaje || '',
          type: data.exito ? 'success' : 'error'
        });
      }
      if (data.exito) {
        if ((opcion === 'EsperarCincoMinutos' || opcion === 'EsperarEnEvento') && window.iniciarEsperaPonenteConferencia) {
          window.iniciarEsperaPonenteConferencia(5);
          return;
        }
        if (opcion === 'EsperarCincoMinutos' && window.iniciarPollInasistenciaCita) {
          window.iniciarPollInasistenciaCita();
          return;
        }
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          window.location.reload();
        }
      }
    } catch {
      if (typeof showToast === 'function') {
        showToast({ title: 'Error', message: 'No se pudo procesar tu elección.', type: 'error' });
      }
    } finally {
      btns.forEach(b => { b.disabled = false; b.classList.remove('loading'); });
    }
  }

  async function cargarNovedadPendiente() {
    if (document.body.dataset.skipNovedadModal === 'true') return;
    try {
      const res = await fetch('/NovedadUsuario/PendienteModal', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const data = await res.json();
      if (data.hayNovedad && data.novedad) {
        window.showNovedadModal(data.novedad);
      }
    } catch { /* silencioso */ }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.esUsuario !== 'true') return;
    document.querySelectorAll('.btn-resolver-novedad-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const novedad = {
          novedadUsuarioId: parseInt(btn.dataset.novedadId, 10),
          titulo: btn.dataset.titulo || '',
          mensaje: btn.dataset.mensaje || '',
          tipoNovedad: btn.dataset.tipo || '',
          entidadTipo: btn.dataset.entidadTipo || '',
          tienePagoAprobado: btn.dataset.tienePago === 'true',
          esCita: btn.dataset.entidadTipo === 'Cita',
          esEvento: btn.dataset.entidadTipo === 'Inscripcion'
        };
        window.showNovedadModal(novedad);
      });
    });
    if (document.body.dataset.checkNovedadOnLoad !== 'false') {
      cargarNovedadPendiente();
    }
  });

  window.resolverNovedadUsuario = resolverNovedad;
})();

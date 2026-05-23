(function () {
  'use strict';

  const metodoHidden = document.getElementById('checkout-metodo-pago');
  const panelTarjeta = document.getElementById('checkout-panel-tarjeta');
  const panelPse = document.getElementById('checkout-panel-pse');
  const panelTransfer = document.getElementById('checkout-panel-transferencia');
  const formPago = document.getElementById('form-pago');
  const radios = document.querySelectorAll('input[name="metodo-pago-ui"]');

  function setPanelRequired(panel, required) {
    if (!panel) return;
    panel.querySelectorAll('input, select').forEach(el => {
      if (el.type === 'hidden') return;
      el.required = required;
      if (!required) el.removeAttribute('required');
    });
  }

  function aplicarMetodo(metodo) {
    if (metodoHidden) metodoHidden.value = metodo;

    document.querySelectorAll('.payment-option').forEach(opt => {
      const radio = opt.querySelector('input[type="radio"]');
      opt.classList.toggle('is-selected', radio && radio.value === metodo);
    });

    const esTarjeta = metodo === 'TarjetaCredito' || metodo === 'TarjetaDebito';
    const esPse = metodo === 'PSE';
    const esTransfer = metodo === 'Efecty';

    if (panelTarjeta) panelTarjeta.hidden = !esTarjeta;
    if (panelPse) panelPse.hidden = !esPse;
    if (panelTransfer) panelTransfer.hidden = !esTransfer;

    setPanelRequired(panelTarjeta, esTarjeta);
    setPanelRequired(panelPse, esPse);
    setPanelRequired(panelTransfer, false);
  }

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) aplicarMetodo(radio.value);
    });
  });

  if (metodoHidden) aplicarMetodo(metodoHidden.value || 'TarjetaCredito');

  const num = document.getElementById('tarjeta-numero');
  const venc = document.getElementById('tarjeta-venc');

  if (num) {
    num.addEventListener('input', () => {
      const digits = num.value.replace(/\D/g, '').slice(0, 16);
      num.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    });
  }

  if (venc) {
    venc.addEventListener('input', () => {
      let v = venc.value.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
      venc.value = v;
    });
  }

  if (formPago) {
    formPago.addEventListener('submit', () => {
      const btn = document.getElementById('checkout-pay-btn');
      if (btn) {
        btn.disabled = true;
        btn.classList.add('loading');
      }
    });
  }
})();

// Verifica que goToBooking genere hora local (sin UTC)
const fmt2 = n => String(n).padStart(2, '0');
const fmtLocalDateTimeParam = (y, m, d, h, min) =>
  `${y}-${fmt2(m + 1)}-${fmt2(d)}T${fmt2(h)}:${fmt2(min || 0)}`;

const y = 2026, m = 5, d = 24, h = 8; // 24 jun 8am
const dt = new Date(y, m, d, h, 0, 0);
const oldWay = dt.toISOString().slice(0, 16);
const newWay = fmtLocalDateTimeParam(y, m, d, h, 0);
console.log('Clic 24 jun 8:00');
console.log('  Antes (UTC):', oldWay);
console.log('  Ahora (local):', newWay);
console.log('  OK:', newWay === '2026-06-24T08:00');

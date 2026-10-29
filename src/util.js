export const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` };
export const parse = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d) };
export const dias = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
export const addDias = (s, n) => { const d = parse(s); d.setDate(d.getDate()+n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` };
const fmt = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });
export const fecha = s => s ? fmt.format(parse(s)).replace('.', '') : 'Sin fecha';
// vencida: fecha < hoy y no completada; semana: vence en los próximos 7 días
export function alerta(t, hoy = hoyISO()) {
  if (!t.due || t.status === 'completada') return null;
  const d = dias(hoy, t.due);
  if (d < 0) return { tipo: 'vencida', label: -d === 1 ? 'Venció ayer' : `Vencida hace ${-d} días` };
  if (d <= 7) return { tipo: 'semana', label: d === 0 ? 'Vence hoy' : d === 1 ? 'Vence mañana' : `Vence en ${d} días` };
  return null;
}
export const progreso = tareas => { const total = tareas.length, hechas = tareas.filter(t => t.status === 'completada').length; return { total, hechas, pct: total ? Math.round(hechas*100/total) : 0 } };
export const iniciales = n => n ? n.split(' ').map(p => p[0]).join('') : '—';

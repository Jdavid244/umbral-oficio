import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, LayoutGroup, MotionConfig } from 'motion/react'
import { ESTADOS, EQUIPO, ESPACIOS, PROYECTOS, TAREAS, ACTIVIDAD } from './data.js'
import { hoyISO, fecha, alerta, progreso, iniciales, dias, addDias, parse } from './util.js'

const KEY = 'umbral-oficio.v1'
const SPRING = { type: 'spring', stiffness: 520, damping: 42, mass: 0.9 }
const DRAWER = { type: 'spring', stiffness: 380, damping: 38 }
const VISTAS = [
  ['proyectos', 'Proyectos'], ['resumen', 'Resumen'], ['tareas', 'Tareas'], ['tablero', 'Tablero'],
  ['cronograma', 'Cronograma'], ['calendario', 'Calendario'], ['equipo', 'Equipo'], ['actividad', 'Actividad'],
]
const estadoLabel = id => ESTADOS.find(e => e.id === id)?.label

function peorCaso() {
  const largo = 'Revisar exhaustivamente las condiciones sanitarias, de temperatura y de ventilación de todos los lotes del galpón norte antes del cierre del ciclo productivo'
  const extra = Array.from({ length: 300 }, (_, i) => ({ id: 'w' + i, project: 'p-produccion', parentId: i % 7 === 1 ? 'w0' : null,
    title: i === 0 ? largo : i === 2 ? 'Lote_GalponNorte_SinEspacios_' + 'X'.repeat(80) : `Tarea de prueba ${i + 1}`,
    status: ['por_hacer', 'en_curso', 'por_hacer'][i % 3], assignee: i % 4 ? EQUIPO[i % 5].name : null,
    start: i % 5 ? addDias(hoyISO(), (i % 40) - 20) : null, due: i % 3 ? addDias(hoyISO(), (i % 40) - 15) : null, description: '', priority: 'media' }))
  return { tareas: [...TAREAS.filter(t => t.project !== 'p-produccion'), ...extra], actividad: ACTIVIDAD }
}
const PEOR = new URLSearchParams(location.search).get('data') === 'worst'
function cargar() {
  if (PEOR) return peorCaso()
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s?.tareas) return s } catch {}
  return { tareas: TAREAS, actividad: ACTIVIDAD }
}
function useHash() {
  const get = () => (location.hash.replace(/^#\/?/, '') || 'proyectos').split('/')
  const [h, setH] = useState(get)
  useEffect(() => { const f = () => setH(get()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return h
}

export default function App() {
  const [db, setDb] = useState(cargar)
  const [espacio, setEspacio] = useState('org-avicola')
  const [proyecto, setProyecto] = useState('p-produccion')
  const [responsable, setResponsable] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [abierta, setAbierta] = useState(null)
  const [vista, deep] = useHash()
  useEffect(() => { if (deep) setAbierta(deep) }, [deep])
  const hoy = hoyISO()
  useEffect(() => { if (!PEOR) localStorage.setItem(KEY, JSON.stringify(db)) }, [db])

  const proyectosEsp = PROYECTOS.filter(p => p.org === espacio)
  useEffect(() => { if (!proyectosEsp.some(p => p.id === proyecto)) setProyecto(proyectosEsp[0]?.id) }, [espacio])
  const delProyecto = db.tareas.filter(t => t.project === proyecto)
  const filtradas = delProyecto.filter(t =>
    (responsable === 'todos' || (responsable === 'sin' ? !t.assignee : t.assignee === responsable)) &&
    (!busqueda || t.title.toLowerCase().includes(busqueda.toLowerCase())))
  const byId = useMemo(() => Object.fromEntries(db.tareas.map(t => [t.id, t])), [db.tareas])
  const proj = PROYECTOS.find(p => p.id === proyecto)

  const [aviso, setAviso] = useState('')
  const actualizar = (id, cambios, texto) => { if (texto) setAviso('Tú ' + texto); setDb(d => ({
    tareas: d.tareas.map(t => t.id === id ? { ...t, ...cambios } : t),
    actividad: texto ? [{ id: 'a' + Date.now(), at: new Date().toISOString(), actor: 'Tú', text: texto }, ...d.actividad] : d.actividad,
  })) }
  const mover = (id, status) => { const t = byId[id]; if (t && t.status !== status) actualizar(id, { status }, `movió «${t.title}» a ${estadoLabel(status)}`) }
  const nueva = () => {
    const id = 'n' + Date.now()
    setDb(d => ({ ...d, tareas: [...d.tareas, { id, project: proyecto, parentId: null, title: 'Nueva tarea', status: 'por_hacer', assignee: null, start: hoy, due: addDias(hoy, 7), description: '', priority: 'media' }] }))
    setAbierta(id)
  }
  const ctx = { tareas: filtradas, todas: delProyecto, byId, hoy, abrir: setAbierta, mover, proyecto: proj }
  const titulo = VISTAS.find(v => v[0] === vista)?.[1] || 'Proyectos'
  const conFiltros = ['tareas', 'tablero', 'cronograma', 'calendario', 'resumen'].includes(vista)

  return (
    <MotionConfig reducedMotion="user"><div className="app">
      <div className="ambient" aria-hidden><i /><i /><i /></div>
      <aside className="sidebar">
        <a className="brand" href="#/proyectos"><span className="brand-mark">u</span><span>umbral<small>espacio de trabajo · con Oficio</small></span></a>
        <div className="context">
          <label htmlFor="esp" className="eyebrow">Espacio de trabajo</label>
          <select id="esp" value={espacio} onChange={e => setEspacio(e.target.value)}>{ESPACIOS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
          <label htmlFor="pry" className="eyebrow" style={{ marginTop: 16, display: 'block' }}>Proyecto</label>
          <select id="pry" value={proyecto} onChange={e => setProyecto(e.target.value)}>{proyectosEsp.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
        </div>
        <nav aria-label="Vistas">{VISTAS.map(([id, l]) => <a key={id} href={`#/${id}`} className={'nav' + (vista === id ? ' active' : '')} aria-current={vista === id ? 'page' : undefined}>{l}</a>)}</nav>
        <div className="sidebar-bottom"><button className="link" onClick={() => { if (confirm('Esto borra los cambios locales de este navegador.')) { localStorage.removeItem(KEY); setDb({ tareas: TAREAS, actividad: ACTIVIDAD }) } }}>Restaurar datos demo</button><small>Copia local. No sale de este navegador.</small></div>
      </aside>
      <p className="sr-only" aria-live="polite">{aviso}</p>
      {PEOR && <p className="worst-banner">Modo peor caso (?data=worst): 300 tareas, nombres extremos y fechas faltantes. No se guarda.</p>}
      <main className="main">
        {vista !== 'proyectos' && (
          <header className="top">
            <div><p className="eyebrow">{proj?.area} · {proj?.name}</p><h1>{titulo}</h1></div>
            {conFiltros && <div className="filters">
              <input type="search" placeholder="Buscar tareas" aria-label="Buscar tareas" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              <select aria-label="Filtrar por responsable" value={responsable} onChange={e => setResponsable(e.target.value)}>
                <option value="todos">Todos los responsables</option><option value="sin">Sin asignar</option>
                {EQUIPO.map(m => <option key={m.name}>{m.name}</option>)}
              </select>
              <button className="primary" onClick={nueva}>+ Nueva tarea</button>
            </div>}
          </header>)}
        {vista === 'proyectos' && <Proyectos tareas={db.tareas} hoy={hoy} elegir={id => { setProyecto(id); setEspacio(PROYECTOS.find(p => p.id === id).org); location.hash = '#/tablero' }} />}
        {vista === 'resumen' && <Resumen {...ctx} />}
        {vista === 'tareas' && <Lista {...ctx} />}
        {vista === 'tablero' && <Tablero {...ctx} />}
        {vista === 'cronograma' && <Cronograma {...ctx} />}
        {vista === 'calendario' && <Calendario {...ctx} />}
        {vista === 'equipo' && <Equipo tareas={delProyecto} hoy={hoy} />}
        {vista === 'actividad' && <Actividad items={db.actividad} />}
      </main>
      <AnimatePresence>{abierta && byId[abierta] && <Panel key="panel" t={byId[abierta]} byId={byId} hijos={db.tareas.filter(x => x.parentId === abierta)} hoy={hoy}
        cerrar={() => setAbierta(null)} abrir={setAbierta} actualizar={actualizar} />}</AnimatePresence>
    </div></MotionConfig>
  )
}

function Progreso({ tareas }) {
  const p = progreso(tareas)
  return <div className="progress-wrap"><div className="progress" role="progressbar" aria-valuenow={p.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso"><motion.span initial={false} animate={{ width: p.pct + '%' }} transition={SPRING} /></div><small>{p.total === 0 ? 'Sin tareas todavía' : `${p.hechas} de ${p.total} ${p.total === 1 ? 'completada' : 'completadas'} · ${p.pct}%`}</small></div>
}
function Alerta({ t, hoy }) { const a = alerta(t, hoy); return a ? <span className={'alert ' + a.tipo}>{a.tipo === 'vencida' ? '! ' : '◷ '}{a.label}</span> : null }
function Avatar({ n }) { return <span className="avatar" title={n || 'Sin asignar'}>{iniciales(n)}</span> }
function Padre({ t, byId }) { const p = t.parentId && byId[t.parentId]; return p ? <span className="parent" title={p.title}>↳ Dentro de <b>{p.title}</b></span> : null }

function Proyectos({ tareas, hoy, elegir }) {
  return <section>
    <div className="hero"><h1 className="display">El trabajo, <em>en perspectiva.</em></h1><p className="lede">Avance calculado con las tareas completadas de cada proyecto, y alertas de atraso según la fecha de hoy.</p></div>
    {ESPACIOS.map(o => <div key={o.id}><h2 className="group-title">{o.name}</h2><div className="cards">
      {PROYECTOS.filter(p => p.org === o.id).map(p => {
        const ts = tareas.filter(t => t.project === p.id), venc = ts.filter(t => alerta(t, hoy)?.tipo === 'vencida').length, sem = ts.filter(t => alerta(t, hoy)?.tipo === 'semana').length
        return <button key={p.id} className="project-card" onClick={() => elegir(p.id)}>
          <span className="swatch" style={{ background: p.color }} /><p className="eyebrow">{p.area}</p><h3>{p.name}</h3><p className="muted">{p.description}</p>
          <Progreso tareas={ts} />
          <div className="chips">{venc > 0 && <span className="alert vencida">! {venc} vencida{venc > 1 ? 's' : ''}</span>}{sem > 0 && <span className="alert semana">◷ {sem} esta semana</span>}<span className="muted small">{ts.length} {ts.length === 1 ? 'tarea' : 'tareas'}</span></div>
        </button>
      })}</div></div>)}
  </section>
}

function Resumen({ tareas, todas, hoy, abrir, byId }) {
  const venc = tareas.filter(t => alerta(t, hoy)?.tipo === 'vencida'), sem = tareas.filter(t => alerta(t, hoy)?.tipo === 'semana')
  return <section className="grid2">
    <div className="panel-card"><p className="eyebrow">Avance del proyecto</p><Progreso tareas={todas} />
      <ul className="stat-list">{ESTADOS.map(e => <li key={e.id}><span className={'dot s-' + e.id} />{e.label}<b>{todas.filter(t => t.status === e.id).length}</b></li>)}</ul></div>
    <div className="panel-card"><p className="eyebrow">Requieren atención</p>
      {[...venc, ...sem].length === 0 && <p className="muted">Nada vencido ni por vencer.</p>}
      {[...venc, ...sem].map(t => <button key={t.id} className="row-btn" onClick={() => abrir(t.id)}><span>{t.title}<Padre t={t} byId={byId} /></span><Alerta t={t} hoy={hoy} /></button>)}</div>
  </section>
}

function Fila({ t, nivel, ctx }) {
  return <button className="task-row" style={{ paddingLeft: 14 + nivel * 26 }} onClick={() => ctx.abrir(t.id)}>
    <span className={'dot s-' + t.status} aria-hidden />
    <span className="title">{nivel > 0 && <span className="muted">↳ </span>}{t.title}{nivel > 0 && <Padre t={t} byId={ctx.byId} />}</span>
    <Alerta t={t} hoy={ctx.hoy} /><span className="muted small">{fecha(t.due)}</span><Avatar n={t.assignee} />
  </button>
}
function Lista(ctx) {
  const ids = new Set(ctx.tareas.map(t => t.id))
  const arbol = (t, nivel, grupo) => [<Fila key={t.id} t={t} nivel={nivel} ctx={ctx} />,
    ...ctx.tareas.filter(c => c.parentId === t.id && c.status === grupo).flatMap(c => arbol(c, nivel + 1, grupo))]
  return <section>{ESTADOS.map(e => {
    const grupo = ctx.tareas.filter(t => t.status === e.id), raices = grupo.filter(t => !t.parentId || !ids.has(t.parentId) || ctx.byId[t.parentId].status !== e.id)
    return <div key={e.id} className="list-group"><h2 className="group-title"><span className={'dot s-' + e.id} />{e.label} <span className="muted">{grupo.length}</span></h2>
      {grupo.length === 0 ? <p className="muted empty">Sin tareas</p> : raices.flatMap(t => arbol(t, t.parentId ? 1 : 0, e.id))}</div>
  })}</section>
}

function Tablero(ctx) {
  const [sobre, setSobre] = useState(null), [menu, setMenu] = useState(null), [arrastrando, setArrastrando] = useState(null)
  useEffect(() => { const f = e => e.key === 'Escape' && setMenu(null); addEventListener('keydown', f); return () => removeEventListener('keydown', f) }, [])
  return <section className="board" onClick={() => setMenu(null)}>
    <p className="muted small hint">Arrastra una tarjeta para cambiar su estado, o usa el menú ⋯ de cada tarjeta.</p>
    <LayoutGroup><div className="columns">{ESTADOS.map(e => {
      const ts = ctx.tareas.filter(t => t.status === e.id)
      return <div key={e.id} className={'column' + (sobre === e.id ? ' over' : '')}
        onDragOver={ev => { ev.preventDefault(); setSobre(e.id) }} onDragLeave={ev => { if (!ev.currentTarget.contains(ev.relatedTarget)) setSobre(null) }}
        onDrop={ev => { ev.preventDefault(); ctx.mover(ev.dataTransfer.getData('text/plain'), e.id); setSobre(null) }}>
        <h2 className="col-title"><span className={'dot s-' + e.id} />{e.label}<span className="count">{ts.length}</span></h2>
        <AnimatePresence initial={false}>{ts.map(t => <motion.div key={t.id} layout="position" layoutId={'card-' + t.id} transition={SPRING} style={{ position: 'relative', zIndex: menu === t.id ? 6 : 'auto' }}><article className={'card' + (arrastrando === t.id ? ' dragging' : '')} draggable onDragStart={ev => { ev.dataTransfer.setData('text/plain', t.id); ev.dataTransfer.effectAllowed = 'move'; setArrastrando(t.id) }} onDragEnd={() => setArrastrando(null)}>
          <button className="card-main" onClick={() => ctx.abrir(t.id)}>
            <Padre t={t} byId={ctx.byId} /><span className="card-title" title={t.title}>{t.title}</span>
            <span className="card-meta"><Avatar n={t.assignee} /><span className="muted small">{fecha(t.due)}</span><Alerta t={t} hoy={ctx.hoy} /></span>
          </button>
          <button className="kebab" aria-label={`Acciones para ${t.title}`} aria-haspopup="menu" aria-expanded={menu === t.id} onClick={ev => { ev.stopPropagation(); setMenu(menu === t.id ? null : t.id) }}>⋯</button>
          {menu === t.id && <motion.div className="menu" role="menu" initial={{ opacity: 0, scale: 0.97, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}>{ESTADOS.filter(x => x.id !== t.status).map(x => <button role="menuitem" key={x.id} onClick={() => { ctx.mover(t.id, x.id); setMenu(null) }}>Mover a {x.label}</button>)}</motion.div>}
        </article></motion.div>)}</AnimatePresence>
        {ts.length === 0 && <p className="muted empty">Suelta aquí</p>}
      </div>
    })}</div></LayoutGroup>
  </section>
}

function Cronograma(ctx) {
  const con = ctx.tareas.filter(t => t.start || t.due)
  if (!con.length) return <p className="muted empty-state">Ninguna tarea de este filtro tiene fechas. Agrégalas desde el detalle.</p>
  const fechas = con.flatMap(t => [t.start, t.due].filter(Boolean)).concat(ctx.hoy).sort()
  const ini = addDias(fechas[0], -2), fin = addDias(fechas[fechas.length - 1], 3), total = dias(ini, fin)
  const x = s => (dias(ini, s) / total) * 100
  const semanas = []; for (let d = ini; d <= fin; d = addDias(d, 7)) semanas.push(d)
  return <section className="gantt">
    {ctx.tareas.length > con.length && <p className="muted small">{ctx.tareas.length - con.length} sin fechas no aparecen aquí.</p>}
    <p className="muted small">Barra: del inicio a la entrega · Rojo con «!»: vencida · Ámbar: vence esta semana · Línea: hoy</p>
    <div className="gantt-head"><span />{<div className="ticks">{semanas.map(s => <span key={s} style={{ left: x(s) + '%' }}>{fecha(s)}</span>)}</div>}</div>
    {con.map(t => {
      const a = alerta(t, ctx.hoy), s = t.start || t.due, e = t.due || t.start
      return <button key={t.id} className="gantt-row" onClick={() => ctx.abrir(t.id)}>
        <span className="g-label" title={t.title}>{t.parentId && <span className="muted">↳ </span>}{t.title}</span>
        <span className="g-track"><span className="today" style={{ left: x(ctx.hoy) + '%' }} />
          <span className={`bar s-${t.status} ${a ? 'a-' + a.tipo : ''}`} style={{ left: x(s) + '%', width: Math.max(1.2, x(addDias(e, 1)) - x(s)) + '%' }} title={`${fecha(s)} – ${fecha(e)}`}>{a?.tipo === 'vencida' ? '!' : ''}</span></span>
      </button>
    })}
  </section>
}

function Calendario(ctx) {
  const h = parse(ctx.hoy), y = h.getFullYear(), m = h.getMonth()
  const primero = new Date(y, m, 1), offset = (primero.getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate()
  const celdas = [...Array(offset).fill(null), ...Array.from({ length: n }, (_, i) => `${y}-${String(m + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`)]
  return <section><h2 className="group-title">{new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(h)}</h2>
    <div className="cal">{['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map(d => <b key={d}>{d}</b>)}
      {celdas.map((d, i) => <div key={i} className={'day' + (d === ctx.hoy ? ' is-today' : '')}>{d && <><span className="num">{+d.slice(8)}</span>
        {ctx.tareas.filter(t => t.due === d).map(t => <button key={t.id} title={t.title} className={'cal-item ' + (alerta(t, ctx.hoy)?.tipo || '')} onClick={() => ctx.abrir(t.id)}>{t.title}</button>)}</>}</div>)}
    </div></section>
}

function Equipo({ tareas, hoy }) {
  return <section className="cards">{EQUIPO.map(m => { const ts = tareas.filter(t => t.assignee === m.name); return <div key={m.name} className="panel-card"><Avatar n={m.name} /><h3>{m.name}</h3><p className="muted">{m.role}</p><Progreso tareas={ts} />{ts.some(t => alerta(t, hoy)?.tipo === 'vencida') && <span className="alert vencida">! Tiene tareas vencidas</span>}</div> })}</section>
}
function Actividad({ items }) {
  const f = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' })
  return <section className="panel-card"><ul className="activity">{items.map(a => <li key={a.id}><b>{a.actor}</b> {a.text}<small>{f.format(new Date(a.at))}</small></li>)}</ul></section>
}

function Panel({ t, byId, hijos, hoy, cerrar, abrir, actualizar }) {
  const titulo = useRef(null)
  useEffect(() => { const prev = document.activeElement; titulo.current?.focus({ preventScroll: true }); return () => prev?.focus?.() }, [])
  useEffect(() => { const el = titulo.current; if (el && !CSS.supports('field-sizing', 'content')) { el.style.height = 'auto'; el.style.height = Math.max(44, el.scrollHeight) + 'px' } }, [t.title])
  useEffect(() => { const f = e => e.key === 'Escape' && cerrar(); addEventListener('keydown', f); return () => removeEventListener('keydown', f) }, [])
  const set = (k, label) => e => actualizar(t.id, { [k]: e.target.value || null }, label ? `cambió ${label} de «${t.title}»` : null)
  const padre = t.parentId && byId[t.parentId]
  return <><motion.div className="scrim" onClick={cerrar} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
    <motion.aside className="side-panel" role="dialog" aria-modal="true" aria-label="Detalle de tarea" initial={{ x: 48, opacity: 0, scale: 0.985 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: 32, opacity: 0, transition: { duration: 0.16 } }} transition={DRAWER}>
      <div className="sp-head"><p className="eyebrow">Detalle de tarea</p><button className="icon" onClick={cerrar} aria-label="Cerrar detalle">✕</button></div>
      {padre && <button className="parent-link" title={padre.title} onClick={() => abrir(padre.id)}>↳ Dentro de <b>{padre.title}</b></button>}
      <textarea ref={titulo} className="sp-title" aria-label="Título" rows={1} value={t.title} onChange={set('title')} />
      <Alerta t={t} hoy={hoy} />
      <dl className="fields">
        <dt>Estado</dt><dd><select value={t.status} onChange={set('status', 'el estado')}>{ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}</select></dd>
        <dt>Responsable</dt><dd><select value={t.assignee || ''} onChange={set('assignee', 'el responsable')}><option value="">Sin asignar</option>{EQUIPO.map(m => <option key={m.name}>{m.name}</option>)}</select></dd>
        <dt>Inicio</dt><dd><input type="date" value={t.start || ''} onChange={set('start', 'el inicio')} /></dd>
        <dt>Entrega</dt><dd><input type="date" value={t.due || ''} onChange={set('due', 'la entrega')} /></dd>
        <dt>Prioridad</dt><dd><select value={t.priority} onChange={set('priority')}>{['baja', 'media', 'alta', 'urgente'].map(p => <option key={p}>{p}</option>)}</select></dd>
      </dl>
      <label className="eyebrow" htmlFor="desc">Descripción</label>
      <textarea id="desc" rows={4} value={t.description} onChange={set('description')} placeholder="Agrega contexto para el equipo" />
      <p className="eyebrow">Subtareas · {hijos.filter(h => h.status === 'completada').length}/{hijos.length}</p>
      {hijos.length === 0 ? <p className="muted small">Sin subtareas.</p> : hijos.map(h => <button key={h.id} className="row-btn" onClick={() => abrir(h.id)}><span><span className={'dot s-' + h.status} />{h.title}</span><Alerta t={h} hoy={hoy} /></button>)}
    </motion.aside></>
}

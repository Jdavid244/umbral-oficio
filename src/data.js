// Datos demo (sin secretos). Fusiona Oficio (Plan de producción avícola) y Umbral (proyectos).
export const ESTADOS = [
  { id: 'por_definir', label: 'Por definir' },
  { id: 'por_hacer', label: 'Por hacer' },
  { id: 'en_curso', label: 'En curso' },
  { id: 'completada', label: 'Completada' },
];
export const EQUIPO = [
  { name: 'Nuria Sol', role: 'Coordinación' }, { name: 'Iván Costa', role: 'Planeación' },
  { name: 'Lea Prado', role: 'Calidad' }, { name: 'Tomás Bel', role: 'Operaciones' },
  { name: 'Alma Ríos', role: 'Logística' },
];
export const ESPACIOS = [
  { id: 'org-avicola', name: 'Operaciones avícolas' },
  { id: 'org-cadena', name: 'Cadena de abastecimiento' },
];
export const PROYECTOS = [
  { id: 'p-produccion', org: 'org-avicola', name: 'Plan de producción avícola', area: 'Producción', color: '#9a5a3c', description: 'Seguimiento de actividades de producción, sanidad y disponibilidad.' },
  { id: 'p-calidad', org: 'org-avicola', name: 'Aseguramiento de calidad', area: 'Calidad', color: '#5d6e59', description: 'Coordinación de controles y seguimiento a hallazgos.' },
  { id: 'p-frio', org: 'org-cadena', name: 'Distribución y cadena de frío', area: 'Logística', color: '#55707a', description: 'Seguimiento de despachos y condiciones de transporte.' },
  { id: 'p-insumos', org: 'org-cadena', name: 'Abastecimiento de insumos', area: 'Abastecimiento', color: '#8a6a3c', description: 'Planeación de compras, inventarios y proveedores.' },
];
const t = (id, project, parentId, title, status, assignee, start, due, description = '', priority = 'media') =>
  ({ id, project, parentId, title, status, assignee, start, due, description, priority });
export const TAREAS = [
  t('t1', 'p-produccion', null, 'Coordinar programación semanal', 'en_curso', 'Nuria Sol', '2026-10-19', '2026-11-02', 'Consolidar la programación y revisar capacidad disponible.', 'alta'),
  t('t2', 'p-produccion', 't1', 'Validar disponibilidad de alimento', 'completada', 'Lea Prado', '2026-10-19', '2026-10-24'),
  t('t3', 'p-produccion', 't1', 'Revisar condiciones de los lotes', 'por_hacer', 'Iván Costa', '2026-10-14', '2026-10-20', 'Revisar novedades registradas por el equipo.', 'alta'),
  t('t4', 'p-produccion', 't3', 'Consolidar novedades de campo', 'en_curso', 'Tomás Bel', '2026-10-22', '2026-10-29'),
  t('t5', 'p-produccion', null, 'Actualizar inventario de insumos', 'por_definir', null, null, null),
  t('t6', 'p-produccion', 't1', 'Coordinar controles sanitarios', 'en_curso', 'Tomás Bel', '2026-10-26', '2026-11-04', 'Revisar actividades preventivas programadas.'),
  t('t7', 'p-produccion', null, 'Confirmar programación de turnos', 'por_hacer', 'Lea Prado', '2026-10-30', '2026-11-06', 'Coordinar cobertura con los equipos.'),
  t('t8', 'p-produccion', null, 'Consolidar necesidades de abastecimiento', 'en_curso', 'Iván Costa', '2026-10-27', '2026-11-05', 'Recoger requerimientos para la siguiente semana.'),
  t('t9', 'p-produccion', null, 'Revisar plan de calidad', 'por_hacer', 'Nuria Sol', '2026-11-02', '2026-11-07'),
  t('t10', 'p-produccion', null, 'Consolidar informe de seguimiento', 'por_definir', 'Lea Prado', '2026-11-04', '2026-11-09', 'Recopilar avances y asuntos pendientes.'),
  t('t11', 'p-produccion', 't1', 'Verificar disponibilidad de equipos', 'completada', 'Tomás Bel', '2026-10-21', '2026-10-27'),
  t('c1', 'p-calidad', null, 'Programar revisiones de bienestar animal', 'en_curso', 'Lea Prado', '2026-10-20', '2026-11-03', '', 'alta'),
  t('c2', 'p-calidad', 'c1', 'Clasificar observaciones', 'completada', 'Lea Prado', '2026-10-20', '2026-10-25'),
  t('c3', 'p-calidad', 'c1', 'Definir acciones correctivas', 'por_hacer', 'Nuria Sol', '2026-10-24', '2026-10-27'),
  t('c4', 'p-calidad', null, 'Actualizar cronograma de inspección', 'completada', 'Iván Costa', '2026-10-12', '2026-10-22'),
  t('f1', 'p-frio', null, 'Coordinar despachos', 'en_curso', 'Alma Ríos', '2026-10-23', '2026-10-30'),
  t('f2', 'p-frio', 'f1', 'Verificar condiciones de transporte', 'por_hacer', 'Nuria Sol', '2026-10-28', '2026-11-12'),
  t('f3', 'p-frio', null, 'Revisar programación de rutas', 'por_hacer', 'Iván Costa', '2026-10-24', '2026-10-31'),
  t('f4', 'p-frio', 'f1', 'Actualizar registro de entregas', 'completada', 'Tomás Bel', '2026-10-20', '2026-10-26'),
  t('i1', 'p-insumos', null, 'Consolidar necesidades de compra', 'en_curso', 'Iván Costa', '2026-10-21', '2026-11-08'),
  t('i2', 'p-insumos', 'i1', 'Revisar niveles de inventario', 'completada', 'Alma Ríos', '2026-10-21', '2026-10-25'),
  t('i3', 'p-insumos', 'i1', 'Coordinar cotizaciones', 'por_hacer', 'Nuria Sol', '2026-10-27', '2026-11-10'),
  t('i4', 'p-insumos', null, 'Actualizar información de proveedores', 'por_definir', null, null, '2026-11-20'),
];
export const ACTIVIDAD = [
  { id: 'a1', at: '2026-10-21T09:00:00-05:00', actor: 'Nuria Sol', text: 'creó «Coordinar programación semanal»' },
  { id: 'a2', at: '2026-10-26T16:10:00-05:00', actor: 'Lea Prado', text: 'marcó «Validar disponibilidad de alimento» como Completada' },
  { id: 'a3', at: '2026-10-27T11:20:00-05:00', actor: 'Alma Ríos', text: 'creó «Coordinar despachos»' },
];

# Umbral · Oficio — prototipo fusionado

Prototipo estático (React + Vite) que fusiona **Umbral** (identidad editorial: títulos serif, paleta cálida, verde oliva) con el tablero por estados y los datos avícolas de **Oficio**. Datos demo en `localStorage`; nada sale del navegador.

## Vistas
Proyectos · Resumen · Tareas · Tablero · Cronograma · Calendario · Equipo · Actividad (rutas con hash, p. ej. `#/tablero`, `#/tablero/t3` abre el detalle).

## Mejoras
- Progreso por proyecto calculado con tareas completadas reales (los conteos coinciden).
- Alertas contra la fecha de hoy: rojo dedicado para **vencidas** (distinto del terracota de *En curso*), ámbar para las que vencen en 7 días.
- Subtareas agrupadas bajo su tarea madre, con «Dentro de …».
- Tablero con arrastrar y soltar + menú ⋯ (sin selector «Mover a» por tarjeta).
- Cronograma con fechas de inicio reales y línea de hoy.
- Texto gris pequeño con contraste WCAG AA.
- Detalle de tarea en panel lateral (Esc para cerrar).
- Filtro por responsable y búsqueda.

## Uso
```bash
npm install
npm run dev      # desarrollo
npm run build    # genera dist/ (base './', apto para GitHub Pages en subruta)
```

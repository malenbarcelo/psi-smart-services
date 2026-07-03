---
inclusion: manual
---

# Guía de Filtros - Side Panel

Convenciones y comportamiento estándar para filtros en panel lateral derecho. Portable entre proyectos.

## Estructura HTML

### Botón para abrir filtros (en page-title-actions)

```html
<button class="btn btn-secondary" id="openFilterBtn">
  <i class="fa-solid fa-filter"></i> Filtros
</button>
```

### Indicador de filtros activos (debajo del page-title-row, oculto por defecto)

```html
<div class="active-filters-bar" id="activeFiltersBar" style="display: none;">
  <span class="active-filters-text">Filtros aplicados</span>
  <button class="btn-clear-filters" id="clearFiltersBtn">
    <i class="fa-solid fa-xmark"></i> Quitar filtros
  </button>
</div>
```

### Panel de filtros

```html
<div class="filter-panel" id="filterPanel">
  <div class="filter-panel-header">
    <h3 class="filter-panel-title">Filtros</h3>
    <i class="fa-solid fa-xmark filter-panel-close" id="filterPanelClose"></i>
  </div>
  <div class="filter-panel-body">
    <!-- inputs de filtro acá -->
  </div>
  <div class="filter-panel-footer">
    <button class="btn btn-secondary" id="filterClearBtn">Limpiar</button>
    <button class="btn btn-primary" id="filterApplyBtn">Aplicar</button>
  </div>
</div>
<div class="filter-panel-overlay" id="filterPanelOverlay"></div>
```

## CSS requerido (en filters.css)

Incluir estas reglas adicionales:

```css
/* Active Filters Bar */
.active-filters-bar {
  display: flex;
  align-items: center;
  column-gap: 12px;
  margin-bottom: 16px;
  padding: 8px 14px;
  background-color: #fff8f0;
  border: 1px solid #ffe0c0;
  border-radius: 6px;
}

.active-filters-text {
  font-size: 12px;
  color: var(--color1);
  font-weight: 500;
}

.btn-clear-filters {
  border: none;
  background: none;
  color: var(--color1);
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  column-gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-clear-filters:hover {
  background-color: #ffe0c0;
}
```

## CSS para placeholders e inputs de filtro

Los inputs dentro del filter-panel usan color gris claro por defecto. Cuando tienen valor, el texto se muestra en gris oscuro:

```css
.filter-panel .input-field {
  color: var(--color4);
}

.filter-panel .input-field:not(:placeholder-shown),
.filter-panel select.input-field {
  color: #333;
}

.filter-panel .input-field::placeholder {
  color: #bbb;
}
```

Para los selects, el option vacío (placeholder) se muestra en gris claro y las opciones con valor en oscuro. Se maneja vía JS detectando si el value es vacío.

## Comportamiento JS

### Abrir/cerrar panel

```javascript
openFilterBtn.addEventListener('click', () => {
  filterPanel.classList.add('filter-panel-open')
  filterPanelOverlay.classList.add('filter-overlay-visible')
})

filterPanelClose.addEventListener('click', closeFilterPanel)
filterPanelOverlay.addEventListener('click', closeFilterPanel)

// close filter panel with escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && filterPanel.classList.contains('filter-panel-open')) {
    closeFilterPanel()
  }
})

function closeFilterPanel() {
  filterPanel.classList.remove('filter-panel-open')
  filterPanelOverlay.classList.remove('filter-overlay-visible')
}
```

### Aplicar filtros con Enter

```javascript
const filterInputs = filterPanel.querySelectorAll('.input-field')
filterInputs.forEach(input => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      applyFilters()
    }
  })
})

filterApplyBtn.addEventListener('click', applyFilters)
```

### Función applyFilters (genérica)

```javascript
function applyFilters() {
  closeFilterPanel()
  // recargar datos con filtros
  loadData()
  // mostrar barra de filtros activos si hay algún filtro
  updateActiveFiltersBar()
}
```

### Mostrar/ocultar barra de filtros activos

```javascript
function updateActiveFiltersBar() {
  const hasFilters = Array.from(filterInputs).some(input => input.value !== '')
  activeFiltersBar.style.display = hasFilters ? 'flex' : 'none'
}
```

### Quitar filtros

```javascript
clearFiltersBtn.addEventListener('click', () => {
  filterInputs.forEach(input => { input.value = '' })
  activeFiltersBar.style.display = 'none'
  loadData()
})

filterClearBtn.addEventListener('click', () => {
  filterInputs.forEach(input => { input.value = '' })
  updateActiveFiltersBar()
})
```

### Color de selects según valor

```javascript
function updateSelectColors() {
  const selects = filterPanel.querySelectorAll('select.input-field')
  selects.forEach(select => {
    select.style.color = select.value === '' ? '#bbb' : '#333'
    select.addEventListener('change', () => {
      select.style.color = select.value === '' ? '#bbb' : '#333'
    })
  })
}

// llamar al inicializar
updateSelectColors()
```

## Resumen de comportamientos

1. **Enter** en cualquier input del filter panel → aplica filtros y cierra panel
2. **Placeholders** en gris claro (`#bbb`), valores ingresados en gris oscuro (`#333`)
3. **Selects** vacíos en gris claro, con valor seleccionado en oscuro
4. **Barra "Quitar filtros"** aparece cuando hay filtros activos, desaparece al limpiar
5. **Botón Limpiar** dentro del panel resetea inputs pero no cierra el panel
6. **Botón Quitar filtros** en la página resetea inputs, oculta barra, y recarga datos

## Convención de búsqueda en backend

- Los filtros de texto (nombre, apellido, empresa, etc.) usan `LIKE %valor%` (case insensitive, búsqueda parcial)
- Si el usuario escribe "uAn p" debe encontrar "Juan Perez" — la búsqueda es por substring, sin importar mayúsculas/minúsculas
- Los filtros exactos (categoría, estado, select de curso) se envían como parámetros individuales con el valor exacto del ID/opción
- MySQL con charset utf8mb4 y collation `utf8mb4_general_ci` ya es case insensitive por defecto con `LIKE`
- En el dbQueries, usar `Op.like` de Sequelize para los filtros de texto
- Nunca hacer búsqueda exacta para campos de texto libres, siempre parcial
- Para nombre/apellido, buscar con CONCAT en ambos órdenes (nombre+apellido y apellido+nombre)

## Regla obligatoria para todos los módulos

Todos los `filters.js` de cada módulo DEBEN:
1. Cerrar el panel con Escape
2. Aplicar filtros con Enter desde cualquier input
3. Llamar a `resetAndLoad` (o equivalente) al aplicar — no solo mostrar la barra
4. Limpiar filtros desde el panel y desde la barra de filtros activos
5. Seguir el mismo patrón que `users/filters.js`

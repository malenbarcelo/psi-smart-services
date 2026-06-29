# Modularización de JS Frontend

## Estructura por Módulo

Cada carpeta en `public/js/<module>/` debe separar su código en archivos por responsabilidad:

```
public/js/<module>/
├── <module>.js        // archivo principal: imports, inicialización y orquestación
├── globals.js         // constantes, selectores DOM, estado del módulo
├── table.js           // renderizado de tabla, infinite scroll, sort
├── filters.js         // lógica del panel de filtros y barra de filtros activos
├── forms.js           // lógica de formularios/popups (crear, editar, validación)
├── utils.js           // helpers específicos del módulo (opcional, solo si aplica)
```

## Reglas

### Archivo principal (`<module>.js`)
- Es el entry point que se carga con `<script type="module">` en el EJS
- Importa los demás archivos del módulo
- Llama las funciones de inicialización (`init`)
- No contiene lógica de negocio, solo orquesta

### `globals.js`
- Exporta las constantes y selectores DOM que se usan en más de un archivo
- Exporta el estado mutable del módulo (offset, isLoading, etc.) como un objeto
- No tiene side effects (no agrega event listeners)

### `table.js`
- Exporta la función de renderizado de filas (`renderRows`)
- Exporta la función de carga de datos con paginación (`loadItems`, `resetAndLoad`)
- Maneja el infinite scroll
- Maneja el ordenamiento (sort headers)

### `filters.js`
- Exporta funciones de apertura/cierre del panel de filtros
- Exporta la función `buildFilterParams`
- Maneja la barra de filtros activos
- Maneja colores de selects y limpiar filtros

### `forms.js`
- Exporta funciones para abrir popup de crear/editar
- Contiene la lógica de validación y submit del formulario
- Maneja acciones de tabla (botones editar, eliminar, habilitar)
- Si hay formularios inline (como crear empresa), van acá también

### `utils.js` (opcional)
- Solo se crea si hay helpers específicos del módulo que no encajan en otro archivo
- Funciones puras y reutilizables dentro del módulo

## Patrón de Comunicación entre Archivos

Como usamos ES Modules nativos (`type="module"`), cada archivo exporta lo que los demás necesitan:

```javascript
// globals.js
export const PAGE_SIZE = 15
export const state = { currentOffset: 0, isLoading: false, hasMore: true }
export const elements = { tableBody: document.getElementById('...'), ... }

// table.js
import { state, elements, PAGE_SIZE } from './globals.js'
export function renderRows(items) { ... }
export function resetAndLoad() { ... }

// module.js (entry point)
import { initFilters } from './filters.js'
import { initTable } from './table.js'
import { initForms } from './forms.js'

initFilters()
initTable()
initForms()
```

## Cuándo Crear un Archivo Nuevo

- Si una responsabilidad tiene **más de ~50 líneas** de código, va en archivo separado
- Si un módulo es simple y todo el JS cabe en **menos de 100 líneas total**, puede quedar en un solo archivo
- No crear archivos con menos de 10-15 líneas solo por "separar"

## Carga en el EJS

Los scripts se cargan con un solo `<script type="module">` que apunta al archivo principal. Los imports internos se resuelven por el browser:

```html
<script type="module" src="/js/users/users.js"></script>
```

No se necesitan múltiples `<script>` tags porque ES Modules maneja las dependencias.

## Notas

- `globalUtils.js` (en `public/js/`) sigue siendo el lugar para utilidades compartidas entre TODOS los módulos
- `globals.js` (dentro de cada carpeta de módulo) es para lo específico de ESE módulo
- No duplicar lógica entre módulos: si algo se repite en 2+ módulos, va a `globalUtils.js`

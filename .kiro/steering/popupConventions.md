# Convenciones de Popups

## Cierre con Escape

Todos los popups (`.popup-overlay`) deben poder cerrarse con la tecla Escape. Esto se logra usando `gu.closeWithEscape(popups)` en el `globals.js` de cada módulo.

## Patrón obligatorio en `globals.js`

Al final del archivo `globals.js` de cada módulo que tenga popups, se deben registrar todos los popups del módulo:

```javascript
import { gu } from '../globalUtils.js'

// ... definición de elements, state, etc.

// close popups with Escape and close buttons
const popups = [elements.myPopup, elements.confirmPopup]
gu.closePopups(popups)
gu.closeWithEscape(popups)
```

## Reglas

- `gu.closePopups(popups)` registra los listeners de cierre en los botones Close (X) y Cancel de cada popup
- `gu.closeWithEscape(popups)` registra un listener global de Escape que cierra el popup visible
- Ambas funciones reciben el mismo array de elementos popup
- Todo popup nuevo que se agregue a un módulo debe sumarse a ese array
- No duplicar lógica de cierre manualmente en `forms.js` si ya está registrada en `globals.js`
- El order del array importa: `closeWithEscape` cierra el primer popup visible que encuentre en el array

## Filter Panels y Escape

Los filter panels (`.filter-panel`) también deben cerrarse con Escape. Como no son `.popup-overlay`, se manejan con un listener separado en `filters.js` de cada módulo:

```javascript
// close filter panel with escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && elements.filterPanel.classList.contains('filter-panel-open')) {
    closePanel()
  }
})
```

Todo elemento que se abre como overlay (popups, filter panels, side menus) debe poder cerrarse con Escape.

## Scroll al abrir popups

Cada vez que se abre un popup con contenido scrolleable, el scroll debe resetearse a 0. Esto evita que al abrir un popup previamente scrolleado, aparezca con el scroll abajo.

```javascript
// al abrir el popup, resetear scroll
popup.style.display = 'block'
popup.querySelector('.popup-card').scrollTop = 0
```

Aplicar esto en todos los popups que tengan `overflow-y: auto` en su `.popup-card` (max-height limitado).

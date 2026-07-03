# Convenciones CSS / UI

## Focus Outline

Ningún elemento interactivo (botones, inputs, selects, links) debe mostrar el outline negro por defecto del navegador al recibir foco.

### Regla

Todo elemento clickeable o focusable debe tener `outline: none` en su estado `:focus`. Ya está aplicado globalmente en:

- `.btn:focus` (buttons.css)
- `.btn-icon:focus` (buttons.css)
- `.btn-link:focus` (buttons.css)
- `.btn-clear-filters:focus` (filters.css)
- `.input-field:focus` (inputs.css)

### Al crear nuevos estilos

Si se crea un nuevo tipo de botón, input, o elemento interactivo, siempre agregar:

```css
.new-element:focus {
  outline: none;
}
```

### Nota de accesibilidad

Se usa `outline: none` porque el diseño provee indicadores visuales propios de foco (cambio de color, borde, etc.) en lugar del outline por defecto. Si en el futuro se necesita soporte completo de navegación por teclado, se puede reemplazar con un `:focus-visible` personalizado.

## Colores de texto

- **Títulos de página** (`.page-title`): `#4a4a4a` — gris oscuro, no negro puro
- **Títulos de cards/secciones**: `#4a4a4a` — mismo tono que los títulos de página
- **Texto body general**: `#333` (definido en `body` en generalStyles.css)
- **Texto secundario/subtítulos**: `#555` o `#777`

No usar negro puro (`#000` o `#2d2d2d`) para títulos. Preferir `#4a4a4a` para un look más moderno y menos pesado visualmente.

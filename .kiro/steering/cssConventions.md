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

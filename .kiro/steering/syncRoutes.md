---
inclusion: manual
---

# Crear Ruta Nueva

Cuando el usuario pida crear una nueva ruta/página, seguir estos pasos:

## Datos necesarios

- **routeName**: nombre de la ruta (ej: `cursos`, `eventos`, `alumnos`)
- **href**: URL de la ruta (ej: `/cursos`)
- **menuName**: nombre que se muestra en el menú (ej: `CURSOS`)
- **parentItem** (opcional): si es un subitem de un menú existente

## Pasos a ejecutar

### 1. Agregar ruta en appRoutes.js

Agregar debajo de `// kiro routes`:

```javascript
router.get('/href', authMiddleware, appController.routeName)
```

### 2. Agregar controller en appController.js

```javascript
routeName: async(req, res) => {
  try {
    const userLogged = req.session.userLogged
    const bottomHeaderMenu = headerMenu.find(h => h.idUsersCategories == userLogged.id_users_categories)?.menu || []
    const selectedItem = 'MENU_NAME'
    return res.render('routeName/routeName', { title, headerMenu, bottomHeaderMenu, selectedItem, userLogged })
  } catch(error) {
    console.log(error)
    return res.send('Ha ocurrido un error')
  }
},
```

Asegurar que estén importados:
- `const headerMenu = require('../data/headerMenu')`
- `const title = require('../data/title')`

### 3. Crear vista EJS

Crear `src/views/routeName/routeName.ejs`:

```ejs
<%- include('../partials/head') %>
<%- include('../partials/header') %>

<!----------SCRIPTS---------->
<script type="module" src="/js/routeName/routeName.js"></script>
```

### 4. Crear JS del frontend

Crear `public/js/routeName/routeName.js`:

```javascript
// routeName module
```

### 5. Actualizar headerMenu.js

Agregar el item al array de menú de cada categoría de usuario que corresponda. Formato:

```javascript
{ id: X, name: 'MENU_NAME', href: '/href', hrefName: '/routeName' }
```

Si es un subitem, agregarlo dentro del array `subitems` del item padre.

## Notas

- Si no existe `// kiro routes` en appRoutes, agregarlo como separador antes de las rutas nuevas
- Todas las rutas nuevas llevan `authMiddleware`
- El `selectedItem` debe coincidir con el `name` del item en headerMenu para que se marque como activo en el side menu

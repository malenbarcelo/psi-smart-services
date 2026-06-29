---
inclusion: always
---

# Convenciones de Nomenclatura

## Idioma

- **TODO** el código va en **inglés**: variables, funciones, clases CSS, nombres de archivos, carpetas de vistas, carpetas de JS
- Los comentarios en código (`// comments`) también van en **inglés**
- Los steerings y documentación interna pueden estar en español
- No mezclar idiomas dentro del código

### Única excepción: rutas de app (vistas)

Las URLs de las rutas de app (`appRoutes.js`) van en **español** porque es lo que ve el usuario final en el navegador:
- `/usuarios`, `/cursos`, `/eventos`

**Todo lo demás va en inglés**, incluyendo:
- Nombres de archivos de vistas: `src/views/users/users.ejs` (NO `usuarios/usuarios.ejs`)
- Nombres de archivos JS frontend: `public/js/users/users.js` (NO `usuarios/usuarios.js`)
- Controllers, queries, modelos, middlewares, utils
- Rutas de API: `/api/users`, `/api/courses`
- IDs y clases en HTML/CSS

### Regla de mapeo vista ↔ ruta

La ruta de app es en español (`/usuarios`) pero la carpeta de vista y el archivo JS se nombran en inglés (`users/users.ejs`, `js/users/users.js`). El controller en appController usa el nombre en inglés del módulo.

## Convenciones por Contexto

| Contexto | Convención | Ejemplo |
|----------|-----------|---------|
| Archivos JS | camelCase | `getUserData.js`, `orderController.js` |
| Carpetas de vistas | camelCase en inglés | `src/views/users/`, `src/views/courses/` |
| Carpetas de JS frontend | camelCase en inglés | `public/js/users/`, `public/js/courses/` |
| Variables y funciones JS | camelCase | `let userName`, `function getTotal()` |
| Propiedades de objetos que vienen de SQL | snake_case | `user.first_name`, `order.created_at` |
| Clases e IDs CSS | kebab-case | `.main-header`, `#user-profile` |
| Archivos CSS | kebab-case | `button-styles.css`, `main-layout.css` |
| Archivos steering / documentación | camelCase | `projectStructure.md` |
| Rutas de app (URL visible) | español | `/usuarios`, `/cursos`, `/eventos` |
| Rutas de API | inglés | `/api/users`, `/api/courses` |

## Reglas

- JS usa camelCase siempre (archivos, variables, funciones, métodos)
- Cuando un objeto se construye con datos de SQL, las propiedades mantienen snake_case tal como vienen de la base de datos
- CSS usa kebab-case para clases, IDs y nombres de archivo
- No mezclar convenciones dentro del mismo contexto
- Nombres descriptivos en inglés, sin abreviaturas ambiguas
- **NUNCA** usar español para nombres de archivos, carpetas, variables o funciones (solo URLs de app)

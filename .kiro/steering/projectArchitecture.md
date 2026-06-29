---
inclusion: auto
description: Arquitectura general del proyecto, tecnologías y estructura de carpetas
---

# Arquitectura del Proyecto

Documento técnico general que describe la estructura y convenciones de todos los proyectos que siguen esta arquitectura. Aplica a este proyecto y a cualquier otro que siga la misma estructura.

## Stack Tecnológico

- **Backend**: Node.js + Express
- **Vistas**: EJS (server-side rendering)
- **ORM**: Sequelize
- **Base de datos**: MySQL
- **Frontend JS**: Vanilla JS con ES Modules (`import/export`)
- **CSS**: Clases utilitarias propias (no framework)
- **Sesiones**: express-session
- **PDF**: pdfkit
- **Excel**: exceljs
- **ZIP**: JSZip (CDN en frontend)

## Separación App vs API

El proyecto tiene dos capas de rutas claramente separadas:

### App (vistas)
- Archivo de rutas: `src/routes/appRoutes.js`
- Controller: `src/controllers/appController.js`
- Propósito: renderizar vistas EJS
- Las rutas de app van en **español** (ej: `/usuarios`, `/cursos`, `/eventos`)
- Es lo único que va en español en el código

### API (datos)
- Archivo de rutas: `src/routes/apisRoutes.js`
- Controllers: `src/controllers/apisControllers/`
  - `getController.js` — GETs simples (listar, obtener por ID)
  - `createController.js` — POSTs de creación
  - `updateController.js` — PUTs/PATCHs de edición
  - `composedController.js` — operaciones complejas (no son un simple CRUD)
- Las rutas de API van en **inglés** (ej: `/api/users`, `/api/courses`, `/api/events`)
- Los controllers de API van en **inglés** (ej: `getUsers`, `createUser`, `updateUser`)

### Estructura de carpetas

```
src/
├── controllers/
│   ├── appController.js              # controller de vistas
│   └── apisControllers/
│       ├── getController.js          # gets simples
│       ├── createController.js       # creates
│       ├── updateController.js       # updates
│       └── composedController.js     # operaciones compuestas
├── routes/
│   ├── appRoutes.js                  # rutas de vistas (español)
│   └── apisRoutes.js                 # rutas de API (inglés)
```

### Regla de idioma

| Contexto | Idioma | Ejemplo |
|----------|--------|---------|
| Rutas de app (vistas) | Español | `/usuarios`, `/cursos` |
| Rutas de API | Inglés | `/api/users`, `/api/courses` |
| Controllers de API | Inglés | `getUsers`, `createUser` |
| Controllers de app | Español (nombre de ruta) | `usuarios`, `cursos` |
| Variables, funciones, lógica | Inglés | `const userLogged`, `function loadData()` |
| Clases CSS | Inglés (kebab-case) | `.page-title`, `.filter-panel` |
| Nombres de archivos JS | Inglés (camelCase) | `getController.js`, `usersQueries.js` |

### Registro de rutas en app.js

```javascript
const appRoutes = require('./src/routes/appRoutes.js')
const apisRoutes = require('./src/routes/apisRoutes.js')

app.use('/', appRoutes)
app.use('/api', apisRoutes)
```

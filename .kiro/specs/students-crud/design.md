# Technical Design

## Overview

Diseño técnico del módulo ALUMNOS (Students CRUD). Replica la arquitectura existente del módulo USUARIOS, incorporando visibilidad por empresa según categoría del usuario conectado.

## Architecture

### Estructura general

El módulo Students sigue el mismo patrón MVC del módulo Users existente:
- **Vista** (EJS server-rendered) → **Rutas** (Express Router) → **Controllers** → **Queries** (Sequelize) → **MySQL**
- **Frontend JS** (ES modules) se comunica con la API REST via `fetch()`

### Flujo de visibilidad por empresa

```
req.session.userLogged.id_users_categories
         │
         ▼
   ┌──────────┐     ┌─────────────────────────┐
   │ cat 1,2,4│────▶│ No filtro por empresa    │
   └──────────┘     │ Ve todos los alumnos     │
                    └─────────────────────────┘
   ┌──────────┐     ┌─────────────────────────┐
   │  cat 3   │────▶│ Filtra por id_companies  │
   └──────────┘     │ del usuario conectado    │
                    └─────────────────────────┘
```

## Components and Interfaces

### Componentes del sistema

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Browser)                                              │
│  ┌─────────────────────┐    ┌──────────────────────────────┐   │
│  │ students.ejs (view)  │    │ public/js/students/students.js│   │
│  └─────────────────────┘    └──────────────────────────────┘   │
│           │                            │                         │
│           │ renders                    │ fetch() calls           │
┌─────────────────────────────────────────────────────────────────┐
│  Backend (Express)                                               │
│  ┌──────────────┐   ┌──────────────────────────────────────┐   │
│  │ appRoutes.js │   │ apisRoutes.js                         │   │
│  │ GET /alumnos │   │ GET/POST/PUT /api/students            │   │
│  └──────┬───────┘   └──────────────┬───────────────────────┘   │
│         │                           │                            │
│         ▼                           ▼                            │
│  ┌──────────────┐   ┌──────────────────────────────────────┐   │
│  │appController │   │ getController / createController /     │   │
│  │  .students() │   │ updateController                       │   │
│  └──────────────┘   └──────────────┬───────────────────────┘   │
│                                     │                            │
│                                     ▼                            │
│                      ┌──────────────────────────────┐           │
│                      │ studentsQueries.js            │           │
│                      └──────────────┬───────────────┘           │
│                                     │                            │
│                                     ▼                            │
│                      ┌──────────────────────────────┐           │
│                      │ Sequelize Models              │           │
│                      │ Student ↔ UsersCompany        │           │
│                      └──────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────┐
│  MySQL Database       │
│  students table       │
│  users_companies table│
└──────────────────────┘
```

### Flujo de visibilidad por empresa

```
req.session.userLogged.id_users_categories
         │
         ▼
   ┌──────────┐     ┌─────────────────────────┐
   │ cat 1,2,4│────▶│ No filtro por empresa    │
   └──────────┘     │ Ve todos los alumnos     │
                    └─────────────────────────┘
   ┌──────────┐     ┌─────────────────────────┐
   │  cat 3   │────▶│ Filtra por id_companies  │
   └──────────┘     │ del usuario conectado    │
                    └─────────────────────────┘
```

## Data Models

### Student Model (actualización)

Agregar campo `id_companies` y asociación `belongsTo` UsersCompany:

```javascript
// database/models/Student.js - Campos a agregar:
id_companies: {
  type: DataTypes.INTEGER,
  allowNull: false
}

// Asociación a agregar en Student.associate:
Student.belongsTo(models.UsersCompany, { foreignKey: 'id_companies', as: 'company_data' })
```

### UsersCompany Model (actualización)

Agregar asociación inversa:

```javascript
// database/models/UsersCompany.js - Asociación a agregar:
UsersCompany.hasMany(models.Student, { foreignKey: 'id_companies', as: 'students' })
```

## API Endpoints

| Method | Endpoint | Descripción | Auth | Visibilidad |
|--------|----------|-------------|------|-------------|
| GET | `/api/students` | Listar con filtros y paginación | authMiddleware | Por categoría |
| GET | `/api/students/:id` | Obtener uno por ID | authMiddleware | Por categoría |
| POST | `/api/students` | Crear alumno | authMiddleware | Cat 3 fuerza id_companies |
| PUT | `/api/students/:id` | Editar alumno | authMiddleware | Valida visibilidad |
| PUT | `/api/students/:id/toggle-enabled` | Toggle enabled | authMiddleware | Valida visibilidad |

### GET /api/students - Query Params

| Param | Tipo | Descripción |
|-------|------|-------------|
| limit | int | Registros por página (default 15) |
| offset | int | Offset para paginación |
| search | string | Búsqueda parcial nombre/apellido |
| email | string | Búsqueda parcial email |
| dni | string | Búsqueda exacta DNI |
| company | string | Búsqueda parcial nombre empresa |
| enabled | 0/1 | Filtro por estado |

### Response format

```json
{
  "rows": [
    {
      "id": 1,
      "first_name": "Juan",
      "last_name": "Pérez",
      "email": "juan@test.com",
      "dni": 12345678,
      "id_companies": 1,
      "enabled": 1,
      "company_data": {
        "id": 1,
        "company_name": "Empresa X"
      }
    }
  ],
  "count": 50
}
```

## File Structure (archivos nuevos y modificados)

### Archivos nuevos

```
src/views/students/students.ejs          # Vista EJS
public/js/students/students.js           # Lógica frontend
```

### Archivos a modificar

```
database/models/Student.js               # Agregar id_companies + belongsTo
database/models/UsersCompany.js          # Agregar hasMany Student
src/dbQueries/studentsQueries.js         # Agregar include company, filtro empresa
src/routes/appRoutes.js                  # Agregar ruta GET /alumnos
src/routes/apisRoutes.js                 # Agregar rutas /students
src/controllers/appController.js         # Agregar método students()
src/controllers/apisControllers/getController.js      # Agregar getStudents, getStudentById
src/controllers/apisControllers/createController.js   # Agregar createStudent
src/controllers/apisControllers/updateController.js   # Agregar updateStudent, toggleStudentEnabled
src/data/headerMenu.js                   # Agregar item ALUMNOS
```

## Controller Logic

### getController.getStudents

```javascript
getStudents: async(req, res) => {
  try {
    const userLogged = req.session.userLogged
    const filters = {}
    const pagination = {}

    // Visibilidad por empresa
    if (userLogged.id_users_categories == 3) {
      filters.id_companies = userLogged.id_companies
    }

    // Filtros de query params
    if (req.query.search) filters.search = req.query.search
    if (req.query.email) filters.email = req.query.email
    if (req.query.dni) filters.dni = req.query.dni
    if (req.query.company) filters.company = req.query.company
    if (req.query.enabled !== undefined && req.query.enabled !== '') {
      filters.enabled = req.query.enabled
    }
    if (req.query.limit) {
      pagination.limit = parseInt(req.query.limit)
      pagination.offset = parseInt(req.query.offset) || 0
    }

    const students = await studentsQueries.get({ filters, pagination })
    return res.json(students)
  } catch(error) {
    console.log(error)
    return res.status(500).json({ error: 'Error getting students' })
  }
}
```

### createController.createStudent

```javascript
createStudent: async(req, res) => {
  try {
    const userLogged = req.session.userLogged
    let { first_name, last_name, email, dni, id_companies } = req.body

    // Cat 3 fuerza su propia empresa
    if (userLogged.id_users_categories == 3) {
      id_companies = userLogged.id_companies
    }

    if (!first_name || !last_name || !email || !dni || !id_companies) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Validar DNI único
    const existing = await studentsQueries.get({ filters: { dni } })
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'DNI already exists', field: 'dni' })
    }

    const newStudent = await studentsQueries.create({
      first_name, last_name, email,
      dni: parseInt(dni),
      id_companies: parseInt(id_companies),
      enabled: 1
    })

    return res.status(201).json(newStudent)
  } catch(error) {
    console.log(error)
    return res.status(500).json({ error: 'Error creating student' })
  }
}
```

## studentsQueries.js - Cambios

Agregar:
1. Filtro `id_companies` (para visibilidad por empresa)
2. Filtro `company` (búsqueda por nombre de empresa)
3. Include de `UsersCompany` como `company_data` en `get` y `getById`

```javascript
// En get():
if (filters.id_companies) {
  where.id_companies = filters.id_companies
}

let companyWhere = {}
if (filters.company) {
  companyWhere.company_name = { [Op.like]: `%${filters.company}%` }
}

const options = {
  where,
  order: [['last_name', 'ASC']],
  include: [
    {
      model: db.UsersCompany,
      as: 'company_data',
      where: Object.keys(companyWhere).length > 0 ? companyWhere : undefined,
      required: Object.keys(companyWhere).length > 0
    }
  ]
}
```

## Frontend (students.js) - Diseño

### Variables pasadas desde EJS a JS

La vista renderiza `userLogged` como variable global para que el JS frontend sepa la categoría:

```html
<script>
  window.userLogged = { id_users_categories: <%= userLogged.id_users_categories %>, id_companies: <%= userLogged.id_companies || 'null' %> }
</script>
```

### Lógica condicional del filtro Empresa

```javascript
// Si cat 3, ocultar filtro empresa
if (window.userLogged.id_users_categories == 3) {
  document.getElementById('filterCompanyGroup').style.display = 'none'
}
```

### Lógica condicional del select Empresa en el popup

Para cat 3, el select de empresa se oculta (se usa su empresa automáticamente desde backend). Para cat 1, 2 y 4, se muestra el select con todas las empresas.

### Estructura del módulo JS

```javascript
// public/js/students/students.js
import { gu } from '../globalUtils.js'

// DOM elements (same pattern as users.js)
// Infinite scroll state (PAGE_SIZE = 15)
// Event listeners: create, edit, toggle, filters
// Functions: loadStudents(), renderRows(), buildFilterParams(), resetAndLoadStudents()
// applyFilters(), updateActiveFiltersBar()
```

## Header Menu Change

Agregar item ALUMNOS después de USUARIOS en categorías 1, 2, 3 (y 4 si aplica):

```javascript
// Para cat 1, 2, 4:
{ id: X, name: 'ALUMNOS', href: '/alumnos', hrefName: 'alumnos', subitems: [] }
// Posición: después de USUARIOS

// Para cat 3:
{ id: X, name: 'ALUMNOS', href: '/alumnos', hrefName: 'alumnos', subitems: [] }
// Posición: antes de CURSOS (cat 3 no tiene USUARIOS)
```

## appController.students()

```javascript
students: async(req, res) => {
  try {
    const userLogged = req.session.userLogged
    const bottomHeaderMenu = headerMenu.find(h => h.idUsersCategories == userLogged.id_users_categories)?.menu || []
    const selectedItem = 'ALUMNOS'
    return res.render('students/students', { title, headerMenu, bottomHeaderMenu, selectedItem, userLogged })
  } catch(error) {
    console.log(error)
    return res.send('Ha ocurrido un error')
  }
}
```

## Vista students.ejs - Estructura

Replica la estructura de `users.ejs` con las columnas de Students:

- Table headers: Apellido, Nombre, Email, DNI, Empresa, Estado, Acciones
- Popup formulario: Nombre, Apellido, Email, DNI, Empresa (select, condicional)
- Panel filtros: Nombre/Apellido, Email, DNI, Empresa (condicional), Estado
- Popup confirmación (genérico)
- Result popup

## Security Considerations

- `authMiddleware` protege todas las rutas
- Visibilidad por empresa enforced en backend (no depende del frontend)
- Validación de DNI único server-side
- Cat 3 no puede asignar alumnos a otra empresa (forzado server-side)
- Input sanitization via Sequelize parameterized queries

## Error Handling

| Escenario | HTTP Status | Respuesta |
|-----------|-------------|-----------|
| Campos requeridos faltantes | 400 | `{ error: 'All fields are required' }` |
| DNI duplicado | 400 | `{ error: 'DNI already exists', field: 'dni' }` |
| Alumno no encontrado | 404 | `{ error: 'Student not found' }` |
| Error interno de servidor | 500 | `{ error: 'Error [action] student' }` |

El frontend maneja errores:
- Validación local antes de enviar (campos vacíos, formato email)
- Errores de backend con `field` muestran mensaje debajo del campo
- Errores de red/servidor mantienen el popup abierto sin perder datos

## Testing Strategy

Validación manual:
1. Login como cat 1 → ver todos los alumnos, filtro empresa visible
2. Login como cat 3 → ver solo alumnos de su empresa, filtro empresa oculto
3. CRUD completo (crear, editar, toggle enabled)
4. Filtros combinados + scroll infinito
5. Validaciones: DNI duplicado, campos vacíos, email inválido
6. UX: Escape cierra popups, Enter aplica filtros

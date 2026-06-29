# Implementation Plan: Students CRUD Module

## Overview

Implementación del módulo ALUMNOS con CRUD completo, visibilidad por empresa según categoría del usuario, y el mismo patrón de UI que el módulo USUARIOS.

## Tasks

- [ ] 1. Actualizar modelo Student (`database/models/Student.js`): agregar campo `id_companies` (INTEGER, NOT NULL), agregar asociación `Student.belongsTo(models.UsersCompany, { foreignKey: 'id_companies', as: 'company_data' })`
- [ ] 2. Actualizar modelo UsersCompany (`database/models/UsersCompany.js`): agregar asociación `UsersCompany.hasMany(models.Student, { foreignKey: 'id_companies', as: 'students' })`
- [ ] 3. Actualizar `src/dbQueries/studentsQueries.js`: agregar filtro `id_companies` exacto, filtro `company` parcial via include, agregar include de `UsersCompany` como `company_data` en `get` y `getById`, agregar método `getByDni(dni, excludeId)` para validar unicidad
- [ ] 4. Agregar item ALUMNOS en `src/data/headerMenu.js`: después de USUARIOS en categorías 1, 2 y 4; como primer item en categoría 3 (antes de CURSOS)
- [ ] 5. Agregar ruta `router.get('/alumnos', authMiddleware, appController.students)` en `src/routes/appRoutes.js`
- [ ] 6. Agregar método `students()` en `src/controllers/appController.js`: renderiza `students/students` con title, headerMenu, bottomHeaderMenu, selectedItem='ALUMNOS', userLogged
- [ ] 7. Agregar rutas API en `src/routes/apisRoutes.js`: GET `/students`, GET `/students/:id`, POST `/students`, PUT `/students/:id`, PUT `/students/:id/toggle-enabled` (todas con authMiddleware)
- [ ] 8. Agregar `getStudents` y `getStudentById` en `src/controllers/apisControllers/getController.js`: aplica visibilidad por empresa (cat 3 filtra por su id_companies), extrae filtros de query params, llama studentsQueries
- [ ] 9. Agregar `createStudent` en `src/controllers/apisControllers/createController.js`: valida campos requeridos, fuerza id_companies si cat 3, valida DNI único, crea con enabled=1, retorna 201
- [ ] 10. Agregar `updateStudent` y `toggleStudentEnabled` en `src/controllers/apisControllers/updateController.js`: valida existencia, visibilidad por empresa cat 3, DNI único excluyendo registro actual, actualiza/toggle
- [ ] 11. Crear vista `src/views/students/students.ejs`: misma estructura que users.ejs con columnas (Apellido, Nombre, Email, DNI, Empresa, Estado, Acciones), popup formulario, popup confirmación, panel filtros (Empresa condicional por categoría), result popup, variable window.userLogged
- [ ] 12. Crear `public/js/students/students.js`: módulo ES con import globalUtils, infinite scroll (PAGE_SIZE=15), CRUD con fetch API, panel filtros con Enter, ocultar filtro/select Empresa si cat 3, cargar empresas desde /api/users-companies

## Task Dependency Graph

```json
{
  "waves": [
    [1, 2, 4],
    [3, 5],
    [6, 7],
    [8, 9, 10, 11],
    [12]
  ]
}
```

## Notes

- El modelo Student ya existe pero le falta el campo `id_companies` y la asociación con UsersCompany
- El archivo `studentsQueries.js` ya existe con estructura base funcional, solo se agrega include y filtros nuevos
- Las rutas de API siguen el patrón `/api/students` (inglés), la ruta de app es `/alumnos` (español)
- La categoría 4 (presente en headerMenu.js) tiene el mismo comportamiento que cat 1 y 2 para visibilidad

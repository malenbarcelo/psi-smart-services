---
inclusion: manual
---

# Crear y actualizar models y queries

Cuando el usuario diga "Actualizar models y queries", seguir estos dos bloques en orden:

---

## BLOQUE 1: Crear modelos

### Pasos

1. Ir a `sqlScriptsAndData/` y revisar los archivos `.sql`:
   - Si el usuario especificó un archivo (ejemplo: "leer solo lists.sql"), leer únicamente ese archivo.
   - Si no especificó ninguno, leer todos los archivos `.sql` de la carpeta.
   En cada archivo hay uno o varios `CREATE TABLE`.

2. Por cada tabla, tiene que haber un modelo en `database/models/`. Si no existe, crearlo. Si ya existe, revisar si hubo cambios y actualizarlo.

### Lineamientos generales

- El nombre del archivo tiene que ser el nombre de la tabla en singular, con la primera letra en mayúscula, en snake_case.
  - Ejemplo: `imports_details` → `Imports_detail.js`
  - Ejemplo: `master` → `Master.js`
  - Ejemplo: `users_companies` → `Users_company.js`
  - Ejemplo: `students_inscriptions` → `Students_inscription.js`

- El **alias** del modelo (primer argumento de `sequelize.define()`) es el nombre de la tabla SQL tal cual pero con la primera letra en mayúscula (en plural, como la tabla):
  - Ejemplo: `students` → `"Students"`
  - Ejemplo: `users_companies` → `"Users_companies"`
  - Ejemplo: `courses_exams` → `"Courses_exams"`

- El formato del archivo Model.js debe ser:
  ```javascript
  module.exports = (sequelize, DataTypes) => {
    const alias = "Nombre_tabla_plural"

    const cols = {
      // campos...
    }

    const config = {
      tableName: 'nombre_tabla_sql',
      timestamps: false,
    }

    const Nombre_tabla_plural = sequelize.define(alias, cols, config)

    Nombre_tabla_plural.associate = (models) => {
      // asociaciones...
    }

    return Nombre_tabla_plural
  }
  ```

- En cada tabla, donde están las `REFERENCES`, hay un comentario que indica cómo nombrar la asociación `belongsTo`.
  - Ejemplo: `/* price_list_data */` → `as: 'price_list_data'`

- Las asociaciones referencian otros modelos por su **alias**: `models.Users_companies`, `models.Students`, etc.

- Si debajo de la tabla hay comentarios que digan `hasMany`, hay que crear tantas asociaciones `hasMany` como comentarios haya. En esos comentarios se aclara el `as` que debe tener cada asociación.

- Verificar que los comentarios de `hasMany` coincidan exactamente con las asociaciones generadas.

- Cada vez que se modifica un archivo `.sql`, verificar que los modelos correspondientes tengan todos los campos y foreign keys reflejados.

---

## BLOQUE 2: Crear queries

### Pasos

1. Por cada modelo en `database/models/` tiene que haber un archivo en `src/dbQueries/`.
   - Si el usuario especificó un archivo `.sql`, crear queries solo para los modelos correspondientes a las tablas de ese archivo.
   - Si no especificó ninguno, revisar todos los modelos.
   - Si el archivo ya existe. Revisarlo y actualizarlo.

### Lineamientos generales

   -El nombre del archivo es el alias del modelo en camelCase con la palabra "Queries" al final.
   Ejemplo: alias `Imports_details` → `importsDetailsQueries.js`
   Ejemplo: alias `Master` → `masterQueries.js`

  - Todos los archivos tiene que tener las siguientes queries: get, update, create, delete.
  - El archivo debe declarar `const model = db.Alias` (donde Alias es el alias del modelo principal) al inicio, después de los requires. Las operaciones sobre el modelo principal (findAll, count, findByPk, create, update, destroy) se hacen sobre `model`, no sobre `db.Alias` directamente. Las asociaciones en el include sí se referencian con `db.OtroAlias`.
  - SIEMPRE copiar el archivo `.kiro/templates/modelQueries.js` como base para cada nuevo archivo de queries. NO usar ningún otro archivo como referencia ni inventar la estructura.
  - NO modificar la estructura del template. Solo reemplazar el nombre del modelo, el nombre del objeto de queries, y los filtros/asociaciones correspondientes.
  - Si el archivo existe y tiene otras queries que no sean "get, update, create, delete", dejarlas. Si alguna de las queries "get, update, create, delete" es diferente al modelo, dejarlo como está. Solo enfocarse en agregar/eliminar/actualizar filtros si se crearon o borraron campos y agregar/eliminar/actualizar associations si se crearon o eliminaron associations.

  - Respecto a las associations, si el archivo .sql en las REFERENCES de la asociación tiene el comentario: /* dont't include in dbQueries */, no incluir esa asociación en la query. Las demás asociaciones del modelo SÍ deben incluirse en el `include` del `findAndCountAll`.

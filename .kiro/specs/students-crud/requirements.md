# Requirements Document

## Introduction

Sección ALUMNOS de la plataforma PSI Smart Services. Implementa un CRUD completo (Alta, Baja, Modificación y Listado) para la gestión de alumnos, replicando el mismo formato y comportamiento que la sección USUARIOS existente. Incluye tabla con scroll infinito, panel de filtros lateral, popup de creación/edición y confirmación de eliminación (soft delete).

## Glossary

- **Sistema_Alumnos**: Módulo completo de gestión de alumnos, incluyendo vista EJS, API REST, lógica frontend y queries de base de datos.
- **Tabla_Alumnos**: Componente de tabla HTML con clase `std-table` que muestra el listado de alumnos con scroll infinito.
- **Panel_Filtros**: Panel lateral deslizable que permite aplicar filtros de búsqueda sobre la tabla de alumnos.
- **Popup_Formulario**: Ventana emergente (overlay) con formulario para crear o editar un alumno.
- **Popup_Confirmacion**: Ventana emergente que solicita confirmación antes de deshabilitar o habilitar un alumno.
- **API_Students**: Endpoints REST bajo la ruta `/api/students` que proveen operaciones CRUD sobre la entidad Student.
- **Modelo_Student**: Modelo Sequelize `Student` mapeado a la tabla `students` de MySQL.
- **UsersCompany**: Modelo Sequelize que representa la tabla `users_companies`, asociada a alumnos mediante `id_companies`.
- **Menu_Header**: Configuración del menú lateral de navegación definida en `headerMenu.js`.

## Requirements

### Requerimiento 1: Navegación y acceso al módulo

**User Story:** Como administrador, quiero acceder a la sección de Alumnos desde el menú lateral, para poder gestionar los alumnos del sistema.

#### Criterios de Aceptación

1. THE Menu_Header SHALL incluir el item "ALUMNOS" con href `/alumnos` y hrefName `alumnos` inmediatamente después del item "USUARIOS" en los menús de las categorías Superadmin (1) y Admin PSI (2), e inmediatamente antes del item "CURSOS" en el menú de la categoría Admin Cliente (3).
2. WHEN un usuario con categoría 1, 2 o 3 accede a la ruta `/alumnos`, THE Sistema_Alumnos SHALL renderizar la vista de alumnos conteniendo un título de página, un botón de filtros, un botón de creación, y una tabla con filas cargadas dinámicamente.
3. IF un usuario sin categoría 1, 2 o 3 intenta acceder a `/alumnos`, THEN THE Sistema_Alumnos SHALL redirigir al usuario a la ruta `/` (página de login).
4. WHEN un usuario con categoría 1, 2 o 3 accede a la ruta `/alumnos` sin sesión activa en producción, THE Sistema_Alumnos SHALL redirigir al usuario a la ruta `/` (página de login).

### Requerimiento 2: Visibilidad de alumnos según categoría del usuario

**User Story:** Como administrador, quiero que cada usuario vea únicamente los alumnos que le corresponden según su rol, para mantener la segmentación de datos por empresa.

#### Criterios de Aceptación

1. WHEN el usuario conectado tiene categoría 1 (Superadmin), 2 (Admin PSI) o 4, THE API_Students SHALL retornar todos los alumnos sin restricción de empresa.
2. WHEN el usuario conectado tiene categoría 3 (Admin Cliente), THE API_Students SHALL retornar únicamente los alumnos cuyo campo `id_companies` coincide con el `id_companies` del usuario conectado.
3. THE API_Students SHALL aplicar la restricción de visibilidad por empresa de forma automática en el backend, sin depender de parámetros enviados por el frontend.
4. WHEN un usuario con categoría 3 intenta acceder vía GET `/api/students/:id` a un alumno que no pertenece a su empresa, THE API_Students SHALL retornar status 404.

### Requerimiento 3: Listado de alumnos con scroll infinito

**User Story:** Como administrador, quiero ver la lista de alumnos en una tabla con carga progresiva, para poder navegar grandes volúmenes de datos sin tiempos de carga excesivos.

#### Criterios de Aceptación

1. WHEN la vista de alumnos se carga inicialmente, THE Tabla_Alumnos SHALL mostrar las columnas: Apellido, Nombre, Email, DNI, Empresa, Estado, Acciones.
2. WHEN la vista se inicializa, THE Sistema_Alumnos SHALL cargar los primeros 15 registros de alumnos (respetando la visibilidad por empresa del usuario conectado) ordenados por apellido ascendente y mostrarlos en la tabla.
3. WHEN el usuario hace scroll y alcanza el final visible de la tabla (margen de 50px) y existe al menos una página adicional de registros por cargar, THE Sistema_Alumnos SHALL mostrar un indicador de carga, solicitar los siguientes 15 registros al endpoint GET /api/students con los parámetros limit y offset correspondientes, y agregarlos al final de la tabla.
4. IF la cantidad de registros cargados es igual al total de registros disponibles informado por la API, THEN THE Sistema_Alumnos SHALL detener las solicitudes de carga adicional y no realizar nuevas peticiones al hacer scroll.
5. THE Tabla_Alumnos SHALL mostrar el nombre de la empresa asociada al alumno mediante la relación con UsersCompany (campo `id_companies`), o mostrar un guion ("-") si el alumno no tiene empresa asociada.
6. THE Tabla_Alumnos SHALL mostrar el estado del alumno como badge con texto "Activo" (clase `badge-active`) cuando el campo `enabled` es 1, o "Inactivo" (clase `badge-inactive`) cuando el campo `enabled` es 0.
7. IF la solicitud de carga de registros al endpoint falla (error de red o respuesta no exitosa), THEN THE Sistema_Alumnos SHALL permitir que el siguiente evento de scroll reintente la carga sin perder los registros ya mostrados en la tabla.

### Requerimiento 4: Filtros de búsqueda

**User Story:** Como administrador, quiero filtrar alumnos por distintos criterios, para encontrar rápidamente los registros que necesito.

#### Criterios de Aceptación

1. WHEN el usuario con categoría 1, 2 o 4 presiona el botón "Filtros", THE Panel_Filtros SHALL desplegarse desde el lateral derecho con los campos: Nombre/Apellido (texto, máximo 200 caracteres), Email (texto, máximo 300 caracteres), DNI (texto, máximo 20 caracteres), Empresa (texto, máximo 100 caracteres), Estado (select con opciones Todos/Activo/Inactivo).
2. WHEN el usuario con categoría 3 presiona el botón "Filtros", THE Panel_Filtros SHALL desplegarse desde el lateral derecho con los campos: Nombre/Apellido (texto, máximo 200 caracteres), Email (texto, máximo 300 caracteres), DNI (texto, máximo 20 caracteres), Estado (select con opciones Todos/Activo/Inactivo). El campo Empresa NO se muestra.
3. WHEN el usuario presiona "Aplicar" en el panel de filtros, THE Sistema_Alumnos SHALL reiniciar la paginación a offset 0 y cargar los alumnos que coincidan con todos los filtros aplicados simultáneamente (lógica AND entre filtros con valor).
4. WHEN el filtro Nombre/Apellido tiene valor, THE API_Students SHALL buscar coincidencias parciales (LIKE %valor%) en la concatenación de first_name y last_name, y también en la concatenación inversa last_name y first_name, sin distinción de mayúsculas/minúsculas.
5. WHEN el filtro Email tiene valor, THE API_Students SHALL buscar coincidencias parciales (LIKE %valor%) en el campo email, sin distinción de mayúsculas/minúsculas.
6. WHEN el filtro DNI tiene valor, THE API_Students SHALL buscar coincidencia exacta en el campo dni.
7. WHEN el filtro Empresa tiene valor (solo disponible para categorías 1, 2 y 4), THE API_Students SHALL buscar coincidencias parciales (LIKE %valor%) en el campo company_name de la tabla UsersCompany asociada al alumno mediante id_companies.
8. IF el filtro Estado tiene seleccionado "Activo" o "Inactivo", THEN THE API_Students SHALL filtrar por el campo enabled (1 para Activo, 0 para Inactivo); si el valor es "Todos", no se aplica filtro por estado.
9. WHEN hay filtros aplicados y la consulta no retorna resultados, THE Sistema_Alumnos SHALL mostrar la tabla vacía con un mensaje indicando que no se encontraron alumnos con los filtros aplicados.
10. WHEN hay filtros aplicados, THE Sistema_Alumnos SHALL mostrar una barra superior indicando "Filtros aplicados" con un botón "Quitar filtros" visible.
11. WHEN el usuario presiona "Quitar filtros", THE Sistema_Alumnos SHALL limpiar todos los valores de los campos de filtro, ocultar la barra de filtros aplicados y recargar la tabla sin filtros desde offset 0.
12. WHEN el usuario presiona Enter dentro de cualquier campo del panel de filtros, THE Panel_Filtros SHALL aplicar los filtros automáticamente con el mismo comportamiento que el botón "Aplicar".

### Requerimiento 5: Creación de alumnos

**User Story:** Como administrador, quiero crear nuevos alumnos mediante un formulario, para registrarlos en el sistema.

#### Criterios de Aceptación

1. WHEN el usuario presiona "Nuevo Alumno", THE Popup_Formulario SHALL mostrarse con el título "Nuevo Alumno" y los campos vacíos: Nombre (texto, máximo 200 caracteres), Apellido (texto, máximo 200 caracteres), Email (texto, máximo 300 caracteres), DNI (numérico, entre 1 y 99999999), Empresa (select con opción por defecto "Seleccionar").
2. WHEN el Popup_Formulario se muestra, THE Popup_Formulario SHALL cargar en el select de Empresa todas las empresas con enabled=1 obtenidas desde el endpoint de users-companies.
3. WHEN el usuario completa el formulario con datos válidos y presiona "Guardar", THE API_Students SHALL crear un nuevo registro en la tabla students con los campos first_name, last_name, email, dni, id_companies seleccionado y enabled=1, y retornar el registro creado con status 201.
4. IF alguno de los campos (Nombre, Apellido, Email, DNI, Empresa) está vacío o sin selección al intentar guardar, THEN THE Popup_Formulario SHALL mostrar el mensaje "Campo requerido" debajo de cada campo que no cumple la condición, sin enviar la petición al backend.
5. IF el campo email contiene un valor que no cumple el patrón estándar de email (texto@texto.texto), THEN THE Popup_Formulario SHALL mostrar el mensaje "Ingrese un email válido" debajo del campo email.
6. IF el DNI ingresado ya existe en la tabla students (validación backend), THEN THE API_Students SHALL retornar un error con el campo identificado y THE Popup_Formulario SHALL mostrar el mensaje "Este DNI ya está registrado" debajo del campo DNI.
7. IF la petición al backend falla por error de servidor o red, THEN THE Popup_Formulario SHALL permanecer abierto conservando los datos ingresados por el usuario.
8. WHEN la creación es exitosa (status 201), THE Sistema_Alumnos SHALL cerrar el popup, mostrar el mensaje "Alumno creado con éxito" en el result-popup durante 3 segundos, y recargar la tabla de alumnos.

### Requerimiento 6: Edición de alumnos

**User Story:** Como administrador, quiero editar los datos de un alumno existente, para mantener la información actualizada.

#### Criterios de Aceptación

1. WHEN el usuario presiona el botón de editar en una fila, THE Popup_Formulario SHALL mostrarse con el título "Editar Alumno" y los campos first_name, last_name, email y dni precargados con los datos actuales del alumno seleccionado.
2. WHEN el usuario modifica los datos y presiona "Guardar" con todos los campos válidos, THE API_Students SHALL enviar una solicitud PUT /api/students/:id y actualizar el registro del alumno con los nuevos datos.
3. IF alguno de los campos obligatorios (first_name, last_name, email, dni) está vacío al intentar guardar, THEN THE Popup_Formulario SHALL mostrar el mensaje "Campo requerido" debajo de cada campo vacío e impedir el envío del formulario.
4. IF el campo email no cumple con el formato estándar de dirección de correo electrónico (texto@texto.texto), THEN THE Popup_Formulario SHALL mostrar el mensaje "Ingrese un email válido" debajo del campo email.
5. IF el DNI ingresado ya existe en otro registro de la tabla students (excluyendo el registro actual siendo editado), THEN THE Popup_Formulario SHALL mostrar el mensaje "Este DNI ya está registrado" debajo del campo DNI.
6. WHEN la edición es exitosa, THE Sistema_Alumnos SHALL cerrar el popup, mostrar un mensaje de éxito "Alumno editado con éxito" durante 3 segundos y recargar la tabla con los datos actualizados.
7. IF el alumno que se intenta editar ya no existe en la base de datos (fue eliminado por otro usuario), THEN THE Sistema_Alumnos SHALL cerrar el popup y mostrar un mensaje de error indicando que el alumno no fue encontrado.
8. IF la solicitud PUT a la API falla por un error de servidor o de red, THEN THE Popup_Formulario SHALL permanecer abierto con los datos ingresados preservados y mostrar un mensaje de error indicando que no se pudo guardar la edición.
9. IF el campo first_name o last_name supera los 200 caracteres, o el campo email supera los 300 caracteres, THEN THE Popup_Formulario SHALL mostrar un mensaje indicando que se excedió el largo máximo permitido debajo del campo correspondiente.

### Requerimiento 7: Habilitación y deshabilitación de alumnos (soft delete)

**User Story:** Como administrador, quiero deshabilitar o habilitar alumnos, para gestionar su estado sin perder los datos asociados.

#### Criterios de Aceptación

1. WHEN el alumno está activo (enabled=1), THE Tabla_Alumnos SHALL mostrar un botón de deshabilitar con clase CSS `btn-icon-delete` e icono `fa-solid fa-trash` en la columna de acciones.
2. WHEN el alumno está inactivo (enabled=0), THE Tabla_Alumnos SHALL mostrar un botón de habilitar con clase CSS `btn-icon-enable` e icono `fa-solid fa-trash-arrow-up` en la columna de acciones.
3. WHEN el usuario presiona el botón de deshabilitar, THE Popup_Confirmacion SHALL mostrarse con el título "Deshabilitar Alumno" y el mensaje "¿Está seguro que desea deshabilitar este alumno?".
4. WHEN el usuario presiona el botón de habilitar, THE Popup_Confirmacion SHALL mostrarse con el título "Habilitar Alumno" y el mensaje "¿Está seguro que desea habilitar este alumno?".
5. WHEN el usuario presiona cancelar, la X de cierre, o la tecla Escape en el Popup_Confirmacion, THE Sistema_Alumnos SHALL cerrar el popup sin modificar el estado del alumno.
6. WHEN el usuario confirma la acción, THE API_Students SHALL enviar una petición PUT a /api/students/:id/toggle-enabled y cambiar el valor del campo enabled del alumno (de 0 a 1 o de 1 a 0).
7. WHEN la API responde exitosamente (HTTP 200), THE Sistema_Alumnos SHALL cerrar el popup de confirmación y recargar la tabla completa desde el primer registro.
8. IF la API responde con error (HTTP 404 o 500), THEN THE Sistema_Alumnos SHALL cerrar el popup de confirmación y no modificar la tabla.

### Requerimiento 8: API REST de alumnos

**User Story:** Como desarrollador, quiero endpoints REST bien definidos para alumnos, para que el frontend pueda realizar las operaciones CRUD.

#### Criterios de Aceptación

1. WHEN se recibe un GET a `/api/students` con parámetros de paginación (`limit` como entero entre 1 y 100, `offset` como entero >= 0), THE API_Students SHALL retornar un objeto JSON con `rows` (array de alumnos donde cada alumno incluye los datos de la empresa asociada vía `id_companies`) y `count` (total de registros que coinciden con los filtros aplicados), aplicando la restricción de visibilidad por empresa según la categoría del usuario conectado (ver Requerimiento 2).
2. WHEN se recibe un GET a `/api/students/:id` y el alumno existe, THE API_Students SHALL retornar el objeto del alumno incluyendo los datos de la empresa asociada vía `id_companies`, siempre que el usuario tenga visibilidad sobre ese alumno según su categoría.
3. WHEN se recibe un POST a `/api/students` con todos los campos requeridos (`first_name`, `last_name`, `email`, `dni`, `id_companies`) válidos, THE API_Students SHALL crear el alumno con `enabled` en 1 y retornar el registro creado con status 201.
4. WHEN se recibe un PUT a `/api/students/:id` con todos los campos requeridos (`first_name`, `last_name`, `email`, `dni`, `id_companies`) válidos y el alumno existe, THE API_Students SHALL actualizar el alumno y retornar el registro actualizado con status 200.
5. WHEN se recibe un PUT a `/api/students/:id/toggle-enabled` y el alumno existe, THE API_Students SHALL alternar el campo `enabled` del alumno (de 1 a 0 o de 0 a 1) y retornar un objeto con `success: true` y el nuevo valor de `enabled`.
6. IF se recibe un POST o PUT a `/api/students` o `/api/students/:id` con un `dni` que ya existe en otro registro de alumno distinto al que se está editando, THEN THE API_Students SHALL retornar status 400 con un objeto que incluya `field: 'dni'` en el cuerpo de la respuesta.
7. IF se solicita un alumno con un id inexistente en GET `/api/students/:id`, PUT `/api/students/:id` o PUT `/api/students/:id/toggle-enabled`, THEN THE API_Students SHALL retornar status 404 con un objeto JSON de error.
8. IF se recibe un POST o PUT a `/api/students` o `/api/students/:id` sin alguno de los campos requeridos (`first_name`, `last_name`, `email`, `dni`, `id_companies`), THEN THE API_Students SHALL retornar status 400 con un mensaje de error indicando que todos los campos son requeridos.
9. IF ocurre un error interno del servidor al procesar cualquier endpoint de `/api/students`, THEN THE API_Students SHALL retornar status 500 con un objeto JSON que contenga un campo `error` con un mensaje descriptivo.
10. WHEN un usuario con categoría 3 envía un POST a `/api/students`, THE API_Students SHALL forzar el campo `id_companies` al valor del `id_companies` del usuario conectado, ignorando cualquier valor enviado por el frontend.

### Requerimiento 9: Modelo de datos y asociación con empresa

**User Story:** Como desarrollador, quiero que el modelo Student tenga la asociación correcta con UsersCompany, para poder consultar la empresa del alumno.

#### Criterios de Aceptación

1. THE Modelo_Student SHALL incluir el campo `id_companies` de tipo INTEGER, NOT NULL, como foreign key hacia la tabla `users_companies`.
2. THE Modelo_Student SHALL definir una asociación belongsTo con UsersCompany usando foreign key `id_companies` y alias `company_data`.
3. THE UsersCompany SHALL definir una asociación hasMany con Student usando foreign key `id_companies` y alias `students`.
4. WHEN se consulta un alumno mediante la query `get`, THE API_Students SHALL incluir el modelo UsersCompany mediante eager loading con el alias `company_data`, retornando los campos `id` y `company_name` de la empresa asociada.
5. WHEN se consulta un alumno mediante la query `getById`, THE API_Students SHALL incluir el modelo UsersCompany mediante eager loading con el alias `company_data`, retornando los campos `id` y `company_name` de la empresa asociada.
6. WHEN se consulta un alumno y el valor de `id_companies` referencia una empresa que no existe en la tabla `users_companies`, THE API_Students SHALL retornar el alumno con el campo `company_data` en valor null.

### Requerimiento 10: Interacción de popups y UX

**User Story:** Como usuario, quiero que los popups se cierren de forma intuitiva, para tener una experiencia de uso fluida.

#### Criterios de Aceptación

1. WHEN el usuario presiona la tecla Escape, THE Sistema_Alumnos SHALL cerrar el primer popup visible (formulario, confirmación o panel de filtros) utilizando la función `closeWithEscape` de globalUtils.
2. WHEN el usuario presiona el botón de cierre (X) del popup, THE Sistema_Alumnos SHALL cerrar el popup correspondiente estableciendo su display en "none".
3. WHEN el usuario presiona "Cancelar" en un popup, THE Sistema_Alumnos SHALL cerrar el popup sin realizar cambios ni enviar peticiones al backend.
4. WHEN el usuario presiona el overlay del panel de filtros (`filterPanelOverlay`), THE Panel_Filtros SHALL cerrarse removiendo la clase `slideIn`.
5. WHEN una operación CRUD es exitosa, THE Sistema_Alumnos SHALL mostrar el result-popup con el mensaje correspondiente durante 3 segundos utilizando la función `showResultPopup` de globalUtils, y luego ocultarlo automáticamente.

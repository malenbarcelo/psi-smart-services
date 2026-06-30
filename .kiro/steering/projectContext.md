---
inclusion: always
---

# Contexto del Proyecto - PSI Smart Services

## Descripción General

PSI Smart Services es una empresa que dicta cursos de diferente índole. Esta plataforma permite gestionar usuarios, cursos, eventos, empresas invitadas, alumnos, exámenes y certificados.

## Módulos

### Usuarios
- Ver, crear, editar, eliminar, filtrar usuarios
- Cambiar contraseña
- Categorías de usuarios:
  - Superadmin (id_users_categories = 1)
  - Administrador PSI (id_users_categories = 2)
  - Administrador Cliente (id_users_categories = 3)

### Empresas
- Ver, crear, editar, eliminar empresas
- Las empresas son invitadas a eventos y pueden reservar cupos

### Cursos
- Ver, crear, editar, eliminar cursos
- Crear eventos para cada curso
- Ver próximos eventos
- Asignar cuestionarios a eventos
- Algunos cursos tienen múltiples módulos con jerarquía (módulo I → módulo II → ...)

### Eventos
- Ver, crear, editar, eliminar eventos de un curso
- Al crear un evento se asigna un cupo máximo
- Se invita a empresas al evento
- Las empresas reservan X cantidad de cupos
- Las empresas cargan alumnos anotados o envían la lista a PSI para carga

### Alumnos
- Ver alumnos y a qué eventos están anotados
- Descargar certificados

### Exámenes
- URL pública: el alumno ingresa su DNI y ve exámenes pendientes
- Los módulos se habilitan progresivamente (hasta no aprobar módulo I no puede hacer módulo II)

### Resultados
- Ver por curso las personas que rindieron
- Notas obtenidas
- Fecha de vencimiento de certificado

### Certificados
- Se generan automáticamente en PDF al aprobar un curso
- El Superadmin puede regenerar certificados
- Se descargan desde la vista de alumnos

## Flujo General

1. Se crea un curso (puede tener módulos jerárquicos)
2. Se crea un evento para ese curso con cupos y empresas invitadas
3. Las empresas reservan cupos y cargan alumnos
4. Los alumnos rinden exámenes progresivamente
5. Al aprobar todos los módulos, se genera certificado

## Notas Técnicas

- Stack: Node.js + Express + EJS + MySQL + Sequelize
- Los detalles de cada módulo se irán ampliando a medida que se desarrollen

## Inscripciones (students_inscriptions)

### Flujo de creación de inscripción individual

1. Se recibe: empresa, curso, DNI, nombre, apellido, email
2. Se busca en `students` si existe la combinación `dni` + `id_companies`
3. Si existe → se toma ese `id_students`
4. Si no existe → se crea el alumno en `students` y se toma el `id` creado
5. Se crea registro en `students_inscriptions` con:
   - `id_companies`: empresa seleccionada
   - `id_students`: el id obtenido/creado
   - `id_courses`: curso seleccionado
   - `inscription_date`: fecha actual (YYYY-MM-DD)
   - `status`: 'pending'
   - `grade`: null
   - `updated_at`: null

### Posibles valores de status (inscripción)

| Valor | Significado |
|-------|-------------|
| `pending` | Pendiente |
| `in-progress` | En proceso |
| `passed` | Aprobado |
| `not-passed` | Desaprobado |

### Nota sobre alumnos y empresas

Un mismo DNI puede existir en `students` más de una vez si pertenece a empresas distintas. La unicidad es la combinación `dni` + `id_companies`.

## Exámenes de alumnos (students_exams)

### Creación al inscribir

Después de crear la inscripción en `students_inscriptions`, se crean registros en `students_exams`:

1. Se buscan todos los `courses_exams` habilitados para ese `id_courses`
2. Por cada uno se crea un registro con:
   - `id_students`: del alumno
   - `id_students_inscriptions`: de la inscripción recién creada
   - `id_courses`: el curso
   - `id_courses_exams`: el examen del curso
   - `exam_type`: copiado del `courses_exams`
   - `exam_index`: copiado del `courses_exams`
   - `exam_version`: el MAX de `exam_version` en `courses_exams_questions` para ese `id_courses_exams`
   - `exam_variant`: se toman los DISTINCT `exam_variant` de `courses_exams_questions` para ese `id_courses_exams` + `exam_version` y se elige uno random
   - `exam_status`: 'pending'
   - `exam_grade`: null
   - `updated_at`: null

### Posibles valores de exam_status

| Valor | Significado |
|-------|-------------|
| `pending` | Pendiente |
| `in-progress` | En proceso |
| `passed` | Aprobado |
| `not-passed` | Desaprobado |

## Respuestas de exámenes (students_exams_answers)

### Creación al inscribir

Después de crear cada registro en `students_exams`, se crean los registros de respuestas:

1. Se buscan todas las preguntas de `courses_exams_questions` para ese `id_courses_exams` + `exam_version` + `exam_variant`
2. Por cada pregunta se crea un registro con:
   - `id_students`: del alumno
   - `id_students_inscriptions`: de la inscripción
   - `id_students_exams`: del examen del alumno recién creado
   - `id_courses_exams`: el examen del curso
   - `id_courses_exams_questions`: la pregunta
   - `ids_selected_options`: null (se completa cuando el alumno responde)
   - `ids_correct_options`: cadena de IDs de opciones correctas separados por coma (de `courses_exams_questions_options` donde `correct_option = 1`)
   - `correct_answer`: null (se calcula cuando el alumno responde)
   - `updated_at`: null

## Vista Pública de Exámenes (/examenes)

### Descripción

Ruta pública (sin auth) donde los alumnos ingresan su DNI para rendir exámenes online. La vista debe ser 100% responsive (mucha gente rinde desde el celular).

### Flujo de ingreso

1. El alumno ingresa su DNI (8 dígitos, sin puntos ni guiones)
2. Se busca el DNI en la tabla `students`:
   - Si no existe ningún registro con ese DNI (o todos tienen `enabled = 0`) → mostrar error "El DNI ingresado no existe"
   - Si existe al menos uno con `enabled = 1` → continuar
3. Para todos los `id_students` encontrados (puede haber más de uno si está en varias empresas), buscar en `students_inscriptions` donde `enabled = 1`
4. Si ninguna inscripción tiene `status != 'passed'` → mostrar mensaje "No tenés exámenes pendientes"
5. Si hay inscripciones pendientes → mostrar los exámenes disponibles

### Reglas importantes

- La ruta `/examenes` es **pública**, no requiere autenticación (no pasa por authMiddleware)
- Un mismo DNI puede tener múltiples registros en `students` (uno por empresa)
- Solo se consideran inscripciones con `enabled = 1`
- Solo se consideran students con `enabled = 1`
- Los exámenes se habilitan progresivamente por `exam_index` (hasta no aprobar index 1 no se puede hacer index 2)

### UI de la vista

#### Pantalla de ingreso (tipo login)
- Estilo similar al login: fondo gris claro, card centrada, logo arriba
- Input para DNI (8 dígitos sin puntos ni guiones)
- Botón "Buscar DNI"
- 100% responsive (mobile-first)

#### Pantalla de exámenes pendientes
- Header con logo de la empresa
- Una **card por cada inscripción** (curso) pendiente del alumno
- Cada card muestra:
  - Nombre de la empresa
  - Nombre del curso
  - Lista de exámenes ordenados por `exam_index` (menor a mayor)
- Cada examen en la lista muestra:
  - Si `exam_status = 'passed'` → tilde verde de aprobado
  - Si `exam_type = 'theorical'` y habilitado → botón "Hacer examen"
  - Si `exam_type = 'theorical'` y NO habilitado (index anterior no aprobado) → botón gris deshabilitado
  - Si `exam_type = 'practical'` → solo muestra estado (tilde verde, cruz roja, "Pendiente", "En proceso"), NO tiene botón
- **Regla de habilitación**: un examen con `exam_index = N` solo se habilita si todos los exámenes con `exam_index < N` tienen `exam_status = 'passed'`

#### Estados visuales de exámenes
| exam_status | exam_type = theorical | exam_type = practical |
|-------------|----------------------|----------------------|
| `passed` | Tilde verde | Tilde verde |
| `not-passed` | Cruz roja + botón reintentar (si habilitado) | Cruz roja |
| `pending` | Botón "Hacer examen" (si habilitado) / gris (si no) | Texto "Pendiente" |
| `in-progress` | Botón "Continuar" (si habilitado) | Texto "En proceso" |

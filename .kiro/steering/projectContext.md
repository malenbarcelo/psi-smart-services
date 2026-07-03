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

## Rendición de Examen (vista de preguntas)

### Flujo

1. El alumno aprieta "Hacer examen" / "Continuar" / "Reintentar" en un examen teórico habilitado
2. Se carga la primera pregunta del examen (o la siguiente sin responder si es in-progress)
3. Se muestra una card con:
   - Pregunta (texto)
   - Imagen (si `courses_exams_questions.image` != null → se busca en `/images/examsImages/`)
   - Opciones con el tipo de input según `courses_exams_questions_types.icon`:
     - `radio_button` → radio buttons (una sola respuesta)
     - `checkbox` → checkboxes (múltiples respuestas)
   - Si el examen es in-progress y la pregunta ya fue respondida, las opciones se pre-seleccionan
4. Botones: "Atrás" (volver a la pregunta anterior) y "Continuar" (guardar y avanzar)
5. En la última pregunta el botón dice "Finalizar"

### Guardado de respuestas

- Al apretar "Continuar":
  1. Validar que al menos una opción esté seleccionada → si no, mostrar error
  2. Guardar en `students_exams_answers` el campo `ids_selected_options` (IDs separados por coma, sin espacios)
  3. Si es la primera vez que guarda una respuesta en este examen → cambiar `students_exams.exam_status` a `'in-progress'`
  4. Avanzar a la siguiente pregunta

- Al apretar "Atrás":
  - Volver a la pregunta anterior, mostrando las opciones previamente seleccionadas
  - Si se modifica la respuesta y se aprieta "Continuar", se actualiza el registro

### Datos que se guardan en `students_exams_answers`

- `ids_selected_options`: cadena de IDs de opciones seleccionadas separados por coma, sin espacios
  - Radio button: un solo ID (ej: "45")
  - Checkbox: múltiples IDs (ej: "45,47,49")

### Responsive

- La vista de preguntas debe ser 100% responsive
- La card de pregunta se adapta al ancho del dispositivo
- Las opciones son fáciles de tocar en mobile (áreas de tap amplias)

## Vista Exámenes Prácticos (/examenes-practicos)

### Descripción

Ruta autenticada (categorías 1, 2 y 4) donde el profesor toma los exámenes prácticos. Los alumnos rinden los teóricos desde `/examenes`, los prácticos los toma el profesor desde esta vista.

### Tabla principal

Muestra `students_inscriptions` que tienen al menos un `students_exams` de tipo `practical` con `exam_status` != `passed` (pending, in-progress, not-passed). Solo `enabled = 1`.

Columnas:
- ID alumno
- Apellido y Nombre
- DNI
- Curso
- Empresa
- Estado del curso (status de students_inscriptions)
- Acciones

### Acciones

1. **Lupa de detalle**: muestra el estado de todos los módulos (students_exams) del curso de esa inscripción
2. **Completar examen**: abre popup grande con:
   - Nombre del curso
   - Nombre del examen práctico
   - Todas las preguntas del práctico con sus opciones (formulario completo, no de a una)
   - Campo "Observaciones" al final (opcional, se guarda en `students_inscriptions_observations`)
   - La lógica de calificación es la misma que los teóricos (correctas/total vs pass_grade)

### Filtros (side panel)

- Apellido y Nombre
- DNI
- Curso
- Empresa

### Tabla students_inscriptions_observations

- `id_students`: del alumno
- `id_students_inscriptions`: de la inscripción
- `id_students_exams`: del examen práctico
- `observations`: texto libre (max 2500 chars), opcional

### Notas

- El professor completa el práctico: misma lógica que teóricos pero todo visible en un solo formulario
- Al finalizar se calcula la nota y se actualiza `students_exams` (exam_status, exam_grade, updated_at)
- Las observaciones se guardan en `students_inscriptions_observations`

## Actualización de students_inscriptions al finalizar un examen

Después de actualizar `students_exams`, se evalúan TODOS los exámenes (teóricos y prácticos) de esa inscripción:

| Condición | status | grade |
|-----------|--------|-------|
| Todos `passed` | `passed` | Promedio de todos los grades |
| Algún `not-passed` (sin importar pending u otros) | `not-passed` | Promedio de los que tienen grade != null |
| Algunos `pending`, resto passed/in-progress, ningún not-passed | `in-progress` | - |
| Todos `pending` | `pending` | - |

En todos los casos se actualiza `updated_at` con la fecha de hoy.

Esta lógica se ejecuta en `composedController.finalizeExam`, que se llama tanto desde `/examenes` (teóricos) como desde `/examenes-practicos`.

### Aclaración importante

El `status` de `students_inscriptions` representa el **estado del curso** para ese alumno, NO el estado de un examen individual. Para calcularlo se miran TODOS los `students_exams` de esa inscripción (teóricos + prácticos juntos). No importa qué tipo de examen se acaba de rendir — siempre se evalúa el conjunto completo para determinar si el alumno aprobó, desaprobó o sigue en proceso en el curso.

## Generación de Certificados y Credenciales

### Cuándo se genera

Cuando `students_inscriptions.status` pasa a `'passed'` (después de finalizar cualquier examen):
- Si `courses.has_certificate = 1` → genera certificado PDF
- Si `courses.has_credential = 1` → genera credencial PDF
- Si `students.photo = null` → NO genera nada (la foto es requisito)

### Templates

Los templates están en:
- `src/views/certificatesTemplates/template1.ejs` (para preview HTML)
- `src/views/credentialsTemplates/template1.ejs` (para preview HTML)

El PDF se genera con PDFKit (programático, sin HTML). Cada curso tiene un `id_templates_certificates` en `templates_certificates` que indica qué template usar.

### Estructura de `templates_certificates`

- `id_courses`: FK al curso
- `id_templates_cetificates`: ID del template a usar (1 → template1, 2 → template2, etc.)
- `certificate_logo`: nombre del archivo en `public/templatesImages/`
- `signature_1`: nombre del archivo en `public/templatesImages/`
- `signature_2`: nombre del archivo (nullable) en `public/templatesImages/`
- `course_name_in_certificate`: nombre del curso como aparece en el certificado
- `certificate_normatives`: texto de normativas

### Datos del certificado (template1)

1. Tipo de examen: teórico-práctico / teórico / práctico (según `has_theorical` + `has_practical`)
2. Fecha de hoy (dd/mm/yyyy)
3. Código: xxxx-xxxxxxxxxx (por ahora placeholder)
4. Logo empresa: `public/images/companyLogo.png`
5. Nombre alumno: LAST_NAME + ' ' + FIRST_NAME (mayúsculas)
6. DNI: student.dni
7. Nombre curso en certificado: `template.course_name_in_certificate`
8. Vigente hasta: fecha hoy + courses.validity_months
9. Normativas: `template.certificate_normatives`
10. Firma 1: `template.signature_1`
11. Firma 2: `template.signature_2` (si != null)
12. Logo certificado: `template.certificate_logo`

### Carpetas

- `public/templatesImages/` — imágenes de templates (firmas, logos)
- `public/certificatesAndCredentials/` — PDFs generados
- Nombre archivo: `CE {id_students_inscriptions} - {course_name} - {last_name} {first_name} (DNI {dni}).pdf`

### Notas técnicas

- Se usa PDFKit para generar PDFs (liviano, sin browser headless)
- Los previews HTML (para módulo futuro de selección de template) se harán con EJS
- `pdfkit` ya está instalado en el proyecto

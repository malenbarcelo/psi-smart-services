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

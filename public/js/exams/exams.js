// exams module - public exam entry point

const examsDni = document.getElementById('examsDni')
const examsDniError = document.getElementById('examsDniError')
const examSearchBtn = document.getElementById('examSearchBtn')
const examsLoginScreen = document.getElementById('examsLoginScreen')
const examsListScreen = document.getElementById('examsListScreen')
const examsNoExamsScreen = document.getElementById('examsNoExamsScreen')
const examsStudentName = document.getElementById('examsStudentName')
const examsStudentInitials = document.getElementById('examsStudentInitials')
const examsListContainer = document.getElementById('examsListContainer')
const examsBackBtn = document.getElementById('examsBackBtn')

function showError(msg) {
  examsDniError.textContent = msg
  examsDniError.style.display = 'block'
}

function hideError() {
  examsDniError.style.display = 'none'
}

function showScreen(screen) {
  examsLoginScreen.style.display = 'none'
  examsListScreen.style.display = 'none'
  examsNoExamsScreen.style.display = 'none'

  if (screen === examsListScreen) {
    screen.style.display = 'block'
  } else {
    screen.style.display = 'flex'
  }
}

// check if exam is enabled (all previous indexes must be passed)
function isExamEnabled(exams, currentIndex) {
  for (const exam of exams) {
    if (exam.exam_index < currentIndex && exam.exam_status !== 'passed') {
      return false
    }
  }
  return true
}

// render exam status/action for a single exam item
function renderExamAction(exam, enabled) {
  if (exam.exam_status === 'passed') {
    return '<span class="exam-status-badge exam-status-badge-passed"><i class="fa-solid fa-circle-check"></i> Aprobado</span>'
  }

  if (exam.exam_type === 'practical') {
    if (exam.exam_status === 'not-passed') {
      return '<span class="exam-status-badge exam-status-badge-failed"><i class="fa-solid fa-circle-xmark"></i> Desaprobado</span>'
    }
    if (exam.exam_status === 'in-progress') {
      return '<span class="exam-status-badge exam-status-badge-progress"><i class="fa-solid fa-clock"></i> En proceso</span>'
    }
    return '<span class="exam-status-badge exam-status-badge-pending"><i class="fa-solid fa-hourglass-half"></i> Pendiente</span>'
  }

  // theorical
  if (exam.exam_status === 'not-passed') {
    if (enabled) {
      return `<span class="exam-status-badge exam-status-badge-failed"><i class="fa-solid fa-circle-xmark"></i> Desaprobado</span>
              <button class="exam-action-btn exam-action-btn-active" data-exam-id="${exam.id}">Reintentar</button>`
    }
    return '<span class="exam-status-badge exam-status-badge-failed"><i class="fa-solid fa-circle-xmark"></i> Desaprobado</span>'
  }

  if (exam.exam_status === 'in-progress') {
    if (enabled) {
      return `<span class="exam-status-badge exam-status-badge-progress"><i class="fa-solid fa-clock"></i> En proceso</span>
              <button class="exam-action-btn exam-action-btn-active" data-exam-id="${exam.id}">Continuar</button>`
    }
    return '<span class="exam-status-badge exam-status-badge-progress"><i class="fa-solid fa-clock"></i> En proceso</span>'
  }

  // pending
  if (enabled) {
    return `<span class="exam-status-badge exam-status-badge-pending"><i class="fa-solid fa-hourglass-half"></i> Pendiente</span>
            <button class="exam-action-btn exam-action-btn-active" data-exam-id="${exam.id}">Hacer examen</button>`
  }
  return `<span class="exam-status-badge exam-status-badge-pending"><i class="fa-solid fa-hourglass-half"></i> Pendiente</span>
          <button class="exam-action-btn exam-action-btn-disabled" disabled>Hacer examen</button>`
}

function renderInscriptions(data) {
  examsStudentName.textContent = data.studentName

  // build initials from "Apellido, Nombre" format
  const parts = data.studentName.split(',').map(p => p.trim())
  const initials = parts.map(p => p.charAt(0).toUpperCase()).join('')
  examsStudentInitials.textContent = initials

  examsListContainer.innerHTML = ''

  for (const inscription of data.inscriptions) {
    const card = document.createElement('div')
    card.className = 'exam-course-card'

    let examsHtml = ''
    for (const exam of inscription.exams) {
      const enabled = isExamEnabled(inscription.exams, exam.exam_index)
      const actionHtml = renderExamAction(exam, enabled)

      examsHtml += `
        <div class="exam-item">
          <div class="exam-item-left">
            <div class="exam-item-index">${exam.exam_index}</div>
            <div>
              <div class="exam-item-name">${exam.exam_name}</div>
            </div>
          </div>
          <div class="exam-item-right">
            ${actionHtml}
          </div>
        </div>
      `
    }

    card.innerHTML = `
      <div class="exam-course-card-header">
        <h4 class="exam-course-card-name">${inscription.course_name}</h4>
        <p class="exam-course-card-company">${inscription.company_name}</p>
      </div>
      <div class="exam-course-card-body">
        ${examsHtml}
      </div>
    `

    examsListContainer.appendChild(card)
  }
}

async function searchByDni() {
  hideError()
  const dni = examsDni.value.trim()

  if (!dni) {
    showError('Ingresá tu DNI')
    return
  }

  if (!/^\d{8}$/.test(dni)) {
    showError('El DNI debe tener 8 dígitos numéricos')
    return
  }

  try {
    const res = await fetch(`/api/exams/search-dni/${dni}`)

    if (res.status === 404) {
      showError('El DNI ingresado no existe')
      return
    }

    if (!res.ok) {
      showError('Error al buscar. Intentá nuevamente.')
      return
    }

    const data = await res.json()

    if (data.code === 'NO_PENDING') {
      showScreen(examsNoExamsScreen)
      return
    }

    if (data.code === 'HAS_PENDING') {
      renderInscriptions(data)
      showScreen(examsListScreen)
    }
  } catch (error) {
    console.log(error)
    showError('Error de conexión. Intentá nuevamente.')
  }
}

// event listeners
examSearchBtn.addEventListener('click', searchByDni)

examsDni.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchByDni()
})

examsBackBtn.addEventListener('click', () => {
  showScreen(examsLoginScreen)
  examsDni.value = ''
  hideError()
})

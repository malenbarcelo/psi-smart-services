// exams module - public exam entry point

const examsDni = document.getElementById('examsDni')
const examsDniError = document.getElementById('examsDniError')
const examSearchBtn = document.getElementById('examSearchBtn')
const examsLoginScreen = document.getElementById('examsLoginScreen')
const examsWelcomeScreen = document.getElementById('examsWelcomeScreen')
const examsListScreen = document.getElementById('examsListScreen')
const examsNoExamsScreen = document.getElementById('examsNoExamsScreen')
const examsQuestionScreen = document.getElementById('examsQuestionScreen')
const examsResultScreen = document.getElementById('examsResultScreen')
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
  examsWelcomeScreen.style.display = 'none'
  examsListScreen.style.display = 'none'
  examsNoExamsScreen.style.display = 'none'
  examsQuestionScreen.style.display = 'none'
  examsResultScreen.style.display = 'none'

  if (screen === examsListScreen || screen === examsQuestionScreen) {
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

// get status icon HTML
function getStatusIcon(status) {
  switch (status) {
    case 'passed': return '<i class="fa-solid fa-circle-check exam-icon-passed"></i>'
    case 'not-passed': return '<i class="fa-solid fa-circle-xmark exam-icon-failed"></i>'
    case 'in-progress': return '<i class="fa-solid fa-spinner exam-icon-progress"></i>'
    default: return '<i class="fa-regular fa-clock exam-icon-pending"></i>'
  }
}

// get CSS class for exam item based on status
function getExamItemClass(status) {
  switch (status) {
    case 'passed': return 'exam-item-passed'
    case 'not-passed': return 'exam-item-failed'
    case 'in-progress': return 'exam-item-progress'
    default: return 'exam-item-pending'
  }
}

// render exam status/action for a single exam item
function renderExamAction(exam, enabled) {
  if (exam.exam_status === 'passed') {
    return '<span class="exam-status-badge exam-status-badge-passed"><i class="fa-solid fa-check"></i> Aprobado</span>'
  }

  if (exam.exam_type === 'practical') {
    if (exam.exam_status === 'not-passed') {
      return '<span class="exam-status-badge exam-status-badge-failed">Desaprobado</span>'
    }
    if (exam.exam_status === 'in-progress') {
      return '<span class="exam-status-badge exam-status-badge-progress">En proceso</span>'
    }
    return '<span class="exam-status-badge exam-status-badge-pending">Pendiente</span>'
  }

  // theorical
  if (exam.exam_status === 'not-passed') {
    if (enabled) {
      return `<button class="exam-action-btn exam-action-btn-active" data-exam-id="${exam.id}">Reintentar</button>`
    }
    return '<span class="exam-status-badge exam-status-badge-failed">Desaprobado</span>'
  }

  if (exam.exam_status === 'in-progress') {
    if (enabled) {
      return `<button class="exam-action-btn exam-action-btn-active" data-exam-id="${exam.id}">Continuar</button>`
    }
    return '<span class="exam-status-badge exam-status-badge-progress">En proceso</span>'
  }

  // pending
  if (enabled) {
    return `<button class="exam-action-btn exam-action-btn-active" data-exam-id="${exam.id}">Hacer examen</button>`
  }
  return '<button class="exam-action-btn exam-action-btn-disabled" disabled>Hacer examen</button>'
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
      const statusClass = getExamItemClass(exam.exam_status)

      examsHtml += `
        <div class="exam-item ${statusClass}">
          <div class="exam-item-left">
            <div class="exam-item-index">${exam.exam_index}</div>
            ${getStatusIcon(exam.exam_status)}
            <div class="exam-item-name">${exam.exam_name}</div>
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

    currentDni = dni
    const data = await res.json()

    if (data.code === 'NO_PENDING') {
      currentStudentName = data.studentName
      showScreen(examsNoExamsScreen)
      return
    }

    if (data.code === 'HAS_PENDING') {
      currentStudentName = data.studentName
      currentSearchData = data
      showWelcomeScreen(data)
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


// ===== EXAM QUESTION SCREEN =====
const examProgress = document.getElementById('examProgress')
const examCourseName = document.getElementById('examCourseName')
const examExamName = document.getElementById('examExamName')
const examStudentName = document.getElementById('examStudentName')
const examStudentInitials = document.getElementById('examStudentInitials')
const examQuestionText = document.getElementById('examQuestionText')
const examQuestionImage = document.getElementById('examQuestionImage')
const examQuestionImg = document.getElementById('examQuestionImg')
const examQuestionOptions = document.getElementById('examQuestionOptions')
const examOptionError = document.getElementById('examOptionError')
const examPrevBtn = document.getElementById('examPrevBtn')
const examNextBtn = document.getElementById('examNextBtn')

let currentExamData = null
let currentQuestionIndex = 0
let currentStudentName = ''
let currentSearchData = null
let currentDni = ''

// ===== WELCOME / PHOTO SCREEN =====
const welcomePhoto = document.getElementById('welcomePhoto')
const welcomePhotoPlaceholder = document.getElementById('welcomePhotoPlaceholder')
const welcomeTitle = document.getElementById('welcomeTitle')
const welcomeSubtitle = document.getElementById('welcomeSubtitle')
const welcomeUploadSection = document.getElementById('welcomeUploadSection')
const welcomeContinueBtn = document.getElementById('welcomeContinueBtn')
const photoInput = document.getElementById('photoInput')
const photoError = document.getElementById('photoError')
const uploadBtnText = document.getElementById('uploadBtnText')

function showWelcomeScreen(data) {
  const nameParts = data.studentName.split(',').map(p => p.trim())
  const displayName = nameParts.length > 1 ? `${nameParts[1]} ${nameParts[0]}` : data.studentName
  welcomeTitle.textContent = `¡Bienvenido/a ${displayName}!`

  // reset to placeholder state first
  welcomePhoto.style.display = 'none'
  welcomePhotoPlaceholder.style.display = 'flex'
  welcomeSubtitle.textContent = 'Subí una foto para continuar'
  uploadBtnText.textContent = 'Subir foto'
  welcomeContinueBtn.disabled = true
  photoError.style.display = 'none'

  if (data.studentPhoto) {
    // try to load the photo, if it fails treat as no photo
    const img = new Image()
    img.onload = () => {
      welcomePhoto.src = img.src
      welcomePhoto.style.display = 'block'
      welcomePhotoPlaceholder.style.display = 'none'
      welcomeSubtitle.textContent = ''
      uploadBtnText.textContent = 'Cambiar foto'
      welcomeContinueBtn.disabled = false
    }
    img.onerror = () => {
      // photo file not found, treat as no photo
      welcomePhoto.style.display = 'none'
      welcomePhotoPlaceholder.style.display = 'flex'
      welcomeSubtitle.textContent = 'Subí una foto para continuar'
      uploadBtnText.textContent = 'Subir foto'
      welcomeContinueBtn.disabled = true
    }
    img.src = `/studentsPhotos/${data.studentPhoto}`
  }

  showScreen(examsWelcomeScreen)
}

// handle photo upload
photoInput.addEventListener('change', async() => {
  const file = photoInput.files[0]
  if (!file) return

  // validate type
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    photoError.textContent = 'Solo se permiten imágenes JPG y PNG'
    photoError.style.display = 'block'
    return
  }

  photoError.style.display = 'none'

  const formData = new FormData()
  formData.append('photo', file)
  formData.append('dni', currentDni)

  try {
    const res = await fetch('/api/students/upload-photo', {
      method: 'POST',
      body: formData
    })

    const result = await res.json()
    if (!res.ok) {
      photoError.textContent = result.error || 'Error al subir la foto'
      photoError.style.display = 'block'
      return
    }

    // show uploaded photo
    welcomePhoto.src = `/studentsPhotos/${result.photo}?t=${Date.now()}`
    welcomePhoto.style.display = 'block'
    welcomePhotoPlaceholder.style.display = 'none'
    uploadBtnText.textContent = 'Cambiar foto'
    welcomeSubtitle.textContent = ''
    welcomeContinueBtn.disabled = false
  } catch (error) {
    console.log(error)
    photoError.textContent = 'Error de conexión'
    photoError.style.display = 'block'
  }
})

// continue from welcome to exam list
welcomeContinueBtn.addEventListener('click', () => {
  if (welcomeContinueBtn.disabled) return
  renderInscriptions(currentSearchData)
  showScreen(examsListScreen)
})

// start exam
async function startExam(studentExamId) {
  try {
    const res = await fetch(`/api/exams/${studentExamId}/questions`)
    if (!res.ok) return

    currentExamData = await res.json()
    currentQuestionIndex = 0

    // set student name in question screen header
    examStudentName.textContent = currentStudentName
    const parts = currentStudentName.split(',').map(p => p.trim())
    examStudentInitials.textContent = parts.map(p => p.charAt(0).toUpperCase()).join('')

    // if in-progress, find the first unanswered question
    if (currentExamData.examStatus === 'in-progress') {
      const firstUnanswered = currentExamData.questions.findIndex(q => !q.idsSelectedOptions)
      if (firstUnanswered > 0) {
        currentQuestionIndex = firstUnanswered
      }
    }

    renderQuestion()
    showScreen(examsQuestionScreen)
  } catch (error) {
    console.log(error)
  }
}

function renderQuestion() {
  const q = currentExamData.questions[currentQuestionIndex]
  const total = currentExamData.totalQuestions

  // header info
  examCourseName.textContent = currentExamData.courseName
  examExamName.textContent = `${currentExamData.examName} - Versión ${currentExamData.examVersion} - Tema ${currentExamData.examVariant}`

  // progress
  examProgress.textContent = `Pregunta ${currentQuestionIndex + 1} de ${total}`

  // question text with question_number prefix
  examQuestionText.textContent = `${q.questionNumber}. ${q.question}`

  // image
  if (q.image) {
    examQuestionImg.src = `/images/examsImages/${q.image}`
    examQuestionImage.style.display = 'block'
  } else {
    examQuestionImage.style.display = 'none'
  }

  // options
  const inputType = q.inputType === 'checkbox' ? 'checkbox' : 'radio'
  const selectedIds = q.idsSelectedOptions ? q.idsSelectedOptions.split(',') : []

  let optionsHtml = ''
  for (const opt of q.options) {
    const isChecked = selectedIds.includes(String(opt.id)) ? 'checked' : ''
    const selectedClass = isChecked ? 'selected' : ''
    optionsHtml += `
      <label class="exam-option-item ${selectedClass}" data-option-id="${opt.id}">
        <input type="${inputType}" name="exam-option" value="${opt.id}" ${isChecked}>
        <span class="exam-option-text">${opt.optionReference}. ${opt.optionText}</span>
      </label>
    `
  }
  examQuestionOptions.innerHTML = optionsHtml

  // add click listeners for visual selection
  const optionItems = examQuestionOptions.querySelectorAll('.exam-option-item')
  optionItems.forEach(item => {
    item.addEventListener('click', () => {
      if (inputType === 'radio') {
        optionItems.forEach(i => i.classList.remove('selected'))
        item.classList.add('selected')
        item.querySelector('input').checked = true
      } else {
        const input = item.querySelector('input')
        input.checked = !input.checked
        item.classList.toggle('selected', input.checked)
      }
      hideOptionError()
    })
  })

  // buttons
  examPrevBtn.style.visibility = 'visible'
  examNextBtn.innerHTML = currentQuestionIndex === total - 1
    ? 'Finalizar <i class="fa-solid fa-flag-checkered"></i>'
    : 'Continuar <i class="fa-solid fa-chevron-right"></i>'

  // hide error
  hideOptionError()
}

function hideOptionError() {
  examOptionError.style.display = 'none'
}

function getSelectedOptions() {
  const checked = examQuestionOptions.querySelectorAll('input:checked')
  return Array.from(checked).map(input => input.value)
}

async function saveAndNext() {
  const selected = getSelectedOptions()

  if (selected.length === 0) {
    examOptionError.textContent = 'Seleccioná al menos una opción'
    examOptionError.style.display = 'block'
    return
  }

  const q = currentExamData.questions[currentQuestionIndex]
  const idsSelectedOptions = selected.join(',')

  try {
    // save answer
    await fetch(`/api/exams/answers/${q.answerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids_selected_options: idsSelectedOptions })
    })

    // update local data
    q.idsSelectedOptions = idsSelectedOptions

    // set exam to in-progress if first answer
    if (currentExamData.examStatus === 'pending') {
      await fetch(`/api/exams/${currentExamData.studentExamId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in-progress' })
      })
      // also set inscription to in-progress
      await fetch(`/api/inscriptions/${currentExamData.studentInscriptionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in-progress' })
      })
      currentExamData.examStatus = 'in-progress'
    }

    // advance or finalize
    if (currentQuestionIndex < currentExamData.totalQuestions - 1) {
      currentQuestionIndex++
      renderQuestion()
    } else {
      // finalize exam
      const finalRes = await fetch(`/api/exams/${currentExamData.studentExamId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const result = await finalRes.json()
      showExamResult(result)
    }
  } catch (error) {
    console.log(error)
  }
}

function goToPrev() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--
    renderQuestion()
  } else {
    // first question: go back to exam list
    showScreen(examsListScreen)
  }
}

// event listeners for question screen
examNextBtn.addEventListener('click', saveAndNext)
examPrevBtn.addEventListener('click', goToPrev)

// delegate click on exam action buttons (from list screen)
examsListContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.exam-action-btn-active')
  if (!btn) return
  const examId = btn.dataset.examId
  if (examId) startExam(examId)
})


// ===== EXAM RESULT SCREEN =====
const examResultIcon = document.getElementById('examResultIcon')
const examResultTitle = document.getElementById('examResultTitle')
const examResultScore = document.getElementById('examResultScore')
const examResultBackBtn = document.getElementById('examResultBackBtn')

function showExamResult(result) {
  if (result.passed) {
    examResultIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>'
    examResultIcon.className = 'exam-result-icon exam-result-icon-passed'
    examResultTitle.textContent = '¡Felicitaciones, aprobaste el examen!'
  } else {
    examResultIcon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>'
    examResultIcon.className = 'exam-result-icon exam-result-icon-failed'
    examResultTitle.textContent = 'Lo sentimos, no has aprobado el examen'
  }

  examResultScore.textContent = `Preguntas correctas: ${result.correctAnswers} de ${result.totalAnswers}`
  showScreen(examsResultScreen)
}

examResultBackBtn.addEventListener('click', () => {
  // reload exam list for this student
  searchByDni()
})

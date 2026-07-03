// practicalExams module - popup logic (detail + practical exam)
import { gu } from '../globalUtils.js'
import { elements } from './globals.js'
import { resetAndLoad } from './table.js'

// open detail popup - show all exam modules for this inscription
async function openDetailPopup(inscriptionId, courseName, studentName, dni) {
  try {
    elements.detailPopupTitle.textContent = courseName
    elements.detailPopupBody.querySelector?.('#detailPopupSubtitle')
    document.getElementById('detailPopupSubtitle').textContent = `${studentName} - DNI: ${dni}`

    // get all exams for this inscription
    const res = await fetch(`/api/exams/inscription/${inscriptionId}`)
    const exams = await res.json()

    let html = '<div class="detail-exams-list">'
    exams.forEach(exam => {
      const statusMap = {
        'pending': { badge: '<span class="badge badge-neutral">Pendiente</span>', borderClass: 'detail-exam-pending' },
        'in-progress': { badge: '<span class="badge badge-warning">En proceso</span>', borderClass: 'detail-exam-progress' },
        'passed': { badge: '<span class="badge badge-active">Aprobado</span>', borderClass: 'detail-exam-passed' },
        'not-passed': { badge: '<span class="badge badge-danger">Desaprobado</span>', borderClass: 'detail-exam-failed' }
      }
      const status = statusMap[exam.exam_status] || { badge: '', borderClass: '' }
      const gradeText = exam.exam_grade != null ? `${Math.round(exam.exam_grade * 100)}%` : ''
      html += `
        <div class="detail-exam-item ${status.borderClass}">
          <span class="detail-exam-index">${exam.exam_index}</span>
          <span class="detail-exam-name">${exam.exam_name || exam.exam_type}</span>
          ${status.badge}
          <span class="detail-exam-grade">${gradeText}</span>
        </div>
      `
    })
    html += '</div>'

    elements.detailPopupBody.innerHTML = html
    elements.detailPopup.style.display = 'block'
    elements.detailPopup.querySelector('.popup-card').scrollTop = 0
  } catch (error) {
    console.log(error)
  }
}

// open practical exam popup - show all questions at once
async function openPracticalExamPopup(studentExamId, studentName, dni) {
  try {
    const res = await fetch(`/api/exams/${studentExamId}/questions`)
    if (!res.ok) return
    const data = await res.json()

    elements.practicalExamPopupTitle.textContent = data.examName
    elements.practicalExamPopupSubtitle.textContent = `${studentName} - DNI: ${dni}`

    let html = ''
    data.questions.forEach((q, i) => {
      const inputType = q.inputType === 'checkbox' ? 'checkbox' : 'radio'
      const selectedIds = q.idsSelectedOptions ? q.idsSelectedOptions.split(',') : []

      html += `
        <div class="practical-question" data-answer-id="${q.answerId}">
          <p class="practical-question-text">${q.questionNumber}. ${q.question}</p>
          ${q.image ? `<div class="practical-question-image"><img src="/images/examsImages/${q.image}" alt=""></div>` : ''}
          <div class="practical-question-options">
      `

      q.options.forEach(opt => {
        const checked = selectedIds.includes(String(opt.id)) ? 'checked' : ''
        html += `
          <label class="practical-option-item">
            <input type="${inputType}" name="question-${q.answerId}" value="${opt.id}" ${checked}>
            <span>${opt.optionReference}. ${opt.optionText}</span>
          </label>
        `
      })

      html += `
          </div>
          <span class="exams-error practical-question-error" data-error-for="${q.answerId}"></span>
        </div>
      `
    })

    // observations field
    html += `
      <div class="practical-observations">
        <label class="input-label">Observaciones (opcional)</label>
        <textarea class="input-field" id="practicalObservations" rows="3" placeholder="Observaciones del profesor...">${data.observations || ''}</textarea>
      </div>
    `

    elements.practicalExamPopupBody.innerHTML = html
    elements.practicalExamPopup.style.display = 'block'
    elements.practicalExamPopup.querySelector('.popup-card').scrollTop = 0
    elements.practicalExamPopup.dataset.studentExamId = studentExamId
    elements.practicalExamPopup.dataset.studentInscriptionId = data.studentInscriptionId
    elements.practicalExamPopup.dataset.studentId = data.questions[0] ? '' : ''

    // store data for finalization
    elements.practicalExamPopup.dataset.examData = JSON.stringify(data)
  } catch (error) {
    console.log(error)
  }
}

// collect answers from the form
function collectAnswers() {
  const questions = elements.practicalExamPopupBody.querySelectorAll('.practical-question')
  const answers = []
  let hasErrors = false

  questions.forEach(q => {
    const answerId = q.dataset.answerId
    const checked = q.querySelectorAll('input:checked')
    const errorEl = elements.practicalExamPopupBody.querySelector(`[data-error-for="${answerId}"]`)

    if (checked.length === 0) {
      errorEl.textContent = 'Seleccioná al menos una opción'
      errorEl.style.display = 'block'
      hasErrors = true
    } else {
      errorEl.style.display = 'none'
      answers.push({
        answerId,
        idsSelectedOptions: Array.from(checked).map(input => input.value).join(',')
      })
    }
  })

  return { answers, hasErrors }
}

// actually save and finalize the exam
async function doSaveExam() {
  const { answers } = collectAnswers()
  const studentExamId = elements.practicalExamPopup.dataset.studentExamId
  const data = JSON.parse(elements.practicalExamPopup.dataset.examData)

  try {
    // save each answer
    for (const a of answers) {
      await fetch(`/api/exams/answers/${a.answerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids_selected_options: a.idsSelectedOptions })
      })
    }

    // finalize exam
    await fetch(`/api/exams/${studentExamId}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    // save observations if provided
    const observations = document.getElementById('practicalObservations').value.trim()
    if (observations) {
      await fetch('/api/inscriptions/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_students_inscriptions: data.studentInscriptionId,
          id_students_exams: parseInt(studentExamId),
          observations
        })
      })
    }

    elements.confirmPopup.style.display = 'none'
    elements.practicalExamPopup.style.display = 'none'
    elements.resultPopupText.innerText = 'Examen guardado con éxito'
    gu.showResultPopup(elements.resultPopup)
    resetAndLoad()
  } catch (error) {
    console.log(error)
  }
}

// save practical exam - preview first, confirm if failed
async function savePracticalExam() {
  const { answers, hasErrors } = collectAnswers()
  if (hasErrors) return

  const studentExamId = elements.practicalExamPopup.dataset.studentExamId

  try {
    // preview without saving
    const previewRes = await fetch(`/api/exams/${studentExamId}/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    })
    const preview = await previewRes.json()

    if (preview.passed) {
      // approved - save directly
      await doSaveExam()
    } else {
      // failed - show confirm popup
      elements.confirmPopupTitle.textContent = 'Examen desaprobado'
      elements.confirmPopupMessage.textContent = `El examen fue desaprobado con ${preview.correctAnswers} de ${preview.totalAnswers} preguntas correctas. ¿Desea guardar?`
      elements.confirmPopup.style.display = 'block'
      elements.confirmPopupAccept.onclick = () => doSaveExam()
    }
  } catch (error) {
    console.log(error)
  }
}

export function initForms() {
  // delegate table action clicks
  elements.practicalExamsTableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-icon')
    if (!btn) return

    if (btn.classList.contains('btn-icon-detail')) {
      openDetailPopup(btn.dataset.id, btn.dataset.course, btn.dataset.student, btn.dataset.dni)
    }

    if (btn.classList.contains('btn-icon-edit')) {
      openPracticalExamPopup(btn.dataset.examId, btn.dataset.student, btn.dataset.dni)
    }
  })

  // save practical exam
  elements.practicalExamPopupSave.addEventListener('click', savePracticalExam)
}

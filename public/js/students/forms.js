// students module - forms, popups, and table actions
import { gu } from '../globalUtils.js'
import { elements, formInputs, popupFormInputs } from './globals.js'
import { resetAndLoadStudents } from './table.js'

const { firstName, lastName, email, dni, studentCompany } = formInputs

// open create student popup
function openCreatePopup() {
  gu.clearInputs(popupFormInputs)
  gu.isValid(popupFormInputs)
  elements.studentPopupTitle.innerText = 'Nuevo Alumno'
  elements.studentPopup.dataset.mode = 'create'
  elements.studentPopup.style.display = 'block'
}

// save student (create or edit)
async function saveStudent() {
  // validate required fields
  let hasError = false
  const requiredInputs = studentCompany
    ? [firstName, lastName, email, dni, studentCompany]
    : [firstName, lastName, email, dni]

  requiredInputs.forEach(input => {
    if (!input.value.trim()) {
      gu.isInvalid([input], 'Campo requerido')
      hasError = true
    }
  })

  // validate email format
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    gu.isInvalid([email], 'Ingrese un email válido')
    hasError = true
  }

  if (hasError) return

  const body = {
    first_name: firstName.value.trim(),
    last_name: lastName.value.trim(),
    email: email.value.trim(),
    dni: dni.value.trim(),
    id_companies: studentCompany ? studentCompany.value : null
  }

  try {
    const mode = elements.studentPopup.dataset.mode
    let url = '/api/students'
    let method = 'POST'

    if (mode === 'edit') {
      url = '/api/students/' + elements.studentPopup.dataset.studentId
      method = 'PUT'
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      if (data.field === 'dni') {
        gu.isInvalid([dni], 'Este DNI ya está registrado')
      }
      return
    }

    elements.studentPopup.style.display = 'none'
    elements.resultPopupText.innerText = mode === 'create' ? 'Alumno creado con éxito' : 'Alumno editado con éxito'
    gu.showResultPopup(elements.resultPopup)
    resetAndLoadStudents()
  } catch(error) {
    console.log(error)
  }
}

// table action handlers (delegated)
function handleTableActions(e) {
  const btn = e.target.closest('.btn-icon')
  if (!btn) return

  const studentId = btn.dataset.id

  if (btn.classList.contains('btn-icon-edit')) {
    editStudent(studentId)
  }

  if (btn.classList.contains('btn-icon-delete')) {
    toggleStudent(studentId, 'disable')
  }

  if (btn.classList.contains('btn-icon-enable')) {
    toggleStudent(studentId, 'enable')
  }
}

// edit student
async function editStudent(studentId) {
  try {
    const response = await fetch('/api/students/' + studentId)
    const student = await response.json()
    gu.clearInputs(popupFormInputs)
    gu.isValid(popupFormInputs)
    elements.studentPopupTitle.innerText = 'Editar Alumno'
    elements.studentPopup.dataset.mode = 'edit'
    elements.studentPopup.dataset.studentId = studentId
    firstName.value = student.first_name
    lastName.value = student.last_name
    email.value = student.email
    dni.value = student.dni
    if (studentCompany) studentCompany.value = student.id_companies
    elements.studentPopup.style.display = 'block'
  } catch(error) {
    console.log(error)
  }
}

// toggle student enabled/disabled
function toggleStudent(studentId, action) {
  const confirmPopupTitle = document.getElementById('confirmPopupTitle')
  const confirmPopupMessage = document.getElementById('confirmPopupMessage')

  if (action === 'disable') {
    confirmPopupTitle.innerText = 'Deshabilitar Alumno'
    confirmPopupMessage.innerText = '¿Está seguro que desea deshabilitar este alumno?'
  } else {
    confirmPopupTitle.innerText = 'Habilitar Alumno'
    confirmPopupMessage.innerText = '¿Está seguro que desea habilitar este alumno?'
  }

  elements.confirmPopup.dataset.studentId = studentId
  elements.confirmPopup.style.display = 'block'
}

// confirm popup accept handler
function handleConfirmAccept() {
  const studentId = elements.confirmPopup.dataset.studentId
  fetch('/api/students/' + studentId + '/toggle-enabled', { method: 'PUT' })
    .then(response => {
      if (response.ok) {
        elements.confirmPopup.style.display = 'none'
        resetAndLoadStudents()
      }
    })
    .catch(error => console.log(error))
}

// load company options
async function loadCompanyOptions() {
  if (!studentCompany) return
  try {
    const response = await fetch('/api/users-companies')
    const companies = await response.json()
    studentCompany.innerHTML = '<option value="">Seleccionar</option>'
    companies.forEach(comp => {
      const option = document.createElement('option')
      option.value = comp.id
      option.textContent = comp.company_name
      studentCompany.appendChild(option)
    })
  } catch(error) {
    console.log(error)
  }
}

// initialize forms event listeners
export function initForms() {
  elements.createStudentBtn.addEventListener('click', openCreatePopup)
  elements.studentPopupSave.addEventListener('click', saveStudent)
  elements.studentsTableBody.addEventListener('click', handleTableActions)
  elements.confirmPopupAccept.addEventListener('click', handleConfirmAccept)

  // clear validation on input
  popupFormInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        gu.isValid([input])
      })
    }
  })

  // load options
  loadCompanyOptions()
}

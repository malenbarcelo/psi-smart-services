// results module - inscription popup logic
import { gu } from '../globalUtils.js'
import { elements } from './globals.js'
import { resetAndLoadResults } from './table.js'

const inscriptionCompany = document.getElementById('inscriptionCompany')
const inscriptionCourse = document.getElementById('inscriptionCourse')
const inscriptionEvent = document.getElementById('inscriptionEvent')
const inscriptionDni = document.getElementById('inscriptionDni')
const inscriptionFirstName = document.getElementById('inscriptionFirstName')
const inscriptionLastName = document.getElementById('inscriptionLastName')
const inscriptionEmail = document.getElementById('inscriptionEmail')

const popupFormInputs = [inscriptionCompany, inscriptionCourse, inscriptionDni, inscriptionFirstName, inscriptionLastName, inscriptionEmail]

function openInscriptionPopup() {
  gu.clearInputs(popupFormInputs)
  gu.isValid(popupFormInputs)
  elements.inscriptionPopup.style.display = 'block'
}

// search student by DNI + company and autofill fields
async function searchStudentByDni() {
  const dni = inscriptionDni.value.trim()
  const companyId = inscriptionCompany.value

  if (!dni || !companyId) return

  try {
    const res = await fetch(`/api/students?dni=${dni}&id_companies=${companyId}`)
    const data = await res.json()

    if (data.rows && data.rows.length > 0) {
      const student = data.rows[0]
      inscriptionFirstName.value = student.first_name || ''
      inscriptionLastName.value = student.last_name || ''
      inscriptionEmail.value = student.email || ''
    } else {
      inscriptionFirstName.value = ''
      inscriptionLastName.value = ''
      inscriptionEmail.value = ''
    }
  } catch (error) {
    console.log(error)
  }
}

// save inscription
async function saveInscription() {
  gu.isValid(popupFormInputs)
  let hasErrors = false

  const emptyInputs = popupFormInputs.filter(input => !input.value.trim())
  if (emptyInputs.length > 0) {
    gu.isInvalid(emptyInputs, 'Campo requerido')
    hasErrors = true
  }

  // validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (inscriptionEmail.value.trim() && !emailRegex.test(inscriptionEmail.value.trim())) {
    gu.isInvalid([inscriptionEmail], 'Ingrese un email válido')
    hasErrors = true
  }

  // validate DNI: 8 digits, numeric only
  const dniValue = inscriptionDni.value.trim()
  if (dniValue && !/^\d{8}$/.test(dniValue)) {
    gu.isInvalid([inscriptionDni], 'Debe tener 8 dígitos numéricos')
    hasErrors = true
  }

  if (hasErrors) return

  try {
    const body = {
      id_companies: inscriptionCompany.value,
      id_courses: inscriptionCourse.value,
      dni: inscriptionDni.value.trim(),
      first_name: inscriptionFirstName.value.trim(),
      last_name: inscriptionLastName.value.trim(),
      email: inscriptionEmail.value.trim()
    }

    const response = await fetch('/api/inscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const data = await response.json()
      console.log(data.error)
      return
    }

    elements.inscriptionPopup.style.display = 'none'
    elements.resultPopupText.innerText = 'Inscripción creada con éxito'
    gu.showResultPopup(elements.resultPopup)
    resetAndLoadResults()
  } catch (error) {
    console.log(error)
  }
}

// load companies and courses into selects
async function loadPopupOptions() {
  try {
    const [companiesRes, coursesRes] = await Promise.all([
      fetch('/api/users-companies'),
      fetch('/api/courses')
    ])

    const companies = await companiesRes.json()
    const coursesData = await coursesRes.json()

    companies.forEach(comp => {
      const opt = document.createElement('option')
      opt.value = comp.id
      opt.textContent = comp.company_name
      inscriptionCompany.appendChild(opt)
    })

    coursesData.rows.forEach(course => {
      const opt = document.createElement('option')
      opt.value = course.id
      opt.textContent = course.course_name
      inscriptionCourse.appendChild(opt)
    })
  } catch (error) {
    console.log(error)
  }
}

export function initForms() {
  elements.createInscriptionBtn.addEventListener('click', openInscriptionPopup)
  elements.inscriptionPopupSave.addEventListener('click', saveInscription)

  // search student when DNI loses focus
  inscriptionDni.addEventListener('blur', searchStudentByDni)

  // re-search when company changes (if DNI is filled)
  inscriptionCompany.addEventListener('change', () => {
    if (inscriptionDni.value.trim()) {
      searchStudentByDni()
    }
  })

  loadPopupOptions()
}

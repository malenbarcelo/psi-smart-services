// courses module - forms and popups
import { gu } from '../globalUtils.js'
import { resetAndLoad } from './table.js'

const coursePopup = document.getElementById('coursePopup')
const coursePopupTitle = document.getElementById('coursePopupTitle')
const coursePopupClose = document.getElementById('coursePopupClose')
const coursePopupCancel = document.getElementById('coursePopupCancel')
const coursePopupSave = document.getElementById('coursePopupSave')
const createCourseBtn = document.getElementById('createCourseBtn')
const courseName = document.getElementById('courseName')
const courseValidity = document.getElementById('courseValidity')
const courseNoExpiration = document.getElementById('courseNoExpiration')
const courseTheorical = document.getElementById('courseTheorical')
const coursePractical = document.getElementById('coursePractical')
const courseCertificate = document.getElementById('courseCertificate')
const courseCredential = document.getElementById('courseCredential')
const resultPopup = document.getElementById('resultPopup')
const resultPopupText = document.getElementById('resultPopupText')

const textInputs = [courseName, courseValidity]

function openCreatePopup() {
  courseName.value = ''
  courseValidity.value = ''
  courseNoExpiration.checked = false
  courseValidity.disabled = false
  courseTheorical.checked = false
  coursePractical.checked = false
  courseCertificate.checked = false
  courseCredential.checked = false
  gu.isValid(textInputs)
  coursePopupTitle.textContent = 'Nuevo Curso'
  coursePopup.style.display = 'block'
  coursePopup.querySelector('.popup-card').scrollTop = 0
}

function closePopup() {
  coursePopup.style.display = 'none'
}

async function saveCourse() {
  gu.isValid(textInputs)
  let hasErrors = false

  if (!courseName.value.trim()) {
    gu.isInvalid([courseName], 'Campo requerido')
    hasErrors = true
  }

  if (!courseNoExpiration.checked && !courseValidity.value) {
    gu.isInvalid([courseValidity], 'Campo requerido')
    hasErrors = true
  }

  if (hasErrors) return

  try {
    const body = {
      course_name: courseName.value.trim(),
      validity_months: courseNoExpiration.checked ? null : parseInt(courseValidity.value),
      has_theorical: courseTheorical.checked ? 1 : 0,
      has_practical: coursePractical.checked ? 1 : 0,
      has_certificate: courseCertificate.checked ? 1 : 0,
      has_credential: courseCredential.checked ? 1 : 0
    }

    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const data = await response.json()
      console.log(data.error)
      return
    }

    closePopup()
    resultPopupText.innerText = 'Curso creado con éxito'
    gu.showResultPopup(resultPopup)
    resetAndLoad()
  } catch (error) {
    console.log(error)
  }
}

export function initForms() {
  createCourseBtn.addEventListener('click', openCreatePopup)
  coursePopupClose.addEventListener('click', closePopup)
  coursePopupCancel.addEventListener('click', closePopup)
  coursePopupSave.addEventListener('click', saveCourse)

  // toggle validity field based on "sin vencimiento" checkbox
  courseNoExpiration.addEventListener('change', () => {
    if (courseNoExpiration.checked) {
      courseValidity.value = ''
      courseValidity.disabled = true
      gu.isValid([courseValidity])
    } else {
      courseValidity.disabled = false
    }
  })

  // close with escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && coursePopup.style.display === 'block') {
      closePopup()
    }
  })
}


// ====== CERTIFICATE TEMPLATE CONFIGURATION ======
const certTemplatePopup = document.getElementById('certTemplatePopup')
const certTemplatePopupClose = document.getElementById('certTemplatePopupClose')
const certTemplatePopupCancel = document.getElementById('certTemplatePopupCancel')
const certTemplatePopupSave = document.getElementById('certTemplatePopupSave')
const certTemplateCards = document.getElementById('certTemplateCards')
const certTemplateFields = document.getElementById('certTemplateFields')
const certCourseName = document.getElementById('certCourseName')
const certNormatives = document.getElementById('certNormatives')
const certText1 = document.getElementById('certText1')
const certText2 = document.getElementById('certText2')
const certText1Row = document.getElementById('certText1Row')
const certText2Row = document.getElementById('certText2Row')
const certStudentPhoto = document.getElementById('certStudentPhoto')
const certLogoSelector = document.getElementById('certLogoSelector')
const certLogo2Selector = document.getElementById('certLogo2Selector')
const certSignature1Selector = document.getElementById('certSignature1Selector')
const certSignature2Selector = document.getElementById('certSignature2Selector')

let currentCertCourseId = null
let currentCertTemplateId = null
let selectedTemplateType = null
let existingImages = []

// fields per template
const templateFields = {
  1: { hasText1: false, hasText2: false, hasLogo2: true },
  2: { hasText1: true, hasText2: true, hasLogo2: true }
}

async function openCertTemplatePopup(courseId) {
  currentCertCourseId = courseId
  currentCertTemplateId = null
  selectedTemplateType = null

  // reset
  certCourseName.value = ''
  certNormatives.value = ''
  certText1.value = ''
  certText2.value = ''
  certStudentPhoto.checked = false
  certTemplateCards.querySelectorAll('.cert-template-card').forEach(c => c.classList.remove('selected'))

  // load existing images
  const imagesRes = await fetch('/api/templates-images')
  existingImages = await imagesRes.json()

  // check if template already exists for this course
  const templateRes = await fetch(`/api/templates-certificates/${courseId}`)
  const template = await templateRes.json()

  if (template) {
    currentCertTemplateId = template.id
    selectedTemplateType = template.id_templates_cetificates

    // select the template card
    const card = certTemplateCards.querySelector(`[data-template-id="${selectedTemplateType}"]`)
    if (card) card.classList.add('selected')

    // fill fields
    certCourseName.value = template.course_name_in_certificate || ''
    certNormatives.value = template.certificate_normatives || ''
    certText1.value = template.text_1 || ''
    certText2.value = template.text_2 || ''
    certStudentPhoto.checked = template.student_photo === 1

    showFieldsForTemplate(selectedTemplateType)
    renderFileSelectors(template)
  } else {
    renderFileSelectors(null)
  }

  certTemplatePopup.style.display = 'block'
  certTemplatePopup.querySelector('.popup-card').scrollTop = 0
}

function showFieldsForTemplate(templateId) {
  const config = templateFields[templateId]
  certText1Row.style.display = config.hasText1 ? 'flex' : 'none'
  certText2Row.style.display = config.hasText2 ? 'flex' : 'none'
}

function renderFileSelectors(template) {
  renderFileSelector(certLogoSelector, 'footer_logo', template?.footer_logo)
  renderFileSelector(certLogo2Selector, 'header_logo', template?.header_logo)
  renderFileSelector(certSignature1Selector, 'signature_1', template?.signature_1)
  renderFileSelector(certSignature2Selector, 'signature_2', template?.signature_2)
}

function renderFileSelector(container, fieldName, currentValue) {
  // filter images by prefix matching the field name
  const filteredImages = existingImages.filter(img => img.startsWith(fieldName))

  let html = ''
  filteredImages.forEach(img => {
    const selected = img === currentValue ? 'selected' : ''
    html += `<img src="/images/templatesImages/${img}" class="cert-file-thumb ${selected}" data-field="${fieldName}" data-file="${img}" title="${img}">`
  })
  html += `<label class="cert-file-upload-btn" title="Subir nuevo">
    <i class="fa-solid fa-plus"></i>
    <input type="file" accept="image/*" data-field="${fieldName}" style="display: none;">
  </label>`
  container.innerHTML = html

  // click handlers for thumbnails
  container.querySelectorAll('.cert-file-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      container.querySelectorAll('.cert-file-thumb').forEach(t => t.classList.remove('selected'))
      thumb.classList.add('selected')
    })
  })

  // upload handler
  const fileInput = container.querySelector('input[type="file"]')
  fileInput.addEventListener('change', async() => {
    const file = fileInput.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('photo', file)

    const res = await fetch('/api/templates-images/upload', { method: 'POST', body: formData })
    const result = await res.json()
    if (result.success) {
      existingImages.push(result.fileName)
      renderFileSelector(container, fieldName, result.fileName)
    }
  })
}

function getSelectedFile(container) {
  const selected = container.querySelector('.cert-file-thumb.selected')
  return selected ? selected.dataset.file : null
}

async function saveCertTemplate() {
  if (!selectedTemplateType) {
    console.log('No template selected')
    return
  }

  const body = {
    id_courses: currentCertCourseId,
    id_templates_cetificates: selectedTemplateType,
    header_logo: getSelectedFile(certLogo2Selector),
    footer_logo: getSelectedFile(certLogoSelector),
    signature_1: getSelectedFile(certSignature1Selector),
    signature_2: getSelectedFile(certSignature2Selector),
    course_name_in_certificate: certCourseName.value.trim(),
    certificate_normatives: certNormatives.value.trim(),
    text_1: certText1.value.trim() || null,
    text_2: certText2.value.trim() || null,
    student_photo: certStudentPhoto.checked ? 1 : 0
  }

  // validate required
  let hasErrors = false
  const errors = []

  if (!body.footer_logo) {
    errors.push('Logo pie de página')
    hasErrors = true
  }
  if (!body.signature_1) {
    errors.push('Firma 1')
    hasErrors = true
  }
  if (!body.course_name_in_certificate) {
    const el = document.getElementById('certCourseNameError')
    el.textContent = 'Campo requerido'
    el.style.display = 'block'
    certCourseName.classList.add('invalid-input')
    hasErrors = true
  } else {
    document.getElementById('certCourseNameError').style.display = 'none'
    certCourseName.classList.remove('invalid-input')
  }
  if (!body.certificate_normatives) {
    const el = document.getElementById('certNormativesError')
    el.textContent = 'Campo requerido'
    el.style.display = 'block'
    certNormatives.classList.add('invalid-input')
    hasErrors = true
  } else {
    document.getElementById('certNormativesError').style.display = 'none'
    certNormatives.classList.remove('invalid-input')
  }

  // text_1 and text_2 required for template 2
  if (selectedTemplateType === 2) {
    if (!certText1.value.trim()) {
      certText1.classList.add('invalid-input')
      hasErrors = true
    } else {
      certText1.classList.remove('invalid-input')
    }
    if (!certText2.value.trim()) {
      certText2.classList.add('invalid-input')
      hasErrors = true
    } else {
      certText2.classList.remove('invalid-input')
    }
  }

  if (errors.length > 0) {
    const el = errors.includes('Logo pie de página') ? document.getElementById('certLogoError') : document.getElementById('certSignature1Error')
    if (errors.includes('Logo pie de página')) {
      document.getElementById('certLogoError').textContent = 'Seleccioná un logo'
      document.getElementById('certLogoError').style.display = 'block'
    }
    if (errors.includes('Firma 1')) {
      document.getElementById('certSignature1Error').textContent = 'Seleccioná una firma'
      document.getElementById('certSignature1Error').style.display = 'block'
    }
  } else {
    document.getElementById('certLogoError').style.display = 'none'
    document.getElementById('certSignature1Error').style.display = 'none'
  }

  if (hasErrors) return

  try {
    let response
    if (currentCertTemplateId) {
      response = await fetch(`/api/templates-certificates/${currentCertTemplateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    } else {
      response = await fetch('/api/templates-certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    }

    if (response.ok) {
      certTemplatePopup.style.display = 'none'
      resultPopupText.innerText = 'Template guardado con éxito'
      gu.showResultPopup(resultPopup)
      resetAndLoad()
    }
  } catch (error) {
    console.log(error)
  }
}

// popup close
certTemplatePopupClose.addEventListener('click', () => { certTemplatePopup.style.display = 'none' })
certTemplatePopupCancel.addEventListener('click', () => { certTemplatePopup.style.display = 'none' })
certTemplatePopupSave.addEventListener('click', saveCertTemplate)

// template card selection
certTemplateCards.addEventListener('click', (e) => {
  const card = e.target.closest('.cert-template-card')
  if (!card) return

  certTemplateCards.querySelectorAll('.cert-template-card').forEach(c => c.classList.remove('selected'))
  card.classList.add('selected')
  selectedTemplateType = parseInt(card.dataset.templateId)

  showFieldsForTemplate(selectedTemplateType)
  renderFileSelectors(null)
})

// table click delegation for template config icon
const coursesTableBody = document.getElementById('coursesTableBody')
coursesTableBody.addEventListener('click', (e) => {
  const icon = e.target.closest('.btn-icon-template')
  if (!icon) return
  const courseId = icon.dataset.id
  openCertTemplatePopup(courseId)
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && certTemplatePopup.style.display === 'block') {
    certTemplatePopup.style.display = 'none'
  }
})

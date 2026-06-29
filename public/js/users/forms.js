// users module - forms, popups, and table actions
import { gu } from '../globalUtils.js'
import { elements, formInputs, popupFormInputs, companyForm } from './globals.js'
import { resetAndLoadUsers } from './table.js'

const { firstName, lastName, email, userCategory, userCompany } = formInputs
const {
  showCreateCompanyBtn, createCompanyForm, newCompanyName,
  newCompanyNameError, cancelCreateCompanyBtn, saveCreateCompanyBtn
} = companyForm

// show inline create company form
function showCreateCompany() {
  createCompanyForm.style.display = 'flex'
  showCreateCompanyBtn.style.display = 'none'
  newCompanyName.value = ''
  newCompanyNameError.style.display = 'none'
  newCompanyName.classList.remove('invalid-input')
  newCompanyName.focus()
}

// hide inline create company form
function hideCreateCompany() {
  createCompanyForm.style.display = 'none'
  showCreateCompanyBtn.style.display = 'inline-flex'
}

// save new company
async function saveNewCompany() {
  newCompanyNameError.style.display = 'none'
  newCompanyName.classList.remove('invalid-input')

  if (!newCompanyName.value.trim()) {
    newCompanyName.classList.add('invalid-input')
    newCompanyNameError.innerText = 'Campo requerido'
    newCompanyNameError.style.display = 'block'
    return
  }

  try {
    const response = await fetch('/api/users-companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_name: newCompanyName.value.trim() })
    })

    const data = await response.json()

    if (!response.ok) {
      newCompanyName.classList.add('invalid-input')
      newCompanyNameError.innerText = 'Esta empresa ya existe'
      newCompanyNameError.style.display = 'block'
      return
    }

    // add new company to select and select it
    const option = document.createElement('option')
    option.value = data.id
    option.textContent = data.company_name
    userCompany.appendChild(option)
    userCompany.value = data.id

    hideCreateCompany()
    elements.resultPopupText.innerText = 'Empresa creada con éxito'
    gu.showResultPopup(elements.resultPopup)
  } catch(error) {
    console.log(error)
  }
}

// open create user popup
function openCreatePopup() {
  gu.clearInputs(popupFormInputs)
  gu.isValid(popupFormInputs)
  elements.userPopupTitle.innerText = 'Nuevo Usuario'
  elements.userPopup.dataset.mode = 'create'
  hideCreateCompany()
  elements.userPopup.style.display = 'block'
}

// save user (create or edit)
async function saveUser() {
  // validate
  gu.isValid(popupFormInputs)
  let hasErrors = false

  const emptyInputs = popupFormInputs.filter(input => !input.value.trim())
  if (emptyInputs.length > 0) {
    gu.isInvalid(emptyInputs, 'Campo requerido')
    hasErrors = true
  }

  // validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (email.value.trim() && !emailRegex.test(email.value.trim())) {
    gu.isInvalid([email], 'Ingrese un email válido')
    hasErrors = true
  }

  if (hasErrors) return

  // validate category/company combination
  const selectedCategory = userCategory.value
  const selectedCompany = userCompany.value

  if (['1', '2', '4'].includes(selectedCategory) && selectedCompany !== '1') {
    gu.isInvalid([userCompany], 'Esta categoría debe pertenecer a PSI Smart Services')
    return
  }

  if (selectedCategory === '3' && selectedCompany === '1') {
    gu.isInvalid([userCompany], 'Administrador Cliente no puede pertenecer a PSI Smart Services')
    return
  }

  try {
    const body = {
      first_name: firstName.value.trim(),
      last_name: lastName.value.trim(),
      email: email.value.trim(),
      id_users_categories: userCategory.value,
      id_companies: userCompany.value
    }

    const isEdit = elements.userPopup.dataset.mode === 'edit'
    const url = isEdit ? '/api/users/' + elements.userPopup.dataset.userId : '/api/users'
    const method = isEdit ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      if (data.field === 'email') {
        gu.isInvalid([email], 'Este email ya está registrado')
      }
      return
    }

    elements.userPopup.style.display = 'none'
    gu.clearInputs(popupFormInputs)
    elements.resultPopupText.innerText = isEdit ? 'Usuario editado con éxito' : 'Usuario creado con éxito'
    gu.showResultPopup(elements.resultPopup)
    resetAndLoadUsers()
  } catch(error) {
    console.log(error)
  }
}

// table action handlers (delegated)
function handleTableActions(e) {
  const btn = e.target.closest('.btn-icon')
  if (!btn) return

  const userId = btn.dataset.id

  if (btn.classList.contains('btn-icon-edit')) {
    editUser(userId)
  }

  if (btn.classList.contains('btn-icon-delete')) {
    toggleUser(userId, 'disable')
  }

  if (btn.classList.contains('btn-icon-enable')) {
    toggleUser(userId, 'enable')
  }
}

// edit user
async function editUser(userId) {
  try {
    const response = await fetch('/api/users/' + userId)
    const user = await response.json()
    gu.clearInputs(popupFormInputs)
    gu.isValid(popupFormInputs)
    elements.userPopupTitle.innerText = 'Editar Usuario'
    elements.userPopup.dataset.mode = 'edit'
    elements.userPopup.dataset.userId = userId
    firstName.value = user.first_name
    lastName.value = user.last_name
    email.value = user.email
    userCategory.value = user.id_users_categories
    userCompany.value = user.id_companies
    hideCreateCompany()
    elements.userPopup.style.display = 'block'
  } catch(error) {
    console.log(error)
  }
}

// toggle user enabled/disabled
function toggleUser(userId, action) {
  const confirmPopupTitle = document.getElementById('confirmPopupTitle')
  const confirmPopupMessage = document.getElementById('confirmPopupMessage')

  if (action === 'disable') {
    confirmPopupTitle.innerText = 'Deshabilitar Usuario'
    confirmPopupMessage.innerText = '¿Está seguro que desea deshabilitar este usuario?'
  } else {
    confirmPopupTitle.innerText = 'Habilitar Usuario'
    confirmPopupMessage.innerText = '¿Está seguro que desea habilitar este usuario?'
  }

  elements.confirmPopup.style.display = 'block'
  elements.confirmPopupAccept.onclick = async() => {
    await fetch('/api/users/' + userId + '/toggle-enabled', { method: 'PUT' })
    elements.confirmPopup.style.display = 'none'
    resetAndLoadUsers()
  }
}

// load select options (filter panel + popup)
async function loadOptions() {
  try {
    const [categoriesRes, companiesRes] = await Promise.all([
      fetch('/api/users-categories'),
      fetch('/api/users-companies')
    ])
    const categories = await categoriesRes.json()
    const companies = await companiesRes.json()

    const filterCategory = document.getElementById('filterCategory')

    categories.forEach(cat => {
      const filterOpt = document.createElement('option')
      filterOpt.value = cat.id
      filterOpt.textContent = cat.user_category
      filterCategory.appendChild(filterOpt)

      const popupOpt = document.createElement('option')
      popupOpt.value = cat.id
      popupOpt.textContent = cat.user_category
      userCategory.appendChild(popupOpt)
    })

    companies.forEach(comp => {
      const popupOpt = document.createElement('option')
      popupOpt.value = comp.id
      popupOpt.textContent = comp.company_name
      userCompany.appendChild(popupOpt)
    })
  } catch(error) {
    console.log(error)
  }
}

// initialize forms event listeners
export function initForms() {
  elements.createUserBtn.addEventListener('click', openCreatePopup)
  elements.userPopupSave.addEventListener('click', saveUser)
  elements.usersTableBody.addEventListener('click', handleTableActions)

  // inline create company
  showCreateCompanyBtn.addEventListener('click', showCreateCompany)
  cancelCreateCompanyBtn.addEventListener('click', hideCreateCompany)
  saveCreateCompanyBtn.addEventListener('click', saveNewCompany)
  newCompanyName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveCreateCompanyBtn.click()
    }
  })

  // load options
  loadOptions()
}

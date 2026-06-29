// users module - global constants, DOM elements, and state
import { gu } from '../globalUtils.js'

// DOM elements
export const elements = {
  createUserBtn: document.getElementById('createUserBtn'),
  openFilterBtn: document.getElementById('openFilterBtn'),
  userPopup: document.getElementById('userPopup'),
  userPopupTitle: document.getElementById('userPopupTitle'),
  userPopupSave: document.getElementById('userPopupSave'),
  confirmPopup: document.getElementById('confirmPopup'),
  confirmPopupAccept: document.getElementById('confirmPopupAccept'),
  filterPanel: document.getElementById('filterPanel'),
  filterPanelClose: document.getElementById('filterPanelClose'),
  filterPanelOverlay: document.getElementById('filterPanelOverlay'),
  filterApplyBtn: document.getElementById('filterApplyBtn'),
  filterClearBtn: document.getElementById('filterClearBtn'),
  activeFiltersBar: document.getElementById('activeFiltersBar'),
  clearFiltersBtn: document.getElementById('clearFiltersBtn'),
  usersTableBody: document.getElementById('usersTableBody'),
  tableScrollContainer: document.getElementById('tableScrollContainer'),
  resultPopup: document.getElementById('resultPopup'),
  resultPopupText: document.getElementById('resultPopupText')
}

// filter inputs
export const filterInputs = elements.filterPanel.querySelectorAll('.input-field')

// popup form inputs
export const formInputs = {
  firstName: document.getElementById('firstName'),
  lastName: document.getElementById('lastName'),
  email: document.getElementById('email'),
  userCategory: document.getElementById('userCategory'),
  userCompany: document.getElementById('userCompany')
}

export const popupFormInputs = [
  formInputs.firstName,
  formInputs.lastName,
  formInputs.email,
  formInputs.userCategory,
  formInputs.userCompany
]

// inline create company elements
export const companyForm = {
  showCreateCompanyBtn: document.getElementById('showCreateCompanyBtn'),
  createCompanyForm: document.getElementById('createCompanyForm'),
  newCompanyName: document.getElementById('newCompanyName'),
  newCompanyNameError: document.getElementById('newCompanyNameError'),
  cancelCreateCompanyBtn: document.getElementById('cancelCreateCompanyBtn'),
  saveCreateCompanyBtn: document.getElementById('saveCreateCompanyBtn')
}

// pagination and sort state
export const PAGE_SIZE = 15

export const state = {
  currentOffset: 0,
  isLoading: false,
  hasMore: true,
  currentSortBy: '',
  currentSortOrder: ''
}

// popups setup
const popups = [elements.userPopup, elements.confirmPopup]
gu.closePopups(popups)
gu.closeWithEscape(popups)

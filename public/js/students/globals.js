// students module - global constants, DOM elements, and state
import { gu } from '../globalUtils.js'

// DOM elements
export const elements = {
  createStudentBtn: document.getElementById('createStudentBtn'),
  openFilterBtn: document.getElementById('openFilterBtn'),
  studentPopup: document.getElementById('studentPopup'),
  studentPopupTitle: document.getElementById('studentPopupTitle'),
  studentPopupSave: document.getElementById('studentPopupSave'),
  confirmPopup: document.getElementById('confirmPopup'),
  confirmPopupAccept: document.getElementById('confirmPopupAccept'),
  filterPanel: document.getElementById('filterPanel'),
  filterPanelClose: document.getElementById('filterPanelClose'),
  filterPanelOverlay: document.getElementById('filterPanelOverlay'),
  filterApplyBtn: document.getElementById('filterApplyBtn'),
  filterClearBtn: document.getElementById('filterClearBtn'),
  activeFiltersBar: document.getElementById('activeFiltersBar'),
  clearFiltersBtn: document.getElementById('clearFiltersBtn'),
  studentsTableBody: document.getElementById('studentsTableBody'),
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
  dni: document.getElementById('dni'),
  studentCompany: document.getElementById('studentCompany')
}

export const popupFormInputs = formInputs.studentCompany
  ? [formInputs.firstName, formInputs.lastName, formInputs.email, formInputs.dni, formInputs.studentCompany]
  : [formInputs.firstName, formInputs.lastName, formInputs.email, formInputs.dni]

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
const popups = [elements.studentPopup, elements.confirmPopup]
gu.closePopups(popups)
gu.closeWithEscape(popups)

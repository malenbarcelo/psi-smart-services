// practicalExams module - global constants, DOM elements, and state
import { gu } from '../globalUtils.js'

// DOM elements
export const elements = {
  openFilterBtn: document.getElementById('openFilterBtn'),
  filterPanel: document.getElementById('filterPanel'),
  filterPanelClose: document.getElementById('filterPanelClose'),
  filterPanelOverlay: document.getElementById('filterPanelOverlay'),
  filterApplyBtn: document.getElementById('filterApplyBtn'),
  filterClearBtn: document.getElementById('filterClearBtn'),
  activeFiltersBar: document.getElementById('activeFiltersBar'),
  clearFiltersBtn: document.getElementById('clearFiltersBtn'),
  practicalExamsTableBody: document.getElementById('practicalExamsTableBody'),
  tableScrollContainer: document.getElementById('tableScrollContainer'),
  resultPopup: document.getElementById('resultPopup'),
  resultPopupText: document.getElementById('resultPopupText'),
  detailPopup: document.getElementById('detailPopup'),
  detailPopupTitle: document.getElementById('detailPopupTitle'),
  detailPopupBody: document.getElementById('detailPopupBody'),
  detailPopupClose: document.getElementById('detailPopupClose'),
  detailPopupCancel: document.getElementById('detailPopupCancel'),
  practicalExamPopup: document.getElementById('practicalExamPopup'),
  practicalExamPopupTitle: document.getElementById('practicalExamPopupTitle'),
  practicalExamPopupSubtitle: document.getElementById('practicalExamPopupSubtitle'),
  practicalExamPopupBody: document.getElementById('practicalExamPopupBody'),
  practicalExamPopupClose: document.getElementById('practicalExamPopupClose'),
  practicalExamPopupCancel: document.getElementById('practicalExamPopupCancel'),
  practicalExamPopupSave: document.getElementById('practicalExamPopupSave'),
  confirmPopup: document.getElementById('confirmPopup'),
  confirmPopupTitle: document.getElementById('confirmPopupTitle'),
  confirmPopupMessage: document.getElementById('confirmPopupMessage'),
  confirmPopupClose: document.getElementById('confirmPopupClose'),
  confirmPopupCancel: document.getElementById('confirmPopupCancel'),
  confirmPopupAccept: document.getElementById('confirmPopupAccept')
}

// filter inputs
export const filterInputs = elements.filterPanel.querySelectorAll('.input-field')

// pagination and sort state
export const PAGE_SIZE = 15

export const state = {
  currentOffset: 0,
  isLoading: false,
  hasMore: true,
  currentSortBy: '',
  currentSortOrder: ''
}

// close popups with Escape and close buttons
const popups = [elements.confirmPopup, elements.detailPopup, elements.practicalExamPopup]
gu.closePopups(popups)
gu.closeWithEscape(popups)

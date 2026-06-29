// results module - global constants, DOM elements, and state

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
  resultsTableBody: document.getElementById('resultsTableBody'),
  tableScrollContainer: document.getElementById('tableScrollContainer'),
  resultPopup: document.getElementById('resultPopup'),
  resultPopupText: document.getElementById('resultPopupText')
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

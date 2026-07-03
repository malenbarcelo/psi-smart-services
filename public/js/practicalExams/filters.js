// practicalExams module - filter panel logic
import { elements, filterInputs, state } from './globals.js'
import { resetAndLoad } from './table.js'

// open filter panel
export function openFilterPanel() {
  elements.filterPanel.classList.add('filter-panel-open')
  elements.filterPanelOverlay.classList.add('filter-overlay-visible')
}

// close filter panel
export function closeFilterPanel() {
  elements.filterPanel.classList.remove('filter-panel-open')
  elements.filterPanelOverlay.classList.remove('filter-overlay-visible')
}

// apply filters
function applyFilters() {
  closeFilterPanel()
  resetAndLoad()
  updateActiveFiltersBar()
}

// active filters bar visibility
function updateActiveFiltersBar() {
  const hasFilters = Array.from(filterInputs).some(input => input.value !== '')
  elements.activeFiltersBar.style.display = hasFilters ? 'flex' : 'none'
}

// select colors based on value
function updateSelectColors() {
  const selects = elements.filterPanel.querySelectorAll('select.input-field')
  selects.forEach(select => {
    if (select.value === '') {
      select.classList.remove('has-value')
    } else {
      select.classList.add('has-value')
    }
  })
}

// build query params from filters
export function buildFilterParams() {
  const params = new URLSearchParams()
  const filterName = document.getElementById('filterName')
  const filterDni = document.getElementById('filterDni')
  const filterCourse = document.getElementById('filterCourse')
  const filterCompany = document.getElementById('filterCompany')
  const filterTheorical = document.getElementById('filterTheorical')

  if (filterName.value) params.append('search', filterName.value)
  if (filterDni.value) params.append('dni', filterDni.value)
  if (filterCourse.value) params.append('id_courses', filterCourse.value)
  if (filterCompany.value) params.append('company', filterCompany.value)
  if (filterTheorical.value) params.append('theoricalStatus', filterTheorical.value)

  if (state.currentSortBy) {
    params.append('sortBy', state.currentSortBy)
    params.append('sortOrder', state.currentSortOrder)
  }

  return params
}

// load courses for filter select
async function loadFilterOptions() {
  try {
    const res = await fetch('/api/courses')
    const data = await res.json()
    const filterCourse = document.getElementById('filterCourse')
    data.rows.forEach(course => {
      const opt = document.createElement('option')
      opt.value = course.id
      opt.textContent = course.course_name
      filterCourse.appendChild(opt)
    })
  } catch (error) {
    console.log(error)
  }
}

// initialize filter event listeners
export function initFilters() {
  elements.openFilterBtn.addEventListener('click', openFilterPanel)
  elements.filterPanelClose.addEventListener('click', closeFilterPanel)
  elements.filterPanelOverlay.addEventListener('click', closeFilterPanel)
  elements.filterApplyBtn.addEventListener('click', applyFilters)

  // close filter panel with escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.filterPanel.classList.contains('filter-panel-open')) {
      closeFilterPanel()
    }
  })

  // apply with enter
  filterInputs.forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        applyFilters()
      }
    })
  })

  // clear from panel
  elements.filterClearBtn.addEventListener('click', () => {
    filterInputs.forEach(input => { input.value = '' })
    updateSelectColors()
    updateActiveFiltersBar()
    closeFilterPanel()
    resetAndLoad()
  })

  // clear from page
  elements.clearFiltersBtn.addEventListener('click', () => {
    filterInputs.forEach(input => { input.value = '' })
    updateSelectColors()
    elements.activeFiltersBar.style.display = 'none'
    resetAndLoad()
  })

  // listen for select changes
  const filterSelects = elements.filterPanel.querySelectorAll('select.input-field')
  filterSelects.forEach(select => {
    select.addEventListener('change', () => {
      if (select.value === '') {
        select.classList.remove('has-value')
      } else {
        select.classList.add('has-value')
      }
    })
  })

  updateSelectColors()
  loadFilterOptions()
}

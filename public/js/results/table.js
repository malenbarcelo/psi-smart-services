// results module - table rendering, pagination, sorting
import { elements, state, PAGE_SIZE } from './globals.js'
import { buildFilterParams } from './filters.js'

// status badge map
function getStatusBadge(status) {
  const map = {
    'pending': { class: 'badge-neutral', label: 'Pendiente' },
    'in-progress': { class: 'badge-warning', label: 'En proceso' },
    'passed': { class: 'badge-active', label: 'Aprobado' },
    'not-passed': { class: 'badge-danger', label: 'Desaprobado' }
  }
  const found = map[status] || { class: 'badge-neutral', label: status }
  return `<span class="badge ${found.class}">${found.label}</span>`
}

// format date to dd/mm/yyyy
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// format grade based on status
function formatGrade(grade, status) {
  if (grade == null || status === 'pending' || status === 'in-progress') return '-'
  const percentage = Math.round(grade * 100) + '%'
  if (status === 'passed') return `<span style="color: #2e7d32; font-weight: 600;">${percentage}</span>`
  if (status === 'not-passed') return `<span style="color: #c62828; font-weight: 600;">${percentage}</span>`
  return percentage
}

// format expiration date based on status and validity
function formatExpiration(updatedAt, validityMonths, status) {
  if (status === 'pending' || status === 'not-passed' || status === 'in-progress') return '-'
  if (!updatedAt || !validityMonths) return '-'

  const expirationDate = new Date(updatedAt)
  expirationDate.setMonth(expirationDate.getMonth() + validityMonths)

  const now = new Date()
  const diffTime = expirationDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const isExpired = diffDays < 0

  const formatted = formatDate(expirationDate.toISOString())
  const daysLabel = isExpired
    ? `Vencido`
    : `${diffDays} días`
  const color = isExpired ? '#c62828' : '#2e7d32'

  return `<span style="color: ${color};"><span style="font-weight: 600;">${formatted}</span><br>${daysLabel}</span>`
}

// render rows (append mode for infinite scroll)
function renderRows(results) {
  results.forEach(result => {
    const tr = document.createElement('tr')
    const studentName = result.student_data
      ? `${result.student_data.last_name}, ${result.student_data.first_name}`
      : '-'
    const companyName = result.company_data ? result.company_data.company_name : '-'
    const courseName = result.course_data ? result.course_data.course_name : '-'
    const validityMonths = result.course_data ? result.course_data.validity_months : null

    tr.innerHTML = `
      <td><input type="checkbox" class="row-checkbox" data-id="${result.id}"></td>
      <td>${result.id}</td>
      <td>${companyName}</td>
      <td>${courseName}</td>
      <td>-</td>
      <td>${studentName}</td>
      <td>${getStatusBadge(result.status)}</td>
      <td>${formatGrade(result.grade, result.status)}</td>
      <td>${validityMonths ? validityMonths + ' meses' : '-'}</td>
      <td>${formatDate(result.updated_at)}</td>
      <td>${formatExpiration(result.updated_at, validityMonths, result.status)}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon" data-id="${result.id}" title="Ver detalle"><i class="fa-solid fa-eye"></i></button>
          <button class="btn-icon" data-id="${result.id}" title="Foto"><i class="fa-solid fa-camera"></i></button>
        </div>
      </td>
    `
    elements.resultsTableBody.appendChild(tr)
  })
}

// load results with pagination
async function loadResults() {
  if (state.isLoading || !state.hasMore) return
  state.isLoading = true

  try {
    const params = buildFilterParams()
    params.append('limit', PAGE_SIZE)
    params.append('offset', state.currentOffset)

    const url = '/api/results?' + params.toString()
    const response = await fetch(url)
    const data = await response.json()

    renderRows(data.rows)
    state.currentOffset += data.rows.length

    if (state.currentOffset >= data.count || data.rows.length < PAGE_SIZE) {
      state.hasMore = false
    }
  } catch (error) {
    console.log(error)
  } finally {
    state.isLoading = false
  }
}

// reset pagination and reload
export function resetAndLoadResults() {
  state.currentOffset = 0
  state.hasMore = true
  elements.resultsTableBody.innerHTML = ''
  loadResults()
}

// update sort icons
function updateSortIcons() {
  const sortableHeaders = document.querySelectorAll('.th-sortable')
  sortableHeaders.forEach(th => {
    const icon = th.querySelector('.sort-icon')
    icon.className = 'fa-solid fa-arrow-down-short-wide sort-icon'

    if (th.dataset.sort === state.currentSortBy) {
      icon.className = state.currentSortOrder === 'ASC'
        ? 'fa-solid fa-arrow-down-short-wide sort-icon'
        : 'fa-solid fa-arrow-up-short-wide sort-icon'
    }
  })
}

// initialize table event listeners
export function initTable() {
  // select all checkbox
  const selectAllCheckbox = document.getElementById('selectAllCheckbox')
  selectAllCheckbox.addEventListener('change', () => {
    const rowCheckboxes = elements.resultsTableBody.querySelectorAll('.row-checkbox')
    rowCheckboxes.forEach(cb => { cb.checked = selectAllCheckbox.checked })
  })

  // infinite scroll
  elements.tableScrollContainer.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = elements.tableScrollContainer
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadResults()
    }
  })

  // sortable headers
  const sortableHeaders = document.querySelectorAll('.th-sortable')
  sortableHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const sortField = th.dataset.sort

      if (state.currentSortBy === sortField) {
        if (state.currentSortOrder === 'ASC') {
          state.currentSortOrder = 'DESC'
        } else {
          state.currentSortBy = ''
          state.currentSortOrder = ''
        }
      } else {
        state.currentSortBy = sortField
        state.currentSortOrder = 'ASC'
      }

      updateSortIcons()
      resetAndLoadResults()
    })
  })

  // initial load
  resetAndLoadResults()
}

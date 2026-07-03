// practicalExams module - table rendering, pagination, sorting
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

// render rows
function renderRows(results) {
  results.forEach(result => {
    const tr = document.createElement('tr')
    const studentName = result.student_data
      ? `${result.student_data.last_name}, ${result.student_data.first_name}`
      : '-'
    const studentDni = result.student_data ? result.student_data.dni : '-'
    const companyName = result.company_data ? result.company_data.company_name : '-'
    const courseName = result.course_data ? result.course_data.course_name : '-'

    const practicalExam = (result.exams || []).find(e => e.exam_type === 'practical' && e.exam_status !== 'passed')

    tr.innerHTML = `
      <td>${result.student_data ? result.student_data.id : '-'}</td>
      <td>${courseName}</td>
      <td>${companyName}</td>
      <td>${studentName}</td>
      <td>${studentDni}</td>
      <td>${getStatusBadge(result.theoricalStatus || 'pending')}</td>
      <td>${getStatusBadge(result.practicalStatus || 'pending')}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon btn-icon-detail" data-id="${result.id}" data-course="${courseName}" data-student="${studentName}" data-dni="${studentDni}" title="Ver detalle"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
          <button class="btn-icon btn-icon-edit" data-id="${result.id}" data-exam-id="${practicalExam?.id || ''}" data-student="${studentName}" data-dni="${studentDni}" title="Completar examen"><i class="fa-solid fa-clipboard-check"></i></button>
        </div>
      </td>
    `
    elements.practicalExamsTableBody.appendChild(tr)
  })
}

// load data with pagination
async function loadData() {
  if (state.isLoading || !state.hasMore) return
  state.isLoading = true

  try {
    const params = buildFilterParams()
    params.append('limit', PAGE_SIZE)
    params.append('offset', state.currentOffset)

    const url = '/api/practical-exams?' + params.toString()
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

// reset and reload
export function resetAndLoad() {
  state.currentOffset = 0
  state.hasMore = true
  elements.practicalExamsTableBody.innerHTML = ''
  loadData()
}

export function initTable() {
  // infinite scroll
  elements.tableScrollContainer.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = elements.tableScrollContainer
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadData()
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
      resetAndLoad()
    })
  })

  // initial load
  resetAndLoad()
}

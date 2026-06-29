// students module - table rendering, pagination, sorting
import { elements, state, PAGE_SIZE } from './globals.js'
import { buildFilterParams } from './filters.js'

// render rows (append mode for infinite scroll)
function renderRows(students) {
  students.forEach(student => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${student.last_name}</td>
      <td>${student.first_name}</td>
      <td>${student.email}</td>
      <td>${student.dni}</td>
      <td>${student.company_data ? student.company_data.company_name : '-'}</td>
      <td><span class="badge ${student.enabled ? 'badge-active' : 'badge-inactive'}">${student.enabled ? 'Activo' : 'Inactivo'}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-icon btn-icon-edit" data-id="${student.id}" title="Editar"><i class="fa-solid fa-pencil"></i></button>
          ${student.enabled
            ? `<button class="btn-icon btn-icon-delete" data-id="${student.id}" title="Deshabilitar"><i class="fa-solid fa-trash"></i></button>`
            : `<button class="btn-icon btn-icon-enable" data-id="${student.id}" title="Habilitar"><i class="fa-solid fa-trash-arrow-up"></i></button>`
          }
        </div>
      </td>
    `
    elements.studentsTableBody.appendChild(tr)
  })
}

// load students with pagination
async function loadStudents() {
  if (state.isLoading || !state.hasMore) return
  state.isLoading = true

  try {
    const params = buildFilterParams()
    params.append('limit', PAGE_SIZE)
    params.append('offset', state.currentOffset)

    const url = '/api/students?' + params.toString()
    const response = await fetch(url)
    const data = await response.json()

    renderRows(data.rows)
    state.currentOffset += data.rows.length

    if (state.currentOffset >= data.count || data.rows.length < PAGE_SIZE) {
      state.hasMore = false
    }
  } catch(error) {
    console.log(error)
  } finally {
    state.isLoading = false
  }
}

// reset pagination and reload
export function resetAndLoadStudents() {
  state.currentOffset = 0
  state.hasMore = true
  elements.studentsTableBody.innerHTML = ''
  loadStudents()
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
  // infinite scroll
  elements.tableScrollContainer.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = elements.tableScrollContainer
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadStudents()
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
      resetAndLoadStudents()
    })
  })

  // initial load
  resetAndLoadStudents()
}

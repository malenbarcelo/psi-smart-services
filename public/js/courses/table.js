// courses module - table rendering and pagination

const PAGE_SIZE = 15
const state = { currentOffset: 0, isLoading: false, hasMore: true, currentSortBy: 'course_name', currentSortOrder: 'ASC' }
const coursesTableBody = document.getElementById('coursesTableBody')
const tableScrollContainer = document.getElementById('tableScrollContainer')

function renderCheckbox(value, field, courseId, hasTemplate) {
  const checked = value ? 'checked' : ''
  let icon = ''
  if ((field === 'has_certificate' || field === 'has_credential') && value) {
    if (hasTemplate) {
      icon = `<i class="fa-solid fa-pen-to-square btn-icon-template" data-id="${courseId}" data-field="${field}" style="cursor: pointer; color: #28a745; font-size: 12px;"></i>`
    } else {
      icon = `<i class="fa-solid fa-gear btn-icon-template" data-id="${courseId}" data-field="${field}" style="cursor: pointer; color: var(--errorColor); font-size: 12px;"></i>`
    }
  }
  return `<span style="display: inline-flex; align-items: center; justify-content: flex-start; width: 40px; gap: 6px;"><input type="checkbox" ${checked}>${icon}</span>`
}

function renderRows(courses) {
  courses.forEach(course => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${course.course_name}</td>
      <td style="text-align: center;">-</td>
      <td style="text-align: center;">${course.validity_months || '-'}</td>
      <td style="text-align: center;">${renderCheckbox(course.has_theorical, 'has_theorical', course.id, false)}</td>
      <td style="text-align: center;">${renderCheckbox(course.has_practical, 'has_practical', course.id, false)}</td>
      <td style="text-align: center;">${renderCheckbox(course.has_certificate, 'has_certificate', course.id, course.hasCertificateTemplate)}</td>
      <td style="text-align: center;">${renderCheckbox(course.has_credential, 'has_credential', course.id, course.hasCredentialTemplate)}</td>
    `
    coursesTableBody.appendChild(tr)
  })
}

async function loadCourses() {
  if (state.isLoading || !state.hasMore) return
  state.isLoading = true

  try {
    const params = new URLSearchParams()
    params.append('limit', PAGE_SIZE)
    params.append('offset', state.currentOffset)
    if (state.currentSortBy) {
      params.append('sortBy', state.currentSortBy)
      params.append('sortOrder', state.currentSortOrder)
    }

    const response = await fetch('/api/courses?' + params.toString())
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

export function resetAndLoad() {
  state.currentOffset = 0
  state.hasMore = true
  coursesTableBody.innerHTML = ''
  loadCourses()
}

export function initTable() {
  // infinite scroll
  tableScrollContainer.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = tableScrollContainer
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadCourses()
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

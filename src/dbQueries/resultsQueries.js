'use strict'

const db = require('../../database/models')
const { Op } = require('sequelize')
const model = db.Students_inscriptions

const resultsQueries = {
  get: async({ filters = {}, pagination = {}, sort = {} } = {}) => {
    const where = {}

    // filter by company (visibility)
    if (filters.id_companies) {
      where.id_companies = filters.id_companies
    }

    // filter by course
    if (filters.id_courses) {
      where.id_courses = filters.id_courses
    }

    // filter by status
    if (filters.status) {
      where.status = filters.status
    }

    // student name search (via include)
    let studentWhere = {}
    if (filters.search) {
      const searchValue = filters.search
      studentWhere[Op.or] = [
        db.sequelize.where(
          db.sequelize.fn('CONCAT', db.sequelize.col('student_data.first_name'), ' ', db.sequelize.col('student_data.last_name')),
          { [Op.like]: `%${searchValue}%` }
        ),
        db.sequelize.where(
          db.sequelize.fn('CONCAT', db.sequelize.col('student_data.last_name'), ' ', db.sequelize.col('student_data.first_name')),
          { [Op.like]: `%${searchValue}%` }
        )
      ]
    }

    // student dni search
    if (filters.dni) {
      studentWhere.dni = filters.dni
    }

    // student email search
    if (filters.email) {
      studentWhere.email = { [Op.like]: `%${filters.email}%` }
    }

    // company name search (via include)
    let companyWhere = {}
    if (filters.company) {
      companyWhere.company_name = { [Op.like]: `%${filters.company}%` }
    }

    // build order clause
    const allowedSortFields = ['id', 'company', 'course', 'student_name', 'status', 'updated_at']
    let order = [['id', 'DESC']]
    if (sort.sortBy && allowedSortFields.includes(sort.sortBy)) {
      const direction = sort.sortOrder === 'DESC' ? 'DESC' : 'ASC'
      if (sort.sortBy === 'company') {
        order = [[{ model: db.Users_companies, as: 'company_data' }, 'company_name', direction]]
      } else if (sort.sortBy === 'course') {
        order = [[{ model: db.Courses, as: 'course_data' }, 'course_name', direction]]
      } else if (sort.sortBy === 'student_name') {
        order = [[{ model: db.Students, as: 'student_data' }, 'last_name', direction]]
      } else {
        order = [[sort.sortBy, direction]]
      }
    }

    const hasStudentFilter = Object.keys(studentWhere).length > 0
    const hasCompanyFilter = Object.keys(companyWhere).length > 0

    const options = {
      where,
      order,
      include: [
        { model: db.Users_companies, as: 'company_data', where: hasCompanyFilter ? companyWhere : undefined, required: hasCompanyFilter },
        { model: db.Students, as: 'student_data', where: hasStudentFilter ? studentWhere : undefined, required: hasStudentFilter },
        { model: db.Courses, as: 'course_data' }
      ]
    }

    if (pagination.limit) {
      options.limit = pagination.limit
      options.offset = pagination.offset || 0
    }

    const rows = await model.findAll(options)
    const count = await model.count({
      where,
      include: [
        hasCompanyFilter ? { model: db.Users_companies, as: 'company_data', where: companyWhere, required: true } : undefined,
        hasStudentFilter ? { model: db.Students, as: 'student_data', where: studentWhere, required: true } : undefined
      ].filter(Boolean)
    })

    return { rows, count }
  }
}

module.exports = resultsQueries

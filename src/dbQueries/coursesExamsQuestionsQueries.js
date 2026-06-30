'use strict'

const db = require('../../database/models')
const { Op } = require('sequelize')
const model = db.Courses_exams_questions

const coursesExamsQuestionsQueries = {
  get: async({ filters = {}, pagination = {} } = {}) => {
    const where = {}

    // text search (partial match on exam name)
    if (filters.search) {
      where.exam_name = { [Op.like]: `%${filters.search}%` }
    }

    // filter by course
    if (filters.id_courses) {
      where.id_courses = filters.id_courses
    }

    // filter by exam type
    if (filters.exm_type) {
      where.exm_type = filters.exm_type
    }

    // filter by enabled status
    if (filters.enabled !== undefined && filters.enabled !== '') {
      where.enabled = filters.enabled
    }

    const options = {
      where,
      order: [['exam_index', 'ASC']],
      include: [
        { model: db.Courses, as: 'course_data' }
      ]
    }

    if (pagination.limit) {
      options.limit = pagination.limit
      options.offset = pagination.offset || 0
    }

    const rows = await model.findAll(options)
    const count = await model.count({ where })

    return { rows, count }
  },

  getById: async(id) => {
    const row = await model.findByPk(id, {
      include: [
        { model: db.Courses, as: 'course_data' }
      ]
    })
    return row
  },

  create: async(data) => {
    const newRow = await model.create(data)
    return newRow
  },

  update: async(id, data) => {
    await model.update(data, { where: { id } })
    const updated = await model.findByPk(id)
    return updated
  },

  delete: async(id) => {
    const result = await model.destroy({ where: { id } })
    return result
  }
}

module.exports = coursesExamsQuestionsQueries

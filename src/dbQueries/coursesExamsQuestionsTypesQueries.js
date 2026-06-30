'use strict'

const db = require('../../database/models')
const { Op } = require('sequelize')
const model = db.Courses_exams_questions_types

const coursesExamsQuestionsTypesQueries = {
  get: async({ filters = {}, pagination = {} } = {}) => {
    const where = {}

    // text search (partial match on type)
    if (filters.search) {
      where.type = { [Op.like]: `%${filters.search}%` }
    }

    const options = {
      where,
      order: [['id', 'ASC']],
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
    const row = await model.findByPk(id)
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

module.exports = coursesExamsQuestionsTypesQueries

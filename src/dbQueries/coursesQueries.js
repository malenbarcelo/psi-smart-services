'use strict'

const db = require('../../database/models')
const { Op } = require('sequelize')
const model = db.Courses

const coursesQueries = {
  get: async({ filters = {}, pagination = {}, sort = {} } = {}) => {
    const where = {}

    // text search (partial match on course name)
    if (filters.search) {
      where.course_name = { [Op.like]: `%${filters.search}%` }
    }

    // filter by credential
    if (filters.has_credential !== undefined && filters.has_credential !== '') {
      where.has_credential = filters.has_credential
    }

    // filter by certificate
    if (filters.has_certificate !== undefined && filters.has_certificate !== '') {
      where.has_certificate = filters.has_certificate
    }

    // filter by theorical
    if (filters.has_theorical !== undefined && filters.has_theorical !== '') {
      where.has_theorical = filters.has_theorical
    }

    // filter by practical
    if (filters.has_practical !== undefined && filters.has_practical !== '') {
      where.has_practical = filters.has_practical
    }

    // filter by enabled status
    if (filters.enabled !== undefined && filters.enabled !== '') {
      where.enabled = filters.enabled
    }

    const options = {
      where,
      order: sort.sortBy ? [[sort.sortBy, sort.sortOrder || 'ASC']] : [['course_name', 'ASC']]
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

module.exports = coursesQueries

'use strict'

const db = require('../../database/models')
const { Op } = require('sequelize')
const model = db.Templates_certificates

const templatesCertificatesQueries = {
  get: async({ filters = {}, pagination = {}, sort = {} } = {}) => {
    const where = {}

    // filter by course
    if (filters.id_courses !== undefined && filters.id_courses !== '') {
      where.id_courses = filters.id_courses
    }

    const options = {
      where,
      include: [
        { model: db.Courses, as: 'course_data' }
      ],
      order: sort.sortBy ? [[sort.sortBy, sort.sortOrder || 'ASC']] : [['id', 'ASC']]
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

module.exports = templatesCertificatesQueries

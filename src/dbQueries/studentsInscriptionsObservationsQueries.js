'use strict'

const db = require('../../database/models')
const { Op } = require('sequelize')
const model = db.Students_inscriptions_observations

const studentsInscriptionsObservationsQueries = {
  get: async({ filters = {}, pagination = {} } = {}) => {
    const where = {}

    // filter by student
    if (filters.id_students) {
      where.id_students = filters.id_students
    }

    // filter by inscription
    if (filters.id_students_inscriptions) {
      where.id_students_inscriptions = filters.id_students_inscriptions
    }

    // filter by student exam
    if (filters.id_students_exams) {
      where.id_students_exams = filters.id_students_exams
    }

    const options = {
      where,
      order: [['id', 'ASC']],
      include: [
        { model: db.Students, as: 'student_data' },
        { model: db.Students_inscriptions, as: 'inscription_data' },
        { model: db.Students_exams, as: 'student_exam_data' }
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
        { model: db.Students, as: 'student_data' },
        { model: db.Students_inscriptions, as: 'inscription_data' },
        { model: db.Students_exams, as: 'student_exam_data' }
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

module.exports = studentsInscriptionsObservationsQueries

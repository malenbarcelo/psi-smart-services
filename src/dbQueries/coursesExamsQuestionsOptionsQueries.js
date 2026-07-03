'use strict'

const db = require('../../database/models')
const { Op } = require('sequelize')
const model = db.Courses_exams_questions_options

const coursesExamsQuestionsOptionsQueries = {
  get: async({ filters = {}, pagination = {} } = {}) => {
    const where = {}

    // filter by course exam
    if (filters.id_courses_exams) {
      where.id_courses_exams = filters.id_courses_exams
    }

    // filter by question
    if (filters.id_courses_exams_questions) {
      where.id_courses_exams_questions = filters.id_courses_exams_questions
    }

    // filter by question number
    if (filters.question_number) {
      where.question_number = filters.question_number
    }

    // filter by correct option
    if (filters.correct_option !== undefined && filters.correct_option !== '') {
      where.correct_option = filters.correct_option
    }

    const options = {
      where,
      order: [['question_number', 'ASC'], ['option_reference', 'ASC']],
      include: [
        { model: db.Courses_exams, as: 'course_exam_data' },
        { model: db.Courses_exams_questions, as: 'question_data' }
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
        { model: db.Courses_exams, as: 'course_exam_data' },
        { model: db.Courses_exams_questions, as: 'question_data' }
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

module.exports = coursesExamsQuestionsOptionsQueries

'use strict'

const db = require('../../database/models')
const { Op } = require('sequelize')
const model = db.Students

const studentsQueries = {
  get: async({ filters = {}, pagination = {}, sort = {} } = {}) => {
    const where = {}

    // text search (partial match on full name)
    if (filters.search) {
      const searchValue = filters.search
      where[Op.or] = [
        db.sequelize.where(
          db.sequelize.fn('CONCAT', db.sequelize.col('first_name'), ' ', db.sequelize.col('last_name')),
          { [Op.like]: `%${searchValue}%` }
        ),
        db.sequelize.where(
          db.sequelize.fn('CONCAT', db.sequelize.col('last_name'), ' ', db.sequelize.col('first_name')),
          { [Op.like]: `%${searchValue}%` }
        )
      ]
    }

    // email search (partial match)
    if (filters.email) {
      where.email = { [Op.like]: `%${filters.email}%` }
    }

    // dni search (exact match)
    if (filters.dni) {
      where.dni = filters.dni
    }

    // filter by company (visibility)
    if (filters.id_companies) {
      where.id_companies = filters.id_companies
    }

    // filter by enabled status
    if (filters.enabled !== undefined && filters.enabled !== '') {
      where.enabled = filters.enabled
    }

    // company name search (via include)
    let companyWhere = {}
    if (filters.company) {
      companyWhere.company_name = { [Op.like]: `%${filters.company}%` }
    }

    // build order clause
    const allowedSortFields = ['first_name', 'last_name', 'email', 'company']
    let order = [['last_name', 'ASC']]
    if (sort.sortBy && allowedSortFields.includes(sort.sortBy)) {
      const direction = sort.sortOrder === 'DESC' ? 'DESC' : 'ASC'
      if (sort.sortBy === 'company') {
        order = [[{ model: db.Users_companies, as: 'company_data' }, 'company_name', direction]]
      } else {
        order = [[sort.sortBy, direction]]
      }
    }

    const options = {
      where,
      order,
      include: [
        { model: db.Users_companies, as: 'company_data', where: Object.keys(companyWhere).length > 0 ? companyWhere : undefined, required: Object.keys(companyWhere).length > 0 }
      ]
    }

    if (pagination.limit) {
      options.limit = pagination.limit
      options.offset = pagination.offset || 0
    }

    const rows = await model.findAll(options)
    const count = await model.count({ where, include: Object.keys(companyWhere).length > 0 ? [{ model: db.Users_companies, as: 'company_data', where: companyWhere, required: true }] : [] })

    return { rows, count }
  },

  getById: async(id) => {
    const row = await model.findByPk(id, {
      include: [
        { model: db.Users_companies, as: 'company_data' }
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
    const updated = await model.findByPk(id, {
      include: [
        { model: db.Users_companies, as: 'company_data' }
      ]
    })
    return updated
  },

  delete: async(id) => {
    const result = await model.destroy({ where: { id } })
    return result
  }
}

module.exports = studentsQueries

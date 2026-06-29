'use strict'

const db = require('../../database/models')
const { Op } = require('sequelize')
const model = db.Users

const usersQueries = {
  get: async({ filters = {}, pagination = {}, sort = {} } = {}) => {
    const where = {}

    // text search (case insensitive, partial match on full name)
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

    // email search (partial match for filtering)
    if (filters.email) {
      where.email = { [Op.like]: `%${filters.email}%` }
    }

    // email exact match (for login)
    if (filters.emailExact) {
      where.email = filters.emailExact
    }

    // company name search (via include)
    let companyWhere = {}
    if (filters.company) {
      companyWhere.company_name = { [Op.like]: `%${filters.company}%` }
    }

    // exact filters
    if (filters.id_users_categories) {
      where.id_users_categories = filters.id_users_categories
    }
    if (filters.id_companies) {
      where.id_companies = filters.id_companies
    }
    if (filters.enabled !== undefined && filters.enabled !== '') {
      where.enabled = filters.enabled
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
        { model: db.Users_companies, as: 'company_data', where: Object.keys(companyWhere).length > 0 ? companyWhere : undefined, required: Object.keys(companyWhere).length > 0 },
        { model: db.Users_categories, as: 'category_data' }
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
        { model: db.Users_companies, as: 'company_data' },
        { model: db.Users_categories, as: 'category_data' }
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

module.exports = usersQueries

const usersQueries = require('../../dbQueries/usersQueries')
const studentsQueries = require('../../dbQueries/studentsQueries')
const resultsQueries = require('../../dbQueries/resultsQueries')
const coursesQueries = require('../../dbQueries/coursesQueries')
const db = require('../../../database/models')

const getController = {
  getUsers: async(req, res) => {
    try {
      const filters = {}
      const pagination = {}
      const sort = {}

      if (req.query.search) {
        filters.search = req.query.search
      }
      if (req.query.email) {
        filters.email = req.query.email
      }
      if (req.query.company) {
        filters.company = req.query.company
      }
      if (req.query.id_users_categories) {
        filters.id_users_categories = req.query.id_users_categories
      }
      if (req.query.id_companies) {
        filters.id_companies = req.query.id_companies
      }
      if (req.query.enabled !== undefined && req.query.enabled !== '') {
        filters.enabled = req.query.enabled
      }
      if (req.query.limit) {
        pagination.limit = parseInt(req.query.limit)
        pagination.offset = parseInt(req.query.offset) || 0
      }
      if (req.query.sortBy) {
        sort.sortBy = req.query.sortBy
        sort.sortOrder = req.query.sortOrder || 'ASC'
      }

      const users = await usersQueries.get({ filters, pagination, sort })
      return res.json(users)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting users' })
    }
  },

  getUsersCategories: async(req, res) => {
    try {
      const categories = await db.Users_categories.findAll()
      return res.json(categories)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting categories' })
    }
  },

  getUserById: async(req, res) => {
    try {
      const user = await usersQueries.getById(req.params.id)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      return res.json(user)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting user' })
    }
  },

  getUsersCompanies: async(req, res) => {
    try {
      const companies = await db.Users_companies.findAll({ where: { enabled: 1 }, order: [['company_name', 'ASC']] })
      return res.json(companies)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting companies' })
    }
  },

  getStudents: async(req, res) => {
    try {
      const userLogged = req.session.userLogged
      const filters = {}
      const pagination = {}
      const sort = {}

      // visibility by company for cat 3
      if (userLogged.id_users_categories == 3) {
        filters.id_companies = userLogged.id_companies
      }

      if (req.query.search) filters.search = req.query.search
      if (req.query.email) filters.email = req.query.email
      if (req.query.dni) filters.dni = req.query.dni
      if (req.query.company) filters.company = req.query.company
      if (req.query.enabled !== undefined && req.query.enabled !== '') {
        filters.enabled = req.query.enabled
      }
      if (req.query.limit) {
        pagination.limit = parseInt(req.query.limit)
        pagination.offset = parseInt(req.query.offset) || 0
      }
      if (req.query.sortBy) {
        sort.sortBy = req.query.sortBy
        sort.sortOrder = req.query.sortOrder || 'ASC'
      }

      const students = await studentsQueries.get({ filters, pagination, sort })
      return res.json(students)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting students' })
    }
  },

  getStudentById: async(req, res) => {
    try {
      const userLogged = req.session.userLogged
      const student = await studentsQueries.getById(req.params.id)
      if (!student) {
        return res.status(404).json({ error: 'Student not found' })
      }
      // cat 3 can only see students from their company
      if (userLogged.id_users_categories == 3 && student.id_companies != userLogged.id_companies) {
        return res.status(404).json({ error: 'Student not found' })
      }
      return res.json(student)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting student' })
    }
  },

  getResults: async(req, res) => {
    try {
      const userLogged = req.session.userLogged
      const filters = {}
      const pagination = {}
      const sort = {}

      // visibility by company for cat 3
      if (userLogged.id_users_categories == 3) {
        filters.id_companies = userLogged.id_companies
      }

      if (req.query.search) filters.search = req.query.search
      if (req.query.id_courses) filters.id_courses = req.query.id_courses
      if (req.query.company) filters.company = req.query.company
      if (req.query.dni) filters.dni = req.query.dni
      if (req.query.email) filters.email = req.query.email
      if (req.query.status) filters.status = req.query.status
      if (req.query.limit) {
        pagination.limit = parseInt(req.query.limit)
        pagination.offset = parseInt(req.query.offset) || 0
      }
      if (req.query.sortBy) {
        sort.sortBy = req.query.sortBy
        sort.sortOrder = req.query.sortOrder || 'ASC'
      }

      const results = await resultsQueries.get({ filters, pagination, sort })
      return res.json(results)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting results' })
    }
  },

  getCourses: async(req, res) => {
    try {
      const filters = {}
      const pagination = {}

      if (req.query.search) filters.search = req.query.search
      if (req.query.enabled !== undefined && req.query.enabled !== '') {
        filters.enabled = req.query.enabled
      }
      if (req.query.limit) {
        pagination.limit = parseInt(req.query.limit)
        pagination.offset = parseInt(req.query.offset) || 0
      }

      const courses = await coursesQueries.get({ filters, pagination })
      return res.json(courses)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting courses' })
    }
  },
}

module.exports = getController

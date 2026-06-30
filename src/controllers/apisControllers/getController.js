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
      if (req.query.id_companies && userLogged.id_users_categories != 3) {
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

  searchExamsByDni: async(req, res) => {
    try {
      const dni = req.params.dni

      if (!dni || !/^\d{8}$/.test(dni)) {
        return res.status(400).json({ error: 'DNI inválido' })
      }

      // find all students with this DNI that are enabled
      const students = await db.Students.findAll({
        where: { dni, enabled: 1 }
      })

      if (students.length === 0) {
        return res.status(404).json({ error: 'El DNI ingresado no existe', code: 'NOT_FOUND' })
      }

      const studentIds = students.map(s => s.id)

      // find all active inscriptions (enabled=1, status != passed) for these students
      const inscriptions = await db.Students_inscriptions.findAll({
        where: {
          id_students: studentIds,
          enabled: 1,
          status: { [db.Sequelize.Op.ne]: 'passed' }
        },
        include: [
          { model: db.Users_companies, as: 'company_data' },
          { model: db.Courses, as: 'course_data' },
          { model: db.Students, as: 'student_data' }
        ]
      })

      if (inscriptions.length === 0) {
        // return student name for display
        const studentName = `${students[0].last_name}, ${students[0].first_name}`
        return res.json({ code: 'NO_PENDING', studentName, inscriptions: [] })
      }

      // for each inscription, get the exams with their course exam names
      const results = []
      for (const inscription of inscriptions) {
        const exams = await db.Students_exams.findAll({
          where: {
            id_students_inscriptions: inscription.id
          },
          include: [
            { model: db.Courses_exams, as: 'course_exam_data', attributes: ['exam_name'] }
          ],
          order: [['exam_index', 'ASC']]
        })

        results.push({
          id_inscription: inscription.id,
          company_name: inscription.company_data?.company_name || '',
          course_name: inscription.course_data?.course_name || '',
          student_name: `${inscription.student_data?.last_name}, ${inscription.student_data?.first_name}`,
          exams: exams.map(e => ({
            id: e.id,
            exam_name: e.course_exam_data?.exam_name || '',
            exam_type: e.exam_type,
            exam_index: e.exam_index,
            exam_status: e.exam_status,
            exam_grade: e.exam_grade
          }))
        })
      }

      const studentName = `${students[0].last_name}, ${students[0].first_name}`
      return res.json({ code: 'HAS_PENDING', studentName, inscriptions: results })
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error searching exams' })
    }
  },
}

module.exports = getController

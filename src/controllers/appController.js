const headerMenu = require("../data/headerMenu")
const title = require("../data/title")
const usersQueries = require("../dbQueries/usersQueries")
const { validationResult } = require('express-validator')

const appController = {
  login: (req, res) => {
    try {
      req.session.destroy()
      return res.render('login/login', { title })
    } catch(error) {
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },

  loginProcess: async(req, res) => {
    try {
      const resultValidation = validationResult(req)
      if (resultValidation.errors.length > 0) {
        return res.render('login/login', {
          errors: resultValidation.mapped(),
          oldData: req.body,
          title: 'Login'
        })
      }

      // login
      const userToLogin = await usersQueries.get({ filters: { emailExact: req.body.email, enabled: 1 } })
      const user = userToLogin.rows[0]
      delete user.password
      req.session.userLogged = user

      // redirect based on user category
      const categoriesWithUsersAccess = [1, 2, 4]
      const redirectUrl = categoriesWithUsersAccess.includes(user.id_users_categories) ? '/usuarios' : '/alumnos'
      return res.redirect(redirectUrl)
    } catch(error) {
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },

  logout: async(req, res) => {
    try {
      req.session.destroy()
      return res.redirect('/')
    } catch(error) {
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },

  // kiro routes
  users: async(req, res) => {
    try {
      const userLogged = req.session.userLogged
      const bottomHeaderMenu = headerMenu.find(h => h.idUsersCategories == userLogged.id_users_categories)?.menu || []
      const selectedItem = 'USUARIOS'
      return res.render('users/users', { title, headerMenu, bottomHeaderMenu, selectedItem, userLogged })
    } catch(error) {
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },

  students: async(req, res) => {
    try {
      const userLogged = req.session.userLogged
      const bottomHeaderMenu = headerMenu.find(h => h.idUsersCategories == userLogged.id_users_categories)?.menu || []
      const selectedItem = 'ALUMNOS'
      return res.render('students/students', { title, headerMenu, bottomHeaderMenu, selectedItem, userLogged })
    } catch(error) {
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },

  results: async(req, res) => {
    try {
      const userLogged = req.session.userLogged
      const bottomHeaderMenu = headerMenu.find(h => h.idUsersCategories == userLogged.id_users_categories)?.menu || []
      const selectedItem = 'RESULTADOS'
      return res.render('results/results', { title, headerMenu, bottomHeaderMenu, selectedItem, userLogged })
    } catch(error) {
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },

  practicalExams: async(req, res) => {
    try {
      const userLogged = req.session.userLogged
      const bottomHeaderMenu = headerMenu.find(h => h.idUsersCategories == userLogged.id_users_categories)?.menu || []
      const selectedItem = 'EXÁMENES PRÁCTICOS'
      return res.render('practicalExams/practicalExams', { title, headerMenu, bottomHeaderMenu, selectedItem, userLogged })
    } catch(error) {
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },

  exams: async(req, res) => {
    try {
      return res.render('exams/exams', { title })
    } catch(error) {
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },

  verifyCertificate: async(req, res) => {
    try {
      const db = require('../dbQueries/studentsQueries')
      const dbModels = require('../../database/models')

      const { token } = req.params
      const inscription = await dbModels.Students_inscriptions.findOne({
        where: { verification_token: token },
        include: [
          { model: dbModels.Students, as: 'student_data' },
          { model: dbModels.Courses, as: 'course_data' },
          { model: dbModels.Users_companies, as: 'company_data' }
        ]
      })

      if (!inscription) {
        return res.render('verify/verify', { title, result: null })
      }

      // calculate expiration
      let expirationDate = null
      let isExpired = false
      if (inscription.course_data.validity_months && inscription.updated_at) {
        const updatedAt = new Date(inscription.updated_at + 'T00:00:00')
        expirationDate = new Date(updatedAt)
        expirationDate.setMonth(expirationDate.getMonth() + inscription.course_data.validity_months)
        isExpired = expirationDate < new Date()
      }

      const result = {
        studentName: `${inscription.student_data.last_name} ${inscription.student_data.first_name}`,
        dni: inscription.student_data.dni,
        courseName: inscription.course_data.course_name,
        companyName: inscription.company_data?.company_name || '',
        status: inscription.status,
        inscriptionDate: inscription.inscription_date,
        expirationDate,
        isExpired,
        isValid: inscription.status === 'passed' && !isExpired
      }

      return res.render('verify/verify', { title, result })
    } catch(error) {
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },
}

module.exports = appController

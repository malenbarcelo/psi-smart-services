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

  exams: async(req, res) => {
    try {
      return res.render('exams/exams', { title })
    } catch(error) {
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },
}

module.exports = appController

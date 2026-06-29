const { body } = require('express-validator')
const bcrypt = require('bcryptjs')
const usersQueries = require('../dbQueries/usersQueries')

const loginFormValidations = {
  login: [
    body('email')
      .notEmpty().withMessage('Debe ingresar un email').bail()
      .isEmail().withMessage('Debe ingresar un email válido').bail()
      .custom(async(value, { req }) => {
        const email = value
        let userToLogin = await usersQueries.get({ filters: { emailExact: email, enabled: 1 } })
        userToLogin = userToLogin.rows
        if (userToLogin.length == 0) {
          throw new Error('Email inválido')
        }
        return true
      }),
    body('password')
      .notEmpty().withMessage('Debe ingresar una contraseña').bail()
      .custom(async(value, { req }) => {
        const password = value
        const email = req.body.email
        if (!email) return true
        let userToLogin = await usersQueries.get({ filters: { emailExact: email, enabled: 1 } })
        userToLogin = userToLogin.rows[0]
        if (userToLogin && userToLogin.password) {
          if (!bcrypt.compareSync(password, userToLogin.password)) {
            throw new Error('Contraseña inválida')
          }
        }
        return true
      }),
  ],
}

module.exports = loginFormValidations

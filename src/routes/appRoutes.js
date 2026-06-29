const express = require('express')
const appController = require('../controllers/appController.js')
const loginFormValidations = require('../validations/loginFormValidations.js')
const authMiddleware = require('../middlewares/authMiddleware.js')
const routeAccessMiddleware = require('../middlewares/routeAccessMiddleware.js')

const router = express.Router()

// routes
router.get('/', appController.login)
router.get('/login', appController.login)
router.post('/login', loginFormValidations.login, appController.loginProcess)
router.get('/logout', appController.logout)

// kiro routes
router.get('/usuarios', authMiddleware, routeAccessMiddleware, appController.users)
router.get('/alumnos', authMiddleware, routeAccessMiddleware, appController.students)
router.get('/resultados', authMiddleware, routeAccessMiddleware, appController.results)

module.exports = router

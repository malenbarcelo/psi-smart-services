const express = require('express')
const getController = require('../controllers/apisControllers/getController.js')
const createController = require('../controllers/apisControllers/createController.js')
const updateController = require('../controllers/apisControllers/updateController.js')
const composedController = require('../controllers/apisControllers/composedController.js')
const authMiddleware = require('../middlewares/authMiddleware.js')

const router = express.Router()

// get routes
router.get('/users', authMiddleware, getController.getUsers)
router.get('/users/:id', authMiddleware, getController.getUserById)
router.get('/users-categories', authMiddleware, getController.getUsersCategories)
router.get('/users-companies', authMiddleware, getController.getUsersCompanies)
router.get('/students', authMiddleware, getController.getStudents)
router.get('/students/:id', authMiddleware, getController.getStudentById)
router.get('/results', authMiddleware, getController.getResults)
router.get('/courses', authMiddleware, getController.getCourses)

// create routes
router.post('/users', authMiddleware, createController.createUser)
router.post('/users-companies', authMiddleware, createController.createCompany)
router.post('/students', authMiddleware, createController.createStudent)

// update routes
router.put('/users/:id', authMiddleware, updateController.updateUser)
router.put('/users/:id/toggle-enabled', authMiddleware, updateController.toggleUserEnabled)
router.put('/students/:id', authMiddleware, updateController.updateStudent)
router.put('/students/:id/toggle-enabled', authMiddleware, updateController.toggleStudentEnabled)

// composed routes

module.exports = router

const express = require('express')
const getController = require('../controllers/apisControllers/getController.js')
const createController = require('../controllers/apisControllers/createController.js')
const updateController = require('../controllers/apisControllers/updateController.js')
const composedController = require('../controllers/apisControllers/composedController.js')
const authMiddleware = require('../middlewares/authMiddleware.js')

const router = express.Router()

// public routes (no auth required)
router.get('/exams/search-dni/:dni', getController.searchExamsByDni)
router.get('/exams/:studentExamId/questions', getController.getExamQuestions)
router.get('/exams/inscription/:inscriptionId', getController.getExamsByInscription)
router.put('/exams/answers/:answerId', updateController.saveExamAnswer)
router.put('/exams/:studentExamId/status', updateController.updateExamStatus)
router.put('/inscriptions/:inscriptionId/status', updateController.updateInscriptionStatus)
router.post('/students/upload-photo', composedController.uploadStudentPhoto)

// get routes
router.get('/users', authMiddleware, getController.getUsers)
router.get('/users/:id', authMiddleware, getController.getUserById)
router.get('/users-categories', authMiddleware, getController.getUsersCategories)
router.get('/users-companies', authMiddleware, getController.getUsersCompanies)
router.get('/students', authMiddleware, getController.getStudents)
router.get('/students/:id', authMiddleware, getController.getStudentById)
router.get('/results', authMiddleware, getController.getResults)
router.get('/practical-exams', authMiddleware, getController.getPracticalExams)
router.get('/courses', authMiddleware, getController.getCourses)
router.get('/templates-images', authMiddleware, getController.getTemplatesImages)
router.get('/templates-certificates/:courseId', authMiddleware, getController.getCertificateTemplate)

// create routes
router.post('/users', authMiddleware, createController.createUser)
router.post('/users-companies', authMiddleware, createController.createCompany)
router.post('/students', authMiddleware, createController.createStudent)
router.post('/inscriptions', authMiddleware, createController.createInscription)
router.post('/courses', authMiddleware, createController.createCourse)
router.post('/templates-certificates', authMiddleware, createController.createCertificateTemplate)
router.put('/templates-certificates/:id', authMiddleware, updateController.updateCertificateTemplate)
router.post('/templates-images/upload', authMiddleware, composedController.uploadTemplateImage)

// update routes
router.put('/users/:id', authMiddleware, updateController.updateUser)
router.put('/users/:id/toggle-enabled', authMiddleware, updateController.toggleUserEnabled)
router.put('/students/:id', authMiddleware, updateController.updateStudent)
router.put('/students/:id/toggle-enabled', authMiddleware, updateController.toggleStudentEnabled)

// composed routes
router.post('/exams/:studentExamId/finalize', composedController.finalizeExam)
router.post('/exams/:studentExamId/preview', composedController.previewExam)
router.post('/inscriptions/observations', createController.createObservation)

// test route (remove in production)
router.get('/test-certificate/:inscriptionId', composedController.testCertificate)
router.get('/test-credential/:inscriptionId', composedController.testCredential)

module.exports = router

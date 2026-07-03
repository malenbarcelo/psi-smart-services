const db = require('../../../database/models')
const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const { generateCertificate } = require('../../utils/certificateGenerator')

// multer config - store in memory for processing with sharp
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max upload
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten imágenes JPG y PNG'), false)
    }
  }
}).single('photo')

const composedController = {
  uploadStudentPhoto: async(req, res) => {
    upload(req, res, async(err) => {
      try {
        if (err) {
          return res.status(400).json({ error: err.message || 'Error uploading file' })
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' })
        }

        const { dni } = req.body
        if (!dni) {
          return res.status(400).json({ error: 'DNI is required' })
        }

        // compress and save image with sharp
        const fileName = `${dni}.jpg`
        const outputPath = path.join(__dirname, '../../../public/studentsPhotos', fileName)

        await sharp(req.file.buffer)
          .resize(400, 400, { fit: 'cover' })
          .jpeg({ quality: 60 })
          .toFile(outputPath)

        // update all student records with this DNI
        await db.Students.update(
          { photo: fileName },
          { where: { dni } }
        )

        return res.json({ success: true, photo: fileName })
      } catch(error) {
        console.log(error)
        return res.status(500).json({ error: 'Error processing photo' })
      }
    })
  },

  finalizeExam: async(req, res) => {
    try {
      const { studentExamId } = req.params

      // get the student exam with course exam data (for pass_grade)
      const studentExam = await db.Students_exams.findByPk(studentExamId, {
        include: [
          { model: db.Courses_exams, as: 'course_exam_data' }
        ]
      })

      if (!studentExam) {
        return res.status(404).json({ error: 'Exam not found' })
      }

      // get all answers for this exam
      const answers = await db.Students_exams_answers.findAll({
        where: { id_students_exams: studentExamId }
      })

      const totalAnswers = answers.length
      const correctAnswers = answers.filter(a => a.correct_answer === 1).length

      // calculate grade as ratio (0 to 1), truncate to 3 decimals to avoid rounding issues
      const gradeRatio = totalAnswers > 0 ? Math.floor((correctAnswers / totalAnswers) * 1000) / 1000 : 0
      const passGrade = parseFloat(studentExam.course_exam_data.pass_grade)
      const passed = gradeRatio >= passGrade

      const today = new Date().toISOString().split('T')[0]
      const examStatus = passed ? 'passed' : 'not-passed'
      const examGrade = gradeRatio

      // update students_exams
      await db.Students_exams.update(
        { exam_status: examStatus, exam_grade: examGrade, updated_at: today },
        { where: { id: studentExamId } }
      )

      // update students_inscriptions status based on all exams
      const allExams = await db.Students_exams.findAll({
        where: { id_students_inscriptions: studentExam.id_students_inscriptions }
      })

      let inscriptionStatus = 'pending'
      const allPassed = allExams.every(e => e.exam_status === 'passed')
      const anyFailed = allExams.some(e => e.exam_status === 'not-passed')
      const allPending = allExams.every(e => e.exam_status === 'pending')

      if (allPassed) {
        inscriptionStatus = 'passed'
      } else if (anyFailed) {
        inscriptionStatus = 'not-passed'
      } else if (allPending) {
        inscriptionStatus = 'pending'
      } else {
        inscriptionStatus = 'in-progress'
      }

      // calculate inscription grade: average of exams that have a grade
      const examsWithGrade = allExams.filter(e => e.exam_grade != null)
      const inscriptionGrade = examsWithGrade.length > 0
        ? Math.floor((examsWithGrade.reduce((sum, e) => sum + parseFloat(e.exam_grade), 0) / examsWithGrade.length) * 1000) / 1000
        : null

      await db.Students_inscriptions.update(
        { status: inscriptionStatus, grade: inscriptionGrade, updated_at: today },
        { where: { id: studentExam.id_students_inscriptions } }
      )

      // generate certificate if inscription passed
      let certificateFile = null
      if (inscriptionStatus === 'passed') {
        try {
          certificateFile = await generateCertificate(studentExam.id_students_inscriptions)
        } catch (certError) {
          console.log('Error generating certificate:', certError)
        }
      }

      return res.json({
        passed,
        examStatus,
        examGrade,
        correctAnswers,
        totalAnswers,
        passGrade
      })
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error finalizing exam' })
    }
  },

  previewExam: async(req, res) => {
    try {
      const { studentExamId } = req.params
      const { answers } = req.body // array of { answerId, idsSelectedOptions }

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Answers are required' })
      }

      // get the student exam with course exam data (for pass_grade)
      const studentExam = await db.Students_exams.findByPk(studentExamId, {
        include: [
          { model: db.Courses_exams, as: 'course_exam_data' }
        ]
      })

      if (!studentExam) {
        return res.status(404).json({ error: 'Exam not found' })
      }

      // get all answer records to compare correct options
      const answerRecords = await db.Students_exams_answers.findAll({
        where: { id_students_exams: studentExamId }
      })

      const totalAnswers = answerRecords.length
      let correctAnswers = 0

      for (const submitted of answers) {
        const record = answerRecords.find(r => r.id == submitted.answerId)
        if (!record) continue

        const selectedSet = submitted.idsSelectedOptions.split(',').sort().join(',')
        const correctSet = record.ids_correct_options.split(',').sort().join(',')
        if (selectedSet === correctSet) correctAnswers++
      }

      const gradeRatio = totalAnswers > 0 ? Math.floor((correctAnswers / totalAnswers) * 1000) / 1000 : 0
      const passGrade = parseFloat(studentExam.course_exam_data.pass_grade)
      const passed = gradeRatio >= passGrade

      return res.json({ passed, correctAnswers, totalAnswers })
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error previewing exam' })
    }
  },

  testCertificate: async(req, res) => {
    try {
      const { inscriptionId } = req.params
      const fileName = await generateCertificate(parseInt(inscriptionId), true)
      if (fileName) {
        return res.json({ success: true, fileName })
      } else {
        return res.json({ success: false, message: 'Certificate not generated (check template exists for this course)' })
      }
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error generating test certificate', details: error.message })
    }
  }
}

module.exports = composedController

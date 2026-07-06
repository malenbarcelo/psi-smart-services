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

  getPracticalExams: async(req, res) => {
    try {
      const filters = req.query
      const { Op } = db.Sequelize

      // build where for students_inscriptions
      const inscriptionWhere = { enabled: 1 }

      // build student filter
      let studentWhere = {}
      if (filters.search) {
        const searchValue = filters.search
        studentWhere[Op.or] = [
          db.sequelize.where(
            db.sequelize.fn('CONCAT', db.sequelize.col('student_data.first_name'), ' ', db.sequelize.col('student_data.last_name')),
            { [Op.like]: `%${searchValue}%` }
          ),
          db.sequelize.where(
            db.sequelize.fn('CONCAT', db.sequelize.col('student_data.last_name'), ' ', db.sequelize.col('student_data.first_name')),
            { [Op.like]: `%${searchValue}%` }
          )
        ]
      }
      if (filters.dni) {
        studentWhere.dni = db.sequelize.where(
          db.sequelize.cast(db.sequelize.col('student_data.dni'), 'CHAR'),
          { [Op.like]: `%${filters.dni}%` }
        )
      }

      // course filter
      if (filters.id_courses) {
        inscriptionWhere.id_courses = filters.id_courses
      }

      // company filter
      let companyWhere = {}
      if (filters.company) {
        companyWhere.company_name = { [Op.like]: `%${filters.company}%` }
      }

      const hasStudentFilter = Object.keys(studentWhere).length > 0 || Object.getOwnPropertySymbols(studentWhere).length > 0
      const hasCompanyFilter = Object.keys(companyWhere).length > 0

      // build order
      const allowedSortFields = ['id', 'student_name', 'course', 'company']
      let order = [['id', 'DESC']]
      if (filters.sortBy && allowedSortFields.includes(filters.sortBy)) {
        const direction = filters.sortOrder === 'DESC' ? 'DESC' : 'ASC'
        if (filters.sortBy === 'student_name') {
          order = [[{ model: db.Students, as: 'student_data' }, 'last_name', direction]]
        } else if (filters.sortBy === 'course') {
          order = [[{ model: db.Courses, as: 'course_data' }, 'course_name', direction]]
        } else if (filters.sortBy === 'company') {
          order = [[{ model: db.Users_companies, as: 'company_data' }, 'company_name', direction]]
        } else {
          order = [[filters.sortBy, direction]]
        }
      }

      // find inscriptions that have at least one practical exam not passed
      // First get the IDs, then load full data
      const inscriptionIds = await db.Students_inscriptions.findAll({
        where: inscriptionWhere,
        attributes: ['id'],
        include: [
          { model: db.Students, as: 'student_data', attributes: [], where: hasStudentFilter ? studentWhere : undefined, required: hasStudentFilter },
          { model: db.Users_companies, as: 'company_data', attributes: [], where: hasCompanyFilter ? companyWhere : undefined, required: hasCompanyFilter },
          {
            model: db.Students_exams,
            as: 'exams',
            attributes: [],
            where: { exam_type: 'practical', exam_status: { [Op.ne]: 'passed' } },
            required: true
          }
        ],
        subQuery: false,
        raw: true
      })

      const ids = inscriptionIds.map(r => r.id)

      const inscriptions = await db.Students_inscriptions.findAll({
        where: { id: ids },
        include: [
          { model: db.Students, as: 'student_data' },
          { model: db.Users_companies, as: 'company_data' },
          { model: db.Courses, as: 'course_data' },
          { model: db.Students_exams, as: 'exams' }
        ],
        order,
        subQuery: false,
        limit: filters.limit ? parseInt(filters.limit) : undefined,
        offset: filters.offset ? parseInt(filters.offset) : undefined
      })

      // calculate theorical and practical status for each inscription
      const rows = inscriptions.map(insc => {
        const allExams = insc.exams || []
        const theoricals = allExams.filter(e => e.exam_type === 'theorical')
        const practicals = allExams.filter(e => e.exam_type === 'practical')

        let theoricalStatus = 'pending'
        if (theoricals.length > 0) {
          const allPassed = theoricals.every(e => e.exam_status === 'passed')
          const anyFailed = theoricals.some(e => e.exam_status === 'not-passed')
          const anyStarted = theoricals.some(e => e.exam_status !== 'pending')
          if (allPassed) theoricalStatus = 'passed'
          else if (anyFailed) theoricalStatus = 'not-passed'
          else if (anyStarted) theoricalStatus = 'in-progress'
        }

        let practicalStatus = 'pending'
        if (practicals.length > 0) {
          const allPassed = practicals.every(e => e.exam_status === 'passed')
          const anyFailed = practicals.some(e => e.exam_status === 'not-passed')
          const anyStarted = practicals.some(e => e.exam_status !== 'pending')
          if (allPassed) practicalStatus = 'passed'
          else if (anyFailed) practicalStatus = 'not-passed'
          else if (anyStarted) practicalStatus = 'in-progress'
        }

        return {
          ...insc.toJSON(),
          theoricalStatus,
          practicalStatus
        }
      })

      // filter by theorical status if requested
      const filteredRows = filters.theoricalStatus
        ? rows.filter(r => r.theoricalStatus === filters.theoricalStatus)
        : rows

      return res.json({ rows: filteredRows, count: filteredRows.length })
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting practical exams' })
    }
  },

  getCourses: async(req, res) => {
    try {
      const filters = {}
      const pagination = {}
      const sort = {}

      if (req.query.search) filters.search = req.query.search
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

      const courses = await coursesQueries.get({ filters, pagination, sort })

      // check which courses have templates configured
      const courseIds = courses.rows.map(c => c.id)
      const certificateTemplates = await db.Templates_certificates.findAll({
        where: { id_courses: courseIds },
        attributes: ['id_courses'],
        raw: true
      })
      const credentialTemplates = await db.Templates_credentials.findAll({
        where: { id_courses: courseIds },
        attributes: ['id_courses'],
        raw: true
      })

      const certCourseIds = new Set(certificateTemplates.map(t => t.id_courses))
      const credCourseIds = new Set(credentialTemplates.map(t => t.id_courses))

      const rows = courses.rows.map(c => {
        const course = c.toJSON ? c.toJSON() : c
        course.hasCertificateTemplate = certCourseIds.has(course.id)
        course.hasCredentialTemplate = credCourseIds.has(course.id)
        return course
      })

      return res.json({ rows, count: courses.count })
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting courses' })
    }
  },

  getTemplatesImages: async(req, res) => {
    try {
      const imagesDir = require('path').join(__dirname, '../../../public/images/templatesImages')
      const fs = require('fs')
      const files = fs.readdirSync(imagesDir).filter(f => {
        const ext = f.toLowerCase().split('.').pop()
        return ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)
      })
      return res.json(files)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting template images' })
    }
  },

  getCertificateTemplate: async(req, res) => {
    try {
      const { courseId } = req.params
      const template = await db.Templates_certificates.findOne({
        where: { id_courses: courseId }
      })
      return res.json(template || null)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting certificate template' })
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
      const studentPhoto = students[0].photo || null

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
        return res.json({ code: 'NO_PENDING', studentName, studentPhoto, inscriptions: [] })
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
      return res.json({ code: 'HAS_PENDING', studentName, studentPhoto, inscriptions: results })
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error searching exams' })
    }
  },

  getExamsByInscription: async(req, res) => {
    try {
      const { inscriptionId } = req.params

      const exams = await db.Students_exams.findAll({
        where: { id_students_inscriptions: inscriptionId },
        include: [
          { model: db.Courses_exams, as: 'course_exam_data', attributes: ['exam_name'] }
        ],
        order: [['exam_index', 'ASC']]
      })

      const result = exams.map(e => ({
        id: e.id,
        exam_name: e.course_exam_data?.exam_name || '',
        exam_type: e.exam_type,
        exam_index: e.exam_index,
        exam_status: e.exam_status,
        exam_grade: e.exam_grade
      }))

      return res.json(result)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting exams by inscription' })
    }
  },

  getExamQuestions: async(req, res) => {
    try {
      const studentExamId = req.params.studentExamId

      // get the student exam record with course exam data
      const studentExam = await db.Students_exams.findByPk(studentExamId, {
        include: [
          { model: db.Courses_exams, as: 'course_exam_data' },
          { model: db.Courses, as: 'course_data' }
        ]
      })
      if (!studentExam) {
        return res.status(404).json({ error: 'Exam not found' })
      }

      // get all answers for this exam (ordered by question number)
      const answers = await db.Students_exams_answers.findAll({
        where: { id_students_exams: studentExamId },
        include: [
          {
            model: db.Courses_exams_questions,
            as: 'question_data',
            include: [
              { model: db.Courses_exams_questions_types, as: 'question_type_data' },
              { model: db.Courses_exams_questions_options, as: 'options' }
            ]
          }
        ],
        order: [[{ model: db.Courses_exams_questions, as: 'question_data' }, 'question_number', 'ASC']]
      })

      // build response
      const questions = answers.map(answer => ({
        answerId: answer.id,
        questionNumber: answer.question_data.question_number,
        question: answer.question_data.question,
        image: answer.question_data.image,
        inputType: answer.question_data.question_type_data.icon,
        idsSelectedOptions: answer.ids_selected_options,
        options: answer.question_data.options.map(opt => ({
          id: opt.id,
          optionReference: opt.option_reference,
          optionText: opt.option_text
        }))
      }))

      // get existing observations if any
      const observation = await db.Students_inscriptions_observations.findOne({
        where: { id_students_exams: studentExamId }
      })

      return res.json({
        studentExamId: studentExam.id,
        studentInscriptionId: studentExam.id_students_inscriptions,
        examStatus: studentExam.exam_status,
        courseName: studentExam.course_data?.course_name || '',
        examName: studentExam.course_exam_data?.exam_name || '',
        examVersion: studentExam.exam_version,
        examVariant: studentExam.exam_variant,
        totalQuestions: questions.length,
        observations: observation?.observations || '',
        questions
      })
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error getting exam questions' })
    }
  },
}

module.exports = getController

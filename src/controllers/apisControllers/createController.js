const usersQueries = require('../../dbQueries/usersQueries')
const studentsQueries = require('../../dbQueries/studentsQueries')
const bcrypt = require('bcryptjs')
const db = require('../../../database/models')

// generate random password (10 chars: letters, numbers, special characters)
function generatePassword() {
  const letters = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
  const numbers = '23456789'
  const specials = '!@#$%&*'
  const all = letters + numbers + specials

  // ensure at least one of each type
  let password = ''
  password += letters[Math.floor(Math.random() * letters.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += specials[Math.floor(Math.random() * specials.length)]

  for (let i = 3; i < 10; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  // shuffle
  password = password.split('').sort(() => Math.random() - 0.5).join('')
  return password
}

const createController = {
  createUser: async(req, res) => {
    try {
      const { first_name, last_name, email, id_users_categories, id_companies } = req.body

      // check required fields
      if (!first_name || !last_name || !email || !id_users_categories || !id_companies) {
        return res.status(400).json({ error: 'All fields are required' })
      }

      // check if email already exists
      const existing = await usersQueries.get({ filters: { emailExact: email } })
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists', field: 'email' })
      }

      // generate and hash password
      const plainPassword = generatePassword()
      const hashedPassword = await bcrypt.hash(plainPassword, 10)

      const newUser = await usersQueries.create({
        first_name,
        last_name,
        email,
        id_users_categories: parseInt(id_users_categories),
        id_companies: parseInt(id_companies),
        password: hashedPassword,
        enabled: 1
      })

      return res.status(201).json(newUser)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error creating user' })
    }
  },

  createCompany: async(req, res) => {
    try {
      const { company_name } = req.body

      if (!company_name || !company_name.trim()) {
        return res.status(400).json({ error: 'Company name is required' })
      }

      // normalize: remove accents, lowercase, collapse spaces
      function normalize(str) {
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim()
      }

      const normalizedInput = normalize(company_name)

      // get all companies and check if name already exists (accent/case/space insensitive)
      const allCompanies = await db.Users_companies.findAll()
      const exists = allCompanies.some(comp => normalize(comp.company_name) === normalizedInput)

      if (exists) {
        return res.status(400).json({ error: 'Company already exists', field: 'company_name' })
      }

      const newCompany = await db.Users_companies.create({
        company_name: company_name.trim(),
        enabled: 1
      })

      return res.status(201).json(newCompany)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error creating company' })
    }
  },

  createStudent: async(req, res) => {
    try {
      const userLogged = req.session.userLogged
      let { first_name, last_name, email, dni, id_companies } = req.body

      // cat 3 forces their own company
      if (userLogged.id_users_categories == 3) {
        id_companies = userLogged.id_companies
      }

      if (!first_name || !last_name || !email || !dni || !id_companies) {
        return res.status(400).json({ error: 'All fields are required' })
      }

      // check if DNI already exists
      const existing = await studentsQueries.get({ filters: { dni } })
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'DNI already exists', field: 'dni' })
      }

      const newStudent = await studentsQueries.create({
        first_name,
        last_name,
        email,
        dni: parseInt(dni),
        id_companies: parseInt(id_companies),
        enabled: 1
      })

      return res.status(201).json(newStudent)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error creating student' })
    }
  },

  createCourse: async(req, res) => {
    try {
      const { course_name, validity_months, has_theorical, has_practical, has_certificate, has_credential } = req.body

      if (!course_name) {
        return res.status(400).json({ error: 'Course name is required' })
      }

      const newCourse = await db.Courses.create({
        course_name,
        validity_months: validity_months || null,
        has_theorical: has_theorical || 0,
        has_practical: has_practical || 0,
        has_certificate: has_certificate || 0,
        has_credential: has_credential || 0,
        enabled: 1
      })

      return res.status(201).json(newCourse)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error creating course' })
    }
  },

  createCertificateTemplate: async(req, res) => {
    try {
      const { id_courses, id_templates_cetificates, header_logo, footer_logo, signature_1, signature_2, course_name_in_certificate, certificate_normatives, text_1, text_2, student_photo } = req.body

      if (!id_courses || !id_templates_cetificates || !signature_1 || !course_name_in_certificate || !certificate_normatives) {
        return res.status(400).json({ error: 'Required fields missing' })
      }

      const newTemplate = await db.Templates_certificates.create({
        id_courses: parseInt(id_courses),
        id_templates_cetificates: parseInt(id_templates_cetificates),
        header_logo: header_logo || null,
        footer_logo: footer_logo || null,
        signature_1,
        signature_2: signature_2 || null,
        course_name_in_certificate,
        certificate_normatives,
        text_1: text_1 || null,
        text_2: text_2 || null,
        student_photo: student_photo || 0
      })

      return res.status(201).json(newTemplate)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error creating certificate template' })
    }
  },

  createInscription: async(req, res) => {
    try {
      const { id_companies, id_courses, dni, first_name, last_name, email } = req.body

      if (!id_companies || !id_courses || !dni || !first_name || !last_name || !email) {
        return res.status(400).json({ error: 'All fields are required' })
      }

      // find or create student by DNI + company
      let student
      const existing = await studentsQueries.get({ filters: { dni, id_companies } })

      if (existing.rows.length > 0) {
        student = existing.rows[0]
      } else {
        student = await studentsQueries.create({
          first_name,
          last_name,
          email,
          dni: parseInt(dni),
          id_companies: parseInt(id_companies),
          enabled: 1
        })
      }

      // create inscription
      const today = new Date().toISOString().split('T')[0]
      const newInscription = await db.Students_inscriptions.create({
        id_companies: parseInt(id_companies),
        id_students: student.id,
        id_courses: parseInt(id_courses),
        inscription_date: today,
        status: 'pending',
        grade: null,
        updated_at: null,
        enabled: 1
      })

      // create student exams for each course exam
      const courseExams = await db.Courses_exams.findAll({
        where: { id_courses: parseInt(id_courses), enabled: 1 }
      })

      for (const exam of courseExams) {
        // get max exam_version for this course exam
        const maxVersion = await db.Courses_exams_questions.max('exam_version', {
          where: { id_courses_exams: exam.id }
        })

        // get unique variants for this course exam (at max version)
        const variantRecords = await db.Courses_exams_questions.findAll({
          where: { id_courses_exams: exam.id, exam_version: maxVersion || 1 },
          attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('exam_variant')), 'exam_variant']],
          raw: true
        })

        const variants = variantRecords.map(r => r.exam_variant)
        const randomVariant = variants.length > 0
          ? variants[Math.floor(Math.random() * variants.length)]
          : 'A'

        const newStudentExam = await db.Students_exams.create({
          id_students: student.id,
          id_students_inscriptions: newInscription.id,
          id_courses: parseInt(id_courses),
          id_courses_exams: exam.id,
          exam_type: exam.exam_type,
          exam_index: exam.exam_index,
          exam_version: maxVersion || 1,
          exam_variant: randomVariant,
          exam_status: 'pending',
          exam_grade: null,
          updated_at: null
        })

        // get questions for this exam at the assigned version and variant
        const questions = await db.Courses_exams_questions.findAll({
          where: {
            id_courses_exams: exam.id,
            exam_version: maxVersion || 1,
            exam_variant: randomVariant
          }
        })

        // create answer records for each question
        for (const question of questions) {
          // get correct option ids for this question
          const correctOptions = await db.Courses_exams_questions_options.findAll({
            where: {
              id_courses_exams_questions: question.id,
              correct_option: 1
            },
            attributes: ['id'],
            raw: true
          })

          const idsCorrectOptions = correctOptions.map(o => o.id).join(',')

          await db.Students_exams_answers.create({
            id_students: student.id,
            id_students_inscriptions: newInscription.id,
            id_students_exams: newStudentExam.id,
            id_courses_exams: exam.id,
            id_courses_exams_questions: question.id,
            ids_selected_options: null,
            ids_correct_options: idsCorrectOptions,
            correct_answer: null,
            updated_at: null
          })
        }
      }

      return res.status(201).json(newInscription)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error creating inscription' })
    }
  },

  createObservation: async(req, res) => {
    try {
      const { id_students_inscriptions, id_students_exams, observations } = req.body

      if (!id_students_inscriptions || !id_students_exams) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // get id_students from the inscription
      const inscription = await db.Students_inscriptions.findByPk(id_students_inscriptions)
      if (!inscription) {
        return res.status(404).json({ error: 'Inscription not found' })
      }

      // check if observation already exists for this exam
      const existing = await db.Students_inscriptions_observations.findOne({
        where: { id_students_exams }
      })

      if (existing) {
        await db.Students_inscriptions_observations.update(
          { observations },
          { where: { id: existing.id } }
        )
        return res.json({ success: true, updated: true })
      }

      await db.Students_inscriptions_observations.create({
        id_students: inscription.id_students,
        id_students_inscriptions: parseInt(id_students_inscriptions),
        id_students_exams: parseInt(id_students_exams),
        observations: observations || null
      })

      return res.status(201).json({ success: true })
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error creating observation' })
    }
  }
}

module.exports = createController

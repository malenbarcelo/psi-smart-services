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
  }
}

module.exports = createController

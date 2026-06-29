const usersQueries = require('../../dbQueries/usersQueries')
const studentsQueries = require('../../dbQueries/studentsQueries')

const updateController = {
  toggleUserEnabled: async(req, res) => {
    try {
      const user = await usersQueries.getById(req.params.id)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      const newEnabled = user.enabled ? 0 : 1
      await usersQueries.update(req.params.id, { enabled: newEnabled })
      return res.json({ success: true, enabled: newEnabled })
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error updating user' })
    }
  },

  updateUser: async(req, res) => {
    try {
      const { first_name, last_name, email, id_users_categories, id_companies } = req.body

      if (!first_name || !last_name || !email || !id_users_categories || !id_companies) {
        return res.status(400).json({ error: 'All fields are required' })
      }

      const user = await usersQueries.getById(req.params.id)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // check if email is taken by another user
      if (email !== user.email) {
        const existing = await usersQueries.get({ filters: { emailExact: email } })
        if (existing.rows.length > 0) {
          return res.status(400).json({ error: 'Email already exists', field: 'email' })
        }
      }

      const updated = await usersQueries.update(req.params.id, {
        first_name,
        last_name,
        email,
        id_users_categories: parseInt(id_users_categories),
        id_companies: parseInt(id_companies)
      })

      return res.json(updated)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error updating user' })
    }
  },

  updateStudent: async(req, res) => {
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

      const student = await studentsQueries.getById(req.params.id)
      if (!student) {
        return res.status(404).json({ error: 'Student not found' })
      }

      // cat 3 can only edit students from their company
      if (userLogged.id_users_categories == 3 && student.id_companies != userLogged.id_companies) {
        return res.status(404).json({ error: 'Student not found' })
      }

      // check if DNI is taken by another student
      const parsedDni = parseInt(dni)
      if (parsedDni != student.dni) {
        const existing = await studentsQueries.get({ filters: { dni: parsedDni } })
        if (existing.rows.length > 0) {
          return res.status(400).json({ error: 'DNI already exists', field: 'dni' })
        }
      }

      const updated = await studentsQueries.update(req.params.id, {
        first_name,
        last_name,
        email,
        dni: parsedDni,
        id_companies: parseInt(id_companies)
      })

      return res.json(updated)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error updating student' })
    }
  },

  toggleStudentEnabled: async(req, res) => {
    try {
      const userLogged = req.session.userLogged
      const student = await studentsQueries.getById(req.params.id)
      if (!student) {
        return res.status(404).json({ error: 'Student not found' })
      }

      // cat 3 can only toggle students from their company
      if (userLogged.id_users_categories == 3 && student.id_companies != userLogged.id_companies) {
        return res.status(404).json({ error: 'Student not found' })
      }

      const newEnabled = student.enabled ? 0 : 1
      await studentsQueries.update(req.params.id, { enabled: newEnabled })
      return res.json({ success: true, enabled: newEnabled })
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Error updating student' })
    }
  },
}

module.exports = updateController

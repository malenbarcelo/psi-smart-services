function getDevSession(req) {
  const url = req.get('host')
  // get session for dev
  if (url.includes('localhost:') && !req.session.userLogged) {
    req.session.userLogged = {
      first_name: 'Juan',
      last_name: 'Perez',
      user_name: 'mbarcelo',
      id_users_categories: 1
    }
  }
}

module.exports = { getDevSession }

// route middleware
function authMiddleware(req, res, next) {
  const host = req.get('host')
  const isDev = host && host.includes('localhost:')

  // in dev, auto-assign session if not logged
  if (isDev && !req.session.userLogged) {
    req.session.userLogged = {
      first_name: 'Malén',
      last_name: 'Barceló',
      email: 'mbarcelo@psi.com',
      id_users_categories: 1
    }
  }

  // in production, redirect to login if not logged
  if (!isDev && !req.session.userLogged) {
    return res.redirect('/')
  }

  return next()
}

module.exports = authMiddleware

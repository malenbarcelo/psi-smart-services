// middleware to restrict access to routes based on user category
// if user doesn't have access, destroy session and redirect to login

// define which categories can access each route
const routePermissions = {
  '/usuarios': [1, 2, 4],
}

function routeAccessMiddleware(req, res, next) {
  const userLogged = req.session.userLogged

  // if not logged in, redirect to login
  if (!userLogged) {
    return res.redirect('/')
  }

  const allowedCategories = routePermissions[req.path]

  // if route has no restrictions defined, allow access
  if (!allowedCategories) {
    return next()
  }

  // if user category is not in allowed list, destroy session and redirect to login
  if (!allowedCategories.includes(userLogged.id_users_categories)) {
    req.session.destroy()
    return res.redirect('/')
  }

  return next()
}

module.exports = routeAccessMiddleware

// app middleware
function userLoggedMiddleware(req, res, next) {
  if (req.session.userLogged) {
    res.locals.isLogged = true
    res.locals.userLogged = req.session.userLogged
  }
  return next()
}

module.exports = userLoggedMiddleware

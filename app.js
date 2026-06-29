const express = require('express')
const path = require('path')
const publicPath = path.join(__dirname, 'public')
const session = require('express-session')
const userLoggedMiddleware = require('./src/middlewares/userLoggedMiddleware.js')

// routes
const appRoutes = require('./src/routes/appRoutes.js')
const apisRoutes = require('./src/routes/apisRoutes.js')

const app = express()

app.set('trust proxy', 1) // if Cloudflare/NGINX

// disable cache
app.disable('etag')
app.set('view cache', false)

// global anti-cache middleware
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  res.set('Vary', 'Cookie')
  next()
})

// use public as static without cache
app.use(express.static(publicPath, {
  etag: false,
  lastModified: false,
  cacheControl: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')
  }
}))

// get forms info as objects
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// set views folder in src/views
app.set('views', path.join(__dirname, 'src/views'))

// set templates extension (ejs)
app.set('view engine', 'ejs')

// configure session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
}))

// middlewares
app.use(userLoggedMiddleware)

// declare and listen port
const APP_PORT = process.env.PORT || 3016
app.listen(APP_PORT, () => console.log("Server running on port " + APP_PORT))

// routes
app.use('/', appRoutes)
app.use('/api', apisRoutes)

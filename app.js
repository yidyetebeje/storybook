const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDB  = require('./config/db')
const {engine} = require("express-handlebars")
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const morgan = require('morgan')
const methodOverride = require('method-override')

// Load config
dotenv.config({path: './config/config.env'})
//passport config.env
require('./config/passport')(passport)
//connect to db
connectDB()

const app = express()
//body parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())
//Method overriders
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}
//handlebar helpers
const {formatDate, truncate, stripTags,editIcon, select} = require('./helpers/hbs')
//handlebars config
app.engine('.hbs', engine({helpers:{
  formatDate, truncate, stripTags, editIcon, select
},defaultLayout:'main',extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');
//sessions
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI
    })
  })
  )
//passport middleware
app.use(passport.initialize())
app.use(passport.session())
//set Global variable
app.use(function(req,res,next){
  res.locals.user = req.user || null
  next()
})
//static folders
app.use(express.static(path.join(__dirname, 'public')))
//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))
const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`))


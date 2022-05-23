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

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}
//handlebar helpers
const {formatDate} = require('./helpers/hbs')
//handlebars config
app.engine('.hbs', engine({helpers:{
  formatDate
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
//static folders
app.use(express.static(path.join(__dirname, 'public')))
//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))
const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`))


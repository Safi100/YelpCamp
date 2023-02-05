if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const express = require('express')
const path = require('path')
const morgan = require('morgan')
const methodOverRide = require('method-override')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')

const userRoutes = require('./routes/user')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

mongoose.set('strictQuery', false)
mongoose.connect('mongodb://localhost:27017/YelpCamp', {
    useNewUrlParser: true,  
    useUnifiedTopology: true,
    family:4
})
.then(()=> console.log("db connected"))
.catch((err)=> console.log(err))

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(morgan('dev'))
app.use(express.urlencoded({extended: true}))
app.use(methodOverRide('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
  );

const sessionConfig = {
    name: 'session',
    secret: 'thisShouldBeAbetterSecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}


app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    if(!['/login','/register','/logout','/','/favicon.ico'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl
    }
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res)=> {
    res.render("home")
})

app.all('*', (req, res, next)=>{
    next(new ExpressError('Page Not Found', 404))
})
app.use((err, req, res, next) => {
    if(!err.message) err.message = 'Something went wrong!'
    const {statusCode = 500 } = err
    res.status(statusCode).render('error', { err })
})
app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})
const express = require('express')
const path = require('path')
const morgan = require('morgan')
const methodOverRide = require('method-override')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const ExpressError = require('./utils/ExpressError')
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

mongoose.connect('mongodb://localhost:27017/yelp-camp')
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

const sessionConfig = {
    secret: 'thisShouldBeAbetterSecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}
app.use(session(sessionConfig))

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

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
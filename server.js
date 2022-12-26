const express = require('express')
const path = require('path')
const morgan = require('morgan')
const methodOverRide = require('method-override')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const {campgroundSchema, reviewSchema} = require('./schemas.js')
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
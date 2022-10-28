const express = require('express')
const path = require('path')
const morgan = require('morgan')
const methodOverRide = require('method-override')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const joi = require('joi')
const Campground = require('./models/campground')

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

app.get('/', (req, res)=> {
    res.render("home")
})
app.get('/campgrounds', catchAsync(async (req, res)=> {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", {campgrounds})
}))
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})
app.get('/campgrounds/:id', catchAsync(async (req, res)=> {
    const id = req.params.id
    const campground = await Campground.findById(id)
    res.render('campgrounds/show', {campground})
}))
app.get('/campgrounds/:id/edit', catchAsync(async (req, res)=> {
    const id = req.params.id
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', {campground})
}))
app.put('/campgrounds/:id', catchAsync(async (req, res)=> {
    const id = req.params.id
    console.log(id);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))
app.post('/campgrounds', catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campgroundSchema = joi.object({
        campground: joi.object({
            title: joi.string().required(),
            price: joi.number().required().min(0),
            image: joi.string().required(),
            location: joi.string().required(),
            description: joi.string().required()
        }).required()
    })
    const { error } = campgroundSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const id = req.params.id
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))
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
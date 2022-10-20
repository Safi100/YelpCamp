const express = require('express')
const path = require('path')
const morgan = require('morgan')
const methodOverRide = require('method-override')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
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
app.get('/campgrounds', async (req, res)=> {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", {campgrounds})
})
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})
app.get('/campgrounds/:id', async (req, res)=> {
    const id = req.params.id
    const campground = await Campground.findById(id)
    res.render('campgrounds/show', {campground})
})
app.get('/campgrounds/:id/edit', async (req, res)=> {
    const id = req.params.id
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', {campground})
})
app.put('/campgrounds/:id', async (req, res)=> {
    const id = req.params.id
    console.log(id);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
})
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
})
app.delete('/campgrounds/:id', async (req, res) => {
    const id = req.params.id
    console.log(id);
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})
app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})
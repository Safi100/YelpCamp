const express = require('express')
const path = require('path')
const morgan = require('morgan')
const mongoose = require('mongoose')
const Campground = require('./models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=> console.log("db connected"))
.catch((err)=> console.log(err))

const app = express()

app.use(morgan('dev'))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res)=> {
    res.render("home")
})
app.get('/campgrounds', async (req, res)=> {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", {campgrounds})
})
app.get('/makecampground', async (req, res)=> {
    const camp = new Campground({title:"My backyard", price:200, description:'lorem ipsum dolor nooooob', location:"Palestine/Ramallah/AL-Tirah"})
    await camp.save()
    res.send(camp)
})
app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})
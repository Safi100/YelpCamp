const express = require('express')
const Router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const {campgroundSchema} = require('../schemas.js')

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next()
    }
}

Router.get('/', catchAsync(async (req, res)=> {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", {campgrounds})
}))
Router.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})
Router.get('/:id', catchAsync(async (req, res)=> {
    const id = req.params.id
    const campground = await Campground.findById(id).populate('reviews')
    res.render('campgrounds/show', {campground})
}))
Router.get('/:id/edit', catchAsync(async (req, res)=> {
    const id = req.params.id
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', {campground})
}))
Router.put('/:id', validateCampground, catchAsync(async (req, res)=> {
    const id = req.params.id
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))
Router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))
Router.delete('/:id', catchAsync(async (req, res) => {
    const id = req.params.id
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))


module.exports = Router
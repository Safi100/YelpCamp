const express = require('express')
const Router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const {campgroundSchema} = require('../schemas.js')
const {isLoggedIn} = require('../middleware')
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
Router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})
Router.get('/:id', catchAsync(async (req, res)=> {
    const id = req.params.id
    const campground = await Campground.findById(id).populate('reviews')
    if(!campground){
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground})
}))
Router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res)=> {
    const id = req.params.id
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
}))
Router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res)=> {
    const id = req.params.id
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))
Router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))
Router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const id = req.params.id
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}))


module.exports = Router
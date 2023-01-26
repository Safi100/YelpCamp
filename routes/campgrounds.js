const express = require('express')
const Router = express.Router({ mergeParams: true })
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')

Router.get('/', catchAsync(campgrounds.index))
Router.get('/new', isLoggedIn, campgrounds.renderNewForm)
Router.get('/:id', catchAsync(campgrounds.showCampground))
Router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
Router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
Router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))
Router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = Router 
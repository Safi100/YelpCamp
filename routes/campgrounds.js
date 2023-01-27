const express = require('express')
const Router = express.Router({ mergeParams: true })
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})

Router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

    Router.get('/new', isLoggedIn, campgrounds.renderNewForm)

Router.route('/:id') 
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

Router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = Router 
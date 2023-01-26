const express = require('express')
const Router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAsync')
const reviews = require('../controllers/reviews')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

Router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))
Router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = Router
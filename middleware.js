const Campground = require("./models/campground")
const Review = require("./models/review")
const User = require("./models/user")

const { campgroundSchema, reviewSchema } = require("./schemas")
const ExpressError = require("./utils/ExpressError")

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!')
        return res.redirect('/login')
    }
    next()
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next()
    }
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next()
    }
}

module.exports.checkReturnTo = (req, res, next) => {
    if(req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo
    }
    next()
}

module.exports.isAuthor = async (req, res, next) => {
    const id = req.params.id
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    if(!campground.author.equals(req.user._id)){
        req.flash('error', "You don't have permission to do that!")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}
module.exports.isAccountOwner = async(req, res, next) => {
    const id = req.params.id
    const user = await User.findById(id)
    if(!user){
        req.flash('error', 'Cannot find that user!')
        return res.redirect('/campgrounds')
    }
    if(!user._id.equals(req.user._id)){
        req.flash('error', "You don't have permission to do that!")
        return res.redirect(`/campgrounds`)
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewId} = req.params
    const review = await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)){
        req.flash('error', "You don't have permission to do that!")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}
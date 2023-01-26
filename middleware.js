const Campground = require("./models/campground")

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!')
        return res.redirect('/login')
    }
    next()
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
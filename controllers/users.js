const User = require('../models/user')
const Campground = require('../models/campground')
const Review = require('../models/review')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}
module.exports.register = async (req, res, next) => {
    try{
        const {email, username, password} = req.body
        const user = new User({email, username})
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if(err) return next(err)
            res.redirect('/campgrounds')
        })
    }catch(e){
        req.flash('error', e.message)
        res.redirect('/register')
    }
}
module.exports.renderLogin = (req, res) => {
    res.render("users/login")
}
module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!')
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
}
module.exports.renderProfile = async (req, res) => {
    const id = req.params.id
    const user = await User.findById(id)
    if(!user){
        req.flash('error', 'Cannot find that user!')
        return res.redirect('/campgrounds')
    }
    const campgrounds = await Campground.find({author: {$in: id}})
    const reviews = await Review.find({author: {$in: id}})
    res.render('users/profile', {user, campgrounds, reviews})
}
module.exports.logout = (req, res, next) => {
    if(req.user){
        req.logout(req.user, err => {
            if(err) return next(err)
            req.flash('success', "Goodbye!")
            res.redirect('/campgrounds')
        })
    }else{
        req.flash('error', 'You must be logged in before logout!')
        res.redirect('/login')
    }
}
module.exports.deleteAccount = async (req, res) => {
    const id = req.params.id
    const user = await User.findByIdAndDelete(id)
    const reviews = await Review.find({author: {$in: user._id}})
    reviews.forEach(async (review) => {
        await Campground.updateOne({$pull: {reviews: { $in: review._id} } } )
        await Review.deleteOne({_id: review._id})
    })
    const campgrounds = await Campground.find({author: {$in: user._id}})
    campgrounds.forEach(async (camp) => {
        console.log(camp.reviews)
        await Review.deleteMany({_id: { $in: camp.reviews }})
    })
    await Campground.deleteMany({author: {$in: user._id}})

    req.flash('success', 'Successfully deleted account!')
    res.redirect('/campgrounds')
}
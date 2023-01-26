const User = require('../models/user')

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
const express = require('express')
const router = express.Router({mergeParams: true})
const catchAsync = require('../utils/catchAsync')
const { checkReturnTo, isAccountOwner, isLoggedIn } = require('../middleware')
const passport = require('passport')
const users = require('../controllers/users')

router.route('/user/:id')
.get(catchAsync(users.renderProfile))
.delete(isLoggedIn ,isAccountOwner, catchAsync(users.deleteAccount))

router.route('/register')
.get(users.renderRegister)
.post(catchAsync(users.register))

router.route('/login')
.get(users.renderLogin)
.post(checkReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)

router.get('/logout', users.logout)


module.exports = router
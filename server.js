if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const express = require('express')
const path = require('path')
const morgan = require('morgan')
const methodOverRide = require('method-override')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const passport = require('passport')
const localStrategy = require('passport-local')
const helmet = require('helmet')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const userRoutes = require('./routes/user')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const MongoDBStore = require('connect-mongo')

mongoose.set('strictQuery', false)
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/YelpCamp'
mongoose.connect(DB_URL , {
    useNewUrlParser: true,  
    useUnifiedTopology: true,
    family:4
})
.then(()=> console.log("db connected"))
.catch((err)=> console.log(err))

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(morgan('dev'))
app.use(express.urlencoded({extended: true}))
app.use(methodOverRide('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
  )

const sessionConfig = {
    store: MongoDBStore.create({
        mongoUrl: DB_URL,
        secret: 'thisShouldBeAbetterSecret',
        touchAfter: 24 * 60 * 60
    }),
    name: 'session',
    secret: 'thisShouldBeAbetterSecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}


app.use(session(sessionConfig))
app.use(flash())
// app.use(
//     helmet({
//       contentSecurityPolicy: false,
//     })
//   );

const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
]
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
]
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
]
const fontSrcUrls = []
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dfscdodag/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
)

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    if(!['/login','/register','/logout','/','/favicon.ico'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl
    }
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res)=> {
    res.render("home")
})

app.all('*', (req, res, next)=>{
    next(new ExpressError('Page Not Found', 404))
})
app.use((err, req, res, next) => {
    if(!err.message) err.message = 'Something went wrong!'
    const {statusCode = 500 } = err
    console.log(err);
    
    res.status(statusCode).render('error', { err })
})

const Port = process.env.PORT || 3000;

app.listen(Port, ()=>{
    console.log('Serving on port 3000')
})
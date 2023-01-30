const Campground = require("../models/campground")
const { cloudinary } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken:mapBoxToken})

module.exports.index = async (req, res)=> {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", {campgrounds})
}
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}
module.exports.showCampground = async (req, res)=> {
    const id = req.params.id
    const campground = await Campground.findById(id).populate({path:'reviews', populate:{path:'author'}}).populate('author')
    if(!campground){
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground})
}
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(file => ({url: file.path, filename: file.filename}))
    campground.createdA = new Date()
    campground.author = req.user._id
    await campground.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}
module.exports.renderEditForm = async (req, res)=> {
    const id = req.params.id
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', {campground})
}
module.exports.updateCampground = async (req, res)=> {
    const id = req.params.id
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    campground.geometry = geoData.body.features[0].geometry
    const imgs = req.files.map(file => ({url: file.path, filename: file.filename}))
    campground.images.push(...imgs)
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull: {images: { filename: { $in : req.body.deleteImages } } } } )
        console.log(campground)
    }
    await campground.save()
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}
module.exports.deleteCampground = async (req, res) => {
    const id = req.params.id
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}
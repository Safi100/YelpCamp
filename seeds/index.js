const mongoose = require('mongoose')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.set('strictQuery', false)
mongoose.connect('mongodb://localhost:27017/YelpCamp', {
    useNewUrlParser: true,  
    useUnifiedTopology: true,
    family:4
})
.then(()=> console.log("db connected"))
.catch((err)=> console.log(err))

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for(let i=0; i<20; i++){
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            // Your userID
            author:'63d1a3af77ac3edda10aa09b',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa, illum quaerat officiis debitis consequuntur deserunt accusantium iure assumenda voluptates! Aliquid dicta nisi ut laboriosam dolorem quo sunt odio quis ipsum.',
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
              },
            images: [
                {
                  url: 'https://res.cloudinary.com/dfscdodag/image/upload/v1675028417/YelpCamp/mfbcmbyqsdcou0xllexe.jpg',
                  filename: 'YelpCamp/mfbcmbyqsdcou0xllexe',
                }
              ]
        })
        await camp.save()
    }
}
seedDB().then(()=>{
    mongoose.connection.close()
})
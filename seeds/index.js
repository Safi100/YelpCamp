const mongoose = require('mongoose')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground')
require('dotenv').config({ path: '../.env' });


if(process.env.NODE_ENV!== "production"){
    require('dotenv').config()
}
mongoose.set('strictQuery', false)
console.log(process.env.DB_URL);

mongoose.connect(process.env.DB_URL, {
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
            author:'673f19f678701c6720d2b774',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa, illum quaerat officiis debitis consequuntur deserunt accusantium iure assumenda voluptates! Aliquid dicta nisi ut laboriosam dolorem quo sunt odio quis ipsum.',
            price: price,
            createdAt: new Date(),
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
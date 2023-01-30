mapboxgl.accessToken = mapToken;
  
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
})

map.addControl(new mapboxgl.NavigationControl())

new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset: 25})
    .setHTML(
        `<h4 class="mb-0">${campground.title}</h4>`
    )
)
.addTo(map)
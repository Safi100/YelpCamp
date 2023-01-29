mapboxgl.accessToken = mapToken;
  
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: campgroundGeomtry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});
new mapboxgl.Marker()
.setLngLat(campgroundGeomtry.coordinates)
.addTo(map)
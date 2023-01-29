mapboxgl.accessToken = mapToken;
  
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 9 // starting zoom
});
new mapboxgl.Marker()
.setLngLat([-74.5, 40])
.addTo(map)
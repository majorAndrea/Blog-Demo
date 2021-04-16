(() => {
  "use strict";
  mapboxgl.accessToken = mapboxToken;
  const center = coordinates.split(",");
  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/outdoors-v11", // style URL
    center: [center[0], center[1]], // starting position [lng, lat]
    zoom: 9, // starting zoom
  });
  new mapboxgl.Marker().setLngLat([center[0], center[1]]).addTo(map);
  map.addControl(new mapboxgl.NavigationControl());
})();

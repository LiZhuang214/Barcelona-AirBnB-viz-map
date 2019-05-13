/* ============= Mapbox setup ============== */
mapboxgl.accessToken = 'pk.eyJ1Ijoiem1nZ216IiwiYSI6ImNqOTM1aXo4eDN1cHYzNG1ydzB5MnllNXgifQ.qpM-JL_cTuhKFYUZbh01PQ';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/dark-v10',
center: [2.176940, 41.382500],
zoom:11.4,
zoomControl: true
});


/* ============= Mapbox setup ============== */
// //Points (clusters)
var url = 'https://gist.githubusercontent.com/LiZhuang214/04d46aa0a30d5cf55f582568a2b37606/raw/76cd51ff34639ee4af5c37d0b0800e4e320bac04/AirBnB_Prepared.geojson';
var filterGroup = document.getElementById('filter-group');


map.on('load', function () {
window.setInterval(function() {
map.getSource('Listing').setData(url);
}, 2000);


map.addSource('Listing', {
  type: 'geojson',
  data: url,
  cluster: true,
  clusterMaxZoom: 11, // Max zoom to cluster points on
  clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
  });


var clusterMap = map.addLayer({
  id: "clusters",
  type: "circle",
  source: "Listing",
  filter: ["has", "point_count"],
  //filter: ["all", filter_price],
  //filter: ["has", "point_count", "all", filter_price],
  paint: {
  // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
  // with three steps to implement three types of circles:
  //   * Dark, 20px circles when point count is less than 100
  //   * Medium, 30px circles when point count is between 100 and 750
  //   * Light, 40px circles when point count is greater than or equal to 750
  "circle-color": [
  "step",
  ["get", "point_count"],
  "#3366cc",
  100,
  "#3399cc",
  750,
  "#66cccc"
],
  "circle-radius": [
  "step",
  ["get", "point_count"],
  20,
  100,
  30,
  750,
  40]}
  });

  map.addLayer({
  id: "cluster-count",
  type: "symbol",
  source: "Listing",
  filter: ["has", "point_count"],
  layout: {
  "text-field": "{point_count_abbreviated}",
  "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
  "text-size": 14
  }
  });

  map.addLayer({
  id: "unclustered-point",
  type: "circle",
  source: "Listing",
//  filter:['all', filter_price],
  //filter: ["all",filter_price,filter_polarity],
  filter: ["!", ["has", "point_count"]],
  paint: {
  //"circle-color": "#11b4da",
  'circle-color': [
  'match',
  ['get', 'room_type'],
  'Entire home/apt', '#66ffcc',
  'Private room', '#f78ae0',
  'Shared room', '#f1b707',
  /* other */ '#ccc'
],
  "circle-radius": 2.4,
  "circle-stroke-width": 0.8,
  "circle-stroke-color": "#fff",
  "circle-stroke-opacity":0.3,
  }
  });

  // inspect a cluster on click
  map.on('click', 'clusters', function (e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
  var clusterId = features[0].properties.cluster_id;
  map.getSource('Listing').getClusterExpansionZoom(clusterId, function (err, zoom) {
  if (err)
  return;

  map.easeTo({
  center: features[0].geometry.coordinates,
  zoom: zoom
  });
  });
  });

  map.on('mouseenter', 'clusters', function () {
  map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'clusters', function () {
  map.getCanvas().style.cursor = '';
  });

    // inspect a unit (unclustered-point) on click
    // When a click event occurs on a feature in the unclustered-point layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'unclustered-point', function (e) {

           var coordinates = e.features[0].geometry.coordinates.slice();
           var description = "<b>Name:</b> " + e.features[0].properties.name;
           description += "<br><b>Neighbourhood:</b> " + e.features[0].properties.neighbourhood;
           description += "<br><b>Room Type:</b> " + e.features[0].properties.room_type;
           description += "<br><b>Estimated Price:</b> " + e.features[0].properties.price + "<b> €</b> ";
           description += "<br><b>Cancellation Policy:</b> " + e.features[0].properties.cancellation_policy;
           description += "<br><b>Overall Satisfaction:</b> " + e.features[0].properties.polarity;
           description += "<br><b>URL:</b> " + e.features[0].properties.listing_url;
           description += "<br><b>Summary:</b> " + e.features[0].properties.summary;

             //add other elements/ fix into scrollable menu

             // Ensure that if the map is zoomed out such that multiple copies of the feature are visible,
             // the popup appears over the copy being pointed to.
             while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                 coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
             }

             new mapboxgl.Popup()
                 .setLngLat(coordinates)
                 .setHTML(description)
                 .addTo(map);
      });

      map.on('mouseenter', 'unclustered-point', function () {
          map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'unclustered-point', function () {
          map.getCanvas().style.cursor = '';
  });


  document.getElementById('slider2').addEventListener('input', function(e) {

        var price = parseInt(e.target.value);
          // update the map
        filter_price = ['<=', "price", price];
        map.setFilter('unclustered-point', ['all', filter_price, filter_polarity]);
          //map.setFilter('clusters', filter_price);
          //map.setFilter('cluster-count', filter_price);
        console.log(filter_price);
        // update text in the UI
        document.getElementById('idprice').innerText = price;

});


  document.getElementById('slider3').addEventListener('input', function(e) {

        var polarity = parseFloat(e.target.value);
          // update the map
        filter_polarity = ['>=', "polarity", polarity];
        map.setFilter('unclustered-point', ['all', filter_price, filter_polarity]);
          //map.setFilter('clusters', filter_price);
          //map.setFilter('cluster-count', filter_price);
        console.log(filter_polarity);
        // update text in the UI
        document.getElementById('idpolarity').innerText = polarity;

});

// document.getElementById('input_box').addEventListener('input', function(e) {
//
//       var room_type = e.target.value;
//         // update the map
//       filter_room = ['==', "room_type", room_type];
//       map.setFilter('unclustered-point', ['all', filter_price, filter_polarity, filter_room]);
//         //map.setFilter('clusters', filter_price);
//         //map.setFilter('cluster-count', filter_price);
//       console.log(filter_room);
//       // update text in the UI
//       document.getElementById('idroom').innerText = room_type;
//
// });


//End of Map
});

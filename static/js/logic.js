// Create the streets tile layer
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
});

// Create the dark tile layer
let dark = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/dark-v10',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
});

// Create the satellite tile layer
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/satellite-streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
});

// Create the map object with center, zoom level and default layer
let map = L.map('mapid', {
  center: [40.7, -94.5],
  zoom: 3,
  layers: [streets, dark, satelliteStreets]
});

// Create a base layer to hold all maps
let baseMaps = {
  "Streets": streets,
  "Dark": dark,
  "Satellite": satelliteStreets
};

// Add layer groups
let allEarthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();
let majorEarthquakes = new L.LayerGroup();

// Add overlay
let overlays = {
  "Earthquakes": allEarthquakes,
  "Tectonic Plates": tectonicPlates,
  "Major Earthquakes": majorEarthquakes
};

// Add layer control to map
L.control.layers(baseMaps, overlays).addTo(map);

// Retrieve the earthquake GeoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // Return the style data for each of the earthquakes plotted on
  // the map. Magnitude is used to calculate radius and fillColor
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Determine the color of the circle based on the magnitude of the earthquake
  function getColor(magnitude) {
    if (magnitude > 5) {
      return "#ea2c2c";
    }
    if (magnitude > 4) {
      return "#ea822c";
    }
    if (magnitude > 3) {
      return "#ee9c00";
    }
    if (magnitude > 2) {
      return "#eecc00";
    }
    if (magnitude > 1) {
      return "#d4ee00";
    }
    return "#98ee00";
  }

  // Determine the radius of the earthquake marker based on its magnitude
  // Earthquakes with a magnitude of 0 will be plotted with a radius of 1
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }

  // Create a GeoJSON layer with the retrieved data
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },

    // Set the style for each circleMarker using styleInfo function
    style: styleInfo,

    // Create a pop-up for each circleMarker to display the magnitude and
    //  location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(allEarthquakes);

  // Add earthquake layer to map
  allEarthquakes.addTo(map);

  // Retrieve the major earthquake GeoJSON data >4.5 mag for the week
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson").then(function (majorData) {

    // Use the same style as the earthquake data
    function styleInfo(feature) {
      return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(feature.properties.mag),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
      };
    }

    // Determine the color of the circle based on the magnitude of the earthquake
    function getColor(magnitude) {
      if (magnitude > 6) {
        return "#ea2c2c";
      }
      if (magnitude > 5) {
        return "#ee9c00";
      }
      return "#d4ee00";
    }

    // Determine the radius of the earthquake marker based on its magnitude
    // Earthquakes with a magnitude of 0 will be plotted with a radius of 1
    function getRadius(magnitude) {
      if (magnitude === 0) {
        return 1;
      }
      return magnitude * 4;
    }

    // Create a GeoJSON layer with the retrieved data
    L.geoJson(data, {
      // Turn each feature into a circleMarker on the map
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
      },

      // Set the style for each circleMarker using styleInfo function
      style: styleInfo,

      // Create a pop-up for each circleMarker to display the magnitude and
      // location of the earthquake after the marker has been created and styled
      onEachFeature: function (feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
      }
    }).addTo(majorEarthquakes);
  });

  // Create legend control object
  let legend = L.control({
    position: "bottomright"

  });

  // Add all details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    const magnitudes = [0, 1, 2, 3, 4, 5];
    const colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

    // Loop through magnitudes to generate a label with a colored square for each interval
    for (var i = 0; i < magnitudes.length; i++) {
      div.innerHTML +=
        "<i style='background: " + colors[i] + "'></i> " +
        magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add the legend to the map
  legend.addTo(map);

  // Retrieve the tectonic plate geoJSON data
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
    .then(function (tectonicData) {
      L.geoJson(tectonicData, {
        color: "orange",
        weight: 2.5
      }).addTo(tectonicPlates);
    });
      
  // Add tectonic plate layer to map
  tectonicPlates.addTo(map);
});
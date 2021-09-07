// Store API link
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

function markerSize(mag) {
    return mag * 30000;
}

function markerColor(mag) {
    if (mag <= 1) {
        return "#8DFF00";
    } else if (mag <= 2) {
        return "#E5FF00";
    } else if (mag <= 3) {
        return "#FFC100";
    } else if (mag <= 4) {
        return "#FF6900";
    } else if (mag <= 5) {
        return "#FF0000";
    } else {
        return "#00FF00";
    };
}

// Perform a GET request ti the query URL
d3.json(link, function(data) {
    createFeatures(data.features);
});

function createFeatures(earthquakeData){

    var earthquakes = L.geoJSON(earthquakeData, {
        // define a function to run for each feature in the features array
        // give each feature a popup describing the earthquake's place and time
    onEachFeature : function (feature, layer) {

        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p> Magnitude: " + feature.properties.mag + "</p>")
        },      pointToLayer: function (feature, latlng) {
            return new L.circle(latlng,
              {radius: markerSize(feature.properties.mag),
              fillColor: markerColor(feature.properties.mag),
              fillOpacity: 1,
              stroke: false,
        })
    }
    });

    // send earthquakes layer to createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // define satelitemap layer
    var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
      });

    // define darkmap layer
    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
      });

    // define baseMaps object to hold satelitemap and darkmap layers
    var baseMaps = {
        "Satelite Map": satmap,
        "Dark Map": darkmap
    };

    // create overlay object to hold overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // create map
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 3,
        layers: [satmap, earthquakes]
    });

    // pass in baseMaps and overlayMaps
    // add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [0, 1, 2, 3, 4, 5];
        
        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(magnitudes[i] + 1) + '"></i> ' + 
            + magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
            }

        return div;
    };

    legend.addTo(myMap);
}
// Embedded Google Map with custom markers for Kickoff.
jQuery(function($) {
    // Asynchronously Load the map API
    var script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBRT2h0ZMOhp3GCf17rBzi_9QHkoQS9aws&callback=initialize";
    document.body.appendChild(script);
});

function initialize() {
    var map;
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap'
    };

    // Display a map on the page
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    map.setTilt(45);

    // Multiple Markers
    var markers = [
        ['Team Check-In', 42.291384, -83.717490],
        ['Information Table', 42.291229, -83.716644],
        ['Cheseborough Auditorium', 42.290877, -83.716737],
        ['Stamps Auditorium', 42.291976, -83.716931],
        ['Bob and Betty Beyster Building', 42.292762, -83.716314],
        ['Dow Building', 42.292738, -83.715424],
        ['G.G. Brown - Room 1571', 42.293119, -83.714855],
        ['EECS Building', 42.292509, -83.714807],
        ['Duderstadt Conference Rooms', 42.291088, -83.716381],
        ['UofM Fair', 42.291225, -83.716470],
        ['Tour Departure Point', 42.291481, -83.717117],
        ['Kit Distribution', 42.290646, -83.716900]
    ];

    // Info Window Content
    var infoWindowContent = [
        ['<div class="info_content">' +
        '<h3>Team Check-In</h3>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Information Table</h3>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Cheseborough Auditorium</h3>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Stamps Auditorium</h3>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Bob and Betty Beyster Building</h3>' + '<p>Breakout Rooms</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Dow Building</h3>' + '<p>Breakout Rooms</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>G.G. Brown - Room 1571</h3>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>EECS Building</h3>' + '<p>Breakout Rooms</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Duderstadt Conference Rooms</h3>' + '<p>Breakout Rooms</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>UofM Fair</h3>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Tour Depature Point</h3>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Kit Distribution</h3>' + '</div>'],

    ];

    // Display multiple markers on a map
    var infoWindow = new google.maps.InfoWindow(), marker, i;

    // Loop through our array of markers & place each one on the map
    for( i = 0; i < markers.length; i++ ) {
        var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: markers[i][0]
        });

        // Allow each marker to have an info window
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infoWindow.setContent(infoWindowContent[i][0]);
                infoWindow.open(map, marker);
            }
        })(marker, i));

        // Automatically center the map fitting all markers on the screen
        map.fitBounds(bounds);
    }

    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        this.setZoom(17);
        google.maps.event.removeListener(boundsListener);
    });

}

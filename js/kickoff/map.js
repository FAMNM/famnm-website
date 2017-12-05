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
        mapTypeId: 'roadmap',
    };

    // Display a map on the page
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    map.setTilt(45);

    // Multiple Markers
    var markers = [
        ['Team Check-In', 'Check_In', 42.291384, -83.717490],
        ['Information Table', 'Info_Table', 42.291229, -83.716644],
        ['Cheseborough Auditorium', 'Auditorium', 42.290877, -83.716737],
        ['Stamps Auditorium', 'Auditorium', 42.291976, -83.716931],
        ['Bob and Betty Beyster Building', 'Breakout_Rooms', 42.292762, -83.716314],
        ['Dow Building - Room 1013', 'Auditorium', 42.292738, -83.715424],
        ['G.G. Brown - Room 1571', 'Auditorium', 42.293119, -83.714855],
        ['EECS Building', 'Breakout_Rooms', 42.292509, -83.714807],
        ['Duderstadt Conference Rooms', 'Breakout_Rooms', 42.291088, -83.716381],
        ['UofM Fair', 'UofM_Fair', 42.291225, -83.716470],
        ['Kit Distribution', 'Kit_Distribution', 42.290646, -83.716900],
        ['Dow Building', 'Breakout_Rooms', 42.292759, -83.715745],
        ['NC27 Parking Lot', 'Parking', 42.292254, -83.718010],
        ['NC48 Parking Lot', 'Parking', 42.293288, -83.717167],
        ['NC60 Parking Lot', 'Parking', 42.290550, -83.712640],
        ['NC43 Parking Lot', 'Parking', 42.287924, -83.717173],
        ['NC5 Parking Lot', 'Parking', 42.287846, -83.714963],
        ['NC8 Parking Lot', 'Parking', 42.288153, -83.713380],
        ['NC10 Parking Lot', 'Parking', 42.289723, -83.721736]
    ];

    // Icons
    var iconBase = '../img/kickoff/icons/'
    var icons = {
      Check_In: iconBase + 'star.png',
      Parking: iconBase + 'parking.png',
      Auditorium: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      Info_Table: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      Breakout_Rooms: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      Kit_Distribution: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
      UofM_Fair: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    }

    // Info Window Content
    var infoWindowContent = [
        ['<div class="info_content">' +
        '<h3>Team Check-In</h3>' + '<p>Pierpont Commons' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Information Table</h3>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Cheseborough Auditorium</h3>' + '<p>Opening Ceremonies</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Stamps Auditorium</h3>' + '<p>Opening Ceremonies</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Bob and Betty Beyster Building</h3>' + '<p>Breakout Rooms</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Dow Building - Room 1013</h3>' + '<p>Opening Cermonies</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>G.G. Brown - Room 1571</h3>' + '<p>Opening Ceremonies</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>EECS Building</h3>' + '<p>Breakout Rooms</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Duderstadt Conference Rooms</h3>' + '<p>Breakout Rooms</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>UofM Fair</h3>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Kit Distribution</h3>' + '<p>Chrysler Room 133</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Dow Bulding</h3>' + '<p>Breakout Rooms</p>' + '</div>'],
        ['<div class="info_content"><h3>NC27 Parking Lot</h3>'],
        ['<div class="info_content"><h3>NC48 Parking Lot</h3>'],
        ['<div class="info_content"><h3>NC60 Parking Lot</h3>'],
        ['<div class="info_content"><h3>NC43 Parking Lot</h3>'],
        ['<div class="info_content"><h3>NC5 Parking Lot</h3>'],
        ['<div class="info_content"><h3>NC8 Parking Lot</h3>'],
        ['<div class="info_content"><h3>NC10 Parking Lot</h3>'],
    ];

    var legend = document.getElementById('legend');
    for (var key in icons) {
      var name = key.replace('_', ' ');
      var icon = icons[key];
      var div = document.createElement('div');
      div.innerHTML = '<img id="legendimg" src="' + icon + '"> ' + name;
      legend.appendChild(div);
    }

    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(legend);

    // Display multiple markers on a map
    var infoWindow = new google.maps.InfoWindow(), marker, i;

    // Loop through our array of markers & place each one on the map
    for( i = 0; i < markers.length; i++ ) {
        var position = new google.maps.LatLng(markers[i][2], markers[i][3]);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            icon: icons[markers[i][1]],
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
        map.setCenter(new google.maps.LatLng(42.292013, -83.715837));
        google.maps.event.removeListener(boundsListener);
    });
}

//Load the maps API
$(document).ready(function () {
    var script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBRT2h0ZMOhp3GCf17rBzi_9QHkoQS9aws&callback=initMap";
    document.body.appendChild(script);
});

//Initialize map
function initMap () {
    var map = new google.maps.Map($("#map").get(0), { mapTypeId: "roadmap"});
    var bounds = new google.maps.LatLngBounds();
    var infoWindow = new google.maps.InfoWindow();

    var places = [
        { name: "Check In", icon: "checkin", lat: 42.292686, lon: -83.715573 },
        { name: "Parking", icon: "parking", lat: 42.292242, lon: -83.717560 },
        { name: "Session Rooms", icon: "rooms", lat: 42.292835, lon: -83.715431 }
    ];

    var icons = {
        checkin: "../img/kickoff/icons/star.png",
        parking: "../img/kickoff/icons/parking.png",
        rooms: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
    };

    for (var i = 0; i < places.length; ++i) {
        var pos = new google.maps.LatLng(places[i].lat, places[i].lon);
        var marker = new google.maps.Marker({
            position: pos,
            map: map,
            icon: icons[places[i].icon],
            title: places[i].name
        });

        google.maps.event.addListener(marker, "click", (function (marker, place) {
            return function () {
                infoWindow.setContent("<h3>" + place.name + "</h3>");
                infoWindow.open(map, marker);
            };
        })(marker, places[i]));

        bounds.extend(pos);
    }

    map.fitBounds(bounds);

    var boundsListener = google.maps.event.addListener(map, "bounds_changed", function (event) {
        this.setZoom(17);
        map.setCenter(new google.maps.LatLng(42.292013, -83.715837));
        google.maps.event.removeListener(boundsListener);
    });
}

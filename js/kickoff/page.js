import { createApp, reactive } from 'https://unpkg.com/petite-vue@0.2.2/dist/petite-vue.es.js'
import assignments from './rooms.js'

const getTime = (hour, minute) => new Date(Date.UTC(2023, 0, 7, (hour + 5) % 24, minute))

const schedule = {
    checkin: {
        event: 'Check-In',
        start: getTime(9, 0),
        end: getTime(11, 30),
        location: 'Pierpont Commons',
        icon: 'checkin.png'
    },
    orgfair: {
        event: 'Engineering Organization Fair',
        start: getTime(9, 30),
        end: getTime(11, 30),
        location: 'Duderstadt Center',
        icon: 'orgfair.png'
    },
    robinfo: {
        event: 'Undergraduate Robotics Program Information Session',
        start: getTime(9, 30),
        end: getTime(10, 30),
        location: 'GGBL 1571',
        icon: 'robinfo.png'
    },
    // These items represent markers on the map
    // Guest Speakers and FIRST Broadcast share one marker
    auditorium: {
        event: 'Auditorium',
        start: getTime(11, 30),
        end: getTime(13, 0),
        location: team => assignments[team]?.auditorium,
        icon: 'auditorium.png'
    },
    breakout: {
        event: 'Breakout Rooms',
        start: getTime(13, 0),
        end: getTime(17, 0),
        location: team => assignments[team]?.breakout,
        icon: 'breakout.png'
    },
    kitdist: {
        event: 'Kit distribution',
        start: getTime(13, 0),
        end: getTime(16, 30),
        location: 'Outside DOW 1005',
        icon: 'kitdist.png'
    }
};


const store = reactive({
    team: localStorage.getItem('team') ?? '',
    location: '',
    parkingShown: false,
    now: new Date(),
})

const mapUtils = {
    toggleParking: _ => {
        store.parkingShown = !store.parkingShown;

        mapUtils.parkingMarkers.forEach(function (mkr) {
            mkr.setMap(store.parkingShown ? mapUtils.map : null);
        });

        if (store.parkingShown) {
            mapUtils.map.fitBounds(mapUtils.parkingBounds);
        }

    },
    resetMap: _ => {
        store.location = '';
        // Remove all markers specific to a given team.
        for (const [eventId, event] of Object.entries(schedule)) {
            if (typeof event.location === 'function' && mapUtils.locationMarkers[eventId]) {
                mapUtils.locationMarkers[eventId].setMap(null);
            }
        }

        // if there's an onclick listener on the marker, remove it/make it undefined.
        if (mapUtils.winListener) {
            google.maps.event.removeListener(mapUtils.winListener);
            mapUtils.winListener = undefined;
            mapUtils.infoWindow.setContent("");
            mapUtils.infoWindow.close();
        }
    },
    navigate(name, markerId) {
        if (markerId in mapUtils.locationMarkers) {
            const marker = mapUtils.locationMarkers[markerId];

            // focus the map on our new marker
            mapUtils.map.setCenter(marker.getPosition());
            // empirically verified to be a good zoom value
            mapUtils.map.setZoom(18);

            // create the click event to show the text popup
            mapUtils.winListener = google.maps.event.addListener(marker, "click", ((mkr, markerId, name) =>
                () => {
                    mapUtils.infoWindow.setContent(`<h5>${name}</h5><h6>${schedule[markerId].location}</h6>`);
                    mapUtils.infoWindow.open(mapUtils, mkr);
                })(marker, markerId, name));

            // after .5 seconds, trigger the click event and
            setTimeout(() => google.maps.event.trigger(marker, "click"), 50);
        }
    },
    locationMarkers: {},
    parkingMarkers: []
};

const parking = [
    { lot: "Bonisteel", lat: 42.29042, lng: -83.71582 },
    { lot: "NC10", lat: 42.289723, lng: -83.721736 },
    { lot: "NC27", lat: 42.292254, lng: -83.718010 },
    { lot: "NC43", lat: 42.287924, lng: -83.717173 },
];
const markers = {
    "Pierpont Commons": { lat: 42.291384, lng: -83.717490},
    "DUDE CON": { lat: 42.291225, lng: -83.716470},
    "Duderstadt Center": { lat: 42.291319, lng: -83.715847},
    "CHRYS 133": { lat: 42.290646, lng: -83.716900},
    "CHRYS 220": { lat: 42.290877, lng: -83.716737},
    "BBB 1670": { lat: 42.292868, lng: -83.716273},
    "BBB 1690": { lat: 42.292870, lng: -83.716463},
    "DOW 1005": { lat: 42.292721, lng: -83.715589},
    "Outside DOW 1005": { lat: 42.29277576370072, lng: -83.71571295536538},
    "DOW 1006": { lat: 42.292919, lng: -83.715597},
    "DOW 1010": { lat: 42.292937, lng: -83.715503},
    "DOW 1013": { lat: 42.292728, lng: -83.715412},
    "DOW 1014": { lat: 42.292945, lng: -83.715350},
    "DOW 1017": { lat: 42.292745, lng: -83.715261},
    "DOW 1018": { lat: 42.292880, lng: -83.715223},
    "DOW 2150": { lat: 42.292729, lng: -83.715241},
    "DOW 2166": { lat: 42.292742, lng: -83.715623},
    "GGBL 1571": { lat: 42.293140, lng: -83.714917},
    "EECS 1003": { lat: 42.292653, lng: -83.714466},
    "EECS 1005": { lat: 42.292653, lng: -83.714466},
    "EECS 1008": { lat: 42.292653, lng: -83.714466},
    "EECS 1012": { lat: 42.292653, lng: -83.714466},
    "EECS 1200": { lat: 42.292548, lng: -83.714585},
    "EECS 1303": { lat: 42.292502, lng: -83.714353},
    "EECS 1311": { lat: 42.292323, lng: -83.714417},
    "EECS 1500": { lat: 42.292271, lng: -83.714581},
    "FXB 1008": { lat: 42.293756, lng: -83.711559},
    "FXB 1109": { lat: 42.293502, lng: -83.711731},
    "IOE 1610": { lat: 42.291245, lng: -83.713716},
};

window.initMap = function() {
    mapUtils.map = new window.google.maps.Map(document.getElementById('map'), {
        center: new window.google.maps.LatLng(42.291964, -83.715810),
        zoom: 17,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        gestureHandling: "greedy"
    });

    mapUtils.infoWindow = new window.google.maps.InfoWindow();
    mapUtils.parkingBounds = new window.google.maps.LatLngBounds();

    //Initialize parking markers
    parking.forEach(lot => {
        let mkr = new window.google.maps.Marker({
            position: lot,
            map: null,
            title: lot.lot + " Parking",
            icon: "../img/kickoff/icons/parking.png"
        });

        window.google.maps.event.addListener(mkr, "click", ((mkr) =>
            () => {
                mapUtils.infoWindow.setContent(`<h5>${mkr.getTitle()}</h5>`);
                mapUtils.infoWindow.open(mapUtils, mkr);
            })(mkr));

        mapUtils.parkingMarkers.push(mkr);
        mapUtils.parkingBounds.extend(lot);
    });

    // Initialize team-agnostic location markers
    for (const [eventId, event] of Object.entries(schedule)) {
        if (typeof event.location !== 'function') {
            const marker = new window.google.maps.Marker({
                position: markers[event.location],
                map: mapUtils.map,
                title: event.event,
                icon: `../img/kickoff/icons/${event.icon}`
            });
            window.google.maps.event.addListener(marker, "click", ((marker, event) =>
                () => {
                    mapUtils.infoWindow.setContent(`<h5>${marker.getTitle()}</h5><h6>${event.location}</h6>`);
                    mapUtils.infoWindow.open(mapUtils, marker);
                })(marker, event));
            mapUtils.locationMarkers[eventId] = marker;
        }
    }

    // If team exists and assignments exist, initialize team-specific location markers
    if (store.team in assignments) {
        populateTeamMarkers(store.team);
    }
};

/**
 * Countdown message
 * @param {Date} now 
 * @param {Date} kickoffTime 
 */
function countdown(now, kickoffTime) {
    let diff = (kickoffTime.getTime() - now.getTime());
    let d, h, m, s;

    if (diff <= 0) {
        diff = (kickoffDoneTime.getTime() - (new Date()).getTime());
        if (diff <= 0) {
            return "We hope you enjoyed kickoff! Good luck this season!"
        } else {
            return "It's kickoff time!";
        }
    } else {
        //Knock off milliseconds
        diff = Math.floor(diff / 1e3);
        s = diff % 60;

        //Knock off seconds
        diff = Math.floor(diff / 60);
        m = diff % 60;

        //Knock off minutes
        diff = Math.floor(diff / 60);
        h = diff % 24;

        //Knock off hours
        d = Math.floor(diff / 24);

        return `${d}d ${h}h ${m}m ${s}s`;
    }
}

function populateTeamMarkers(team) {
    // Populate the team-specific markers as available
    for (const [eventId, event] of Object.entries(schedule)) {
        if (typeof event.location === 'function' && event.location(store.team)) {
            const marker = new window.google.maps.Marker({
                position: markers[event.location(team)],
                map: mapUtils.map,
                title: event.event,
                icon: `../img/kickoff/icons/${event.icon}`
            });
            window.google.maps.event.addListener(marker, "click", ((marker, event) =>
                () => {
                    mapUtils.infoWindow.setContent(`<h5>${marker.getTitle()}</h5><h6><i>${event.location(store.team)}</i></h6>`);
                    mapUtils.infoWindow.open(mapUtils, marker);
                })(marker, event));
            mapUtils.locationMarkers[eventId] = marker;
        }
    }
}

function onTeamChange(team) {
    if (team === '' || team in assignments) {
        localStorage.setItem('team', team);
        mapUtils.resetMap();
    }
    if (team in assignments) {
        populateTeamMarkers(team);
    }
}

const kickoffTime = new Date(Date.UTC(2023, 0, 7, 12 + 5))
const kickoffDoneTime = new Date(kickoffTime.getTime() + 1000*60*60*5)

createApp({store, assignments, mapUtils, markers,
    onTeamChange,
    kickoffTime,
    countdown}).mount()

window.mapUtils = mapUtils

const timerUpdater = setInterval(() => {
    store.now = new Date()
    if (store.now.getTime() - kickoffTime.getTime() > 1000 * 60 * 60 * 12) {
        clearInterval(timerUpdater)
    }
}, 1000);
const getTime = (hour, minute) => new Date(2022, 0, 8, hour, minute, 0, 0, 0);

const getTimeString = (time) => {
    return time.toLocaleTimeString('en-US', {hour12: true, hour: 'numeric', minute: '2-digit'});
};

const teamNumAccepted = (event, isEvent) => {
    let num;
    const errDiv = $("#team-error");
    const dispDiv = $("#team-disp");
    const teamNumName = $("#team-num-name");
    const teamSchool = $("#team-school");
    
    if (isEvent) {
        // where was the function called from?
        if ($(event.currentTarget).prop("type") === "text" && event.key !== "Enter")
            return;
        num = parseInt($("#teamNumInput").val());
    } else {
        num = event;
    }

    try {
        setTeam(num);
    } catch (e) {
        console.log("Team not found :(");
        errDiv.css("display", "block");
        dispDiv.css("display", "none");
        return;
    }

    loadSchedules();
    
    if (num !== 0) {
        teamNumName.text(num + ": " + activeTeam.name);
    } else {
        teamNumName.text("SCHEDULE FOR ALL TEAMS")
    }

    teamSchool.text(activeTeam.school);
    
    errDiv.css("display", "none");
    dispDiv.css("display", "block");
    
    //Make the team number persist across refreshes
    localStorage.setItem("team", activeTeam.number);
};

const setTeam = num => {
    activeTeam = allTeams[num.toString()];
    if (typeof activeTeam == 'undefined') {
        activeTeam = {};
        throw Error('Team not found!');
    }
    activeTeam.number = num;
};

const loadSchedules = () => {
    const time = new Date();
    
    const mainSchedule = $("#schedule");
    mainSchedule.empty();
    
    //Fill main schedule
    schedule.forEach((evt, index) => {
        const loc = resolveLocation(Object.assign({}, evt.location));
        
        // if this team doesn't have a location assignment for this schedule item
        // return and do not add it to the team's schedule
        if (loc.code === false) return;
        
        let eventColorClass = "";
        if (time >= evt.end) eventColorClass = "table-active";
        else if (time >= evt.start) eventColorClass = "table-info";
        else eventColorClass = "table-warning";

        let mapLinkId = `maplink-${index}`;
        let mapLink = (activeTeam.number == 0 && loc.custom) ? `` : `: <a class="map-jump" id="${mapLinkId}" data-toggle="modal" data-target="#mapModal">View on Map</a>`;

        let eventHTMLString = `
        <tr class=${eventColorClass}>
            <td class="text-center">
                <div class="font-weight-bold">${getTimeString(evt.start)} - ${getTimeString(evt.end)}</div>
                <div>${evt.event}</div>
                <div>${loc.name}${mapLink}</div>
            </td>
        </tr>`;
        let eventHTML = $.parseHTML(eventHTMLString);
        mainSchedule.append(eventHTML);

        $(`#${mapLinkId}`).click(event => {
            let marker = {};
            try {
                marker = getMarker(loc.code);
            } catch (err) {
                console.log(err.message);
                event.preventDefault();
                activeMarker = undefined;
                return;
            }
            
            mapUtils.modalTitle.text(loc.name);

            // convert our lat/lon into a LatLng object
            const pos = new google.maps.LatLng(marker);

            // create the marker to put on the map
            mapUtils.activeMarker = new google.maps.Marker({
                position: pos,
                map: mapUtils.map,
                icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                title: loc.name
            });

            // focus the map on our new marker
            mapUtils.map.setCenter(pos);
            // empirically verified to be a good zoom value
            mapUtils.map.setZoom(18);

            

            // create the click event to show the text popup
            mapUtils.winListener = google.maps.event.addListener(mapUtils.activeMarker, "click", ((mkr) =>
                () => {
                    mapUtils.infoWindow.setContent(`<h5>${loc.name}</h5>`);
                    mapUtils.infoWindow.open(mapUtils, mkr);
                })(mapUtils.activeMarker));
            
            // after .5 seconds, trigger the click event and 
            setTimeout(() => google.maps.event.trigger(mapUtils.activeMarker, "click"), 500);
        });
    });
};

const resolveLocation = loc => {
    if (loc.custom) {
        if (activeTeam.number === undefined)
            throw new Error("Team number not set");
        loc.name = activeTeam[loc.name];
    }

    loc.code = loc.name;
    
    // if this team does not have a location for this schedule item, don't do the name replacement
    if (loc.name === false)
        return loc;

    // turn abbreviated names into full names
    locations.forEach((namePair) => {
        loc.name = loc.name.replace(namePair.abbr, namePair.full);
    });
    
    return loc;
};

const getMarker = code => {
    if (markers[code] == undefined)
        throw Error("Location marker not found");
    
    return markers[code];
};

let activeTeam = {};
let allTeams = {};
const schedule = [
    {
        event: "Team Check-In",
        start: getTime(8, 0),
        end: getTime(10, 0),
        location: {name: "DUDE CON", custom: false},
    },
    {
        event: "Breakout Rooms Open",
        start: getTime(8, 0),
        end: getTime(10, 0),
        location: {name: "breakout", custom: true},
    },
    /*{
        event:"North Campus Tours",
        start:getTime(8,15),
        end:getTime(9,15),
        location:"PIER"
    },*/
    {
        event: "UM Fair",
        start: getTime(8, 30),
        end: getTime(10, 0),
        location: {name: "DUDE CON", custom: false},
    },
    {
        event: "Opening Ceremonies and Broadcast",
        start: getTime(10, 0),
        end: getTime(11, 30),
        location: {name: "broadcast", custom: true},
    },
    {
        event: "Kit of Parts Distribution",
        start: getTime(11, 30),
        end: getTime(15, 0),
        location: {name: "CHRYS 133", custom: false},
    },
    {
        event: "Virtual Game Field Open",
        start: getTime(11, 45),
        end: getTime(15, 0),
        location: {name: "DOW 1010", custom: false},
    },
    {
        event: "Breakout Rooms Open",
        start: getTime(11, 30),
        end: getTime(18, 0),
        location: {name: "breakout", custom: true},
    }
];
const mapUtils = {
    toggleParking: _ => {
        mapUtils.parkingShown = !mapUtils.parkingShown;
        
        mapUtils.parkingMarkers.forEach(function (mkr) {
            mkr.setMap(mapUtils.parkingShown ? mapUtils.map : null);
        });
        
        if (mapUtils.parkingShown) {
            mapUtils.map.fitBounds(mapUtils.parkingBounds);
        }
        
        $("#map-parking-toggle").text(mapUtils.parkingShown ? "Hide parking" : "Show parking");
    },
    clearMap: _ => {
        mapUtils.modalTitle.text("");
        // if there's an active marker on the map, remove it from the map.
        if (mapUtils.activeMarker) 
            mapUtils.activeMarker.setMap(null);

        // if there's an onclick listener on the marker, remove it/make it undefined.
        if (mapUtils.winListener) {
            google.maps.event.removeListener(mapUtils.winListener);
            winListener = undefined;
            mapUtils.infoWindow.setContent("");
        }
    },
    parkingShown: false,
    parkingMarkers: []
};
const locations = [
    { abbr: "220", full: "- Chesebrough Auditorium (Room 220)"},
    { abbr: "GAL", full: "Gallery"},
    { abbr: "CON", full: "Connector"},
    { abbr: "DUDE", full: "Duderstadt"},
    { abbr: "CHRYS", full: "Chrysler"},
    { abbr: "GGBL", full: "GG Brown"},
    { abbr: "EECS", full: "EECS Building"},
    { abbr: "BBB", full: "Bob and Betty Beyster Building"},
    { abbr: "DOW", full: "Dow Building"},
    { abbr: "PIER", full: "Pierpont Commons"},
    { abbr: "FXB", full: "Fran\u00e7ois-Xavier Bagnoud Building"},
];
const parking = [
    { lot: "NC5", lat: 42.288055, lng: -83.714438 },
    { lot: "NC8", lat: 42.287934, lng: -83.713655 },
    { lot: "NC10", lat: 42.289723, lng: -83.721736 },
    { lot: "NC27", lat: 42.292254, lng: -83.718010 },
    { lot: "NC43", lat: 42.287924, lng: -83.717173 },
    { lot: "NC48", lat: 42.293288, lng: -83.717167 },
    { lot: "NC60", lat: 42.290550, lng: -83.712640 }
];
const markers = {
    "PIER": { lat: 42.291384, lng: -83.717490},
    "DUDE CON": { lat: 42.291225, lng: -83.716470},
    "DUDE GAL": { lat: 42.291166, lng: -83.716745},
    "CHRYS 133": { lat: 42.290646, lng: -83.716900},
    "CHRYS 220": { lat: 42.290877, lng: -83.716737},
    "BBB 1670": { lat: 42.292868, lng: -83.716273},
    "BBB 1690": { lat: 42.292870, lng: -83.716463},
    "DOW 1005": { lat: 42.292721, lng: -83.715589},
    "DOW 1006": { lat: 42.292919, lng: -83.715597},
    "DOW 1010": { lat: 42.292937, lng: -83.715503},
    "DOW 1013": { lat: 42.292728, lng: -83.715412},
    "DOW 1014": { lat: 42.292945, lng: -83.715350},
    "DOW 1017": { lat: 42.292745, lng: -83.715261},
    "DOW 1018": { lat: 42.292880, lng: -83.715223},
    "GGBL 1571": { lat: 42.293140, lng: -83.714917},
    "EECS 1003": { lat: 42.292653, lng: -83.714466},
    "EECS 1005": { lat: 42.292653, lng: -83.714466},
    "EECS 1012": { lat: 42.292653, lng: -83.714466},
    "EECS 1200": { lat: 42.292548, lng: -83.714585},
    "EECS 1303": { lat: 42.292502, lng: -83.714353},
    "EECS 1311": { lat: 42.292323, lng: -83.714417},
    "EECS 1500": { lat: 42.292271, lng: -83.714581},
    "FXB 1109": { lat: 42.293502, lng: -83.711731},
    "IOE 1610": { lat: 42.291245, lng: -83.713716}
};

function initMap(){
    mapUtils.map = new google.maps.Map($("#map").get(0), {
        center: new google.maps.LatLng(42.291964, -83.715810),
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        gestureHandling: "greedy"
    });
    
    mapUtils.infoWindow = new google.maps.InfoWindow();
    mapUtils.modalTitle = $("#map-active-loc");
    
    mapUtils.parkingBounds = new google.maps.LatLngBounds();
    
    //Initialize parking markers
    parking.forEach(lot => {
        let mkr = new google.maps.Marker({
            position: lot,
            map: null,
            title: lot.lot + " Parking Lot",
            icon: "../img/kickoff/icons/parking.png"
        });
        
        google.maps.event.addListener(mkr, "click", ((mkr) =>
            () => {
                mapUtils.infoWindow.setContent(`<h5>${mkr.getTitle()}</h5>`);
                mapUtils.infoWindow.open(mapUtils, mkr);
            })(mkr));
        
        mapUtils.parkingMarkers.push(mkr);
        mapUtils.parkingBounds.extend(lot);
    });
};

$(document).ready(() => {
    // Asynchronously Load the map API
    const script = $(document.createElement('script'));
    script.attr("src", "https://maps.googleapis.com/maps/api/js?key=AIzaSyBRT2h0ZMOhp3GCf17rBzi_9QHkoQS9aws&callback=initMap");
    $(document.body).append(script);
    
    //Load team information
    fetch("../../js/kickoff/teamlist.json")
    .then( (response) =>{
        if (!response.ok) throw Error(response.statusText);
        return response.json();
    }).then(teams => {
        allTeams = teams;
        
        const teamNum = localStorage.getItem("team")

        if (teamNum !== null) {
            $("#teamNumInput").val(teamNum);
            teamNumAccepted(parseInt(teamNum), false);
        } else {
            teamNumAccepted(0, false)
        }
    }).catch(console.log);
    
    //Initialize countdown clock
    const computeDiff = () => {
        let diff = (getTime(10, 30).getTime() - (new Date()).getTime());
        let d, h, m, s;

        const clockDiv = $(".countdown-clock");
        
        if (diff <= 0) {
            diff = (getTime(18, 00).getTime() - (new Date()).getTime());
            if (diff <= 0) {
                clockDiv.text("We hope you enjoyed kickoff! Good luck this season!")
            } else {
                clockDiv.text("It's kickoff time!");
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

            clockDiv.text(`${d}d ${h}h ${m}m ${s}s`);
        }
        
    };
    
    computeDiff();
    setInterval(computeDiff, 1000);
});

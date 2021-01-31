const getTime = (hour, minute) => new Date(2021, 0, 9, hour, minute, 0, 0, 0);

const kickoffUtils = {
    getTimeString: (time) => {
        return time.toLocaleTimeString('en-US', {hour12: true, hour: 'numeric', minute: '2-digit'});
    },
    loadSchedules: time => {
        time = (time === undefined ? new Date() : time);
        
        var mainSchedule = $("#schedule");
        mainSchedule.empty();
        
        //Fill main schedule
        kickoffUtils.schedule.forEach(evt => {
            var loc = kickoffUtils.resolveLocation(evt.location);
            
            if (loc.code === false) return;
            
            var nestedCreate = function () {
                var nodeList = [arguments[0]];
                
                for (var i = 1; i < arguments.length; ++i) {
                    nodeList.push($(document.createElement(arguments[i])));
                    nodeList[i].appendTo(nodeList[i - 1]);
                }
                
                return nodeList[nodeList.length - 1];
            };
            
            var cell = nestedCreate(mainSchedule, "tr", "td");
            var timeDiv = nestedCreate(cell, "div");
            var titleDiv = nestedCreate(cell, "div");
            var locLnk = nestedCreate(cell, "div", "a");
            
            cell.css("textAlign", "center");
            timeDiv.css("fontWeight", "bold");
            timeDiv.text(kickoffUtils.getTimeString(evt.start) + " - " + kickoffUtils.getTimeString(evt.end));
            
            titleDiv.text(evt.event);
            locLnk.addClass("map-jump");
            locLnk.text(loc.name);
            locLnk.attr("data-toggle", "modal");
            locLnk.attr("data-target", "#mapModal");
            locLnk.click(event => {
                var marker = kickoffUtils.getMarker(loc.code);
                
                kickoffUtils.map.modalTitle.text(loc.name);
                
                if (kickoffUtils.map.activeMarker) kickoffUtils.map.activeMarker.setMap(null);
                if (kickoffUtils.map.winListener) {
                    google.maps.event.removeListener(kickoffUtils.map.winListener);
                    kickoffUtils.winListener = undefined;
                    kickoffUtils.map.infoWindow.setContent("");
                }
                
                if (marker.length === 0) {
                    event.preventDefault();
                    kickoffUtils.activeMarker = undefined;
                    return;
                }
                
                var pos = new google.maps.LatLng(marker[1], marker[2]);
                kickoffUtils.map.activeMarker = new google.maps.Marker({
                    position: pos,
                    map: kickoffUtils.map.map,
                    icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    title: loc.name
                });
                kickoffUtils.map.map.setCenter(pos);
                kickoffUtils.map.map.setZoom(18);
                
                kickoffUtils.map.winListener = google.maps.event.addListener(kickoffUtils.map.activeMarker, "click", (function (mrk) {
                    return function () {
                        kickoffUtils.map.infoWindow.setContent("<h5>" + loc.name + "</h5>");
                        kickoffUtils.map.infoWindow.open(map, mrk);
                    }
                })(kickoffUtils.map.activeMarker));
                
                setTimeout(function () {
                    google.maps.event.trigger(kickoffUtils.map.activeMarker, "click");
                    google.maps.event.trigger(kickoffUtils.map.map, "resize");
                }, 500);
                
                /* When the user clicks on two locations that are far away from
                 * one another, some of the tiles don't load. I'm not sure why;
                 * none of the solutions I've found seem to fix it (yet).
                 */
            });
            
            //"active" applies a gray background, "info" applies a blue background
            if (time >= evt.end) cell.parent().addClass("table-active");
            else if (time >= evt.start) cell.parent().addClass("table-info");
            else cell.parent().addClass("table-warning");
        });
    },
    teamNumAccepted: (event, isEvent) => {
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
            console.log("event is" + event)
            num = event;
        }

        try {
            kickoffUtils.setTeam(num);
        } catch (e) {
            console.log("Team not found :(");
            errDiv.css("display", "block");
            dispDiv.css("display", "none");
            return;
        }

        kickoffUtils.loadSchedules();
        
        if (num !== 0) {
            teamNumName.text(num + ": " + kickoffUtils.activeTeam.name);
        } else {
            teamNumName.text("SCHEDULE FOR ALL TEAMS")
        }

        teamSchool.text(kickoffUtils.activeTeam.school);
        
        errDiv.css("display", "none");
        dispDiv.css("display", "block");
        
        //Make the team number persist across refreshes
        localStorage.setItem("team", kickoffUtils.activeTeam.number);
    },
    setTeam: num => {
        kickoffUtils.activeTeam = kickoffUtils.teams[num.toString()];
        if (typeof kickoffUtils.activeTeam == 'undefined') {
            kickoffUtils.activeTeam = {};
            throw Error('Team not found!');
        }
        kickoffUtils.activeTeam.number = num;
    },
    resolveLocation: loc => {
        if (loc[0] === 't') {
            if (kickoffUtils.activeTeam.number === undefined)
            throw new Error("Team number not set");
            loc = kickoffUtils.activeTeam[loc.split(':')[1]];
        }
        
        if (loc === false) {
            return { code: false, name: "N/A" };
        }
        
        var locObj = { code: loc, name: loc };
        
        kickoffUtils.locations.forEach(function (lMapping) {
            locObj.name = locObj.name.replace(lMapping[0], lMapping[1]);
        });
        
        return locObj;
    },
    getMarker: code => {
        for (var i = 0; i < kickoffUtils.markers.length; ++i) {
            if (code === kickoffUtils.markers[i][0]) return kickoffUtils.markers[i];
        }
        
        return [];
    },
    activeTeam: {},
    schedule: [
        {
            event: "Team Check-In",
            start: getTime(8, 0),
            end: getTime(10, 0),
            location: "DUDE CON"
        },
        {
            event: "Breakout Rooms Open",
            start: getTime(8, 0),
            end: getTime(10, 0),
            location: "t:breakout"
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
            location: "DUDE CON"
        },
        {
            event: "Opening Ceremonies and Broadcast",
            start: getTime(10, 0),
            end: getTime(11, 30),
            location: "t:broadcast"
        },
        {
            event: "Kit Distribution",
            start: getTime(11, 30),
            end: getTime(15, 0),
            location: "CHRYS 133"
        },
        {
            event: "Virtual Game Field Open",
            start: getTime(11, 45),
            end: getTime(15, 0),
            location: "DOW 1010"
        },
        {
            event: "Breakout Rooms Open",
            start: getTime(11, 30),
            end: getTime(18, 0),
            location: "t:breakout"
        }
    ],
    map: {
        toggleParking: show => {
            show = (show === undefined ? !kickoffUtils.map.parkingShown : show);
            
            if (show === kickoffUtils.map.parkingShown) return;
            
            kickoffUtils.map.parkingMarkers.forEach(function (mkr) {
                mkr.setMap(show ? kickoffUtils.map.map : null);
            });
            
            if (show) {
                if ($(kickoffUtils.map.map.getDiv()).width() === 0) {
                    google.maps.event.addListenerOnce(kickoffUtils.map.map, "resize", function () {
                        kickoffUtils.map.map.fitBounds(kickoffUtils.map.parkingBounds);
                    });
                } else {
                    kickoffUtils.map.map.fitBounds(kickoffUtils.map.parkingBounds);
                }
            }
            
            kickoffUtils.map.parkingShown = show;
            $("#map-parking-toggle").text(show ? "Hide parking" : "Show parking");
        },
        showKOP: () => {
            var loc = kickoffUtils.resolveLocation(kickoffUtils.schedule[4].location);
            var mkr = kickoffUtils.getMarker(loc.code)
            
            kickoffUtils.map.modalTitle.text("KOP Pick Up");
            
            if (kickoffUtils.map.activeMarker) kickoffUtils.map.activeMarker.setMap(null);
            if (kickoffUtils.map.winListener) {
                google.maps.event.removeListener(kickoffUtils.map.winListener);
                kickoffUtils.winListener = undefined;
                kickoffUtils.map.infoWindow.setContent("");
            }
            
            var pos = new google.maps.LatLng(mkr[1], mkr[2]);
            kickoffUtils.map.activeMarker = new google.maps.Marker({
                position: pos,
                map: kickoffUtils.map.map,
                icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                title: "KOP Pickup"
            });
            
            kickoffUtils.map.winListener = google.maps.event.addListener(kickoffUtils.map.activeMarker, "click", function () {
                kickoffUtils.map.infoWindow.setContent("<h5>KOP Pick Up</h5><br/>" + loc.name);
                kickoffUtils.map.infoWindow.open(map, kickoffUtils.map.activeMarker);
            });
            
            if ($(kickoffUtils.map.map.getDiv()).width() === 0) {
                google.maps.event.addListenerOnce(kickoffUtils.map.map, "resize", function () {
                    kickoffUtils.map.map.setCenter(pos);
                    kickoffUtils.map.map.setZoom(18);
                });
            } else {
                kickoffUtils.map.map.setCenter(pos);
                kickoffUtils.map.map.setZoom(18);
            }
        },
        parkingShown: false,
        parkingMarkers: []
    },
    locations: [
        ["220", "- Chesebrough Auditorium (Room 220)"],
        ["GAL", "Gallery"],
        ["CON", "Connector"],
        ["DUDE", "Duderstadt"],
        ["CHRYS", "Chrysler"],
        ["GGBL", "GG Brown"],
        ["EECS", "EECS Building"],
        ["BBB", "Bob and Betty Beyster Building"],
        ["DOW", "Dow Building"],
        ["PIER", "Pierpont Commons"],
        ["FXB", "Fran\u00e7ois-Xavier Bagnoud Building"]
    ],
    parking: [
        { lot: "NC5", lat: 42.288055, lng: -83.714438 },
        { lot: "NC8", lat: 42.287934, lng: -83.713655 },
        { lot: "NC10", lat: 42.289723, lng: -83.721736 },
        { lot: "NC27", lat: 42.292254, lng: -83.718010 },
        { lot: "NC43", lat: 42.287924, lng: -83.717173 },
        { lot: "NC48", lat: 42.293288, lng: -83.717167 },
        { lot: "NC60", lat: 42.290550, lng: -83.712640 }
    ],
    markers: [
        ["PIER", 42.291384, -83.717490],
        ["DUDE CON", 42.291225, -83.716470],
        ["DUDE GAL", 42.291166, -83.716745],
        ["CHRYS 133", 42.290646, -83.716900],
        ["CHRYS 220", 42.290877, -83.716737],
        ["BBB 1670", 42.292868, -83.716273],
        ["BBB 1690", 42.292870, -83.716463],
        ["DOW 1005", 42.292721, -83.715589],
        ["DOW 1006", 42.292919, -83.715597],
        ["DOW 1010", 42.292937, -83.715503],
        ["DOW 1013", 42.292728, -83.715412],
        ["DOW 1014", 42.292945, -83.715350],
        ["DOW 1017", 42.292745, -83.715261],
        ["DOW 1018", 42.292880, -83.715223],
        ["GGBL 1571", 42.293140, -83.714917],
        ["EECS 1003", 42.292653, -83.714466],
        ["EECS 1005", 42.292653, -83.714466],
        ["EECS 1012", 42.292653, -83.714466],
        ["EECS 1200", 42.292548, -83.714585],
        ["EECS 1303", 42.292502, -83.714353],
        ["EECS 1311", 42.292323, -83.714417],
        ["EECS 1500", 42.292271, -83.714581],
        ["FXB 1109", 42.293502, -83.711731]
    ]
};

function initMap() {
    kickoffUtils.map.map = new google.maps.Map($("#map").get(0), {
        center: new google.maps.LatLng(42.291964, -83.715810),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        gestureHandling: "greedy"
    });
    
    kickoffUtils.map.map.setTilt(45);
    kickoffUtils.map.infoWindow = new google.maps.InfoWindow();
    kickoffUtils.map.modalTitle = $("#map-active-loc");
    
    kickoffUtils.map.parkingBounds = new google.maps.LatLngBounds();
    
    //Initialize parking markers
    kickoffUtils.parking.forEach(lot => {
        var mkr = new google.maps.Marker({
            position: lot,
            map: null,
            title: lot.lot + " Parking Lot",
            icon: "../img/kickoff/icons/parking.png"
        });
        
        google.maps.event.addListener(mkr, "click", (mkr => {
            return () => {
                kickoffUtils.map.infoWindow.setContent("<h5>" + mkr.getTitle() + "</h5>");
                kickoffUtils.map.infoWindow.open(map, mkr);
            }
        })(mkr));
        
        kickoffUtils.map.parkingMarkers.push(mkr);
        kickoffUtils.map.parkingBounds.extend(lot);
    });
    
    google.maps.event.addListener(kickoffUtils.map.map, "maptypeid_changed", () => {
        var mapType = kickoffUtils.map.map.getMapTypeId();
        var newParkingIcon = ((mapType === google.maps.MapTypeId.SATELLITE || mapType == google.maps.MapTypeId.HYBRID)
            ? "../img/kickoff/icons/parking-white.png"
            : "../img/kickoff/icons/parking.png");
        
        kickoffUtils.map.parkingMarkers.forEach(function (mkr) {
            mkr.setIcon(newParkingIcon);
        });
    });
    
    $(".maps-btn").removeAttr("disabled");
}

$(document).ready(function () {
    // Asynchronously Load the map API
    var script = $(document.createElement('script'));
    script.attr("src", "https://maps.googleapis.com/maps/api/js?key=AIzaSyBRT2h0ZMOhp3GCf17rBzi_9QHkoQS9aws&callback=initMap");
    $(document.body).append(script);
    
    //Load team information
    fetch("../../js/kickoff/teamlist.json")
    .then( (response) =>{
        if (!response.ok) throw Error(response.statusText);
        return response.json();
    }).then(teams => {
        kickoffUtils.teams = teams;
        
        const teamNum = localStorage.getItem("team")

        if (teamNum !== null) {
            $("#teamNumInput").val(teamNum);
            kickoffUtils.teamNumAccepted(parseInt(teamNum), false);
        } else {
            kickoffUtils.teamNumAccepted(0, false)
        }
    }).catch(console.log);
    
    //Initialize countdown clock
    var computeDiff = () => {
        var diff = (getTime(10, 30).getTime() - (new Date()).getTime());
        var d, h, m, s;
        
        var clockParts = $(".countdown-clock").children();
        
        if (diff < 0) diff = 0;
        
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
        
        var times = [d, h, m, s];
        
        for (var i = 0; i < clockParts.length; ++i)
            clockParts.eq(i).text(times[i]);
    };
    
    computeDiff();
    setInterval(computeDiff, 1000);
});

function getTime (hour, minute) {
    return new Date (2019,0,5,hour,minute,0,0,0);
}
var bNs = {
    getTimeString: function (time) {
        var hour = time.getHours();
        var minute = time.getMinutes();
        var ampm = "AM";
        var pad = function (num) {
            var numStr = num.toString();
            return (numStr.length > 1) ? numStr : ("0" + numStr);
        };
        
        if (hour >= 12) {
            ampm = "PM";
            hour -= (hour > 12) ? 12 : 0;
        } else if (hour == 0) hour = 12;
        
        return hour.toString() + ":" + pad(minute) + " " + ampm;
    },
    ajaxGet: function (url, callback) {
        var xrq = new XMLHttpRequest();
        
        xrq.open("GET",url,true);
        xrq.responseType = "json";
        
        xrq.onreadystatechange = function () {
            if (xrq.readyState == 4 && (xrq.status == 200 || xrq.status == 0))
                callback(xrq.response);
        }
        
        xrq.send();
    },
    loadSchedules: function (time) {
        time = (time === undefined ? new Date() : time);
        var mainSchedule = document.querySelector("#schedule");
        
        while (mainSchedule.firstChild)
            mainSchedule.removeChild(mainSchedule.firstChild);
        
        //Fill main schedule
        bNs.schedule.forEach(function (evt) {
            var loc = bNs.resolveLocation(evt.location);
            
            if (loc.code === false) return;
            
            var cell = mainSchedule.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));
            var timeDiv = cell.appendChild(document.createElement("div"));
            var titleDiv = cell.appendChild(document.createElement("div"));
            var locLnk = cell.appendChild(document.createElement("div")).appendChild(document.createElement("a"));
            
            cell.style.textAlign = "center";
            timeDiv.style.fontWeight = "bold";
            timeDiv.textContent = bNs.getTimeString(evt.start) + " - " + bNs.getTimeString(evt.end);
            
            titleDiv.textContent = evt.event;
            locLnk.classList.add("map-jump");
            locLnk.textContent = loc.name;
            locLnk.dataset.toggle = "modal";
            locLnk.dataset.target = "#mapModal";
            locLnk.addEventListener("click", function (event) {
                var marker = bNs.getMarker(loc.code);

                bNs.map.modalTitle.text(loc.name);
                
                if (bNs.map.activeMarker) bNs.map.activeMarker.setMap(null);
                if (bNs.map.winListener) {
                    google.maps.event.removeListener(bNs.map.winListener);
                    bNs.winListener = undefined;
                    bNs.map.infoWindow.setContent("");
                }
                
                if (marker.length === 0) {
                    event.preventDefault();
                    bNs.activeMarker = undefined;
                    return;
                }
                
                var pos = new google.maps.LatLng(marker[1], marker[2]);
                bNs.map.activeMarker = new google.maps.Marker({
                   position: pos,
                   map: bNs.map.map,
                   icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                   title: loc.name
                });
                bNs.map.map.setCenter(pos);
                bNs.map.map.setZoom(18);
                
                bNs.map.winListener = google.maps.event.addListener(bNs.map.activeMarker, "click", (function(mrk) {
                    return function() {
                        bNs.map.infoWindow.setContent("<h5>" + loc.name + "</h5>");
                        bNs.map.infoWindow.open(map, mrk);
                    }
                })(bNs.map.activeMarker));
                
                setTimeout(function () {
                    google.maps.event.trigger(bNs.map.activeMarker, "click");
                    google.maps.event.trigger(bNs.map.map, "resize");
                }, 500);

                /* When the user clicks on two locations that are far away from
                 * one another, some of the tiles don't load. I'm not sure why;
                 * none of the solutions I've found seem to fix it (yet).
                 */
            });
            
            //"active" applies a gray background, "info" applies a blue background
            if (time >= evt.end) cell.parentElement.classList.add("table-active");
            else if (time >= evt.start) cell.parentElement.classList.add("table-info");
            else cell.parentElement.classList.add("table-warning");
        });
    },
    teamNumAccepted: function (event) {
        var num;
        var emptyDiv = $(".team-empty");
        var errDiv = $(".team-error");
        var dispDiv = $(".team-disp");
        var teamNumName = dispDiv.children().get(0);
        var teamSchool = teamNumName.nextElementSibling;
        
        
        if (event.currentTarget.type === "text") {
            if (event.key !== "Enter") return;
            num = parseInt(event.currentTarget.value, 10);
        } else if (event.currentTarget.type === "button") {
            num = parseInt(event.currentTarget.parentElement.previousElementSibling.value,
                           10);
        } else return;
        
        if (bNs.activeTeam.intervalId !== undefined)
            clearInterval(bNs.activeTeam.intervalId);
        
        emptyDiv.css("display", "none");
        if (bNs.setTeam(num) >= 0) {
            bNs.loadSchedules();
            bNs.activeTeam.intervalId = setInterval(bNs.loadSchedules, 900000);
            
            teamNumName.textContent = num + ": " + bNs.activeTeam.name;
            teamSchool.textContent = bNs.activeTeam.school;
            
            errDiv.css("display", "none");
            dispDiv.css("display", "block");
            
            //Make the team number persist across refreshes
            localStorage.setItem("team", bNs.activeTeam.number);
        } else {
            errDiv.css("display", "block");
            dispDiv.css("display", "none");
        }
    },
    setTeam: function (num) {
        for (var i = 0; i < bNs.teams.length; ++i) {
            if (bNs.teams[i].number === num) {
                bNs.activeTeam = bNs.teams[i];
                return bNs.teams[i].number;
            }
        }
        
        bNs.activeTeam = {};
        return -1;
    },
    resolveLocation: function (loc) {
        if (loc[0] === 't') {
            if (bNs.activeTeam.number === undefined)
                throw new Error("Team number not set");
            loc = bNs.activeTeam[loc.split(':')[1]];
        }
        
        if (loc === false) {
            return {code:false, name:"N/A"};
        }
        
        var locObj = {code:loc, name:loc};
        
        bNs.locations.forEach(function(lMapping) {
            locObj.name = locObj.name.replace(lMapping[0], lMapping[1]);
        });
        
        return locObj;
    },
    getMarker: function (code) {
      for (var i = 0; i < bNs.markers.length; ++i) {
          if (code === bNs.markers[i][0]) return bNs.markers[i];
      }
      
      return [];
    },
    activeTeam:{},
    schedule:[
       {
           event:"Team Check-In",
           start:getTime(8,0),
           end:getTime(10,0),
           location:"PIER"
       },
       {
           event:"Breakout Rooms Open",
           start:getTime(8,0),
           end:getTime(10,0),
           location:"t:breakout"
       },
       {
           event:"North Campus Tours",
           start:getTime(8,15),
           end:getTime(9,15),
           location:"PIER"
       },
       {
           event:"UM Fair",
           start:getTime(8,30),
           end:getTime(10,0),
           location:"DUDE CON"
       },
       {
           event:"Opening Ceremonies and Broadcast",
           start:getTime(10,0),
           end:getTime(11,30),
           location:"t:broadcast"
       },
       {
           event:"Kit Distribution",
           start:getTime(11,30),
           end:getTime(15,0),
           location:"CHRYS 133"
       },
       {
           event:"Game Field Open",
           start:getTime(11,45),
           end:getTime(15,0),
           location:"DUDE GAL"
       },
       {
           event:"Breakout Rooms Open",
           start:getTime(11,30),
           end:getTime(18,0),
           location:"t:breakout"
       }
    ],
    map: {
        toggleParking: function (show) {
            show = (show === undefined ? !bNs.map.parkingShown : show);

            if (show === bNs.map.parkingShown) return;

            bNs.map.parkingMarkers.forEach(function (mkr) {
                mkr.setMap(show ? bNs.map.map : null);
            });

            if (show) {
                if ($(bNs.map.map.getDiv()).width() === 0) {
                    google.maps.event.addListenerOnce(bNs.map.map, "resize", function () {
                        bNs.map.map.fitBounds(bNs.map.parkingBounds);
                    });
                } else {
                    bNs.map.map.fitBounds(bNs.map.parkingBounds);
                }
            }

            bNs.map.parkingShown = show;
            $("#map-parking-toggle").text(show ? "Hide parking" : "Show parking");
        },
        showKOP: function () {
            var mkr = bNs.getMarker(bNs.resolveLocation(bNs.schedule[5].location))
            
            if (bNs.map.activeMarker) bNs.map.activeMarker.setMap(null);
            if (bNs.map.winListener) {
                google.maps.event.removeListener(bNs.map.winListener);
                bNs.winListener = undefined;
                bNs.map.infoWindow.setContent("");
            }

            var pos = new google.maps.LatLng(mkr[1], mkr[2]);
            bNs.map.activeMarker = new google.maps.Marker({
                position: pos,
                map: bNs.map.map,
                icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                title: "KOP Pickup"
            });
            
            bNs.map.winListener = google.maps.event.addListener(bNs.map.activeMarker, "click", function () {
                bNs.map.infoWindow.setContent("<h5>KOP Pick Up</h5><br/>" + mkr[0]);
                bNs.map.infoWindow.open(map, mkr);
            });

            if ($(bNs.map.map.getDiv()).width() === 0) {
                google.maps.event.addListenerOnce(bNs.map.map, "resize", function () {
                    bNs.map.map.setCenter(pos);
                    bNs.map.map.setZoom(18);
                });
            } else {
                bNs.map.map.setCenter(pos);
                bNs.map.map.setZoom(18);
            }
        },
        parkingShown: false,
        parkingMarkers: []
    },
    locations:[
        ["220","- Chesebrough Auditorium (Room 220)"],
        ["GAL","Gallery"],
        ["CON","Connector"],
        ["DUDE","Duderstadt"],
        ["CHRYS","Chrysler"],
        ["STAMPS","Stamps Auditorium"],
        ["GGBL","GG Brown"],
        ["EECS","EECS Building"],
        ["BBB","Bob and Betty Beyster Building"],
        ["DOW","Dow Building"],
        ["PIER","Pierpont Commons"]
    ],
    parking:[
        { lot: "NC5", lat: 42.288055, lng: -83.714438 },
        { lot: "NC8", lat: 42.287934, lng: -83.713655 },
        { lot: "NC10", lat: 42.289723, lng: -83.721736 },
        { lot: "NC27", lat: 42.292254, lng: -83.718010 },
        { lot: "NC43", lat: 42.287924, lng: -83.717173 },
        { lot: "NC48", lat: 42.293288, lng: -83.717167 },
        { lot: "NC60", lat: 42.290550, lng: -83.712640 }
    ],
    markers:[
        ["PIER", 42.291384, -83.717490],
        ["DUDE CON", 42.291225, -83.716470],
        ["DUDE GAL", 42.291166, -83.716745],
        ["DUDE A", 42.291088, -83.716381],
        ["DUDE B", 42.291088, -83.716381],
        ["CHRYS 133", 42.290646, -83.716900],
        ["CHRYS 220", 42.290877, -83.716737],
        ["CHRYS 265", 42.290761, -83.716949],
        ["STAMPS", 42.291976, -83.716931],
        ["BBB 1670", 42.292868, -83.716273],
        ["BBB 1690", 42.292870, -83.716463],
        ["DOW 1005", 42.292721, -83.715589],
        ["DOW 1006", 42.292919, -83.715597],
        ["DOW 1010", 42.292937, -83.715503],
        ["DOW 1013", 42.292728, -83.715412],
        ["DOW 1014", 42.292945, -83.715350],
        ["DOW 1017", 42.292745, -83.715261],
        ["DOW 1018", 42.292880, -83.715223],
        ["DOW 2150", 42.292723, -83.715376],
        ["DOW 2166", 42.292723, -83.715376],
        ["DOW 3150", 42.292723, -83.715376],
        ["GGBL 1571", 42.293140, -83.714917],
        ["EECS 1003", 42.292653, -83.714466],
        ["EECS 1008", 42.292653, -83.714466],
        ["EECS 1012", 42.292653, -83.714466],
        ["EECS 1303", 42.292502, -83.714353],
        ["EECS 1311", 42.292323, -83.714417],
        ["EECS 1500", 42.292271, -83.714581]
    ]
};

function initMap () {
    bNs.map.map = new google.maps.Map($("#map").get(0),
                                  {
                                    center: new google.maps.LatLng(42.291964,-83.715810),
                                    zoom: 16,
                                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                                    gestureHandling: "greedy"
                                  });

    bNs.map.map.setTilt(45);
    bNs.map.infoWindow = new google.maps.InfoWindow();
    bNs.map.modalTitle = $("#map-active-loc");

    bNs.map.parkingBounds = new google.maps.LatLngBounds();

    //Initialize parking markers
    bNs.parking.forEach(function (lot) {
        var mkr = new google.maps.Marker({
            position: lot,
            map: null,
            title: lot.lot + " Parking Lot",
            icon: "../img/kickoff/icons/parking.png"
        });

        google.maps.event.addListener(mkr, "click", (function (mkr) {
            return function () {
                bNs.map.infoWindow.setContent("<h5>" + mkr.getTitle() + "</h5>");
                bNs.map.infoWindow.open(map, mkr);
            }
        })(mkr));

        bNs.map.parkingMarkers.push(mkr);
        bNs.map.parkingBounds.extend(lot);
    });

    google.maps.event.addListener(bNs.map.map, "maptypeid_changed", function () {
        var mapType = bNs.map.map.getMapTypeId();
        var newParkingIcon = ((mapType === google.maps.MapTypeId.SATELLITE || mapType == google.maps.MapTypeId.HYBRID)
                                ? "../img/kickoff/icons/parking-white.png"
                                : "../img/kickoff/icons/parking.png");

        bNs.map.parkingMarkers.forEach(function (mkr) {
            mkr.setIcon(newParkingIcon);
        });
    });

    $(".maps-btn").removeAttr("disabled");
}

$(document).ready(function () {
    // Asynchronously Load the map API
    var script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBRT2h0ZMOhp3GCf17rBzi_9QHkoQS9aws&callback=initMap";
    document.body.appendChild(script);
    
    //Load team information
    bNs.ajaxGet("../../js/kickoff/teamlist.json", function (teams) {
        bNs.teams = teams;
        
        //Load the current team
        var team = localStorage.getItem("team");
        
        if (team.length > 0) {
            var teamInput = $($(".input-group").children()[0]);
            teamInput.val(team);
            teamInput.next().trigger("click");
        }
    });
    
    //Initialize countdown clock
    var computeDiff = function () {
        var diff = (getTime(10,0).getTime() - (new Date()).getTime());
        var d,h,m,s;
        
        var countdownClock = $(".countdown-clock").get(0);
        
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
        
        for (var i = 0; i < countdownClock.children.length; ++i)
            countdownClock.children[i].textContent = times[i];
    };
    
    computeDiff();
    setInterval(computeDiff, 1000);
});

function getTime (hour, minute) {
    return new Date (2018,0,6,hour,minute,0,0,0);
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
            locLnk.textContent = loc.name;
            locLnk.href = "#map";
            locLnk.addEventListener("click", function (event) {
                var marker = bNs.getMarker(loc.code);
                
                if (bNs.map.activeMarker) bNs.map.activeMarker.setMap(null);
                if (bNs.map.winListener) {
                    google.maps.event.removeListener(bNs.map.winListener);
                    bNs.winListener = undefined;
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
                        bNs.map.infoWindow.setContent("<h3>" + loc.name + "</h3>");
                        bNs.map.infoWindow.open(map, mrk);
                    }
                })(bNs.map.activeMarker));
                
                google.maps.event.trigger(bNs.map.activeMarker, "click");
            });
            
            //"active" applies a gray background, "info" applies a blue background
            if (time >= evt.end) cell.parentElement.classList.add("active");
            else if (time >= evt.start) cell.parentElement.classList.add("info");
            else cell.parentElement.classList.add("warning");
        });
    },
    teamNumAccepted: function (event) {
        var num;
        var emptyDiv = document.querySelector(".team-empty");
        var errDiv = emptyDiv.nextElementSibling;
        var dispDiv = errDiv.nextElementSibling;
        var teamNumName = dispDiv.firstElementChild;
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
        
        emptyDiv.style.display = "none";
        if (bNs.setTeam(num) >= 0) {
            bNs.loadSchedules();
            bNs.activeTeam.intervalId = setInterval(bNs.loadSchedules, 900000);
            
            teamNumName.textContent = num + ": " + bNs.activeTeam.name;
            teamSchool.textContent = bNs.activeTeam.school;
            
            errDiv.style.display = "none";
            dispDiv.style.display = "block";
            google.maps.event.trigger(bNs.map.map, "resize");
        } else {
            errDiv.style.display = "block";
            dispDiv.style.display = "none";
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
           start:getTime(12,0),
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
    map: {},
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
    var mapJump = document.createElement("div");
    var jumpLink = mapJump.appendChild(document.createElement("a"));
    
    mapJump.classList.add("map-jump");
    jumpLink.textContent = "Return to schedule";
    jumpLink.href = "#team-num-name";
    jumpLink.style.fontSize = "1.25em";
    
    bNs.map.map = new google.maps.Map(document.querySelector("#map"),
                                  {
                                    center: new google.maps.LatLng(42.2945,-83.7215),
                                    zoom: 17,
                                    mapTypeId: google.maps.MapTypeId.ROADMAP
                                  });
    bNs.map.map.setTilt(45);
    bNs.map.infoWindow = new google.maps.InfoWindow();
    bNs.map.map.controls[google.maps.ControlPosition.TOP_CENTER].push(mapJump);
}

document.addEventListener("DOMContentLoaded", function () {
    // Asynchronously Load the map API
    var script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBRT2h0ZMOhp3GCf17rBzi_9QHkoQS9aws&callback=initMap";
    document.body.appendChild(script);
    
    //Load team information
    bNs.ajaxGet("../../js/kickoff/teamlist.json", function (teams) {
        bNs.teams = teams;
    });
    
    //Initialize countdown clock
    var computeDiff = function () {
        var diff = (getTime(10,30).getTime() - (new Date()).getTime());
        var d,h,m,s;
        
        var countdownClock = document.querySelector(".countdown-clock");
        
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

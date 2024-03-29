/* eslint-disable eqeqeq */
/* eslint-disable prettier/prettier */
/* eslint-disable indent */
/* global Module */

/* Magic Mirror
 * Module: MMM-WeasleyClock
 *
 * By Brian Hepler
 * MIT Licensed.
 */

Module.register("MMM-WeasleyClock", {
  defaults: {
    updateInterval: 60000,
    retryDelay: 5000,
    debug: false,
    sounds: true,
    volume: 75,
    locations: ["Home", "School", "Work", "Mortal Peril", "Jail", "Food"],
    people: ["Harry", "Ron", "Ginny"],
    colorCycle: ["blue", "green", "yellow", "purple", "red", "white", "gray"],
    host: "weasleymirror.duckdns.org",
    port: 8883,
    disableEncryption: false,
    uniqueId: "notunique",
    mirrorUser: null,
    mirrorPass: null,
    clockStyle: "clock",
    radius: 85,
    hubDisplacement: 5
  },

  rotationLock: false,
  requiresVersion: "2.1.0", // Required version of MagicMirror

  getScripts: function () {
    return [this.file("lib/svg.min.js"), this.file("lib/howler.min.js")];
  },

  getStyles: function () {
    return ["MMM-WeasleyClock.css"];
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    //Flag for check if module is loaded
    this.loaded = false;
    var people = this.config.people;
    this.config.volume = this.config.volume / 100;
    this.peopleMap = new Map();
    this.locationMap = new Map();

    // Make sure mandatory locations are present. Lost in front, traveling in the back
    this.config.locations = this.uniqueArray(this.config.locations);
    var lostObj = new Object();
    lostObj.name = "Lost";
    var travObj = new Object();
    travObj.name = "Traveling";
    this.locationMap.set("Lost", lostObj);
    for (i = 0; i < this.config.locations.length; i++) {
      var obj = new Object();
      obj.name = this.config.locations[i];
      this.locationMap.set(this.config.locations[i], obj);
    }
    this.locationMap.set("Traveling", travObj);

    // Set people to default location and load the map
    for (n = 0; n < people.length; n++) {
      Log.info("Processing person: " + people[n]);
      var person = new Object();
      person.location = "Lost";
      person.name = people[n];
      person.rotationLock = false;
      this.peopleMap.set(people[n], person);
    }

    // send config to node helper
    this.sendSocketNotification("MMM-WeasleyClock-CONFIG", this.config);
  },

  getDom: function () {
    var wrapper = document.createElement("div");
    wrapper.id = "weasleyClockID";
    wrapper.className = "weasleyClock";
    var locationMap = this.locationMap;
    var peopleMap = this.peopleMap;

    if (this.config.clockStyle == "table") {
      var locTable = document.createElement("table");
      locTable.className = "table";

      var thr = document.createElement("tr");
      var thp = document.createElement("th");
      var thl = document.createElement("th");
      thp.innerHTML = "<u>Who</u>";
      thl.innerHTML = "<u>Where</u>";
      thr.appendChild(thp);
      thr.appendChild(thl);
      locTable.appendChild(thr);

      var j = 0;
      for (let person of peopleMap.values()) {
        var tr = document.createElement("tr");
        var personTd = document.createElement("td");
        var personLocationTd = document.createElement("td");

        personTd.innerHTML = person.name;
        personTd.id = "perLbl-" + person.name;
        personTd.className = "person";
        personTd.style.color = this.config.colorCycle[j];

        if (person.location != null) {
          personLocationTd.innerHTML = person.location;
        } else {
          personLocationTd.innerHTML = "Lost";
        }

        personLocationTd.id = "perLoc-" + person.name;
        personLocationTd.className = "location";
        personLocationTd.style.color = this.config.colorCycle[j];

        tr.appendChild(personTd);
        tr.appendChild(personLocationTd);
        locTable.appendChild(tr);
        j++;
      }
      wrapper.appendChild(locTable);
    } else if (this.config.clockStyle == "clock") {
      // build the clock
      var draw = SVG().addTo(wrapper).size("100%", "100%");
      draw.viewbox(-150, -150, 300, 300);
      draw.className = "svgbox";
      var yNudge = 7; // vertical nudge for text

      // draw the center hub
      // var hub = draw.circle("2%").fill("grey").stroke("1").cy(0).cx(0);

      var i = 0;
      for (let location of locationMap.values()) {
        Log.debug("Placing " + location.name);

        const plier = ((2 * Math.PI) / this.locationMap.size) * i;

        var cordx = Math.cos(plier) * this.config.radius;
        var cordy = Math.sin(plier) * this.config.radius;
        var spot = draw
          .circle("1%")
          .fill("none")
          .stroke("1")
          .cx(cordx)
          .cy(cordy);
        spot.id("loc" + location.name);
        location.angle = (Math.atan2(cordy, cordx) * 180) / Math.PI;
        location.point = spot;

        var locText = draw.text(location.name).fill("white");
        locText.attr("id", "locName-" + location.name);
        locText.addClass("location");
        locText.font({
          anchor: "middle"
        });
        locText.cx(cordx).cy(cordy - yNudge);
        location.textSVG = locText;
        i++;
      }

      // create hands for people
      var j = 0;
      for (let person of peopleMap.values()) {
        var hand = this.createHand(draw, person.name).x(
          this.config.hubDisplacement
        );
        hand.attr("fill", this.config.colorCycle[j]);
        person.color = this.config.colorCycle[j];
        person.handSVG = hand;
        j++;

        Log.debug("Added hand: " + hand.id());
      }
    }
    return wrapper;
  },

  /**
   * Rotates the hand with @name to match the position of the given @location
   * @param {*} name The name of the person. Must match an entry in the people array
   * @param {*} location The location of the person. Must match an entry in the location array.
   */
  rotateHand: function (name, newLocation) {
    // var handID = "hand" + name;
    // var locID = "loc" + location;
    var hand, newLoc, newRotate, person;

    person = this.peopleMap.get(name);
    if (person == undefined) {
      return;
    } else {
      hand = person.handSVG;
    }

    if (person.rotationLock) {
      return;
    }

    newLoc = this.locationMap.get(newLocation);
    if (newLoc != undefined && this.config.debug) {
      Log.debug("Found point for " + newLoc.name);
    }

    // play sounds
    if (this.config.sounds) {
      try {
        var sound = new Howl({
          src: [
            this.file("sounds/crank-n-chimes.mp3"),
            this.file("sounds/crank-n-chimes.wav")
          ],
          volume: this.config.volume,
          onend: function () {
            Log.debug("Sound playback complete!");
          }
        });
        sound.play();
      } catch (e) {
        console.err(e);
      }
    }

    try {
      person.rotationLock = true;
      var curRotate = hand.transform().rotate;
      // var newPoint = newLoc.point;
      // var locRotate = Math.atan2(newPoint.cy(),newPoint.cx()) * 180 / Math.PI;
      var locRotate = newLoc.angle;
      if (this.config.debug) {
        Log.debug(
          "Hand is at " +
            Math.round(curRotate) +
            ", loc is at " +
            Math.round(locRotate)
        );
      }
      if (curRotate < locRotate) {
        newRotate = Math.abs(curRotate - locRotate);
      } else {
        newRotate = Math.abs(curRotate - locRotate) * -1;
      }
      newRotate = Math.round(newRotate);

      Log.debug(
        "Rotating: " +
          Math.round(curRotate) +
          " to " +
          Math.round(locRotate) +
          " (" +
          newRotate +
          ")"
      );
      person.location = newLocation;
      hand.animate(1500, 500, "now").rotate(newRotate, 0, 0);

      // Lock out hand rotation for ten seconds to prevent double-taps.
      setInterval(function () {
        person.rotationLock = false;
      }, 1000 * 10);
    } catch (e) {
      Log.err("Unable to rotate hand for " + name + " to " + location, e);
    }
  },

  /**
   * Update a person to traveling status
   * @param {String} name The name of one member of the person array
   * @param {Object} data The Owntracks message for evaluation
   */
  processTraveling: function (name, data) {
    var person = this.peopleMap.get(name);
    if (person == undefined) {
      Log.info(name + " is not one of us. Shun the unbeliever!");
      return;
    }

    if (person.location != "Traveling") {
      Log.debug(name + " is traveling.");
      person.location = "Traveling";
      if (this.config.clockStyle == "table") {
        this.updateDom(1000);
      } else {
        this.rotateHand(name, "Traveling");
      }
    } else {
      Log.debug("Duplicate assignment of " + name + " to Traveling");
    }
  },

  /**
   * Update a person to LOST status.
   * @param {*} name Name of the tracked person
   */
  processLost: function (name) {
    var person = this.peopleMap.get(name);
    if (person == undefined) {
      Log.info(name + " is not one of us. Shun the unbeliever!");
      return;
    }

    if (person.location != "Lost") {
      Log.debug(name + " is now lost. :(");

      person.location = "Lost";
      if (this.config.clockStyle == "table") {
        this.updateDom(1000);
      } else {
        this.rotateHand(name, "Lost");
      }
    } else {
      Log.debug("Duplicate assignment of " + name + "to Lost");
    }
  },

  /**
   * Processes the messages that Owntracks sends when a user enters or leaves a
   * defined region. Can't guarantee that these happen every time.
   * Note: You can be in multiple regions. We're only evaluating the first one.
   * @param {String} name Name of the person entering/leaving
   * @param {Object} data Message traffic to be evaluated
   */
  processUpdate: function (name, data) {
    var person = this.peopleMap.get(name);
    var location;

    Log.debug("Processing location update for '" + name + "'");
    Log.debug("Regions: " + data.inregions);

    // select first configured region
    for (i = 0; i < data.inregions.length; i++) {
      location = this.locationMap.get(data.inregions[i]);
      if (location != undefined) {
        break;
      }
    }

    if (person == undefined) {
      Log.info(name + " not found in list.");
      return;
    }

    if (location == undefined) {
      // people in unknown locations are lost
      Log.debug("Location '" + data.inregions[0] + "' not found.");
      this.processLost(name);

    } else {
      // found name, location.

      // avoid updates on duplicate data
      Log.debug("Checking '" + person.location + "' against '" + location.name +"'");
      if (person.location == location.name) {
        Log.debug("Duplicate location received for " + name);
        return;
      }

      Log.debug("Found matching location.");
      person.location = location.name;
      if (this.config.clockStyle == "table") {
        this.updateDom(1000);
      } else {
        this.rotateHand(name, location.name);
      }
    }
  },

  /**
   * Process notifications from the back end.
   * @param {String} notification Type of notification. Root: MMM-WeasleyClock-[type]
   * Valid types are: WAYPOINT, LOST, TRAVELING, UPDATE
   * @param {Object} payload The location & person information received from the MQTT server.
   * @override
   */
  socketNotificationReceived: function (notification, payload) {
    Log.debug("Received notification '" + notification + "' from Weasley helper.");

    this.loaded = true;
    this.mqttVal = payload;

    if (notification === "MMM-WeasleyClock-TRAVELING") {
      this.processTraveling(payload.person);
    }

    if (notification === "MMM-WeasleyClock-LOST") {
      this.processLost(payload.person);
    }

    if (notification === "MMM-WeasleyClock-UPDATE") {
      this.processUpdate(payload.person, payload);
    }

    if (notification === "MMM-WeasleyClock-WAYPOINT") {
      this.processNewLocation(payload);
    }
    // this.updateDom();
  },

  createHand: function (svg, name) {
    var pplHand = svg.text(name + " ->").id("hand" + name);
    pplHand.addClass("hand");
    // for some reason, these must be set here and not in the CSS
    pplHand.font({
      anchor: "left"
    });

    pplHand.click(function (location) {
      Log.debug("rotating hand " + pplHand.id);
    });
    return pplHand;
  },

  uniqueArray: function (array) {
    var uniqueArray = [];

    // Loop through array values
    for (i = 0; i < array.length; i++) {
      if (uniqueArray.indexOf(array[i]) === -1) {
        uniqueArray.push(array[i]);
      }
    }
    return uniqueArray;
  }
});

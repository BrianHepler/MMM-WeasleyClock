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
		locations: ["Home","School","Work","Mortal Peril","Jail","Food","Traveling"],
		people: ["Harry","Ron","Ginny"],
		host: "weasleymirror.duckdns.org",
		port: 8883,
		uniqueId: "notunique",
		clockStyle: "clock",
		radius: 85,
		cafile: "weasley_mirror_ca.crt"
	},

	colorCycle: ["blue","green","yellow","purple","red","white","gray"],
	handList: [],
	locationPoints: [],
	requiresVersion: "2.1.0", // Required version of MagicMirror

	getScripts: function() {
		return [
			"svg.min.js"
		];
	},

	getStyles: function () {
		return [
			"MMM-WeasleyClock.css",
		];
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		//Flag for check if module is loaded
		this.loaded = false;
		var people = this.config.people;

		this.locationSet = new Set(this.config.locations);
		this.locationMap = new Map();

		// Make sure mandatory locations are present
		this.config.locations = this.uniqueArray(this.config.locations);
		if (this.config.locations.indexOf("Lost") === -1) { this.config.locations.push("Lost"); }
		if (this.config.locations.indexOf("Traveling") === -1) { this.config.locations.push("Traveling"); }

		// Set people to default location
		for (n=0; n<people.length; n++) {
			console.log("Processing person: " + people[n]);
			this.locationMap.set(people[n], "Lost");
		}

		// send config to node helper
		this.sendSocketNotification("MMM-WeasleyClock-CONFIG", this.config);
	},

	getDom: function() {

		var wrapper = document.createElement("div");
		wrapper.id = "weasleyClockID";
		wrapper.className = "weasleyClock";

		var people = this.config.people;
		var locations = this.config.locations;
		const numPoints = locations.length;
		const numPeople = people.length;

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

			for (i=0; i<people.length; i++) {
				var tr = document.createElement("tr");
				var personTd = document.createElement("td");
				var personLocationTd = document.createElement("td");

				personTd.innerHTML = people[i];
				personTd.id = "perLbl-" + people[i];
				personTd.className = "person";

				var loc = this.locationMap.get(people[i]);
				if (loc != null) { personLocationTd.innerHTML = loc; }
				else { personLocationTd.innerHTML = "Lost"; }
				personLocationTd.id = "perLoc-" + people[i];
				personLocationTd.className = "location";

				tr.appendChild(personTd);
				tr.appendChild(personLocationTd);
				locTable.appendChild(tr);
			}
			wrapper.appendChild(locTable);

		} else if (this.config.clockStyle == "clock") {
			// build the clock
			this.locationPoints = [];
			this.handList = [];
			var draw = SVG().addTo(wrapper).size("100%","100%");
			draw.viewbox(-150, -150, 300, 300);

			// draw the center hub
			// var hub = draw.circle("2%").fill("grey").stroke("1").cy(0).cx(0);

			for (i=0; i<numPoints; i++) {
				if (this.config.debug) { console.log("Placing " + locations[i]); }
				const plier = 2 * Math.PI / numPoints * i;

				var cordx = Math.cos(plier) * this.config.radius;
				var cordy = Math.sin(plier) * this.config.radius;
				var spot = draw.circle("1%").fill("none").stroke("1").cx(cordx).cy(cordy);
				spot.id("loc" + locations[i]);

				var locText = draw.text(locations[i]).fill("white");
				locText.attr("id","locName-" + locations[i]);
				locText.font({
					anchor: "middle",
					size: "small",
					family: "satisfy, blackjack, cursive"
				});
				locText.cx(cordx).cy(cordy);
				this.locationPoints.push(spot);
			}

			// create hands for people
			for (j=0; j < numPeople; j++) {
				var hand = this.createHand(draw, people[j]);
				hand.attr("fill",this.colorCycle[j]);
				this.handList.push(hand);

				if (this.config.debug) { console.log("Added hand: " + hand.id()); }
			}
		}
		return wrapper;
	},

	/**
	 * Rotates the hand with @name to match the position of the given @location
	 * @param {*} name The name of the person. Must match an entry in the people array
	 * @param {*} location The location of the person. Must match an entry in the location array.
	 */
	rotateHand: function(name, location) {
		var handID = "hand" + name;
		var locID = "loc" + location;
		var hand, locPoint, newRotate;
		for (i=0; i<this.handList.length; i++) {
			if (this.handList[i].id() == handID) {
				hand = this.handList[i];
			}
		}
		for (j=0; j<this.locationPoints.length; j++) {
			if (this.locationPoints[j].id() == locID) {
				locPoint = this.locationPoints[j];
				// console.log("Found " + location);
			}
		}
		var curRotate = hand.transform().rotate;
		var locRotate = Math.atan2(locPoint.cy(),locPoint.cx()) * 180 / Math.PI;
		console.log("Hand is at " + Math.round(curRotate) + ", loc is at " + Math.round(locRotate));
		if (curRotate < locRotate) {
			newRotate = Math.abs(curRotate - locRotate);
		} else {
			newRotate = Math.abs(curRotate - locRotate) * -1;
		}
		newRotate = Math.round(newRotate);

		console.log("Rotating: " + Math.round(curRotate) + " to " + Math.round(locRotate) + " (" + newRotate + ")");
		hand.animate(1500,500,"now").rotate(newRotate, 0, 0);

		if (this.config.sounds) {
			var sound = new Audio();
			sound.src = "modules/MMM-WeasleyClock/crank-n-chimes.wav";
			sound.loop = false;
			sound.play();
		}

	},

	/**
	 * Update a person to traveling status
	 * @param {String} name The name of one member of the person array
	 * @param {Object} data The Owntracks message for evaluation
	 */
	processTraveling: function(name, data) {
		if (this.locationMap.get(name) != null) {
			// if (this.config.debug) { console.log(name + " is traveling."); }
			this.locationMap.set(name,"Traveling");
			if (this.config.clockStyle=="table") { this.updateDom(); }
			else { this.rotateHand(name, "Traveling"); }
		} else if (this.config.debug) {
			console.log(name + " is not one of us. Goodbye.");
		}

	},

	/**
	 * Update a person to LOST status.
	 * @param {*} name Name of the tracked person
	 */
	processLost: function(name) {
		if (this.locationMap.get(name) != null) {
			if (this.config.debug) { console.log(name + " is now lost. :("); }
			this.locationMap.set(name,"Lost");
			if (this.config.clockStyle=="table") { this.updateDom(); }
			else { this.rotateHand(name, "Lost"); }

		} else if (this.config.debug) {
			console.log(name + " is not one of us. Shun the unbeliever!");
		}
	},

	/**
	 * Processes the messages that Owntracks sends when a user enters or leaves a
	 * defined region. Can't guarantee that these happen every time.
	 * Note: You can be in multiple regions. We're only evaluating the first one.
	 * @param {String} name Name of the person entering/leaving
	 * @param {Object} data Message traffic
	 */
	processUpdate: function(name, data) {
		if (this.config.debug) {
			console.log("Processing location update for '" + name + "'");
			console.log("Regions: " + data.inregions);
		}
		var loc = data.inregions[0];

		if (this.locationSet.has(loc)) {
			if (this.config.debug) { console.log("Found! Updating location map."); }
			this.locationMap.set(name,loc);
			if (this.config.clockStyle == "table") { this.updateDom();}
			else {this.rotateHand(name, loc);}

		} else { // people in unknown locations are lost
			this.processLost(name);
			if (this.config.debug) { console.log("Location '" + loc + "' not found."); }
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
		if (this.config.debug) {
			console.log("Received notification '" + notification + "' from Weasley helper.");
		}
		this.loaded = true;
		this.mqttVal = payload;

		if(notification === "MMM-WeasleyClock-TRAVELING") {
			this.processTraveling(payload.person);
		}

		if(notification === "MMM-WeasleyClock-LOST") {
			this.processLost(payload.person);
		}

		if(notification === "MMM-WeasleyClock-UPDATE") {
			this.processUpdate(payload.person, payload);
		}

		if (notification === "MMM-WeasleyClock-WAYPOINT") {
			this.processNewLocation(payload);
		}
		// this.updateDom();
	},

	roundValue: function(value) {
		if (this.config.roundValue) {
		  value = parseFloat(value).toFixed(this.config.decimals);
		}
		return value;
	  },

	createHand: function(svg, name) {
		var pplHand = svg.text(name + " ->").id("hand" + name);
		pplHand.attr("id", "hand"+name);
		pplHand.font({
			family: "calligraphica, satisfy, cursive",
			anchor: "left",
			size: "x-small"
		});

		pplHand.click(function(location) {
			console.loc("rotating hand " + pplHand.id);
		});
		return pplHand;
	},

	uniqueArray: function(array) {
		var uniqueArray = [];

		// Loop through array values
		for(i=0; i < array.length; i++){
			if(uniqueArray.indexOf(array[i]) === -1) {
				uniqueArray.push(array[i]);
			}
		}
		return uniqueArray;
	},

});
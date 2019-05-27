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
		uniqueId: "default",
		debug: false,
		locations: ["Home","School","Work","Mortal Peril","Jail","Food","Traveling"],
		people: ["Brian","Deverina","Dementor"],
		host: "weasleymirror.duckdns.org",
		port: 8883,
		uniqueId: "notunique"
	},
	

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		//Flag for check if module is loaded
		this.loaded = false;
		
		this.locationSet = new Set(this.config.locations);
		this.locationMap = new Map();


		// send config to node helper
		this.sendSocketNotification("MMM-WeasleyClock-CONFIG", this.config)
	},



	

	getDom: function() {

		// create element wrapper for show into the module
		var wrapper = document.createElement("div")
		wrapper.id = "weasleyClockID"
		wrapper.className = "weasleyClock"

		var people = this.config.people
		var locations = this.config.locations

		if (!this.loaded) {
			var locTable = document.createElement("table");
			locTable.className = "table";
			for (i=0; i<locations.length; i++) {
				var tr = document.createElement("tr")
				var locationPopulationTd = document.createElement("td")
				var locationTd = document.createElement("td")
				locationTd.innerHTML = locations[i]
				locationTd.id = "loc" + locations[i]
				locationPopulationTd.id = "pop" + locations[i]
				locationPopulationTd.innerHTML = people.toString();
				locationPopulationTd.className = "hidden"
				
				tr.appendChild(locationTd)
				tr.appendChild(locationPopulationTd)
				locTable.appendChild(tr)
			}

			wrapper.appendChild(locTable);
			return wrapper;
		}

		if (this.config.debug) {
			// variable dump
			var mqttDiv = document.createElement("div")
			mqttDiv.innerHTML = this.mqttVal.toString();
			mqttDiv.className = "value bright large light";
			wrapper.appendChild(mqttDiv);

		}
		
		// ***** Disabled for testing purposes *****
		/*
		// If this.dataRequest is not empty
		if (this.dataRequest) {
			// var wrapperDataRequest = document.createElement("div");
			// wrapperDataRequest.innerHTML = this.dataRequest.title;

			// var labelDataRequest = document.createElement("label");
			// // Use translate function
			// //             this id defined in translations files
			// labelDataRequest.innerHTML = this.translate("TITLE");


			// wrapper.appendChild(labelDataRequest);
			// wrapper.appendChild(wrapperDataRequest);
			wrapper.appendChild(myclock1("weasleyClock"));
		}

		// Data from helper
		if (this.dataNotification) {
			var wrapperDataNotification = document.createElement("div");
			// translations  + datanotification
			wrapperDataNotification.innerHTML =  this.translate("UPDATE") + ": " + this.dataNotification.date;

			wrapper.appendChild(wrapperDataNotification);
		}

		*/
		return wrapper
	},

	getScripts: function() {
		return ["analogclock.js"];
	},

	// getStyles: function () {
	// 	return [
	// 		"MMM-WeasleyClock.css",
	// 	];
	// },


	/**
	 * Update a person to traveling status
	 * @param {String} name The name of one member of the person array
	 * @param {Object} data The Owntracks message for evaluation
	 */
	processTraveling: function(name, data) {
		if (checkIfNamed(name)) {
			console.log(name + " is traveling.");
		} else {
			console.log(name + " is not one of us. Goodbye.");
		}
	},

	processLost: function(name) {
		if (checkIfNamed(name)) {
			console.log(name + " is now lost. :(");
		} else {
			console.log(name + " is not one of us. Shun the unbeliever!");
		}
	},

	processLocation: function(name, data) {
		console.debug("Processing location data for '" + name + "'");
	},

	/**
	 * Processes the messages that Owntracks sends when a user enters or leaves a 
	 * defined region. Can't guarantee that these happen every time.
	 * @param {String} name Name of the person entering/leaving
	 * @param {Object} data Message traffic
	 */
	processUpdate: function(name, data) {
		console.debug("Processing location data for '" + name + "'");
	},

	/**
	 * Checks to see if the submitted name is present in the person array.
	 * @param {String} name  Name to check
	 */
	checkIfNamed: function(name) {
		if (!name) {
			return false;
		} else if (this.person.length == 0) {
			return false;
		} else {
			if (this.person.includes(name)) {
				return true;
			}
		}
		return false;
	},

	/**
	 * Process notifications from the back end.
	 * @param {String} notification Type of notification. Root: MMM-WeasleyClock-[type]
	 * Valid types are: WAYPOINT, LOCATION, LOST, TRAVELING, UPDATE
	 * @param {Object} payload The location & person information received from the MQTT server.
	 * @override
	 */
	socketNotificationReceived: function (notification, payload) {
		console.log("Received notification '" + notification + "' from helper.");
		this.loaded = true;
		this.mqttVal = payload;

		
		if(notification === "MMM-WeasleyClock-TRAVELING") {
			this.processTraveling(payload.person);
		}

		if(notification === "MMM-WeasleyClock-LOST") {
			this.processLost(payload.person);
		}

		if(notification === "MMM-WeasleyClock-LOCATION") {
			this.processLocation(payload.person, payload);
		}

		if(notification === "MMM-WeasleyClock-UPDATE") {
			this.processUpdate(payload.person, payload);
		}

		this.updateDom();
	},

	roundValue: function(value) {
		if (this.config.roundValue) {
		  value =  parseFloat(value).toFixed(this.config.decimals);
		}
		return value;
	  },


});
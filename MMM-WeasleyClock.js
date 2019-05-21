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
		var self = this;
		this.locationSet = new Set(this.config.locations);

		//Flag for check if module is loaded
		this.loaded = false;

		// send config to node helper
		self.sendSocketNotification("MMM-WeasleyClock-CONFIG", this.config)
	},



	

	getDom: function() {
		var self = this;
		console.log("Updating DOM")

		// create element wrapper for show into the module
		var wrapper = document.createElement("div")
		wrapper.id = "weasleyClockID"
		wrapper.className = "weasleyClock"

		if (this.config.debug) {
			// variable dump
			wrapper.innerHTML = "Loaded variables"
			var para = document.createElement("p")
			para.innerHTML = "updateInterval: " + this.config.updateInterval
			para.innerHTML += "<br>retryDelay: " + this.config.retryDelay
			para.innerHTML += "<br>owner: " + this.config.owner
			para.innerHTML += "<br> locations: " + this.config.locations
			para.innerHTML += "<br> devices: " + this.config.devices
			para.innerHTML += "<br> host: " + this.config.host
			para.innerHTML += "<br> port: " + this.config.port
			para.innerHTML += "<br> ca file: " + this.config.cafile

			wrapper.appendChild(para)
		} else {
			console.log("Set length is " + this.locationSet.length)
			var table = document.createElement("table")
			for (i=0; i<this.locationSet.length; i++) {
				var tr = document.createElement("tr")
				var td = document.createElement("td")
				td.innerHTML = self.locationSet[i]
				tr.appendChild(td)
				table.appendChild(tr)
			}
			wrapper.appendChild(table)
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


	processData: function(data) {
		console.log("Processing retrieved data.");
		var self = this;
		this.dataRequest = data;
		log.console("Processing data retrieved from server.")
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		// send notification to helper
		this.sendSocketNotification("MMM-WeasleyClock-NOTIFICATION_TEST", data);
		console.log("Processed.");
	},

	/**
	 * Process notifications from the back end.
	 * @param {String} notification Type of notification. Root: MMM-WeasleyClock-[type]
	 * Valid types are: WAYPOINT, LOCATION, LOST, TRAVELING
	 * @param {Object} payload The location & person information received from the MQTT server.
	 */
	socketNotificationReceived: function (notification, payload) {
		console.log("Received notification '" + notification + "' from helper.");
		if(notification === "MMM-WeasleyClock-UPDATE") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		} else {
			console.debug(payload);
		}
	},


});
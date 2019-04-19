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
		owner: "default",
		debug: false,
		locations: ["Home","School","Work","Mortal Peril","Jail","Food","Traveling"],
		devices: [
			{ name: "Brian", id: "m1"},
			{ name: "Cracked", id: "m2"},
			{ name: "Deverina", id: "d1"}
		],
		host: "weasleymirror.duckdns.org",
		port: 8883,
		cafile: "weasleymirror-ca.crt"
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);

		// send config to node helper
		this.sendSocketNotification("MMM-WeasleyClock-CONFIG", this.config)
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;

		var urlApi = self.host;
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				console.log(this.status);
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					Log.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var self = this;


		
		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		wrapper.id = "weasleyClockID"
		
		if (this.config.debug) {
			// variable dump
			wrapper.className = "weasleyClock"
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
		return wrapper;
	},

	getScripts: function() {
		return ["analogclock.js"];
	},

	getStyles: function () {
		return [
			"MMM-WeasleyClock.css",
		];
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		log.console("Processing data retrieved from server.")
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("MMM-WeasleyClock-NOTIFICATION_TEST", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-WeasleyClock-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
	},

	// override for testing purposes
	notificationReceived: function(notification, payload, sender) {
		switch(notification) {
		  case "DOM_OBJECTS_CREATED":
			console.log(this.name + " received notification " + notification);
			break
		}
	  },
});
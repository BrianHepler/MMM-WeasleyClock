/* eslint-disable curly */
/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
/* Magic Mirror
 * Node Helper: MMM-WeasleyClock
 *
 * By {{AUTHOR_NAME}}
 * {{LICENSE}} Licensed.
 */

var NodeHelper = require("node_helper");
const mqtt = require("mqtt");
const fs = require("fs");
const {Howl, Howler} = require("howler");

var client;

module.exports = NodeHelper.create({

	// Initialize MQTT connection object
	start: function() {
		
	},

	stop: function() {
		this.client.end();
		this.client = null;
	},

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		console.log("Weasley clock node helper received notifications: " + notification);
		if(notification === "MMM-WeasleyClock-CONFIG") {
			this.establishConnection(payload);
		}

		if (notification === "MMM-WeasleyClock-START") {
			if (payload.debug) { console.log("Starting Weasley Clock message client. Notification:", notification, "payload: ", payload); }
			// Send notification
			this.sendNotificationTest(this.anotherFunction()); 
		}

		// save this for later. Perhaps provide long/lat regions for push to phones.
		if (notification === "MMM-WeasleyClock-UPDATECLIENTS") {
			if (payload.debug) { console.log("Updating clients."); }
			// this.updateClients(payload);
		}

		// possibly this will never be used
		if (notification === "MMM-WeasleyClock-PLAYSOUND") {
			if (payload.debug) { console.log("Playing sound effect."); }
			this.playSound(payload);
		}
	},

	establishConnection: function(config) {
		var subTopic1 = "owntracks/" + config.uniqueId + "/";
		var options = {
			"qos": 2,
			"rap": true,
			"rh": true,
		}
		
		console.debug ("Establishing connection.");
		if (this.client == null) {
			console.debug("Getting new client object");
			this.client = this.getMQTTClient(config);
		}
		var client = this.client;

		// connect and subscribe to Owntracks topics
		client.on("connect", () => {
			console.debug("Subscribing to all content for uniqueID");
			client.subscribe(subTopic1 + "#", options, function(err, granted) {
				if (err) {
					console.error(err, "Error subscribing to topics.");
				} 
				console.debug("Subscribed: " + JSON.stringify(granted));
			});
		}); 
		
		// Handle published messages from Owntracks devices
		client.on("message", (topic, message) => {
			console.log ("message received in topic " + topic);
			try {
				var msgObj = JSON.parse(message.toString());
				this.handleMessage(config, topic, msgObj);
			} catch (e) {
				console.error("Error processing message: " + message.toString());
			}

		});
	
		client.on("error", function(error) {
			console.error("Can't connect." + error);
			process.exit(1);
		});
		

	},

	/**
	 * Creates an MQTT client object configured for a connection.
	 * @param {Object} config The configuration object as modified by the user
	 */
	getMQTTClient: function(config) {
		console.log("Establishing mqtt connection using uniqueId: " + config.uniqueId);

		var userName = ((config.mirrorUser == null) ? config.uniqueId : config.mirrorUser );
		var userPass = ((config.mirrorPass == null) ? "BogusPassword" : config.mirrorPass );
		var protocol = ((config.disableEncryption) ? "mqtt://" : "mqtts://");

		var options = {
			// clientId: "mirror-" + config.uniqueId,
			clientId: "DevBox-" + config.uniqueId,  // REMOVE WHEN DONE DEVELOPING
			username: userName,
			password: userPass,
			rejectUnauthorized: false,
			host: config.host,
			port: config.port,
			clean: false
		};

		console.debug("Connecting with: " + JSON.stringify(options));
		client = mqtt.connect(protocol + config.host, options);

		return client;
	},

	// Process the messages received by the MQTT client
	handleMessage: function(config, topic, message) {
		if (config.debug) console.debug("Message from device: " + JSON.stringify(message));

		if (message == null) {
			console.error("Null value from MQTT server.");
		}

		// extract person from path
		var topicArray = topic.split("/");
		var person = topicArray[topicArray.length - 1];
		if (config.debug) console.debug("Parsing message for '" + person + "'");

		message.person = person;

		// valid _type are: beacon, card, cmd, configuration, encrypted, location, lwt, steps, transition, waypoint, waypoints
		if (config.debug) console.debug("processing message type: " + message._type);

		switch (message._type) {
		case "waypoint": console.debug("New Waypoint detected");
			this.sendSocketNotification("MMM-WeasleyClock-WAYPOINT", message);
			break;

		case "location": console.debug("location detected");
			this.processLocation(config, message);
			break;

		case "transition": console.debug("transition event detected.");
			this.processTransition(config, message);
			break;

		case "lwt": console.debug("LWT event detected.");
			// var options = { key : message.tid, location: "lost"};
			// sendSocketNotification("MMM-WeasleyMirror-LOST", options);
			this.sendSocketNotification("MMM-WeasleyClock-LOST", message);
			break;

		default: if (config.debug) console.debug("Event received but not processed.");
		}
		
	},

	/**
	 * Processes the location messages. Looks for a high velocity and a location.
	 * Currently, location takes precedence over velocity, so if you're driving
	 * past a location, it will mark you as in that location instead of traveling.
	 * @param {*} config Configuration object passed in from the module.
	 * @param {*} message Message received from the MQTT server.
	 */
	processLocation: function(config, message) {
		var vel = message.vel;
		if (config.debug) console.debug("Traveling at " + vel);
		
		// check for region
		if (message.inregions) {
			console.log(message.person + " is in region '" + message.inregions + "'");
			this.sendSocketNotification("MMM-WeasleyClock-UPDATE", message);
		} else if (vel > 10) {
			console.log("Mark " + message.person + " as traveling");
			this.sendSocketNotification("MMM-WeasleyClock-TRAVELING", message);
		}
		
	},

	// Looks for module location match with transition message.
	// Note: transition messages put regions in the "desc" field.
	processTransition: function(config, message) {
		var event = message.event;

		if (event == "enter") {
			if (config.debug) console.debug(message.person + " has entered region(s) '" + message.desc +"'");
			message.inregions = new Array(message.desc);
			this.sendSocketNotification("MMM-WeasleyClock-UPDATE", message);
		} else {
			if (config.debug) console.debug(message.person + " has just left '" + message.inregions + "'");
			this.sendSocketNotification("MMM-WeasleyClock-TRAVELING", message);
		}

		//TODO: add notification noise to signal change in state.
	},

	playSound: function (config) {
		var filename = "/sounds/crank-n-chimes.mp3";
		let soundfile = this.path + filename;

		// Make sure file exists before playing
		try {
			fs.accessSync(soundfile, fs.F_OK);
			if (config.debug) console.debug("Playing " + soundfile);
			
			var howl = new Howl(
				{
					src:[soundfile],
					onend: function() {
						if (config.debug) console.debug("Finished playback.");
					  }
				});
		
		} catch (e) {
			// Custom sequence doesn't exist
			console.error("Sound does not exist: " + soundfile);
			return;
		}

	},

});
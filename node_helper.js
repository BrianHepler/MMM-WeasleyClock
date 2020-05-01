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
var subTopic = "";
var pubTopic = "";
var client;

module.exports = NodeHelper.create({

	// Initialize MQTT connection object
	start: function() {
		// var client = new Messaging.Client()
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
			console.log("Starting Weasley Clock message client. Notification:", notification, "payload: ", payload);
			// Send notification
			this.sendNotificationTest(this.anotherFunction()); 
		}

		if (notification === "MMM-WeasleyClock-UPDATECLIENTS") {
			console.log("Updating clients.");
			this.updateClients(payload);
		}
	},

	establishConnection: function(config) {
		this.subTopic = "owntracks/" + config.uniqueId + "/";
		if (this.client == null) {
			this.client = this.getMQTTClient(config);
			// handle the events from the MQTT server
			this.client.on("connect", ()=> {
				console.log("MQTT connection established.");
	
				// Subscribe to each person's device updates
				for (i=0; i< config.people.length; i++) {
					console.log("Subscribing to " + this.subTopic + config.people[i] + "/+");
					this.client.subscribe(this.subTopic + config.people[i] + "/#");
				}
	
				this.client.on("message", (topic, message) => {
					console.log ("message received in topic " + topic);
					var msgObj = JSON.parse(message.toString());
					this.handleMessage(config, topic, msgObj);
				});
			});
	
			this.client.on("error", function(error) {
				console.error("Can't connect." + error);
				process.exit(1);
			});
		}

	},

	/**
	 * Creates an MQTT client object configured for a connection.
	 * @param {Object} config The configuration object as modified by the user
	 */
	getMQTTClient: function(config) {
		console.log("establishing mqtt connection using uniqueId: " + config.uniqueId);
		var caFile = fs.readFileSync(this.path + "/weasley_mirror_ca.crt");
		var options = {
			clientId: "mirror-" + config.uniqueId,
			rejectUnauthorized: false,
			host: config.host,
			port: config.port,
			clean: true,
			ca: caFile
		};

		console.debug(options);
		client = mqtt.connect("mqtts://" + config.host, options);

		return client;
	},

	// Process the messages received by the client
	handleMessage: function(config, topic, message) {
		console.log("Processing message:");
		console.debug(message);

		if (message == null) {
			console.error("Null value from MQTT server.");
		}

		// extract person from path
		var topicArray = topic.split("/");
		var person = topicArray[topicArray.length - 1];
		console.debug("Parsing message for '" + person + "'");

		message.person = person;

		// valid _type are: beacon, card, cmd, configuration, encrypted, location, lwt, steps, transition, waypoint, waypoints
		console.debug("processing message type: " + message._type);
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

		default: console.debug("Event received but not processed.");
		}
		
	},

	/**
	 * Processes the location messages. Looks for a high velocity and a location.
	 * Currently, location takes precedence over velocity, so if you're driving
	 * past a location, it will mark you as in that location instead of traveling.
	 * @param {*} config 
	 * @param {*} message 
	 */
	processLocation: function(config, message) {
		var vel = message.vel;
		console.log("Traveling at " + vel);
		
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
			console.log(message.person + " has entered region(s) '" + message.desc +"'");
			message.inregions = new Array(message.desc);
			this.sendSocketNotification("MMM-WeasleyClock-UPDATE", message);
		} else {
			console.log(message.person + " has just left '" + message.inregions + "'");
			this.sendSocketNotification("MMM-WeasleyClock-TRAVELING", message);
		}

		//TODO: add notification noise to signal change in state.
	},

	/**
	 * Loops through the configured people and issues a remote configuration command. 
	 * The command changes the default publish topic to exclude the device ID from
	 * the topic.
	 * @param {Object} config 
	 */
	updateClients: function(config) {
		var people = config.people;
		var numPeople = people.length;
		var numDevices = this.idSet.length;
		
		var options = {
			_type: "cmd",
			action: "setConfiguration",
			configuration: {
				_type: "configuration",
				subTopicBase: pubTopic + "%u"
			}
		};
		
		for (i=0; i < numPeople; i++) {
			console.log ("looping over " + numDevices + " devices.");
			for (g=0; g < numDevices; g++) {
				console.debug("Issuing command to " + pubTopic + "/" + people[i] + "/" +idSet[g]);
				cmdClient.publish(pubTopic + "/" + people[i] + "/" + idSet[g], options);
			}
		}
		cmdClient = null;
	}

});
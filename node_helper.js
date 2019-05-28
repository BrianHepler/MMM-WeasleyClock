/* Magic Mirror
 * Node Helper: MMM-WeasleyClock
 *
 * By {{AUTHOR_NAME}}
 * {{LICENSE}} Licensed.
 */

var NodeHelper = require("node_helper");
var mqtt = require("mqtt");
var subTopic = "";
var pubTopic = "";
var client;

module.exports = NodeHelper.create({

	// Initialize MQTT connection object
	start: function() {
		// var client = new Messaging.Client()
	},

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		console.log("Weasley clock node helper received notifications: " + notification)
		if(notification === "MMM-WeasleyClock-CONFIG") {
			this.establishConnection(payload)
		}

		if (notification === "MMM-WeasleyClock-START") {
			console.log("Starting Weasley Clock message client. Notification:", notification, "payload: ", payload);
			// Send notification
			this.sendNotificationTest(this.anotherFunction()); //Is possible send objects :)
		}

		if (notification === "MMM-WeasleyClock-UPDATECLIENTS") {
			console.log("Updating clients.");
			this.updateClients(payload);
		}
	},


	establishConnection: function(config) {
		this.subTopic = "owntracks/" + config.uniqueId + "/";
		this.pubTopic = "owntracks/" + config.uniqueId + "/";
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
				process.exit(1)
			});
		}

	},


	/**
	 * Creates an MQTT client object configured for a connection.
	 * @param {Object} config The configuration object as modified by the user
	 */
	getMQTTClient: function(config) {
		console.log("establishing mqtt connection using uniqueId: " + config.uniqueId);
		var host = config.host
		var options = {
			clientId: "mirror-" + config.uniqueId,
			rejectUnauthorized: false,
			host: config.host,
			port: config.port,
			clean: true
		}

		console.debug(options);
		client = mqtt.connect("mqtt://" + host, options);

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
			// this.sendSocketNotification("MMM-WeasleyClock-LOCATION", message);
			this.processLocation(config, message);
			break;

		case "transition": console.debug("transition event detected.");
			// this.updateLocation(config, message, message.desc)
			this.sendSocketNotification("MMM-WeasleyClock-UPDATE", message);
			break;

		case "lwt": console.debug("LWT event detected.");
			this.sendSocketNotification("MMM-WeasleyClock-LOST", message);
			break;

		default: console.debug("Event received but not processed.");
		}
		var payload = {

		}
	},

	// Looks for velocity above zero. Send "traveling" message.
	processLocation: function(config, message) {
		var vel = message.vel;
		console.debug("Traveling at " + vel);
		
		// check for region
		if (message.inregions) {
			// found one
			console.debug(message.person + " is in region '" + message.inregions + "'");
			this.sendSocketNotification("MMM-WeasleyMirror-UPDATE", message);
		} else  if (vel > 10) {
			console.debug("Mark as traveling");
			this.sendSocketNotification("MMM-WeasleyMirror-TRAVELING", message);
		}
		
	},

	// Looks for module location match with transition message.
	processTransition: function(config, message) {

	},

	//  Last Will and Testiment messages get routed to "lost" status
	processLWT: function (config, message) {
		var options = { key : message.tid, location: "lost"};
		sendSocketNotification("MMM-WeasleyMirror-LOST", options);
	},

	updateLocation: function(config, message, location) {
		var locs = config.locations;
		console.debug("Location list:");
		console.debug(config.locations);
		var match = locs.some(function(value,location) {
			console.debug("Matching '" + value + "' against '" + location + "'");
			return value.toLowerCase() == location.toLowerCase();
		});
		console.debug("Match found: " + match);

		if (match) {
			var options = { "key":message.tid, "location":location};
			sendSocketNotification("MMM-WeasleyClock-UPDATE", options);
		}
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
		var numDevices = this.idSet.length
		
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
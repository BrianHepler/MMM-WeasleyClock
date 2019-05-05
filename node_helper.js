/* Magic Mirror
 * Node Helper: MMM-WeasleyClock
 *
 * By {{AUTHOR_NAME}}
 * {{LICENSE}} Licensed.
 */

var NodeHelper = require("node_helper");
var mqtt = require("mqtt");

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
	},


	establishConnection: function(config) {
		console.log("establishing mqtt connection using uniqueId: " + config.uniqueId);
		var subTopic = "owntracks/" + config.uniqueId + "/";
		var host = config.host
		var options = {
			clientId: "mirror-" + config.uniqueId,
			rejectUnauthorized: false,
			host: config.host,
			port: config.port,
			clean: true
		}

		console.debug(options);
		const client = mqtt.connect("mqtt://" + host, options);

		// handle the events from the MQTT server
		client.on("connect", ()=> {
			console.log("MQTT connection established.");

			// Subscribe to each person's device updates
			for (i=0; i< config.people.length; i++) {
				console.log("Subscribing to " + subTopic + config.people[i]);
				client.subscribe(subTopic + config.people[i]);
			}

			client.on("message", (topic, message) => {
				console.log ("message received in topic " + topic);
				var msgObj = JSON.parse(message.toString());
				this.handleMessage(config, topic, msgObj);
			});
		});

		client.on("error", function(error) {
			console.error("Can't connect." + error);
			process.exit(1)
		});
	},

	// Process the messages received by the client
	handleMessage: function(config, topic, message) {
		console.log("Processing message:");
		console.debug(message);

		if (message == null) {
			console.error("Null value from MQTT server.");
		}

		// valid _type are: beacon, card, cmd, configuration, encrypted, location, lwt, steps, transition, waypoint, waypoints
		console.debug("processing message type: " + message._type);
		switch (message._type) {
		case "waypoint": console.debug("New Waypoint detected");
			this.sendSocketNotification("MMM-WeasleyClock-WAYPOINT", message);
			break;

		case "location": console.debug("location detected");
			this.sendSocketNotification("MMM-WeasleyClock-LOCATION", message);
			break;

		case "transition": console.debug("transition event detected.");
			this.updateLocation(config, message, message.desc)
			break;

		case "lwt": console.debug("LWT event detected.");
			this.sendSocketNotification("MMM-WeasleyClock-LOST", message);
			break;

		default: console.debug("Event received but not processed.");
		}
		var payload = {

		}
		// send update to mirror
		this.sendSocketNotification("MMM-WeasleyClock-MOVEMENT", payload);
	},

	// Looks for velocity above zero. Send "traveling" message.
	processLocation: function(config, message) {

	},

	// Looks for module location match with transition message.
	processTransition: function(config, message) {

	},

	//  Last Will and Testiment messages get routed to "lost" status
	processLWT: function (config, message) {
		var options = { key : message.tid, location: "lost"};
		sendSocketNotification("MMM-WeasleyMirror-UPDATE", options);
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
	}

});
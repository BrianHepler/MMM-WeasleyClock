/* Magic Mirror
 * Node Helper: MMM-WeasleyClock
 *
 * By Brian Hepler
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var mqtt = require("mosquitto-clients");

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
		if (notification === "MMM-WeasleyClock-CONFIG") {
			this.establishConnection(payload)
		}

		if (notification === "MMM-WeasleyClock-NOTIFICATION_START") {
			console.log("Starting Weasley Clock message client. Notification:", notification, "payload: ", payload);
			// Send notification
			this.sendNotificationTest(this.anotherFunction()); //Is possible send objects :)
		}
	},

	establishConnection: function(config) {
		var options = {
			clientid: payload.clientid,
			
		}
		var url = payload.url
		var host = payload.host
		var topic = payload.topic
		var client = mqtt.connect(url, )
	},

	// Example function send notification test
	sendNotificationTest: function(payload) {
		var host = payload.host;
		var port = payload.port;
		var cafile = payload.cafile;
		var debug = payload.debug;
		var owner = payload.owner;

		var topic = "owntracks/" + owner + "/#";

		var command = "mosquitto_sub";
		command += " -h " + host + " --cafile '" + cafile + "' -p " + port + " -t '" + topic + "'";
		
		if (debug) { console.log("Connecting to MQTT broker with: " + command) }

		// this.sendSocketNotification("MMM-WeasleyClock-NOTIFICATION_TEST", payload);
	},

	// this you can create extra routes for your module
	extraRoutes: function() {
		var self = this;
		this.expressApp.get("/MMM-WeasleyClock/extra_route", function(req, res) {
			// call another function
			values = self.anotherFunction();
			res.send(values);
		});
	},

	// Test another function
	anotherFunction: function() {
		return {date: new Date()};
	}
});
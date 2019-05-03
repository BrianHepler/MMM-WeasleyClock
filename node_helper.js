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
		console.log("Weasley clock received notifications: " + notification)
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
		console.log("establishing mqtt connection");
		// var topic = config.uniqueId
		var topic = "owntracks/#"
		var host = config.host
		var options = {
			clientId: "mirror-" + config.uniqueId,
			rejectUnauthorized: false,
			host: config.host,
			port: config.port,
			clean: true
		}


		console.debug(options);
		const client = mqtt.connect("mqtt://" + host, options)

		// handle the events from the MQTT server
		client.on("connect", ()=> {
			console.log("MQTT connection established. Subscribing to " + topic)
			client.subscribe(topic)
		})

		client.on("message", (topic, message) => {
			console.log ("message received in topic " + topic);
			console.log (message);
			this.sendSocketNotification("MMM-WeasleyClock-EVENT", message);
		})

		client.on("error", function(error) {
			console.error("Can't connect." + error);
			process.exit(1)
		})
	},

	handleMessage: function(config, message) {
		console.log("Processing message:");
		console.debug(message);


		var payload = {

		}
		// send update to mirror
		this.sendNotification("MMM-WeasleyClock-MOVEMENT", payload);
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


});
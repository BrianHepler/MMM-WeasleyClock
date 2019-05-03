# MMM-WeasleyClock
Magic Mirror module for displaying results from OpenTracks

* Installation *
Installation of the Magic Mirror module is similar to all other modules:
```
cd /home/pi/MagicMirror/modules
git clone https://github.com/BrianHepler/MMM-WeasleyClock
cd MMM-WeasleyClock
npm install
```


* Configuration Options * 
```
{
			module: "MMM-WeasleyClock",
			position: "middle_center",
			config: {
				updateInterval: 1000 * 60 * 60,
				uniqueId: "CowboysDude",
				locations: {"School", "Work", "Jail", "Mortal Peril", "Bar", "Travelling", "Coding"},
				peopleMap: [
					{D1:"Brian"},
					{W1:"Wife"}, 
					{C1:"First Born"}, 
					{O1:"Other Child"}
					]
				},
			}
		},
```

** Configuring the Owntracks Mobile Client **
Owntracks is a free mobile app that will track your location and send updates to a MQTT server. Here is how you configure the mobile app to work with my MQTT server.

* Download the Owntracks app from the Google Play Store (or possibly the iTunes store)
* Open the menu and then go to Preferences
* Click on Connection
* CLick on Mode. Select `Private MQTT`. Accept
* Click on Host. Enter `weasleymirror.duckdns.org` for Host, `8883` for port, no websockets
* Click on Identification. Enter your Unique ID in the username. This is what identifies your messages as belonging to you. It must match the value of the `uniqueId` parameter in your module config.
* Enter anything in the Device ID. Enter a two-letter identifier in Tracker ID that matches one of your configured keys in the `peopleMap` field in your module configuration. In the example above, "D1", "W1", "C1" or "O1" are all valid entries.
* Select Parameters. Make sure Clean Session is ON.
* Go back to Preferences. Go to Reporting and turn on extended reporting.


Magic Mirror module for displaying results from OwnTracks (www.owntracks.org)

Example OwnTracks data: `{"_type":"location","acc":6,"alt":56,"batt":96,"conn":"w","lat":38.6873502,"lon":-77.4172194,"t":"u","tid":"m1","tst":1553036588,"vac":12,"vel":52}`

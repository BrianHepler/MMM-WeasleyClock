# MMM-WeasleyClock
Magic Mirror module for displaying results from OpenTracks

## Installation 
Installation of the Magic Mirror module is similar to all other modules:
```
cd /home/pi/MagicMirror/modules
git clone https://github.com/BrianHepler/MMM-WeasleyClock
cd MMM-WeasleyClock
npm install
```


## Configuration Options 
```
{
    module: "MMM-WeasleyClock",
        position: "middle_center",
        config: {
           uniqueId: "CowboysDude",
           locations: {"School", "Work", "Jail", "Mortal Peril", "Bar", "Travelling", "Coding"},
           people: ["Cowboy","Brian","Dementor"],
        },
},
```

## Configuring the OwnTracks Mobile Client 
Owntracks is a free mobile app that will track your location and send updates to a MQTT server. Here is how you configure the mobile app to work with my MQTT server.

* Download the Owntracks app from the Google Play Store (or possibly the iTunes store)
* Open the menu and then go to Preferences
* Click on Connection
* CLick on Mode. Select `Private MQTT`. Accept
* Click on Host. Enter `weasleymirror.duckdns.org` for Host, `8883` for port, no websockets
* Click on Identification. Enter your Unique ID in the username. This is what identifies your messages as belonging to you. It must match the value of the `uniqueId` parameter in your module config. **Every mobile device that you set up must use the same uniqueId in the username field**. This will let you keep your location data separate from everyone else.
* Enter your name in the Device ID field. This should be one of the entries in the *people* array from your module configuration. This lets the module tell your mobile devices apart from each other.
* Enter a two-letter identifier in Tracker ID that matches one of your configured keys in the `peopleMap` field in your module configuration. In the example above, "D1", "W1", "C1" or "O1" are all valid entries.
* Select Parameters. Make sure Clean Session is ON.
* Go back to Preferences. Go to Reporting and turn on extended reporting.

Just FYI - Owntracks mobile app will automatically publish to "owntracks/*uniqueId*/deviceId"

## Setting up Regions in OwnTracks
The way this works is that when your cell phone/table enters a defined region, it publishes a notification to the MQTT server. To get it to work, you have to define what regions correspond to what name.

Start with the list of locations that you defined in the `locations` parameter in the module configuration. "School", "Home", "Mortal Peril", etc. 
* In the mobile application, click on the menu icon (the three horizontal lines) and then select "Regions". 
* Click on the plus (+) icon to create a new region. 
* Give your region one of the names in your location array. 
* Click on the crosshairs icon in the upper right to go to the location selection screen Either use the search bar at the top to find an address, or drag the screen around to find the correct location.
* Click on the "Use this location" button to finalize the location on the planet for your region.
* Add a radius in the last field of the region. 250 meters is pretty good.
* Click on the check mark icon at the top to save your region.

Do this for each region that you wish to use. It is important to note that each region can be definited differently for each device.



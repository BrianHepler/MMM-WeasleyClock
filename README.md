# MMM-WeasleyClock
<img src=images/module1.png border=1 width=600><br>
A Magic Mirror module for displaying results from [OwnTracks](http://owntracks.org) in a manner similar to the _Harry Potter_ series of movies. This module will parse messages sent from your mobile phone and display your rough location.

This module was inspired by the Instructable [Build Your Own Weasley Location Clock](https://www.instructables.com/id/Build-Your-Own-Weasley-Location-Clock/).

1. [Module Installation](#Installation)
2. [Configuring the Module](#Configuration)
3. [Installing OwnTracks on Your Phone](#Owntracks)
4. [Adding Locations to Your Phone](#regions)
5. [If You Want to Use Your Own MQTT Server](#development)
6. [How it Works](#Architecture)
7. [Upcoming Features](#todo)

## Installation
Installation of the Magic Mirror module is similar to all other Magic Mirror modules:
```
cd /home/pi/MagicMirror/modules
git clone https://github.com/BrianHepler/MMM-WeasleyClock
cd MMM-WeasleyClock
npm install
```
Modify your `config.js` file to include the module.
```
{
    module: "MMM-WeasleyClock",
    position: "middle_center",
    config: {
        uniqueId: "demo",
    },
},
```

<a href="#modconfig"></a>
## Configuration 
Your configuration needs to contain a unique identifier that will separate your module from all of the other modules (namely mine). This unique ID will be entered both in the module and OwnTracks app on your phone. If you do not enter a unique ID, everyone who uses the same ID will be able to see your movements.
```
{
    module: "MMM-WeasleyClock",
    position: "middle_center",
    config: {
        uniqueId: “MovieFamily”,
        locations: ["School", "Work", "Jail", "Mortal Peril", "Bar", "Home"],
        people: ["Harry","Ron","Hermione",”Ginny”],
    },
},
```
See the [full list of options](#configoptions).

## Installation on Your Phone
OwnTracks is a free application for your mobile phone. Go to the Google Play Store or the iTunes store and search for OwnTracks. Install the app and then open it, just like you were installing Candy Crush.

Once the app is open, click on the menu in the upper left and select Preferences at the bottom.<br><img src=images/menu.png height=400 border=1> <img src=images/preferences.png height=400 border=1>

Press the Connection option and then the Mode option to switch to MQTT. Click Accept to return.
<br><img src=images/connection.png height=300 border=1><br>
Configure the Host menu with the following values. Host=`weasleymirror.duckdns.org`, Port=`8883`. ClientID can be any unique value. Do not use websockets. Click Accept to return.
<br><img src=images/host.png height=200 border=1><br>
Configure the Identification values. The fields in the OwnTracks app do not exactly match up to the module's terminology. So here is what you put in each field:
* `Username` = Your unique ID from the module configuration. Any alphanumeric string, may not contain spaces.
* `Password` = Make up a password. It doesn't matter.
* `Device ID` = The name of the person using this phone. A single word, no spaces. This must match one of the entries in the `people` array in your module configuration.
* `Tracker ID` = A two-character identifier. Can be any 2 alphanumeric characters. Click Accept to return.
<br><img src=images/identification.png height=200 border=1><br>

In the Security submenu, turn on TLS. Leave the rest of the fields blank. Click Accept to return.
<br><img src=images/security.png border=1 height=200><br>
Finally, configure the client to use a clean session. (basically, have no memory of previous connections)<br> Click Accept to return.
<img src=images/parameters.png border=1 height=200><br>
Once everything is complete, you can go back to the Preferences menu and click on the Status menu item and see Connected at the top.<br>
<img src=images/status_success.png border=1 height=300>


Whew! At this point, you are connected to my MQTT server, but your phone doesn't know anything about the locations you specified in the `config.js`. Specifying a location in OwnTracks is currently rather cumbersome, but it's worth it when you're done.

You need to create Regions in OwnTracks that match to the locations you wish to display in your Weasley Clock.

### Adding Regions to OwnTracks
In order for the module to work, the OwnTracks app will need to know the location of each location you're displaying in the module. So you'll need:
- The list of locations that you configured for your mirror.
- The longitude & latitude for each of those locations.

Note: The locations can be different for each phone. For example, my wife and I both have "Work" configured on our phones, but we have different long/lat configured. As our respective phones enter the different regions, they each report that we have entered "Work" to the mirror.

In the OwnTracks app, opent he menu and click on Regions. Click on the "+" button to add a new region. Enter the name of the location and the longitude & latitude. Add a radius to define the area that the phone will consider to be that location. 250 meters is a good starting point.
<br><img src="images/regions.png" border=1 height=200> <img src=images/region_edit.png border=1 height=200>

<a href="#configoptions"></a>
## Configuration Options (Module)
These are the options to configure the module. Configuring the OwnTracks application will be handled below.

<table>
<tr><th>Option</th><th>Description</th></tr>
<tr><td><b>uniqueId</b></td>
    <td><b>Description: </b>The unique identifier shared between your instance of the MMM-WeasleyClock module and your OwnTracks apps. This value must also be set in the OwnTracks app in the Username field. (Capitalization is important!)
        <br><b>Default: </b>"notunique"
        <br>Note: Leaving this unchanged will allow everyone else with this module to see your locations on their cell phones.
    </td>
</tr>
<tr><td><b>locations</b></td>
    <td><b>Description: </b>An array of location names. These are the possible locations that the module will display. They must match the names of the regions you define in the OwnTracks application. (Capitalization is important!)
        <br><b>Default: </b>["Home","School","Work","Mortal Peril","Jail","Food"]
        <br><b>Note</b>: There are two additional locations that are reserved: "Traveling" and "Lost". They will be included automatically.
    </td>
</tr>
<tr><td><b>people</b></td>
    <td><b>Description: </b>An Array of names. Each one will be represented by a hand on the clock. Each OwnTracks app must be configured with one of these names in the Device ID field. (Capitalization is important!)
        <br><b>Default: </b>["Harry","Ron","Ginny"]
    </td>
</tr>
<tr><td><b>colorCycle</b></td>
    <td><b>Description: </b>An array of color names that will be used for the hands.
        <br><b>Default: </b>["blue","green","yellow","purple","red","white","gray"]
    </td>
</tr>
<tr><td><b>radius</b></td>
    <td><b>Description: </b>The radius of the circle that defines the positioning of the locations around a central point. Adjust this to tighten up or expand your clock size.
        <br><b>Default: </b>85
        <br><b>Note: </b>Has no effect on the table display.
    </td>
</tr>
<tr><td><b>hubDisplacement</b></td>
    <td><b>Description: </b>The space between the center point and the beginning of each hand.
        <br><b>Default: </b>5
    </td>
</tr>

<tr><td><b>sounds</b></td>
    <td><b>Description: </b>Turns on or off the sound that plays when the hands move position. Sound does not play in table mode.
        <br><b>Default: </b>true
    </td>
</tr>
<tr><td><b>debug</b></td>
    <td><b>Description: </b>Turns on the debug messages logging in the node console. You can see this via an SSH connection & `pm2 log 0`
        <br><b>Default: </b>false
        <br><b>Note: </b>I'm a bit verbose.
    </td>
</tr>
<tr><td><b>host</b></td>
    <td><b>Description: </b>The URL of the MQTT server (aka, the message broker). This is where the module will listen for messages from OwnTracks.
        <br><b>Default: </b>weasleymirror.duckdns.org
    </td>
</tr>

<tr><td><b>mirrorUser</b></td>
    <td><b>Description: </b> If you are running your own MQTT server with password authentication, you can specify the username that the module uses to log in here.
        <br><b>Default: </b> null
    </td>
</tr>

<tr><td><b>mirrorPass</b></td>
    <td><b>Description: </b> If you are running your own MQTT server with password authentication, you can specify the password that the module uses to log in here.
        <br><b>Default: </b> null
    </td>
</tr>
<tr><td><b>port</b></td>
    <td><b>Description: </b>The network port used to connect to the MQTT server.
        <br><b>Default: </b>8883
    </td>
</tr>

<tr><td><b>disableEncryption</b></td>
    <td><b>Description: </b>Set to true if you're running your own MQTT server without TLS.
        <br><b>Default: </b>false
    </td>
</tr>
</table>

## OwnTracks
Owntracks is a free mobile app that will track your location and send updates to a MQTT server. These steps will get your phones to use my MQTT server. All of these steps are to be taken on your mobile phone.

* Install the Owntracks app from the Google Play Store or the iTunes Store
* Open the app, go through the introduction, open the menu (three horizontal lines in the upper left hand corner) and then go to Preferences
* Click on Connection
* CLick on Mode. Select `MQTT`. Accept
* Click on Host. Enter `weasleymirror.duckdns.org` for Host, `8883` for port, no websockets
* Click on Identification. Enter your Unique ID in the username. This is what identifies your messages as belonging to you. It must match the value of the `uniqueId` parameter in your module config. **Every mobile device that you set up must use the same uniqueId in the username field**. This will let you keep your location data separate from everyone else.
* Enter your name in the Device ID field. This should be one of the entries in the *people* array from your module configuration. This lets the module tell your mobile devices apart from each other.
* Enter a two-letter identifier in Tracker ID field. This value does not make a difference, but OwnTracks requires it.
* Select Parameters. Make sure Clean Session is ON.
* Go back to Preferences. Go to Reporting and turn on extended reporting.

## Regions
Regions = Locations in your module configuration. The way this works is that when your cell phone/table enters a defined region, it publishes a notification to the MQTT server. To get it to work, you have to define for your phone what regions correspond to what name. It is important to note that each region can be defined differently for each device. For example, you and your spouse can have different regions called "Work".

Note: Two names are reserved by the module: Traveling and Lost.

Unfortunately, the new versions of OwnTracks requires you to specify longitude & latitude when defining regions. So you can define these regions the hard way or the harder way.

### The Hard Way
Start with the list of locations that you defined in the `locations` parameter in the module configuration. "School", "Home", "Mortal Peril", etc. Using your favorite mapping website, look up the longitude & latitude for each location and write it down.

* In the mobile application, click on the menu icon (the three horizontal lines) and then select "Regions". 
* Click on the plus (+) icon to create a new region.
* Give your region one of the names in your location array. Spelling and capitalization are important!
* Enter the longitude & latitude of the center of the region.
* Add a radius in the last field of the region, measured in meters. 250 meters is pretty good.
* Click on the check mark icon at the top to save your region.

### The Harder Way
Start with the list of locations that you defined in the `locations` parameter in the module configuration. "School", "Home", "Mortal Peril", etc. Just straight up travel to each of these locations. Home, School, Bar, etc should be pretty easy. "Mortal Peril" could get interesting.

* In the mobile application, click on the menu icon (the three horizontal lines) and then select "Regions". 
* Click on the plus (+) icon to create a new region.
* Give your region one of the names in your location array. Spelling and capitalization are important!
* The longitude & latitude will be filled in for you.
* Add a radius in the last field of the region, measured in meters. 250 meters is pretty good.
* Click on the check mark icon at the top to save your region

## If You Want to Use Your Own MQTT Server
You don't have to use my MQTT server. You are welcome to set up your own. I have a separate page on [how to set up Mosquitto](MosquittoSetup.md) on your Magic Mirror so you can keep your data to yourself.

## How It Works
The basic operational flow goes like this:
* The OwnTracks mobile app uses your phone's location services to figure out 
where you are and if you are in a defined area. 
* The app securely publishes a small message to a MQTT server with that information.
* The module securely subscribes to that same server and reads the messages as they arrvie.
* The module matches the fields in the message to the configured people & locations and updates accordingly.

I am hosting an MQTT server for this module at weasleymirror.duckdns.org. You are welcome to set up your own server or use mine. I can't see your messages, but I can see if you connect successfully. **By default, the module is configured to use my server.**

## Development
I've written up some advice to help over at the [Developer's Notes](developmentnotes.md). I've also included some debugging tips.

### Dependencies
* A working installation of [Magic Mirror](https://github.com/MichMich/MagicMirror)
* `mqtt` to connect to the mosquitto message broker (loaded via npm)
* `svg.js` to draw the clock (loaded via npm)
* `Howler` to play the sound file (loaded via npm)

## ToDo
* Get the table mode to work properly
* Better graphics for the clock, including backgrounds and fancy hands
* Third style of display, using [Flapper](https://github.com/jayKayEss/Flapper)
* Add language translations for "Traveling" and "Lost"
* Selectable sounds for when the locations of people update
* ~~Get the fancy font to work~~
* Move installation instructions to the module Wiki

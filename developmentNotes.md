# Owntracks & MQTT Development Notes
The module uses a MQTT server (mosquitto) to handle message traffic between the mobile devices and the mirror module. 

It's *possible* to use the mirror module to configure the mobile devices. Specifically, we have to configure the mobile devices to publish to `owntracks/uniqueId/person` and subscribe to `owntracks/uniqueId/+/+/#`. This is most likely going to have to be accomplished with the `cmd` topic in the MQTT broker. Mobile clients will have to allow remote commands.

## Setting Up Your Own MQTT Server
If you don't trust my MQTT server, you are welcome to stand up your own. I use [Mosquitto](https://github.com/eclipse/mosquitto) as it is lightweight and relatively easy to set up on a Raspberry Pi 2 I had laying around. The module insists on a secured connection as I did not want my location information transmitted in unencrypted form. You will need to enable TLS on your MQTT server and provide the module with your own Certificate Authority cert. I found a decent tutorial over at [Steve's Internet Guide](http://www.steves-internet-guide.com/mosquitto-tls/).

If you're going to attempt this, I highly recommend getting an MQTT client for your development workstation. I used [MQTT-Spy](https://github.com/eclipse/paho.mqtt-spy) and it works well for pushing messages as well as troubleshooting the TLS settings.

## Compiling Mosquitto to fix SSL errors
For some reason, the latest version of Mosquitto from the debian repository doesn't like Lets Encrypt certificates. I had to compile Mosquitto from source to do... something. 
Still trying to remember exactly what. Anyhow, compiling Mosquitto requires some setup. **local compilation doesn't work***
```
sudo apt install git build-essential libssl-dev openssl cmake xstlproc docbook-xsl libsystemd-dev
cd ~
git clone https://github.com/eclipse/mosquitto.git
cd mosquitto
make WITH_WEBSOCKETS=no install 
```

Wait, no. Set up additional repository and install from repository. Must install Mosquitto 2.0.11, as newer versions use a busted websockets library. Otherwise, compile without websockets.
```
wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key
sudo apt-key add mosquitto-repo.gpg.key
cd /etc/apt/sources.list.d/
sudo wget http://repo.mosquitto.org/debian/mosquitto-buster.list
sudo apt update
sudo apt install mosquitto=2.0.11-0mosquitto1~buster1 -y
```

Newer version of Mosquitto requires changes to the mosquitto configuration file at `/etc/mosquitto/config.d/local.conf`.
```
listener 8883

```

## Future Features
* Enable region definitions in module config to push regions to devices
* Dynamically load new locations based upon waypoint definition messages

## Example Owntracks Data
### Example OwnTracks Mobile Connection messages
This is from the MQTT server log files. This is what each mobile app subscribes to when you connect.
Note: This will need to be changed to add uniqueId to the base subscription path. Otherwise, everyone will see everyone else on their mobile device. Entertaining, but not terribly secure.
```
2020-05-06T09:11:50: New connection from 192.168.1.1 on port 8883.
2020-05-06T09:11:50: Client demoharry already connected, closing old connection.
2020-05-06T09:11:50: New client connected from 192.168.1.1 as demoharry (p1, c1, k3600, u'demo').
2020-05-06T09:11:50: demoharry 2 owntracks/+/+
2020-05-06T09:11:50: demoharry 2 owntracks/+/+/info
2020-05-06T09:11:50: demoharry 2 owntracks/demo/Harry/cmd
2020-05-06T09:11:50: demoharry 2 owntracks/+/+/event
2020-05-06T09:11:50: demoharry 2 owntracks/+/+/waypoint
```
Note: `owntracks/demo/Harry/cmd` are values representing "Owntracks, UniqueId, Person, command channel".

### Example OwnTracks Transition data:
This is what is sent when a mobile device enters a defined region.
```
 {
    _type: "transition",
    wtst: 1556990699,       // Waypoint timestamp
    lat: 39.9768083,        // latitude
    lon: -83.1297876,       // longitude
    tst: 1558112761,        // timestamp of event
    acc: 10.0,              // accuracy of location fix
    tid: W1,                
    event: "enter",  <== "leave" is also possible
    desc: "Home",
    t: "c"
}
```


### Example Owntracks LWT message:
This is what is sent when a mobile device loses connection with the server.
```
{ 
    _type: 'lwt', 
    tst: 1557362134 
}
```


### Example OwnTracks Location data: 
This is what OwnTracks sends when you trigger an update or if it detects significant movement.
```
{
    _type:"location",
    acc:6,                // Accuracy
    alt:56,               // Altitude (meters)
    batt:96,              // % battery strength
    conn:"w",             // Internet connectivity (W = WiFi, o = offline, m = mobile data)
    inregions: [ "home" ] // If device is in one or more defined regions
    lat:38.6873502,
    lon:-77.4172194,
    t:"u",                // what triggered update (u=manual, c=region event, t=timer)
    tid:"m1",             // Tracker Id, two-letter entry in preferences->connection->identification
    tst:1553036588,       // timestamp
    vac:12,               // vertical accuracy (meters)
    vel:52                // velocity (km/h)
}
```
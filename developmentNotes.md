# Owntracks & MQTT Development Notes
The module uses a MQTT server (mosquitto) to handle message traffic between the mobile devices and the mirror module. 

It's *possible* to use the mirror module to configure the mobile devices. Specifically, we have to configure the mobile devices to drop the subscription to `owntracks/+/+` and replace it with a subscription to `owntracks/[uniqueId]/+/+`

## Example Owntracks Data
### Example OwnTracks Mobile Connection messages
This is from the MQTT server log files. This is what each mobile app subscribes to when you connect.
** Note: This may need to be changed to add uniqueId to the base subscription path **
```
2019-05-05T13:39:15: New client connected from 192.168.1.1 as CowboysDudeCowboy (p1, c1, k3600, u'cowboysdude').
2019-05-05T13:39:15: CowboysDudeCowboy 2 owntracks/+/+
2019-05-05T13:39:15: CowboysDudeCowboy 2 owntracks/+/+/info
2019-05-05T13:39:15: CowboysDudeCowboy 2 owntracks/CowboysDude/Cowboy/cmd
2019-05-05T13:39:15: CowboysDudeCowboy 2 owntracks/+/+/event
2019-05-05T13:39:15: CowboysDudeCowboy 2 owntracks/+/+/waypoint
```

### Example OwnTracks Transition data:
This is what is sent when a mobile device enters a defined region.
```
 {
    _type: "transition",
    wtst: [fill in later],
    lat: [fill in later],
    lon: [fill in later],
    tst: [fill in later]
    acc: [later],
    tid: B1,
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
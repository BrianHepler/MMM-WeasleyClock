# MMM-WeasleyClock
Magic Mirror module for displaying results from OpenTracks

* Configuration Options * 
```
{
			module: "MMM-WeasleyClock",
			position: "middle_center",
			config: {
				updateInterval: 1000 * 60 * 60,
				locations: {
					school: { title: "School", lat: 89.2254, lon: 44.2254, rad: 2.5},
					work: { title: "Work", lat: 87.3322, lon: 45.2211, rad: 2},
					test: { title: "Test", lat: 12.1111, lon: 33.3333, rad: 3}
				},
			}
		},
```
Magic Mirror module for displaying results from OwnTracks (www.owntracks.org)

Example OwnTracks data: `{"_type":"location","acc":6,"alt":56,"batt":96,"conn":"w","lat":38.6873502,"lon":-77.4172194,"t":"u","tid":"m1","tst":1553036588,"vac":12,"vel":52}`

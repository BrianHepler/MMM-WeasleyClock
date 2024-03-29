# Setting Up a Mosquitto Server
If you don't want to use my MQTT server, you can set up your own. Here is how I 
installed Mosquitto on a spare Raspberry Pi. You can do this on your Magic Mirror if
you like. Even with the Magic Mirror running, there's more than enough spare cycles for Mosquitto.

This document makes some assumptions:
* You are familiar enough with Raspbian to establish an SSH connection or terminal window
* You are attempting to run the Weasley Clock on your own Magic Mirror on your home network
* You have administrator-level access to your Magic Mirror and your home router

## Overview
I installed an MQTT server called Mosquitto on an original Raspberry Pi that I had laying about. The Mosquitto server is very lightweight and just about any hardware can run it. 

The overall steps aren't all that hard:
* Install and configure Mosquitto on the Pi
* Point the phone(s) and the Magic Mirror(s) at the Mosquitto server

Optional steps:
* Configure the Pi to be the target for a named web address
* Set up usernames & passwords for your Mosquitto server

## Install Mosquitto on your Pi
This will install the Mosquitto MQTT server and configure it to start up as a service whenever the Pi boots.
```
sudo apt update
sudo apt install mosquitto -y
```

Configuring the MQTT server is pretty easy. Switch to the root user and create the file `/etc/mosquitto/conf.d/local.conf` as such:
```
listener 1883

log_dest syslog
log_dest stdout
log_type error
log_type warning
log_type information
log_type debug
log_type subscribe
log_type unsubscribe
connection_messages true

# Owntracks specific configuration items
allow_anonymous true
allow_duplicate_messages false
allow_zero_length_clientid false
```

And then restart your mosquitto service to implement your configuration changes: `sudo service mosquitto restart`
## Configure the Module to Use Your Server
It's pretty simple. Modify the module configuration in the Magic Mirror `config.js` file to point to your new Mosquitto server (you have to 
disable some features because you're not using my server):
```
{
    module: "MMM-WeasleyClock",
    position: "middle_center",
    config: {
        uniqueId: "AllMine",
        host: "127.0.0.1",
        port: 8883,
        disableEncryption: true
    },
},
```

## Configure the Pi to be the endpoint for a DNS entry
If you have a domain pointed at your Magic Mirror, you can skip ahead. You don't need my help.

I use [DuckDNS](www.duckdns.org) to give me a dynamic DNS entry. It's free and it has some room to grow in case I decide to do other silliness like this in the future. Once you sign up, you can create whatever subdomain name is meaningful to you. I already took weasleymirror.duckdns.org so you'll have to pick another one. Once you have signed up and received a subdomain of duckdns.org, follow the steps to install the DDNS update script on your router or on the Pi itself. I installed the updator on the Pi.

There are other services that will give you power over your domain. This process should work with them too.

Once the DNS entry is pointed at your house, you will need to log in to your router and forward one of the ports to the Pi. There are several articles on how to do this, but I would head over to [PortForward.com](https://portforward.com) first. You need to **forward port 8883 to your Pi's IP address*** on your home network.

At this point, you can start to install OwnTracks on your phone(s) and point them at your Mosquitto installation's web address. It's not a bad idea to stop right here and configure the phone(s) and Magic Mirror to use port 8883. This way you can test the rest of the system.


### Optional: Use enhanced security
I'm not going to tell you how to secure your stuff. But OwnTracks will broadcast your location and the location of your family unencrypted across the Internet unless you lock it down a bit. These steps are optional but highly encouraged. There are some optional tasks available, included below in order of increased security.

* Implement usernames & passwords on your Mosquitto instance
* Configure the phone(s) to use the username & passwords & SSL connections
* Enable SSL connections with a signed certificate and a DNS entry (optional)

Simple, right?

## Implementing Usernames & Passwords
Controlling access to your Mosquitto instance will prevent people from downloading OwnTracks, signing into your server and then listening to every location message that comes through. Easiest way to prevent that is to require a username/password combination.

First, create a text file with the plain text username:passwords that you’ll be using. You need one for each name being displayed, plus one for the mirror itself. Best to put the new file in the `/etc/mosquito/` folder and call it `passwdfile` or whatever. For example:
```
WeasleyModule:MirrorPassword1
Harry:Patronus
Hermionie:Freedom4Elves
Ron:ButterBeer
Ginny:Harry4Evah
```

Next, you will want to encrypt the file passwords using the built-in utility:
```
/etc/mosquitto/conf.d#> mosquitto_passwd -U /etc/mosquitto/passwdfile
```
This will modify your file and encrypt the passwords so that they are not human-readable.

Once your file is ready, you’ll next configure Mosquitto to use the file for security. Open the configuration file at `/etc/mosquitto/conf.d/local.conf` and add the following line:
```
password_file /etc/mosquitto/passwdfile
```
You can restart Mosquitto to pick up the configuration change with `sudo service mosquitto restart`

You will need to add the module's username and password to the configuration:
```
{
    module: "MMM-WeasleyClock",
    position: "middle_center",
    config: {
        uniqueId: "Weasleys",
        mirrorUser: "WeasleyModule",
        mirrorPass: "MirrorPassword1",
    },
},
```
All right. That should keep the riffraff out.

### Modify Your OwnTracks to Use the Username & Password
If you recall during the basic installation, I said that the password didn’t matter since it wasn’t being used. Well, now it is. For each OwnTracks installation that you will be using, go to Settings->Connection->Identity. Make sure that the username & password matches the entry you used for your unique ID. So, for each phone make sure the UserID is “Weasleys” or whatever, and the password is the “MobilePassword1” or whatever. Do this for each phone.

### Configure the Mirror to Use the Username & Password

[ complete this after adding password field to configuration ]

## Optional: Create and sign certificates for your DNS entry
We're going to use Let's Encrypt and their automated application to create, download and maintain signed certificates. I pulled these steps from [Pi My Life Up](https://pimylifeup.com/raspberry-pi-ssl-lets-encrypt/) and they worked pretty well.
1. Install CertBot on your MQTT server: `sudo apt-get install certbot`
2. Using your router, forward ports 80 and 443 to your MQTT server.
3. Run CertBot to generate & sign your certificates: `sudo certbot certonly --standalone -d [your subdomain here duckdns.org]`
4. When prompted, enter your email address.


### Lock down the Mosquitto server to use certificates
Add to the Mosquitto configuration file `/etc/mosquitto/conf.d/local.conf`: 
```
# Security TLS information
cafile /etc/letsencrypt/live/[your subdomain here].duckdns.org/chain
keyfile /etc/letsencrypt/live/[your subdomain here].duckdns.org/privkey.pem
certfile /etc/letsencrypt/live/[your subdomain here].duckdns.org/cert.pem
```
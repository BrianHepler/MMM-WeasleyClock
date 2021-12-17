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
* Configure the Pi to be the target for a named web address
* Install and configure the latest version of Mosquitto on the Pi
* Point the phone(s) and the Magic Mirror(s) at the Mosquitto server

## Configure the Pi to be the endpoint for a DNS entry
If you have a domain pointed at your Magic Mirror, you can skip ahead. You don't need my help.

I use [Link](www.duckdns.org) to give me a dynamic DNS entry. It's free and it has some room to grow in case I decide to do other silliness like this in the future. Once you sign up, you can create whatever subdomain name is meaningful to you. I already took weasleymirror.duckdns.org so you'll have to pick another one. Once you have signed up and received a subdomain of duckdns.org, follow the steps to install the DDNS update script on your router or on the Pi itself. I installed the updator on the Pi.

There are other services that will give you power over your domain. This process should work with them too.

Once the DNS entry is pointed at your house, you will need to log in to your router and forward one of the ports to the Pi. There are several articles on how to do this, but I would head over to [Link](https://portforward.com) first. You need to **forward port 8883 to your Pi's IP address*** on your home network.

## Install the Latest Version of Mosquitto on your Pi
Raspbian has an older version of Mosquitto included in the repository. We're going to add a repository with the latest version. Details taken from [Link](https://mosquitto.org/blog/2013/01/mosquitto-debian-repository/)
```
wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key
sudo apt-key add mosquitto-repo.gpg.key
cd /etc/apt/sources.list.d/
sudo wget http://repo.mosquitto.org/debian/mosquitto-buster.list
sudo apt update
sudo apt install mosquitto
```

This will install the Mosquitto MQTT server and configure it to start up as a service whenever the Pi boots.

Configuring the MQTT server is pretty easy. Edit the file `/etc/mosquitto/conf.d/local.conf` and make a couple changes:
```
listener 8883
persistence_location /home/pi/
persistence_file mosquitto.db
log_timestamp true
log_timestamp_format %Y-%m-%dT%H:%M:%S
log_dest syslog
log_dest stdout
log_dest file /home/pi/mosquitto.log
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


At this point, you can start to install OwnTracks on your phone(s) and point them at your Mosquitto installation's web address. It's not a bad idea to stop right here and configure the phone(s) and Magic Mirror. This way you can test the rest of the system.


### Optional: Use enhanced security
I'm not going to tell you how to secure your stuff. But OwnTracks will broadcast your location and the location of your family unencrypted across the Internet unless you lock it down a bit. These steps are optional but highly encouraged.

* Create and sign certificates for your DNS entry (optional)
* Lock down the Mosquitto server to use certificates (optional)
* Configure the Magic Mirror(s) to use the certificate (optional)
* Configure the phone(s) to use the certificate 

Simple, right?


## Create and sign certificates for your DNS entry
We're going to use Let's Encrypt and their automated application to create, download and maintain signed certificates. I pulled these steps from [Pi My Life Up](https://pimylifeup.com/raspberry-pi-ssl-lets-encrypt/) and they worked pretty well.
1. Install CertBot on your MQTT server: `sudo apt-get install certbot`
2. Using your router, forward ports 80 and 443 to your MQTT server.
3. Run CertBot to generate & sign your certificates: `certbot certonly --standalone -d [your subdomain here duckdns.org'
4. When prompted, enter your email address.


## Lock down the Mosquitto server to use certificates
Add to the Mosquitto configuration file `local.conf`: 
```
# Security TLS information
cafile /etc/letsencrypt/live/[your subdomain here].duckdns.org/chain
keyfile /etc/letsencrypt/live/[your subdomain here].duckdns.org/privkey.pem
certfile /etc/letsencrypt/live/[your subdomain here].duckdns.org/cert.pem
```

## Configure the Magic Mirror(s) to use the certificates

## Configure the phone(s) to use the certificates
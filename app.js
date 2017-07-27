var express = require('express');
var app = express();
var server = app.listen(8080);
app.use(express.static('public'));
var socket = require('socket.io');
var io = socket(server);
io.sockets.on('connection', newConnection);

function player(id, x, y) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.angle = 0;
	this.speed = 0;
	this.W = false;
	this.S = false;
	this.type = 0;
	this.Weapon = [1, 0, 0, 0];
	this.hull = 100;
	this.fuel = 100;
	this.shield = 1;
	this.enemy = 0;
}

function beacon(x, y, t) {
	this.x = x;
	this.y = y;
	this.type = t;
}

var beaconAmount = 10;
var mapSize = 10000;
var a = 0.05;
var maxv = 20;
var serverTickrate = 1000 / 64;

var setup = false;
var lastCl;
var players = [];
var beacons = [];

setInterval(mainLoop, serverTickrate);

function newConnection(socket) {
	var ok = false;
	var x = 0;
	var y = 0;
	while (!ok) {
		ok = true;
		x = Math.floor(Math.random() * (mapSize + 1));
		y = Math.floor(Math.random() * (mapSize + 1));
		for (i = 0; i < beacons.length; i++) {
			if (500 > Math.sqrt(Math.pow(x - beacons[i].x, 2) + Math.pow(y - beacons[i].y, 2))) {
				ok = false;
			}
		}
		for (i = 0; i < players.length; i++) {
			if (500 > Math.sqrt(Math.pow(x - players[i].x, 2) + Math.pow(y - players[i].y, 2))) {
				ok = false;
			}
		}
	}
	var Player = new player(socket.id, x, y);
	players.push(Player);
	/////////////////////////////////////////////
	var data = {
		ID: socket.id,
		PL: players,
		BC: beacons
	}
	socket.emit('setupData', data);
	/////////////////////////////////////////////
	socket.on('disconnect', removePlayer);
	function removePlayer(){
		for (i = 0; i < players.length; i++) {
			if (players[i].id == socket.id) {
				players.splice(i, 1);
			}
		}
	}
	/////////////////////////////////////////////
	socket.on('playerUpdate', gotData);
	function gotData(data) {
		for (i = 0; i < players.length; i++) {
			if (players[i].id == socket.id) {
				players[i].W = data.W;
				players[i].S = data.S;
				players[i].angle = data.a;
				for (j = 0; j < players.length; j++) {
					if (data.W) {
						players[i].speed += a;
						if (players[i].speed > maxv) {
							players[i].speed = maxv;
						}
					}
					else if (data.S) {
						players[i].speed -= a;
						if (players[i].speed < -maxv) {
							players[i].speed = -maxv;
						}
					}
					else {
						if (players[i].speed > 0) {
							players[i].speed -= a;
						}
						if (players[i].speed < 0) {
							players[i].speed += a;
						}
					}
				}
			}
		}
	}
}

function mainLoop() {
	if (setup == false) {
		generate();
		setup = true;
	}
	if (lastCl != players.length) {
		console.log(players.length);
		lastCl = players.length;
	}
	for (i = 0; i < players.length; i++) {
		var x1 = players[i].x + (Math.cos(players[i].angle) * players[i].speed);
		var y1 = players[i].y - (Math.sin(players[i].angle) * players[i].speed);
		for (j = 0; j < players.length; j++) {
			if (i != j) {
				var x2 = players[j].x + (Math.cos(players[j].angle) * players[j].speed);
				var y2 = players[j].y - (Math.sin(players[j].angle) * players[j].speed);
				if (500 < Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))) {
					players[i].x += (Math.cos(players[i].angle) * players[i].speed);
					players[i].y -= (Math.sin(players[i].angle) * players[i].speed);
				}
				else {
					players[i].speed = 0;
				}
			}
			if (players.length == 1) {
				players[i].x += (Math.cos(players[i].angle) * players[i].speed);
				players[i].y -= (Math.sin(players[i].angle) * players[i].speed);
			}
		}
	}
	var data = {
		PL: players,
		BC: beacons
	}
	io.sockets.emit('update', data);
}

function generate() {
	for (i = 0; i < beaconAmount; i++) {
		var x = 0;
		var y = 0;
		var ok = false;
		while (!ok) {
			ok = true;
			var x = Math.floor(Math.random() * (mapSize + 1));
			var y = Math.floor(Math.random() * (mapSize + 1));
			for (j = 0; j < beacons.length; j++) {
				if (500 > Math.sqrt(Math.pow(x - beacons[j].x, 2) + Math.pow(y - beacons[j].y, 2))) {
					ok = false;
				}
			}
		}
		var Beacon = new beacon(x, y, Math.floor(Math.random() * 3));
		beacons.push(Beacon);
	}
}
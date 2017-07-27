var socket;

var OX = 0;
var OY = 0;
var players = [];
var beacons = [];
var ID = ' ';

function setup() {
  canvasSetup();
	//socket = io.connect('http://78.62.26.153:12345');
	socket = io.connect('http://ftl.cleverapps.io');
	socket.on('setupData', saveData);
	socket.on('update', serverUpdate);
	rectMode(CENTER);
	//noStroke();
}

function saveData(data) {
	ID = data.ID;
	players = data.PL;
}

window.onresize = function(event) {
	canvasSetup();
}

function canvasSetup() {
	createCanvas(innerWidth, innerHeight);
	//grass = loadImage("assets/grass.jpg");
}

function serverUpdate(data) {
	players = data.PL;
	beacons = data.BC;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == ID) {
			OX = players[i].x;
			OY = players[i].y;
		}
	}
}

function draw() {
	var data = {
		W: false,
		S: false,
		A: false,
		D: false,
		SPACE: false,
		a: 0
	}
	data.d = dist(width / 2, height / 2, mouseX, mouseY);
	if (mouseX > width / 2 && mouseY < height / 2) {
		data.a = asin(((height/ 2) - mouseY) / data.d);
	}
	if (mouseX < width / 2 && mouseY < height / 2) {
		data.a = acos(((height/ 2) - mouseY) / data.d) + HALF_PI;
	}
	if (mouseX < width / 2 && mouseY > height / 2) {
		data.a = acos(((width/ 2) - mouseX) / data.d) + PI;
	}
	if (mouseX > width / 2 && mouseY > height / 2) {
		data.a = acos(((width/ 2) - mouseX) / data.d) + PI;
	}
	//console.log(data.a);
//	if (keyIsDown(SHIFT)) {
//		data.SHIFT = true;
//	}
	if (keyIsDown(32)) {
		data.SPACE = true;
	}
	if (keyIsDown(87)) {
		data.W = true;
	}
	if (keyIsDown(83)) {
		data.S = true;
	}
	if (keyIsDown(65)) {
		data.A = true;
	}
	if (keyIsDown(68)) {
		data.D = true;
	}
	socket.emit('playerUpdate', data);
	clear();
	background(0);
	//translate(OX + (width / 2), OY + (height / 2));
	for (i = 0; i < players.length; i++) {
		push();
		translate(players[i].x - OX + (width / 2), players[i].y - OY + (height / 2));
		rotate(-players[i].angle);
		if (players[i].type == 0) {
			fill(150);
			stroke(0);
			ellipse(0, 0, 200, 50);
			translate(100, 0);
			ellipse(0, 0, 200, 200);
			ellipse(0, 0, 100, 100);
			ellipse(0, 0, 50, 40);
			fill(204, 182, 108);
			ellipse(0, 0, 20, 20);
			fill(200);
			quad(-150, 10, -125, 15, -175, 50, -200, 50);
			quad(-150, -10, -125, -15, -175, -50, -200, -50);
			fill(122, 228, 249, 200);
			if (players[i].W) {
				ellipse(-300, 50, 30, 15);
				ellipse(-300, -50, 30, 15);
			}
			else if (players[i].S) {
				ellipse(-100, 50, 30, 15);
				ellipse(-100, -50, 30, 15);
			}
			fill(200);
			ellipse(-200, 50, 200, 20);
			ellipse(-200, -50, 200, 20);
			translate(-100, 0);
		}
		//for (j = 0; j < players[i].shield; j++) {
		//	fill(22, 228, 249, 50);
		//	ellipse(0, 0, 500, 250);
		//}
		noFill();
		stroke(255, 0, 0);
		ellipse(0, 0, 500, 500);
		pop();
	}
	for (i = 0; i < beacons.length; i++) {
		push();
		translate(beacons[i].x - OX + (width / 2), beacons[i].y - OY + (height / 2));
		noFill();
		stroke(255, 0, 0);
		ellipse(0, 0, 500, 500);
		pop();
	}
}
/*jshint esversion: 6 */

var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var w = canvas.width = 512;
var h = canvas.height = 512;
document.body.appendChild(canvas);

var n = 1024;
var ice = [n];

for (let i = 0; i < n; i += 1) {
	ice[i] = [Math.floor(Math.random() * w), Math.floor(Math.random() * h), 0];
}


function update(dt) {
	for (let i = 0; i < n - 1; i += 1) {
		for (let j = i + 1; j < n; j += 1) {
			if (ice[i][0] >= ice[j][0] && ice[i][0] <= (ice[j][0] + 4) && ice[i][1] >= ice[j][1] && ice[i][1] <= (ice[j][1] + 4)) {
				ice[i][2] = ice[j][2] = 1;
			}
		}
	}

	for (let i = 0; i < n; i += 1) {
		if (ice[i][2] == 0) {
			ice[i][0] += Math.floor(Math.random() * 3 - 1);
			ice[i][1] += Math.floor(Math.random() * 3 - 1);
		}
	}
}


context.fillStyle = '000000';
function render () {
	canvas.width=w;
	for (let i = 0; i < n; i += 1) {
		context.fillRect(ice[i][0], ice[i][1], 4, 4);
	}
}


function main () { // runs game
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	requestAnimationFrame(main);
}
var then = Date.now();

main();
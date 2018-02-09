/*jshint esversion: 6 */

// set up the canvas
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var w = canvas.width = 768;
var h = canvas.height = 768;
document.body.appendChild(canvas);

var n = 4096; // number of dots
var ice = []; // array of dots
var dim = 2; // height/width of dot (square)

ice[0] = [w / 2, h / 2, 1]; // centre the first dot
for (let i = 1; i < n; i += 1) {
	ice[i] = [Math.floor(Math.random() * w * 1 / 2) + w / 4, Math.floor(Math.random() * h * 1 / 2) + h / 4, 0]; // randomly decide the rest
	// ice[i] = [Math.floor(Math.random() * w), Math.floor(Math.random() * h), 0]; // randomly decide the rest
}


function update() {
	for (let i = 0; i < n - 1; i += 1) {
		// if (ice[i][2] == 1) { // doesn't work for some reason, need to check if either is stuck rather than just ith
		for (let j = i + 1; j < n; j += 1) {
			if (ice[i][2] == 1 || ice[j][2] == 1) { // if either dot is stuck
				if (ice[i][0] <= ice[j][0] + dim && ice[i][0] + dim >= ice[j][0] && ice[i][1] <= ice[j][1] + dim && ice[i][1] + dim >= ice[j][1]) { // and if they collide
					ice[i][2] = ice[j][2] = 1; // they are both stuck
				}
			}
		}
	}

	for (let i = 1; i < n; i += 1) {
		if (ice[i][2] == 0) { // if a dot is not stuck
			ice[i][0] += Math.floor(Math.random() * 3 - 1); // move it randomly
			ice[i][1] += Math.floor(Math.random() * 3 - 1);
		}
	}
}


function render () {
	context.clearRect(0, 0, w, h); // reset the canvas each time
	for (let i = 0; i < n; i += 1) {
		if (ice[i][2] == 1) {
			context.fillStyle = 'red';
		} else {
			context.fillStyle = 'black';
		}
		context.fillRect(ice[i][0], ice[i][1], dim, dim);
	}
}


function main () { // runs game
	update();
	render();

	requestAnimationFrame(main);
}

main();
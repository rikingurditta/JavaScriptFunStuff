/*jshint esversion: 6 */

// set up the canvas
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var w = canvas.width = 768;
var h = canvas.height = 768;
document.body.appendChild(canvas);

class Ice {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = dim;
		this.height = dim;
	}
}

class BVH {
	constructor(x, y, width, height) {

	}
}

var allIceSet = new Set([]); // array of dots

var n = 4096 * 2; // number of dots
var dim = 2; // height/width of dot (square)

var movingIce = new Array(n-1);
var movingNum = n-1;

var stuckIce = new Array(n);
stuckIce[0] = new Ice(w / 2, h / 2, dim, dim);
var stuckNum = 1;

for (let i = 0; i < n - 1; i += 1) {
	// randomly decide the rest
	movingIce[i] = new Ice(Math.floor(Math.random() * w * 1 / 2) + w / 4,
		Math.floor(Math.random() * h * 1 / 2) + h / 4, dim, dim);
}


function update() {
	for (let i = 0; i < stuckNum; i++) {
		stuck = stuckIce[i];
		let j = 0;
		while (j < movingNum) {
			nonStuck = movingIce[j];
			if (stuck.x <= nonStuck.x + dim && stuck.x + dim >= nonStuck.x && stuck.y <= nonStuck.y + dim && stuck.y + dim >= nonStuck.y) { // and if they collide
				stuckIce[stuckNum] = nonStuck;
				stuckNum++;
				movingIce[j] = movingIce[movingNum - 1];
				movingNum--;
			} else {
				j++;
			}
		}
	}
	for (let i = 0; i < movingNum; i++) {
		movingIce[i].x += Math.floor(Math.random() * 3 - 1); // move it randomly
		movingIce[i].y += Math.floor(Math.random() * 3 - 1);
	}

	// make stuck group move
	// let randX = Math.floor(Math.random() * 3 - 1);
	// let randY = Math.floor(Math.random() * 3 - 1);
	// for (let i = 0; i < stuckNum; i++) {
	// 	stuckIce[i].x += randX;
	// 	stuckIce[i].y += randY;
	// }
}


function render () {
	context.clearRect(0, 0, w, h); // reset the canvas each time
	context.fillStyle = 'black';
	for (let i = 0; i < movingNum; i++) {
		context.fillRect(movingIce[i].x, movingIce[i].y, dim, dim);
	};
	context.fillStyle = 'red';
	for (let i = 0; i < stuckNum; i++) {
		context.fillRect(stuckIce[i].x, stuckIce[i].y, dim, dim);
	};
}


function main () { // runs game
	update();
	render();

	requestAnimationFrame(main);
}

main();
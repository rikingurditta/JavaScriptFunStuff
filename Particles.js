/*jshint esversion: 6 */

// set up the canvas
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var w = canvas.width = 768;
var h = canvas.height = 768;
document.body.appendChild(canvas);

class Ice {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

var allIceSet = new Set([]); // array of dots

var n = 4096; // number of dots
var dim = 2; // height/width of dot (square)

var firstStuck = new Ice(w / 2, h / 2);
firstStuck.iceSet = allIceSet;
var stuck = [firstStuck];
var toRemove = new Set([]);

for (let i = 0; i < n; i += 1) {
	// randomly decide the rest
	allIceSet.add(new Ice(Math.floor(Math.random() * w * 1 / 2) + w / 4,
		Math.floor(Math.random() * h * 1 / 2) + h / 4));
}


function update() {
	stuck.forEach(function(stuckIce) {
		stuckIce.iceSet.forEach(function(nonStuckIce) {
			if (stuckIce.x <= nonStuckIce.x + dim && stuckIce.x + dim >= nonStuckIce.x && stuckIce.y <= nonStuckIce.y + dim && stuckIce.y + dim >= nonStuckIce.y) { // and if they collide
				stuck.push(nonStuckIce);
				toRemove.add(nonStuckIce);
			}
		})
	})
	toRemove.forEach(function(iceToRemove) {
		allIceSet.delete(iceToRemove);
	});

	allIceSet.forEach(function(nonStuckIce) {
		nonStuckIce.x += Math.floor(Math.random() * 3 - 1); // move it randomly
		nonStuckIce.y += Math.floor(Math.random() * 3 - 1);
	});
}


function render () {
	context.clearRect(0, 0, w, h); // reset the canvas each time
	context.fillStyle = 'black';
	allIceSet.forEach(function(nonStuckIce) {
		context.fillRect(nonStuckIce.x, nonStuckIce.y, dim, dim);
	});
	context.fillStyle = 'red';
	stuck.forEach(function(stuckIce) {
		context.fillRect(stuckIce.x, stuckIce.y, dim, dim);
	});
}


function main () { // runs game
	update();
	render();

	requestAnimationFrame(main);
}

main();
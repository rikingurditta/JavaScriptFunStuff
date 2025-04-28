/*jshint esversion: 6 */

// set up the canvas
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var w = canvas.width = 1024;
var h = canvas.height = 1024;
document.body.appendChild(canvas);

var n = 4096; // number of dots
var dim = 3; // height/width of dot (square)

var qt_size = 1;

class Ice {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.stuck = false;
		this.idk = false;
	}
}

class Quadtree {
	constructor(x, y, width, height, max_items) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.subs = []
		this.item_x = [];
		this.item_y = [];
		this.items = [];
		this.num_items = 0;
		this.max_items = max_items;
		this.is_leaf = true;
		this.idk = false;
	}

	in_range(x, y) {
		if (x >= this.x && y >= this.y && x < this.x + this.width && y < this.y + this.height) {
			return true;
		}
		return false;
	}

	add(x, y, item) {
		let sub_w = this.width / 2;
		let sub_h = this.height / 2;
		if (!this.in_range(x, y)) {
			let str = "out of range: item (" + x + ", " + y + ") "
				    + "not in range of quadtree [" + this.x + ", " + (this.x + this.width)
				    + "] x [" + this.y + ", " + (this.y + this.height) + "]";
			throw new Error(str);
		} else if (this.is_leaf && this.num_items < this.max_items) {
			this.items.push(item);
			this.item_x.push(x);
			this.item_y.push(y);
			this.num_items++;
		} else if (this.is_leaf) {
			this.subs.push(new Quadtree(this.x,         this.y,         sub_w, sub_h, this.max_items));
			this.subs.push(new Quadtree(this.x + sub_w, this.y,         sub_w, sub_h, this.max_items));
			this.subs.push(new Quadtree(this.x,         this.y + sub_h, sub_w, sub_h, this.max_items));
			this.subs.push(new Quadtree(this.x + sub_w, this.y + sub_h, sub_w, sub_h, this.max_items));
			this.num_items = 0;
			this.is_leaf = false;
			for (let i = 0; i < this.num_items; i++) {
				this.add(this.item_x[i], this.item_y[i], this.items[i]);
			}
			this.add(x, y, item);
		} else {
			let sub_index = 0;
			if (x >= this.x + sub_w) {
				sub_index += 1;
			}
			if (y >= this.y + sub_h) {
				sub_index += 2;
			}
			this.subs[sub_index].add(x, y, item);
		}
	}

	print(depth = 0) {
		let str = ""
		for (let i = 0; i < depth; i++) {
			str += "\t";
		}
		if (this.is_leaf) {
			str += "quadtree [" + this.x + ", " + (this.x + this.width)
				   + "] x [" + this.y + ", " + (this.y + this.height) + "]";

			if (this.num_items > 0) {
				str += " with items:"
				for (let item of this.items) {
					str += " " + item;
				}
			}
		} else {
			str += "quadtree [" + this.x + ", " + (this.x + this.width)
				   + "] x [" + this.y + ", " + (this.y + this.height) + "] with subtrees:\n";
			str += this.subs[0].print(depth+1) + "\n";
			str += this.subs[1].print(depth+1) + "\n";
			str += this.subs[2].print(depth+1) + "\n";
			str += this.subs[3].print(depth+1)
		}
		return str;
	}

	get_items() {
		if (this.is_leaf) {
			return this.items;
		} else {
			let out = [];
			for (let sub of this.subs) {
				out.push(...sub.get_items());
			};
			return out;
		}
	}

	get_neighbourhood(x, y) {
		if (this.is_leaf) {
			this.idk = true;
			for (let item of this.items) {
				movingIce[item].idk = true;
			}
			return this.items;
		}
		let out = [];
		let bools = [true, true, true, true];
		if (x < this.x + 0.25 * this.width) {
			bools[1] = false;
			bools[3] = false;
		} else if (x >= this.x + 0.75 * this.width) {
			bools[0] = false;
			bools[2] = false;
		}
		if (y < this.y + 0.25 * this.height) {
			bools[2] = false;
			bools[3] = false;
		} else if (y >= this.y + 0.75 * this.height) {
			bools[0] = false;
			bools[1] = false;
		}
		for (let i = 0; i < 4; i++) {
			if (bools[i]) {
				out.push(...this.subs[i].get_neighbourhood(x, y));
			}
		}
		return out;
	}

	draw() {
		if (this.idk) {
			context.strokeStyle = 'orange'
		} else {
			context.strokeStyle = 'lightgray'
		}
		context.lineWidth = 1;
		context.beginPath();
		context.rect(this.x, this.y, this.width, this.height);
		context.stroke();
		for (let sub of this.subs) {
			sub.draw();
		};
	}
}

let qt = new Quadtree(0, 0, w, h, qt_size);

var allIceSet = new Set(); // array of dots

var movingIce = new Array(n-1);
var movingNum = n-1;

var stuckIce = new Array(n);
stuckIce[0] = new Ice(w / 2, h / 2, dim, dim);
var stuckNum = 1;

for (let i = 0; i < n - 1; i += 1) {
	// randomly decide the rest
	let x = Math.floor(Math.random() * w * 1 / 2) + w / 4;
	let y = Math.floor(Math.random() * h * 1 / 2) + h / 4;
	movingIce[i] = new Ice(x, y, dim, dim);
}

function update_with_quadtree() {
	qt = new Quadtree(0, 0, w, h, qt_size);

	for (let i = 0; i < movingNum; i++) {
		m = movingIce[i];
		qt.add(m.x, m.y, i);
	}

	let stuck_indices = new Set();

	for (let i = 0; i < stuckNum; i++) {
		stuck = stuckIce[i];
		nbhd = qt.get_neighbourhood(stuck.x, stuck.y)
				.concat(qt.get_neighbourhood(stuck.x + dim, stuck.y))
				.concat(qt.get_neighbourhood(stuck.x, stuck.y + dim))
				.concat(qt.get_neighbourhood(stuck.x + dim, stuck.y + dim));
		for (let m_index of nbhd) {
			nonStuck = movingIce[m_index];
			let overlap = true;
			if (stuck.x > nonStuck.x + dim
				|| stuck.x + dim < nonStuck.x
				|| stuck.y > nonStuck.y + dim
				|| stuck.y + dim < nonStuck.y) {
				overlap = false;
			}
			if (overlap) {
				stuck_indices.add(m_index);
			}
		}
	}

	for (let index of stuck_indices) {
		stuckIce[stuckNum] = movingIce[index];
		stuckNum += 1;
		movingIce[index] = null;
	};

	let k = 0;
	while (k < movingNum) {
		if (movingIce[k] == null) {
			movingIce[k] = movingIce[movingNum - 1];
			movingNum--;
		}
		else {
			movingIce[k].x += Math.floor(Math.random() * 3 - 1); // move it randomly
			movingIce[k].y += Math.floor(Math.random() * 3 - 1);
			k++;
		}
	}
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

}


function render () {
	context.clearRect(0, 0, w, h); // reset the canvas each time

	context.strokeStyle = 'lightgray';
	context.beginPath();
	qt.draw();
	context.lineWidth = 1;
	context.stroke();

	// context.fillStyle = 'black';
	for (let i = 0; i < movingNum; i++) {
		if (movingIce[i].idk) {
			context.fillStyle = 'blue';
		} else {
			context.fillStyle = 'black';
		}
		context.fillRect(movingIce[i].x, movingIce[i].y, dim, dim);
	};
	context.fillStyle = 'red';
	for (let i = 0; i < stuckNum; i++) {
		context.fillRect(stuckIce[i].x, stuckIce[i].y, dim, dim);
	};
}


function main () { // runs game
	update_with_quadtree();
	render();
	requestAnimationFrame(main);
}

main();
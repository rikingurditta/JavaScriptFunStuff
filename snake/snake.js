const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.width = 256;
canvas.height = 256;
document.body.appendChild(canvas);

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_ESC = 27;

const width = canvas.width / 16;
const height  = canvas.height / 16;
const cellWidth = canvas.width / width;
const cellHeight = canvas.height / height;
const dt = 1000/10;
let minFood = 10;

// store last key pressed
let lastKey = null;
addEventListener('keydown', function (e) {
    lastKey = e.keyCode;
}, false);

class Vec2 {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }

    equals(other) {
        return this.x == other.x && this.y == other.y;
    }

    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }

    subtract(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }
}

let mainInterval;
let playing;

let snake = [new Vec2()];
// replace with ring buffer probably
let dirs = [new Vec2(1, 0)];

let food = [new Vec2(width / 2, height / 2)];

function update() {
    // by default, head keeps going in same direction
    let headDir = dirs[0];
    // if key was pressed and new direction compatible with current direction,
    // change head direction
    if (lastKey == KEY_LEFT && headDir.x == 0) {
        headDir = new Vec2(-1, 0);
    } else if (lastKey == KEY_UP && headDir.y == 0) {
        headDir = new Vec2(0, -1);
    } else if (lastKey == KEY_RIGHT && headDir.x == 0) {
        headDir = new Vec2(1, 0);
    } else if (lastKey == KEY_DOWN && headDir.y == 0) {
        headDir = new Vec2(0, 1);
    }
    // if escape key pressed, stop game
    if (lastKey == KEY_ESC) {
        clearInterval(mainInterval);
    }
    // reset last key
    lastKey = null;

    // update each segment's direction to previous segment's direction
    // starting from end
    for (let i = dirs.length - 1; i > 0; i--) {
        dirs[i] = dirs[i - 1];
    }
    dirs[0] = headDir;

    // position of last segment before moving
    oldLastPos = snake[snake.length - 1];
    // move all segments
    for (let i = 0; i < snake.length; i++) {
        let newPos = snake[i].add(dirs[i]);
        newPos.x = (newPos.x + width) % width;
        newPos.y = (newPos.y + height) % height;
        snake[i] = newPos;
    }

    let head = snake[0];
    let tail = snake[snake.length - 1]
    let fi = 0;
    while (fi < food.length) {
        if (head.equals(food[fi])) {  // if eaten food
            food.splice(fi, 1);  // get rid of food
            // add new segment where last segment was before moving
            snake.push(oldLastPos);
            // doesn't matter what we push here because its direction will be
            // calculated next iteration based on previous segment
            dirs.push([dirs[0]]);
        } else {
            fi++;
        }
    }

    // if we change `if` to `while` then food will all be calculated at once
    // when game starts, but i like the way it looks with `if`
    if (food.length < minFood) {  // if not enough food exists, create new food
        let newFood;
        // keep trying to pick position of new food until we find position that
        // does not overlap with another food or the snake itself
        let overlaps = true;
        while (overlaps) {
            newFood = new Vec2(Math.floor(Math.random() * width), Math.floor(Math.random() * height));
            overlaps = false;
            for (let s of snake)
                if (newFood.equals(s))
                    overlaps = true;
            for (let f of food)
                if (newFood.equals(f))
                    overlaps = true;
        }
        food.push(newFood);
    }

    // if the head hits anotehr segment of the snake then the game ends
    // start loop at 3 because impossble to hit first 3 segments
    for (let i = 3; i < snake.length; i++) {
        if (head.equals(snake[i])) {
            clearInterval(mainInterval);
        }
    }
}

function draw() {
    // reset canvas to black
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    // draw food
    for (let f of food) {
        context.fillStyle = 'red';
        context.fillRect(f.x * cellWidth, f.y * cellHeight, cellWidth, cellHeight);
    }
    // draw snake
    for (let s of snake) {
        context.fillStyle = 'green';
        context.fillRect(s.x * cellWidth, s.y * cellHeight, cellWidth, cellHeight);
    }
}

function mainLoop() {
    update();
    draw();
}

mainInterval = setInterval(mainLoop, dt);
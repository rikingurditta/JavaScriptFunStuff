const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
canvas.width = 512;
canvas.height = 512;

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_ESC = 27;

const GRID_WIDTH = 16;
const GRID_HEIGHT  = 16;
const CELL_WIDTH = canvas.width / GRID_WIDTH;
const CELL_HEIGH = canvas.height / GRID_HEIGHT;
const dt = 1000/10;

let MIN_FOOD = 10;

if (localStorage.getItem('high_score') == null) {
    localStorage.setItem('high_score', '0');
}
currHighScore = localStorage.getItem('high_score');

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

let food = [new Vec2(GRID_WIDTH / 2, GRID_HEIGHT / 2)];

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
        endGame();
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
        newPos.x = (newPos.x + GRID_WIDTH) % GRID_WIDTH;
        newPos.y = (newPos.y + GRID_HEIGHT) % GRID_HEIGHT;
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
    if (food.length < MIN_FOOD) {  // if not enough food exists, create new food
        let newFood;
        // keep trying to pick position of new food until we find position that
        // does not overlap with another food or the snake itself
        let overlaps = true;
        while (overlaps) {
            newFood = new Vec2(Math.floor(Math.random() * GRID_WIDTH),
                Math.floor(Math.random() * GRID_HEIGHT));
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
            endGame();
        }
    }

    if (snake.length > currHighScore) {
        currHighScore = snake.length;
    }
}

function draw() {
    // reset canvas to black
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    // draw food
    for (let f of food) {
        context.fillStyle = 'red';
        context.fillRect(f.x * CELL_WIDTH, f.y * CELL_HEIGH, CELL_WIDTH, CELL_HEIGH);
    }
    // draw snake
    for (let s of snake) {
        context.fillStyle = 'green';
        context.fillRect(s.x * CELL_WIDTH, s.y * CELL_HEIGH, CELL_WIDTH, CELL_HEIGH);
    }
    // draw eyes
    let sum = dirs[0].x + dirs[0].y;
    let diff = dirs[0].x - dirs[0].y;
    let eyeSize = CELL_HEIGH / 8;
    context.fillStyle = 'black';
    let headCentre = new Vec2(snake[0].x * CELL_WIDTH + CELL_WIDTH / 2,
        snake[0].y * CELL_HEIGH + CELL_HEIGH / 2);  // centre of head
    context.fillRect(headCentre.x + sum * CELL_WIDTH / 4 - eyeSize / 2,
        headCentre.y + sum * CELL_HEIGH / 4 - eyeSize / 2,
        eyeSize, eyeSize);
    context.fillRect(headCentre.x + diff * CELL_WIDTH / 4 - eyeSize / 2,
        headCentre.y - diff * CELL_HEIGH / 4 - eyeSize / 2,
        eyeSize, eyeSize);
    // display scores
    context.fillStyle = 'white';
    context.font = 'bold 12px Courier New';
    context.fillText('Score: ' + snake.length, 2, 12);
    context.fillText('High score: ' + currHighScore, 2, 24);
}

function mainLoop() {
    update();
    draw();
}

function endGame() {
    clearInterval(mainInterval);
    localStorage.setItem('high_score', '' + currHighScore)
}

mainInterval = setInterval(mainLoop, dt);

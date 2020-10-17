const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.width = 256;
canvas.height = 256;
document.body.appendChild(canvas);

const width = canvas.width / 16;
const height  = canvas.height / 16;
const cellWidth = canvas.width / width;
const cellHeight = canvas.height / height;
const dt = 1000/10;
let minFood = 10;

const keysDown = [];
addEventListener('keydown', function (e) {
    keysDown[e.keyCode] = true;
}, false);
addEventListener('keyup', function (e) {
    keysDown[e.keyCode] = false;
}, false);

class Vec2 {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }

    equals(other) {
        return this.x == other.x && this.y == other.y;
    }
}

let mainInterval;
let playing;

let snake = [new Vec2()];
// replace with ring buffer probably
let dirs = [new Vec2(1, 0)];

let food = [new Vec2(width / 2, height / 2)];

function update() {
    let headDir = dirs[0];
    if (keysDown[37] && headDir.x == 0) {
        headDir = new Vec2(-1, 0);
    } else if (keysDown[38] && headDir.y == 0) {
        headDir = new Vec2(0, -1);
    } else if (keysDown[39] && headDir.x == 0) {
        headDir = new Vec2(1, 0);
    } else if (keysDown[40] && headDir.y == 0) {
        headDir = new Vec2(0, 1);
    }
    if (keysDown[27]) {
        clearInterval(mainInterval);
    }
    for (let i = dirs.length - 1; i > 0; i--) {
        dirs[i] = dirs[i - 1];
    }
    dirs[0] = headDir;
    oldLastPos = snake[snake.length - 1];
    for (let i = 0; i < snake.length; i++) {
        let x = ((snake[i].x + dirs[i].x % width) + width) % width;
        let y = ((snake[i].y + dirs[i].y % height) + height) % height;
        snake[i] = new Vec2(x, y);
    }
    let head = snake[0];
    let tail = snake[snake.length - 1]
    let fi = 0;
    while (fi < food.length) {
        if (head.x == food[fi].x && head.y == food[fi].y) {
            food.splice(fi, 1);
            let l = snake.length - 1;
            let x = tail.x - dirs[l].x;
            let y = tail.y - dirs[l].y;
            // snake.push(new Vec2(x, y));
            snake.push(oldLastPos);
            dirs.push([dirs[0]]);
        } else {
            fi++;
        }
    }
    while (food.length < minFood) {
        let newFood;
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
    for (let i = 1; i < snake.length; i++) {
        if (head.x == snake[i].x && head.y == snake[i].y) {
            clearInterval(mainInterval);
        }
    }
}

function draw() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let f of food) {
        context.fillStyle = 'red';
        context.fillRect(f.x * cellWidth, f.y * cellHeight, cellWidth, cellHeight);
    }
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